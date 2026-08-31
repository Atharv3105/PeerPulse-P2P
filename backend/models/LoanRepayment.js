const mongoose = require('mongoose');

const loanRepaymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'DELAYED', 'AT_RISK', 'NPA', 'SETTLED', 'CLOSED'], 
    default: 'ACTIVE' 
  },
  dpd: { type: Number, default: 0 }, // Days Past Due — 0 when current
  penalInterestAccrued: { type: Number, default: 0 }, // 18% p.a. applied daily on overdue principal
  penalInterestRate: { type: Number, default: 0.18 },
  lastPenalCalculatedAt: { type: Date },
  monthlyEmi: { type: Number, default: 0 },
  outstandingPrincipal: { type: Number, default: 0 },
  nextPaymentDueDate: { type: Date },
  restructurePlan: {
    restructureId: String,
    option: { type: String, enum: ['MORATORIUM', 'TENURE_EXTENSION', 'OTS'] },
    params: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['APPLIED', 'PENDING_VOTE', 'APPROVED', 'REJECTED'] },
    proposedAmount: Number,
    moratoriumMonths: Number,
    newTenure: Number,
    appliedAt: Date,
    expiresAt: Date,
    votes: [{
      lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender' },
      vote: { type: String, enum: ['APPROVE', 'REJECT'] },
      trancheShare: Number,
      votedAt: { type: Date, default: Date.now }
    }],
    approvalPercentage: { type: Number, default: 0 }
  },
  ewsFlags: [{
    triggeredAt: { type: Date, default: Date.now },
    type: { 
      type: String, 
      enum: ['UPI_DROP', 'GST_MISS', 'BALANCE_LOW', 'DEBIT_SPIKE', 'BOUNCE_NARRATION'] 
    },
    severity: { 
      type: String, 
      enum: ['WATCH', 'CAUTION', 'ALERT'] 
    },
    description: String
  }],
  collectionAttempts: [{
    attemptDate: { type: Date, default: Date.now },
    method: { type: String, enum: ['NACH', 'MANUAL', 'LEGAL'] },
    outcome: { type: String }, // "SUCCESS" | "FAILED" | "SCHEDULED" | "NOTICE_ISSUED"
    amountAttempted: Number,
    channel: String,
    notes: String
  }],
  recovery: {
    totalRecovered: { type: Number, default: 0 },
    recoveryFee: { type: Number, default: 0 }, // 2–5% of recovered amount
    netDistributed: { type: Number, default: 0 },
    recoveryDate: Date,
    lenderDistributions: [{
      lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender' },
      originalExposure: Number,
      recoveredAmount: Number,
      netReceived: Number,
      outstandingLoss: Number,
      creditedAt: Date
    }]
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanRepayment', loanRepaymentSchema);
