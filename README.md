# PeerPulse (v2.0)
> **"Credit where credit is actually due."**  
> *Razorpay AI Buildathon 2026 — Open Track Submission*

---

## 1. Executive Summary & Problem Taste

India is home to over **63 million Micro, Small, and Medium Enterprises (MSMEs)** contributing ~30% to national GDP. Yet **>80% remain credit invisible** with a formal credit gap exceeding **₹25 Trillion** ($300B+). Traditional commercial banks reject over **60% of applicants at initial screening** due to lack of audited financials or conventional CIBIL histories.

**PeerPulse** solves this credit-gap crisis through two core innovations:
1. **Alternate Credit Intelligence Engine (ACIE):** Multidimensional underwriting evaluating bank statement forensic telemetry, NetworkX directed UPI graph cycle detection, and GST reconciliation.
2. **RBI-Compliant Fractional Pooling Architecture:** Splitting loans into fractional tranches across retail lenders, enforcing statutory caps (₹50K per borrower, ₹10L aggregate exposure, 0% Default Loss Guarantee).

---

## 2. System Architecture & Tech Stack

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  PeerPulse Frontend                    │
                                  │         React 18 • Tailwind CSS • Recharts • Vite      │
                                  └───────────────┬────────────────────────┬───────────────┘
                                                  │                        │
                                   Borrower/Lender/Admin Portal      Public Transparency (RBI)
                                                  │                        │
                                  ┌───────────────▼────────────────────────▼───────────────┐
                                  │              Backend API Gateway (Port 3001)           │
                                  │           Node.js • Express • Mongoose • Bull          │
                                  └───────┬────────────────────────────────┬───────────────┘
                                          │                                │
                     ┌────────────────────▼───────────────────┐  ┌─────────▼───────────────┐
                     │          ACIE Underwriting             │  │   MongoDB Database      │
                     │          Python 3.14 • FastAPI         │  │   4 Pre-seeded Personas │
                     │       (PyMuPDF • NetworkX • Pandas)    │  │   5 Core Schemas        │
                     └────────────────────┬───────────────────┘  └─────────────────────────┘
                                          │
                     ┌────────────────────▼───────────────────┐
                     │          Local LLM Forensic Layer      │
                     │      Ollama (Mistral-7B / Llama-3-8B)  │
                     │         Layer-1 Forgery Reasoning      │
                     └────────────────────────────────────────┘
