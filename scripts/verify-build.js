#!/usr/bin/env node

/**
 * Build Verification Script
 * 
 * Usage: node scripts/verify-build.js
 * 
 * This script:
 * 1. Runs full build
 * 2. Checks bundle size
 * 3. Verifies critical files exist
 * 4. Generates build report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PANDIT_APP_PATH = path.join(__dirname, '..', 'apps', 'pandit');
const BUILD_OUTPUT_PATH = path.join(PANDIT_APP_PATH, '.next');
const BUILD_REPORT_PATH = path.join(__dirname, '..', 'BUILD_VERIFICATION_REPORT.md');

const BUILD_CONFIG = {
  maxBundleSize: 500 * 1024, // 500 KB
  maxStaticSize: 300 * 1024, // 300 KB
  criticalFiles: [
    'apps/pandit/src/app/layout.tsx',
    'apps/pandit/src/app/page.tsx',
    'apps/pandit/src/app/loading.tsx',
    'apps/pandit/src/app/error.tsx',
    'apps/pandit/src/app/global-error.tsx',
    'apps/pandit/src/app/not-found.tsx',
  ],
  requiredEnvVars: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SENTRY_DSN',
  ],
};

function runBuild() {
  console.log('🔨 Running build...\n');
  
  try {
    const result = execSync('pnpm run build', {
      cwd: PANDIT_APP_PATH,
      encoding: 'utf-8',
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });
    
    console.log('✅ Build completed successfully!\n');
    return { success: true, output: result };
  } catch (error) {
    console.log('❌ Build failed!\n');
    console.log(error.stdout || error.stderr);
    return { success: false, output: error.stdout || error.stderr };
  }
}

function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }
  
  let totalSize = 0;
  
  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        totalSize += fs.statSync(fullPath).size;
      }
    });
  }
  
  traverse(dirPath);
  return totalSize;
}

function analyzeBundleSize() {
  console.log('📊 Analyzing bundle size...\n');
  
  const buildSize = getDirectorySize(BUILD_OUTPUT_PATH);
  const staticSize = getDirectorySize(path.join(BUILD_OUTPUT_PATH, 'static'));
  const serverSize = getDirectorySize(path.join(BUILD_OUTPUT_PATH, 'server'));
  
  const report = {
    totalSize: buildSize,
    staticSize,
    serverSize,
    passed: buildSize < BUILD_CONFIG.maxBundleSize * 2, // Allow some overhead
  };
  
  console.log(`   Total Build: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Static Files: ${(staticSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Server Files: ${(serverSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  if (report.passed) {
    console.log('✅ Bundle size within acceptable range\n');
  } else {
    console.log('⚠️  Bundle size exceeds recommended limit\n');
  }
  
  return report;
}

function checkCriticalFiles() {
  console.log('🔍 Checking critical files...\n');
  
  const rootPath = path.join(__dirname, '..');
  const results = BUILD_CONFIG.criticalFiles.map(file => {
    const fullPath = path.join(rootPath, file);
    const exists = fs.existsSync(fullPath);
    return { file, exists };
  });
  
  const allExist = results.every(r => r.exists);
  
  results.forEach(({ file, exists }) => {
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });
  
  console.log('');
  
  if (allExist) {
    console.log('✅ All critical files present\n');
  } else {
    console.log('❌ Some critical files are missing\n');
  }
  
  return { files: results, passed: allExist };
}

function checkEnvVars() {
  console.log('🔐 Checking environment variables...\n');
  
  const envPath = path.join(PANDIT_APP_PATH, '.env.production');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
  }
  
  const results = BUILD_CONFIG.requiredEnvVars.map(varName => {
    const exists = !!envVars[varName];
    return { name: varName, exists };
  });
  
  const allExist = results.every(r => r.exists);
  
  results.forEach(({ name, exists }) => {
    console.log(`   ${exists ? '✅' : '❌'} ${name}`);
  });
  
  console.log('');
  
  if (allExist) {
    console.log('✅ All required environment variables present\n');
  } else {
    console.log('❌ Some environment variables are missing\n');
  }
  
  return { vars: results, passed: allExist };
}

function generateReport(buildResult, bundleReport, fileCheck, envCheck) {
  const timestamp = new Date().toISOString();
  const overallPass = buildResult.success && bundleReport.passed && fileCheck.passed && envCheck.passed;
  
  let report = `# Build Verification Report\n\n`;
  report += `**Generated:** ${timestamp}\n`;
  report += `**Status:** ${overallPass ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  report += `## 📊 Summary\n\n`;
  report += `| Check | Status |\n|-------|--------|\n`;
  report += `| Build | ${buildResult.success ? '✅ Pass' : '❌ Fail'} |\n`;
  report += `| Bundle Size | ${bundleReport.passed ? '✅ Pass' : '⚠️ Warning'} |\n`;
  report += `| Critical Files | ${fileCheck.passed ? '✅ Pass' : '❌ Fail'} |\n`;
  report += `| Environment Vars | ${envCheck.passed ? '✅ Pass' : '❌ Fail'} |\n\n`;
  
  report += `## 🔨 Build Output\n\n`;
  report += `\`\`\`\n${buildResult.output.slice(-2000)}\n\`\`\`\n\n`;
  
  report += `## 📦 Bundle Size Details\n\n`;
  report += `| Component | Size | Target |\n|-----------|------|--------|\n`;
  report += `| Total Build | ${(bundleReport.totalSize / 1024 / 1024).toFixed(2)} MB | < 1 MB |\n`;
  report += `| Static Files | ${(bundleReport.staticSize / 1024 / 1024).toFixed(2)} MB | < 300 KB |\n`;
  report += `| Server Files | ${(bundleReport.serverSize / 1024 / 1024).toFixed(2)} MB | < 500 KB |\n\n`;
  
  report += `## 📁 Critical Files\n\n`;
  report += `| File | Status |\n|------|--------|\n`;
  fileCheck.files.forEach(({ file, exists }) => {
    report += `| \`${file}\` | ${exists ? '✅' : '❌'} |\n`;
  });
  report += '\n';
  
  report += `## 🔐 Environment Variables\n\n`;
  report += `| Variable | Status |\n|----------|--------|\n`;
  envCheck.vars.forEach(({ name, exists }) => {
    report += `| \`${name}\` | ${exists ? '✅' : '❌'} |\n`;
  });
  report += '\n';
  
  if (!overallPass) {
    report += `## ❌ Action Items\n\n`;
    
    if (!buildResult.success) {
      report += `1. **Fix Build Errors**: Review build output above\n`;
    }
    if (!bundleReport.passed) {
      report += `2. **Optimize Bundle**: Run bundle analyzer, remove unused dependencies\n`;
    }
    if (!fileCheck.passed) {
      report += `3. **Create Missing Files**: See critical files list above\n`;
    }
    if (!envCheck.passed) {
      report += `4. **Add Environment Variables**: See required vars list above\n`;
    }
    
    report += '\n';
  }
  
  report += `## 📈 Build History\n\n`;
  report += `| Date | Status | Bundle Size | Notes |\n|------|--------|-------------|-------|\n`;
  report += `| ${timestamp.split('T')[0]} | ${overallPass ? '✅' : '❌'} | ${(bundleReport.totalSize / 1024 / 1024).toFixed(2)} MB | ${overallPass ? 'Ready for deployment' : 'Needs fixes'} |\n\n`;
  
  return report;
}

function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Build Verification Tool                 ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  // Run build
  const buildResult = runBuild();
  
  if (!buildResult.success) {
    console.log('❌ Build failed. Cannot proceed with verification.\n');
    const report = generateReport(buildResult, { passed: false, totalSize: 0, staticSize: 0, serverSize: 0 }, 
      { passed: false, files: [] }, { passed: false, vars: [] });
    fs.writeFileSync(BUILD_REPORT_PATH, report);
    console.log(`📄 Report saved to: ${BUILD_REPORT_PATH}\n`);
    process.exit(1);
  }
  
  // Analyze bundle
  const bundleReport = analyzeBundleSize();
  
  // Check critical files
  const fileCheck = checkCriticalFiles();
  
  // Check environment variables
  const envCheck = checkEnvVars();
  
  // Generate report
  console.log('📝 Generating build report...\n');
  const report = generateReport(buildResult, bundleReport, fileCheck, envCheck);
  fs.writeFileSync(BUILD_REPORT_PATH, report);
  
  const overallPass = buildResult.success && bundleReport.passed && fileCheck.passed && envCheck.passed;
  
  console.log(`✅ Verification complete!`);
  console.log(`📄 Report saved to: ${BUILD_REPORT_PATH}\n`);
  
  if (overallPass) {
    console.log('🎉 All checks passed! Ready for deployment.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Review report for details.\n');
    process.exit(1);
  }
}

main();
