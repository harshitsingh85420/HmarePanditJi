#!/usr/bin/env node
/**
 * Restore from Backup
 * 
 * Quickly restore files from auto-fix backups
 * 
 * Usage:
 *   node scripts/restore-backup.js --latest          # Restore most recent backup
 *   node scripts/restore-backup.js --list            # List all backups
 *   node scripts/restore-backup.js --file <path>     # Restore specific backup
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'auto-fix');

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups found.');
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.bak'))
    .sort()
    .reverse();

  return files.map(f => ({
    filename: f,
    path: path.join(BACKUP_DIR, f),
    originalFile: f.split('.')[0],
    timestamp: f.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0] || 'unknown',
    size: fs.statSync(path.join(BACKUP_DIR, f)).size
  }));
}

function restoreLatest() {
  const backups = listBackups();
  
  if (backups.length === 0) {
    console.log('No backups available to restore.');
    return false;
  }

  const latest = backups[0];
  const originalPath = path.join(__dirname, '..', latest.originalFile);
  
  console.log(`Restoring: ${latest.originalFile}`);
  console.log(`From backup: ${latest.path}`);
  console.log(`Timestamp: ${latest.timestamp}`);
  
  fs.copyFileSync(latest.path, originalPath);
  console.log('✅ Restore complete!');
  
  return true;
}

function restoreSpecific(backupFilename) {
  const backupPath = path.join(BACKUP_DIR, backupFilename);
  
  if (!fs.existsSync(backupPath)) {
    console.log(`Backup not found: ${backupFilename}`);
    return false;
  }

  const parts = backupFilename.split('.');
  parts.pop(); // Remove 'bak'
  parts.pop(); // Remove timestamp
  const originalFilename = parts.join('.');
  const originalPath = path.join(__dirname, '..', originalFilename);
  
  console.log(`Restoring: ${originalFilename}`);
  console.log(`From backup: ${backupPath}`);
  
  fs.copyFileSync(backupPath, originalPath);
  console.log('✅ Restore complete!');
  
  return true;
}

// Main
const args = process.argv.slice(2);

if (args.includes('--list')) {
  const backups = listBackups();
  
  if (backups.length === 0) {
    console.log('No backups found.');
  } else {
    console.log(`\n📦 Available Backups (${backups.length}):\n`);
    backups.forEach((b, i) => {
      console.log(`${i + 1}. ${b.originalFile}`);
      console.log(`   Backup: ${b.filename}`);
      console.log(`   Time: ${b.timestamp}`);
      console.log(`   Size: ${(b.size / 1024).toFixed(2)} KB\n`);
    });
  }
} else if (args.includes('--file') && args[args.indexOf('--file') + 1]) {
  const filename = args[args.indexOf('--file') + 1];
  restoreSpecific(filename);
} else if (args.includes('--latest') || args.length === 0) {
  restoreLatest();
} else {
  console.log(`
Restore from Backup

Usage:
  node scripts/restore-backup.js [options]

Options:
  --latest          Restore most recent backup (default)
  --list            List all available backups
  --file <name>     Restore specific backup file

Examples:
  node scripts/restore-backup.js --latest
  node scripts/restore-backup.js --list
  node scripts/restore-backup.js --file browser-test.js.2026-03-23T10-30-00.bak
`);
}
