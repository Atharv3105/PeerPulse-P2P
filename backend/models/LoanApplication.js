const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true }, // UUID
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  borrowerUuid: { type: String },
  loanAmount: { type: Number, required: true, min: 25000, max: 5000000 }, // ₹25,000 – ₹5,000,000
  tenure: { 
    type: Number, 
    required: true, 
    enum: [3, 6, 9, 12, 24, 36] // 3, 6, 9, 12, 24, or 36 months ONLY
  },
  purpose: { type: String, required: true },
  businessCategory: { type: String, required: true }, // drives debit pattern plausibility check
  interestRate: { type: Number, default: 14.5 }, // Annual percentage rate
  acieScore: {
    total: { type: Number, min: 300, max: 900 },
    grade: { type: String, enum: ['A', 'B', 'C', 'DECLINED'] },
    breakdown: {
      cashflow: { type: Number, default: 0 },
      upi: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      operational: { type: Number, default: 0 },
      aaData: { type: Number, default: 0 }
    },
    fraudFlags: [{ type: String }],
    confidence: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
    fraudRiskFlag: { type: String, enum: ['None', 'Caution', 'Block'], default: 'None' },
    dataCompleteness: { type: Number, default: 90 },
    explainability: {
      positiveFactors: [{ type: String }],
      negativeFactors: [{ type: String }],
      improvementTips: [{ type: String }]
    },
    forgeryResult: {
      forgeryGrade: String,
      forgeryReason: String,
      metadataFlagged: Boolean,
      layoutAnomalies: [String]
    }
  },
  fundingStatus: {
    funded: { type: Number, default: 0 }, // ₹ amount funded so far
    target: { type: Number, required: true }, // = loanAmount
    percentFunded: { type: Number, default: 0 }, // 0–100
    lenders: [{
      lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender' },
      trancheId: String,
      amount: Number,
      fundedAt: { type: Date, default: Date.now }
    }]
  },
  repayment: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanRepayment' },
  status: { 
    type: String, 
    enum: ['SCORING', 'LISTED', 'FUNDED', 'ACTIVE', 'CLOSED', 'BLOCKED', 'DECLINED'], 
    default: 'SCORING' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
