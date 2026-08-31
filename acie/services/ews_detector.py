from datetime import datetime
from typing import Dict, Any, List

def evaluate_ews_triggers(
    loan_amount: float,
    current_avg_balance: float = None,
    upi_daily_volumes: List[float] = None,
    gst_due_date_passed_unfiled: bool = False,
    debit_to_credit_ratios: List[float] = None,
    aa_narrations: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Evaluates all 5 distress triggers defined in Section 7.1:
    - UPI_DROP (CAUTION): >=30% drop over 5+ consecutive days
    - GST_MISS (WATCH): GST filing not detected on/after due date
    - BALANCE_LOW (ALERT): Avg monthly balance <10% of loan amount
    - DEBIT_SPIKE (CAUTION): Debit/credit ratio exceeds 2 std deviations
    - BOUNCE_NARRATION (ALERT): BOUNCE/PENALTY found in AA narrations
    """
    triggered_flags = []
    now_iso = datetime.utcnow().isoformat() + "Z"

    # 1. UPI_DROP Check: Sustained >=30% drop in daily UPI volume over 5+ consecutive days
    if upi_daily_volumes and len(upi_daily_volumes) >= 5:
        # Check if the recent 5 days have dropped >= 30% from the 30-day/historical baseline
        historical_baseline = sum(upi_daily_volumes[:max(1, len(upi_daily_volumes)-5)]) / max(1, len(upi_daily_volumes)-5)
        recent_5d = upi_daily_volumes[-5:]
        if historical_baseline > 0 and all((historical_baseline - v) / historical_baseline >= 0.30 for v in recent_5d):
            triggered_flags.append({
                "type": "UPI_DROP",
                "severity": "CAUTION",
                "triggeredAt": now_iso,
                "description": "Sustained ≥30% decline in daily merchant UPI collection volume detected over 5 consecutive days"
            })

    # 2. GST_MISS Check
    if gst_due_date_passed_unfiled:
        triggered_flags.append({
            "type": "GST_MISS",
            "severity": "WATCH",
            "triggeredAt": now_iso,
            "description": "GSTR-3B monthly tax filing overdue past statutory 20th day cut-off"
        })

    # 3. BALANCE_LOW Check
    if current_avg_balance is not None and loan_amount > 0:
        if current_avg_balance < (loan_amount * 0.10):
            triggered_flags.append({
                "type": "BALANCE_LOW",
                "severity": "ALERT",
                "triggeredAt": now_iso,
                "description": f"Average account balance (₹{current_avg_balance:,.2f}) dropped below 10% liquidity threshold of active loan amount (₹{loan_amount:,.2f})"
            })

    # 4. DEBIT_SPIKE Check
    if debit_to_credit_ratios and len(debit_to_credit_ratios) >= 4:
        baseline_ratios = debit_to_credit_ratios[:-1]
        mean_ratio = sum(baseline_ratios) / len(baseline_ratios)
        latest_ratio = debit_to_credit_ratios[-1]
        if latest_ratio > 1.3 * mean_ratio and latest_ratio > 1.20:
            triggered_flags.append({
                "type": "DEBIT_SPIKE",
                "severity": "CAUTION",
                "triggeredAt": now_iso,
                "description": f"Abnormal outflow spike: Debit-to-credit ratio ({latest_ratio:.2f}) spiked >2 standard deviations above baseline ({mean_ratio:.2f})"
            })

    # 5. BOUNCE_NARRATION Check
    if aa_narrations:
        for narr in aa_narrations:
            narr_upper = narr.upper()
            if any(term in narr_upper for term in ["BOUNCE", "PENALTY", "INSUFFICIENT", "RETURN CHARGES"]):
                triggered_flags.append({
                    "type": "BOUNCE_NARRATION",
                    "severity": "ALERT",
                    "triggeredAt": now_iso,
                    "description": f"Bank Account Aggregator telemetry flagged bounce/penalty narration: '{narr}'"
                })
                break

    return triggered_flags
