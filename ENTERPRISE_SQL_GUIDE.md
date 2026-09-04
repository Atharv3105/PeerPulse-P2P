# 🎓 ENTERPRISE SQL ARCHITECTURE & TECHNICAL PLAYBOOK
**Focus Area**: SQL Application Support & Relational Database Engineering  
**Core Stack**: Microsoft SQL Server (T-SQL) • MySQL • SQLite (3NF) • SSRS / Crystal Reports  
**Project Defense**: PeerPulse Relational SQL Architecture & Enterprise Reporting Engine  

---

## 🏢 1. Role Alignment: Enterprise SQL Application Support & Engineering

Enterprise ERPs, financial institutions, and real estate investment accounting platforms depend heavily on relational database foundations built on **Microsoft SQL Server (T-SQL), Oracle, and MySQL**.

Key engineering and support responsibilities in enterprise environments include:
1. **SQL Application Support**: Investigating client transaction discrepancies, fixing database integrity issues, resolving ledger locks and deadlocks.
2. **Writing Complex SQL Scripts for Reporting**: Building data queries for **SSRS (SQL Server Reporting Services)** and **Crystal Reports** (e.g. accounts receivable aging, loan balance waterfall, investor exposure audits).
3. **Performance Optimization & Measurement**: Identifying slow queries, analyzing execution plans (`EXPLAIN`), creating composite B-Tree indexes, and eliminating costly table scans.
4. **Unit Testing & Stored Procedures**: Writing and maintaining stored procedures, views, triggers, and ACID transactions.

> [!TIP]
> Architecture Summary:  
> **"PeerPulse — an RBI-compliant fractional P2P lending platform powered by an Enterprise 3NF Relational SQL Architecture and an SSRS-style analytical financial reporting suite."**


---

## 🗄️ 2. The Database Schema: 3NF Relational Architecture

You designed the database in **Third Normal Form (3NF)** with 12 normalized tables:

```
├── borrowers                  (Master MSME borrower entity, GSTIN, trust score)
├── lenders                    (Master retail investor entity, wallet, exposure)
├── loans                      (Loan applications, terms, interest rates, status)
├── loan_score_breakdowns      (5-layer ACIE dimensional telemetry scores, 1:1 with loans)
├── tranches                   (Fractional ₹25K escrow allocations, N:1 with loans/lenders)
├── repayments                 (Repayment ledgers, DPD, 18% penal accrual)
├── collection_attempts        (e-NACH auto-debit sweep logs, HDFC gateway outcome)
├── restructure_proposals      (Stage 3 Moratorium & OTS ballots, 60% threshold)
├── restructure_votes          (Fractional lender ballot voting ledger)
├── recovery_distributions     (Stage 5 gross recovery proceeds, 3% platform fee)
├── lender_distribution_splits (Pro-rata investor recovery credits)
└── audit_logs                 (Immutable financial compliance and system audit trail)
```

### Why 3NF?
- **1NF**: Atomic attributes, every row has a unique primary key (`id` / `borrower_id`).
- **2NF**: No partial dependencies on composite keys (all non-key columns depend on the entire primary key).
- **3NF**: Zero transitive dependencies (e.g., borrower address and GSTIN live in `borrowers`, not duplicated in `loans` or `tranches`).

---

## 📊 3. The 5 Complex SQL Reporting Scripts (SSRS / Crystal Reports)

You have implemented 5 production-grade SQL scripts in `backend/sql/reports/` and a live **SQL Reporting Console** in the web app (`/sql-reports`). Here is how to explain each one in your technical rounds:

### Report 01: Portfolio at Risk (PAR) & DPD Aging Matrix
* **Target Tool**: SSRS (SQL Server Reporting Services)
* **File**: `backend/sql/reports/01_portfolio_at_risk_aging.sql`
* **Core Techniques**: `CASE WHEN` Dynamic Aging Buckets, Multi-Table Inner Joins, Sector Rollups.
* **Why this is impressive**: In banking and real estate ERPs, accounts receivable aging is the #1 financial report. Instead of running 5 separate subqueries, you bucket DPD (`Current`, `1-30 DPD (SMA-0)`, `31-60 DPD (SMA-1)`, `61-90 DPD (SMA-2)`, `>90 DPD (NPA)`) in a single query scan using `SUM(CASE WHEN r.dpd BETWEEN 1 AND 30 THEN r.outstanding_principal ELSE 0 END)`, calculating PAR-30 and NPA ratios instantaneously.

### Report 02: Lender Concentration & RBI Statutory Audit
* **Target Tool**: SSRS / Crystal Reports
* **File**: `backend/sql/reports/02_lender_diversification_concentration.sql`
* **Core Techniques**: Window Functions (`ROW_NUMBER()`, `DENSE_RANK()`, `SUM() OVER(PARTITION BY lender_id)`), CTEs.
* **Why this is impressive**: Evaluates compliance against the RBI Master Direction (single-borrower cap ≤ ₹50,000, platform ceiling ≤ ₹10 Lakhs). You use `SUM(SUM(t.amount)) OVER(PARTITION BY lnd.id)` to compute the total active portfolio of each lender without a costly self-join or temp table, and `DENSE_RANK()` to rank each borrower's exposure within the lender's portfolio.

