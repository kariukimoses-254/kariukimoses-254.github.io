const db = require('../config/db');
exports.list = async (req, res, next) => {
  try {
    const { brand, category, search, minPrice, maxPrice, limit = 100 } = req.query;
    const where = ['status = ?']; const values = ['available'];
    if (brand) { where.push('brand = ?'); values.push(brand); }
    if (category) { where.push('category = ?'); values.push(category); }
    if (search) { where.push('(brand LIKE ? OR model LIKE ? OR description LIKE ?)'); values.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    if (minPrice !== undefined && minPrice !== '') { where.push('price >= ?'); values.push(Number(minPrice)); }
    if (maxPrice !== undefined && maxPrice !== '') { where.push('price <= ?'); values.push(Number(maxPrice)); }
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
    const [rows] = await db.execute(`SELECT id,brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,created_at FROM vehicles WHERE ${where.join(' AND ')} ORDER BY featured DESC, created_at DESC LIMIT ${safeLimit}`, values);
    res.json({ vehicles: rows });
  } catch (err) { next(err); }
};
exports.listAllForAdmin = async (_req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT id,brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,status,created_at FROM vehicles ORDER BY created_at DESC LIMIT 200');
    res.json({ vehicles: rows });
  } catch (err) { next(err); }
};
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ vehicle: rows[0] });
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const { brand, model, year, price, mileage, transmission, fuel_type, category, description, image_url, featured } = req.body;
    if (!brand || !model || !year || price === undefined) return res.status(400).json({ message: 'Brand, model, year and price are required.' });
    const image = req.file ? `/uploads/${req.file.filename}` : (image_url || null);
    const [result] = await db.execute('INSERT INTO vehicles (brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [brand,model,Number(year),Number(price),mileage || 0,transmission || 'Automatic',fuel_type || 'Petrol',category || 'Sedan',description || '',image,featured ? 1 : 0,req.user.id]);
    res.status(201).json({ message: 'Vehicle created.', id: result.insertId });
  } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const fields = ['brand','model','year','price','mileage','transmission','fuel_type','category','description','image_url','status','featured'];
    const sets = []; const values = [];
    for (const field of fields) if (req.body[field] !== undefined) { sets.push(`${field} = ?`); values.push(field === 'featured' ? (req.body[field] ? 1 : 0) : req.body[field]); }
    if (req.file) { sets.push('image_url = ?'); values.push(`/uploads/${req.file.filename}`); }
    if (!sets.length) return res.status(400).json({ message: 'No fields supplied to update.' });
    values.push(req.params.id);
    const [result] = await db.execute(`UPDATE vehicles SET ${sets.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle updated.' });
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted.' });
  } catch (err) { next(err); }
};
