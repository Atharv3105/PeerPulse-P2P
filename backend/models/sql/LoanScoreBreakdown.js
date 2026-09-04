const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LoanScoreBreakdown = sequelize.define('LoanScoreBreakdown', {
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
  cashflow_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  upi_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gst_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  operational_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  aa_data_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  data_completeness: {
    type: DataTypes.INTEGER,
    defaultValue: 90
  },
  fraud_risk_flag: {
    type: DataTypes.STRING(20),
    defaultValue: 'None'
  },
  forgery_grade: {
    type: DataTypes.STRING(20),
    defaultValue: 'AUTHENTIC'
  },
  forgery_reason: {
    type: DataTypes.TEXT
  },
  positive_factors: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  negative_factors: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'loan_score_breakdowns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LoanScoreBreakdown;
