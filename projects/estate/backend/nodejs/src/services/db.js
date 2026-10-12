const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const config = require('../../config');

const status = {
  mongo: false,
  postgres: false,
  lastError: null,
};

const mongo = mongoose.connection;
mongo.once('open', () => {
  status.mongo = true;
  console.log('[MongoDB] connected');
});
mongo.on('error', (err) => {
  status.lastError = err.message;
  console.error('[MongoDB] error:', err.message);
});

const sequelize = new Sequelize(config.postgres);

async function connectMongo() {
  await mongoose.connect(config.mongo.uri, config.mongo.options);
  status.mongo = true;
  return mongoose;
}

async function connectPostgres() {
  await sequelize.authenticate();
  status.postgres = true;
  console.log('[PostgreSQL] connected');
  return sequelize;
}

async function connectAll() {
  const [mongoResult, pgResult] = await Promise.allSettled([
    connectMongo(),
    connectPostgres(),
  ]);
  if (mongoResult.reason || pgResult.reason) {
    const reason = mongoResult.reason || pgResult.reason;
    status.lastError = reason && reason.message;
    console.warn(
      `[Node.js API] running in DEGRADED MODE (in-memory store). ` +
      `MongoDB: ${mongoResult.status}, PostgreSQL: ${pgResult.status}. ` +
      `Reason: ${status.lastError}`
    );
  }
  return { mongo: status.mongo, postgres: status.postgres };
}

module.exports = { connectAll, connectMongo, connectPostgres, sequelize, mongoose, status };