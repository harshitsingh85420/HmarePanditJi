/**
 * Qwen Code Auto-Fix Trigger
 * 
 * This script reads the latest AI test results and prepares them for Qwen Code
 * to automatically fix the issues found.
 * 
 * Usage:
 *   node scripts/qwen-fix.js
 *   node scripts/qwen-fix.js --latest
 *   node scripts/qwen-fix.js --file test-results/result-xxx.json
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

function getLatestReport() {
  if (!fs.existsSync(RESULTS_DIR)) {
    return null;
  }

  const files = fs.readdirSync(RESULTS_DIR)
    .filter(f => f.endsWith('.json') || f.endsWith('.md'))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  return path.join(RESULTS_DIR, files[0]);
}

function readReport(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (filePath.endsWith('.json')) {
    const data = JSON.parse(content);
    return {
      type: 'json',
      response: data.response || '',
      stats: data.stats || {},
      raw: data
    };
  } else {
    return {
      type: 'markdown',
      content,
      raw: content
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  let filePath = null;

  if (args.includes('--latest')) {
    filePath = getLatestReport();
  } else if (args.includes('--file') && args[args.indexOf('--file') + 1]) {
    filePath = path.resolve(args[args.indexOf('--file') + 1]);
  } else {
    filePath = getLatestReport();
  }

  if (!filePath || !fs.existsSync(filePath)) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║              No Test Results Found                       ║
╠══════════════════════════════════════════════════════════╣
║  Run the AI tester first:                                ║
║    node scripts/run-ai-tester.js "Find bugs"             ║
║                                                          ║
║  Then run this script to prepare fixes.                  ║
╚══════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }

  const report = readReport(filePath);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║           Test Results Ready for Qwen Code               ║
╠══════════════════════════════════════════════════════════╣
║  File: ${filePath.padEnd(48)}║
║  Type: ${report.type.padEnd(49)}║
╚══════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────┐
│  COPY THIS PROMPT TO QWEN CODE:                          │
└──────────────────────────────────────────────────────────┘

Here are the AI test results. Analyze and fix all issues:

${'`'.repeat(3)}
${report.type === 'json' ? report.response : report.content}
${'`'.repeat(3)}

Please:
1. Identify all bugs, errors, or issues mentioned
2. Provide code fixes for each issue
3. Explain what was wrong and how you fixed it

---

┌──────────────────────────────────────────────────────────┐
│  OR: Simply tell Qwen Code:                              │
│  "Check ${path.relative(process.cwd(), filePath)}"        │
│  It will read the file and fix issues automatically.     │
└──────────────────────────────────────────────────────────┘
`);
}

main();
