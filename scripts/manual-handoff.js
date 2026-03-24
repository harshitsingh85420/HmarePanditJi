#!/usr/bin/env node
/**
 * Manual Test → Fix Handoff System
 * 
 * NO API KEY REQUIRED!
 * 
 * This script:
 * 1. Runs your tests
 * 2. Captures all errors
 * 3. Creates a ready-to-copy prompt for Qwen Code
 * 4. You paste the prompt into Qwen Code chat
 * 5. Qwen suggests fixes
 * 6. You apply the fixes
 * 
 * Usage:
 *   node scripts/manual-handoff.js
 *   node scripts/manual-handoff.js --test browser-test.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'manual-fix-reports');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function runTests(testCommand) {
  console.log('🧪 Running tests...\n');
  
  let output = '';
  let exitCode = 0;
  
  try {
    output = execSync(testCommand, {
      encoding: 'utf-8',
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });
  } catch (error) {
    output = error.stdout || error.stderr || error.message;
    exitCode = error.status || 1;
  }
  
  return {
    success: exitCode === 0,
    output,
    exitCode
  };
}

function createHandoffPrompt(testOutput) {
  return `# 🐛 Bug Fix Request - HmarePanditJi

## Test Results

The tests are failing. Please analyze the errors below and provide fixes.

---

## Test Output

\`\`\`
${testOutput}
\`\`\`

---

## Project Context

- **Project**: HmarePanditJi - Hindu pandit booking platform
- **Tech Stack**: Next.js, React, TypeScript, TailwindCSS, Puppeteer
- **Test Framework**: Custom Puppeteer browser tests

---

## What I Need

1. **Identify the root cause** of each test failure
2. **Provide specific code fixes** with:
   - File path
   - Exact code to replace (old code)
   - New code to replace it with
3. **Explain what was wrong** and how your fix addresses it

---

## Format for Fixes

Please use this format for each fix:

### Fix #1: [Brief description]

**File**: \`path/to/file.js\`

**Problem**: [What's wrong]

**Solution**:

\`\`\`javascript
// OLD CODE (find and replace this):
[exact old code]

// NEW CODE (replace with this):
[new code]
\`\`\`

---

## Additional Context

- Tests run against: http://localhost:3002
- Test file: browser-test.js
- Looking for: Working UI elements, correct transitions, proper functionality

---

🙏 Please provide complete, working fixes. Thank you!
`;
}

function main() {
  const args = process.argv.slice(2);
  let testCommand = 'node browser-test.js';
  
  if (args.includes('--test') && args[args.indexOf('--test') + 1]) {
    testCommand = `node ${args[args.indexOf('--test') + 1]}`;
  }
  
  ensureDir(OUTPUT_DIR);
  
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     📋 Manual Test → Fix Handoff System                 ║
╠══════════════════════════════════════════════════════════╣
║  NO API KEY REQUIRED!                                   ║
║                                                          ║
║  This script will:                                      ║
║  1. Run your tests                                      ║
║  2. Create a ready-to-copy prompt                       ║
║  3. You paste it into Qwen Code chat                    ║
║  4. Qwen provides fixes                                 ║
║  5. You apply the fixes                                 ║
╚══════════════════════════════════════════════════════════╝
  `);
  
  // Step 1: Run tests
  const testResult = runTests(testCommand);
  
  console.log(`\n${testResult.success ? '✅' : '❌'} Tests ${testResult.success ? 'PASSED' : 'FAILED'}\n`);
  
  // Step 2: Create handoff prompt
  const prompt = createHandoffPrompt(testResult.output);
  
  // Step 3: Save to file
  const outputFile = path.join(OUTPUT_DIR, `fix-request-${TIMESTAMP}.md`);
  fs.writeFileSync(outputFile, prompt);
  
  console.log('='.repeat(60));
  console.log('\n📋 READY TO COPY!\n');
  console.log('='.repeat(60));
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  OPTION 1: Copy from file                                  │
│                                                            │
│  📄 File: ${outputFile.padEnd(43)}│
│                                                            │
│  Run: cat ${outputFile}                                  │
│  Then copy the entire content                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  OPTION 2: Copy from console below                         │
│                                                            │
│  Scroll down and copy the entire prompt                   │
│  (starts with "# 🐛 Bug Fix Request")                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NEXT STEP:                                                │
│  1. Copy the prompt (from file or console)                │
│  2. Open Qwen Code chat                                    │
│  3. Paste the prompt                                       │
│  4. Qwen will provide fixes                                │
│  5. Apply the fixes to your code                           │
└─────────────────────────────────────────────────────────────┘
`);

  // Also print the prompt for easy copying
  console.log('\n\n');
  console.log(prompt);
  
  // Save raw test output too
  const rawOutputFile = path.join(OUTPUT_DIR, `test-output-${TIMESTAMP}.txt`);
  fs.writeFileSync(rawOutputFile, testResult.output);
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n💾 Raw test output saved: ${rawOutputFile}\n`);
}

main();
