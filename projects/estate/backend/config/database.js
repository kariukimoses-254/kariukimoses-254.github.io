const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lil_mosey_estate',
      waitForConnections: true,
      connectionLimit: 20,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      acquireTimeout: 10000
    });

    const connection = await pool.getConnection();
    logger.info(`MySQL Connected: ${connection.config.host}`);
    connection.release();

    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  return pool;
};

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const insert = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return { insertId: result.insertId, affectedRows: result.affectedRows };
};

const update = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

const remove = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return { affectedRows: result.affectedRows };
};

const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  connectDB,
  getPool,
  query,
  queryOne,
  insert,
  update,
  remove,
  transaction
};
