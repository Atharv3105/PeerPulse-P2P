-- ============================================================================
-- REPORT 05: ACIE CREDIT SCORE MIGRATION & EWS EARLY WARNING SURVEILLANCE
-- Module: Underwriting Telemetry & Early Warning Signal Surveillance
-- Purpose: 5-Dimensional underwriter surveillance tracking cashflow volatility,
--          forgery flags, and early warning delinquency triggers across MSMEs.
-- Features Used: Aggregate Percentages, Conditional Categorization, JSON Queries
-- ============================================================================

SELECT 
    b.borrower_id,
    b.name AS entrepreneur_name,
    b.business_name,
    b.business_category AS sector,
    b.platform_trust_score,
    l.application_id,
    l.loan_amount,
    l.grade AS current_grade,
    l.score AS acie_composite_score,
    
    -- 5 Dimensional Telemetry Scores
    sb.cashflow_score,
    sb.upi_score,
    sb.gst_score,
    sb.operational_score,
    sb.aa_data_score,
    
    sb.forgery_grade,
    sb.fraud_risk_flag,
    
    -- EWS Early Warning Assessment
    CASE 
        WHEN sb.forgery_grade = 'FORGED' THEN 'CRITICAL: Forensic Document Alteration Detected'
        WHEN sb.cashflow_score < 40 AND sb.gst_score < 40 THEN 'HIGH ALERT: Banking Turnover & GST Contraction'
        WHEN sb.upi_score < 50 THEN 'WARNING: Sub-Threshold Counterparty Velocity'
        WHEN b.platform_trust_score < 60 THEN 'CAUTION: Platform Discipline Deteriorating'
        ELSE 'STABLE: Healthy Inflow Disciplines'
    END AS ews_surveillance_verdict,
    
    -- Underwriting Action Recommendation
    CASE 
        WHEN l.grade = 'A' AND sb.cashflow_score >= 80 THEN 'ELIGIBLE_FOR_1.5%_RATE_DISCOUNT'
        WHEN l.grade = 'B' AND sb.upi_score >= 75 THEN 'PRIME_CANDIDATE_FOR_UPGRADE'
        WHEN l.grade = 'C' THEN 'REQUIRE_WEEKLY_NACH_SWEEPS'
        WHEN l.grade = 'DECLINED' OR sb.forgery_grade = 'FORGED' THEN 'PERMANENT_BLACKLIST'
        ELSE 'STANDARD_MONITORING'
    END AS underwriter_action_code,
    
    l.interest_rate AS current_interest_rate_pct,
    l.created_at AS application_timestamp

FROM borrowers b
JOIN loans l ON b.id = l.borrower_id
LEFT JOIN loan_score_breakdowns sb ON l.id = sb.loan_id
ORDER BY 
    CASE l.grade 
        WHEN 'A' THEN 1 
        WHEN 'B' THEN 2 
        WHEN 'C' THEN 3 
        ELSE 4 
    END, 
    l.score DESC;
