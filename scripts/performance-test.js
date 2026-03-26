#!/usr/bin/env node

/**
 * Performance Testing Scripts - HmarePanditJi
 * 
 * This script runs Lighthouse audits on all key pages
 * and generates a comprehensive performance report.
 * 
 * Usage:
 *   npm run test:performance
 *   node scripts/performance-test.js
 * 
 * Requirements:
 *   npm install -g lighthouse
 *   npm install --save-dev lighthouse
 */

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3002',
  outputDir: path.join(__dirname, '../qa-reports/performance'),
  chromeFlags: [
    '--headless',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox'
  ],
  // Performance budgets
  budgets: {
    overallScore: 90,
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 90,
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    timeToInteractive: 3800,
    totalBlockingTime: 300,
    cumulativeLayoutShift: 0.1,
    speedIndex: 3400
  }
};

// Pages to test
const PAGES = [
  { name: 'Splash Screen', path: '/onboarding' },
  { name: 'Location Permission', path: '/onboarding' },
  { name: 'Language Selection', path: '/onboarding' },
  { name: 'Tutorial Screen 1', path: '/onboarding' },
  { name: 'Tutorial Screen 6', path: '/onboarding' },
  { name: 'Tutorial Screen 12', path: '/onboarding' },
  { name: 'Mobile Registration', path: '/registration/mobile' },
  { name: 'OTP Verification', path: '/registration/otp' },
  { name: 'Profile Complete', path: '/registration/complete' }
];

// Network throttling presets
const NETWORK_PRESETS = {
  '3G': {
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    latency: 150
  },
  '2G': {
    downloadThroughput: 280 * 1024 / 8, // 280 Kbps
    uploadThroughput: 256 * 1024 / 8, // 256 Kbps
    latency: 400
  },
  '4G': {
    downloadThroughput: 9 * 1024 * 1024 / 8, // 9 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8, // 3 Mbps
    latency: 40
  }
};

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

/**
 * Run Lighthouse audit on a single page
 */
async function runLighthouseAudit(pageUrl, pageName, networkCondition = '4G') {
  console.log(`\n🔍 Auditing: ${pageName} (${pageUrl})`);
  console.log(`   Network: ${networkCondition}`);

  const options = {
    extends: 'lighthouse:default',
    port: 9222,
    output: ['html', 'json'],
    outputPath: CONFIG.outputDir,
    quiet: true,
    chromeFlags: CONFIG.chromeFlags,
    throttling: NETWORK_PRESETS[networkCondition],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 2.625
    }
  };

  try {
    const runnerResult = await lighthouse(pageUrl, options);

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Lighthouse did not return results');
    }

    const report = runnerResult.lhr;
    const categories = report.categories;
    const audits = report.audits;

    return {
      pageName,
      pageUrl,
      networkCondition,
      timestamp: new Date().toISOString(),
      scores: {
        overall: categories.performance.score * 100,
        accessibility: categories.accessibility ? categories.accessibility.score * 100 : null,
        bestPractices: categories['best-practices'] ? categories['best-practices'].score * 100 : null,
        seo: categories.seo ? categories.seo.score * 100 : null
      },
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || null,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || null,
        timeToInteractive: audits['interactive']?.numericValue || null,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || null,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || null,
        speedIndex: audits['speed-index']?.numericValue || null,
        maxPotentialFID: audits['max-potential-fid']?.numericValue || null
      },
      opportunities: audits['opportunities']?.details?.items || [],
      diagnostics: audits['diagnostics']?.details?.items || [],
      budgetPassed: checkBudget(categories, audits)
    };
  } catch (error) {
    console.error(`   ❌ Error auditing ${pageName}:`, error.message);
    return {
      pageName,
      pageUrl,
      networkCondition,
      timestamp: new Date().toISOString(),
      error: error.message,
      budgetPassed: false
    };
  }
}

/**
 * Check if results meet budget thresholds
 */
