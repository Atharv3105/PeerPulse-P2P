const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Borrower = require('../models/Borrower');
const Lender = require('../models/Lender');
const LoanApplication = require('../models/LoanApplication');
const LoanRepayment = require('../models/LoanRepayment');
const MatchingEngine = require('../services/matchingEngine');
const RecoveryEngine = require('../services/recoveryEngine');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peerpulse';

async function runTests() {
  console.log('================ MATCHING & RECOVERY STATE MACHINE TESTS ================');
  await mongoose.connect(MONGO_URI);

  // 1. Test Matching Engine for Ananya (Moderate, Textile)
  const ananya = await Lender.findOne({ name: 'Ananya Roy' });
  const matchesAnanya = await MatchingEngine.getMatchesForLender(ananya.lenderId);
  console.log(`[TEST 1] Ananya (Moderate, Textile) Matches: ${matchesAnanya.length} loan(s). Grades: ${matchesAnanya.map(m => m.grade).join(', ')}`);
  assert(matchesAnanya.every(m => ['A', 'B'].includes(m.grade)), 'Moderate lender must only match Grade A and B');

  // 2. Test Matching Engine for Karan (Aggressive, Any Sector)
  const karan = await Lender.findOne({ name: 'Karan Singhal' });
  const matchesKaran = await MatchingEngine.getMatchesForLender(karan.lenderId);
  console.log(`[TEST 2] Karan (Aggressive) Matches: ${matchesKaran.length} loan(s). Grades: ${matchesKaran.map(m => m.grade).join(', ')}`);
  assert(matchesKaran.some(m => m.grade === 'C'), 'Aggressive lender should match Grade C loans');

  // 3. Test Fund Tranche on Priya's Loan
  const priyaLoan = await LoanApplication.findOne({ applicationId: 'LN-PRIYA-810' });
  const initialKaranBalance = karan.walletBalance;

  const fundResult = await MatchingEngine.fundTranche(karan.lenderId, priyaLoan.applicationId, 25000);
  console.log(`[TEST 3] Fund Tranche Result: Tranche=${fundResult.trancheId}, NewFundedPercent=${fundResult.newFundingPercent}%, Deducted=${fundResult.walletDeducted}`);
  assert(fundResult.walletDeducted === 25000);
  assert(fundResult.remainingWalletBalance === initialKaranBalance - 25000);

  // 4. Test RBI Per-Borrower Cap Enforcement (> ₹50k on same borrower)
  let capErrorThrown = false;
  try {
    const vikram = await Lender.findOne({ name: 'Vikram Sethi' });
    // Vikram already has 50k on Priya. Attempting another 25k should throw
    await MatchingEngine.fundTranche(vikram.lenderId, priyaLoan.applicationId, 25000);
  } catch (err) {
    capErrorThrown = true;
    console.log(`[TEST 4] RBI Per-Borrower Cap Enforced Correctly: "${err.message}"`);
  }
  assert(capErrorThrown, 'RBI 50k per borrower cap must block additional investments');

  // 5. Test Payment Failed Webhook on Amit's Loan
  const amitLoan = await LoanApplication.findOne({ applicationId: 'LN-AMIT-710' });
  const failResult = await RecoveryEngine.handlePaymentFailed(amitLoan._id, 'NACH_MOCK');
  console.log(`[TEST 5] Payment Failed: Status=${failResult.newStatus}, PenalRate=${failResult.penalInterestRate * 100}%, RetryDays=${failResult.retryScheduleDays}`);
  assert(failResult.newStatus === 'DELAYED');
  assert(failResult.penalInterestAccrued > 0);

  // 6. Test Restructuring: Moratorium
  const moratResult = await RecoveryEngine.applyRestructure(amitLoan._id, null, 'MORATORIUM', { months: 2 });
  console.log(`[TEST 6] Moratorium Applied: Option=${moratResult.option}, Status=${moratResult.status}, Months=${moratResult.months}`);
  assert(moratResult.status === 'APPLIED');

  // 7. Test Restructuring: OTS & Voting
  const otsResult = await RecoveryEngine.applyRestructure(amitLoan._id, null, 'OTS', { proposedAmount: 350000 });
  console.log(`[TEST 7A] OTS Proposal Created: RestructureId=${otsResult.restructureId}, Status=${otsResult.status}`);
  assert(otsResult.status === 'PENDING_VOTE');

  // Lender votes
  const vikram = await Lender.findOne({ name: 'Vikram Sethi' });
  const vote1 = await RecoveryEngine.voteOTS(otsResult.restructureId, vikram.lenderId, 'APPROVE');
  console.log(`[TEST 7B] Vikram voted APPROVE: CurrentApproval=${vote1.currentApprovalPct}%, Status=${vote1.status}`);

  const vote2 = await RecoveryEngine.voteOTS(otsResult.restructureId, ananya.lenderId, 'APPROVE');
  console.log(`[TEST 7C] Ananya voted APPROVE: CurrentApproval=${vote2.currentApprovalPct}%, Status=${vote2.status}`);
  assert(vote2.currentApprovalPct >= 60);
  assert(vote2.status === 'APPROVED');

  // 8. Test Pro-Rata Recovery Distribution (Stage 5)
  const distResult = await RecoveryEngine.distributeRecovery(amitLoan._id, 350000);
  console.log(`[TEST 8] Pro-Rata Distribution: Gross=${distResult.grossRecovered}, Fee=${distResult.recoveryFee}, NetDistributed=${distResult.netDistributed}, LendersCount=${distResult.lenderDistributions.length}`);
  assert(distResult.recoveryFee === 10500); // 3% of 350000
  assert(distResult.netDistributed === 339500);

  // 9. Test NPA Classification
  const npaResult = await RecoveryEngine.classifyNPA(amitLoan._id);
  console.log(`[TEST 9] NPA Classification: Status=${npaResult.status}, DPD=${npaResult.dpd}, BorrowerSuspended=${npaResult.borrowerSuspended}`);
  assert(npaResult.status === 'NPA');
  assert(npaResult.classified === true);

  console.log('\n>>> ALL MATCHING & RECOVERY TESTS PASSED 100% SUCCESFULLY! <<<');
  process.exit(0);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Assertion Failed: ${message}`);
    process.exit(1);
  }
}

runTests();
