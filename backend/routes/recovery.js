const express = require('express');
const router = express.Router();
const RecoveryEngine = require('../services/recoveryEngine');
const LoanRepayment = require('../models/LoanRepayment');
const LoanApplication = require('../models/LoanApplication');

// POST /api/recovery/payment-failed
router.post('/payment-failed', async (req, res) => {
  try {
    const { loanId, webhookSource } = req.body;
    if (!loanId) return res.status(400).json({ error: 'loanId is required' });

    // Handle lookup by loanId or applicationId
    let actualLoanId = loanId;
    if (!loanId.match(/^[0-9a-fA-F]{24}$/)) {
      const loan = await LoanApplication.findOne({ applicationId: loanId });
      if (loan) actualLoanId = loan._id;
    }

    const result = await RecoveryEngine.handlePaymentFailed(actualLoanId, webhookSource || 'NACH_MOCK');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recovery/manual-trigger (Admin only)
router.post('/manual-trigger', async (req, res) => {
  try {
    const { loanId, targetStatus } = req.body;
    if (!loanId || !targetStatus) {
      return res.status(400).json({ error: 'loanId and targetStatus are required' });
    }

    const result = await RecoveryEngine.handleManualTrigger(loanId, targetStatus);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recovery/restructure
router.post('/restructure', async (req, res) => {
  try {
    const { loanId, borrowerId, option, params } = req.body;
    if (!loanId || !option) {
      return res.status(400).json({ error: 'loanId and option are required' });
    }

    let actualLoanId = loanId;
    if (!loanId.match(/^[0-9a-fA-F]{24}$/)) {
      const loan = await LoanApplication.findOne({ applicationId: loanId });
      if (loan) actualLoanId = loan._id;
    }

    const result = await RecoveryEngine.applyRestructure(actualLoanId, borrowerId, option, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recovery/ots-vote
router.post('/ots-vote', async (req, res) => {
  try {
    const { restructureId, lenderId, vote } = req.body;
    if (!restructureId || !vote) {
      return res.status(400).json({ error: 'restructureId and vote (APPROVE/REJECT) are required' });
    }

    const result = await RecoveryEngine.voteOTS(restructureId, lenderId, vote);
    res.json(result);
  } catch (err) {
    console.error('[OTS Vote Error]:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/recovery/distribute
router.post('/distribute', async (req, res) => {
  try {
    const { loanId, recoveredAmount } = req.body;
    if (!loanId || !recoveredAmount) {
      return res.status(400).json({ error: 'loanId and recoveredAmount are required' });
    }

    let actualLoanId = loanId;
    if (!loanId.match(/^[0-9a-fA-F]{24}$/)) {
      const loan = await LoanApplication.findOne({ applicationId: loanId });
      if (loan) actualLoanId = loan._id;
    }

    const result = await RecoveryEngine.distributeRecovery(actualLoanId, recoveredAmount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recovery/classify-npa
router.post('/classify-npa', async (req, res) => {
  try {
    const { loanId } = req.body;
    if (!loanId) return res.status(400).json({ error: 'loanId is required' });

    let actualLoanId = loanId;
    if (!loanId.match(/^[0-9a-fA-F]{24}$/)) {
      const loan = await LoanApplication.findOne({ applicationId: loanId });
      if (loan) actualLoanId = loan._id;
    }

    const result = await RecoveryEngine.classifyNPA(actualLoanId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recovery/repayment/:loanId
router.get('/repayment/:loanId', async (req, res) => {
  try {
    let query = { loanId: req.params.loanId };
    if (!req.params.loanId.match(/^[0-9a-fA-F]{24}$/)) {
      const loan = await LoanApplication.findOne({ applicationId: req.params.loanId });
      if (loan) query = { loanId: loan._id };
    }

    const repayment = await LoanRepayment.findOne(query).populate('loanId');
    if (!repayment) return res.status(404).json({ error: 'Repayment record not found' });
    res.json(repayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recovery/cibil-report/:loanId - Generate CIBIL/CRIF XML
router.get('/cibil-report/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    let actualLoanId = loanId;
    let loan = await LoanApplication.findById(loanId).populate('borrowerId');
    if (!loan) {
      loan = await LoanApplication.findOne({ applicationId: loanId }).populate('borrowerId');
    }
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const repayment = await LoanRepayment.findOne({ loanId: loan._id });
    const { generateCibilDefaultXml } = require('../services/bureauReportGenerator');

    const xml = generateCibilDefaultXml({
      borrowerId: loan.borrowerId?._id || 'BOR-REF',
      borrowerName: loan.borrowerId?.name || 'MSME Borrower',
      gstin: loan.borrowerId?.gstNumber,
      loanId: loan.applicationId,
      sanctionAmount: loan.loanAmount,
      outstandingPrincipal: repayment?.outstandingPrincipal || loan.loanAmount,
      dpd: repayment?.dpd || 90,
      classifiedDate: repayment?.recovery?.classifiedNpaAt || new Date().toISOString()
    });

    res.header('Content-Type', 'application/xml');
    res.attachment(`${loan.applicationId}-CIBIL-REPORT.xml`);
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

