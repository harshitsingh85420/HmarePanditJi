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
  
  // Find the last closing bracket or tag
  let lastCloseBrace = content.lastIndexOf('}');
  let lastCloseParen = content.lastIndexOf(')');
  let lastCloseTag = content.lastIndexOf('>');
  
  let validEnd = Math.max(lastCloseBrace, lastCloseParen, lastCloseTag);
  
  if (validEnd !== -1 && validEnd < content.length - 1) {
      // Find the first line break after the valid end
      let trimIndex = validEnd + 1;
      
      // We don't want to cut off immediately at `}` because there might be trailing comments
      // But we DEFINITELY want to cut off any random sentences.
      // Easiest heuristic: look for the phrase "PROMPT " or standard prose words.
      const match = content.substring(trimIndex).match(/(\b(Add|Verify|Create|Replace|Note:|After|This|When|Test|Run|Now)\b|```|---)/i);
      
      if (match) {
         content = content.substring(0, trimIndex + match.index).trim();
      }
      
      // Let's just forcefully use the `cutoffs` again with more aggressive terms:
      const cutoffs = [
        '```',
        '---',
        '## ',
        'VERIFICATION',
        'Add a skip button',
        'Test both screens',
        'Next:',
        'After creating',
        'Create this file',
        'Verify compilation'
      ];
      
      for (const c of cutoffs) {
        const idx = content.lastIndexOf(c);
        if (idx !== -1 && idx > content.lastIndexOf('export default function')) {
           content = content.substring(0, idx).trim();
        }
      }
      
      // aggressive trailing text stripping: if the last characters after the final '}' are just words without punctuation
      const trailing = content.substring(validEnd + 1).trim();
      if (trailing.length > 5 && !trailing.includes(';') && !trailing.includes('//')) {
          content = content.substring(0, validEnd + 1);
      }
  }
  
  if (content.length !== orgLen) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned aggressively: ${filePath}`);
  }
});
