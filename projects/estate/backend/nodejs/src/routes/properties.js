const { Router } = require('express');
const { Property, Agent } = require('../models/postgres');
const { status: dbStatus } = require('../services/db');
const memStore = require('../services/in_memory_store');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (minPrice) filter.minPrice = Number(minPrice);
    if (maxPrice) filter.maxPrice = Number(maxPrice);

    if (!dbStatus.postgres) {
      const all = memStore.findProperties(filter);
      const page = all.slice(offset, offset + Number(limit));
      return res.json({ total: all.length, inMemory: true, properties: page });
    }

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (filter.minPrice || filter.maxPrice) {
      where.price = {};
      if (filter.minPrice) where.price.gte = filter.minPrice;
      if (filter.maxPrice) where.price.lte = filter.maxPrice;
    }
    const { rows, count } = await Property.findAndCountAll({
      where,
      include: [{ model: Agent, as: 'agent' }],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['created_at', 'DESC']],
    });
    res.json({ total: count, properties: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!dbStatus.postgres) {
      const property = memStore.findPropertyById(req.params.id);
      if (!property) return res.status(404).json({ error: 'Property not found' });
      return res.json(property);
    }
    const property = await Property.findByPk(req.params.id, {
      include: [{ model: Agent, as: 'agent' }],
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!dbStatus.postgres) {
      const property = memStore.createProperty(req.body);
      return res.status(201).json(property);
    }
    const property = await Property.create(req.body);
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!dbStatus.postgres) {
      const property = memStore.findPropertyById(req.params.id);
      if (!property) return res.status(404).json({ error: 'Property not found' });
      Object.assign(property, req.body);
      return res.json(property);
    }
    const property = await Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    await property.update(req.body);
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!dbStatus.postgres) {
      const idx = memStore.findProperties({}).findIndex((p) => String(p.id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: 'Property not found' });
      memStore.findProperties().splice(idx, 1);
      return res.status(204).end();
    }
    const property = await Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    await property.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;