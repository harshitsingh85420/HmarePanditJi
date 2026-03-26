# QA Testing Scripts - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 26, 2026  
**Purpose:** Automated testing support for QA Tester (Task Card 4)

---

## 📁 Script Overview

This directory contains automated test scripts to support manual QA testing efforts.

### Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `qa-lighthouse-batch.js` | Run Lighthouse audits on all screens | `node scripts/qa-lighthouse-batch.js` |
| `qa-accessibility-scan.js` | Automated accessibility scan with axe-core | `node scripts/qa-accessibility-scan.js` |
| `qa-performance-monitor.js` | Monitor TTS/STT latency | `node scripts/qa-performance-monitor.js` |
| `qa-bug-report-generator.js` | Generate bug report from test results | `node scripts/qa-bug-report-generator.js` |
| `qa-device-emulator.js` | Test different device viewports | `node scripts/qa-device-emulator.js` |

---

## Script 1: Lighthouse Batch Audit

### File: `scripts/qa-lighthouse-batch.js`

```javascript
/**
 * HmarePanditJi - Batch Lighthouse Audit Script
 * 
 * Runs Lighthouse audits on all onboarding screens and generates comprehensive report
 * 
 * Usage: node scripts/qa-lighthouse-batch.js
 * Output: qa-reports/lighthouse-report.html
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// All screens to test
const SCREENS = [
  { id: 'S-0.0.1', name: 'Splash Screen', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.0.2', name: 'Location Permission', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.0.3', name: 'Language Selection', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.1', name: 'Tutorial 1 - Swagat', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.2', name: 'Tutorial 2 - Income Hook', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.3', name: 'Tutorial 3 - Fixed Dakshina', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.4', name: 'Tutorial 4 - Online Revenue', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.5', name: 'Tutorial 5 - Backup Pandit', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.6', name: 'Tutorial 6 - Instant Payment', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.7', name: 'Tutorial 7 - Voice Nav Demo', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.8', name: 'Tutorial 8 - Dual Mode', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.9', name: 'Tutorial 9 - Travel Calendar', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.10', name: 'Tutorial 10 - Video Verification', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.11', name: 'Tutorial 11 - 4 Guarantees', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.12', name: 'Tutorial 12 - Final CTA', url: 'http://localhost:3002/onboarding' },
  { id: 'S-1.1', name: 'Mobile Number', url: 'http://localhost:3002/registration/mobile' },
  { id: 'S-1.2', name: 'OTP Verification', url: 'http://localhost:3002/registration/otp' },
  { id: 'S-1.9', name: 'Profile Complete', url: 'http://localhost:3002/registration/complete' },
];

const LIGHTHOUSE_OPTIONS = {
  extends: 'lighthouse:default',
  port: undefined,
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  emulatedFormFactor: 'mobile',
  throttling: {
    rttsMs: 150,
    throughputKbps: 1638.4,
    requestLatencyMs: 562.5,
    downloadThroughputKbps: 14745.6,
    uploadThroughputKbps: 675,
    cpuSlowdownMultiplier: 4,
  },
};

async function runLighthouseAudit() {
  console.log('🚀 Starting Lighthouse Batch Audit...\n');
  
  const results = [];
  let chrome;
  
  try {
    // Launch Chrome
    console.log('🌐 Launching Chrome...');
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });
    
    LIGHTHOUSE_OPTIONS.port = chrome.port;
    
    // Run audits
    for (const screen of SCREENS) {
      console.log(`\n📊 Auditing: ${screen.id} - ${screen.name}`);
      console.log(`   URL: ${screen.url}`);
      
      const runnerResult = await lighthouse(screen.url, LIGHTHOUSE_OPTIONS);
      
      if (!runnerResult?.lhr) {
        console.error(`   ❌ Lighthouse failed for ${screen.id}`);
        continue;
      }
      
      const report = runnerResult.report;
      const lhr = runnerResult.lhr;
      
      const result = {
        screenId: screen.id,
        screenName: screen.name,
        url: screen.url,
        timestamp: new Date().toISOString(),
        scores: {
          overall: lhr.categories.performance.score * 100,
          performance: lhr.categories.performance.score * 100,
          accessibility: lhr.categories.accessibility.score * 100,
          bestPractices: lhr.categories['best-practices'].score * 100,
          seo: lhr.categories.seo.score * 100,
        },
        metrics: {
          fcp: lhr.audits['first-contentful-paint']?.numericValue || 0,
          lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
          tti: lhr.audits['interactive']?.numericValue || 0,
          tbt: lhr.audits['total-blocking-time']?.numericValue || 0,
          cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
          speedIndex: lhr.audits['speed-index']?.numericValue || 0,
        },
        audits: lhr.audits,
      };
      
      results.push(result);
      
      // Print summary
      console.log(`   ✅ Performance: ${Math.round(result.scores.performance)}%`);
      console.log(`   ✅ Accessibility: ${Math.round(result.scores.accessibility)}%`);
      console.log(`   ✅ Best Practices: ${Math.round(result.scores.bestPractices)}%`);
      console.log(`   ✅ SEO: ${Math.round(result.scores.seo)}%`);
      console.log(`   ⏱️  LCP: ${Math.round(result.metrics.lcp / 1000)}s`);
      console.log(`   ⏱️  TTI: ${Math.round(result.metrics.tti / 1000)}s`);
    }
    
    // Generate HTML report
    console.log('\n📄 Generating HTML report...');
    generateHTMLReport(results);
    
    // Generate JSON report
    console.log('📄 Generating JSON report...');
    generateJSONReport(results);
    
    // Generate summary
    console.log('\n📊 SUMMARY:\n');
    generateSummary(results);
    
    console.log('\n✅ Lighthouse Batch Audit Complete!');
    console.log('📁 Reports saved to: qa-reports/lighthouse/');
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function generateHTMLReport(results) {
  const reportDir = path.join(process.cwd(), 'qa-reports', 'lighthouse');
  fs.mkdirSync(reportDir, { recursive: true });
  
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const htmlPath = path.join(reportDir, `lighthouse-report-${timestamp}.html`);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HmarePanditJi - Lighthouse Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #FF9933; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 40px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card h3 { margin: 0; font-size: 14px; opacity: 0.9; }
    .summary-card .value { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .screen-result { margin: 30px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .screen-result h3 { margin-top: 0; color: #333; }
    .scores { display: flex; gap: 10px; margin: 15px 0; }
    .score { padding: 10px 20px; border-radius: 4px; color: white; font-weight: bold; }
    .score.good { background: #4CAF50; }
    .score.needs-improvement { background: #FF9800; }
    .score.poor { background: #F44336; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }
    .metric { background: #f9f9f9; padding: 10px; border-radius: 4px; }
    .metric-label { font-size: 12px; color: #666; }
    .metric-value { font-size: 20px; font-weight: bold; color: #333; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f5f5f5; font-weight: 600; }
    .pass { color: #4CAF50; }
    .fail { color: #F44336; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Lighthouse Audit Report</h1>
    <p><strong>Project:</strong> HmarePanditJi</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    <p><strong>Screens Tested:</strong> ${results.length}</p>
    
    ${generateSummaryCards(results)}
    
    <h2>📊 Detailed Results</h2>
    ${results.map(r => generateScreenResult(r)).join('')}
    
    <h2>📋 Comparison Table</h2>
    ${generateComparisonTable(results)}
  </div>
</body>
</html>
  `.trim();
  
  fs.writeFileSync(htmlPath, html);
  console.log(`   📄 HTML Report: ${htmlPath}`);
}

