const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  application_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  borrower_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  loan_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  target_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  funded_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  tenure_months: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  business_category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'LISTED'
  }
}, {
  tableName: 'loans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Loan;
