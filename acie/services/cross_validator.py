from typing import Dict, Any, List

def cross_validate_financials(
    bank_total_credit: float,
    gst_declared_turnover: float,
    business_category: str = "",
    avg_monthly_balance: float = 0.0,
    loan_amount: float = 0.0,
    vendor_categories: List[str] = None
) -> Dict[str, Any]:
    """
    Layer 2 — Semantic Cross-Validation:
    1. Compares bank statement credits vs. GSTR-1 declared turnover
    2. Flags if bank credits exceed GST turnover by >40%
    3. Compares average monthly balance against declared loan amount (plausibility check)
    4. Cross-checks debit patterns against stated business category
    """
    flags = []
    flagged = False
    delta_ratio = 0.0

    # 1. Bank Credit vs GST Turnover Delta Check
    if gst_declared_turnover > 0:
        delta_ratio = (bank_total_credit - gst_declared_turnover) / gst_declared_turnover
        if delta_ratio > 0.40:
            flagged = True
            flags.append(f"GST Discrepancy: Bank credits (₹{bank_total_credit:,.2f}) exceed declared GST turnover (₹{gst_declared_turnover:,.2f}) by {delta_ratio*100:.1f}% (threshold: >40%)")
        elif delta_ratio < -0.30:
            flags.append(f"Under-banking: Declared GST turnover significantly exceeds bank statement receipts by {abs(delta_ratio)*100:.1f}%")

    # 2. Average Monthly Balance vs Loan Amount Plausibility
    if loan_amount > 0 and avg_monthly_balance > 0:
        ratio = loan_amount / avg_monthly_balance
        if ratio > 15.0:
            flagged = True
            flags.append(f"High Leverage Plausibility Warning: Requested loan (₹{loan_amount:,.2f}) is {ratio:.1f}x average monthly bank balance (₹{avg_monthly_balance:,.2f})")

    # 3. Debit Pattern vs Business Category Cross-Check
    expected_vendor_keywords = {
        "textile": ["fabric", "yarn", "loom", "dye", "textile", "mills"],
        "manufacturing": ["steel", "tooling", "metal", "raw", "machinery", "cnc"],
        "retail": ["wholesale", "fmcg", "distributor", "goods", "inventory", "metro"],
        "services": ["payroll", "consulting", "software", "hosting", "freelance"]
    }

    norm_category = business_category.lower().strip()
    if vendor_categories and norm_category in expected_vendor_keywords:
        matching_keywords = expected_vendor_keywords[norm_category]
        has_industry_debits = any(
            any(kw in vc.lower() for kw in matching_keywords)
            for vc in vendor_categories
        )
        if not has_industry_debits:
            flagged = True
            flags.append(f"Debit Pattern Anomaly: Category '{business_category}' contains zero matching vendor debits for expected core inputs ({', '.join(matching_keywords[:3])})")

    # GST Sub-Score Calculation (0-100)
    gst_score = 90.0
    if flagged:
        gst_score -= 35.0
    if abs(delta_ratio) > 0.20:
        gst_score -= 15.0
    gst_score = max(min(gst_score, 100.0), 20.0)

    return {
        "deltaRatio": round(delta_ratio, 4),
        "flagged": flagged,
        "flags": flags,
        "gstScore": round(gst_score, 1)
    }
