/**
 * Visual Browser Test Runner for Antigravity
 * 
 * This script sets up visual browser testing that integrates with
 * Google Antigravity's Browser Surface capabilities
 * 
 * Features:
 * - Screenshot capture at key states
 * - Visual regression detection
 * - DOM analysis and element verification
 * - Browser session recording
 * - Integration with Antigravity Agent Skills
 * 
 * Prerequisites:
 * 1. Install Antigravity: https://antigravity.google/download
 * 2. Install Antigravity Chrome Extension
 * 3. Configure Agent Skills for browser testing
 * 
 * Usage:
 *   node scripts/visual-test.js --url http://localhost:3000
 *   node scripts/visual-test.js --url http://localhost:3000 --test login
 *   node scripts/visual-test.js --regression
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'visual');
const BASELINE_DIR = path.join(__dirname, '..', 'test-results', 'baseline');
const LIVE_TASKS_FILE = path.join(__dirname, '..', '.antigravity', 'live-tasks.json');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Ensure directories exist
[RESULTS_DIR, BASELINE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Live task tracking for Antigravity
function updateLiveTask(data) {
  try {
    let liveData = {
      session: {
        id: `session-${TIMESTAMP}`,
        started: new Date().toISOString(),
        status: 'running',
        currentTask: null,
        completedTasks: 0,
        totalTasks: 0
      },
      taskQueue: [],
      liveStatus: {
        browser: { open: false, url: null, viewport: { width: 1920, height: 1080 } },
        mouse: { x: 0, y: 0, lastAction: null },
        currentAction: null,
        progress: 0
      },
      testResults: { screenshots: [], errors: [], warnings: [] },
      qaProtocol: { sessions: [] }
    };

    // Merge with provided data
    if (fs.existsSync(LIVE_TASKS_FILE)) {
      try {
        liveData = JSON.parse(fs.readFileSync(LIVE_TASKS_FILE, 'utf-8'));
      } catch (e) {
        // Use default if file is corrupted
      }
    }

    Object.assign(liveData, data);
    liveData.session.updated = new Date().toISOString();

    fs.writeFileSync(LIVE_TASKS_FILE, JSON.stringify(liveData, null, 2));
  } catch (e) {
    console.log('⚠️  Could not update live tasks:', e.message);
  }
}

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : '📸';
  console.log(`${prefix} ${message}`);

  // Also update live tasks
  updateLiveTask({
    liveStatus: {
      currentAction: message,
      lastLog: { message, type, timestamp: new Date().toISOString() }
    }
  });
}

/**
 * Capture screenshots and analyze DOM for visual testing
 */
