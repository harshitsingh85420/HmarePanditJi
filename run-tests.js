/**
 * 🧪 HmarePanditJi - Automated Test Runner
 * 
 * This script runs automated tests on your local app.
 * 
 * USAGE:
 * 1. Make sure your app is running: npm run dev (on port 3002)
 * 2. Run: node run-tests.js
 * 3. View report: Open playwright-report/index.html in browser
 * 
 * Duration: 15-20 minutes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 HmarePanditJi - Automated Test Runner\n');

// Check if app is running
console.log('📋 Step 1: Checking if app is running on port 3002...');
try {
  const result = execSync('netstat -ano | findstr :3002', { encoding: 'utf-8' });
  if (result.includes('LISTENING')) {
    console.log('✅ App is running on port 3002\n');
  } else {
    console.log('❌ App is NOT running on port 3002');
    console.log('\n📝 Please start your app first:');
    console.log('   cd apps\\pandit');
    console.log('   npm run dev\n');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ App is NOT running on port 3002');
  console.log('\n📝 Please start your app first:');
  console.log('   cd apps\\pandit');
  console.log('   npm run dev\n');
  process.exit(1);
}

// Check if Playwright is installed
console.log('📋 Step 2: Checking if Playwright is installed...');
try {
  execSync('npx playwright --version', { stdio: 'pipe' });
  console.log('✅ Playwright is installed\n');
} catch (error) {
  console.log('❌ Playwright is NOT installed');
  console.log('\n📝 Installing Playwright...');
  try {
    execSync('npm install -D @playwright/test', { stdio: 'inherit' });
    console.log('✅ Playwright installed\n');
    
    console.log('📝 Installing browsers (this takes 2-3 minutes)...');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    console.log('✅ Browsers installed\n');
  } catch (installError) {
    console.log('❌ Failed to install Playwright');
    console.log('\n📝 Manual installation:');
    console.log('   npm install -D @playwright/test');
    console.log('   npx playwright install chromium\n');
    process.exit(1);
  }
}

// Run tests
console.log('📋 Step 3: Running tests...\n');
console.log('⏱️  This will take 15-20 minutes...\n');

try {
  console.log('Running tests on Desktop Chrome (Dev)...\n');
  execSync('npx playwright test --project="Desktop Chrome (Dev)" --reporter=html,list', { 
    stdio: 'inherit',
    env: { ...process.env, PW_TEST_HTML_REPORT_OPEN: 'never' }
  });
  
  console.log('\n✅ Tests completed!\n');
  
  // Check if report exists
  const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
  if (fs.existsSync(reportPath)) {
    console.log('📊 Test Report: playwright-report/index.html\n');
    console.log('📝 To view report, run:');
    console.log('   npx playwright show-report\n');
    console.log('🎉 Done! Review the report and fix any failures.\n');
  } else {
    console.log('⚠️  Report not found. Check test output for details.\n');
  }
  
} catch (testError) {
  console.log('\n❌ Tests failed or encountered errors\n');
  console.log('📝 Review the output above for details\n');
  console.log('💡 Common fixes:');
  console.log('   1. Make sure app is running on http://localhost:3002');
  console.log('   2. Clear browser cache (Ctrl+Shift+Delete)');
  console.log('   3. Restart the app');
  console.log('   4. Run tests in debug mode: npx playwright test --debug\n');
  
  // Still try to show report if it exists
  const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
  if (fs.existsSync(reportPath)) {
    console.log('📊 Test Report still generated: playwright-report/index.html\n');
    console.log('📝 To view report, run:');
    console.log('   npx playwright show-report\n');
  }
  
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ Testing Complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 NEXT STEPS:');
console.log('   1. View HTML report: npx playwright show-report');
console.log('   2. Fix any failing tests');
console.log('   3. Run manual testing: See COMPLETE_TESTING_PROTOCOL.md');
console.log('   4. Document results: Create TEST_RESULTS.md\n');

console.log('🎯 BUSINESS METRICS TO CHECK:');
console.log('   ✅ All 73 tests pass');
console.log('   ✅ No flaky tests (tests that sometimes fail)');
console.log('   ✅ Happy path completes in < 5 minutes');
console.log('   ✅ No console errors in report\n');

console.log('📞 NEED HELP?');
console.log('   - Debug mode: npx playwright test --debug');
console.log('   - View trace: npx playwright show-trace test-results/trace.zip');
console.log('   - Single test: npx playwright test -g "Registration"\n');
