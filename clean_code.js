const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('C:\\Users\\ss\\Documents\\HmarePanditJi\\apps\\pandit\\src', function(filePath) {
  if (!filePath.match(/\.(ts|tsx|css)$/)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const orgLen = content.length;
  
  // Cutoffs
  const cutoffs = [
    'After creating',
    'Verify compilation',
    'VERIFICATION:',
    '## PROMPT',
    '---',
    'Run `npm run build`',
    'Run `npx tsc`',
    'Ensure there are no errors',
    '```',
    'Fix any TypeScript errors',
    'Fix any 404',
    'Now start dev server'
  ];
  
  for (const c of cutoffs) {
    const idx = content.indexOf(c);
    if (idx !== -1 && idx > content.length - 1000) {
      content = content.substring(0, idx).trim();
    }
  }
  
  if (content.length !== orgLen) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
});
