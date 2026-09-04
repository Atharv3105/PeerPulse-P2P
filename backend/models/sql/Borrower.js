const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Borrower = sequelize.define('Borrower', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  borrower_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  aadhaar_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  business_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  business_category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  udyam_number: {
    type: DataTypes.STRING(50)
  },
  gst_number: {
    type: DataTypes.STRING(20)
  },
  city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Mumbai'
  },
  state: {
    type: DataTypes.STRING(100),
    defaultValue: 'Maharashtra'
  },
  platform_trust_score: {
    type: DataTypes.INTEGER,
    defaultValue: 80
  }
}, {
  tableName: 'borrowers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Borrower;
