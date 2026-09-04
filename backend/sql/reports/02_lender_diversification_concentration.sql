-- ============================================================================
-- REPORT 02: LENDER PORTFOLIO CONCENTRATION & RBI STATUTORY COMPLIANCE AUDIT
-- Module: Statutory Exposure & Concentration Risk Surveillance
-- Purpose: Identifies lender exposure concentration, RBI ₹50K per-borrower violations,
--          and ranks lenders by fractional diversification depth.
-- Features Used: Window Functions (ROW_NUMBER, SUM() OVER, DENSE_RANK), CTEs, PARTITION BY
-- ============================================================================

WITH lender_borrower_allocations AS (
    SELECT 
        lnd.id AS lender_pk,
        lnd.lender_id,
        lnd.name AS lender_name,
        lnd.risk_appetite,
        lnd.wallet_balance,
        lnd.total_exposure AS recorded_exposure,
        b.id AS borrower_pk,
        b.business_name,
        b.borrower_id,
        COUNT(t.id) AS tranches_held,
        SUM(t.amount) AS total_invested_in_borrower,
        
        -- Window function: Total portfolio across all borrowers for this lender
        SUM(SUM(t.amount)) OVER(PARTITION BY lnd.id) AS calculated_active_exposure,
        
        -- Window function: Rank borrower by exposure size within this lender's portfolio
        DENSE_RANK() OVER(PARTITION BY lnd.id ORDER BY SUM(t.amount) DESC) AS borrower_exposure_rank
        
    FROM lenders lnd
    JOIN tranches t ON lnd.id = t.lender_id
    JOIN loans ln ON t.loan_id = ln.id
    JOIN borrowers b ON ln.borrower_id = b.id
    WHERE t.status = 'ACTIVE'
    GROUP BY lnd.id, lnd.lender_id, lnd.name, lnd.risk_appetite, lnd.wallet_balance, lnd.total_exposure, b.id, b.business_name, b.borrower_id
)
SELECT 
    lender_id,
    lender_name,
    risk_appetite,
    wallet_balance,
    calculated_active_exposure,
    business_name AS top_borrower_business,
    total_invested_in_borrower AS top_borrower_exposure,
    
    -- Concentration % of top borrower in lender's total portfolio
    ROUND((total_invested_in_borrower / calculated_active_exposure) * 100, 2) AS top_borrower_concentration_pct,
    
    -- RBI Compliance Flag 1: Single-Borrower Cap (≤ ₹50,000)
    CASE 
        WHEN total_invested_in_borrower > 50000.00 THEN 'CRITICAL_BREACH_OVER_50K'
        WHEN total_invested_in_borrower = 50000.00 THEN 'AT_RBI_LIMIT'
        ELSE 'COMPLIANT'
    END AS rbi_single_borrower_status,
    
    -- RBI Compliance Flag 2: Total Platform Ceiling (≤ ₹10,00,000)
    CASE 
        WHEN calculated_active_exposure > 1000000.00 THEN 'PLATFORM_CAP_EXCEEDED'
        WHEN calculated_active_exposure >= 800000.00 THEN 'NEAR_CAP_WARNING'
        ELSE 'WITHIN_CAP'
    END AS rbi_total_cap_status

FROM lender_borrower_allocations
WHERE borrower_exposure_rank = 1
ORDER BY calculated_active_exposure DESC;
