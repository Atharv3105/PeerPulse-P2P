/**
 * Enterprise Database Seeder
 * Ingests the pre-generated static files from data/ into MongoDB.
 * Ensures 100% idempotent seeding and schema integrity.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Borrower = require('../models/Borrower');
const Lender = require('../models/Lender');
const LoanApplication = require('../models/LoanApplication');
const LoanRepayment = require('../models/LoanRepayment');
const AuditLog = require('../models/AuditLog');

const DATA_DIR = path.join(__dirname, '../../data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peerpulse';

async function seedEnterpriseDatabase() {
  console.log('========================================================================');
  console.log('   PEERPULSE — INGESTING PRODUCTION-GRADE ENTERPRISE DATASET');
  console.log('========================================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[SeedEnterprise] Connected to MongoDB: ${MONGO_URI}`);

    // Load static files
    console.log('[SeedEnterprise] Loading static JSON datasets from data/ directory...');
    const borrowersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_borrowers.json'), 'utf8'));
    const lendersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_lenders.json'), 'utf8'));
    const loansData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_loans.json'), 'utf8'));
    const repaymentsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_repayments.json'), 'utf8'));

    // Clear existing collections cleanly
    console.log('[SeedEnterprise] Flushing existing database collections...');
    await Borrower.deleteMany({});
    await Lender.deleteMany({});
    await LoanApplication.deleteMany({});
    await LoanRepayment.deleteMany({});
    await AuditLog.deleteMany({});

    // Bulk Insert
    console.log(`[SeedEnterprise] Inserting ${borrowersData.length} Borrowers...`);
    await Borrower.insertMany(borrowersData);

    console.log(`[SeedEnterprise] Inserting ${lendersData.length} Lenders...`);
    await Lender.insertMany(lendersData);

    console.log(`[SeedEnterprise] Inserting ${loansData.length} Loan Applications...`);
    await LoanApplication.insertMany(loansData);

    console.log(`[SeedEnterprise] Inserting ${repaymentsData.length} Repayment Ledgers...`);
    await LoanRepayment.insertMany(repaymentsData);

    // Create Initial Audit Logs
    await AuditLog.create([
      {
        action: 'SYSTEM_BULK_SEED',
        targetId: loansData[0]?.applicationId || 'LN-PRIYA-810',
        performedBy: 'Enterprise_Data_Generator',
        reason: 'Enterprise mock dataset initialized with 28,900+ ReBIT transactions and 320+ multi-stage loans.',
        timestamp: new Date()
      }
    ]);

    console.log('\n========================================================================');
    console.log('   ENTERPRISE SEEDING COMPLETE');
    console.log('========================================================================');
    console.log(`  ✓ Total Borrowers: ${await Borrower.countDocuments()}`);
    console.log(`  ✓ Total Lenders: ${await Lender.countDocuments()}`);
    console.log(`  ✓ Total Loan Applications: ${await LoanApplication.countDocuments()}`);
    console.log(`  ✓ Total Repayment Ledgers: ${await LoanRepayment.countDocuments()}`);
    console.log(`  ✓ Status Breakdown:`);
    console.log(`      • LISTED: ${await LoanApplication.countDocuments({ status: 'LISTED' })}`);
    console.log(`      • ACTIVE: ${await LoanApplication.countDocuments({ status: 'ACTIVE' })}`);
    console.log(`      • BLOCKED: ${await LoanApplication.countDocuments({ status: 'BLOCKED' })}`);
    console.log(`      • DELAYED: ${await LoanRepayment.countDocuments({ status: 'DELAYED' })}`);
    console.log(`      • AT_RISK: ${await LoanRepayment.countDocuments({ status: 'AT_RISK' })}`);
    console.log(`      • NPA: ${await LoanRepayment.countDocuments({ status: 'NPA' })}`);
    console.log('========================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[SeedEnterprise] Error during seeding:', err);
    process.exit(1);
  }
}

seedEnterpriseDatabase();
