const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const hashPassword = pw => crypto.createHash('sha256').update(pw).digest('hex');

app.use(express.json());
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lil_mosey_hospital',
  waitForConnections: true,
  connectionLimit: 10,
});

// ---------- Patients API ----------
app.get('/api/patients', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM patients ORDER BY id');
  res.json(rows);
});

app.post('/api/patients', async (req, res) => {
  const { name, age, gender, disease, status } = req.body;
  const [result] = await pool.query(
    'INSERT INTO patients (name, age, gender, disease, status) VALUES (?, ?, ?, ?, ?)',
    [name, age, gender, disease, status]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.put('/api/patients/:id', async (req, res) => {
  const { name, age, gender, disease, status } = req.body;
  await pool.query(
    'UPDATE patients SET name=?, age=?, gender=?, disease=?, status=? WHERE id=?',
    [name, age, gender, disease, status, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/patients/:id', async (req, res) => {
  await pool.query('DELETE FROM patients WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Doctors API ----------
app.get('/api/doctors', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM doctors ORDER BY id');
  res.json(rows);
});

app.post('/api/doctors', async (req, res) => {
  const { name, spec, qualification, experience, phone, email, languages, photo, rating, available, bio } = req.body;
  const [result] = await pool.query(
    `INSERT INTO doctors
       (name, spec, qualification, experience, phone, email, languages, photo, rating, available, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, spec, qualification || null, experience || null, phone, email || null, languages || null,
      photo || 'images/hero.jpg', rating || 4.5, available || 'Mon-Fri 09:00-17:00', bio || null,
    ]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.post('/api/doctors/:id/rate', async (req, res) => {
  const { stars } = req.body;
  if (!stars || stars < 1 || stars > 5) return res.status(400).json({ error: 'Stars must be 1-5' });
  await pool.query('UPDATE doctors SET patient_rating=? WHERE id=?', [stars, req.params.id]);
  res.json({ ok: true, rating: stars });
});

app.delete('/api/doctors/:id', async (req, res) => {
  await pool.query('DELETE FROM doctors WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Doctor Applications ----------
app.get('/api/applications', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM doctor_applications ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/applications', async (req, res) => {
  const { name, spec, phone, email, experience, message, photo } = req.body;
  const [result] = await pool.query(
    'INSERT INTO doctor_applications (name, spec, phone, email, experience, message, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, spec, phone, email, experience, message, photo || null]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
});

// ---------- Approve / Reject ----------
app.post('/api/applications/:id/approve', async (req, res) => {
  const [[appRow]] = await pool.query('SELECT * FROM doctor_applications WHERE id=?', [req.params.id]);
  if (!appRow) return res.status(404).json({ error: 'Not found' });
  await pool.query('INSERT INTO doctors (name, spec, phone, photo) VALUES (?, ?, ?, ?)', [appRow.name, appRow.spec, appRow.phone, appRow.photo || 'images/hero.jpg']);
  await pool.query('UPDATE doctor_applications SET status=? WHERE id=?', ['approved', req.params.id]);
  res.json({ ok: true });
});

app.post('/api/applications/:id/reject', async (req, res) => {
  await pool.query('UPDATE doctor_applications SET status=? WHERE id=?', ['rejected', req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/applications/:id', async (req, res) => {
  await pool.query('DELETE FROM doctor_applications WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await pool.query('SELECT id, name, email, role FROM registrations WHERE email=? AND password=?', [email, hashPassword(password)]);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json(user);
});

// ---------- Hospital Records ----------
app.get('/api/records', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM hospital_records ORDER BY admission_date DESC');
  res.json(rows);
});

app.post('/api/records', async (req, res) => {
  const { patient_name, department, doctor, diagnosis, treatment, admission_date, status } = req.body;
  const [result] = await pool.query(
    'INSERT INTO hospital_records (patient_name, department, doctor, diagnosis, treatment, admission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [patient_name, department, doctor, diagnosis, treatment, admission_date, status]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.delete('/api/records/:id', async (req, res) => {
  await pool.query('DELETE FROM hospital_records WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Database Summary ----------
app.get('/api/db-summary', async (req, res) => {
  const tables = ['doctors', 'patients', 'appointments', 'doctor_applications', 'hospital_records', 'registrations', 'messages'];
  const summary = {};
  for (const t of tables) {
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM ${t}`);
    summary[t] = count;
  }
  res.json(summary);
});

// ---------- Messages ----------
app.get('/api/messages/mine/:email', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM messages WHERE email=? ORDER BY created_at DESC', [req.params.email]);
  res.json(rows);
});

app.get('/api/messages', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/messages', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const [result] = await pool.query(
    'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject, message]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.delete('/api/messages/:id', async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Billing ----------
app.get('/api/billing', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM billing ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/billing', async (req, res) => {
  const { patient, department, amount, status } = req.body;
  const [result] = await pool.query('INSERT INTO billing (patient, department, amount, status) VALUES (?, ?, ?, ?)', [patient, department, amount, status || 'Pending']);
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.delete('/api/billing/:id', async (req, res) => {
  await pool.query('DELETE FROM billing WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Inventory ----------
app.get('/api/inventory', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM inventory ORDER BY item');
  res.json(rows);
});

app.post('/api/inventory', async (req, res) => {
  const { item, quantity, expiry } = req.body;
  const [result] = await pool.query('INSERT INTO inventory (item, quantity, expiry) VALUES (?, ?, ?)', [item, quantity, expiry]);
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.delete('/api/inventory/:id', async (req, res) => {
  await pool.query('DELETE FROM inventory WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Audit Log ----------
app.get('/api/audit-log', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50');
  res.json(rows);
});

// ---------- Reports ----------
app.get('/api/reports', async (req, res) => {
  const [[{ revenue }]] = await pool.query('SELECT COALESCE(SUM(amount),0) AS revenue FROM billing');
  const [[{ pending }]] = await pool.query("SELECT COUNT(*) AS pending FROM billing WHERE status='Pending'");
  const [[{ admitted }]] = await pool.query("SELECT COUNT(*) AS admitted FROM patients WHERE status='Admitted'");
  const [[{ low_stock }]] = await pool.query('SELECT COUNT(*) AS low_stock FROM inventory WHERE quantity < 100');
  res.json({ revenue, pending_due: pending, admitted_patients: admitted, low_stock_items: low_stock });
});

// ---------- Registrations ----------
app.get('/api/registrations', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, phone, photo, role, created_at FROM registrations ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/registrations', async (req, res) => {
  const { name, email, phone, password, photo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO registrations (name, email, phone, password, photo) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashPassword(password), photo || null]
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

// ---------- Appointments API ----------
app.get('/api/appointments', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date, time');
  res.json(rows);
});

// Public page: a patient's own appointments
app.get('/api/appointments/mine/:email', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM appointments WHERE email=? ORDER BY date, time', [req.params.email]);
  res.json(rows);
});

app.post('/api/appointments', async (req, res) => {
  const { patient, doctor, date, time, email } = req.body;
  const [result] = await pool.query(
    'INSERT INTO appointments (patient, doctor, date, time, email) VALUES (?, ?, ?, ?, ?)',
    [patient, doctor, date, time, email || null]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
});

app.delete('/api/appointments/:id', async (req, res) => {
  await pool.query('DELETE FROM appointments WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`🏥 Hospital server running at http://localhost:${PORT}`));
