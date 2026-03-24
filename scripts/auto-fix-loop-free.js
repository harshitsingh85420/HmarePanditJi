#!/usr/bin/env node
/**
 * Auto-Fix Loop - Automated Testing + AI Fixing (FREE - Google Gemini)
 * 
 * Uses Google Gemini API - FREE, no credit card required!
 * Get your key: https://aistudio.google.com/app/apikey
 * 
 * Usage:
 *   node scripts/auto-fix-loop-free.js
 *   node scripts/auto-fix-loop-free.js --test "browser-test.js"
 *   node scripts/auto-fix-loop-free.js --dry-run
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============== CONFIGURATION ==============
// ✅ Gemini API Key - FREE, no credit card required
const GEMINI_API_KEY = 'AIzaSyCgWinu_wBFmcAU1DiUDwY1qdJ0hZKiK5A';
// Using gemini-2.0-flash-lite for better free tier limits (15 RPM, 1000 RPD)
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const DEFAULT_CONFIG = {
  testCommand: 'node browser-test.js',
  maxIterations: 3,
  maxFixesPerIteration: 5,
  backupBeforeFix: true,
  dryRun: false,
  stopOnFirstSuccess: true,
  timeoutPerTest: 120000,
};

// ============== UTILITIES ==============
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    ai: '🤖',
    test: '🧪',
    fix: '🔧',
    loop: '🔄'
  };
  console.log(`${icons[type] || 'ℹ️'} [${timestamp}] ${message}`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createBackup(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const backupDir = path.join(__dirname, '..', 'backups', 'auto-fix');
  ensureDir(backupDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);

  fs.copyFileSync(filePath, backupPath);
  log(`Backup created: ${backupPath}`, 'warning');
  return backupPath;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============== TEST RUNNER ==============
async function runTests(testCommand) {
  log(`Running tests: ${testCommand}`, 'test');

  const startTime = Date.now();
  let output = '';
  let exitCode = 0;

  try {
    output = execSync(testCommand, {
      encoding: 'utf-8',
      timeout: DEFAULT_CONFIG.timeoutPerTest,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });
  } catch (error) {
    output = error.stdout || error.stderr || error.message;
    exitCode = error.status || 1;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    success: exitCode === 0,
    output,
    exitCode,
    duration,
    timestamp: new Date().toISOString()
  };
}

// ============== AI FIX GENERATOR (Gemini) ==============
async function generateFix(testOutput, iteration) {
  log(`Asking AI for fixes (iteration ${iteration})...`, 'ai');

  const prompt = `You are an expert debugging assistant. Analyze these test failures and provide fixes.

TEST OUTPUT:
${'='.repeat(60)}
${testOutput}
${'='.repeat(60)}

Provide your response in this EXACT JSON format:
{
  "analysis": "Brief summary of what's wrong",
  "fixes": [
    {
      "file": "relative/path/to/file.js",
      "description": "What this fix does",
      "oldCode": "The exact code to replace (must match exactly)",
      "newCode": "The complete new code"
    }
  ],
  "confidence": "high|medium|low"
}

IMPORTANT:
- Maximum ${DEFAULT_CONFIG.maxFixesPerIteration} fixes
- oldCode must match the file exactly
- Provide complete, working code
- Focus on critical issues first

Return ONLY valid JSON, no markdown.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    let fixPlan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      fixPlan = JSON.parse(jsonStr);
    } catch (parseError) {
      log(`AI response parsing failed: ${parseError.message}`, 'error');
      return {
        analysis: 'Failed to parse AI response',
        fixes: [],
        confidence: 'low',
        rawResponse: content
      };
    }

    return fixPlan;

  } catch (error) {
    log(`AI request failed: ${error.message}`, 'error');
    return {
      analysis: `AI request failed: ${error.message}`,
      fixes: [],
      confidence: 'low'
    };
  }
}

// ============== FIX APPLIER ==============
async function applyFixes(fixPlan, dryRun = false) {
  if (!fixPlan.fixes || fixPlan.fixes.length === 0) {
    log('No fixes to apply', 'info');
    return { applied: 0, failed: 0 };
  }

  log(`Applying ${fixPlan.fixes.length} fix(es)...`, 'fix');

  const results = { applied: 0, failed: 0, details: [] };

  for (const fix of fixPlan.fixes) {
    const filePath = path.resolve(fix.file);

    if (!fs.existsSync(filePath)) {
      log(`File not found: ${fix.file}`, 'error');
      results.failed++;
      results.details.push({ file: fix.file, status: 'not_found' });
      continue;
    }

    if (dryRun) {
      log(`[DRY RUN] Would fix: ${fix.file} - ${fix.description}`, 'warning');
      results.applied++;
      results.details.push({ file: fix.file, status: 'dry_run', description: fix.description });
      continue;
    }

    if (DEFAULT_CONFIG.backupBeforeFix) {
      createBackup(filePath);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      let newContent;

      if (fix.oldCode && fix.oldCode.trim()) {
        if (!content.includes(fix.oldCode)) {
          log(`Cannot find old code in ${fix.file}`, 'error');
          results.failed++;
          results.details.push({ file: fix.file, status: 'old_code_not_found' });
          continue;
        }
        newContent = content.replace(fix.oldCode, fix.newCode);
      } else {
        log(`Replacing entire file: ${fix.file}`, 'warning');
        newContent = fix.newCode;
      }

      fs.writeFileSync(filePath, newContent, 'utf-8');
      log(`Applied: ${fix.description}`, 'success');
      results.applied++;
      results.details.push({ file: fix.file, status: 'applied', description: fix.description });

    } catch (error) {
      log(`Failed to apply fix to ${fix.file}: ${error.message}`, 'error');
      results.failed++;
      results.details.push({ file: fix.file, status: 'error', error: error.message });
    }
  }

  return results;
}

// ============== SAVE REPORT ==============
function saveIterationReport(iteration, testResult, fixPlan, applyResult) {
  const reportDir = path.join(__dirname, '..', 'auto-fix-reports');
  ensureDir(reportDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(reportDir, `iteration-${iteration}-${timestamp}.json`);

  const report = {
    iteration,
    testResult,
    fixPlan,
    applyResult,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Report saved: ${reportPath}`, 'info');

  return reportPath;
}

// ============== MAIN LOOP ==============
async function runAutoFixLoop() {
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║           ⚠️  GEMINI API KEY NOT SET                     ║
╠══════════════════════════════════════════════════════════╣
║  You need a FREE Gemini API key to use this script.     ║
║                                                          ║
║  Steps:                                                  ║
║  1. Go to: https://aistudio.google.com/app/apikey        ║
║  2. Sign in with your Google account                     ║
║  3. Click "Get API Key"                                  ║
║  4. Copy the key                                         ║
║  5. Paste it in scripts/auto-fix-loop-free.js            ║
║     (replace 'YOUR_GEMINI_API_KEY')                      ║
║                                                          ║
║  It's FREE and doesn't require a credit card!            ║
╚══════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════╗
║         🔄 Auto-Fix Loop (FREE - Google Gemini)          ║
╠══════════════════════════════════════════════════════════╣
║  Test Command: ${DEFAULT_CONFIG.testCommand.padEnd(40)}║
║  Max Iterations: ${String(DEFAULT_CONFIG.maxIterations).padEnd(40)}║
║  Max Fixes/Iteration: ${String(DEFAULT_CONFIG.maxFixesPerIteration).padEnd(35)}║
║  Backup Before Fix: ${String(DEFAULT_CONFIG.backupBeforeFix).padEnd(35)}║
║  Dry Run: ${String(DEFAULT_CONFIG.dryRun).padEnd(47)}║
╚══════════════════════════════════════════════════════════╝
  `);

  if (DEFAULT_CONFIG.dryRun) {
    log('DRY RUN MODE - No actual fixes will be applied', 'warning');
  }

  let iteration = 0;
  let lastTestResult = null;
  const history = [];

  while (iteration < DEFAULT_CONFIG.maxIterations) {
    iteration++;
    log(`Starting iteration ${iteration}/${DEFAULT_CONFIG.maxIterations}`, 'loop');

    const testResult = await runTests(DEFAULT_CONFIG.testCommand);
    lastTestResult = testResult;

    log(`Test completed in ${testResult.duration}s - ${testResult.success ? 'PASSED' : 'FAILED'}`, 'test');

    const outputDir = path.join(__dirname, '..', 'test-outputs');
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, `test-output-iteration-${iteration}.txt`);
    fs.writeFileSync(outputPath, testResult.output);

    if (testResult.success) {
      log('🎉 All tests passed!', 'success');
      if (DEFAULT_CONFIG.stopOnFirstSuccess) {
        log('Stopping on first success', 'success');
        break;
      }
    }

    const fixPlan = await generateFix(testResult.output, iteration);

    log(`AI Analysis: ${fixPlan.analysis}`, 'ai');
    log(`Confidence: ${fixPlan.confidence}`, 'ai');
    log(`Proposed fixes: ${fixPlan.fixes?.length || 0}`, 'ai');

    const applyResult = await applyFixes(fixPlan, DEFAULT_CONFIG.dryRun);

    log(`Fixes applied: ${applyResult.applied}, Failed: ${applyResult.failed}`, 'fix');

    const reportPath = saveIterationReport(iteration, testResult, fixPlan, applyResult);

    history.push({
      iteration,
      testPassed: testResult.success,
      fixesApplied: applyResult.applied,
      fixesFailed: applyResult.failed,
      reportPath
    });

    if (iteration < DEFAULT_CONFIG.maxIterations && !testResult.success) {
      log('Waiting 5 seconds before next iteration...', 'loop');
      await sleep(5000);
    }
  }

  console.log('\n' + '='.repeat(60));
  log('AUTO-FIX LOOP COMPLETED', 'success');
  console.log('='.repeat(60));
  console.log(`
📊 FINAL SUMMARY:
┌─────────────────────────────────────────────────────────────┐
│  Total Iterations: ${String(iteration).padEnd(38)}│
│  Final Test Status: ${(lastTestResult?.success ? 'PASSED ✅' : 'FAILED ❌').padEnd(38)}│
│  Total Fixes Applied: ${String(history.reduce((sum, h) => sum + h.fixesApplied, 0)).padEnd(35)}│
│  Total Fixes Failed: ${String(history.reduce((sum, h) => sum + h.fixesFailed, 0)).padEnd(35)}│
└─────────────────────────────────────────────────────────────┘

📁 ITERATION HISTORY:
${history.map(h => `  Iteration ${h.iteration}: ${h.testPassed ? '✅ Passed' : '❌ Failed'} | Fixes: ${h.fixesApplied}/${h.fixesApplied + h.fixesFailed}`).join('\n')}

📄 REPORTS SAVED TO: auto-fix-reports/
📝 TEST OUTPUTS SAVED TO: test-outputs/
  `);

  if (!lastTestResult?.success) {
    console.log(`
⚠️  WARNING: Tests still failing after ${iteration} iterations.

NEXT STEPS:
1. Review the reports in auto-fix-reports/
2. Manually check the failing tests
3. Consider increasing max-iterations or adjusting the test command
4. Some issues may require human intervention
`);
  }

  return {
    success: lastTestResult?.success || false,
    iterations: iteration,
    history
  };
}

// ============== COMMAND LINE PARSING ==============
function parseArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--test' && args[i + 1]) {
      DEFAULT_CONFIG.testCommand = `node ${args[++i]}`;
    } else if (args[i] === '--max-iterations' && args[i + 1]) {
      DEFAULT_CONFIG.maxIterations = parseInt(args[++i], 10);
    } else if (args[i] === '--max-fixes' && args[i + 1]) {
      DEFAULT_CONFIG.maxFixesPerIteration = parseInt(args[++i], 10);
    } else if (args[i] === '--dry-run') {
      DEFAULT_CONFIG.dryRun = true;
    } else if (args[i] === '--no-backup') {
      DEFAULT_CONFIG.backupBeforeFix = false;
    } else if (args[i] === '--no-stop-on-success') {
      DEFAULT_CONFIG.stopOnFirstSuccess = false;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Auto-Fix Loop (FREE - Google Gemini API)

Usage:
  node scripts/auto-fix-loop-free.js [options]

Options:
  --test <file>           Test script to run (default: browser-test.js)
  --max-iterations <n>    Maximum iterations (default: 3)
  --max-fixes <n>         Maximum fixes per iteration (default: 5)
  --dry-run               Analyze only, don't apply fixes
  --no-backup             Skip creating backups before fixes
  --no-stop-on-success    Continue even after tests pass
  --help, -h              Show this help message

🔑 GET FREE API KEY:
  1. Go to: https://aistudio.google.com/app/apikey
  2. Sign in with Google
  3. Click "Get API Key"
  4. Paste in script (replace 'YOUR_GEMINI_API_KEY')

Examples:
  node scripts/auto-fix-loop-free.js
  node scripts/auto-fix-loop-free.js --test browser-test.js
  node scripts/auto-fix-loop-free.js --max-iterations 5 --dry-run
`);
      process.exit(0);
    }
  }
}

// ============== ENTRY POINT ==============
(async () => {
  try {
    parseArgs();
    const result = await runAutoFixLoop();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error.stack);
    process.exit(1);
  }
})();
