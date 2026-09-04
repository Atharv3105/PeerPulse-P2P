const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LenderDistributionSplit = sequelize.define('LenderDistributionSplit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  distribution_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  original_exposure: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  gross_share: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  net_received: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  outstanding_loss: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'lender_distribution_splits',
  timestamps: true,
  createdAt: 'credited_at',
  updatedAt: false
});

module.exports = LenderDistributionSplit;