### Report 03: Restructuring Ballot Weighted Consensus Waterfall
* **Target Tool**: SSRS (SQL Server Reporting Services)
* **File**: `backend/sql/reports/03_ots_voting_consensus_waterfall.sql`
* **Core Techniques**: Common Table Expressions (CTEs), Pro-Rata Weighted Percentages, Deadlines evaluation.
* **Why this is impressive**: When an MSME proposes a One-Time Settlement (OTS), fractional lenders vote proportionally to their capital share. You use chained CTEs (`proposal_context` and `vote_tallies`) to compute the capital-weighted approval percentage and automatically trigger `PASSED_EXECUTE_OTS` if approval crosses the statutory 60% threshold.

### Report 04: Pro-Rata Recovery Distribution & Nodal Escrow Waterfall
* **Target Tool**: Crystal Reports / SSRS
* **File**: `backend/sql/reports/04_pro_rata_recovery_distribution_ledger.sql`
* **Core Techniques**: Multi-table `JOIN` across 5 entities, Precision Financial Decimal Arithmetic.
* **Why this is impressive**: Demonstrates real-world accounting reconciliation. It verifies the gross recovery amount, calculates the 3% platform resolution fee deduction, and reconciles the net pro-rata recovery credits distributed to each individual fractional lender.

### Report 05: ACIE Credit Score Migration & EWS Surveillance
* **Target Tool**: SSRS (SQL Server Reporting Services)
* **File**: `backend/sql/reports/05_borrower_credit_migration_matrix.sql`
* **Core Techniques**: Multi-dimensional surveillance, Early Warning Signal (EWS) action codes.
* **Why this is impressive**: Evaluates underwriting telemetry (cashflow score, UPI score, GST match score) to flag deteriorating borrowers before they default, categorizing them into action codes like `REQUIRE_WEEKLY_NACH_SWEEPS` or `ELIGIBLE_FOR_1.5%_RATE_DISCOUNT`.

---

## ⚡ 4. Stored Procedures & ACID Financial Transactions

Located in `backend/sql/stored_procedures.sql`:

1. **`sp_fund_tranche`**:
   - Uses `START TRANSACTION`, `SELECT ... FOR UPDATE` row-level pessimistic locking on the lender wallet and loan.
   - Programmatically checks if `current_borrower_exposure + tranche_amount > 50,000`. If so, rolls back with `CAP_EXCEEDED`.
   - Atomically debits wallet, inserts tranche ledger, increments loan funded balance, and writes to `audit_logs` in a single atomic commit.
2. **`sp_apply_daily_penal_interest`**:
   - Daily batch job computing daily penal interest: `(outstanding_principal * 0.18) / 365`.
   - Transitions DPD states: `1-30 DPD (DELAYED) -> 31-89 DPD (AT_RISK) -> 90+ DPD (NPA)`.
3. **`sp_distribute_ots_recovery`**:
   - Executes pro-rata waterfall recovery distribution, deducting the 3% fee and crediting investor balances.

---

## 🎯 5. Enterprise SQL Engineering & Support Technical Reference (Core Concepts & FAQs)

### Q1: What is the difference between `WHERE` and `HAVING`?
> **Answer**:  
> `WHERE` filters rows **before** aggregation and cannot operate on aggregate functions (e.g. `SUM`, `COUNT`). `HAVING` filters groups **after** aggregation has occurred with `GROUP BY`. In Report 03, we use `WHERE t.status = 'ACTIVE'` to filter rows first, and could use `HAVING SUM(t.amount) > 50000` to filter aggregated lender exposures.

### Q2: What is the difference between `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`?
> **Answer**:  
> All three are window ranking functions. If two rows have identical values:
> - `ROW_NUMBER()` assigns sequential unique integers with no ties (e.g. 1, 2, 3, 4).
> - `RANK()` assigns identical ranks to ties, but skips subsequent numbers (e.g. 1, 2, 2, 4).
> - `DENSE_RANK()` assigns identical ranks to ties without skipping numbers (e.g. 1, 2, 2, 3).  
> In Report 02, I used `DENSE_RANK() OVER (PARTITION BY lender_id ORDER BY SUM(amount) DESC)` so tied borrower exposures share the exact same top ranking.

### Q3: What is a CTE (Common Table Expression) and why prefer it over subqueries?
> **Answer**:  
> A CTE is a named temporary result set defined with `WITH cte_name AS (...)` preceding the main query.  
> Advantages:
> 1. **Readability & Maintenance**: Eliminates deeply nested, confusing subqueries.
> 2. **Modularity**: Can be referenced multiple times within the same query.
> 3. **Recursive Queries**: Enables traversing organizational hierarchies or ledger cascades.
> 4. **Query Optimization**: SQL Server and MySQL query optimizers can materialize or inline CTEs efficiently.

