import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, File, UploadFile, Form, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.pdf_parser import parse_bank_statement_pdf
from services.graph_analyzer import analyze_upi_csv
from services.cross_validator import cross_validate_financials
from services.scorer import compute_composite_acie_score
from services.ews_detector import evaluate_ews_triggers
from services.llm_copilot import handle_copilot_query
from services.llm_forensic import generate_forensic_audit

app = FastAPI(
    title="PeerPulse Alternate Credit Intelligence Engine (ACIE)",
    version="2.0",
    description="Underwriting microservice for MSME alternate credit scoring, forensic PDF forgery detection, and graph-based UPI cycle detection."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrossValidateRequest(BaseModel):
    bankTotalCredit: float
    gstDeclaredTurnover: float
    businessCategory: Optional[str] = "general"
    avgMonthlyBalance: Optional[float] = 0.0
    loanAmount: Optional[float] = 0.0
    vendorCategories: Optional[List[str]] = None

class ScoreRequest(BaseModel):
    cashMetrics: Optional[Dict[str, Any]] = None
    upiResult: Optional[Dict[str, Any]] = None
    gstResult: Optional[Dict[str, Any]] = None
    operationalData: Optional[Dict[str, Any]] = None
    aaData: Optional[Dict[str, Any]] = None
    forgeryGrade: Optional[str] = "AUTHENTIC"
    forgeryReason: Optional[str] = ""
    fraudRiskFlag: Optional[str] = "None"

class EWSRequest(BaseModel):
    loanAmount: float
    currentAvgBalance: Optional[float] = None
    upiDailyVolumes: Optional[List[float]] = None
    gstDueDatePassedUnfiled: Optional[bool] = False
    debitToCreditRatios: Optional[List[float]] = None
    aaNarrations: Optional[List[str]] = None

@app.get("/health")
def health():
    return {"status": "ok", "service": "acie-engine", "version": "2.0"}

@app.post("/api/acie/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    businessCategory: str = Form(default="general")
):
    try:
        content = await file.read()
        filename = file.filename or ""
        result = parse_bank_statement_pdf(content, filename=filename, business_category=businessCategory)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF analysis failed: {str(e)}")

@app.post("/api/acie/analyze-upi")
async def analyze_upi(
    file: UploadFile = File(...),
    applicationDate: Optional[str] = Form(default=None)
):
    try:
        content = (await file.read()).decode("utf-8", errors="ignore")
        result = analyze_upi_csv(content, application_date_str=applicationDate or "")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"UPI CSV analysis failed: {str(e)}")

@app.post("/api/acie/cross-validate")
def cross_validate(req: CrossValidateRequest):
    try:
        result = cross_validate_financials(
            bank_total_credit=req.bankTotalCredit,
            gst_declared_turnover=req.gstDeclaredTurnover,
            business_category=req.businessCategory,
            avg_monthly_balance=req.avgMonthlyBalance,
            loan_amount=req.loanAmount,
            vendor_categories=req.vendorCategories
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cross-validation failed: {str(e)}")

@app.post("/api/acie/score")
def score(req: ScoreRequest):
    try:
        result = compute_composite_acie_score(
            cash_metrics=req.cashMetrics,
            upi_result=req.upiResult,
            gst_result=req.gstResult,
            operational_data=req.operationalData,
            aa_data=req.aaData,
            forgery_grade=req.forgeryGrade,
            forgery_reason=req.forgeryReason
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring computation failed: {str(e)}")

@app.post("/api/acie/evaluate-ews")
def evaluate_ews(req: EWSRequest):
    try:
        flags = evaluate_ews_triggers(
            loan_amount=req.loanAmount,
            current_avg_balance=req.currentAvgBalance,
            upi_daily_volumes=req.upiDailyVolumes,
            gst_due_date_passed_unfiled=req.gstDueDatePassedUnfiled,
            debit_to_credit_ratios=req.debitToCreditRatios,
            aa_narrations=req.aaNarrations
        )
        return {"flags": flags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EWS evaluation failed: {str(e)}")

class CopilotChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ForensicAuditRequest(BaseModel):
    filename: Optional[str] = "statement.pdf"
    forgeryGrade: Optional[str] = "AUTHENTIC"
    metadataInfo: Optional[Dict[str, Any]] = None
    fontsDetected: Optional[List[str]] = None
    layoutAnomalies: Optional[List[str]] = None
    crossValidation: Optional[Dict[str, Any]] = None

@app.post("/api/acie/copilot/chat")
def copilot_chat(req: CopilotChatRequest):
    try:
        return handle_copilot_query(req.message, req.context or {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot query failed: {str(e)}")

@app.post("/api/acie/forensic/audit")
def forensic_audit(req: ForensicAuditRequest):
    try:
        return generate_forensic_audit(
            filename=req.filename or "statement.pdf",
            forgery_grade=req.forgeryGrade or "AUTHENTIC",
            metadata_info=req.metadataInfo or {},
            fonts_detected=req.fontsDetected or ["helvetica"],
            layout_anomalies=req.layoutAnomalies or [],
            cross_validation=req.crossValidation or {}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic audit generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
