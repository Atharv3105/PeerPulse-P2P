import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'acie'))

from services.pdf_parser import parse_bank_statement_pdf
from services.forgery_detector import analyze_pdf_forgery
from services.graph_analyzer import analyze_upi_csv
from services.cross_validator import cross_validate_financials
from services.scorer import compute_composite_acie_score
from services.ews_detector import evaluate_ews_triggers

print("================ ACIE VERIFICATION TESTS ================")

# Test 1: Priya Clean Statement
with open("data/mock_statement_clean.pdf", "rb") as f:
    priya_pdf = f.read()
res_priya = parse_bank_statement_pdf(priya_pdf, "mock_statement_clean.pdf", "textile")
print(f"[TEST 1] Priya PDF: Forgery={res_priya['forgeryGrade']}, DocScore={res_priya['documentScore']}, TotalCredit={res_priya['cashMetrics']['totalCredit']}")
assert res_priya["forgeryGrade"] == "AUTHENTIC"

# Test 2: Kumar Forged Statement
with open("data/mock_statement_forged.pdf", "rb") as f:
    kumar_pdf = f.read()
res_kumar = parse_bank_statement_pdf(kumar_pdf, "mock_statement_forged.pdf", "services")
print(f"[TEST 2] Kumar PDF: Forgery={res_kumar['forgeryGrade']}, Reason={res_kumar['forgeryReason'][:80]}...")
assert res_kumar["forgeryGrade"] == "FORGED"

# Test 3: Ravi Cyclical UPI
with open("data/mock_upi_cyclical.csv", "r") as f:
    ravi_upi = f.read()
res_upi_ravi = analyze_upi_csv(ravi_upi)
print(f"[TEST 3] Ravi UPI: Cycles={res_upi_ravi['cycleCount']}, FraudScore={res_upi_ravi['fraudScore']}, StatFlags={len(res_upi_ravi['statisticalFlags'])}")
assert res_upi_ravi["cycleCount"] == 3
assert len(res_upi_ravi["statisticalFlags"]) >= 1

# Test 4: Ravi GST Cross-Validation
res_gst_ravi = cross_validate_financials(
    bank_total_credit=4120000.0,
    gst_declared_turnover=2800000.0,
    business_category="retail",
    avg_monthly_balance=82000.0,
    loan_amount=300000.0
)
print(f"[TEST 4] Ravi GST Delta: DeltaRatio={res_gst_ravi['deltaRatio']}, Flagged={res_gst_ravi['flagged']}, Flags={res_gst_ravi['flags']}")
assert res_gst_ravi["flagged"] == True
assert res_gst_ravi["deltaRatio"] > 0.40

# Test 5: Composite Scoring
score_priya = compute_composite_acie_score(
    cash_metrics=res_priya["cashMetrics"],
    upi_result={"upiSubScore": 78},
    gst_result={"gstScore": 90, "flagged": False},
    operational_data={"reviewCount": 45, "employeeCount": 6},
    aa_data={"consentVerified": True},
    forgery_grade="AUTHENTIC"
)
print(f"[TEST 5A] Priya Composite Score: Total={score_priya['total']}, Grade={score_priya['grade']}, Flags={score_priya['fraudFlags']}")
assert 790 <= score_priya["total"] <= 850
assert score_priya["grade"] == "A"

score_ravi = compute_composite_acie_score(
    cash_metrics={"bounceCount": 2, "netCashFlow": 170000, "totalCredit": 4120000},
    upi_result=res_upi_ravi,
    gst_result=res_gst_ravi,
    operational_data={"reviewCount": 20, "employeeCount": 3},
    aa_data={"consentVerified": True},
    forgery_grade="AUTHENTIC"
)
print(f"[TEST 5B] Ravi Composite Score: Total={score_ravi['total']}, Grade={score_ravi['grade']}, FraudRisk={score_ravi['fraudRiskFlag']}")
assert 550 <= score_ravi["total"] <= 649
assert score_ravi["grade"] == "C"
assert score_ravi["fraudRiskFlag"] == "Caution"

score_kumar = compute_composite_acie_score(
    forgery_grade="FORGED",
    forgery_reason=res_kumar["forgeryReason"]
)
print(f"[TEST 5C] Kumar Composite Score: Total={score_kumar['total']}, Grade={score_kumar['grade']}, FraudRisk={score_kumar['fraudRiskFlag']}")
assert score_kumar["grade"] == "DECLINED"
assert score_kumar["fraudRiskFlag"] == "Block"

# Test 6: EWS Distress Triggers
ews_flags = evaluate_ews_triggers(
    loan_amount=500000,
    current_avg_balance=35000, # < 10% (50k) -> ALERT
    upi_daily_volumes=[15000, 14500, 15200, 14800, 15000, 7500, 7000, 6800, 6500, 6200], # >=30% drop -> CAUTION
    gst_due_date_passed_unfiled=True, # -> WATCH
    debit_to_credit_ratios=[0.85, 0.88, 0.82, 1.45], # -> CAUTION
    aa_narrations=["INWARD CHQ BOUNCE UNPAID"] # -> ALERT
)
print(f"[TEST 6] EWS Triggers detected ({len(ews_flags)}): {[f['type'] + ' (' + f['severity'] + ')' for f in ews_flags]}")
assert len(ews_flags) >= 4

print("\n>>> ALL ACIE ENGINE TESTS PASSED 100% SUCCESFULLY! <<<")