```

| Layer | Tooling & Frameworks | Primary Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Recharts, Lucide Icons | Responsive multi-portal UI, ACIE score radial meter, radar breakdown, diversification donut |
| **Backend Gateway** | Node.js, Express.js, Mongoose, UUID | Fast asynchronous API routing, fractional matching, 5-stage default state machine |
| **ACIE Microservice** | Python 3.14, FastAPI, PyMuPDF, NetworkX, Pandas | Forensic PDF bounding box extraction, DFS cycle detection ($A \to B \to A$ within 72h), semantic GST cross-validation |
| **Forensic LLM** | Ollama (Mistral-7B) / Cached rule engine | Layer-1 font inconsistency & metadata classification (AUTHENTIC / SUSPICIOUS / FORGED) |
| **Database** | MongoDB (Local Service) | Persistence for `LoanApplication`, `LoanRepayment`, `Borrower`, `Lender`, `AuditLog` |
| **Queue / Async** | Bull Scheduler (5 registered background queues) | `acie-score`, `upi-graph-analysis`, `ews-poll` (24h), `nach-retry` (Days 3, 7, 15, 25), `npa-classifier` (90 DPD) |

---

## 3. Five-Dimensional ACIE Underwriting Specification

$$\text{rawScore} = 0.30 \cdot \text{CashFlow} + 0.25 \cdot \text{UPIGraph} + 0.20 \cdot \text{GSTFiling} + 0.15 \cdot \text{Operational} + 0.10 \cdot \text{AATelemetry}$$
$$\text{finalScore} = \min(\max(\text{rawScore}, 300), 900)$$

| Dimension | Weight | Input Source | Extraction & Validation Logic | Fraud / Forensic Flagging |
| :--- | :--- | :--- | :--- | :--- |
| **Cash Flow Analysis** | 30% | 12-Month Bank Statement PDF | Total credits, debits, net retention, bounce count, average monthly balance | **Layer 1:** PyMuPDF font scan & metadata anomaly detection (cracked PDF editors, mixed fonts) |
| **UPI Transaction Graph** | 25% | UPI Transaction Ledger CSV | Directed MultiDiGraph construction | **NetworkX DFS:** Flag reciprocal loops ($A \to B \to A$ within 72h, $<5\%$ amount variance); **Statistical:** Uniform amounts ($\ge 23$ repetitions), velocity surges |
| **GST Reconciliation** | 20% | GSTR-1 / GSTR-3B filings | Declared annual sales vs. bank statement receipts | **Layer 2:** Delta $>40\%$ flags revenue inflation; debit patterns checked against business category |
| **Operational Signals** | 15% | Google Business Profile & Udyam | Review volume, sentiment rating, on-roll full-time workforce | Volume & recency trend verification |
| **AA Telemetry** | 10% | ReBIT-Schema Consent Stream | Direct bank cryptographic telemetry, fee/penalty narrations | Schema integrity check; scan for `BOUNCE`/`PENALTY` narrations |

---

## 4. RBI Regulatory Guardrails Enforced in Code

1. **Strict 0% Default Loss Guarantee (DLG):** Per RBI Master Directions, platform treasury funds are never used to reimburse defaults. Lenders bear 100% credit risk.
2. **Aggregate Lender Exposure Cap:** Maximum ₹10,00,000 platform-wide across all P2P platforms. Hard-blocked at wallet funding.
3. **Single Borrower Exposure Cap:** Maximum ₹50,000 per lender to any single MSME borrower.
4. **MSME Borrowing Limit:** ₹25,000 to ₹50,00,000 for approved tenures (3, 6, 9, 12, 24, 36 months only).
5. **Transparency & Public Disclosures:** Real-time NPA % disclosures by grade and sector available publicly on `/metrics` without login.

---

## 5. Quickstart & Installation

### Prerequisites
- Node.js `>= 18.x` & npm `>= 9.x`
- Python `>= 3.10`
- MongoDB running on `mongodb://localhost:27017`

### 1. Clone & Seed Database
```bash
# Seed all 4 demo personas and 3 retail lenders
cd backend
npm install
npm run seed
```

### 2. Launch Services
**Terminal 1 — Python ACIE Microservice:**
```bash
cd acie
python main.py
# Runs on http://localhost:8000
```

**Terminal 2 — Backend API Gateway:**
```bash
cd backend
npm start
# Runs on http://localhost:3001
```

**Terminal 3 — Frontend React Portal:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 6. Evaluator Demonstration Script (The 4 Personas)

Use the **"Demo Personas"** dropdown in the top-right navbar to instantly switch between scenarios:

### Scenario 1: Priya Sharma (Prime MSME — Instant Underwriting & Funding)
1. In the navbar, select **"Priya Sharma (Surat)"**.
2. Navigate to **Borrower Portal ➔ "New Loan Wizard"**. Click the top **"Pre-fill: Priya (Grade A)"** button.
3. Step through the 7 steps:
   - Step 2: Statement verified **AUTHENTIC** with ₹34.2L turnover and 0 bounces.
   - Step 3: GST turnover matches bank credits within 2%.
   - Step 4: Clean UPI graph with 0 circular loops.
   - Step 6: Animated Score reveal: **ACIE Score 810 (Grade A • Prime)**.
   - Step 7: Listed on Marketplace.
4. Switch persona to **"Vikram Sethi"** (Conservative Lender) ➔ Navigate to **Lender Portal**.
5. Priya's loan appears in Auto-Matches ➔ Click **"Confirm ₹25,000"** to fund a fractional tranche.

