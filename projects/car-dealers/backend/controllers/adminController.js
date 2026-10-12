const db = require('../config/db');
exports.stats = async (_req, res, next) => {
  try {
    const [[vehicles]] = await db.query('SELECT COUNT(*) AS total_vehicles, SUM(status = "available") AS available_vehicles FROM vehicles');
    const [[users]] = await db.query('SELECT COUNT(*) AS total_users FROM users WHERE role = "customer"');
    const [[enquiries]] = await db.query('SELECT COUNT(*) AS total_enquiries FROM enquiries');
    res.json({ ...vehicles, ...users, ...enquiries });
  } catch (err) { next(err); }
};
