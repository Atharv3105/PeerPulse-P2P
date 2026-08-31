const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
  borrowerId: { type: String, required: true, unique: true }, // UUID
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  aadhaarVerified: { type: Boolean, default: true },
  businessName: { type: String, required: true },
  businessCategory: { type: String, required: true }, // "textile" | "retail" | "manufacturing" | "services"
  udyamNumber: { type: String },
  gstNumber: { type: String },
  platformTrustScore: { type: Number, default: 80 }, // 0–100; set to 0 permanently on NPA
  activeApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Borrower', borrowerSchema);
