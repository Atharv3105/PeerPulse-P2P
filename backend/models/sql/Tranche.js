const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Tranche = sequelize.define('Tranche', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tranche_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  loan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 25000.00
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'ACTIVE'
  }
}, {
  tableName: 'tranches',
  timestamps: true,
  createdAt: 'funded_at',
  updatedAt: false
});

module.exports = Tranche;