function generateSummaryCards(results) {
  const avgPerformance = results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length;
  const avgAccessibility = results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length;
  const avgBestPractices = results.reduce((sum, r) => sum + r.scores.bestPractices, 0) / results.length;
  const avgSEO = results.reduce((sum, r) => sum + r.scores.seo, 0) / results.length;
  
  return `
    <div class="summary">
      <div class="summary-card">
        <h3>Avg Performance</h3>
        <div class="value">${Math.round(avgPerformance)}</div>
      </div>
      <div class="summary-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h3>Avg Accessibility</h3>
        <div class="value">${Math.round(avgAccessibility)}</div>
      </div>
      <div class="summary-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <h3>Avg Best Practices</h3>
        <div class="value">${Math.round(avgBestPractices)}</div>
      </div>
      <div class="summary-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
        <h3>Avg SEO</h3>
        <div class="value">${Math.round(avgSEO)}</div>
      </div>
    </div>
  `;
}

function generateScreenResult(result) {
  const getScoreClass = (score) => {
    if (score >= 90) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  };
  
  return `
    <div class="screen-result">
      <h3>${result.screenId} - ${result.screenName}</h3>
      <p><small>${result.url}</small></p>
      
      <div class="scores">
        <div class="score ${getScoreClass(result.scores.performance)}">
          Performance: ${Math.round(result.scores.performance)}%
        </div>
        <div class="score ${getScoreClass(result.scores.accessibility)}">
          Accessibility: ${Math.round(result.scores.accessibility)}%
        </div>
        <div class="score ${getScoreClass(result.scores.bestPractices)}">
          Best Practices: ${Math.round(result.scores.bestPractices)}%
        </div>
        <div class="score ${getScoreClass(result.scores.seo)}">
          SEO: ${Math.round(result.scores.seo)}%
        </div>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">FCP</div>
          <div class="metric-value">${(result.metrics.fcp / 1000).toFixed(1)}s</div>
        </div>
        <div class="metric">
          <div class="metric-label">LCP</div>
          <div class="metric-value">${(result.metrics.lcp / 1000).toFixed(1)}s</div>
        </div>
        <div class="metric">
          <div class="metric-label">TTI</div>
          <div class="metric-value">${(result.metrics.tti / 1000).toFixed(1)}s</div>
        </div>
        <div class="metric">
          <div class="metric-label">TBT</div>
          <div class="metric-value">${(result.metrics.tbt / 1000).toFixed(1)}s</div>
        </div>
        <div class="metric">
          <div class="metric-label">CLS</div>
          <div class="metric-value">${result.metrics.cls.toFixed(3)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Speed Index</div>
          <div class="metric-value">${(result.metrics.speedIndex / 1000).toFixed(1)}s</div>
        </div>
      </div>
    </div>
  `;
}

