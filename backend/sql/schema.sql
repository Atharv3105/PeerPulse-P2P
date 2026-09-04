-- ============================================================================
-- PEERPULSE P2P LENDING — ENTERPRISE RELATIONAL DATABASE SCHEMA (3NF)
-- Designed for: MySQL 8.0+ / Microsoft SQL Server 2019+ / SQLite3
-- Regulatory Standards: RBI Master Direction - NBFC-P2P Lending Platform Directions
-- Core Focus: 3NF Normalization, Referential Integrity, ACID Financial Transactions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE: borrowers
-- Master record for verified Indian MSME enterprises
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS borrowers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_id VARCHAR(64) NOT NULL UNIQUE,          -- External UUID (e.g. BOR-PRIYA-001)
    name VARCHAR(120) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    aadhaar_verified BOOLEAN DEFAULT TRUE,
    business_name VARCHAR(200) NOT NULL,
    business_category VARCHAR(50) NOT NULL,           -- 'textile', 'manufacturing', 'retail', 'services', etc.
    udyam_number VARCHAR(50),                         -- MSME Registration
    gst_number VARCHAR(20),                           -- 15-digit GSTIN
    city VARCHAR(100) DEFAULT 'Mumbai',
    state VARCHAR(100) DEFAULT 'Maharashtra',
    platform_trust_score INT DEFAULT 80,              -- 0–100; drops to 0 on 90+ DPD NPA
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_borrowers_category (business_category),
    INDEX idx_borrowers_trust_score (platform_trust_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 2. TABLE: lenders
-- Master record for retail fractional lenders & institutional pools
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lenders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lender_id VARCHAR(64) NOT NULL UNIQUE,            -- External UUID (e.g. LEN-VIKRAM-001)
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL,
    risk_appetite VARCHAR(30) NOT NULL,               -- 'Conservative', 'Moderate', 'Aggressive'
    sector_preference VARCHAR(50) DEFAULT 'any',
    denomination_preference INT DEFAULT 25000,        -- Standard ₹25,000 fractional tranche
    wallet_balance DECIMAL(15,2) DEFAULT 500000.00,   -- Pre-funded Nodal Escrow balance
    total_exposure DECIMAL(15,2) DEFAULT 0.00,        -- RBI statutory cap: ≤ ₹10,00,000
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_lenders_risk (risk_appetite),
    INDEX idx_lenders_exposure (total_exposure)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. TABLE: loans
-- Underwritten loan applications listed for fractional syndication
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL UNIQUE,       -- External UUID (e.g. LN-PRIYA-810)
    borrower_id INT NOT NULL,
    loan_amount DECIMAL(12,2) NOT NULL,               -- ₹25,000 to ₹50,00,000
    target_amount DECIMAL(12,2) NOT NULL,
    funded_amount DECIMAL(12,2) DEFAULT 0.00,
    tenure_months INT NOT NULL,                       -- 3, 6, 9, 12, 24, or 36 months
    interest_rate DECIMAL(5,2) NOT NULL,              -- 13.50% to 19.50% p.a.
    purpose VARCHAR(255) NOT NULL,
    business_category VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,                       -- 'A', 'B', 'C', 'DECLINED'
    score INT NOT NULL,                               -- ACIE Score: 300 to 900
    status VARCHAR(30) DEFAULT 'LISTED',              -- 'SCORING','LISTED','FUNDED','ACTIVE','CLOSED','BLOCKED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE RESTRICT,
    INDEX idx_loans_status (status),
    INDEX idx_loans_grade (grade),
    INDEX idx_loans_category (business_category),
    INDEX idx_loans_tenure (tenure_months),
    CONSTRAINT chk_loan_amount CHECK (loan_amount >= 25000 AND loan_amount <= 5000000),
    CONSTRAINT chk_loan_grade CHECK (grade IN ('A', 'B', 'C', 'DECLINED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 4. TABLE: loan_score_breakdowns
-- 5-Dimensional ACIE Telemetry Scores (1:1 with loans)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_score_breakdowns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL UNIQUE,
    cashflow_score INT DEFAULT 0,                     -- Dimension 1: 0-100
    upi_score INT DEFAULT 0,                          -- Dimension 2: 0-100
    gst_score INT DEFAULT 0,                          -- Dimension 3: 0-100
    operational_score INT DEFAULT 0,                  -- Dimension 4: 0-100
    aa_data_score INT DEFAULT 0,                      -- Dimension 5: 0-100
    data_completeness INT DEFAULT 90,
    fraud_risk_flag VARCHAR(20) DEFAULT 'None',       -- 'None', 'Caution', 'Block'
    forgery_grade VARCHAR(20) DEFAULT 'AUTHENTIC',    -- 'AUTHENTIC', 'SUSPICIOUS', 'FORGED'
    forgery_reason TEXT,
    positive_factors JSON,                            -- JSON array of strings
    negative_factors JSON,                            -- JSON array of strings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 5. TABLE: tranches
-- Fractional loan investment allocations by retail lenders (Many-to-One)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tranches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tranche_id VARCHAR(64) NOT NULL UNIQUE,           -- External ID (e.g. TR-VIK-01)
    loan_id INT NOT NULL,
    lender_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 25000.00,   -- Fractional tranche commitment
    funded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'ACTIVE',              -- 'ACTIVE', 'SETTLED', 'WRITTEN_OFF'
    
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
    FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE RESTRICT,
    INDEX idx_tranches_loan (loan_id),
    INDEX idx_tranches_lender (lender_id),
    INDEX idx_tranches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 6. TABLE: repayments
-- Loan repayment ledgers, DPD tracking, and penal interest calculation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repayments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL UNIQUE,
    status VARCHAR(30) DEFAULT 'ACTIVE',              -- 'ACTIVE','DELAYED','AT_RISK','NPA','SETTLED','CLOSED'
    dpd INT DEFAULT 0,                                -- Days Past Due
    monthly_emi DECIMAL(12,2) DEFAULT 0.00,
    outstanding_principal DECIMAL(12,2) NOT NULL,
    penal_interest_rate DECIMAL(5,4) DEFAULT 0.1800,  -- 18.00% p.a.
    penal_interest_accrued DECIMAL(12,2) DEFAULT 0.00,
    last_penal_calculated_at DATETIME,
    next_payment_due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
    INDEX idx_repayments_status (status),
    INDEX idx_repayments_dpd (dpd),
    CONSTRAINT chk_repayment_dpd CHECK (dpd >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 7. TABLE: collection_attempts
-- Audit log of automated e-NACH auto-debit sweep attempts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    repayment_id INT NOT NULL,
    attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(30) DEFAULT 'NACH',                -- 'NACH', 'MANUAL', 'LEGAL'
    outcome VARCHAR(30) NOT NULL,                     -- 'SUCCESS', 'FAILED', 'SCHEDULED'
    amount_attempted DECIMAL(12,2) NOT NULL,
    channel VARCHAR(60) DEFAULT 'HDFC_NACH_GATEWAY',
    notes TEXT,
    
    FOREIGN KEY (repayment_id) REFERENCES repayments(id) ON DELETE CASCADE,
    INDEX idx_attempts_outcome (outcome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 8. TABLE: restructure_proposals
-- Stage 3 loan restructuring proposals (Moratorium, Extension, OTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restructure_proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restructure_id VARCHAR(64) NOT NULL UNIQUE,       -- External UUID (e.g. RES-AMIT-OTS)
    repayment_id INT NOT NULL,
    option_type VARCHAR(30) NOT NULL,                 -- 'MORATORIUM', 'TENURE_EXTENSION', 'OTS'
    proposed_amount DECIMAL(12,2),
    moratorium_months INT DEFAULT 0,
    new_tenure_months INT DEFAULT 0,
    approval_percentage DECIMAL(5,2) DEFAULT 0.00,    -- Weighted consensus threshold: 60%
    status VARCHAR(30) DEFAULT 'PENDING_VOTE',        -- 'APPLIED', 'PENDING_VOTE', 'APPROVED', 'REJECTED'
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    
    FOREIGN KEY (repayment_id) REFERENCES repayments(id) ON DELETE CASCADE,
    INDEX idx_proposals_status (status),
    INDEX idx_proposals_type (option_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 9. TABLE: restructure_votes
-- Fractional lender voting ledger for restructuring ballots
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restructure_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    lender_id INT NOT NULL,
    vote VARCHAR(20) NOT NULL,                        -- 'APPROVE', 'REJECT'
    tranche_share DECIMAL(5,2) NOT NULL,              -- Weighted voting weight percentage
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proposal_id) REFERENCES restructure_proposals(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_proposal_lender_vote (proposal_id, lender_id),
    INDEX idx_votes_vote (vote)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 10. TABLE: recovery_distributions
-- Stage 5 pro-rata recovery ledger and statutory fee deductions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recovery_distributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    repayment_id INT NOT NULL,
    total_recovered DECIMAL(12,2) NOT NULL,
    recovery_fee DECIMAL(12,2) NOT NULL,              -- 3.00% platform resolution fee
    net_distributed DECIMAL(12,2) NOT NULL,
    recovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (repayment_id) REFERENCES repayments(id) ON DELETE RESTRICT,
    INDEX idx_recovery_date (recovered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 11. TABLE: lender_distribution_splits
-- Pro-rata breakdown credited to individual fractional lenders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lender_distribution_splits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distribution_id INT NOT NULL,
    lender_id INT NOT NULL,
    original_exposure DECIMAL(12,2) NOT NULL,
    gross_share DECIMAL(12,2) NOT NULL,
    net_received DECIMAL(12,2) NOT NULL,
    outstanding_loss DECIMAL(12,2) DEFAULT 0.00,
    credited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (distribution_id) REFERENCES recovery_distributions(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE RESTRICT,
    INDEX idx_splits_lender (lender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 12. TABLE: audit_logs
-- Immutable compliance and administrative audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(80) NOT NULL,
    target_id VARCHAR(80) NOT NULL,
    previous_state JSON,
    new_state JSON,
    performed_by VARCHAR(100) DEFAULT 'SYSTEM',
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_action (action),
    INDEX idx_audit_target (target_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
