-- ============================================================================
-- REPORT 03: ONE-TIME SETTLEMENT (OTS) RESTRUCTURING VOTING WATERFALL
-- Module: Debt Restructuring & Resolution Governance
-- Purpose: Rollup of fractional lender voting ballots, weighted by tranche capital,
--          evaluating against the statutory 60% approval threshold.
-- Features Used: Common Table Expressions (CTEs), Pro-Rata Weighting, HAVING Filter
-- ============================================================================

WITH proposal_context AS (
    SELECT 
        rp.id AS proposal_pk,
        rp.restructure_id,
        rp.option_type,
        rp.proposed_amount,
        rp.status AS proposal_status,
        rp.applied_at,
        rp.expires_at,
        l.id AS loan_pk,
        l.application_id,
        l.target_amount,
        b.business_name,
        b.name AS borrower_name,
        rep.outstanding_principal,
        rep.penal_interest_accrued
    FROM restructure_proposals rp
    JOIN repayments rep ON rp.repayment_id = rep.id
    JOIN loans l ON rep.loan_id = l.id
    JOIN borrowers b ON l.borrower_id = b.id
),
vote_tallies AS (
    SELECT 
        rv.proposal_id,
        COUNT(rv.id) AS total_votes_cast,
        
        -- Sum of tranche percentage shares voting APPROVE
        SUM(CASE WHEN rv.vote = 'APPROVE' THEN rv.tranche_share ELSE 0 END) AS approve_tranche_pct,
        
        -- Sum of tranche percentage shares voting REJECT
        SUM(CASE WHEN rv.vote = 'REJECT' THEN rv.tranche_share ELSE 0 END) AS reject_tranche_pct,
        
        -- Total voting capital participating
        SUM(CASE WHEN rv.vote = 'APPROVE' THEN (rv.tranche_share / 100.0) * pc.target_amount ELSE 0 END) AS approved_capital_amount,
        SUM(CASE WHEN rv.vote = 'REJECT'  THEN (rv.tranche_share / 100.0) * pc.target_amount ELSE 0 END) AS rejected_capital_amount
        
    FROM restructure_votes rv
    JOIN proposal_context pc ON rv.proposal_id = pc.proposal_pk
    GROUP BY rv.proposal_id, pc.target_amount
)
SELECT 
    pc.restructure_id,
    pc.application_id,
    pc.borrower_name,
    pc.business_name,
    pc.option_type,
    pc.outstanding_principal,
    pc.proposed_amount,
    
    -- Haircut % (amount of principal forgiven in settlement)
    ROUND(((pc.outstanding_principal - pc.proposed_amount) / pc.outstanding_principal) * 100, 2) AS haircut_percentage,
    
    COALESCE(vt.total_votes_cast, 0) AS total_lenders_voted,
    COALESCE(vt.approve_tranche_pct, 0.00) AS approve_weighted_pct,
    COALESCE(vt.reject_tranche_pct, 0.00) AS reject_weighted_pct,
    ROUND(COALESCE(vt.approved_capital_amount, 0.00), 2) AS approved_capital_volume,
    
    60.00 AS statutory_threshold_pct,
    
    -- Evaluation against 60% RBI consensus threshold
    CASE 
        WHEN COALESCE(vt.approve_tranche_pct, 0) >= 60.00 THEN 'PASSED_EXECUTE_OTS'
        WHEN pc.expires_at < CURRENT_TIMESTAMP AND COALESCE(vt.approve_tranche_pct, 0) < 60.00 THEN 'FAILED_EXPIRED'
        ELSE 'VOTING_IN_PROGRESS'
    END AS consensus_verdict,
    
    pc.proposal_status,
    pc.expires_at AS voting_deadline

FROM proposal_context pc
LEFT JOIN vote_tallies vt ON pc.proposal_pk = vt.proposal_id
ORDER BY pc.applied_at DESC;
