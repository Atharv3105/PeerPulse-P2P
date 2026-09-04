const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RestructureVote = sequelize.define('RestructureVote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vote: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tranche_share: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  }
}, {
  tableName: 'restructure_votes',
  timestamps: true,
  createdAt: 'voted_at',
  updatedAt: false
});

module.exports = RestructureVote;