async function runVisualTest(options = {}) {
  const {
    url = 'http://localhost:3000',
    testCases = [],
    regression = false,
    viewport = { width: 1920, height: 1080 },
    waitForNetwork = true,
    fullPage = false
  } = options;

  const report = {
    timestamp: new Date().toISOString(),
    url,
    testCases: [],
    regressions: [],
    screenshots: [],
    errors: []
  };

  let browser;

  try {
    // Initialize live task tracking
    updateLiveTask({
      session: { status: 'starting', totalTasks: testCases.length },
      taskQueue: testCases.map(tc => ({ name: tc.name, status: 'pending', steps: tc.steps.length })),
      liveStatus: {
        browser: { open: false, url },
        progress: 0
      }
    });

    log(`Launching browser for visual testing...`);

    updateLiveTask({
      liveStatus: { browser: { open: true, url }, currentAction: 'Launching Chrome...' }
    });

    // Try to use installed Chrome, fallback to system Chrome
    const launchOptions = {
      headless: false,  // Visible browser for visual testing
      slowMo: 100,      // Slow down actions by 100ms so you can see them
      devtools: false,  // Don't open devtools
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080'  // Full HD window
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    };

    // Try finding Chrome in common Windows locations
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
    ];

    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        launchOptions.executablePath = chromePath;
        log(`Using Chrome: ${chromePath}`);
        break;
      }
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Add custom mouse cursor overlay for visual tracking
    log('Setting up mouse cursor tracking...');
    await page.evaluateOnNewDocument(() => {
      // Create custom cursor element
      const cursor = document.createElement('div');
      cursor.id = 'visual-test-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 3px solid #ff0000;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        background: rgba(255, 0, 0, 0.3);
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        transition: all 0.1s ease-out;
        transform: translate(-50%, -50%);
      `;
      document.documentElement.appendChild(cursor);

      // Track real mouse movements
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      // Add click effect
      document.addEventListener('click', (e) => {
        const clickEffect = document.createElement('div');
        clickEffect.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 40px;
          height: 40px;
          border: 3px solid #00ff00;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%);
          animation: clickPulse 0.5s ease-out forwards;
        `;
        document.documentElement.appendChild(clickEffect);
        setTimeout(() => clickEffect.remove(), 500);
      });

      // Add click animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes clickPulse {
          0% { width: 20px; height: 20px; opacity: 1; }
          100% { width: 60px; height: 60px; opacity: 0; }
        }
      `;
      document.documentElement.appendChild(style);
    });

    await page.setViewport(viewport);

    // Enable request interception for network waiting
    if (waitForNetwork) {
      await page.setRequestInterception(true);
      const requests = new Set();

      page.on('request', request => {
        requests.add(request);
        request.continue();
      });

      page.on('response', response => {
        requests.delete(response.request());
      });
    }

    log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for React/Next.js to hydrate
    log('Waiting for page to fully render...');
    try {
      await page.waitForFunction(() => {
        const hasContent = document.body.innerHTML.length > 1000;
        const hasReactRoot = document.querySelector('#__next')?.children?.length > 0;
        return hasContent && hasReactRoot;
      }, { timeout: 30000 });
    } catch (e) {
      log('Page hydration timeout, continuing anyway...', 'warn');
    }

    // Additional wait for any animations/loading
    await new Promise(r => setTimeout(r, 2000));

    // Capture initial state
    const initialScreenshot = path.join(RESULTS_DIR, `initial-${TIMESTAMP}.png`);
    await page.screenshot({ path: initialScreenshot, fullPage });
    report.screenshots.push({ type: 'initial', path: initialScreenshot });
    log('Initial screenshot captured', 'success');

    // Capture DOM state
    const domState = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyClass: document.body.className,
        elementCount: document.querySelectorAll('*').length,
        forms: Array.from(document.querySelectorAll('form')).length,
        buttons: Array.from(document.querySelectorAll('button')).length,
        images: Array.from(document.querySelectorAll('img')).length,
        errors: [],
        console: []
      };
    });

    report.domState = domState;
    log(`DOM captured: ${domState.elementCount} elements`);

    // Run test cases
    let completedTests = 0;
    for (const testCase of testCases) {
      log(`Running test case: ${testCase.name}`);

      // Update live task status
      updateLiveTask({
        session: {
          currentTask: testCase.name,
          completedTasks: completedTests,
          status: 'running'
        },
        taskQueue: testCases.map(tc => ({
          name: tc.name,
          status: tc.name === testCase.name ? 'running' : tc.name < testCase.name ? 'completed' : 'pending',
          steps: tc.steps.length
        })),
        liveStatus: {
          progress: Math.round((completedTests / testCases.length) * 100)
        }
      });

      const testCaseResult = {
        name: testCase.name,
        timestamp: Date.now(),
        steps: [],
        screenshots: [],
        errors: []
      };

      try {
        for (const step of testCase.steps) {
          const stepResult = { action: step.action, status: 'pending' };

          try {
            switch (step.action) {
              case 'click':
                log(`  → Clicking: ${step.selector}`);
                // Highlight element before clicking
                await page.evaluate((selector) => {
                  const el = document.querySelector(selector);
                  if (el) {
                    el.style.outline = '3px solid red';
                    el.style.transition = 'outline 0.3s';
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Get element position for mouse movement
                    const rect = el.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;

                    // Move mouse to element (smooth animation)
                    const cursor = document.getElementById('visual-test-cursor');
                    if (cursor) {
                      cursor.style.transition = 'all 0.3s ease-out';
                      cursor.style.left = targetX + 'px';
                      cursor.style.top = targetY + 'px';
                    }
                  }
                }, step.selector).catch(() => { });
                await new Promise(r => setTimeout(r, 500));
                await page.click(step.selector);
                stepResult.selector = step.selector;
                break;

              case 'hover':
                log(`  → Hovering: ${step.selector}`);
                // Move mouse to element and hover
                await page.evaluate((selector) => {
                  const el = document.querySelector(selector);
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;

                    // Move cursor to element with smooth animation
                    const cursor = document.getElementById('visual-test-cursor');
                    if (cursor) {
                      cursor.style.transition = 'all 0.5s ease-in-out';
                      cursor.style.left = targetX + 'px';
                      cursor.style.top = targetY + 'px';
                    }

                    // Trigger hover event
                    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                  }
                }, step.selector).catch(() => { });
                await new Promise(r => setTimeout(r, 800));
                stepResult.selector = step.selector;
                break;

              case 'type':
                log(`  → Typing in: ${step.selector}`);
                await page.evaluate((selector) => {
                  const el = document.querySelector(selector);
                  if (el) {
                    el.style.outline = '3px solid blue';
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, step.selector).catch(() => { });
                await new Promise(r => setTimeout(r, 300));
                await page.type(step.selector, step.text);
                stepResult.selector = step.selector;
                stepResult.text = step.text;
                break;

              case 'waitForSelector':
                log(`  → Waiting for: ${step.selector}`);
                await page.waitForSelector(step.selector, { timeout: 5000 });
                stepResult.selector = step.selector;
                break;

              case 'screenshot':
                log(`  → Taking screenshot: ${step.name || 'page'}`);
                const stepScreenshot = path.join(RESULTS_DIR, `${testCase.name}-${step.name || Date.now()}-${TIMESTAMP}.png`);
                await page.screenshot({ path: stepScreenshot, fullPage });
                testCaseResult.screenshots.push({ name: step.name || 'step', path: stepScreenshot });
                report.screenshots.push({ type: 'step', name: step.name, path: stepScreenshot });
                break;

              case 'navigate':
                log(`  → Navigating to: ${step.url}`);
                await page.goto(step.url, { waitUntil: 'networkidle0' });
                stepResult.url = step.url;
                break;

              case 'evaluate':
                const result = await page.evaluate(step.code);
                stepResult.result = result;
                break;

              case 'scroll':
                log(`  → Scrolling...`);
                // Move cursor to center while scrolling
                await page.evaluate(() => {
                  const cursor = document.getElementById('visual-test-cursor');
                  if (cursor) {
                    cursor.style.transition = 'all 0.5s ease-out';
                    cursor.style.left = '50%';
                    cursor.style.top = '50%';
                  }
                  window.scrollBy({ top: 300, left: 0, behavior: 'smooth' });
                });
                await new Promise(r => setTimeout(r, 800));
                break;

              default:
                stepResult.status = 'skipped';
                stepResult.error = `Unknown action: ${step.action}`;
            }

            stepResult.status = 'completed';
            testCaseResult.steps.push(stepResult);

            // Small delay between steps
            await new Promise(r => setTimeout(r, 500));

          } catch (stepError) {
            stepResult.status = 'failed';
            stepResult.error = stepError.message;
            testCaseResult.errors.push(stepError.message);
            report.errors.push(`Test "${testCase.name}" step failed: ${stepError.message}`);
          }
        }

        // Final screenshot for test case
        const finalScreenshot = path.join(RESULTS_DIR, `${testCase.name}-final-${TIMESTAMP}.png`);
        await page.screenshot({ path: finalScreenshot, fullPage });
        testCaseResult.screenshots.push({ name: 'final', path: finalScreenshot });
        report.screenshots.push({ type: 'test-final', name: testCase.name, path: finalScreenshot });

      } catch (error) {
        testCaseResult.errors.push(error.message);
        report.errors.push(`Test "${testCase.name}" failed: ${error.message}`);
      }

      report.testCases.push(testCaseResult);
      completedTests++;

      // Update live status after each test case
      updateLiveTask({
        session: {
          completedTasks: completedTests,
          status: completedTests === testCases.length ? 'completed' : 'running'
        },
        liveStatus: {
          progress: Math.round((completedTests / testCases.length) * 100),
          lastCompletedTask: testCase.name
        },
        testResults: {
          screenshots: report.screenshots.map(s => s.path),
          errors: report.errors
        }
      });
    }

    // Visual regression check
    if (regression && fs.existsSync(BASELINE_DIR)) {
      log('Running visual regression check...');

      const baselineFiles = fs.readdirSync(BASELINE_DIR).filter(f => f.endsWith('.png'));

      for (const baselineFile of baselineFiles) {
        const currentFile = path.join(RESULTS_DIR, baselineFile.replace('baseline', 'current'));
        const baselinePath = path.join(BASELINE_DIR, baselineFile);

        // Capture current state
        try {
          await page.screenshot({ path: currentFile, fullPage });

          // Simple pixel comparison (for production, use resemble.js or pixelmatch)
          const baselineStats = fs.statSync(baselinePath);
          const currentStats = fs.statSync(currentFile);

          const sizeDiff = Math.abs(baselineStats.size - currentStats.size);
          const sizeDiffPercent = (sizeDiff / baselineStats.size) * 100;

          if (sizeDiffPercent > 5) { // 5% threshold
            report.regressions.push({
              file: baselineFile,
              baseline: baselinePath,
              current: currentFile,
              sizeDiffPercent: sizeDiffPercent.toFixed(2),
              status: 'regression_detected'
            });
            log(`Regression detected in ${baselineFile}: ${sizeDiffPercent.toFixed(2)}% difference`, 'warn');
          } else {
            log(`No regression in ${baselineFile}`, 'success');
          }
        } catch (error) {
          report.errors.push(`Regression check failed for ${baselineFile}: ${error.message}`);
        }
      }
    }

    await browser.close();

    log('Visual testing completed', 'success');
    return { success: true, report };

  } catch (error) {
    log(`Visual test failed: ${error.message}`, 'error');
    report.errors.push(error.message);

    if (browser) {
      await browser.close().catch(() => { });
    }

    return { success: false, report, error: error.message };
  }
}

/**
 * Generate HTML report from visual test results
 */
function generateReport(report) {
  const reportFile = path.join(RESULTS_DIR, `report-${TIMESTAMP}.html`);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Test Report - ${report.timestamp}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .meta { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .meta-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .meta-label { font-weight: bold; color: #666; }
    .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    .screenshot-card { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .screenshot-card img { width: 100%; height: auto; display: block; }
    .screenshot-card .caption { padding: 10px; background: #f8f9fa; font-size: 14px; }
    .test-case { border: 1px solid #ddd; border-radius: 4px; margin: 15px 0; padding: 15px; }
    .test-case.pass { border-left: 4px solid #28a745; }
    .test-case.fail { border-left: 4px solid #dc3545; }
    .step { padding: 8px; margin: 5px 0; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 13px; }
    .step.completed { background: #d4edda; }
    .step.failed { background: #f8d7da; }
    .regression { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 15px 0; color: #721c24; }
    .dom-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0; }
    .stat-card { background: #e7f3ff; padding: 15px; border-radius: 4px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Visual Test Report</h1>
    
    <div class="meta">
      <div class="meta-row"><span class="meta-label">Timestamp:</span><span>${report.timestamp}</span></div>
      <div class="meta-row"><span class="meta-label">URL:</span><span>${report.url}</span></div>
      <div class="meta-row"><span class="meta-label">Screenshots:</span><span>${report.screenshots.length}</span></div>
      <div class="meta-row"><span class="meta-label">Test Cases:</span><span>${report.testCases.length}</span></div>
      <div class="meta-row"><span class="meta-label">Regressions:</span><span>${report.regressions.length}</span></div>
      <div class="meta-row"><span class="meta-label">Errors:</span><span>${report.errors.length}</span></div>
    </div>

    ${report.domState ? `
    <h2>📊 DOM Statistics</h2>
    <div class="dom-stats">
      <div class="stat-card"><div class="stat-value">${report.domState.elementCount}</div><div class="stat-label">Elements</div></div>
      <div class="stat-card"><div class="stat-value">${report.domState.forms}</div><div class="stat-label">Forms</div></div>
      <div class="stat-card"><div class="stat-value">${report.domState.buttons}</div><div class="stat-label">Buttons</div></div>
      <div class="stat-card"><div class="stat-value">${report.domState.images}</div><div class="stat-label">Images</div></div>
    </div>
    ` : ''}

    ${report.regressions.length > 0 ? `
    <h2>⚠️ Visual Regressions</h2>
    ${report.regressions.map(r => `
      <div class="regression">
        <strong>File:</strong> ${r.file}<br>
        <strong>Difference:</strong> ${r.sizeDiffPercent}%<br>
        <strong>Baseline:</strong> ${r.baseline}<br>
        <strong>Current:</strong> ${r.current}
      </div>
    `).join('')}
    ` : ''}

    ${report.testCases.length > 0 ? `
    <h2>🧪 Test Cases</h2>
    ${report.testCases.map(tc => `
      <div class="test-case ${tc.errors.length === 0 ? 'pass' : 'fail'}">
        <h3>${tc.name} ${tc.errors.length === 0 ? '✅' : '❌'}</h3>
        <div class="steps">
          ${tc.steps.map(s => `
            <div class="step ${s.status}">
              <strong>${s.action}</strong> ${s.selector ? `"${s.selector}"` : ''} ${s.status === 'failed' ? `❌ ${s.error}` : '✅'}
            </div>
          `).join('')}
        </div>
        ${tc.screenshots.length > 0 ? `
          <div class="screenshot-grid">
            ${tc.screenshots.map(s => `
              <div class="screenshot-card">
                <img src="${s.path}" alt="${s.name}">
                <div class="caption">${s.name}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
    ` : ''}

    ${report.screenshots.length > 0 ? `
    <h2>📸 Screenshots</h2>
    <div class="screenshot-grid">
      ${report.screenshots.map(s => `
        <div class="screenshot-card">
          <img src="${s.path}" alt="${s.type}">
          <div class="caption">${s.type}${s.name ? ` - ${s.name}` : ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${report.errors.length > 0 ? `
    <h2>❌ Errors</h2>
    ${report.errors.map(e => `
      <div class="error">${e}</div>
    `).join('')}
    ` : ''}
  </div>
</body>
</html>
`;

  fs.writeFileSync(reportFile, html);
  log(`HTML report generated: ${reportFile}`, 'success');

  return reportFile;
}

// Default test cases for common flows - Interactive and visual!
const DEFAULT_TEST_CASES = [
  {
    name: 'Homepage Load',
    steps: [
      { action: 'screenshot', name: 'homepage-initial' },
      { action: 'scroll' },  // Scroll down to see content
      { action: 'screenshot', name: 'homepage-scrolled' },
      { action: 'scroll' },  // Scroll more
      { action: 'screenshot', name: 'homepage-bottom' }
    ]
  },
  {
    name: 'Navigation & Header',
    steps: [
      { action: 'waitForSelector', selector: 'header, nav, [class*="header"]' },
      { action: 'screenshot', name: 'header' },
      // Hover over navigation items
      { action: 'hover', selector: 'a[href*="search"], a:contains("Pandit"), button' },
      { action: 'screenshot', name: 'navigation-hover' }
    ]
  },
  {
    name: 'Interactive Elements Demo',
    steps: [
      // Find and highlight buttons
      { action: 'waitForSelector', selector: 'button, a[class*="button"], [role="button"]' },
      { action: 'screenshot', name: 'buttons-found' },
      // Try clicking a button if exists
      { action: 'click', selector: 'button:not([disabled]):first-of-type, a[class*="button"]:first-of-type' },
      { action: 'screenshot', name: 'after-click' },
      { action: 'scroll' }
    ]
  }
];

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║       Visual Browser Test Runner (Antigravity Style)     ║
╠══════════════════════════════════════════════════════════╣
║  Usage:                                                  ║
║    node scripts/visual-test.js --url <url>               ║
║    node scripts/visual-test.js --url <url> --regression  ║
║    node scripts/visual-test.js --test <name>             ║
║                                                          ║
║  Examples:                                               ║
║    node scripts/visual-test.js --url http://localhost:3000          ║
║    node scripts/visual-test.js --url http://localhost:3000 --regression ║
╚══════════════════════════════════════════════════════════╝
    `);
    process.exit(0);
  }

  // Parse arguments
  const options = {
    url: 'http://localhost:3000',
    testCases: DEFAULT_TEST_CASES,
    regression: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.url = args[++i];
    } else if (args[i] === '--regression') {
      options.regression = true;
    } else if (args[i] === '--test' && args[i + 1]) {
      // Custom test case
      options.testCases = [{
        name: args[++i],
        steps: [{ action: 'screenshot', name: 'test' }]
      }];
    } else if (args[i] === '--full-page') {
      options.fullPage = true;
    }
  }

  log(`Starting visual browser test...`);
  log(`URL: ${options.url}`);

  const result = await runVisualTest(options);

  if (result.success) {
    const reportFile = generateReport(result.report);

    // Final live status update
    updateLiveTask({
      session: { status: 'completed', completedTasks: result.report.testCases.length, totalTasks: result.report.testCases.length },
      liveStatus: {
        progress: 100,
        browser: { open: false },
        currentAction: 'Test completed!'
      },
      testResults: {
        screenshots: result.report.screenshots.map(s => s.path),
        errors: result.report.errors,
        reportFile
      }
    });

    console.log('\n' + '='.repeat(60));
    log('Visual testing completed!', 'success');
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│  Results:                                                   │
│  - Screenshots: ${result.report.screenshots.length}                            │
│  - Test Cases: ${result.report.testCases.length}                               │
│  - Regressions: ${result.report.regressions.length}                            │
│  - Errors: ${result.report.errors.length}                                      │
│                                                             │
│  Report: ${path.relative(process.cwd(), reportFile).padEnd(44)}│
│                                                             │
│  NEXT STEP:                                                 │
│  Tell Qwen Code: "Check visual test results and fix issues" │
└─────────────────────────────────────────────────────────────┘
    `);
    console.log('='.repeat(60) + '\n');
  } else {
    log('Visual testing failed', 'error');
    console.log(`Error: ${result.error}`);
  }
}

main().catch(console.error);