---

### Scenario 2: Ravi Kumar Verma (Subprime Merchant — GST Delta & Bounces)
1. Select **"Ravi Verma"** ➔ Open **Application Wizard** ➔ Click **"Pre-fill: Ravi (Grade C)"**.
2. In Step 2, upload statement: 2 EMI bounces detected.
3. In Step 3, Layer-2 Semantic Check flags: **"GST Discrepancy: Bank credits (₹41.2L) exceed GSTR-1 declared turnover (₹28L) by 47.1% (>40% threshold)"**.
4. In Step 4, UPI Graph detects **3 circular routing loops ($A \to B \to A$) and 23 repeated uniform amounts**.
5. Step 6 reveals **ACIE Score 590 (Grade C • Subprime)** with Caution Flag and actionable improvement tips.

---

### Scenario 3: Kumar Chandran (Forensic PDF Forgery — Blocked Before Listing)
1. Select **"Kumar Chandran"** ➔ Open **Application Wizard** ➔ Click **"Pre-fill: Kumar (Forged)"**.
2. In Step 2, PyMuPDF forensic scanner detects:
   - Producer signature edited in unregistered Adobe Acrobat cracked copy.
   - Mismatched fonts across ledger (`helv`, `times-roman`, `courier`).
   - Misaligned credit amounts.
3. Local LLM / Forensic Engine returns **`FORGED`**.
4. Application is **`BLOCKED`** and omitted from the public marketplace.
5. Switch to **Admin / Risk Ops Panel** ➔ **"Flagged Applications Queue"** to view the side-by-side forensic breakdown and LLM reasoning.

---

### Scenario 4: Amit Deshmukh (Default Recovery & Settlement Module)
1. Switch to **Admin / Risk Ops Panel ➔ "Manual Trigger & Demo Simulator"**.
2. Select **Amit Deshmukh (LN-AMIT-710)** ➔ Target: `DELAYED` ➔ Click **"Fire Event / Simulate NACH Failure"**.
3. Telemetry updates:
   - Loan transitions to `DELAYED`.
   - 18% p.a. penal interest begins accruing daily (₹0.04931% per day).
   - EWS alerts triggered in Admin EWS dashboard.
4. Switch persona to **Amit Deshmukh** ➔ Navigate to **Borrower Portal**.
5. The **Distress Alert Banner** and **Settlement Module** appear ➔ Select **"Moratorium (2 Months)"** or **"OTS Proposal (₹3,50,000)"** and submit.
6. Switch persona to **Vikram Sethi** (Lender Portal) ➔ Active OTS ballot card appears ➔ Vote **"Approve OTS"**. When fractional approval exceeds 60%, the loan is marked `SETTLED`.

---

## 7. Automated Test Suite Verification

Run the comprehensive test suites from the root directory:

```bash
# 1. ACIE Engine & Forensic tests
python scripts/test_backend_acie.py

# 2. Matching Engine & Recovery State Machine tests
node backend/scripts/test_recovery_and_matching.js

# 3. Complete 7-point Buildathon Scenario Checklist
node backend/scripts/validate_scenarios.js
```

---

## 8. Buildathon Evaluation Alignment

| Evaluation Criterion | Implementation Evidence in PeerPulse |
| :--- | :--- |
| **Problem Taste** | Solves India's credit-invisible MSME problem with alternate telemetry rather than toy credit-score mockups. Strict RBI compliance embedded into data models. |
| **Build Quality** | 13 API endpoints, 5 Mongoose schemas, 5 Bull jobs, PyMuPDF, NetworkX, and Recharts integrated seamlessly into a unified monorepo. |
| **AI Judgment** | LLM used specifically where it excels (semantic reasoning on forensic anomalies). Scoring, EWS, matching, and recovery are 100% deterministic and explainable. |
| **Failure Recovery** | Complete 5-stage default management pipeline with multi-channel retry schedules, OTS lender voting, and pro-rata wallet distributions. |
