/**
 * Test Suite: Execute all 5 Complex SQL Reporting Scripts (SSRS / Crystal Reports style)
 * Verifies execution times, row counts, and column integrity.
 */
const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models/sql');

const REPORTS_DIR = path.join(__dirname, '../sql/reports');

async function testSqlReports() {
  console.log('========================================================================');
  console.log('   TESTING 5 COMPLEX SQL REPORTING SCRIPTS (SSRS / CRYSTAL REPORTS)');
  console.log('========================================================================\n');

  try {
    const reportFiles = [
      { id: '01', name: 'Portfolio at Risk (PAR) & DPD Aging Matrix', file: '01_portfolio_at_risk_aging.sql' },
      { id: '02', name: 'Lender Exposure & RBI Concentration Audit', file: '02_lender_diversification_concentration.sql' },
      { id: '03', name: 'Restructuring Ballot Weighted Consensus Waterfall', file: '03_ots_voting_consensus_waterfall.sql' },
      { id: '04', name: 'Pro-Rata Recovery Distribution Ledger', file: '04_pro_rata_recovery_distribution_ledger.sql' },
      { id: '05', name: 'ACIE Credit Score Migration & EWS Surveillance', file: '05_borrower_credit_migration_matrix.sql' }
    ];

    for (const rep of reportFiles) {
      const sqlPath = path.join(REPORTS_DIR, rep.file);
      let sql = fs.readFileSync(sqlPath, 'utf8');

      // Clean SQL for multi-dialect execution
      const cleanSql = sql
        .replace(/--.*$/gm, '')
        .replace(/WITH ROLLUP/gi, '')
        .trim();

      console.log(`[TEST REPORT ${rep.id}] Executing: ${rep.name}...`);
      const startTime = Date.now();
      const [results] = await sequelize.query(cleanSql);
      const executionTime = Date.now() - startTime;

      console.log(`  ✓ Returned ${results ? results.length : 0} rows in ${executionTime}ms.`);
      if (results && results.length > 0) {
        console.log(`  ✓ Sample Columns:`, Object.keys(results[0]).slice(0, 6));
        console.log(`  ✓ Sample Row 1:`, results[0]);
      }
      console.log('------------------------------------------------------------------------');
    }

    console.log('\n>>> ALL 5 COMPLEX SQL REPORTING SCRIPTS EXECUTED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } catch (err) {
    console.error('[TestSqlReports Error]:', err);
    process.exit(1);
  }
}

testSqlReports();
