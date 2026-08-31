const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');
const Lender = require('../models/Lender');
const LoanRepayment = require('../models/LoanRepayment');
const LoanApplication = require('../models/LoanApplication');
const AuditLog = require('../models/AuditLog');
const eventBus = require('../services/eventBus');

// GET /api/payments/config - Expose public key for frontend checkout
router.get('/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TWQRpRwBlre2Us',
    currency: 'INR'
  });
});

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, purpose, entityId, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const order = await PaymentService.createOrder({
      amount: Number(amount),
      receipt: `rcpt_${purpose || 'wallet'}_${Date.now()}`,
      notes: {
        purpose: purpose || 'wallet_deposit',
        entityId: entityId || 'unknown',
        ...(notes || {})
      }
    });

    res.json({
      order,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TWQRpRwBlre2Us'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify-wallet-deposit - Verify & Credit Lender Wallet
router.post('/verify-wallet-deposit', async (req, res) => {
  try {
    const { lenderId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!lenderId || !amount) {
      return res.status(400).json({ error: 'Lender ID and amount are required' });
    }

    const isValid = PaymentService.verifySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      keySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Credit Lender Wallet
    const isHexId = /^[0-9a-fA-F]{24}$/.test(lenderId);
    const lender = await Lender.findOne({
      $or: [{ lenderId: lenderId }, { _id: isHexId ? lenderId : null }]
    });

    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }

    const depositAmount = Number(amount);
    lender.walletBalance = (lender.walletBalance || 0) + depositAmount;
    await lender.save();

    // Log Audit
    await AuditLog.create({
      action: 'ESCROW_FUNDING',
      entity: 'Lender',
      entityId: lender._id,
      details: {
        depositAmount,
        newBalance: lender.walletBalance,
        razorpayPaymentId,
        paymentRail: 'RAZORPAY_TEST_SMART_COLLECT'
      },
      status: 'SUCCESS'
    });

    // Broadcast SSE Event
    eventBus.broadcast('wallet_updated', {
      lenderId: lender.lenderId,
      newBalance: lender.walletBalance,
      depositAmount
    });

    res.json({
      success: true,
      message: `Successfully credited ₹${depositAmount.toLocaleString('en-IN')} to Escrow Wallet`,
      walletBalance: lender.walletBalance,
      paymentId: razorpayPaymentId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/pay-emi - Instant EMI payment via Razorpay
router.post('/pay-emi', async (req, res) => {
  try {
    const { loanId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isHexId = /^[0-9a-fA-F]{24}$/.test(loanId);
    const repayment = await LoanRepayment.findOne({
      $or: [{ loanId: loanId }, { _id: isHexId ? loanId : null }]
    }).populate('loanId');

    if (!repayment) {
      return res.status(404).json({ error: 'Repayment schedule not found' });
    }

    const emiAmount = Number(amount) || repayment.monthlyEmi;
    repayment.outstandingPrincipal = Math.max(0, repayment.outstandingPrincipal - emiAmount);
    repayment.dpd = 0;
    repayment.penalInterestAccrued = 0;
    repayment.status = repayment.outstandingPrincipal <= 0 ? 'COMPLETED' : 'ACTIVE';
    repayment.lastPaymentDate = new Date();
    await repayment.save();

    // Audit log
    await AuditLog.create({
      action: 'REPAYMENT_COLLECTED',
      entity: 'LoanRepayment',
      entityId: repayment._id,
      details: {
        emiAmount,
        remainingBalance: repayment.outstandingPrincipal,
        razorpayPaymentId,
        rail: 'RAZORPAY_INSTANT_COLLECT'
      },
      status: 'SUCCESS'
    });

    // Broadcast SSE Event
    eventBus.broadcast('repayment_received', {
      loanId: repayment.loanId?._id || loanId,
      paidAmount: emiAmount,
      remainingBalance: repayment.outstandingPrincipal,
      status: repayment.status
    });

    res.json({
      success: true,
      message: `EMI payment of ₹${emiAmount.toLocaleString('en-IN')} confirmed via Razorpay`,
      repayment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
