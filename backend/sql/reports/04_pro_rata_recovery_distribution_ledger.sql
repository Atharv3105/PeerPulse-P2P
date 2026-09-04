-- ============================================================================
-- REPORT 04: PRO-RATA RECOVERY DISTRIBUTION & NODAL ESCROW WATERFALL
-- Target Reporting Tool: Crystal Reports / SSRS
-- Purpose: Complete financial audit of delinquent loan recovery proceeds,
--          platform resolution fee (3%), and investor pro-rata credit ledgers.
-- Features Used: Multi-Table JOINs, Precision Decimal Math, GROUP BY Subtotals
-- ============================================================================

SELECT 
    rd.id AS recovery_event_id,
    rd.recovered_at,
    l.application_id,
    b.business_name AS defaulted_msme,
    b.gst_number,
    l.loan_amount AS original_sanction_amount,
    rep.outstanding_principal AS principal_at_default,
    
    -- Waterfall Level 1: Gross Capital Recovered
    rd.total_recovered AS gross_recovered_amount,
    
    -- Waterfall Level 2: Platform Resolution Fee (3%)
    rd.recovery_fee AS platform_fee_deducted,
    ROUND((rd.recovery_fee / rd.total_recovered) * 100, 2) AS platform_fee_pct,
    
    -- Waterfall Level 3: Net Available for Fractional Distribution
    rd.net_distributed AS net_distributed_to_investors,
    
    -- Individual Fractional Crediting Breakdown
    lnd.lender_id,
    lnd.name AS lender_name,
    lds.original_exposure,
    ROUND((lds.original_exposure / l.loan_amount) * 100, 2) AS fractional_ownership_pct,
    lds.gross_share,
    lds.net_received,
    lds.outstanding_loss,
    ROUND((lds.net_received / lds.original_exposure) * 100, 2) AS capital_recovery_efficiency_pct

FROM recovery_distributions rd
JOIN repayments rep ON rd.repayment_id = rep.id
JOIN loans l ON rep.loan_id = l.id
JOIN borrowers b ON l.borrower_id = b.id
JOIN lender_distribution_splits lds ON rd.id = lds.distribution_id
JOIN lenders lnd ON lds.lender_id = lnd.id
ORDER BY rd.recovered_at DESC, lds.net_received DESC;
