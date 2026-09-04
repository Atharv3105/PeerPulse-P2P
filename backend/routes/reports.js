const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/sql');

const REPORTS_DIR = path.join(__dirname, '../sql/reports');

const REPORT_CATALOG = [
  {
    id: 'par-aging',
    number: '01',
    name: 'Portfolio at Risk (PAR) & DPD Aging Matrix',
    moduleType: 'Delinquency & Provisioning',
    file: '01_portfolio_at_risk_aging.sql',
    category: 'Regulatory Portfolio Surveillance',
    description: 'Calculates sectoral delinquency exposure, DPD aging buckets (Current, SMA-0, SMA-1, SMA-2, NPA), PAR-30 ratio, and penal interest accrued across MSME sectors.'
  },
  {
    id: 'lender-concentration',
    number: '02',
    name: 'Lender Exposure & RBI Concentration Audit',
    moduleType: 'Regulatory Compliance & Exposure',
    file: '02_lender_diversification_concentration.sql',
    category: 'Statutory Exposure Audit',
    description: 'Uses Window Functions (DENSE_RANK, SUM() OVER) to detect single-borrower exposure cap breaches (≤ ₹50,000) and platform lender ceilings (≤ ₹10 Lakhs).'
  },
  {
    id: 'ots-waterfall',
    number: '03',
    name: 'Restructuring Ballot Weighted Consensus Waterfall',
    moduleType: 'Restructuring State Machine',
    file: '03_ots_voting_consensus_waterfall.sql',
    category: 'Debt Resolution Governance',
    description: 'Common Table Expressions (CTEs) rolling up fractional lender voting ballots weighted by capital share, comparing against the statutory 60% approval threshold.'
  },
  {
    id: 'recovery-ledger',
    number: '04',
    name: 'Pro-Rata Recovery Distribution & Nodal Escrow Waterfall',
    moduleType: 'Nodal Escrow & Resolution',
    file: '04_pro_rata_recovery_distribution_ledger.sql',
    category: 'Financial Ledger & Escrow Audit',
    description: 'Multi-table financial audit verifying gross delinquency recovery, platform resolution fee deduction (3%), and net pro-rata credits to fractional investor wallets.'
  },
  {
    id: 'credit-migration',
    number: '05',
    name: 'ACIE Credit Score Migration & EWS Surveillance',
    moduleType: 'Underwriting & Risk Telemetry',
    file: '05_borrower_credit_migration_matrix.sql',
    category: 'Early Warning Surveillance',
    description: '5-Dimensional telemetry surveillance tracking cashflow volatility, GST filing discrepancies, and automated Early Warning Signal (EWS) action codes.'
  }
];

// 1. GET /api/reports - Catalog of available enterprise reports
router.get('/', (req, res) => {
  res.json({
    dialect: sequelize.getDialect().toUpperCase(),
    totalReports: REPORT_CATALOG.length,
    reports: REPORT_CATALOG.map(r => {
      const sqlPath = path.join(REPORTS_DIR, r.file);
      const rawSql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf8') : '';
      return {
        ...r,
        rawSql
      };
    })
  });
});

// 2. GET /api/reports/:id/execute - Run complex SQL query live & measure performance
router.get('/:id/execute', async (req, res) => {
  const { id } = req.params;
  const reportDef = REPORT_CATALOG.find(r => r.id === id || r.number === id);

  if (!reportDef) {
    return res.status(404).json({ error: `Report '${id}' not found in catalog.` });
  }

  const sqlPath = path.join(REPORTS_DIR, reportDef.file);
  if (!fs.existsSync(sqlPath)) {
    return res.status(404).json({ error: `SQL report file ${reportDef.file} not found.` });
  }

  try {
    const rawSql = fs.readFileSync(sqlPath, 'utf8');
    const cleanSql = rawSql
      .replace(/--.*$/gm, '')
      .replace(/WITH ROLLUP/gi, '')
      .trim();

    const startTime = process.hrtime.bigint();
    const [rows] = await sequelize.query(cleanSql);
    const endTime = process.hrtime.bigint();
    const executionTimeMs = Number(endTime - startTime) / 1000000;

    const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

    res.json({
      reportId: reportDef.id,
      number: reportDef.number,
      name: reportDef.name,
      moduleType: reportDef.moduleType,
      category: reportDef.category,
      dialect: sequelize.getDialect().toUpperCase(),
      executionTimeMs: Math.round(executionTimeMs * 100) / 100,
      rowCount: rows ? rows.length : 0,
      columns,
      data: rows || [],
      rawSql
    });
  } catch (error) {
    console.error(`[SQL Reports Error] Failed executing ${reportDef.file}:`, error);
    res.status(500).json({
      error: 'SQL Execution Error',
      details: error.message,
      report: reportDef.name
    });
  }
});

module.exports = router;
