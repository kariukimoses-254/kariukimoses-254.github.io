const { Router } = require('express');
const { Listing } = require('../models/mongo');
const { Property } = require('../models/postgres');
const { status: dbStatus } = require('../services/db');
const memStore = require('../services/in_memory_store');

const router = Router();

router.get('/', async (_req, res) => {
  const pgUp = dbStatus.postgres;
  const mongoUp = dbStatus.mongo;
  res.json({
    service: 'Node.js REST API',
    degradedMode: !pgUp || !mongoUp,
    databases: {
      mongoDB_listings: mongoUp ? await Listing.countDocuments().catch(() => 0) : 0,
      mongoDB_inMemory: !mongoUp ? memStore.listingCount() : 0,
      postgres_properties: pgUp ? await Property.count().catch(() => 0) : 0,
      postgres_inMemory: !pgUp ? memStore.propertyCount() : 0,
    },
    health: 'ok',
  });
});

module.exports = router;