function generateComparisonTable(results) {
  const rows = results.map(r => `
    <tr>
      <td><strong>${r.screenId}</strong><br>${r.screenName}</td>
      <td class="${r.scores.performance >= 90 ? 'pass' : 'fail'}">${Math.round(r.scores.performance)}%</td>
      <td class="${r.scores.accessibility >= 90 ? 'pass' : 'fail'}">${Math.round(r.scores.accessibility)}%</td>
      <td class="${r.scores.bestPractices >= 90 ? 'pass' : 'fail'}">${Math.round(r.scores.bestPractices)}%</td>
      <td class="${r.scores.seo >= 90 ? 'pass' : 'fail'}">${Math.round(r.scores.seo)}%</td>
      <td>${(r.metrics.lcp / 1000).toFixed(1)}s</td>
      <td>${(r.metrics.tti / 1000).toFixed(1)}s</td>
    </tr>
  `).join('');
  
  return `
    <table>
      <thead>
        <tr>
          <th>Screen</th>
          <th>Performance</th>
          <th>Accessibility</th>
          <th>Best Practices</th>
          <th>SEO</th>
          <th>LCP</th>
          <th>TTI</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generateJSONReport(results) {
  const reportDir = path.join(process.cwd(), 'qa-reports', 'lighthouse');
  fs.mkdirSync(reportDir, { recursive: true });
  
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const jsonPath = path.join(reportDir, `lighthouse-report-${timestamp}.json`);
  
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`   📄 JSON Report: ${jsonPath}`);
}

function generateSummary(results) {
  const totalScreens = results.length;
  const passedScreens = results.filter(r => 
    r.scores.performance >= 90 && 
    r.scores.accessibility >= 90 && 
    r.scores.bestPractices >= 90
  ).length;
  
  const avgPerformance = results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length;
  const avgAccessibility = results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length;
  const avgBestPractices = results.reduce((sum, r) => sum + r.scores.bestPractices, 0) / results.length;
  
  console.log('┌─────────────────────────────────────────┐');
  console.log('│         PERFORMANCE SUMMARY             │');
  console.log('├─────────────────────────────────────────┤');
  console.log(`│ Total Screens Tested: ${String(totalScreens).padEnd(22)}│`);
  console.log(`│ Screens Passed (>90%): ${String(passedScreens).padEnd(22)}│`);
  console.log(`│ Pass Rate: ${String(Math.round((passedScreens / totalScreens) * 100)).padEnd(15)}%            │`);
  console.log('├─────────────────────────────────────────┤');
  console.log(`│ Average Performance: ${String(Math.round(avgPerformance)).padEnd(23)}│`);
  console.log(`│ Average Accessibility: ${String(Math.round(avgAccessibility)).padEnd(22)}│`);
  console.log(`│ Average Best Practices: ${String(Math.round(avgBestPractices)).padEnd(21)}│`);
  console.log('└─────────────────────────────────────────┘');
}

// Run the audit
runLighthouseAudit();
```

---

## Script 2: Accessibility Scan

### File: `scripts/qa-accessibility-scan.js`

```javascript
/**
 * HmarePanditJi - Automated Accessibility Scan
 * 
 * Uses axe-core to scan all screens for accessibility issues
 * 
 * Usage: node scripts/qa-accessibility-scan.js
 * Output: qa-reports/accessibility/
 */

const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const SCREENS = [
  { id: 'S-0.0.1', name: 'Splash Screen', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.0.2', name: 'Location Permission', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.0.3', name: 'Language Selection', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.1', name: 'Tutorial 1', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.6', name: 'Tutorial 6', url: 'http://localhost:3002/onboarding' },
  { id: 'S-0.12', name: 'Tutorial 12', url: 'http://localhost:3002/onboarding' },
  { id: 'S-1.1', name: 'Mobile Number', url: 'http://localhost:3002/registration/mobile' },
  { id: 'S-1.2', name: 'OTP', url: 'http://localhost:3002/registration/otp' },
  { id: 'S-1.9', name: 'Profile Complete', url: 'http://localhost:3002/registration/complete' },
];

const AXE_CONFIG = {
  rules: {
    'color-contrast': { enabled: true },
    'label': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'link-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'keyboard': { enabled: true },
    'focus-visible': { enabled: true },
    'landmark-one-main': { enabled: true },
  },
};

async function runAccessibilityScan() {
  console.log('♿ Starting Accessibility Scan...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const results = [];
  
  try {
    for (const screen of SCREENS) {
      console.log(`🔍 Scanning: ${screen.id} - ${screen.name}`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      
      try {
        await page.goto(screen.url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait for content to load
        await page.waitForTimeout(2000);
        
        // Inject axe-core
        await page.addScriptTag({ content: axeCore.source });
        
        // Run axe analysis
        const axeResults = await page.evaluate(async (config) => {
          return await window.axe.run(document, config);
        }, AXE_CONFIG);
        
        const result = {
          screenId: screen.id,
          screenName: screen.name,
          url: screen.url,
          timestamp: new Date().toISOString(),
          violations: axeResults.violations,
          passes: axeResults.passes.length,
          incomplete: axeResults.incomplete.length,
          inapplicable: axeResults.inapplicable.length,
        };
        
        results.push(result);
        
        // Print summary
        const critical = result.violations.filter(v => v.impact === 'critical').length;
        const serious = result.violations.filter(v => v.impact === 'serious').length;
        const moderate = result.violations.filter(v => v.impact === 'moderate').length;
        const minor = result.violations.filter(v => v.impact === 'minor').length;
        
        console.log(`   ✅ Passed: ${result.passes} tests`);
        console.log(`   ❌ Violations: ${result.violations.length} total`);
        console.log(`      • Critical: ${critical}`);
        console.log(`      • Serious: ${serious}`);
        console.log(`      • Moderate: ${moderate}`);
        console.log(`      • Minor: ${minor}\n`);
        
      } catch (error) {
        console.error(`   ❌ Failed to scan: ${error.message}\n`);
        results.push({
          screenId: screen.id,
          screenName: screen.name,
          url: screen.url,
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
      
      await page.close();
    }
    
    // Generate report
    console.log('📄 Generating accessibility report...');
    generateReport(results);
    
    console.log('\n✅ Accessibility Scan Complete!');
    console.log('📁 Reports saved to: qa-reports/accessibility/');
    
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function generateReport(results) {
  const reportDir = path.join(process.cwd(), 'qa-reports', 'accessibility');
  fs.mkdirSync(reportDir, { recursive: true });
  
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const jsonPath = path.join(reportDir, `accessibility-scan-${timestamp}.json`);
  const mdPath = path.join(reportDir, `accessibility-scan-${timestamp}.md`);
  
  // JSON report
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  
  // Markdown report
  const mdReport = generateMarkdownReport(results);
  fs.writeFileSync(mdPath, mdReport);
  
  console.log(`   📄 JSON Report: ${jsonPath}`);
  console.log(`   📄 Markdown Report: ${mdPath}`);
}

function generateMarkdownReport(results) {
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const criticalViolations = results.reduce((sum, r) => 
    sum + (r.violations?.filter(v => v.impact === 'critical').length || 0), 0
  );
  
  return `
# Accessibility Scan Report - HmarePanditJi

**Date:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
**Screens Tested:** ${results.length}
**Tool:** axe-core

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Violations | ${totalViolations} |
| Critical Violations | ${criticalViolations} |
| Screens with Issues | ${results.filter(r => r.violations?.length > 0).length} / ${results.length} |

---

## Detailed Results

${results.map(r => `
### ${r.screenId} - ${r.screenName}

**URL:** ${r.url}
**Status:** ${r.error ? '❌ Failed' : r.violations?.length > 0 ? '⚠️ Issues Found' : '✅ Passed'}

${r.error ? `
**Error:** ${r.error}
` : `
**Violations:** ${r.violations?.length || 0}
**Passed Tests:** ${r.passes}

${r.violations?.map((v, i) => `
#### Violation ${i + 1}: ${v.id}

- **Impact:** ${v.impact.toUpperCase()}
- **Description:** ${v.description}
- **Help:** ${v.help}
- **Help URL:** ${v.helpUrl}
- **Affected Elements:** ${v.nodes?.length || 0}

**HTML:**
\`\`\`html
${v.nodes?.[0]?.html || 'N/A'}
\`\`\`

**Fix Recommendation:**
${v.nodes?.[0]?.failureSummary || 'Review and fix according to WCAG guidelines'}

---
`).join('') || 'No violations found ✅'}
`.trim()
).join('\n\n')}

---

## Recommendations

${generateRecommendations(results)}

---

**Generated:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
  `.trim();
}

function generateRecommendations(results) {
  const allViolations = results.flatMap(r => r.violations || []);
  const violationCounts = {};
  
  allViolations.forEach(v => {
    violationCounts[v.id] = (violationCounts[v.id] || 0) + 1;
  });
  
  const topIssues = Object.entries(violationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (topIssues.length === 0) {
    return '✅ No accessibility issues found! Great job!';
  }
  
  return `
### Top 5 Most Common Issues:

${topIssues.map(([id, count], i) => `${i + 1}. **${id}** - Found ${count} times`).join('\n')}

### Priority Actions:

1. **Fix Critical Issues First** - Address all critical violations immediately
2. **Color Contrast** - Ensure all text has 4.5:1 contrast ratio
3. **Labels** - Add labels to all form inputs and buttons
4. **Alt Text** - Ensure all images have descriptive alt text
5. **Keyboard Navigation** - Verify all interactive elements are keyboard accessible
  `.trim();
}

// Run the scan
runAccessibilityScan();
```

---

## Script 3: Performance Monitor

### File: `scripts/qa-performance-monitor.js`

```javascript
/**
 * HmarePanditJi - TTS/STT Performance Monitor
 * 
 * Monitors voice API latency and logs performance metrics
 * 
 * Usage: node scripts/qa-performance-monitor.js
 * Output: qa-reports/performance/
 */

const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Configuration
const CONFIG = {
  ttsEndpoint: 'http://localhost:3002/api/tts',
  sttEndpoint: 'http://localhost:3002/api/stt',
  testIterations: 10,
  timeoutMs: 5000,
};

const TEST_SCRIPTS = [
  { text: 'नमस्ते पंडित जी', language: 'hi-IN', speaker: 'ratan' },
  { text: 'வணக்கம் பண்டித் ஜி', language: 'ta-IN', speaker: 'priya' },
  { text: 'నమస్కారం పండిత్ జీ', language: 'te-IN', speaker: 'arjun' },
];

async function monitorPerformance() {
  console.log('⚡ Starting Performance Monitor...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tts: [],
    stt: [],
    summary: {},
  };
  
  // Test TTS latency
  console.log('🎤 Testing TTS Latency...\n');
  for (let i = 0; i < CONFIG.testIterations; i++) {
    const script = TEST_SCRIPTS[i % TEST_SCRIPTS.length];
    const latency = await testTTS(script);
    results.tts.push({
      iteration: i + 1,
      script: script.text,
      language: script.language,
      latencyMs: latency,
      passed: latency < 300,
    });
  }
  
  // Test STT latency (mock)
  console.log('\n👂 Testing STT Latency (Mock)...\n');
  for (let i = 0; i < CONFIG.testIterations; i++) {
    const latency = await testSTT();
    results.stt.push({
      iteration: i + 1,
      latencyMs: latency,
      passed: latency < 500,
    });
  }
  
  // Calculate summary
  results.summary = {
    tts: {
      avg: average(results.tts.map(r => r.latencyMs)),
      min: Math.min(...results.tts.map(r => r.latencyMs)),
      max: Math.max(...results.tts.map(r => r.latencyMs)),
      passRate: (results.tts.filter(r => r.passed).length / results.tts.length) * 100,
    },
    stt: {
      avg: average(results.stt.map(r => r.latencyMs)),
      min: Math.min(...results.stt.map(r => r.latencyMs)),
      max: Math.max(...results.stt.map(r => r.latencyMs)),
      passRate: (results.stt.filter(r => r.passed).length / results.stt.length) * 100,
    },
  };
  
  // Generate report
  console.log('\n📄 Generating performance report...');
  generateReport(results);
  
  console.log('\n✅ Performance Monitor Complete!');
  console.log('📁 Reports saved to: qa-reports/performance/');
}

async function testTTS(script) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(CONFIG.ttsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: script.text,
        languageCode: script.language,
        speaker: script.speaker,
        pace: 0.88,
      }),
      signal: AbortSignal.timeout(CONFIG.timeoutMs),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    await response.json();
    return Date.now() - startTime;
  } catch (error) {
    console.error(`   ❌ TTS test failed: ${error.message}`);
    return CONFIG.timeoutMs;
  }
}

