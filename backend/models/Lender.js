const mongoose = require('mongoose');

const lenderSchema = new mongoose.Schema({
  lenderId: { type: String, required: true, unique: true }, // UUID
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  riskAppetite: { 
    type: String, 
    enum: ['Conservative', 'Moderate', 'Aggressive'], 
    required: true 
  },
  sectorPreference: { 
    type: String, 
    enum: ['manufacturing', 'retail', 'services', 'textile', 'any'], 
    default: 'any' 
  },
  tenurePreference: [{ type: Number }], // e.g. [3, 6, 9, 12]
  denominationPreference: { 
    type: Number, 
    enum: [1000, 5000, 25000, 50000, 100000], 
    default: 25000 
  },
  walletBalance: { type: Number, default: 500000 },
  totalExposure: { type: Number, default: 0 }, // platform-enforced cap: ≤₹10L
  activeInvestments: [{
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' },
    applicationId: String,
    trancheAmount: Number,
    fundedAt: { type: Date, default: Date.now },
    expectedReturnRate: Number,
    status: { type: String, default: 'ACTIVE' }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lender', lenderSchema);
