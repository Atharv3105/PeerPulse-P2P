const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const DB_DIALECT = process.env.DB_DIALECT || 'sqlite'; // 'mysql', 'postgres', 'mssql', or 'sqlite'
const DB_NAME = process.env.DB_NAME || 'peerpulse';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || (DB_DIALECT === 'mysql' ? 3306 : 1433);

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (DB_DIALECT === 'mysql') {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Embedded SQLite storage ensuring instant zero-dependency execution anywhere
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const storagePath = path.join(dataDir, 'peerpulse.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[SQL Database] Connected successfully using dialect: ${sequelize.getDialect().toUpperCase()}`);
  } catch (error) {
    console.error('[SQL Database] Connection error:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection
};
