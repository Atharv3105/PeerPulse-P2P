const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RecoveryDistribution = sequelize.define('RecoveryDistribution', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  repayment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_recovered: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  recovery_fee: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  net_distributed: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'recovery_distributions',
  timestamps: true,
  createdAt: 'recovered_at',
  updatedAt: false
});

module.exports = RecoveryDistribution;
