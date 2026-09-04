/**
 * Enterprise Relational SQL Database Seeder
 * Ingests the 322 loans, 180 borrowers, 150 lenders, and ledgers into SQLite/MySQL tables.
 */
const fs = require('fs');
const path = require('path');
const {
  sequelize,
  Borrower,
  Lender,
  Loan,
  LoanScoreBreakdown,
  Tranche,
  Repayment,
  CollectionAttempt,
  RestructureProposal,
  RestructureVote,
  RecoveryDistribution,
  LenderDistributionSplit,
  AuditLog
} = require('../models/sql');

const DATA_DIR = fs.existsSync(path.join(__dirname, '../../data'))
  ? path.join(__dirname, '../../data')
  : path.join(__dirname, '../data');

async function seedSqlDatabase() {
  console.log('========================================================================');
  console.log('   PEERPULSE — INGESTING PRODUCTION RELATIONAL SQL DATASET');
  console.log(`   Database Dialect: ${sequelize.getDialect().toUpperCase()}`);
  console.log('========================================================================\n');

  try {
    // 1. Sync & Recreate tables with constraints
    console.log('[SeedSQL] Synchronizing relational schema and tables...');
    await sequelize.sync({ force: true });
    console.log('[SeedSQL] All 12 normalized tables created with constraints.');

    // 2. Load static files
    console.log('[SeedSQL] Ingesting static JSON datasets from:', DATA_DIR);
    const borrowersRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_borrowers.json'), 'utf8'));
    const lendersRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_lenders.json'), 'utf8'));
    const loansRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_loans.json'), 'utf8'));
    const repaymentsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'enterprise_repayments.json'), 'utf8'));

    // 3. Map & Insert Borrowers
    console.log(`[SeedSQL] Inserting ${borrowersRaw.length} Borrowers...`);
    const borrowerMap = new Map(); // uuid / mongo_id -> auto-increment ID
    for (let i = 0; i < borrowersRaw.length; i++) {
      const b = borrowersRaw[i];
      const created = await Borrower.create({
        borrower_id: b.borrowerId || `BOR-${i + 1}`,
        name: b.name,
        mobile: b.mobile,
        aadhaar_verified: b.aadhaarVerified !== false,
        business_name: b.businessName,
        business_category: b.businessCategory || 'retail',
        udyam_number: b.udyamNumber || null,
        gst_number: b.gstNumber || null,
        city: b.city || 'Mumbai',
        state: b.state || 'Maharashtra',
        platform_trust_score: b.platformTrustScore || 80
      });
      borrowerMap.set(b._id, created.id);
      borrowerMap.set(b.borrowerId, created.id);
    }

    // 4. Map & Insert Lenders
    console.log(`[SeedSQL] Inserting ${lendersRaw.length} Lenders...`);
    const lenderMap = new Map(); // uuid / mongo_id -> auto-increment ID
    for (let i = 0; i < lendersRaw.length; i++) {
      const l = lendersRaw[i];
      const created = await Lender.create({
        lender_id: l.lenderId || `LEN-${i + 1}`,
        name: l.name,
        email: l.email,
        mobile: l.mobile,
        risk_appetite: l.riskAppetite || 'Moderate',
        sector_preference: l.sectorPreference || 'any',
        denomination_preference: l.denominationPreference || 25000,
        wallet_balance: l.walletBalance || 500000.00,
        total_exposure: l.totalExposure || 0.00
      });
      lenderMap.set(l._id, created.id);
      lenderMap.set(l.lenderId, created.id);
    }

    // 5. Map & Insert Loans & Score Breakdowns & Tranches
    console.log(`[SeedSQL] Inserting ${loansRaw.length} Loans & Telemetry Breakdowns...`);
    const loanMap = new Map(); // uuid / mongo_id -> auto-increment ID
    for (let i = 0; i < loansRaw.length; i++) {
      const l = loansRaw[i];
      const borrowerPk = borrowerMap.get(l.borrowerId) || 1;
      const createdLoan = await Loan.create({
        application_id: l.applicationId,
        borrower_id: borrowerPk,
        loan_amount: l.loanAmount,
        target_amount: l.fundingStatus?.target || l.loanAmount,
        funded_amount: l.fundingStatus?.funded || 0.00,
        tenure_months: l.tenure,
        interest_rate: l.interestRate || (l.acieScore?.grade === 'A' ? 13.5 : l.acieScore?.grade === 'B' ? 16.0 : 19.5),
        purpose: l.purpose,
        business_category: l.businessCategory || 'manufacturing',
        grade: l.acieScore?.grade || 'B',
        score: l.acieScore?.total || 700,
        status: l.status || 'LISTED'
      });
      loanMap.set(l._id, createdLoan.id);
      loanMap.set(l.applicationId, createdLoan.id);

      // Score Breakdown
      if (l.acieScore) {
        await LoanScoreBreakdown.create({
          loan_id: createdLoan.id,
          cashflow_score: l.acieScore.breakdown?.cashflow || 70,
          upi_score: l.acieScore.breakdown?.upi || 70,
          gst_score: l.acieScore.breakdown?.gst || 70,
          operational_score: l.acieScore.breakdown?.operational || 70,
          aa_data_score: l.acieScore.breakdown?.aaData || 70,
          data_completeness: l.acieScore.dataCompleteness || 90,
          fraud_risk_flag: l.acieScore.fraudRiskFlag || 'None',
          forgery_grade: l.acieScore.forgeryResult?.forgeryGrade || 'AUTHENTIC',
          forgery_reason: l.acieScore.forgeryResult?.forgeryReason || 'Document metadata and typography validated authentic.',
          positive_factors: l.acieScore.explainability?.positiveFactors || [],
          negative_factors: l.acieScore.explainability?.negativeFactors || []
        });
      }

      // Tranches
      if (l.fundingStatus && Array.isArray(l.fundingStatus.lenders)) {
        for (let tIdx = 0; tIdx < l.fundingStatus.lenders.length; tIdx++) {
          const tr = l.fundingStatus.lenders[tIdx];
          const lenderPk = lenderMap.get(tr.lenderId) || 1;
          const trancheUniqueId = tr.trancheId 
            ? `${l.applicationId}-${tr.trancheId}` 
            : `TR-${createdLoan.id}-${tIdx + 1}`;
          await Tranche.create({
            tranche_id: trancheUniqueId,
            loan_id: createdLoan.id,
            lender_id: lenderPk,
            amount: tr.amount || 25000.00,
            status: 'ACTIVE'
          });
        }
      }
    }

    // 6. Map & Insert Repayments & Restructure Proposals
    console.log(`[SeedSQL] Inserting ${repaymentsRaw.length} Repayments & Restructuring Ballots...`);
    for (let i = 0; i < repaymentsRaw.length; i++) {
      const r = repaymentsRaw[i];
      const loanPk = loanMap.get(r.loanId);
      if (!loanPk) continue;

      const createdRepayment = await Repayment.create({
        loan_id: loanPk,
        status: r.status || 'ACTIVE',
        dpd: r.dpd || 0,
        monthly_emi: r.monthlyEmi || r.emiAmount || 25000.00,
        outstanding_principal: r.outstandingPrincipal || 400000.00,
        penal_interest_rate: r.penalInterestRate || 0.1800,
        penal_interest_accrued: r.penalInterestAccrued || 0.00,
        next_payment_due_date: r.nextPaymentDueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      });

      // Restructure Proposals
      if (r.restructurePlan) {
        const restId = (r.restructurePlan.restructureId === 'RES-AMIT-OTS' || i === 1)
          ? 'RES-AMIT-OTS'
          : (r.restructurePlan.restructureId ? `${r.restructurePlan.restructureId}-${createdRepayment.id}` : `RES-${createdRepayment.id}-OTS`);
        const prop = await RestructureProposal.create({
          restructure_id: restId,
          repayment_id: createdRepayment.id,
          option_type: r.restructurePlan.option || 'OTS',
          proposed_amount: r.restructurePlan.proposedAmount || 350000.00,
          moratorium_months: r.restructurePlan.moratoriumMonths || 0,
          new_tenure_months: r.restructurePlan.newTenure || 0,
          approval_percentage: r.restructurePlan.approvalPercentage || 40.00,
          status: r.restructurePlan.status || 'PENDING_VOTE',
          expires_at: r.restructurePlan.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // Add demo votes
        await RestructureVote.create({
          proposal_id: prop.id,
          lender_id: 1, // Vikram Sethi
          vote: 'APPROVE',
          tranche_share: 40.00
        });
      }

      // Collection attempts
      if (Array.isArray(r.collectionAttempts) && r.collectionAttempts.length > 0) {
        for (const ca of r.collectionAttempts) {
          await CollectionAttempt.create({
            repayment_id: createdRepayment.id,
            method: ca.method || 'NACH',
            outcome: ca.outcome || 'FAILED',
            amount_attempted: ca.amountAttempted || 25000.00,
            channel: ca.channel || 'HDFC_NACH_GATEWAY',
            notes: ca.notes || 'NACH auto-debit failure recorded'
          });
        }
      }
    }

    // 7. Seed Sample Stage 5 Recovery Distribution for Settled Delinquency
    const sampleRepayment = await Repayment.findOne({ where: { status: 'DELAYED' } });
    if (sampleRepayment) {
      const rec = await RecoveryDistribution.create({
        repayment_id: sampleRepayment.id,
        total_recovered: 350000.00,
        recovery_fee: 10500.00, // 3% platform fee
        net_distributed: 339500.00
      });
      await LenderDistributionSplit.create({
        distribution_id: rec.id,
        lender_id: 1,
        original_exposure: 50000.00,
        gross_share: 35000.00,
        net_received: 33950.00,
        outstanding_loss: 16050.00
      });
      await LenderDistributionSplit.create({
        distribution_id: rec.id,
        lender_id: 2,
        original_exposure: 50000.00,
        gross_share: 35000.00,
        net_received: 33950.00,
        outstanding_loss: 16050.00
      });
      await LenderDistributionSplit.create({
        distribution_id: rec.id,
        lender_id: 3,
        original_exposure: 25000.00,
        gross_share: 17500.00,
        net_received: 16975.00,
        outstanding_loss: 8025.00
      });
    }

    // 8. Initial Audit Log
    await AuditLog.create({
      action: 'SYSTEM_SQL_BULK_SEED',
      target_id: 'SYSTEM_RELATIONAL_MIGRATION',
      previous_state: { database: 'MongoDB' },
      new_state: { database: sequelize.getDialect().toUpperCase(), total_loans: loansRaw.length },
      performed_by: 'Yardi_Migration_Engine',
      reason: 'Migrated 322 loans and ledgers to 3NF Relational SQL Architecture.'
    });

    console.log('\n========================================================================');
    console.log('   RELATIONAL SQL SEEDING COMPLETE');
    console.log('========================================================================');
    console.log(`  ✓ Total Borrowers: ${await Borrower.count()}`);
    console.log(`  ✓ Total Lenders: ${await Lender.count()}`);
    console.log(`  ✓ Total Loans: ${await Loan.count()}`);
    console.log(`  ✓ Total Repayments: ${await Repayment.count()}`);
    console.log(`  ✓ Total Tranches: ${await Tranche.count()}`);
    console.log(`  ✓ Status Breakdown:`);
    console.log(`      • LISTED: ${await Loan.count({ where: { status: 'LISTED' } })}`);
    console.log(`      • ACTIVE: ${await Loan.count({ where: { status: 'ACTIVE' } })}`);
    console.log(`      • BLOCKED: ${await Loan.count({ where: { status: 'BLOCKED' } })}`);
    console.log(`      • DELAYED: ${await Repayment.count({ where: { status: 'DELAYED' } })}`);
    console.log(`      • AT_RISK: ${await Repayment.count({ where: { status: 'AT_RISK' } })}`);
    console.log(`      • NPA: ${await Repayment.count({ where: { status: 'NPA' } })}`);
    console.log('========================================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (err) {
    console.error('[SeedSQL] Error during SQL seeding:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  seedSqlDatabase();
}

module.exports = seedSqlDatabase;
