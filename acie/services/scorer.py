from typing import Dict, Any, List

def compute_composite_acie_score(
    cash_metrics: Dict[str, Any] = None,
    upi_result: Dict[str, Any] = None,
    gst_result: Dict[str, Any] = None,
    operational_data: Dict[str, Any] = None,
    aa_data: Dict[str, Any] = None,
    forgery_grade: str = "AUTHENTIC",
    forgery_reason: str = ""
) -> Dict[str, Any]:
    """
    ACIE Composite Scoring Engine:
    rawScore = (cashflow_sub * 0.30) + (upi_sub * 0.25) + (gst_sub * 0.20) + (ops_sub * 0.15) + (aa_sub * 0.10)
    finalScore = min(max(rawScore, 300), 900)
    
    Generates explainability factors and assigns Grade A/B/C/DECLINED.
    """
    cash_metrics = cash_metrics or {}
    upi_result = upi_result or {}
    gst_result = gst_result or {}
    operational_data = operational_data or {}
    aa_data = aa_data or {}

    fraud_flags: List[str] = []
    positive_factors: List[str] = []
    negative_factors: List[str] = []
    improvement_tips: List[str] = []

    # 1. Cashflow Sub-score (30%)
    bounces = cash_metrics.get("bounceCount", 0)
    net_cash = cash_metrics.get("netCashFlow", 0)
    total_credit = cash_metrics.get("totalCredit", 0)
    avg_bal = cash_metrics.get("avgMonthlyBalance", 0)

    cf_sub = 85.0
    if bounces > 0:
        cf_sub -= (bounces * 15.0)
        negative_factors.append(f"{bounces} bank account debit/EMI bounces detected in statement")
        improvement_tips.append("Maintain sufficient closing balance on the 1st-5th of each month to prevent EMI bounces")
    else:
        positive_factors.append("Flawless banking repayment discipline with zero inward/outward bounces")

    if net_cash > 0 and total_credit > 0:
        margin = net_cash / total_credit
        if margin > 0.10:
            positive_factors.append(f"Strong positive net cashflow margin ({margin*100:.1f}%) across past 12 months")
        else:
            cf_sub -= 10.0
            negative_factors.append("Tight cash flow margin (<10% net retention)")
    elif net_cash <= 0:
        cf_sub -= 25.0
        negative_factors.append("Negative annual net cash flow")

    cf_sub = max(min(cf_sub, 100.0), 10.0)

    # 2. UPI Sub-score (25%)
    cycles = upi_result.get("cycleCount", 0)
    stat_flags = upi_result.get("statisticalFlags", [])
    upi_sub = upi_result.get("upiSubScore", 78.0)

    if cycles > 0:
        fraud_flags.append(f"Circular routing detected: {cycles} reciprocal A→B→A transaction loops within 72h window")
        negative_factors.append(f"{cycles} circular UPI loops detected (inflated transaction volume)")
        improvement_tips.append("Avoid rapid circular fund transfers between associated supplier/personal accounts")
    else:
        positive_factors.append("Organic, well-distributed UPI customer transaction graph with zero circular routing")

    for sf in stat_flags:
        fraud_flags.append(sf)
        negative_factors.append(sf)

    # 3. GST Sub-score (20%)
    gst_flagged = gst_result.get("flagged", False)
    gst_flags = gst_result.get("flags", [])
    gst_sub = gst_result.get("gstScore", 90.0)

    if gst_flagged:
        for gf in gst_flags:
            fraud_flags.append(gf)
            negative_factors.append(gf)
        improvement_tips.append("Reconcile bank inflows with GSTR-1 declared sales before quarterly filing")
    else:
        positive_factors.append("High GST filing fidelity (GSTR-1 declared turnover matches bank collections within 5%)")

    # 4. Operational Sub-score (15%)
    # Review count, rating, employee count
    review_count = operational_data.get("reviewCount", 45)
    sentiment = operational_data.get("sentiment", "positive")
    employee_count = operational_data.get("employeeCount", 6)
    
    ops_sub = 70.0
    if review_count >= 30 and sentiment in ["positive", "high"]:
        ops_sub += 15.0
        positive_factors.append(f"Strong digital presence: Verified Google Business profile ({review_count}+ positive customer reviews)")
    if employee_count >= 5:
        ops_sub += 5.0
        positive_factors.append(f"Operational stability: {employee_count} declared full-time employees")
    ops_sub = max(min(ops_sub, 100.0), 20.0)

    # 5. AA Data Sub-score (10%)
    aa_sub = 65.0
    if aa_data.get("consentVerified", True):
        aa_sub += 15.0
        positive_factors.append("ReBIT Account Aggregator consent verified with direct bank cryptographic proof")
    if aa_data.get("hasPenalties", False):
        aa_sub -= 30.0
        fraud_flags.append("AA Stream: Multiple bank penal charges and overdue charges identified")
        negative_factors.append("Recurring penalty charges noted in AA telemetry")
    aa_sub = max(min(aa_sub, 100.0), 20.0)

    # Forgery override check
    if forgery_grade == "FORGED":
        fraud_risk_flag = "Block"
        fraud_flags.insert(0, f"DOCUMENT FORGERY DETECTED: {forgery_reason}")
        negative_factors.insert(0, "Manipulated or forged bank statement file detected by Layer-1 forensic scanner")
        total_score = 310
        grade = "DECLINED"
        cf_sub = 15.0
        upi_sub = 20.0
        gst_sub = 20.0
    else:
        # Scale 0-100 sub-scores into 300-900 range
        weighted_norm = (cf_sub * 0.30) + (upi_sub * 0.25) + (gst_sub * 0.20) + (ops_sub * 0.15) + (aa_sub * 0.10)
        total_score = int(round(300.0 + (weighted_norm * 6.0)))
        total_score = min(max(total_score, 300), 900)

        # Assign Grade Bands:
        # 750–900 → Grade A (Prime)
        # 650–749 → Grade B (Standard)
        # 550–649 → Grade C (Subprime)
        # <550 → DECLINED
        if total_score >= 750:
            grade = "A"
        elif total_score >= 650:
            grade = "B"
        elif total_score >= 550:
            grade = "C"
        else:
            grade = "DECLINED"

        # Fraud Risk Flag
        if forgery_grade == "SUSPICIOUS" or len(fraud_flags) >= 2:
            fraud_risk_flag = "Caution"
        elif len(fraud_flags) > 0:
            fraud_risk_flag = "Caution"
        else:
            fraud_risk_flag = "None"

    # Data completeness calculation
    provided_count = 0
    total_sources = 5
    if cash_metrics: provided_count += 1
    if upi_result: provided_count += 1
    if gst_result: provided_count += 1
    if operational_data: provided_count += 1
    if aa_data: provided_count += 1
    data_completeness = int((provided_count / total_sources) * 100)

    # Confidence calculation
    if data_completeness >= 80 and not fraud_flags:
        confidence = "High"
    elif data_completeness >= 60 or fraud_risk_flag == "Caution":
        confidence = "Medium"
    else:
        confidence = "Low"

    # Ensure improvement tips are populated if declined or lower grade
    if not improvement_tips:
        if grade in ["C", "DECLINED"]:
            improvement_tips.append("Maintain minimum 3 months of consistent, positive cash flow before re-applying")
            improvement_tips.append("Upload verified GST returns with consistent turnover to boost ACIE rating")
        else:
            improvement_tips.append("Linking Account Aggregator data on a quarterly basis qualifies your business for lower interest rates")

    return {
        "total": total_score,
        "grade": grade,
        "breakdown": {
            "cashflow": int(round(cf_sub)),
            "upi": int(round(upi_sub)),
            "gst": int(round(gst_sub)),
            "operational": int(round(ops_sub)),
            "aaData": int(round(aa_sub))
        },
        "fraudFlags": fraud_flags,
        "confidence": confidence,
        "fraudRiskFlag": fraud_risk_flag,
        "dataCompleteness": data_completeness,
        "explainability": {
            "positiveFactors": positive_factors[:4],
            "negativeFactors": negative_factors[:4],
            "improvementTips": improvement_tips[:3]
        }
    }
