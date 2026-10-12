const db = require('../config/db');
exports.create = async (req, res, next) => {
  try {
    const { full_name, email, phone, message, vehicle_id, brand, model, year, price, mileage, transmission, fuel_type } = req.body;
    const listingDetails = brand && model ? `\n\nCAR LISTING SUBMISSION\nBrand: ${brand}\nModel: ${model}\nYear: ${year || ''}\nExpected price: ${price || ''}\nMileage: ${mileage || 'Not provided'}\nTransmission: ${transmission || ''}\nFuel type: ${fuel_type || ''}${req.file ? `\nPhoto: /uploads/${req.file.filename}` : '\nPhoto: Not attached'}` : '';
    const fullMessage = `${message || ''}${listingDetails}`;
    if (!full_name?.trim() || !email?.trim() || !message?.trim()) return res.status(400).json({ message: 'Name, email and message are required.' });
    const [result] = await db.execute('INSERT INTO enquiries (user_id,vehicle_id,full_name,email,phone,message) VALUES (?,?,?,?,?,?)', [req.user?.id || null, vehicle_id || null, full_name.trim(), email.toLowerCase().trim(), phone || null, fullMessage.trim()]);
    res.status(201).json({ message: 'Your enquiry has been received.', id: result.insertId });
  } catch (err) { next(err); }
};
exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT e.*, v.brand, v.model FROM enquiries e LEFT JOIN vehicles v ON v.id=e.vehicle_id ORDER BY e.created_at DESC LIMIT 300');
    res.json({ enquiries: rows });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'in_progress', 'resolved'].includes(status)) return res.status(400).json({ message: 'Status must be new, in_progress, or resolved.' });
    const [result] = await db.execute('UPDATE enquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json({ message: 'Enquiry status updated.' });
  } catch (err) { next(err); }
};
