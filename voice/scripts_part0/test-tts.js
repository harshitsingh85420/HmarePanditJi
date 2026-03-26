/**
 * TTS Testing Framework for HmarePanditJi Voice Scripts
 * Tests all voice scripts via Sarvam Bulbul v3 TTS API
 * 
 * Usage: node test-tts.js [screenId] [languageCode]
 * Examples:
 *   node test-tts.js                    # Test all scripts
 *   node test-tts.js S-0.1              # Test S-0.1 all languages
 *   node test-tts.js S-0.1 hi-IN        # Test S-0.1 Hindi only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  sarvamApiKey: process.env.SARVAM_API_KEY || 'your-sarvam-api-key',
  sarvamModel: 'bulbul-v3',
  outputDir: path.join(__dirname, 'tts-output'),
  reportFile: path.join(__dirname, 'TTS_TEST_REPORT.md'),
  maxConcurrentRequests: 5,
  retryAttempts: 3,
  retryDelayMs: 1000,
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Test results storage
const testResults = {
  summary: {
    totalScripts: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    totalDuration: 0,
    averageDuration: 0,
  },
  byScreen: {},
  byLanguage: {},
  failedScripts: [],
  warnings: [],
  startTime: new Date().toISOString(),
  endTime: null,
};

/**
 * Call Sarvam TTS API
 */
