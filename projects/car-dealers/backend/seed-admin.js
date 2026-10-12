require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');
(async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'Lil-Mosey Car Dealers Administrator';
  if (!email || !password || password.length < 12) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in your .env file first.');
    process.exitCode = 1;
    await db.end();
    return;
  }
  try {
    const [found] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    const hash = await bcrypt.hash(password, 12);
    if (found.length) {
      await db.execute('UPDATE users SET full_name=?, password_hash=?, role="admin" WHERE id=?', [fullName, hash, found[0].id]);
      console.log('Existing account promoted to administrator and password updated.');
    } else {
      await db.execute('INSERT INTO users (full_name,email,password_hash,role) VALUES (?,?,?,"admin")', [fullName, email.toLowerCase(), hash]);
      console.log('Administrator account created.');
    }
  } catch (err) { console.error(err.message); process.exitCode = 1; }
  finally { await db.end(); }
})();
