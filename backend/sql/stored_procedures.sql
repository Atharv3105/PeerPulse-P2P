-- ============================================================================
-- PEERPULSE P2P LENDING — STORED PROCEDURES & ACID TRANSACTIONS
-- Designed for: MySQL 8.0+ / Microsoft SQL Server 2019+
-- Core Focus: Concurrency Control, Atomicity, Regulatory Cap Enforcement
-- ============================================================================

DELIMITER //

-- ----------------------------------------------------------------------------
-- PROCEDURE 1: sp_fund_tranche
-- Atomically allocates a ₹25K fractional tranche to a loan, enforcing RBI
-- single-borrower exposure cap (≤ ₹50,000) and debiting the lender's wallet.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE IF NOT EXISTS sp_fund_tranche(
    IN p_lender_id VARCHAR(64),
    IN p_application_id VARCHAR(64),
    IN p_tranche_amount DECIMAL(12,2),
    OUT p_status VARCHAR(20),
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_lender_pk INT;
    DECLARE v_loan_pk INT;
    DECLARE v_borrower_pk INT;
    DECLARE v_wallet_balance DECIMAL(15,2);
    DECLARE v_total_exposure DECIMAL(15,2);
    DECLARE v_current_borrower_exposure DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_target_amount DECIMAL(12,2);
    DECLARE v_funded_amount DECIMAL(12,2);
    DECLARE v_new_funded DECIMAL(12,2);
    DECLARE v_tranche_uuid VARCHAR(64);

    -- Exit on any SQL exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Transaction aborted: Database internal error during tranche allocation.';
    END;

    START TRANSACTION;

    -- 1. Lock and validate lender
    SELECT id, wallet_balance, total_exposure 
      INTO v_lender_pk, v_wallet_balance, v_total_exposure
      FROM lenders 
     WHERE lender_id = p_lender_id
       FOR UPDATE;

    IF v_lender_pk IS NULL THEN
        ROLLBACK;
        SET p_status = 'REJECTED';
        SET p_message = 'Lender not found.';
        LEAVE proc_label;
    END IF;

    IF v_wallet_balance < p_tranche_amount THEN
        ROLLBACK;
        SET p_status = 'INSUFFICIENT_FUNDS';
        SET p_message = 'Insufficient wallet balance for this tranche.';
        LEAVE proc_label;
    END IF;

    -- 2. Lock and validate loan
    SELECT id, borrower_id, target_amount, funded_amount
      INTO v_loan_pk, v_borrower_pk, v_target_amount, v_funded_amount
      FROM loans
     WHERE application_id = p_application_id AND status = 'LISTED'
       FOR UPDATE;

    IF v_loan_pk IS NULL THEN
        ROLLBACK;
        SET p_status = 'LOAN_NOT_OPEN';
        SET p_message = 'Loan is not currently open for funding.';
        LEAVE proc_label;
    END IF;

    -- 3. Enforce RBI Master Direction: Single-borrower exposure cannot exceed ₹50,000
    SELECT COALESCE(SUM(t.amount), 0.00)
      INTO v_current_borrower_exposure
      FROM tranches t
      JOIN loans l ON t.loan_id = l.id
     WHERE t.lender_id = v_lender_pk
       AND l.borrower_id = v_borrower_pk
       AND t.status = 'ACTIVE';

    IF (v_current_borrower_exposure + p_tranche_amount) > 50000.00 THEN
        ROLLBACK;
        SET p_status = 'CAP_EXCEEDED';
        SET p_message = CONCAT('RBI Limit Violation: Exposure on this borrower would exceed ₹50,000 (Current: ₹', v_current_borrower_exposure, ')');
        LEAVE proc_label;
    END IF;

    -- 4. Check if funding target exceeded
    IF (v_funded_amount + p_tranche_amount) > v_target_amount THEN
        ROLLBACK;
        SET p_status = 'OVERFUNDED';
        SET p_message = 'Tranche amount exceeds remaining required loan balance.';
        LEAVE proc_label;
    END IF;

    -- 5. Deduct wallet & update total platform exposure
    UPDATE lenders
       SET wallet_balance = wallet_balance - p_tranche_amount,
           total_exposure = total_exposure + p_tranche_amount
     WHERE id = v_lender_pk;

    -- 6. Insert fractional tranche ledger entry
    SET v_tranche_uuid = CONCAT('TR-', SUBSTRING(MD5(RAND()), 1, 8));
    INSERT INTO tranches (tranche_id, loan_id, lender_id, amount, funded_at, status)
    VALUES (v_tranche_uuid, v_loan_pk, v_lender_pk, p_tranche_amount, NOW(), 'ACTIVE');

    -- 7. Update loan funded amount & check for full syndication
    SET v_new_funded = v_funded_amount + p_tranche_amount;
    UPDATE loans
       SET funded_amount = v_new_funded,
           status = IF(v_new_funded >= target_amount, 'ACTIVE', 'LISTED')
     WHERE id = v_loan_pk;

    -- 8. Audit trail
    INSERT INTO audit_logs (action, target_id, previous_state, new_state, performed_by, reason)
    VALUES (
        'TRANCHE_FUNDED',
        p_application_id,
        JSON_OBJECT('funded_amount', v_funded_amount),
        JSON_OBJECT('funded_amount', v_new_funded, 'tranche_id', v_tranche_uuid, 'lender_id', p_lender_id),
        p_lender_id,
        'Fractional tranche investment funded via Escrow'
    );

    COMMIT;
    SET p_status = 'SUCCESS';
    SET p_message = CONCAT('Successfully funded ₹', p_tranche_amount, ' tranche. ID: ', v_tranche_uuid);