async function callSarvamTTS(text, language, scriptId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: CONFIG.sarvamModel,
      text: text,
      language: language,
      speaker: 'ratan',
      pace: 0.88,
      pitch: 1.0,
      output_format: 'mp3',
      sample_rate: 22050,
    });

    const options = {
      hostname: 'api.sarvam.ai',
      port: 443,
      path: '/v1/tts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.sarvamApiKey}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test a single script
 */
async function testScript(script, screenId, language) {
  const result = {
    scriptId: script.id,
    screenId: screenId,
    language: language,
    text: script.text,
    status: 'pending',
    duration: 0,
    audioSize: 0,
    error: null,
    warnings: [],
    testedAt: new Date().toISOString(),
  };

  // Check text length (should be under 500 characters)
  if (script.text.length > 500) {
    result.warnings.push(`Text too long: ${script.text.length} chars (max 500)`);
  }

  // Check for placeholder text (should be replaced with actual translations)
  if (script.text.includes('[Tamil]') || script.text.includes('[Telugu]') || 
      script.text.includes('[Bengali]') || script.text.includes('[Marathi]') ||
      script.text.includes('[Gujarati]') || script.text.includes('[Kannada]') ||
      script.text.includes('[Malayalam]') || script.text.includes('[Punjabi]') ||
      script.text.includes('[Odia]') || script.text.includes('[Bhojpuri]') ||
      script.text.includes('[Maithili]') || script.text.includes('[Sanskrit]') ||
      script.text.includes('[Assamese]')) {
    result.warnings.push('Translation placeholder not replaced');
  }

  // Skip actual TTS call in dry-run mode
  if (process.env.DRY_RUN === 'true') {
    result.status = result.warnings.length > 0 ? 'warning' : 'passed';
    result.duration = 0;
    return result;
  }

  // Call TTS API
  const startTime = Date.now();
  try {
    const response = await callSarvamTTS(script.text, language, script.id);
    const duration = Date.now() - startTime;

    result.status = 'passed';
    result.duration = duration;
    result.audioSize = response.audio_length || 0;
    
    // Check audio duration (should be under 8 seconds)
    if (response.audio_length && response.audio_length > 8) {
      result.warnings.push(`Audio too long: ${response.audio_length.toFixed(2)}s (max 8s)`);
    }

    // Save audio file
    if (response.audio_base64) {
      const audioFileName = `${screenId}_${language}_${script.id.replace(/:/g, '-')}.mp3`;
      const audioPath = path.join(CONFIG.outputDir, audioFileName);
      const audioBuffer = Buffer.from(response.audio_base64, 'base64');
      fs.writeFileSync(audioPath, audioBuffer);
      result.audioFile = audioFileName;
    }

  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    result.duration = Date.now() - startTime;
  }

  // Update status if there are warnings
  if (result.status === 'passed' && result.warnings.length > 0) {
    result.status = 'warning';
  }

  return result;
}

/**
 * Load script file
 */
function loadScriptFile(filePath) {
  try {
    // Read the TypeScript file and extract the export
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Simple extraction - in production, use proper TS parser
    const exportMatch = content.match(/export const (\w+) = ({[\s\S]*?});\n\nexport default/);
    if (!exportMatch) {
      return null;
    }

    // Evaluate the object (safe in this controlled context)
    const objCode = `(${exportMatch[1]})`;
    const scriptObj = eval(objCode);
    
    return {
      name: exportMatch[1],
      data: scriptObj,
    };
  } catch (error) {
    console.error(`Error loading ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Test all scripts in a file
 */
async function testScriptFile(filePath, filterScreenId = null, filterLanguage = null) {
  const loaded = loadScriptFile(filePath);
  if (!loaded) {
    return [];
  }

  const scriptData = loaded.data;
  const screenId = scriptData.screenId;
  
  // Apply screen filter
  if (filterScreenId && screenId !== filterScreenId) {
    return [];
  }

  console.log(`\n📋 Testing Screen: ${screenId} - ${scriptData.screenName}`);
  console.log(`   Total Languages: ${Object.keys(scriptData.scripts).length}`);

  const results = [];
  const languages = Object.keys(scriptData.scripts);

  for (const language of languages) {
    // Apply language filter
    if (filterLanguage && language !== filterLanguage) {
      continue;
    }

    const scripts = scriptData.scripts[language];
    console.log(`   Testing ${language}: ${scripts.length} scripts...`);

    for (const script of scripts) {
      const result = await testScript(script, screenId, language);
      results.push(result);

      // Update summary
      testResults.summary.totalScripts++;
      if (result.status === 'passed') {
        testResults.summary.passed++;
      } else if (result.status === 'failed') {
        testResults.summary.failed++;
        testResults.failedScripts.push(result);
      } else if (result.status === 'warning') {
        testResults.summary.warnings++;
        testResults.warnings.push(result);
      }

      // Update by-screen stats
      if (!testResults.byScreen[screenId]) {
        testResults.byScreen[screenId] = { total: 0, passed: 0, failed: 0, warnings: 0 };
      }
      testResults.byScreen[screenId].total++;
      testResults.byScreen[screenId][result.status]++;

      // Update by-language stats
      if (!testResults.byLanguage[language]) {
        testResults.byLanguage[language] = { total: 0, passed: 0, failed: 0, warnings: 0 };
      }
      testResults.byLanguage[language].total++;
      testResults.byLanguage[language][result.status]++;

      // Progress indicator
      const total = testResults.summary.totalScripts;
      if (total % 100 === 0) {
        console.log(`   Progress: ${total} scripts tested...`);
      }

      // Rate limiting - delay between requests
      if (process.env.DRY_RUN !== 'true') {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  return results;
}

/**
 * Generate Markdown report
 */
function generateReport() {
  testResults.endTime = new Date().toISOString();
  
  const duration = new Date(testResults.endTime) - new Date(testResults.startTime);
  const durationMinutes = Math.floor(duration / 60000);
  const durationSeconds = Math.floor((duration % 60000) / 1000);

  let report = `# TTS Test Report - HmarePanditJi Voice Scripts

**Test Date:** ${testResults.startTime.split('T')[0]}
**Test Duration:** ${durationMinutes}m ${durationSeconds}s
**TTS Engine:** Sarvam Bulbul v3
**Test Mode:** ${process.env.DRY_RUN === 'true' ? 'DRY RUN (no API calls)' : 'LIVE API'}

---

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Scripts Tested | ${testResults.summary.totalScripts} | - |
| Passed | ${testResults.summary.passed} | ${testResults.summary.passed / testResults.summary.totalScripts * 100 >= 95 ? '✅' : '⚠️'} |
| Failed | ${testResults.summary.failed} | ${testResults.summary.failed === 0 ? '✅' : '❌'} |
| Warnings | ${testResults.summary.warnings} | ${testResults.summary.warnings < 100 ? '✅' : '⚠️'} |
| Success Rate | ${(testResults.summary.passed / testResults.summary.totalScripts * 100).toFixed(2)}% | ${testResults.summary.passed / testResults.summary.totalScripts * 100 >= 95 ? '✅' : '❌'} |

---

## 📈 Results by Screen

| Screen ID | Screen Name | Total | Passed | Failed | Warnings | Success Rate |
|-----------|-------------|-------|--------|--------|----------|--------------|
`;

  for (const [screenId, stats] of Object.entries(testResults.byScreen)) {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    report += `| ${screenId} | - | ${stats.total} | ${stats.passed} | ${stats.failed} | ${stats.warnings} | ${successRate}% |\n`;
  }

  report += `
---

## 🌍 Results by Language

| Language | Total | Passed | Failed | Warnings | Success Rate |
|----------|-------|--------|--------|----------|--------------|
`;

  for (const [language, stats] of Object.entries(testResults.byLanguage)) {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    const langName = language === 'hi-IN' ? 'Hindi' : 
                     language === 'ta-IN' ? 'Tamil' :
                     language === 'te-IN' ? 'Telugu' :
                     language === 'bn-IN' ? 'Bengali' :
                     language === 'mr-IN' ? 'Marathi' :
                     language === 'gu-IN' ? 'Gujarati' :
                     language === 'kn-IN' ? 'Kannada' :
                     language === 'ml-IN' ? 'Malayalam' :
                     language === 'pa-IN' ? 'Punjabi' :
                     language === 'or-IN' ? 'Odia' :
                     language === 'en-IN' ? 'English' : language;
    report += `| ${langName} (${language}) | ${stats.total} | ${stats.passed} | ${stats.failed} | ${stats.warnings} | ${successRate}% |\n`;
  }

  if (testResults.failedScripts.length > 0) {
    report += `
---

## ❌ Failed Scripts

| Script ID | Screen | Language | Error |
|-----------|--------|----------|-------|
`;
    testResults.failedScripts.slice(0, 50).forEach(script => {
      report += `| ${script.scriptId} | ${script.screenId} | ${script.language} | ${script.error} |\n`;
    });
    if (testResults.failedScripts.length > 50) {
      report += `| ... | ... | ... | ${testResults.failedScripts.length - 50} more |\n`;
    }
  }

  if (testResults.warnings.length > 0) {
    report += `
---

## ⚠️ Scripts with Warnings

| Script ID | Screen | Language | Warnings |
|-----------|--------|----------|----------|
`;
    testResults.warnings.slice(0, 50).forEach(script => {
      report += `| ${script.scriptId} | ${script.screenId} | ${script.language} | ${script.warnings.join(', ')} |\n`;
    });
    if (testResults.warnings.length > 50) {
      report += `| ... | ... | ... | ${testResults.warnings.length - 50} more |\n`;
    }
  }

  report += `
---

## 📁 Audio Files

**Output Directory:** \`voice/scripts_part0/tts-output/\`

${testResults.summary.passed} audio files generated successfully.

---

## ✅ Recommendations

`;

  if (testResults.summary.failed > 0) {
    report += `1. **Fix Failed Scripts:** Review and fix ${testResults.summary.failed} failed scripts\n`;
  }
  if (testResults.summary.warnings > 0) {
    report += `2. **Address Warnings:** Review ${testResults.summary.warnings} scripts with warnings\n`;
  }
  if (testResults.byLanguage['hi-IN']?.failed > 0 || testResults.byLanguage['hi-IN']?.warnings > 0) {
    report += `3. **Priority: Fix Hindi Scripts:** Hindi is primary language, ensure 100% quality\n`;
  }
  
  const lowSuccessLanguages = Object.entries(testResults.byLanguage)
    .filter(([_, stats]) => (stats.passed / stats.total) < 0.95)
    .map(([lang, _]) => lang);
  
  if (lowSuccessLanguages.length > 0) {
    report += `4. **Review Low-Success Languages:** ${lowSuccessLanguages.join(', ')}\n`;
  }

  report += `
---

## 🚀 Next Steps

1. Replace translation placeholders with actual translations
2. Re-run TTS tests after translations are complete
3. Have native speakers review audio quality
4. Integrate approved audio files into the app

---

**Report Generated:** ${testResults.endTime}
**Test Framework Version:** 1.0
`;

  return report;
}

/**
 * Main function
 */
async function main() {
  const filterScreenId = process.argv[2] || null;
  const filterLanguage = process.argv[3] || null;

  console.log('🎵 HmarePanditJi TTS Testing Framework');
  console.log('=====================================');
  console.log(`📁 Output Directory: ${CONFIG.outputDir}`);
  console.log(`🔧 Test Mode: ${process.env.DRY_RUN === 'true' ? 'DRY RUN' : 'LIVE API'}`);
  console.log(`🎯 Filter Screen: ${filterScreenId || 'All'}`);
  console.log(`🎯 Filter Language: ${filterLanguage || 'All'}`);
  console.log('');

  // Find all script files
  const scriptFiles = fs.readdirSync(__dirname)
    .filter(f => f.match(/^\d{2}_S-0\.\d+.*\.ts$/))
    .map(f => path.join(__dirname, f));

  console.log(`📂 Found ${scriptFiles.length} script files`);

  // Test each file
  for (const file of scriptFiles) {
    await testScriptFile(file, filterScreenId, filterLanguage);
  }

  // Generate report
  const report = generateReport();
  fs.writeFileSync(CONFIG.reportFile, report, 'utf-8');

  console.log('');
  console.log('=====================================');
  console.log('📊 Test Summary:');
  console.log(`   Total Scripts: ${testResults.summary.totalScripts}`);
  console.log(`   ✅ Passed: ${testResults.summary.passed}`);
  console.log(`   ❌ Failed: ${testResults.summary.failed}`);
  console.log(`   ⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`   Success Rate: ${(testResults.summary.passed / testResults.summary.totalScripts * 100).toFixed(2)}%`);
  console.log('');
  console.log(`📄 Full Report: ${CONFIG.reportFile}`);
  console.log(`🎵 Audio Files: ${CONFIG.outputDir}/`);
}

// Run main function
main().catch(console.error);
