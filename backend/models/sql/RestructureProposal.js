const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RestructureProposal = sequelize.define('RestructureProposal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  restructure_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  repayment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  option_type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  proposed_amount: {
    type: DataTypes.DECIMAL(12, 2)
  },
  moratorium_months: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  new_tenure_months: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  approval_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'PENDING_VOTE'
  },
  expires_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'restructure_proposals',
  timestamps: true,
  createdAt: 'applied_at',
  updatedAt: false
});

module.exports = RestructureProposal;