function checkBudget(categories, audits) {
  const checks = {
    overall: (categories.performance.score * 100) >= CONFIG.budgets.overall,
    performance: (categories.performance.score * 100) >= CONFIG.budgets.performance,
    accessibility: !categories.accessibility || (categories.accessibility.score * 100) >= CONFIG.budgets.accessibility,
    bestPractices: !categories['best-practices'] || (categories['best-practices'].score * 100) >= CONFIG.budgets.bestPractices,
    fcp: !audits['first-contentful-paint'] || audits['first-contentful-paint'].numericValue <= CONFIG.budgets.firstContentfulPaint,
    lcp: !audits['largest-contentful-paint'] || audits['largest-contentful-paint'].numericValue <= CONFIG.budgets.largestContentfulPaint,
    tti: !audits['interactive'] || audits['interactive'].numericValue <= CONFIG.budgets.timeToInteractive,
    tbt: !audits['total-blocking-time'] || audits['total-blocking-time'].numericValue <= CONFIG.budgets.totalBlockingTime,
    cls: !audits['cumulative-layout-shift'] || audits['cumulative-layout-shift'].numericValue <= CONFIG.budgets.cumulativeLayoutShift
  };

  return {
    passed: Object.values(checks).every(v => v),
    checks
  };
}

/**
 * Generate HTML report
 */
