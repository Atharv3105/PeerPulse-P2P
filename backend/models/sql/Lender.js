const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Lender = sequelize.define('Lender', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  lender_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  risk_appetite: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  sector_preference: {
    type: DataTypes.STRING(50),
    defaultValue: 'any'
  },
  denomination_preference: {
    type: DataTypes.INTEGER,
    defaultValue: 25000
  },
  wallet_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 500000.00
  },
  total_exposure: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'lenders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Lender;
