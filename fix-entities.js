const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace HTML entities with actual characters
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&apos;/g, "'");
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files = files.concat(walkDir(fullPath));
      } else if (/\.(tsx|ts)$/.test(item)) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err.message);
  }
  return files;
}

const appDir = path.join(__dirname, 'apps', 'web', 'app');
const srcDir = path.join(__dirname, 'apps', 'web', 'src');
const componentsDir = path.join(__dirname, 'apps', 'web', 'components');
const contextDir = path.join(__dirname, 'apps', 'web', 'context');
const packagesUiDir = path.join(__dirname, 'packages', 'ui');
const packagesUiSrcDir = path.join(__dirname, 'packages', 'ui', 'src');
const files = [...walkDir(appDir), ...walkDir(srcDir), ...walkDir(componentsDir), ...walkDir(contextDir), ...walkDir(packagesUiDir), ...walkDir(packagesUiSrcDir)];

let fixed = 0;
for (const file of files) {
  if (fixFile(file)) fixed++;
}

console.log(`\nTotal files fixed: ${fixed}`);
