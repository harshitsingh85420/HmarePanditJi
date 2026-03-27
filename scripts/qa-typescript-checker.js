#!/usr/bin/env node

/**
 * QA TypeScript Error Checker
 * 
 * This script helps QA engineers quickly identify and track
 * TypeScript errors across the HmarePanditJi codebase.
 * 
 * Usage:
 *   node scripts/qa-typescript-checker.js
 * 
 * Options:
 *   --watch     Watch mode for continuous monitoring
 *   --report    Generate HTML report
 *   --help      Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}╔════════════════════════════════════════════╗`);
console.log(`║   HmarePanditJi - TypeScript Error Checker  ║`);
console.log(`╚════════════════════════════════════════════╝${colors.reset}\n`);

// Parse command line arguments
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const generateReport = args.includes('--report');
const showHelp = args.includes('--help');

if (showHelp) {
  console.log(`
Usage: node scripts/qa-typescript-checker.js [options]

Options:
  --watch     Watch mode for continuous monitoring
  --report    Generate HTML report of errors
  --help      Show this help message

Examples:
  node scripts/qa-typescript-checker.js           # Run once
  node scripts/qa-typescript-checker.js --watch   # Watch mode
  node scripts/qa-typescript-checker.js --report  # Generate report
`);
  process.exit(0);
}

// Configuration
const config = {
  projectRoot: path.join(__dirname, '..'),
  tsConfig: path.join(__dirname, '..', 'tsconfig.json'),
  reportDir: path.join(__dirname, '..', 'qa-reports', 'typescript-errors'),
};

// Ensure report directory exists
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

/**
 * Run TypeScript compiler check
 */
