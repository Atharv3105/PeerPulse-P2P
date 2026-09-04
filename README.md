# PeerPulse (v2.0)
> **"Credit where credit is actually due."**  
> *Next-Generation Alternate Credit Intelligence, RBI-Compliant Fractional P2P Lending & Enterprise Relational Reporting Architecture*

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-6.0-purple.svg)](https://vitejs.dev/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.10-yellow.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/dual--database-MongoDB%20%7C%203NF%20SQL-orange.svg)](https://www.sqlite.org/)
[![AI Engine](https://img.shields.io/badge/AI%20Copilot-Google%20Gemini%202.5-crimson.svg)](https://deepmind.google/technologies/gemini/)
[![Regulatory Compliance](https://img.shields.io/badge/RBI%20Compliance-NBFC--P2P%20Master%20Directions-success.svg)](https://www.rbi.org.in/)

---

## 1. Executive Summary & The Problem

India is home to over **63 million Micro, Small, and Medium Enterprises (MSMEs)** contributing ~30% of the nation's GDP and nearly 45% of manufacturing exports. Yet **>80% remain credit invisible** due to a lack of conventional collateral, audited financials, or legacy CIBIL histories. This creates a formal financing deficit exceeding **₹25 Trillion ($300B+)**, forcing small businesses to rely on informal moneylenders charging usurious rates of 36%–60% p.a.

Traditional commercial banks reject over **60% of MSME applicants at initial screening** because conventional credit bureaus cannot parse digital-first operational signals (UPI transaction flows, GST e-invoices, bank statement forensics).

**PeerPulse** solves this credit-gap crisis through five core innovations:
1. **Alternate Credit Intelligence Engine (ACIE):** Multidimensional underwriting powered by bank statement forensic telemetry (font and bounding box tampering detection), NetworkX directed graph cycle analysis for UPI collusion detection, and automated GSTR-1/GSTR-3B revenue reconciliation.
2. **RBI-Compliant Fractional Pooling Architecture:** Automatically splits loan requests into fractional tranches (₹25,000 increments) distributed across retail investors, strictly enforcing statutory caps (₹50K single borrower cap, ₹10L aggregate exposure cap, 0% Default Loss Guarantee).
3. **Dual-Database Architecture (Document Store + 3NF Relational Data Warehouse):** MongoDB Atlas for unstructured underwriting telemetry and live state machines paired with a normalized 12-table **Third Normal Form (3NF) Relational SQL Warehouse** for institutional-grade financial ledgers, ACID transactions, and compliance auditing.
4. **Enterprise SQL Reporting Suite (SSRS / Crystal Reports Spec):** Built-in analytical reporting console running 5 mission-critical financial queries (Portfolio at Risk DPD aging matrix, RBI concentration audit, restructuring consensus voting waterfalls, pro-rata recovery ledger, and early warning surveillance).
5. **Interactive Portfolio Time Machine & AI Risk Copilot:** Real-time forward delinquency simulation engine paired with an AI Credit Risk Copilot powered by Google Gemini 2.5 for context-aware portfolio stress testing.

---

## 2. System Architecture & Tech Stack

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  PeerPulse Frontend                    │
                                  │    React 18 • Vite • Tailwind CSS • Recharts • Lucide  │
                                  └───────┬──────────────┬──────────────┬──────────────┬───┘
                                          │              │              │              │
                   Borrower Portal ───────┘              │              │              └────── Public Transparency & Metrics
                   Lender Portal ────────────────────────┘              └───────────────────── System Admin & SQL Reports
                                          │
                                  ┌───────▼────────────────────────────────────────────────┐
                                  │              Backend API Gateway (Port 3001)           │
                                  │       Node.js • Express • Mongoose • Sequelize ORM     │
                                  │    Server-Sent Events (SSE) • Bull Queue • Webhooks    │
                                  └───────┬──────────────────────┬─────────────────────┬───┘
                                          │                      │                     │
                ┌─────────────────────────▼────────┐   ┌─────────▼────────────┐  ┌─────▼───────────────────────────┐
                │        ACIE Underwriting         │   │   Document Store     │  │   3NF Relational SQL Warehouse  │
                │      Python 3.10+ • FastAPI      │   │   MongoDB Atlas      │  │   Sequelize (SQLite / MySQL)    │
                │  (PyMuPDF • NetworkX • Pandas)   │   │                      │  │   12 Normalized Tables          │
                └─────────────────────────┬────────┘   │  • Unstructured KYC  │  │   3 Stored Procedures           │
                                          │            │  • Live Audit Trails │  │   5 SSRS Reporting Queries      │
                ┌─────────────────────────▼────────┐   │  • Dynamic Telemetry │  │   ACID Fractional Ledgers       │
                │     AI Credit Risk Copilot       │   └──────────────────────┘  └─────────────────────────────────┘
                │   Google Gemini 2.5 Flash / Pro  │
                │   (Portfolio-Aware Reasoning)    │
                └──────────────────────────────────┘
```

### Core Technologies

| Subsystem | Stack & Tooling | Purpose & Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend UI/UX** | React 18, Vite 6, Tailwind CSS, Recharts, Lucide Icons | Responsive multi-portal application with ACIE radial meters, diversification donuts, interactive simulation dock, and real-time SSE syncing. |
| **Backend Gateway** | Node.js, Express.js, Sequelize ORM, Mongoose, UUID | Asynchronous RESTful routing, fractional investment matching, 5-stage delinquency state machine, and Server-Sent Events (SSE) multi-tab synchronization. |
| **Relational Data Warehouse** | SQLite 3 / MySQL 8 (Sequelize 3NF Schema) | Production-grade 3NF schema, ACID stored procedures, strict `FOREIGN KEY` referential integrity, and sub-20ms SSRS analytical queries. |
| **ACIE Microservice** | Python 3.10+, FastAPI, PyMuPDF, NetworkX, Pandas | Forensic PDF bounding-box extraction, font inconsistency detection, Directed MultiDiGraph circular cycle detection ($A \to B \to A$), and GST cross-validation. |
| **AI Risk Copilot** | Google Gemini 2.5 (`@google/genai`) + Heuristic Fallback | Context-aware underwriting and portfolio stress testing with grounded loan metadata, sector exposure analysis, and zero-downtime deterministic fallback. |
| **Event & Queue Pipeline** | In-Memory EventBus & Bull Queue Worker Suite | Real-time event broadcasting (`portfolio-updated`, `repayment-received`), 24h EWS surveillance cron, and automated delinquency lifecycle transitions. |

---

## 3. Five-Dimensional ACIE Underwriting Specification

The Alternate Credit Intelligence Engine calculates a deterministic composite score between **300 and 900**:

$$\text{rawScore} = 0.30 \cdot \text{CashFlow} + 0.25 \cdot \text{UPIGraph} + 0.20 \cdot \text{GSTFiling} + 0.15 \cdot \text{Operational} + 0.10 \cdot \text{AATelemetry}$$

$$\text{finalScore} = \min(\max(\text{rawScore}, 300), 900)$$

| Dimension | Weight | Primary Data Source | Forensic Analysis & Validation Logic | Fraud / Anomaly Flagging |
| :--- | :---: | :--- | :--- | :--- |
| **Cash Flow Velocity** | 30% | 12-Month Bank Statement PDF | Parses credit/debit velocity, net retention ratio, bounce frequency, and average monthly balances. | **Layer-1 Forensic Scan**: PyMuPDF scans PDF bounding boxes, detects mismatched fonts (`helv`, `courier`), and flags cracked PDF editor producer signatures. |
| **UPI Network Graph** | 25% | UPI Transaction Ledger CSV | Builds directed `MultiDiGraph` via NetworkX analyzing counterparty volume and distribution. | **Cycle Detection (DFS)**: Flags circular routing loops ($A \to B \to A$ within 72h, $<5\%$ amount variance) and repetitive uniform transactions ($\ge 23$ identical amounts). |
| **GST Reconciliation** | 20% | GSTR-1 / GSTR-3B filings | Reconciles declared monthly sales against verifiable bank statement cash receipts. | **Layer-2 Semantic Check**: Revenue deltas $>40\%$ trigger a revenue inflation flag and down-grade risk tiers. |
| **Operational Signals** | 15% | Google Business & Udyam | Scrapes customer review volume, sentiment trajectory, operating vintage, and full-time employee counts. | Sudden drops in customer sentiment or mismatched Udyam categories trigger automated underwriting flags. |
| **Account Aggregator** | 10% | ReBIT-Schema Consent Stream | Cryptographic bank telemetry feed validating recurring debit mandates and penal narrations. | Hard-scans transaction narrations for hidden EMI default markers (`RET-INW`, `NACH-FAIL`). |

---

## 4. Enterprise 3NF Relational SQL & SSRS Reporting Engine

In addition to the MongoDB document store, PeerPulse includes a complete **Third Normal Form (3NF) Relational SQL Architecture** (`backend/sql/schema.sql`) equipped with stored procedures, ACID transactions, and an interactive **SQL Reports & Analytics Console** accessible via the System Admin portal (`/admin/sql-reports`).

### 12 Normalized Relational Tables

```
├── borrowers                  (Master MSME borrower entity, GSTIN, Udyam, address)
├── lenders                    (Master retail investor entity, wallet balance, risk appetite)
├── loans                      (Master loan applications, terms, interest rates, status)
├── loan_score_breakdowns      (5-dimension ACIE telemetry scores, 1:1 with loans)
├── tranches                   (Fractional ₹25K escrow allocations, N:1 with loans & lenders)
├── repayments                 (Amortization schedules, DPD, 18% penal interest accrual)
├── collection_attempts        (e-NACH auto-debit sweeps, HDFC gateway response codes)
├── restructure_proposals      (Stage 3 Moratorium & OTS ballots, 60% threshold)
├── restructure_votes          (Fractional lender ballot voting ledger)
├── recovery_distributions     (Stage 5 gross recovery proceeds, 3% platform fee)
├── lender_distribution_splits (Pro-rata investor recovery credits)
└── audit_logs                 (Immutable financial compliance and ledger audit trail)
```

### 3 ACID Stored Procedures (`stored_procedures.sql`)
1. `sp_fund_tranche`: Performs atomic fractional tranche allocation with row-level locking (`FOR UPDATE`), verifying both single-borrower (≤ ₹50K) and aggregate platform (≤ ₹10L) RBI statutory exposure limits.
2. `sp_apply_daily_penal_interest`: Nightly batch reconciliation routine calculating daily compound penal interest (18% p.a. / 365 = 0.0493% per day) on overdue principal and transitioning accounts across SMA-0, SMA-1, SMA-2, and NPA states.
3. `sp_distribute_ots_recovery`: Executes Stage 5 recovery waterfalls upon One-Time Settlement (OTS) consensus, deducting the 3% statutory platform recovery fee and pro-rata distributing proceeds to investor wallets.

### 5 Complex SQL Enterprise Reporting Queries (SSRS / Crystal Reports Spec)

| Report | Script Path | Core Techniques | Financial Purpose | Latency |
| :--- | :--- | :--- | :--- | :---: |
| **01: Portfolio at Risk (PAR) Aging** | `backend/sql/reports/01_portfolio_at_risk_aging.sql` | `CASE WHEN` Dynamic Aging Buckets, Aggregations, Sector Rollups | Buckets delinquent loans into Current, SMA-0 (1-30 DPD), SMA-1 (31-60 DPD), SMA-2 (61-90 DPD), and NPA (>90 DPD) with PAR-30 and NPA percentages. | **~9 ms** |
| **02: Lender RBI Concentration Audit** | `backend/sql/reports/02_lender_diversification_concentration.sql` | Window Functions: `DENSE_RANK()`, `SUM() OVER(PARTITION BY)` | Audits lender portfolios against RBI single-borrower caps (₹50k) and identifies portfolio concentration risks. | **~17 ms** |
| **03: Restructuring Ballot Waterfall** | `backend/sql/reports/03_ots_voting_consensus_waterfall.sql` | Common Table Expressions (CTEs), Pro-Rata Weighting | Evaluates investor voting consensus for distressed MSME restructuring proposals against the statutory 60% approval threshold. | **~2 ms** |
| **04: Pro-Rata Recovery Ledger** | `backend/sql/reports/04_pro_rata_recovery_distribution_ledger.sql` | 5-Table `INNER JOIN`, Financial Decimal Precision Math | Generates auditor-ready pro-rata recovery ledger calculating gross recovery, 3% platform fee deduction, and investor recovery efficiency. | **~1 ms** |
| **05: ACIE Credit Score Migration** | `backend/sql/reports/05_borrower_credit_migration_matrix.sql` | Multi-Metric Heuristics, Dynamic Case Evaluation | Combines dimensional underwriting scores with live loan performance to flag deteriorating credits for Early Warning Surveillance (EWS). | **~8 ms** |

> **Interactive Query Console**: Open `/admin/sql-reports` in the app to run any query live, observe microsecond execution benchmarks, view formatted syntax-highlighted T-SQL code, toggle dark terminal mode, and export audit datasets to CSV.

---

## 5. Enterprise-Scale Dataset

To reflect a production enterprise lending marketplace, PeerPulse includes an enterprise dataset generator and pre-seeded database:
- **180 MSME Borrowers**: Spanning 10 distinct Indian manufacturing and service sectors (Auto Ancillary, Textiles, Agro-Processing, Pharmaceuticals, Precision Engineering, FMCG, Electronics, Leather, Chemicals, Renewable Energy).
- **150 Retail Lenders**: Spanning Conservative, Moderate, and Aggressive risk profiles.
- **322 Loan Facilities**: Categorized across 4 credit grades (Grade A: 12.5% p.a. to Grade D: 22.0% p.a.).
- **1,677 Fractional Tranches**: Demonstrating fractional diversification and zero-DLG risk pooling.
- **316 Repayment Ledgers**: Featuring healthy, delayed, restructuring, and settled amortization schedules.

---

## 6. RBI Regulatory Guardrails Enforced in Code

1. **Strict 0% Default Loss Guarantee (DLG):** Per RBI Master Directions for NBFC-P2P platforms, platform funds are never pledged to guarantee principal or interest. All credit risk is distributed directly to lenders.
2. **Aggregate Lender Exposure Cap:** Maximum ₹10,00,000 across all P2P platforms per retail lender, verified and hard-blocked at wallet funding.
3. **Single Borrower Exposure Cap:** Maximum ₹50,000 allocation from any single lender to any single MSME borrower.
4. **Permitted Loan Tenures & Amounts:** Unsecured commercial loans from ₹25,000 to ₹50,00,000 with standardized 3, 6, 9, 12, 24, and 36-month tenures.
5. **Stage 1–5 Delinquency Lifecycle:**
   - **Stage 1 (Performing):** DPD = 0, standard amortization.
   - **Stage 2 (Overdue / SMA-0 & 1):** 1–60 DPD, 18% p.a. penal interest accrues daily, automated e-NACH retries on Days 3, 7, 15, and 25.
   - **Stage 3 (Restructuring & Moratorium):** 61–90 DPD (SMA-2), borrower can propose a 2-month moratorium or One-Time Settlement (OTS). Requires a 60% fractional lender vote to pass.
   - **Stage 4 (NPA Classification):** >90 DPD, loan classified as Non-Performing Asset per RBI prudential norms, legal notice dispatched.
   - **Stage 5 (Recovery Waterfall):** Recovery proceeds distributed pro-rata to investors after deducting a 3% platform resolution fee.
6. **Statutory Public Disclosures:** Real-time NPA percentages, portfolio grade distributions, and sector concentrations available publicly on `/metrics` without authentication.

---

## 7. Portals & Application Pages

| Portal / Route | Key Features & Workflow Capabilities |
| :--- | :--- |
| **Borrower Portal** (`/borrower`) | 7-step loan underwriting wizard, pre-fill buttons for demo scenarios, real-time ACIE scoring radar, live repayment schedules, distress moratorium requests, and OTS proposal submissions. |
| **Lender Portal** (`/lender`) | Auto-invest rule engine, fractional matching, diversification donut, wallet management, active loan portfolio tracking, and interactive OTS restructuring ballot voting. |
| **Admin & Risk Ops** (`/admin`) | Flagged application queue with side-by-side forensic PDF inspection, manual simulation event triggers, live EWS surveillance feed, and loan health telemetry. |
| **SQL Reports Console** (`/admin/sql-reports`) | Dedicated enterprise analytics bench executing the 5 complex SQL reports with millisecond execution benchmarks, syntax viewer, and instant CSV export. |
| **Institutional Portal** (`/institutional`) | FLDG-compliant co-lending syndication dashboard for institutional NBFC partners. |
| **Public Marketplace** (`/marketplace`) | Searchable marketplace displaying 300+ loan listings with sector filtering, ACIE score badges, risk grade indicators, and funding progress bars. |
| **Statutory Metrics** (`/metrics`) | Real-time public disclosure dashboard fulfilling RBI transparency norms (gross disbursals, active NPA %, recovery rates, sector exposures). |

---

## 8. Interactive Simulation Lab & AI Risk Copilot

Located in the persistent floating dock at the bottom-right of the application:

### 1. Portfolio Time Machine
Advance simulated platform time by **+30 Days**, **+60 Days**, **+90 Days (NPA Trigger)**, or trigger a **Macro Industry Shock**:
- Automatically compounds 18% p.a. penal interest on overdue principal.
- Transitions delinquent accounts across SMA-0, SMA-1, SMA-2, and NPA states.
- Triggers active OTS ballots for retail lenders.
- Broadcasts updates across open browser tabs via Server-Sent Events (SSE).

### 2. Payment Gateway & Webhook Tester
- Trigger simulated **Razorpay payment gateway webhooks** (`payment.captured`, `payment.failed`).
- Fire automated **e-NACH mandate debit batches** to test clearing and bounce workflows.

### 3. AI Credit Risk Copilot
An interactive conversational copilot powered by **Google Gemini 2.5** (`@google/genai`):
- **Portfolio-Aware Grounding**: Automatically injects active portfolio stats (capital deployed, weighted yield, sector concentration, top borrower exposure, and PAR metrics) into the context window.
- **Scenario Stress Testing**: Ask questions like *"What happens if automotive ancillary defaults surge by 15%?"* or *"Analyze Amit Deshmukh's OTS settlement offer vs legal recovery"*.
- **Deterministic Heuristic Fallback**: Operates with full analytical depth even in offline environments or when API keys are unconfigured.

---

## 9. Quickstart & Installation

### Prerequisites
- **Node.js** `>= 18.x` & **npm** `>= 9.x`
- **Python** `>= 3.10`
- **MongoDB** running locally on `mongodb://localhost:27017` (or MongoDB Atlas connection URI)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Atharv3105/PeerPulse-P2P.git
cd PeerPulse-P2P

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Python ACIE dependencies
cd ../acie
pip install fastapi uvicorn pymupdf networkx pandas pydantic
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/peerpulse
DATABASE_URL=sqlite:./data/peerpulse.sqlite
GEMINI_API_KEY=your_gemini_api_key_here  # Optional: AI Copilot operates with deterministic fallback if omitted
```

### 3. Initialize & Seed Databases

```bash
cd backend

# 1. Seed base persona accounts (Priya, Ravi, Kumar, Amit, Vikram)
npm run seed

# 2. Seed enterprise dataset (322 loans, 180 borrowers across 10 sectors)
npm run seed:enterprise

# 3. Initialize and seed 3NF Relational SQL Warehouse
npm run seed:sql

# 4. Benchmark test the 5 complex SQL reporting queries
npm run test:sql
```

### 4. Launch Services

Run each component in a separate terminal:

**Terminal 1 — Python ACIE Microservice:**
```bash
cd acie
python main.py
# Running on http://localhost:8000
```

**Terminal 2 — Backend API Gateway:**
```bash
cd backend
npm start
# Running on http://localhost:3001
```

**Terminal 3 — Frontend React Portal:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 10. Evaluator Demonstration Walkthrough

Use the **"Demo Personas"** selector in the top navigation bar to test key workflows:

### Scenario 1: Priya Sharma (Prime MSME — Instant Underwriting & Funding)
1. Select **"Priya Sharma (Surat)"** in the top navbar.
2. Navigate to **Borrower Portal ➔ "Apply for Loan"**. Click the top **"Pre-fill: Priya (Grade A)"** button.
3. Advance through the 7-step wizard:
   - **Step 2 (Statement)**: Forensic scan verifies statement as **AUTHENTIC** (₹34.2L turnover, 0 bounces).
   - **Step 3 (GST)**: Declared GST turnover reconciles with bank receipts within 2%.
   - **Step 4 (UPI Graph)**: Clean graph topology with 0 circular loops.
   - **Step 6 (Score Reveal)**: **ACIE Score: 810 (Grade A • Prime • 13.5% p.a.)**.
   - **Step 7**: Listed on the public marketplace.
4. Switch persona to **"Vikram Sethi"** (Retail Lender) ➔ Open **Lender Portal**.
5. Priya's loan appears in the auto-match queue ➔ Click **"Confirm ₹25,000"** to fund a fractional tranche within RBI limits.

### Scenario 2: Ravi Kumar Verma (Subprime MSME — GST Delta & Loop Detection)
1. Select **"Ravi Verma"** ➔ Open **Apply for Loan** ➔ Click **"Pre-fill: Ravi (Grade C)"**.
2. In Step 2, upload statement: 2 EMI bounces detected.
3. In Step 3, Layer-2 check flags: **"GST Discrepancy: Bank receipts exceed GSTR-1 turnover by 47.1% (>40% threshold)"**.
4. In Step 4, UPI Graph detects **3 circular routing loops ($A \to B \to A$) and 23 repetitive uniform amounts**.
5. Step 6 reveals **ACIE Score: 590 (Grade C • Subprime • 19.5% p.a.)** with cautionary risk warnings.

### Scenario 3: Kumar Chandran (PDF Forgery — Automated Quarantine)
1. Select **"Kumar Chandran"** ➔ Click **"Pre-fill: Kumar (Forged)"**.
2. In Step 2, PyMuPDF forensic scanner flags:
   - Metadata tampered using an unregistered cracked PDF editor.
   - Multiple mismatched fonts across ledger columns (`helv`, `times-roman`, `courier`).
   - Vertically misaligned numeric characters.
3. Engine returns **`FORGED`** ➔ Loan is immediately **`BLOCKED`** and excluded from the marketplace.
4. Switch to **Admin Portal ➔ Flagged Applications Queue** to inspect the side-by-side forensic breakdown.

### Scenario 4: Amit Deshmukh (Default, Restructuring & Settlement Ballot)
1. Open the floating **Simulation Lab** in the bottom-right corner ➔ Advance time by **+60 Days**.
2. Amit Deshmukh's loan (`LN-AMIT-710`) transitions to `DELAYED` (SMA-2) with 18% penal interest accruing.
3. Switch persona to **Amit Deshmukh** ➔ Open **Borrower Portal** ➔ Distress banner appears ➔ Submit an **OTS Settlement Proposal (₹3,50,000)**.
4. Switch persona to **Vikram Sethi** ➔ Open **Lender Portal** ➔ An active OTS ballot appears.
5. Cast vote: **"Approve Settlement"**. When fractional approval surpasses the statutory 60% threshold, the loan transitions to `SETTLED`.

### Scenario 5: System Admin & Financial Auditor (SQL Reporting Suite)
1. Switch persona to **System Admin / Risk Ops**.
2. Click **"SQL Reports"** in the top navigation (`/admin/sql-reports`).
3. Select **Report 01 (Portfolio at Risk Aging)** ➔ Click **"Run Live Query"**.
4. Observe sub-10ms execution benchmarks, inspect the underlying `CASE WHEN` dynamic aggregation, toggle **"Dark Terminal"** mode, and click **"Export CSV"** for an audit-ready dataset.
5. Select **Report 03 (Restructuring Ballot Consensus)** to observe real-time fractional voting calculations using Common Table Expressions (CTEs).

---

## 11. Automated Test Suites

Verify all subsystems from the repository root:

```bash
# 1. ACIE Python Underwriting & Forensic Scanner Tests
python acie/test_acie.py

# 2. Matching Engine, RBI Caps & Recovery State Machine Tests
node backend/scripts/test_recovery_and_matching.js

# 3. 5 Complex Relational SQL Reporting Benchmark Tests
node backend/scripts/test_sql_reports.js

# 4. Frontend Production Build Verification
npm --prefix frontend run build
```

---

## 12. Cloud Deployment & Resiliency

- **Backend API Gateway**: Deployed on **Render** (Node.js runtime). Configured with `sqlite3@5.1.7` ensuring native compatibility across Debian/Ubuntu LTS container glibc versions (`GLIBC_2.28+`), backed by a decoupled fallback database initialization engine in `backend/config/database.js`.
- **Frontend Portal**: Production-optimized Vite build, deployable on **Vercel**, **Render**, or **Netlify**.
- **Security & Secret Protection**: Zero hardcoded API keys or credentials in source code or git history. All sensitive credentials (`MONGO_URI`, `GEMINI_API_KEY`) are managed strictly through environment variables.

---

## 13. License & Acknowledgments

Distributed under the **MIT License**. Built for the **Razorpay AI Buildathon 2026** (Open Track).

*Special thanks to the Open Source communities behind FastAPI, PyMuPDF, NetworkX, Sequelize, and Recharts for providing the foundational tooling that makes credit transparency accessible to India's 63 million MSMEs.*
