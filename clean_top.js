const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if(fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('C:\\Users\\ss\\Documents\\HmarePanditJi\\apps\\pandit\\src', function(filePath) {
  if (!filePath.match(/\.(ts|tsx)$/)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const orgLen = content.length;
  
  // Find the first occurrence of:
  // "use client", 'use client', import , export , const 
  let idx = content.search(/("use client"|'use client'|import\s|export\s|const\s|type\s|interface\s)/);
  
  if (idx !== -1 && idx > 0) {
      const prefix = content.substring(0, idx);
      if (prefix.includes('Replace') || prefix.includes('Create') || prefix.includes('Wait') || prefix.length > 0) {
         // strip it!
         content = content.substring(idx);
      }
  }
  
  if (content.length !== orgLen) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned top: ${filePath}`);
  }
});
