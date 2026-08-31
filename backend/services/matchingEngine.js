const LoanApplication = require('../models/LoanApplication');
const Lender = require('../models/Lender');
const { v4: uuidv4 } = require('uuid');

class MatchingEngine {
  /**
   * Returns matched loan listings for a given lender based on risk appetite,
   * sector, tenure, and regulatory exposure caps.
   */
  static async getMatchesForLender(lenderId) {
    const lender = await Lender.findOne({
      $or: [{ lenderId }, { _id: lenderId.match(/^[0-9a-fA-F]{24}$/) ? lenderId : null }]
    });

    if (!lender) {
      throw new Error(`Lender not found for identifier: ${lenderId}`);
    }

    // Risk tolerance filter
    let acceptableGrades = ['A'];
    if (lender.riskAppetite === 'Moderate') {
      acceptableGrades = ['A', 'B'];
    } else if (lender.riskAppetite === 'Aggressive') {
      acceptableGrades = ['A', 'B', 'C'];
    }

    // Query active/listed loans
    const query = {
      status: 'LISTED',
      'acieScore.grade': { $in: acceptableGrades }
    };

    // Sector preference filter (unless 'any')
    if (lender.sectorPreference && lender.sectorPreference !== 'any') {
      query.businessCategory = lender.sectorPreference;
    }

    // Tenure filter if specified
    if (lender.tenurePreference && lender.tenurePreference.length > 0) {
      query.tenure = { $in: lender.tenurePreference };
    }

    const eligibleLoans = await LoanApplication.find(query).populate('borrowerId');
    const matchedListings = [];

    for (const loan of eligibleLoans) {
      const remainingTarget = loan.fundingStatus.target - loan.fundingStatus.funded;
      if (remainingTarget <= 0) continue;

      // Calculate current exposure of this lender on this specific borrower
      let currentLenderExposureOnBorrower = 0;
      for (const l of loan.fundingStatus.lenders) {
        if (l.lenderId && l.lenderId.toString() === lender._id.toString()) {
          currentLenderExposureOnBorrower += (l.amount || 0);
        }
      }

      // Hard Cap 1: Max ₹50,000 per borrower
      const remainingBorrowerCap = Math.max(0, 50000 - currentLenderExposureOnBorrower);
      if (remainingBorrowerCap <= 0) continue;

      // Hard Cap 2: Platform aggregate cap ₹10,00,000
      const remainingGlobalCap = Math.max(0, 1000000 - lender.totalExposure);
      if (remainingGlobalCap <= 0) continue;

      // Tranche sizing based on lender denomination preference
      const pref = lender.denominationPreference || 25000;
      const trancheAvailable = Math.min(pref, remainingTarget, remainingBorrowerCap, remainingGlobalCap, lender.walletBalance);

      if (trancheAvailable > 0) {
        const roiMap = { 'A': 13.5, 'B': 16.0, 'C': 19.5 };
        const roi = loan.interestRate || roiMap[loan.acieScore?.grade] || 14.5;

        matchedListings.push({
          applicationId: loan.applicationId,
          loanId: loan._id,
          borrowerName: loan.borrowerId ? loan.borrowerId.name : 'Verified MSME',
          businessName: loan.borrowerId ? loan.borrowerId.businessName : 'Enterprise',
          grade: loan.acieScore?.grade || 'B',
          score: loan.acieScore?.total || 700,
          sector: loan.businessCategory,
          tenure: loan.tenure,
          loanAmount: loan.loanAmount,
          roi: roi,
          fundedAmount: loan.fundingStatus.funded,
          fundingPercent: Math.round((loan.fundingStatus.funded / loan.fundingStatus.target) * 100),
          trancheAvailable: trancheAvailable,
          trancheSize: pref,
          lenderCount: loan.fundingStatus.lenders.length,
          fraudRiskFlag: loan.acieScore?.fraudRiskFlag || 'None',
          positiveFactors: loan.acieScore?.explainability?.positiveFactors || []
        });
      }
    }

    return matchedListings;
  }