function runTypeScriptCheck() {
  console.log(`${colors.blue}[INFO]${colors.reset} Running TypeScript compilation check...\n`);
  
  try {
    const output = execSync('pnpm type-check', {
      cwd: config.projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`${colors.green}✓ TypeScript compilation successful!${colors.reset}`);
    console.log(output);
    
    return { success: true, errors: [], output };
  } catch (error) {
    const output = error.stdout || error.stderr || error.message;
    const errors = parseErrors(output);
    
    console.log(`${colors.red}✗ TypeScript compilation failed with ${errors.length} error(s)${colors.reset}\n`);
    
    return { success: false, errors, output };
  }
}

/**
 * Parse TypeScript errors from compiler output
 */
function parseErrors(output) {
  const errorRegex = /error TS(\d+): (.+)/g;
  const fileRegex = /(.+)\((\d+),(\d+)\):/;
  const errors = [];
  
  let match;
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for error line
    const errorMatch = errorRegex.exec(line);
    if (errorMatch) {
      const errorCode = errorMatch[1];
      const message = errorMatch[2];
      
      // Look for file reference in previous lines
      let file = 'Unknown';
      let lineNumber = 0;
      let column = 0;
      
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const fileMatch = lines[j].match(fileRegex);
        if (fileMatch) {
          file = path.relative(config.projectRoot, fileMatch[1]);
          lineNumber = parseInt(fileMatch[2]);
          column = parseInt(fileMatch[3]);
          break;
        }
      }
      
      errors.push({
        id: `TS${errorCode}`,
        message,
        file,
        line: lineNumber,
        column,
        severity: errorCode.startsWith('1') || errorCode.startsWith('2') ? 'error' : 'warning'
      });
    }
  }
  
  return errors;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(errors) {
  const timestamp = new Date().toISOString();
  const reportFile = path.join(config.reportDir, `report-${Date.now()}.html`);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeScript Error Report - HmarePanditJi</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }
    .card .value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    .card.success .value { color: #22c55e; }
    .card.error .value { color: #ef4444; }
    .card.warning .value { color: #f59e0b; }
    .error-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .error-item {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
    }
    .error-item:last-child {
      border-bottom: none;
    }
    .error-item.error {
      border-left: 4px solid #ef4444;
    }
    .error-item.warning {
      border-left: 4px solid #f59e0b;
    }
    .error-code {
      font-weight: bold;
      color: #ef4444;
    }
    .error-file {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .error-message {
      margin: 10px 0;
      color: #333;
    }
    .no-errors {
      text-align: center;
      padding: 40px;
      color: #22c55e;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 TypeScript Error Report</h1>
    <p>HmarePanditJi Project</p>
    <p>Generated: ${timestamp}</p>
  </div>
  
  <div class="summary">
    <div class="card ${errors.length === 0 ? 'success' : 'error'}">
      <h3>Total Errors</h3>
      <div class="value">${errors.length}</div>
    </div>
    <div class="card">
      <h3>Files Affected</h3>
      <div class="value">${new Set(errors.map(e => e.file)).size}</div>
    </div>
    <div class="card warning">
      <h3>Unique Error Codes</h3>
      <div class="value">${new Set(errors.map(e => e.id)).size}</div>
    </div>
  </div>
  
  <h2>Error Details</h2>
  
  ${errors.length === 0 
    ? '<div class="no-errors">✅ No TypeScript errors found! All files compile successfully.</div>'
    : `
  <div class="error-list">
    ${errors.map(error => `
      <div class="error-item ${error.severity}">
        <span class="error-code">${error.id}</span>
        <div class="error-message">${error.message}</div>
        <div class="error-file">📁 ${error.file}:${error.line}:${error.column}</div>
      </div>
    `).join('')}
  </div>
  `}
  
  <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
    Generated by HmarePanditJi QA TypeScript Checker
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportFile, html);
  console.log(`${colors.blue}[INFO]${colors.reset} HTML report generated: ${reportFile}`);
  
  return reportFile;
}

/**
 * Group errors by file for better tracking
 */
function groupErrorsByFile(errors) {
  const grouped = {};
  
  errors.forEach(error => {
    if (!grouped[error.file]) {
      grouped[error.file] = [];
    }
    grouped[error.file].push(error);
  });
  
  return grouped;
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.blue}[INFO]${colors.reset} Project Root: ${config.projectRoot}`);
  console.log(`${colors.blue}[INFO]${colors.reset} TypeScript Config: ${config.tsConfig}\n`);
  
  // Run TypeScript check
  const result = runTypeScriptCheck();
  
  if (generateReport) {
    generateHTMLReport(result.errors);
  }
  
  // Print summary
  console.log(`\n${colors.cyan}════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════════${colors.reset}`);
  console.log(`Total Errors: ${colors.red}${result.errors.length}${colors.reset}`);
  console.log(`Files Affected: ${colors.yellow}${new Set(result.errors.map(e => e.file)).size}${colors.reset}`);
  
  if (result.errors.length > 0) {
    const grouped = groupErrorsByFile(result.errors);
    
    console.log(`\n${colors.cyan}Errors by File:${colors.reset}`);
    Object.entries(grouped).forEach(([file, fileErrors]) => {
      console.log(`\n  📁 ${file} (${fileErrors.length} errors)`);
      fileErrors.forEach(error => {
        console.log(`    - ${error.id}: ${error.message}`);
      });
    });
    
    console.log(`\n${colors.yellow}⚠️  Next Steps:${colors.reset}`);
    console.log(`  1. Create GitHub Issues for each file with errors`);
    console.log(`  2. Assign to developers for fixing`);
    console.log(`  3. Track fixes in QA_TYPESCRIPT_ERROR_TRACKING.md`);
    console.log(`  4. Verify fixes after developers submit`);
  } else {
    console.log(`\n${colors.green}✅ All TypeScript files compile successfully!${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}════════════════════════════════════════════${colors.reset}\n`);
  
  // Exit with error code if errors found
  process.exit(result.errors.length > 0 ? 1 : 0);
}

// Run main function
main();

// Watch mode (if enabled)
if (watchMode) {
  console.log(`${colors.blue}[INFO]${colors.reset} Watch mode enabled. Monitoring for changes...\n`);
  
  const chokidar = require('chokidar');
  const watcher = chokidar.watch('apps/pandit/src/**/*.{ts,tsx}', {
    cwd: config.projectRoot,
    ignored: /node_modules/,
    persistent: true
  });
  
  let timeout;
  watcher.on('change', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.clear();
      main();
    }, 1000);
  });
}