### Q4: Explain Clustered vs Non-Clustered Indexes.
> **Answer**:  
> - **Clustered Index**: Defines the actual physical order in which data is stored on disk (B-Tree leaf nodes contain the actual data rows). A table can have **only ONE** clustered index (typically the Primary Key `id`).
> - **Non-Clustered Index**: A separate B-Tree structure containing the indexed column keys and a pointer (Row Locator / Clustered Key) back to the actual data row. A table can have multiple non-clustered indexes.  
> In PeerPulse, we created non-clustered indexes on `repayments(status, dpd)` and `tranches(lender_id)` to ensure index seeks during delinquency lookups.

### Q5: What is an Index Seek vs Index Scan?
> **Answer**:  
> - **Index Seek**: The query engine traverses the B-Tree directly to locate qualifying rows using a selective filter (`WHERE id = 100` or `WHERE dpd > 30`). Highly efficient ($O(\log N)$).
> - **Index Scan**: The query engine reads every single page in the index because no selective predicate exists or statistics are stale. In support, our goal is converting expensive Index/Table Scans into selective Index Seeks.

### Q6: How do you troubleshoot a slow query reported by a client in SQL application support?
> **Answer**:  
> 1. Request the exact query, parameters, and database version.
> 2. Run `EXPLAIN` (MySQL) or **Display Actual Execution Plan** (SQL Server Management Studio - SSMS).
> 3. Look for red flags: **Table Scans**, **Index Scans**, high-cost **Nested Loops**, and **Implicit Data Type Conversions** (e.g. comparing VARCHAR to INT).
> 4. Check for missing indexes or outdated table statistics (`UPDATE STATISTICS`).
> 5. Review query structure: Ensure SARGable predicates (avoid functions on indexed columns like `WHERE YEAR(date) = 2026`, use `WHERE date >= '2026-01-01'` instead).

### Q7: What are ACID properties and how did you implement them?
> **Answer**:  
> - **Atomicity**: All operations in a transaction succeed or all are rolled back. (In `sp_fund_tranche`, wallet debit and tranche creation happen together or not at all).
> - **Consistency**: Referential integrity constraints and check constraints (`chk_loan_amount`, foreign keys) are never violated.
> - **Isolation**: Concurrent transactions do not interfere with each other (preventing double-spending via row-level locks `FOR UPDATE`).
> - **Durability**: Committed data survives system crashes via write-ahead logging (WAL / transaction log).

### Q8: What are Database Isolation Levels?
> **Answer**:  
> 1. **Read Uncommitted**: Suffers from Dirty Reads.
> 2. **Read Committed** (Default in SQL Server): Prevents Dirty Reads.
> 3. **Repeatable Read**: Prevents Dirty and Non-Repeatable Reads.
> 4. **Serializable**: Highest isolation; prevents Phantom Reads by locking range of keys.

### Q9: What is the difference between `UNION` and `UNION ALL`?
> **Answer**:  
> `UNION` combines result sets and performs an expensive sort to eliminate duplicate rows. `UNION ALL` combines results directly without deduplication, making it significantly faster. In financial audit reports where records must be preserved, `UNION ALL` is preferred.

### Q10: What is a Deadlock and how can you resolve or prevent it?
> **Answer**:  
> A deadlock occurs when Transaction A holds Lock 1 and waits for Lock 2, while Transaction B holds Lock 2 and waits for Lock 1. Neither can proceed.  
> **Prevention**:
> 1. Always access tables in the exact same sequence across all stored procedures (e.g. always lock `lenders` before `loans`).
> 2. Keep transactions short and concise.
> 3. Use appropriate isolation levels (e.g. Read Committed Snapshot Isolation in SQL Server).

---

## 💻 6. Demonstration & Auditing Walkthrough
 
1. **Open the Web App**: Navigate to `http://localhost:5173/admin/sql-reports` (or click **"SQL Reports (SSRS)"** in the top navigation).
2. **Explore the 5 Reports**: Click between Report 01 and Report 05.
3. **Query Execution Latency**:
   - Notice the query execution time is benchmarked between 1ms and 20ms directly from our relational database.
4. **Click "View SQL Code"**: Inspect the formatted T-SQL query:
   - CTE Usage: Common Table Expressions to roll up the voting ballot weights.
   - Window Functions: `DENSE_RANK()` and `SUM() OVER PARTITION BY` to evaluate lender concentration.
5. **Click "Export CSV"**: Generate exportable financial audit reports on the fly.
6. **Inspect Schema & Procedures**: Review `backend/sql/schema.sql` and `stored_procedures.sql` for DDL, constraints, foreign keys, and stored procedures.
