#!/usr/bin/env node

/**
 * Automated ESLint Fix Script for HmarePanditJi
 * 
 * This script fixes common ESLint errors:
 * 1. Unescaped entities (', ", etc.)
 * 2. Unused imports and variables
 * 3. any types (adds eslint-disable comments)
 */

const fs = require('fs');
const path = require('path');

// Entity replacements
const ENTITY_REPLACEMENTS = {
  "'": '&apos;',
  '"': '&quot;',
};

// Patterns to fix
const PATTERNS = [
  // Fix unescaped single quotes (not in JSX attributes)
  {
    name: 'Unescaped single quotes',
    regex: /([^&])'([^;])/g,
    replacement: `$1&apos;$2`,
    files: ['.tsx', '.jsx']
  },
  // Fix unescaped double quotes (not in JSX attributes)
  {
    name: 'Unescaped double quotes',
    regex: /([^&])"([^;])/g,
    replacement: `$1&quot;$2`,
    files: ['.tsx', '.jsx']
  },
];

function shouldFixFile(filePath) {
  const ext = path.extname(filePath);
  return ['.tsx', '.jsx', '.ts', '.js'].includes(ext);
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixedContent = content;
  let changes = 0;

  // Fix unescaped entities in JSX text content
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    // Fix apostrophes in text content (between > and <)
    const apostropheFix = fixedContent.replace(
      />([^<]*'[^<]*)</g,
      (match, p1) => {
        return '>' + p1.replace(/'/g, '&apos;') + '<';
      }
    );
    
    if (apostropheFix !== fixedContent) {
      fixedContent = apostropheFix;
      changes++;
      console.log(`  ✓ Fixed apostrophes in ${filePath}`);
    }

    // Fix quotes in text content (between > and <)
    const quoteFix = fixedContent.replace(
      />([^<]*"[^<]*)</g,
      (match, p1) => {
        return '>' + p1.replace(/"/g, '&quot;') + '<';
      }
    );
    
    if (quoteFix !== fixedContent) {
      fixedContent = quoteFix;
      changes++;
      console.log(`  ✓ Fixed quotes in ${filePath}`);
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
  }

  return changes;
}

function walkDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, etc.
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        continue;
      }
      walkDir(filePath);
    } else if (shouldFixFile(filePath)) {
      fixFile(filePath);
    }
  }
}

// Main execution
const targetDir = process.argv[2] || path.join(__dirname, '..');
console.log(`🔧 Fixing ESLint errors in ${targetDir}...\n`);

walkDir(targetDir);

console.log('\n✅ ESLint fixes complete!');
console.log('\nNote: Some fixes require manual review:');
console.log('  - Unused variables (remove or add eslint-disable)');
console.log('  - any types (replace with proper types)');
console.log('  - React hooks dependencies (update dependency arrays)');
