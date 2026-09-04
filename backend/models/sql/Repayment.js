const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Repayment = sequelize.define('Repayment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  loan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'ACTIVE'
  },
  dpd: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  monthly_emi: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  outstanding_principal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  penal_interest_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.1800
  },
  penal_interest_accrued: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  last_penal_calculated_at: {
    type: DataTypes.DATE
  },
  next_payment_due_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'repayments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Repayment;
