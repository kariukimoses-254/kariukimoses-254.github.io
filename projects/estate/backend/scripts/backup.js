#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
const KEEP_COUNT = parseInt(process.env.BACKUP_KEEP_COUNT, 10) || 7;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lil_mosey_estate';

const MYSQLDUMP_PATH = process.env.MYSQLDUMP_PATH || 'mysqldump';

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

function createBackup() {
  ensureBackupDir();

  const timestamp = getTimestamp();
  const filename = `${DB_NAME}_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const passwordArg = DB_PASSWORD ? `-p${DB_PASSWORD}` : '';

  const cmd = [
    `"${MYSQLDUMP_PATH}"`,
    `--host=${DB_HOST}`,
    `--port=${DB_PORT}`,
    `--user=${DB_USER}`,
    passwordArg,
    `--single-transaction`,
    `--routines`,
    `--triggers`,
    `--events`,
    `--add-drop-table`,
    `--complete-insert`,
    `--extended-insert`,
    DB_NAME,
    `> "${filepath}"`
  ].filter(Boolean).join(' ');

  console.log(`Starting backup of ${DB_NAME}...`);

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 300000 });
    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`Backup created: ${filename} (${sizeKB} KB)`);
    rotateBackups();
    return filepath;
  } catch (error) {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    console.error('Backup failed:', error.message);
    if (error.stderr) {
      console.error('stderr:', error.stderr.toString());
    }
    process.exit(1);
  }
}

function rotateBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith(DB_NAME) && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > KEEP_COUNT) {
    const toDelete = files.slice(KEEP_COUNT);
    toDelete.forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      console.log(`Rotated old backup: ${f.name}`);
    });
  }
}

function listBackups() {
  ensureBackupDir();

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith(DB_NAME) && f.endsWith('.sql'))
    .map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        name: f,
        size: (stats.size / 1024).toFixed(1) + ' KB',
        created: stats.mtime.toLocaleString()
      };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  if (files.length === 0) {
    console.log('No backups found.');
    return;
  }

  console.log(`\nBackups (${files.length} of ${KEEP_COUNT} max):\n`);
  files.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.name} — ${f.size} — ${f.created}`);
  });
  console.log('');
}

const command = process.argv[2];

switch (command) {
  case 'list':
    listBackups();
    break;
  case 'backup':
  default:
    createBackup();
    break;
}
