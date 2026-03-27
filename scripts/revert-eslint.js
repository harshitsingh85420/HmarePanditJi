#!/usr/bin/env node

/**
 * Revert broken ESLint fixes from fix-eslint.js
 * Replaces &apos; and &quot; back to ' and " in type definitions and JSX attributes
 */

const fs = require('fs');
const path = require('path');

function revertFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let revertedContent = content;
  
  // Replace &apos; with ' in type definitions (after : or = in type context)
  revertedContent = revertedContent.replace(/&apos;(primary|secondary|outline|ghost|danger|sm|md|lg|xl|customer|pandit|admin)&apos;/g, "'$1'");
  
  // Replace &apos; with ' in JSX expressions
  revertedContent = revertedContent.replace(/=&apos;([^&]*?)&apos;/g, "='$1'");
  
  // Replace &quot; with " in JSX expressions  
  revertedContent = revertedContent.replace(/=&quot;([^&]*?)&quot;/g, '="$1"');
  
  // Replace &apos; with ' in className
  revertedContent = revertedContent.replace(/className=&apos;([^&]*?)&apos;/g, "className='$1'");
  
  // Replace &apos; with ' in variable assignments
  revertedContent = revertedContent.replace(/const &apos;([^&]*?)&apos;/g, "const '$1'");
  
  // Replace &apos; with ' in object keys
  revertedContent = revertedContent.replace(/&apos;--([^&]*?)&apos;:/g, "'--$1':");
  
  // Replace &apos; with ' in template literals
  revertedContent = revertedContent.replace(/&apos;\$\{/g, "'${");
  
  // Replace &apos; with ' in empty strings
  revertedContent = revertedContent.replace(/&apos;&apos;/g, "''");
  
  if (revertedContent !== content) {
    fs.writeFileSync(filePath, revertedContent, 'utf8');
    console.log(`  ✓ Reverted ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        continue;
      }
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      revertFile(filePath);
    }
  }
}

// Main execution
const targetDir = process.argv[2] || path.join(__dirname, '..');
console.log(`🔄 Reverting broken ESLint fixes in ${targetDir}...\n`);

walkDir(targetDir);

console.log('\n✅ Revert complete!');
