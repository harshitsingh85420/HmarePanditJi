const fs = require('fs');
const path = require('path');

function findAndDeleteReexports(dir) {
  const items = fs.readdirSync(dir);
  let deleted = 0;
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      deleted += findAndDeleteReexports(fullPath);
    } else if (item === 'page.tsx' || item === 'layout.tsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('export { default } from') || content.includes('export * from')) {
        console.log(`Deleting re-export: ${fullPath}`);
        fs.unlinkSync(fullPath);
        deleted++;
      }
    }
  }
  
  return deleted;
}

const appDir = path.join(__dirname, 'apps', 'web', 'app');
const deleted = findAndDeleteReexports(appDir);
console.log(`\nDeleted ${deleted} re-export files`);
