/**
 * AI Tester Runner
 * 
 * Runs Gemini CLI (Antigravity engine) in headless mode to test the codebase
 * and outputs results to test-results/ for Qwen Code to fix
 * 
 * Usage:
 *   node scripts/run-ai-tester.js "Find and fix all bugs in the authentication flow"
 *   node scripts/run-ai-tester.js --test "Run all tests and report failures"
 *   node scripts/run-ai-tester.js --review "Review code quality"
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'test-results');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

function runGeminiCLI(prompt, options = {}) {
  const { 
    model = 'gemini-2.5-flash', 
    yolo = false, 
    outputFormat = 'json',
    timeout = 300000 
  } = options;

  const outputFile = path.join(RESULTS_DIR, `result-${TIMESTAMP}.json`);
  const markdownFile = path.join(RESULTS_DIR, `report-${TIMESTAMP}.md`);

  const args = [
    '-p', prompt,
    '--model', model,
    '--output-format', outputFormat,
  ];

  if (yolo) {
    args.push('--yolo');
  }

  log(`Running: gemini ${args.join(' ')}`);

  try {
    // Run gemini cli and capture output
    const result = execSync(`gemini ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    // Parse and save JSON result
    let jsonResult;
    try {
      jsonResult = JSON.parse(result);
    } catch {
      jsonResult = { response: result, stats: {} };
    }

    fs.writeFileSync(outputFile, JSON.stringify(jsonResult, null, 2));
    log(`JSON result saved: ${outputFile}`, 'success');

    // Extract and save markdown report
    const markdownReport = `# AI Test Report

**Generated:** ${new Date().toISOString()}
**Model:** ${model}
**Prompt:** ${prompt}

---

## Response

${jsonResult.response || 'No response'}

---

## Stats

\`\`\`json
${JSON.stringify(jsonResult.stats || {}, null, 2)}
\`\`\`

---

## Next Steps

1. Review the findings above
2. Tell Qwen Code: "Check test-results/report-${TIMESTAMP}.md and fix the issues"
3. Qwen Code will read this file and provide fixes
`;

    fs.writeFileSync(markdownFile, markdownReport);
    log(`Markdown report saved: ${markdownFile}`, 'success');

    return {
      success: true,
      jsonFile: outputFile,
      markdownFile,
      result: jsonResult
    };

  } catch (error) {
    log(`CLI execution failed: ${error.message}`, 'error');
    
    const errorReport = `# AI Test Report (Error)

**Generated:** ${new Date().toISOString()}
**Error:** ${error.message}

**Prompt:** ${prompt}

---

The CLI command failed. Check the error above and retry.
`;
    
    const errorFile = path.join(RESULTS_DIR, `error-${TIMESTAMP}.md`);
    fs.writeFileSync(errorFile, errorReport);
    
    return {
      success: false,
      error: error.message,
      errorFile
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║           AI Tester Runner (Antigravity Engine)          ║
╠══════════════════════════════════════════════════════════╣
║  Usage:                                                  ║
║    node scripts/run-ai-tester.js "<your prompt>"         ║
║                                                          ║
║  Examples:                                               ║
║    node scripts/run-ai-tester.js "Find all bugs"         ║
║    node scripts/run-ai-tester.js --test                  ║
║    node scripts/run-ai-tester.js --review                ║
║    node scripts/run-ai-tester.js "Fix auth flow" --yolo  ║
╚══════════════════════════════════════════════════════════╝
    `);
    process.exit(0);
  }

  // Parse arguments
  let prompt = '';
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--yolo') {
      options.yolo = true;
    } else if (args[i] === '--model' && args[i + 1]) {
      options.model = args[++i];
    } else if (args[i] === '--test') {
      prompt = 'Run all tests in this project. Report any failures, errors, or issues found. Be thorough.';
    } else if (args[i] === '--review') {
      prompt = 'Review this codebase for code quality, security issues, performance problems, and best practices violations. Provide a detailed report.';
    } else if (!args[i].startsWith('--')) {
      prompt = args[i];
    }
  }

  if (!prompt) {
    log('No prompt provided. Use --test, --review, or provide a custom prompt.', 'error');
    process.exit(1);
  }

  log(`Starting AI tester with prompt: "${prompt}"`);
  
  const result = runGeminiCLI(prompt, options);

  console.log('\n' + '='.repeat(60));
  if (result.success) {
    log('AI testing completed!', 'success');
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│  NEXT STEP:                                                 │
│  Tell Qwen Code:                                            │
│  "Check test-results/report-${TIMESTAMP}.md and fix issues" │
│                                                             │
│  Or simply paste the markdown file content in the chat.     │
└─────────────────────────────────────────────────────────────┘
    `);
  } else {
    log('AI testing failed. Check error file.', 'error');
    console.log(`Error file: ${result.errorFile}`);
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
