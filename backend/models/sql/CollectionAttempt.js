const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CollectionAttempt = sequelize.define('CollectionAttempt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  repayment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  method: {
    type: DataTypes.STRING(30),
    defaultValue: 'NACH'
  },
  outcome: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  amount_attempted: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  channel: {
    type: DataTypes.STRING(60),
    defaultValue: 'HDFC_NACH_GATEWAY'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'collection_attempts',
  timestamps: true,
  createdAt: 'attempt_date',
  updatedAt: false
});

module.exports = CollectionAttempt;