function generateHtmlReport(results) {
  const timestamp = new Date().toISOString();
  const passedCount = results.filter(r => r.budgetPassed?.passed).length;
  const failedCount = results.length - passedCount;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Test Report - HmarePanditJi</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #FF9933 0%, #FF6600 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }
    .summary-card .value {
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    .summary-card .value.pass { color: #22c55e; }
    .summary-card .value.fail { color: #ef4444; }
    .results-table {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f9f9f9;
      font-weight: 600;
    }
    .status-pass {
      color: #22c55e;
      font-weight: bold;
    }
    .status-fail {
      color: #ef4444;
      font-weight: bold;
    }
    .score {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .score.high { background: #dcfce7; color: #166534; }
    .score.medium { background: #fef3c7; color: #92400e; }
    .score.low { background: #fee2e2; color: #991b1b; }
    .budget-checks {
      font-size: 12px;
      color: #666;
    }
    .budget-checks span {
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Performance Test Report</h1>
    <p><strong>HmarePanditJi</strong> | Generated: ${timestamp}</p>
    <p>Base URL: ${CONFIG.baseUrl}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Total Pages Tested</h3>
      <div class="value">${results.length}</div>
    </div>
    <div class="summary-card">
      <h3>Passed Budget</h3>
      <div class="value pass">${passedCount}</div>
    </div>
    <div class="summary-card">
      <h3>Failed Budget</h3>
      <div class="value fail">${failedCount}</div>
    </div>
    <div class="summary-card">
      <h3>Pass Rate</h3>
      <div class="value ${passedCount / results.length >= 0.8 ? 'pass' : 'fail'}">${Math.round(passedCount / results.length * 100)}%</div>
    </div>
  </div>

  <div class="results-table">
    <h2>Detailed Results</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Network</th>
          <th>Performance</th>
          <th>FCP</th>
          <th>LCP</th>
          <th>TTI</th>
          <th>TBT</th>
          <th>CLS</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => {
          if (r.error) {
            return `
            <tr>
              <td>${r.pageName}</td>
              <td>${r.networkCondition}</td>
              <td colspan="7" class="status-fail">Error: ${r.error}</td>
            </tr>
            `;
          }
          
          const perfScore = Math.round(r.scores.performance);
          const perfClass = perfScore >= 90 ? 'high' : perfScore >= 50 ? 'medium' : 'low';
          
          return `
            <tr>
              <td><strong>${r.pageName}</strong></td>
              <td>${r.networkCondition}</td>
              <td><span class="score ${perfClass}">${perfScore}</span></td>
              <td>${r.metrics.firstContentfulPaint ? (r.metrics.firstContentfulPaint / 1000).toFixed(2) + 's' : 'N/A'}</td>
              <td>${r.metrics.largestContentfulPaint ? (r.metrics.largestContentfulPaint / 1000).toFixed(2) + 's' : 'N/A'}</td>
              <td>${r.metrics.timeToInteractive ? (r.metrics.timeToInteractive / 1000).toFixed(2) + 's' : 'N/A'}</td>
              <td>${r.metrics.totalBlockingTime ? (r.metrics.totalBlockingTime / 1000).toFixed(2) + 's' : 'N/A'}</td>
              <td>${r.metrics.cumulativeLayoutShift ? r.metrics.cumulativeLayoutShift.toFixed(3) : 'N/A'}</td>
              <td class="${r.budgetPassed?.passed ? 'status-pass' : 'status-fail'}">
                ${r.budgetPassed?.passed ? '✓ PASS' : '✗ FAIL'}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="results-table" style="margin-top: 20px;">
    <h2>Performance Budget Thresholds</h2>
    <table>
      <tr><th>Metric</th><th>Threshold</th></tr>
      <tr><td>Overall Score</td><td>≥ ${CONFIG.budgets.overall}</td></tr>
      <tr><td>Performance Score</td><td>≥ ${CONFIG.budgets.performance}</td></tr>
      <tr><td>Accessibility Score</td><td>≥ ${CONFIG.budgets.accessibility}</td></tr>
      <tr><td>Best Practices Score</td><td>≥ ${CONFIG.budgets.bestPractices}</td></tr>
      <tr><td>First Contentful Paint</td><td>≤ ${CONFIG.budgets.firstContentfulPaint / 1000}s</td></tr>
      <tr><td>Largest Contentful Paint</td><td>≤ ${CONFIG.budgets.largestContentfulPaint / 1000}s</td></tr>
      <tr><td>Time to Interactive</td><td>≤ ${CONFIG.budgets.timeToInteractive / 1000}s</td></tr>
      <tr><td>Total Blocking Time</td><td>≤ ${CONFIG.budgets.totalBlockingTime / 1000}s</td></tr>
      <tr><td>Cumulative Layout Shift</td><td>≤ ${CONFIG.budgets.cumulativeLayoutShift}</td></tr>
    </table>
  </div>
</body>
</html>
  `.trim();

  const filePath = path.join(CONFIG.outputDir, 'performance-report.html');
  fs.writeFileSync(filePath, html);
  console.log(`\n📄 HTML report saved to: ${filePath}`);
}

/**
 * Generate JSON report
 */
function generateJsonReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      baseUrl: CONFIG.baseUrl,
      budgets: CONFIG.budgets
    },
    summary: {
      total: results.length,
      passed: results.filter(r => r.budgetPassed?.passed).length,
      failed: results.filter(r => !r.budgetPassed?.passed).length
    },
    results
  };

  const filePath = path.join(CONFIG.outputDir, 'performance-report.json');
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report saved to: ${filePath}`);

  return report;
}

/**
 * Main test runner
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Output Directory: ${CONFIG.outputDir}\n`);

  ensureOutputDir();

  const allResults = [];

  // Test each page with different network conditions
  for (const page of PAGES) {
    const pageUrl = `${CONFIG.baseUrl}${page.path}`;
    
    // Test with 4G (default)
    const result4G = await runLighthouseAudit(pageUrl, page.name, '4G');
    allResults.push(result4G);

    // Test with 3G for critical pages
    if (page.name.includes('Splash') || page.name.includes('Tutorial Screen 1')) {
      const result3G = await runLighthouseAudit(pageUrl, page.name, '3G');
      allResults.push(result3G);
    }
  }

  // Generate reports
  generateHtmlReport(allResults);
  const jsonReport = generateJsonReport(allResults);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages Tested: ${jsonReport.summary.total}`);
  console.log(`Passed Budget: ${jsonReport.summary.passed}`);
  console.log(`Failed Budget: ${jsonReport.summary.failed}`);
  console.log(`Pass Rate: ${Math.round(jsonReport.summary.passed / jsonReport.summary.total * 100)}%`);
  console.log('='.repeat(60));

  // Exit with error code if any tests failed
  if (jsonReport.summary.failed > 0) {
    console.log('\n❌ Some performance tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All performance tests passed!');
    process.exit(0);
  }
}

// Run tests
runPerformanceTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
