const { Router } = require('express');
const { Listing } = require('../models/mongo');
const { status: dbStatus } = require('../services/db');
const memStore = require('../services/in_memory_store');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { city, status, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (status) filter.status = status;
    if (minPrice) filter.minPrice = parseInt(minPrice, 10);
    if (maxPrice) filter.maxPrice = parseInt(maxPrice, 10);

    if (!dbStatus.mongo) {
      const all = memStore.findListings(filter);
      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      return res.json({
        total: all.length,
        inMemory: true,
        page: parseInt(page, 10),
        listings: all.slice(skip, skip + parseInt(limit, 10)),
      });
    }

    const mongoFilter = {};
    if (city) mongoFilter['location.city'] = city;
    if (status) mongoFilter.status = status;
    if (filter.minPrice || filter.maxPrice) {
      mongoFilter.price = {};
      if (filter.minPrice) mongoFilter.price.$gte = filter.minPrice;
      if (filter.maxPrice) mongoFilter.price.$lte = filter.maxPrice;
    }
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [listings, total] = await Promise.all([
      Listing.find(mongoFilter).skip(skip).limit(parseInt(limit, 10)).sort({ createdAt: -1 }),
      Listing.countDocuments(mongoFilter),
    ]);
    res.json({ total, page: parseInt(page, 10), listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!dbStatus.mongo) {
      const listing = memStore.createListing(req.body);
      return res.status(201).json(listing);
    }
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/visit/:id', async (req, res) => {
  try {
    if (!dbStatus.mongo) {
      const listing = memStore.incrementListingViews(req.params.id);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });
      return res.json(listing);
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;