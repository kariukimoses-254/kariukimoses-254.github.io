const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function seed() {
  const hash = await bcrypt.hash('Password@123', 10);
  console.log('Password hash:', hash);
  
  // Read the sample_data.sql
  let sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'sample_data.sql'), 'utf8');
  
  // Replace the placeholder hash with the real one
  sql = sql.replace(/\$2b\$10\$YourHashedPasswordHere1234567890123456789012345/g, hash);
  
  // Write to temp file
  const tempFile = path.join(__dirname, 'temp_seed.sql');
  fs.writeFileSync(tempFile, sql);
  console.log('Temp SQL file written to', tempFile);
  
  // Execute using MySQL CLI
  const mysqlPath = 'C:\\xampp\\mysql\\bin\\mysql.exe';
  const cmd = `"${mysqlPath}" -u root lil_mosey_estate < "${tempFile}"`;
  console.log('Executing:', cmd);
  execSync(cmd, { stdio: 'inherit' });
  console.log('Seed completed successfully!');
  
  // Clean up
  fs.unlinkSync(tempFile);
  console.log('Temp file cleaned up');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
