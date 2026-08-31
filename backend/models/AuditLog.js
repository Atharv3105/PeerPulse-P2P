const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // "ACIE_OVERRIDE_APPROVE" | "ACIE_OVERRIDE_REJECT" | "MANUAL_STATUS_TRIGGER" | "DISTRIBUTION" | "OTS_DECISION"
  targetId: { type: String, required: true }, // Loan ID or Application ID
  performedBy: { type: String, default: 'Risk_Ops_Admin' },
  previousState: mongoose.Schema.Types.Mixed,
  newState: mongoose.Schema.Types.Mixed,
  reason: { type: String, required: true },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
