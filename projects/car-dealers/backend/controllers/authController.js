const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
}
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute('INSERT INTO users (full_name,email,phone,password_hash,role) VALUES (?,?,?,?,?)', [full_name.trim(), email.toLowerCase().trim(), phone || null, hash, 'customer']);
    const user = { id: result.insertId, full_name: full_name.trim(), email: email.toLowerCase().trim(), role: 'customer' };
    res.status(201).json({ message: 'Account created.', token: makeToken(user), user });
  } catch (err) { next(err); }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const [rows] = await db.execute('SELECT id,full_name,email,phone,password_hash,role FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ message: 'Incorrect email or password.' });
    const { password_hash, ...user } = rows[0];
    res.json({ message: 'Login successful.', token: makeToken(user), user });
  } catch (err) { next(err); }
};
exports.profile = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT id,full_name,email,phone,role,created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
};
