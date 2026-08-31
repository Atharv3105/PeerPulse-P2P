const express = require('express');
const router = express.Router();
const LoanApplication = require('../models/LoanApplication');
const LoanRepayment = require('../models/LoanRepayment');
const Borrower = require('../models/Borrower');
const Lender = require('../models/Lender');
const MatchingEngine = require('../services/matchingEngine');
const eventBus = require('../services/eventBus');
const { v4: uuidv4 } = require('uuid');

// GET /api/loans - Marketplace listing
router.get('/', async (req, res) => {
  try {
    const { grade, sector, tenure, minRoi, maxRoi } = req.query;
    const query = { status: 'LISTED' };

    if (grade) query['acieScore.grade'] = grade;
    if (sector && sector !== 'all') query.businessCategory = sector;
    if (tenure) query.tenure = Number(tenure);

    const loans = await LoanApplication.find(query).populate('borrowerId').sort({ createdAt: -1 });

    const formatted = loans.map(l => ({
      applicationId: l.applicationId,
      _id: l._id,
      borrowerName: l.borrowerId?.name || 'Verified MSME',
      businessName: l.borrowerId?.businessName || 'Enterprise',
      loanAmount: l.loanAmount,
      tenure: l.tenure,
      purpose: l.purpose,
      sector: l.businessCategory,
      interestRate: l.interestRate || (l.acieScore?.grade === 'A' ? 13.5 : l.acieScore?.grade === 'B' ? 16.0 : 19.5),
      grade: l.acieScore?.grade || 'B',
      score: l.acieScore?.total || 700,
      fundedAmount: l.fundingStatus?.funded || 0,
      targetAmount: l.fundingStatus?.target || l.loanAmount,
      percentFunded: l.fundingStatus?.percentFunded || 0,
      remainingAmount: Math.max(0, (l.fundingStatus?.target || l.loanAmount) - (l.fundingStatus?.funded || 0)),
      lenderCount: l.fundingStatus?.lenders?.length || 0,
      fraudRiskFlag: l.acieScore?.fraudRiskFlag || 'None',
      fraudFlags: l.acieScore?.fraudFlags || [],
      positiveFactors: l.acieScore?.explainability?.positiveFactors || [],
      negativeFactors: l.acieScore?.explainability?.negativeFactors || [],
      createdAt: l.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/loans/:id - Single loan details
router.get('/:id', async (req, res) => {
  try {
    const loan = await LoanApplication.findOne({
      $or: [{ applicationId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    }).populate('borrowerId').populate('repayment');

    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/apply - New loan application submission with ACIE scoring
router.post('/apply', async (req, res) => {
  try {
    const {
      borrowerId,
      name,
      businessName,
      businessCategory,
      loanAmount,
      tenure,
      purpose,
      udyamNumber,
      gstNumber,
      acieScoreData
    } = req.body;

    // 1. Find or create Borrower
    let borrower = null;
    if (borrowerId) {
      borrower = await Borrower.findOne({
        $or: [{ borrowerId }, { _id: borrowerId.match(/^[0-9a-fA-F]{24}$/) ? borrowerId : null }]
      });
    }

    if (!borrower) {
      borrower = await Borrower.create({
        borrowerId: uuidv4(),
        name: name || 'MSME Borrower',
        mobile: req.body.mobile || '+919876543210',
        businessName: businessName || 'Enterprise Store',
        businessCategory: businessCategory || 'retail',
        udyamNumber: udyamNumber || 'UDYAM-GJ-01-001928',
        gstNumber: gstNumber || '24AABCP1928K1Z5',
        platformTrustScore: 85
      });
    }

    // 2. Validate Regulatory Constraints
    const amount = Number(loanAmount);
    if (amount < 25000 || amount > 5000000) {
      return res.status(400).json({ error: 'Loan amount must be between ₹25,000 and ₹50,00,000 (RBI cap)' });
    }

    const validTenures = [3, 6, 9, 12, 24, 36];
    const parsedTenure = Number(tenure);
    if (!validTenures.includes(parsedTenure)) {
      return res.status(400).json({ error: 'Tenure must be 3, 6, 9, 12, 24, or 36 months only' });
    }

    // 3. Determine status from ACIE Score
    const acie = acieScoreData || {
      total: 810,
      grade: 'A',
      breakdown: { cashflow: 85, upi: 78, gst: 90, operational: 70, aaData: 65 },
      fraudFlags: [],
      confidence: 'High',
      fraudRiskFlag: 'None',
      dataCompleteness: 95,
      explainability: {
        positiveFactors: ['Consistent cash flows', 'High GST compliance'],
        negativeFactors: [],
        improvementTips: []
      }
    };

    let status = 'LISTED';
    if (acie.forgeryResult?.forgeryGrade === 'FORGED' || acie.fraudRiskFlag === 'Block') {
      status = 'BLOCKED';
    } else if (acie.grade === 'DECLINED' || acie.total < 550) {
      status = 'DECLINED';
    }

    const applicationId = `LN-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 4. Create LoanApplication
    const loan = await LoanApplication.create({
      applicationId,
      borrowerId: borrower._id,
      borrowerUuid: borrower.borrowerId,
      loanAmount: amount,
      tenure: parsedTenure,
      purpose: purpose || 'Working Capital Expansion',
      businessCategory: businessCategory || borrower.businessCategory,
      interestRate: acie.grade === 'A' ? 13.5 : acie.grade === 'B' ? 16.0 : 19.5,
      acieScore: acie,
      fundingStatus: {
        funded: 0,
        target: amount,
        percentFunded: 0,
        lenders: []
      },
      status
    });

    // 5. Create initial Repayment record
    const repayment = await LoanRepayment.create({
      loanId: loan._id,
      status: 'ACTIVE',
      dpd: 0,
      penalInterestAccrued: 0,
      monthlyEmi: Math.round(amount / parsedTenure),
      outstandingPrincipal: amount,
      nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    loan.repayment = repayment._id;
    await loan.save();

    borrower.activeApplications.push(loan._id);
    await borrower.save();

    res.status(201).json({
      applicationId: loan.applicationId,
      loanId: loan._id,
      status: loan.status,
      acieScore: loan.acieScore,
      isListed: loan.status === 'LISTED'
    });
  } catch (err) {
    console.error('[Loan Apply Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/match - Fractional Matching Engine
router.post('/match', async (req, res) => {
  try {
    const { lenderId } = req.body;
    if (!lenderId) return res.status(400).json({ error: 'lenderId is required' });

    const matchedListings = await MatchingEngine.getMatchesForLender(lenderId);
    res.json({ matchedListings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/fund-tranche - Execute Tranche Investment
router.post('/fund-tranche', async (req, res) => {
  try {
    const { lenderId, applicationId, amount } = req.body;
    if (!lenderId || !applicationId || !amount) {
      return res.status(400).json({ error: 'lenderId, applicationId, and amount are required' });
    }

    const result = await MatchingEngine.fundTranche(lenderId, applicationId, amount);
    
    // Broadcast live SSE sync event across all browser clients
    eventBus.broadcast('tranche_funded', {
      applicationId,
      lenderId,
      amount: Number(amount),
      fundingStatus: result.fundingStatus,
      status: result.status,
      timestamp: new Date().toISOString()
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