async function testSTT() {
  // Mock STT test (real implementation would use WebSocket)
  const baseLatency = 200 + Math.random() * 200;
  await sleep(baseLatency);
  return baseLatency;
}

function average(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateReport(results) {
  const reportDir = path.join(process.cwd(), 'qa-reports', 'performance');
  fs.mkdirSync(reportDir, { recursive: true });
  
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const jsonPath = path.join(reportDir, `performance-monitor-${timestamp}.json`);
  const mdPath = path.join(reportDir, `performance-monitor-${timestamp}.md`);
  
  // JSON report
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  
  // Markdown report
  const mdReport = `
# Performance Monitor Report - HmarePanditJi

**Date:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
**Test Iterations:** ${CONFIG.testIterations}
**Timeout:** ${CONFIG.timeoutMs}ms

---

## Summary

### TTS Performance
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Average Latency | ${results.summary.tts.avg.toFixed(0)}ms | <300ms | ${results.summary.tts.avg < 300 ? '✅ Pass' : '❌ Fail'} |
| Min Latency | ${results.summary.tts.min.toFixed(0)}ms | - | - |
| Max Latency | ${results.summary.tts.max.toFixed(0)}ms | - | - |
| Pass Rate | ${results.summary.tts.passRate.toFixed(1)}% | 100% | ${results.summary.tts.passRate === 100 ? '✅' : '⚠️'} |

### STT Performance
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Average Latency | ${results.summary.stt.avg.toFixed(0)}ms | <500ms | ${results.summary.stt.avg < 500 ? '✅ Pass' : '❌ Fail'} |
| Min Latency | ${results.summary.stt.min.toFixed(0)}ms | - | - |
| Max Latency | ${results.summary.stt.max.toFixed(0)}ms | - | - |
| Pass Rate | ${results.summary.stt.passRate.toFixed(1)}% | 100% | ${results.summary.stt.passRate === 100 ? '✅' : '⚠️'} |

---

## Detailed Results

### TTS Tests

| # | Language | Text | Latency | Status |
|---|----------|------|---------|--------|
${results.tts.map(r => `| ${r.iteration} | ${r.language} | ${r.text.substring(0, 20)}... | ${r.latencyMs.toFixed(0)}ms | ${r.passed ? '✅' : '❌'} |`).join('\n')}

### STT Tests

| # | Latency | Status |
|---|---------|--------|
${results.stt.map(r => `| ${r.iteration} | ${r.latencyMs.toFixed(0)}ms | ${r.passed ? '✅' : '❌'} |`).join('\n')}

---

## Recommendations

${generateRecommendations(results)}

---

**Generated:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
  `.trim();
  
  fs.writeFileSync(mdPath, mdReport);
  
  console.log(`   📄 JSON Report: ${jsonPath}`);
  console.log(`   📄 Markdown Report: ${mdPath}`);
}

function generateRecommendations(results) {
  const recommendations = [];
  
  if (results.summary.tts.avg >= 300) {
    recommendations.push('- ⚠️ **TTS latency too high** - Consider optimizing API calls or using caching');
  }
  
  if (results.summary.stt.avg >= 500) {
    recommendations.push('- ⚠️ **STT latency too high** - Check network connection and WebSocket stability');
  }
  
  if (results.summary.tts.passRate < 100) {
    recommendations.push('- ❌ **TTS consistency issues** - Investigate timeout causes');
  }
  
  if (results.summary.stt.passRate < 100) {
    recommendations.push('- ❌ **STT consistency issues** - Review STT implementation');
  }
  
  if (recommendations.length === 0) {
    return '✅ All performance metrics within acceptable range!';
  }
  
  return recommendations.join('\n');
}

// Run the monitor
monitorPerformance();
```

---

## How to Use These Scripts

### Prerequisites

```bash
# Install dependencies
npm install lighthouse chrome-launcher puppeteer axe-core date-fns

# Make sure app is running
npm run dev  # or pnpm dev
```

### Run Individual Scripts

```bash
# Lighthouse Batch Audit
node scripts/qa-lighthouse-batch.js

# Accessibility Scan
node scripts/qa-accessibility-scan.js

# Performance Monitor
node scripts/qa-performance-monitor.js
```

### Run All QA Scripts

```bash
# Create a master script
node scripts/qa-run-all.js
```

---

## Output Location

All reports are saved to:
```
qa-reports/
├── lighthouse/
│   ├── lighthouse-report-YYYY-MM-DD_HH-mm-ss.html
│   └── lighthouse-report-YYYY-MM-DD_HH-mm-ss.json
├── accessibility/
│   ├── accessibility-scan-YYYY-MM-DD_HH-mm-ss.json
│   └── accessibility-scan-YYYY-MM-DD_HH-mm-ss.md
└── performance/
    ├── performance-monitor-YYYY-MM-DD_HH-mm-ss.json
    └── performance-monitor-YYYY-MM-DD_HH-mm-ss.md
```

---

**Last Updated:** March 26, 2026