  /**
   * Fund a tranche for a loan with all RBI and portfolio concentration validations
   */
  static async fundTranche(lenderId, applicationId, amountToFund) {
    const lender = await Lender.findOne({
      $or: [{ lenderId }, { _id: lenderId.match(/^[0-9a-fA-F]{24}$/) ? lenderId : null }]
    });
    if (!lender) throw new Error('Lender not found');

    const loan = await LoanApplication.findOne({
      $or: [{ applicationId }, { _id: applicationId.match(/^[0-9a-fA-F]{24}$/) ? applicationId : null }]
    }).populate('borrowerId');
    if (!loan) throw new Error('Loan application not found');

    if (loan.status !== 'LISTED') {
      throw new Error(`Loan is not open for funding (status: ${loan.status})`);
    }

    const amount = Number(amountToFund);
    if (!amount || amount <= 0) {
      throw new Error('Invalid tranche amount');
    }

    // 1. Wallet Balance Check
    if (lender.walletBalance < amount) {
      throw new Error(`Insufficient wallet balance. Current balance: ₹${lender.walletBalance.toLocaleString('en-IN')}`);
    }

    // 2. Regulatory Hard Cap: ₹10,00,000 platform aggregate exposure
    if (lender.totalExposure + amount > 1000000) {
      throw new Error(`RBI Regulatory Limit: Total platform P2P exposure cannot exceed ₹10,00,000. Current: ₹${lender.totalExposure.toLocaleString('en-IN')}`);
    }

    // 3. Regulatory Hard Cap: ₹50,000 per borrower
    let existingExposureOnBorrower = 0;
    for (const l of loan.fundingStatus.lenders) {
      if (l.lenderId && l.lenderId.toString() === lender._id.toString()) {
        existingExposureOnBorrower += l.amount;
      }
    }
    if (existingExposureOnBorrower + amount > 50000) {
      throw new Error(`RBI Regulatory Limit: Per-borrower exposure cannot exceed ₹50,000. Current on this borrower: ₹${existingExposureOnBorrower.toLocaleString('en-IN')}`);
    }

    // 4. Overfunding Check
    const remainingToFund = loan.fundingStatus.target - loan.fundingStatus.funded;
    if (amount > remainingToFund) {
      throw new Error(`Amount exceeds remaining unfunded portion of loan (₹${remainingToFund.toLocaleString('en-IN')})`);
    }

    // Execute atomic-like funding update
    const trancheId = `TR-${uuidv4().substring(0, 8)}`;
    loan.fundingStatus.funded += amount;
    loan.fundingStatus.percentFunded = Math.round((loan.fundingStatus.funded / loan.fundingStatus.target) * 100);
    loan.fundingStatus.lenders.push({
      lenderId: lender._id,
      trancheId,
      amount,
      fundedAt: new Date()
    });

    if (loan.fundingStatus.funded >= loan.fundingStatus.target) {
      loan.status = 'FUNDED';
    }
    await loan.save();

    // Update Lender Document
    lender.walletBalance -= amount;
    lender.totalExposure += amount;
    lender.activeInvestments.push({
      loanId: loan._id,
      applicationId: loan.applicationId,
      trancheAmount: amount,
      fundedAt: new Date(),
      expectedReturnRate: loan.interestRate || 14.5,
      status: 'ACTIVE'
    });
    await lender.save();

    return {
      trancheId,
      applicationId: loan.applicationId,
      amountFunded: amount,
      newFundingPercent: loan.fundingStatus.percentFunded,
      isFullyFunded: loan.status === 'FUNDED',
      walletDeducted: amount,
      remainingWalletBalance: lender.walletBalance,
      totalExposure: lender.totalExposure
    };
  }
}

module.exports = MatchingEngine;
