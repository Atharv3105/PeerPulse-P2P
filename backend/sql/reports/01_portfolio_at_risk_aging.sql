-- ============================================================================
-- REPORT 01: PORTFOLIO AT RISK (PAR) & DPD AGING MATRIX
-- Module: Regulatory Delinquency Aging, Sectoral Exposure Rollup & Provisioning
-- Standard: RBI Master Direction - NBFC-P2P Delinquency Surveillance
-- Features Used: CASE WHEN Aging Bucketing, Multi-Table INNER JOINs, Aggregate ROLLUP
-- ============================================================================

SELECT 
    COALESCE(l.business_category, 'ALL SECTORS') AS sector,
    COUNT(DISTINCT l.id) AS total_active_loans,
    ROUND(SUM(l.loan_amount), 2) AS total_portfolio_disbursed,
    ROUND(SUM(r.outstanding_principal), 2) AS total_outstanding_principal,
    
    -- Current: DPD = 0
    ROUND(SUM(CASE WHEN r.dpd = 0 THEN r.outstanding_principal ELSE 0 END), 2) AS current_performing,
    
    -- SMA-0 (Special Mention Account 0): 1 to 30 DPD (Soft Collection)
    ROUND(SUM(CASE WHEN r.dpd BETWEEN 1 AND 30 THEN r.outstanding_principal ELSE 0 END), 2) AS sma_0_dpd_1_30,
    
    -- SMA-1: 31 to 60 DPD (At Risk)
    ROUND(SUM(CASE WHEN r.dpd BETWEEN 31 AND 60 THEN r.outstanding_principal ELSE 0 END), 2) AS sma_1_dpd_31_60,
    
    -- SMA-2: 61 to 90 DPD (Critical Restructuring)
    ROUND(SUM(CASE WHEN r.dpd BETWEEN 61 AND 90 THEN r.outstanding_principal ELSE 0 END), 2) AS sma_2_dpd_61_90,
    
    -- Non-Performing Assets (NPA): 90+ DPD
    ROUND(SUM(CASE WHEN r.dpd > 90 THEN r.outstanding_principal ELSE 0 END), 2) AS npa_dpd_over_90,
    
    -- Total Penal Interest Accrued
    ROUND(SUM(r.penal_interest_accrued), 2) AS total_penal_interest_accrued,
    
    -- PAR-30 Ratio (% of portfolio overdue >30 days)
    ROUND(
        (SUM(CASE WHEN r.dpd > 30 THEN r.outstanding_principal ELSE 0 END) / 
         NULLIF(SUM(r.outstanding_principal), 0)) * 100, 
        2
    ) AS par_30_percentage,

    -- NPA Ratio (% of portfolio >90 DPD)
    ROUND(
        (SUM(CASE WHEN r.dpd > 90 THEN r.outstanding_principal ELSE 0 END) / 
         NULLIF(SUM(r.outstanding_principal), 0)) * 100, 
        2
    ) AS npa_ratio_percentage

FROM loans l
JOIN repayments r ON l.id = r.loan_id
JOIN borrowers b ON l.borrower_id = b.id
WHERE l.status IN ('ACTIVE', 'DELAYED', 'AT_RISK', 'NPA')
GROUP BY l.business_category WITH ROLLUP;
