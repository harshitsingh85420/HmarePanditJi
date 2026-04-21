const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix @/ imports - map to correct relative paths based on file location
  const dir = path.dirname(filePath);
  const relativeToRoot = path.relative(path.join(__dirname, 'apps', 'web', 'app'), dir);
  const depth = relativeToRoot.split(path.sep).filter(Boolean).length + 1;
  const prefix = '../'.repeat(depth) || './';

  // Replace @/components with relative path
  content = content.replace(/@\/components\/LoginModal/g, `${prefix}src/components/LoginModal`);
  content = content.replace(/@\/components/g, `${prefix}components`);
  content = content.replace(/@\/context/g, `${prefix}context`);
  content = content.replace(/@\/hooks/g, `${prefix}src/hooks`);
  content = content.replace(/@\/lib/g, `${prefix}src/lib`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports: ${filePath}`);
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
const files = walkDir(appDir);

let fixed = 0;
for (const file of files) {
  if (fixImports(file)) fixed++;
}

console.log(`\nTotal files fixed: ${fixed}`);
