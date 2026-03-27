#!/usr/bin/env node

/**
 * TypeScript Error Analysis Script
 * 
 * Usage: node scripts/analyze-ts-errors.js
 * 
 * This script:
 * 1. Runs TypeScript compiler
 * 2. Parses error output
 * 3. Groups errors by file and type
 * 4. Generates a prioritized fix list
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PANDIT_APP_PATH = path.join(__dirname, '..', 'apps', 'pandit');
const ERROR_OUTPUT_PATH = path.join(PANDIT_APP_PATH, 'ts_errors.txt');
const ANALYSIS_OUTPUT_PATH = path.join(__dirname, '..', 'TS_ERROR_ANALYSIS.md');

// Error pattern groups to prioritize
const ERROR_PATTERNS = {
  CRITICAL: [
    'TS1109', // Expression expected
    'TS1131', // Property or signature expected
    'TS1005', // ';' expected
    'TS1003', // Identifier expected
    'TS1128', // Declaration or statement expected
  ],
  HIGH: [
    'TS2304', // Cannot find name
    'TS2307', // Cannot find module
    'TS2339', // Property does not exist
    'TS7006', // Parameter implicitly has 'any' type
  ],
  MEDIUM: [
    'TS2322', // Type is not assignable
    'TS2345', // Argument of type is not assignable
    'TS2532', // Object is possibly 'undefined'
    'TS2531', // Object is possibly 'null'
  ],
  LOW: [
    'TS6133', // Variable is declared but never used
    'TS6196', // Interface is declared but never used
    'TS7022', // Variable implicitly has 'any' type
  ],
};

function runTypeScriptCheck() {
  console.log('🔍 Running TypeScript check...\n');
  
  try {
    const result = execSync(
      'npx tsc --noEmit --pretty false',
      {
        cwd: PANDIT_APP_PATH,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '0' }
      }
    );
    
    console.log('✅ No TypeScript errors found!');
    fs.writeFileSync(ERROR_OUTPUT_PATH, '');
    return [];
  } catch (error) {
    const errors = error.stdout || error.stderr || '';
    fs.writeFileSync(ERROR_OUTPUT_PATH, errors);
    console.log(`❌ Found TypeScript errors. Saved to: ${ERROR_OUTPUT_PATH}\n`);
    return errors.split('\n').filter(line => line.trim());
  }
}

function parseErrors(errorLines) {
  const errorsByFile = new Map();
  const errorsByCode = new Map();
  
  errorLines.forEach(line => {
    if (!line.trim()) return;
    
    // Parse error format: path(line,col): error TSXXXX: Message
    const match = line.match(/^(.+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (!match) return;
    
    const [, filePath, lineNum, colNum, errorCode, message] = match;
    
    // Group by file
    if (!errorsByFile.has(filePath)) {
      errorsByFile.set(filePath, []);
    }
    errorsByFile.get(filePath).push({
      line: parseInt(lineNum),
      col: parseInt(colNum),
      code: errorCode,
      message: message.trim(),
      fullLine: line,
    });
    
    // Group by error code
    if (!errorsByCode.has(errorCode)) {
      errorsByCode.set(errorCode, []);
    }
    errorsByCode.get(errorCode).push({
      file: filePath,
      line: parseInt(lineNum),
      message: message.trim(),
    });
  });
  
  return { errorsByFile, errorsByCode };
}

function getErrorPriority(errorCode) {
  for (const [priority, codes] of Object.entries(ERROR_PATTERNS)) {
    if (codes.includes(errorCode)) {
      return priority;
    }
  }
  return 'LOW';
}

function generateReport({ errorsByFile, errorsByCode }) {
  const totalErrors = Array.from(errorsByFile.values()).reduce((sum, errs) => sum + errs.length, 0);
  
  let report = `# TypeScript Error Analysis Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Total Errors:** ${totalErrors}\n`;
  report += `**Files Affected:** ${errorsByFile.size}\n\n`;
  
  // Summary by priority
  report += `## 🎯 Error Priority Summary\n\n`;
  const priorityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  
  Array.from(errorsByCode.keys()).forEach(code => {
    const priority = getErrorPriority(code);
    priorityCounts[priority] += errorsByCode.get(code).length;
  });
  
  report += `| Priority | Count |\n|----------|-------|\n`;
  report += `| CRITICAL | ${priorityCounts.CRITICAL} |\n`;
  report += `| HIGH | ${priorityCounts.HIGH} |\n`;
  report += `| MEDIUM | ${priorityCounts.MEDIUM} |\n`;
  report += `| LOW | ${priorityCounts.LOW} |\n\n`;
  
  // Summary by error code
  report += `## 📊 Error Code Distribution\n\n`;
  report += `| Error Code | Count | Description |\n|------------|-------|-------------|\n`;
  
  const errorDescriptions = {
    'TS1109': 'Expression expected',
    'TS1131': 'Property or signature expected',
    'TS1005': "';' expected",
    'TS1003': 'Identifier expected',
    'TS1128': 'Declaration or statement expected',
    'TS2304': 'Cannot find name',
    'TS2307': 'Cannot find module',
    'TS2339': 'Property does not exist',
    'TS7006': 'Parameter implicitly has any type',
    'TS2322': 'Type is not assignable',
    'TS2345': 'Argument of type is not assignable',
    'TS2532': 'Object is possibly undefined',
    'TS2531': 'Object is possibly null',
    'TS6133': 'Variable declared but never used',
    'TS7022': 'Variable implicitly has any type',
  };
  
  Array.from(errorsByCode.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([code, errors]) => {
      const desc = errorDescriptions[code] || 'See TypeScript docs';
      report += `| ${code} | ${errors.length} | ${desc} |\n`;
    });
  
  report += '\n';
  
  // Files sorted by error count
  report += `## 📁 Files by Error Count (Top 20)\n\n`;
  report += `| File | Errors | Priority |\n|------|--------|----------|\n`;
  
  const sortedFiles = Array.from(errorsByFile.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);
  
  sortedFiles.forEach(([file, errors]) => {
    const errorCodes = [...new Set(errors.map(e => e.code))];
    const maxPriority = errorCodes
      .map(getErrorPriority)
      .sort((a, b) => {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return order[a] - order[b];
      })[0];
    
    const priorityEmoji = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    };
    
    report += `| \`${file}\` | ${errors.length} | ${priorityEmoji[maxPriority]} ${maxPriority} |\n`;
  });
  
  report += '\n';
  
  // Fix recommendations
  report += `## 🔧 Recommended Fix Strategy\n\n`;
  
  report += `### Phase 1: Critical Errors (Day 1-2)\n`;
  report += `Focus on files with CRITICAL errors - these indicate corrupted/malformed code:\n\n`;
  
  const criticalFiles = Array.from(errorsByFile.entries())
    .filter(([, errors]) => errors.some(e => getErrorPriority(e.code) === 'CRITICAL'))
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  criticalFiles.forEach(([file, errors]) => {
    const criticalErrors = errors.filter(e => getErrorPriority(e.code) === 'CRITICAL');
    report += `- \`${file}\` (${criticalErrors.length} critical errors)\n`;
  });
  
  report += `\n### Phase 2: High Priority Errors (Day 2-3)\n`;
  report += `Fix missing imports, undefined types, and module resolution issues.\n\n`;
  
  report += `### Phase 3: Medium Priority Errors (Day 3-4)\n`;
  report += `Fix type mismatches and null/undefined handling.\n\n`;
  
  report += `### Phase 4: Low Priority Errors (Day 4-5)\n`;
  report += `Clean up unused variables and add explicit type annotations.\n\n`;
  
  // Common fix patterns
  report += `## 💡 Common Fix Patterns\n\n`;
  
  report += `### Pattern 1: Expression Expected (TS1109)\n`;
  report += `\`\`\`typescript\n`;
  report += `// ❌ BROKEN - Template literal saved as code\n`;
  report += `const component = \`<div>content</div>\`;\n\n`;
  report += `// ✅ FIXED - Proper JSX\n`;
  report += `const component = <div>content</div>;\n`;
  report += `\`\`\`\n\n`;
  
  report += `### Pattern 2: Property Assignment Expected (TS1131)\n`;
  report += `\`\`\`typescript\n`;
  report += `// ❌ BROKEN - Missing comma or malformed object\n`;
  report += `const config = {\n  name: "test"\n  value: 123\n};\n\n`;
  report += `// ✅ FIXED - Add comma\n`;
  report += `const config = {\n  name: "test",\n  value: 123\n};\n`;
  report += `\`\`\`\n\n`;
  
  report += `### Pattern 3: Declaration Expected (TS1128)\n`;
  report += `\`\`\`typescript\n`;
  report += `// ❌ BROKEN - Unclosed brace or parenthesis\n`;
  report += `function test() {\n  if (true) {\n    console.log("test");\n  \n}\n\n`;
  report += `// ✅ FIXED - Close all braces\n`;
  report += `function test() {\n  if (true) {\n    console.log("test");\n  }\n};\n`;
  report += `\`\`\`\n\n`;
  
  // Detailed file list
  report += `## 📋 Complete File List\n\n`;
  report += `| # | File | Total | Critical | High | Medium | Low |\n|---|------|-------|----------|------|--------|-----|\n`;
  
  Array.from(errorsByFile.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([file, errors], idx) => {
      const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      errors.forEach(e => counts[getErrorPriority(e.code)]++);
      
      report += `| ${idx + 1} | \`${file}\` | ${errors.length} | ${counts.CRITICAL} | ${counts.HIGH} | ${counts.MEDIUM} | ${counts.LOW} |\n`;
    });
  
  return report;
}

function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   TypeScript Error Analysis Tool          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  // Run TypeScript check
  const errorLines = runTypeScriptCheck();
  
  if (errorLines.length === 0) {
    console.log('✨ No errors to analyze!');
    return;
  }
  
  // Parse errors
  console.log('📊 Parsing errors...\n');
  const { errorsByFile, errorsByCode } = parseErrors(errorLines);
  
  // Generate report
  console.log('📝 Generating analysis report...\n');
  const report = generateReport({ errorsByFile, errorsByCode });
  fs.writeFileSync(ANALYSIS_OUTPUT_PATH, report);
  
  console.log(`✅ Analysis complete!`);
  console.log(`📄 Report saved to: ${ANALYSIS_OUTPUT_PATH}\n`);
  
  // Print summary
  const totalErrors = Array.from(errorsByFile.values()).reduce((sum, errs) => sum + errs.length, 0);
  console.log(`📊 Summary:`);
  console.log(`   Total Errors: ${totalErrors}`);
  console.log(`   Files Affected: ${errorsByFile.size}`);
  console.log(`   Unique Error Codes: ${errorsByCode.size}\n`);
  
  console.log(`🎯 Next Steps:`);
  console.log(`   1. Review ${ANALYSIS_OUTPUT_PATH}`);
  console.log(`   2. Start with CRITICAL priority files`);
  console.log(`   3. Fix 10-20 files per day`);
  console.log(`   4. Run this script daily to track progress\n`);
}

main();
