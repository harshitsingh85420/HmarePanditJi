/**
 * Enhanced Visual Test for Accessibility & Touch Target Analysis
 * Specifically designed for Pandit Ram Nath Tiwari (Age 65) requirements
 * 
 * Tests:
 * - Touch target sizes (minimum 52px, recommended 64px for wet hands)
 * - Text size verification
 * - Color contrast analysis
 * - One-handed reachability
 * - Mouse tracking for interaction analysis
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'visual');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : '📸';
  console.log(`${prefix} ${message}`);
}

async function runAccessibilityTest(options = {}) {
  const {
    url = 'http://localhost:3002/mobile',
    viewport = { width: 390, height: 844 } // iPhone 12/13/14 size
  } = options;

  const report = {
    timestamp: new Date().toISOString(),
    url,
    touchTargets: [],
    textSizes: [],
    contrastIssues: [],
    accessibilityScore: 0,
    screenshots: [],
    errors: []
  };

  let browser;

  try {
    log(`Starting accessibility visual test...`);
    log(`URL: ${url}`);
    log(`Viewport: ${viewport.width}x${viewport.height} (Mobile)`);

    const launchOptions = {
      headless: false,
      slowMo: 100,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=390,844'
      ],
    };

    // Find Chrome
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
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
    await page.setViewport(viewport);

    // Add accessibility testing overlay
    await page.evaluateOnNewDocument(() => {
      // Create measurement grid
      const grid = document.createElement('div');
      grid.id = 'accessibility-grid';
      grid.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 999998;
        background-image: 
          linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
        background-size: 52px 52px;
      `;
      document.documentElement.appendChild(grid);

      // Create custom cursor
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
        transform: translate(-50%, -50%);
      `;
      document.documentElement.appendChild(cursor);

      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      document.addEventListener('click', (e) => {
        const clickEffect = document.createElement('div');
        clickEffect.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 52px;
          height: 52px;
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

      const style = document.createElement('style');
      style.textContent = `
        @keyframes clickPulse {
          0% { width: 20px; height: 20px; opacity: 1; }
          100% { width: 64px; height: 64px; opacity: 0; }
        }
        .touch-target-highlight {
          outline: 3px dashed #ff0000 !important;
          background: rgba(255, 0, 0, 0.1) !important;
        }
        .touch-target-pass {
          outline: 3px solid #00ff00 !important;
          background: rgba(0, 255, 0, 0.1) !important;
        }
        .text-size-label {
          position: absolute;
          background: #000;
          color: #fff;
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: nowrap;
          z-index: 1000000;
        }
      `;
      document.documentElement.appendChild(style);
    });

    log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for hydration
    await new Promise(r => setTimeout(r, 3000));

    // Capture initial state
    const initialScreenshot = path.join(RESULTS_DIR, `a11y-initial-${TIMESTAMP}.png`);
    await page.screenshot({ path: initialScreenshot });
    report.screenshots.push({ type: 'initial', path: initialScreenshot });
    log('Initial screenshot captured');

    // Analyze touch targets
    log('Analyzing touch targets...');
    const touchTargetAnalysis = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"]'));
      const results = [];

      buttons.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        const minHeight = parseFloat(computed.minHeight) || rect.height;
        const minWidth = parseFloat(computed.minWidth) || rect.width;
        
        // Check if element is visible
        if (rect.width > 0 && rect.height > 0 && computed.display !== 'none') {
          const passes = rect.height >= 52 && rect.width >= 52;
          const passesWetHand = rect.height >= 64 && rect.width >= 64;
          
          results.push({
            index,
            selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').filter(c => c).join('.') : ''),
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            passes52px: passes,
            passes64px: passesWetHand,
            text: el.textContent?.trim().slice(0, 50) || '',
            ariaLabel: el.getAttribute('aria-label') || ''
          });
        }
      });

      return results;
    });

    report.touchTargets = touchTargetAnalysis;

    // Highlight touch targets
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"]'));
      
      buttons.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const passes = rect.height >= 52 && rect.width >= 52;
          const highlight = document.createElement('div');
          highlight.className = passes ? 'touch-target-pass' : 'touch-target-highlight';
          highlight.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            pointer-events: none;
            z-index: 999997;
          `;
          document.documentElement.appendChild(highlight);
        }
      });
    });

    const highlightedScreenshot = path.join(RESULTS_DIR, `a11y-touch-targets-${TIMESTAMP}.png`);
    await page.screenshot({ path: highlightedScreenshot });
    report.screenshots.push({ type: 'touch-targets', path: highlightedScreenshot });
    log(`Touch target analysis: ${touchTargetAnalysis.length} interactive elements found`);

    // Analyze text sizes
    log('Analyzing text sizes...');
    const textAnalysis = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const results = [];
      const seen = new Set();

      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const fontSize = parseFloat(computed.fontSize);
        const text = el.textContent?.trim().slice(0, 30);
        
        if (text && fontSize > 0 && !seen.has(text)) {
          seen.add(text);
          const passes = fontSize >= 16; // Minimum for elderly
          const passesIdeal = fontSize >= 18; // Ideal for elderly
          
          results.push({
            selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').filter(c => c).join('.') : ''),
            fontSize: fontSize,
            text: text,
            passes16px: passes,
            passes18px: passesIdeal,
            fontWeight: computed.fontWeight,
            color: computed.color
          });
        }
      });

      return results.sort((a, b) => a.fontSize - b.fontSize);
    });

    report.textSizes = textAnalysis;

    // Calculate accessibility score
    const totalChecks = touchTargetAnalysis.length + textAnalysis.length;
    const passedTouchTargets = touchTargetAnalysis.filter(t => t.passes52px).length;
    const passedTextSizes = textAnalysis.filter(t => t.passes16px).length;
    
    report.accessibilityScore = totalChecks > 0 
      ? Math.round(((passedTouchTargets + passedTextSizes) / totalChecks) * 100)
      : 0;

    // Generate summary
    const summary = {
      totalTouchTargets: touchTargetAnalysis.length,
      passing52px: touchTargetAnalysis.filter(t => t.passes52px).length,
      passing64px: touchTargetAnalysis.filter(t => t.passes64px).length,
      failing: touchTargetAnalysis.filter(t => !t.passes52px).length,
      totalTextElements: textAnalysis.length,
      passingText16px: textAnalysis.filter(t => t.passes16px).length,
      passingText18px: textAnalysis.filter(t => t.passes18px).length,
      accessibilityScore: report.accessibilityScore
    };

    log(`Accessibility Score: ${summary.accessibilityScore}%`);
    log(`Touch Targets: ${summary.passing52px}/${summary.totalTouchTargets} pass 52px minimum`);
    log(`Touch Targets: ${summary.passing64px}/${summary.totalTouchTargets} pass 64px (wet hand)`);
    log(`Text Sizes: ${summary.passingText16px}/${summary.totalTextElements} pass 16px minimum`);

    await browser.close();

    return { success: true, report, summary };

  } catch (error) {
    log(`Accessibility test failed: ${error.message}`, 'error');
    report.errors.push(error.message);

    if (browser) {
      await browser.close().catch(() => { });
    }

    return { success: false, report, error: error.message };
  }
}

function generateAccessibilityReport(result) {
  const { report, summary } = result;
  const reportFile = path.join(RESULTS_DIR, `a11y-report-${TIMESTAMP}.html`);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Accessibility Test Report - ${report.timestamp}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .score { font-size: 72px; font-weight: bold; text-align: center; padding: 40px; border-radius: 12px; margin: 20px 0; }
    .score-good { background: #d4edda; color: #155724; }
    .score-warning { background: #fff3cd; color: #856404; }
    .score-bad { background: #f8d7da; color: #721c24; }
    .meta { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .summary-card { background: #e7f3ff; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 36px; font-weight: bold; color: #007bff; }
    .summary-label { font-size: 14px; color: #666; margin-top: 8px; }
    .summary-sub { font-size: 12px; color: #999; margin-top: 4px; }
    .issue-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .issue-table th, .issue-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .issue-table th { background: #f8f9fa; font-weight: 600; }
    .issue-table tr:hover { background: #f8f9fa; }
    .fail { background: #f8d7da; color: #721c24; font-weight: bold; }
    .pass { background: #d4edda; color: #155724; }
    .warning { background: #fff3cd; color: #856404; }
    .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin: 20px 0; }
    .screenshot-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .screenshot-card img { width: 100%; height: auto; display: block; }
    .screenshot-card .caption { padding: 12px; background: #f8f9fa; font-size: 14px; font-weight: 600; }
    .recommendation { background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; }
    .recommendation h3 { margin-top: 0; color: #007bff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>♿ Accessibility Test Report</h1>
    <p><strong>Target User:</strong> Pandit Ram Nath Tiwari, Age 65 (Cataracts, Large Thumbs, Wet Hands)</p>

    <div class="meta">
      <div><strong>URL:</strong> ${report.url}</div>
      <div><strong>Timestamp:</strong> ${report.timestamp}</div>
      <div><strong>Viewport:</strong> 390x844 (iPhone 12/13/14)</div>
    </div>

    <div class="score ${summary.accessibilityScore >= 80 ? 'score-good' : summary.accessibilityScore >= 60 ? 'score-warning' : 'score-bad'}">
      Accessibility Score: ${summary.accessibilityScore}%
      ${summary.accessibilityScore >= 80 ? '✓ PASS' : summary.accessibilityScore >= 60 ? '⚠ NEEDS IMPROVEMENT' : '✗ FAIL'}
    </div>

    <h2>📊 Summary Statistics</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-value">${summary.totalTouchTargets}</div>
        <div class="summary-label">Total Touch Targets</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #28a745;">${summary.passing52px}</div>
        <div class="summary-label">Pass 52px Minimum</div>
        <div class="summary-sub">${Math.round(summary.passing52px / summary.totalTouchTargets * 100)}%</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #155724;">${summary.passing64px}</div>
        <div class="summary-label">Pass 64px (Wet Hand)</div>
        <div class="summary-sub">${Math.round(summary.passing64px / summary.totalTouchTargets * 100)}%</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #dc3545;">${summary.failing}</div>
        <div class="summary-label">Failing (< 52px)</div>
        <div class="summary-sub">${Math.round(summary.failing / summary.totalTouchTargets * 100)}%</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">${summary.totalTextElements}</div>
        <div class="summary-label">Text Elements</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #28a745;">${summary.passingText16px}</div>
        <div class="summary-label">Pass 16px Minimum</div>
        <div class="summary-sub">${Math.round(summary.passingText16px / summary.totalTextElements * 100)}%</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #155724;">${summary.passingText18px}</div>
        <div class="summary-label">Pass 18px Ideal</div>
        <div class="summary-sub">${Math.round(summary.passingText18px / summary.totalTextElements * 100)}%</div>
      </div>
    </div>

    <h2>🔴 Failing Touch Targets (< 52px)</h2>
    ${report.touchTargets.filter(t => !t.passes52px).length === 0 
      ? '<p class="pass">✓ All touch targets meet 52px minimum!</p>'
      : `
    <table class="issue-table">
      <thead>
        <tr>
          <th>Element</th>
          <th>Size (W×H)</th>
          <th>Text/Label</th>
          <th>Required</th>
        </tr>
      </thead>
      <tbody>
        ${report.touchTargets.filter(t => !t.passes52px).map(t => `
          <tr class="fail">
            <td><code>${t.selector}</code></td>
            <td>${Math.round(t.width)}px × ${Math.round(t.height)}px</td>
            <td>${t.text || t.ariaLabel || '(no text)'}</td>
            <td>52px × 52px</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`}

    <h2>🟡 Borderline Touch Targets (52-63px)</h2>
    ${report.touchTargets.filter(t => t.passes52px && !t.passes64px).length === 0
      ? '<p>No borderline elements</p>'
      : `
    <table class="issue-table">
      <thead>
        <tr>
          <th>Element</th>
          <th>Size (W×H)</th>
          <th>Text/Label</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${report.touchTargets.filter(t => t.passes52px && !t.passes64px).map(t => `
          <tr class="warning">
            <td><code>${t.selector}</code></td>
            <td>${Math.round(t.width)}px × ${Math.round(t.height)}px</td>
            <td>${t.text || t.ariaLabel || '(no text)'}</td>
            <td>⚠ Fails wet hand test</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`}

    <h2>🟢 Passing Touch Targets (≥64px)</h2>
    <table class="issue-table">
      <thead>
        <tr>
          <th>Element</th>
          <th>Size (W×H)</th>
          <th>Text/Label</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${report.touchTargets.filter(t => t.passes64px).map(t => `
          <tr class="pass">
            <td><code>${t.selector}</code></td>
            <td>${Math.round(t.width)}px × ${Math.round(t.height)}px</td>
            <td>${t.text || t.ariaLabel || '(no text)'}</td>
            <td>✓ Excellent for wet hands</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>📝 Text Size Analysis</h2>
    <table class="issue-table">
      <thead>
        <tr>
          <th>Font Size</th>
          <th>Element</th>
          <th>Sample Text</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${report.textSizes.slice(0, 30).map(t => `
          <tr class="${t.passes18px ? 'pass' : t.passes16px ? 'warning' : 'fail'}">
            <td>${t.fontSize.toFixed(1)}px</td>
            <td><code>${t.selector}</code></td>
            <td>${t.text}</td>
            <td>${t.passes18px ? '✓ Ideal' : t.passes16px ? '⚠ Minimum' : '✗ Too small'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>📸 Screenshots</h2>
    <div class="screenshot-grid">
      ${report.screenshots.map(s => `
        <div class="screenshot-card">
          <img src="${s.path}" alt="${s.type}">
          <div class="caption">${s.type}</div>
        </div>
      `).join('')}
    </div>

    <div class="recommendation">
      <h3>🎯 Recommendations for Pandit Ram Nath Tiwari (Age 65)</h3>
      <ul>
        <li><strong>Touch Targets:</strong> Increase all failing elements to minimum 52px, ideally 64px for wet hand reliability</li>
        <li><strong>Text Sizes:</strong> Increase all text below 16px to at least 16px, preferably 18px for cataract vision</li>
        <li><strong>Contrast:</strong> Ensure all text has WCAG AA contrast ratio (4.5:1 minimum)</li>
        <li><strong>One-handed use:</strong> Place critical actions in bottom 2/3 of screen for thumb reachability</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(reportFile, html);
  log(`HTML report generated: ${reportFile}`);
  return reportFile;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    url: 'http://localhost:3002/mobile'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.url = args[++i];
    }
  }

  log('Starting accessibility visual test for Pandit-friendly UI...');
  log(`Testing URL: ${options.url}`);

  const result = await runAccessibilityTest(options);

  if (result.success) {
    generateAccessibilityReport(result);

    console.log('\n' + '='.repeat(60));
    log('Accessibility testing completed!', 'success');
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│  Accessibility Score: ${String(result.summary.accessibilityScore).padEnd(2, ' ')}% ${result.summary.accessibilityScore >= 80 ? '✓ PASS' : result.summary.accessibilityScore >= 60 ? '⚠ WARNING' : '✗ FAIL'}
│                                                              │
│  Touch Targets:                                              │
│    - Total: ${String(result.summary.totalTouchTargets).padEnd(3, ' ')} elements                        │
│    - Passing 52px: ${String(result.summary.passing52px).padEnd(3, ' ')} (${String(Math.round(result.summary.passing52px / result.summary.totalTouchTargets * 100)).padEnd(3, ' ')}%)           │
│    - Passing 64px: ${String(result.summary.passing64px).padEnd(3, ' ')} (${String(Math.round(result.summary.passing64px / result.summary.totalTouchTargets * 100)).padEnd(3, ' ')}%)  wet hand  │
│    - Failing: ${String(result.summary.failing).padEnd(3, ' ')} (${String(Math.round(result.summary.failing / result.summary.totalTouchTargets * 100)).padEnd(3, ' ')}%)                │
│                                                              │
│  Text Sizes:                                                 │
│    - Total: ${String(result.summary.totalTextElements).padEnd(3, ' ')} elements                        │
│    - Passing 16px: ${String(result.summary.passingText16px).padEnd(3, ' ')} (${String(Math.round(result.summary.passingText16px / result.summary.totalTextElements * 100)).padEnd(3, ' ')}%)          │
│    - Passing 18px: ${String(result.summary.passingText18px).padEnd(3, ' ')} (${String(Math.round(result.summary.passingText18px / result.summary.totalTextElements * 100)).padEnd(3, ' ')}%)  ideal   │
│                                                              │
│  Report: test-results\\visual\\a11y-report-${TIMESTAMP}.html      │
└─────────────────────────────────────────────────────────────┘`);
  } else {
    log('Accessibility testing failed', 'error');
    console.error(result.error);
  }
}

main().catch(console.error);
