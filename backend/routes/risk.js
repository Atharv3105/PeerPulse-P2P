const express = require('express');
const router = express.Router();
const LoanApplication = require('../models/LoanApplication');
const LoanRepayment = require('../models/LoanRepayment');
const AuditLog = require('../models/AuditLog');

// GET /api/risk/ews-flags
router.get('/ews-flags', async (req, res) => {
  try {
    const { severity, loanId } = req.query;
    const query = {};
    if (loanId) query.loanId = loanId;

    const repayments = await LoanRepayment.find(query).populate({
      path: 'loanId',
      populate: { path: 'borrowerId' }
    });

    const flatFlags = [];
    for (const rep of repayments) {
      for (const flag of rep.ewsFlags) {
        if (!severity || flag.severity === severity) {
          flatFlags.push({
            loanId: rep.loanId?._id,
            applicationId: rep.loanId?.applicationId,
            borrowerName: rep.loanId?.borrowerId?.name || 'MSME Borrower',
            businessName: rep.loanId?.borrowerId?.businessName || 'Enterprise',
            flagType: flag.type,
            severity: flag.severity,
            description: flag.description,
            triggeredAt: flag.triggeredAt,
            currentDpd: rep.dpd,
            status: rep.status,
            loanAmount: rep.loanId?.loanAmount
          });
        }
      }
    }

    res.json({ flags: flatFlags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/risk/flag-loan
router.post('/flag-loan', async (req, res) => {
  try {
    const { loanId, type, severity, description } = req.body;
    const repayment = await LoanRepayment.findOne({ loanId });
    if (!repayment) return res.status(404).json({ error: 'Repayment record not found' });

    repayment.ewsFlags.push({
      type,
      severity,
      description: description || `Manual risk flag raised: ${type}`,
      triggeredAt: new Date()
    });
    await repayment.save();

    res.json({ success: true, ewsFlags: repayment.ewsFlags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/risk/flagged-applications - Flagged Application Queue (SUSPICIOUS & FORGED)
router.get('/flagged-applications', async (req, res) => {
  try {
    const flagged = await LoanApplication.find({
      $or: [
        { status: 'BLOCKED' },
        { 'acieScore.fraudRiskFlag': { $in: ['Caution', 'Block'] } },
        { 'acieScore.forgeryResult.forgeryGrade': { $in: ['SUSPICIOUS', 'FORGED'] } }
      ]
    }).populate('borrowerId').sort({ createdAt: -1 });

    const formatted = flagged.map(f => ({
      applicationId: f.applicationId,
      _id: f._id,
      borrowerName: f.borrowerId?.name || 'Borrower',
      businessName: f.borrowerId?.businessName || 'Business',
      loanAmount: f.loanAmount,
      tenure: f.tenure,
      status: f.status,
      forgeryGrade: f.acieScore?.forgeryResult?.forgeryGrade || (f.status === 'BLOCKED' ? 'FORGED' : 'SUSPICIOUS'),
      forgeryReason: f.acieScore?.forgeryResult?.forgeryReason || f.acieScore?.fraudFlags?.[0] || 'Typography and metadata inconsistencies',
      acieScore: f.acieScore?.total,
      breakdown: f.acieScore?.breakdown,
      fraudFlags: f.acieScore?.fraudFlags || [],
      layoutAnomalies: f.acieScore?.forgeryResult?.layoutAnomalies || [],
      createdAt: f.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/risk/override - Admin Override with Audit Log
router.post('/override', async (req, res) => {
  try {
    const { applicationId, action, comment, newStatus } = req.body;
    if (!applicationId || !action || !comment) {
      return res.status(400).json({ error: 'applicationId, action (APPROVE/REJECT), and comment are required' });
    }

    const loan = await LoanApplication.findOne({
      $or: [{ applicationId }, { _id: applicationId.match(/^[0-9a-fA-F]{24}$/) ? applicationId : null }]
    });
    if (!loan) return res.status(404).json({ error: 'Application not found' });

    const prevStatus = loan.status;
    const finalStatus = action === 'APPROVE' ? (newStatus || 'LISTED') : 'BLOCKED';
    loan.status = finalStatus;
    if (action === 'APPROVE') {
      loan.acieScore.fraudRiskFlag = 'None';
    }
    await loan.save();

    await AuditLog.create({
      action: action === 'APPROVE' ? 'ACIE_OVERRIDE_APPROVE' : 'ACIE_OVERRIDE_REJECT',
      targetId: loan.applicationId,
      performedBy: req.body.adminUser || 'Senior_Risk_Officer',
      previousState: { status: prevStatus },
      newState: { status: finalStatus },
      reason: comment,
      metadata: { originalScore: loan.acieScore?.total, fraudFlags: loan.acieScore?.fraudFlags }
    });

    res.json({
      success: true,
      applicationId: loan.applicationId,
      newStatus: loan.status,
      auditLogged: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/risk/recovery-pipeline - Full recovery tracker for Admin
router.get('/recovery-pipeline', async (req, res) => {
  try {
    const repayments = await LoanRepayment.find({
      status: { $in: ['DELAYED', 'AT_RISK', 'NPA', 'SETTLED'] }
    }).populate({
      path: 'loanId',
      populate: { path: 'borrowerId' }
    }).sort({ dpd: -1 });

    const formatted = repayments.map(r => ({
      repaymentId: r._id,
      loanId: r.loanId?._id,
      applicationId: r.loanId?.applicationId,
      borrowerName: r.loanId?.borrowerId?.name || 'MSME Borrower',
      businessName: r.loanId?.borrowerId?.businessName || 'Business',
      loanAmount: r.loanId?.loanAmount,
      status: r.status,
      dpd: r.dpd,
      penalInterestAccrued: r.penalInterestAccrued,
      penalInterestRate: r.penalInterestRate,
      collectionAttempts: r.collectionAttempts,
      restructurePlan: r.restructurePlan,
      ewsFlagsCount: r.ewsFlags?.length || 0,
      recovery: r.recovery
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/risk/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