END //

-- ----------------------------------------------------------------------------
-- PROCEDURE 2: sp_apply_daily_penal_interest
-- Daily batch procedure calculating 18% p.a. penal interest on overdue principal
-- for delinquent loans (DPD > 0).
-- ----------------------------------------------------------------------------
CREATE PROCEDURE IF NOT EXISTS sp_apply_daily_penal_interest()
BEGIN
    DECLARE v_daily_rate DECIMAL(10,8);
    SET v_daily_rate = 0.18000000 / 365.00000000;

    START TRANSACTION;

    UPDATE repayments
       SET penal_interest_accrued = penal_interest_accrued + (outstanding_principal * v_daily_rate),
           dpd = dpd + 1,
           last_penal_calculated_at = NOW(),
           status = CASE 
               WHEN dpd >= 90 THEN 'NPA'
               WHEN dpd >= 30 THEN 'AT_RISK'
               WHEN dpd >= 1  THEN 'DELAYED'
               ELSE status
           END
     WHERE status IN ('DELAYED', 'AT_RISK') AND dpd > 0;

    COMMIT;
END //

-- ----------------------------------------------------------------------------
-- PROCEDURE 3: sp_distribute_ots_recovery
-- Stage 5: Distributes recovered settlement funds pro-rata to participating
-- fractional lenders after deducting the 3% platform resolution fee.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE IF NOT EXISTS sp_distribute_ots_recovery(
    IN p_repayment_id INT,
    IN p_recovered_amount DECIMAL(12,2),
    OUT p_net_distributed DECIMAL(12,2)
)
BEGIN
    DECLARE v_fee DECIMAL(12,2);
    DECLARE v_dist_pk INT;
    DECLARE v_loan_pk INT;
    DECLARE v_target_amount DECIMAL(12,2);

    START TRANSACTION;

    SELECT loan_id INTO v_loan_pk FROM repayments WHERE id = p_repayment_id;
    SELECT target_amount INTO v_target_amount FROM loans WHERE id = v_loan_pk;

    SET v_fee = ROUND(p_recovered_amount * 0.03, 2);
    SET p_net_distributed = p_recovered_amount - v_fee;

    -- Insert recovery distribution header
    INSERT INTO recovery_distributions (repayment_id, total_recovered, recovery_fee, net_distributed, recovered_at)
    VALUES (p_repayment_id, p_recovered_amount, v_fee, p_net_distributed, NOW());
    SET v_dist_pk = LAST_INSERT_ID();

    -- Pro-rata distribution split into lender wallets
    INSERT INTO lender_distribution_splits (distribution_id, lender_id, original_exposure, gross_share, net_received, outstanding_loss)
    SELECT 
        v_dist_pk,
        t.lender_id,
        t.amount,
        ROUND((t.amount / v_target_amount) * p_recovered_amount, 2),
        ROUND((t.amount / v_target_amount) * p_net_distributed, 2),
        GREATEST(0, t.amount - ROUND((t.amount / v_target_amount) * p_net_distributed, 2))
    FROM tranches t
    WHERE t.loan_id = v_loan_pk AND t.status = 'ACTIVE';

    -- Credit individual lender wallets
    UPDATE lenders l
      JOIN lender_distribution_splits s ON l.id = s.lender_id
       SET l.wallet_balance = l.wallet_balance + s.net_received,
           l.total_exposure = GREATEST(0, l.total_exposure - s.original_exposure)
     WHERE s.distribution_id = v_dist_pk;

    -- Close out repayment & loan
    UPDATE repayments SET status = 'CLOSED' WHERE id = p_repayment_id;
    UPDATE loans SET status = 'CLOSED' WHERE id = v_loan_pk;

    COMMIT;
END //

DELIMITER ;
