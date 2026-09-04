const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  action: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  target_id: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  previous_state: {
    type: DataTypes.JSON
  },
  new_state: {
    type: DataTypes.JSON
  },
  performed_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  reason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuditLog;
