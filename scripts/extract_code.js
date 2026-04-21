const fs = require('fs');
const path = require('path');

function processMarkdown(filePath, baseOutputDirs) {
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`Processing ${filePath}...`);
  
  const regex = /FILE(?:\s+\d+)?:?\s*([a-zA-Z0-9_\-\.\/\\]+\.(?:tsx|ts|js|jsx|css|html))/gi;
  
  let match;
  let matches = [];
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      path: match[1].trim(),
      index: match.index,
      matchLength: match[0].length
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : content.length;
    
    let block = content.substring(current.index + current.matchLength, nextIndex);
    
    block = block.replace(/.*?Create.*?:/is, '');
    block = block.replace(/^[━═─\n\r\s]+/, '');
    block = block.replace(/[━═─\n\r\s]+$/, '');
    
    if (block.startsWith('```')) block = block.substring(block.indexOf('\n') + 1);
    if (block.endsWith('```')) block = block.substring(0, block.length - 3);
    
    const verifIndex = block.lastIndexOf('VERIFICATION:');
    if (verifIndex !== -1 && verifIndex > block.length - 1000) block = block.substring(0, verifIndex);
    
    const tickIndex = block.lastIndexOf('```');
    if (tickIndex !== -1 && tickIndex > block.length - 1000) block = block.substring(0, tickIndex);

    block = block.trim();
    
    let outPath = current.path;
    
    // Convert apps/pandit/app -> apps/pandit/src/app
    outPath = outPath.replace(/^apps\/pandit\/(app|components|lib|hooks|stores)\//, 'apps/pandit/src/$1/');
    // Convert src/app -> apps/pandit/src/app
    if (outPath.startsWith('src/')) {
       outPath = 'apps/pandit/' + outPath;
    }
    
    for (const base of baseOutputDirs) {
      const fullPath = path.join(base, outPath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, block, 'utf8');
      console.log(`Wrote: ${fullPath}`);
    }
  }
}

const p1 = 'C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 0\\HPJ_AI_Implementation_Prompts.md';
const p2 = 'C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 1\\HPJ_Developer_Prompts_Master.md';
const baseDirs = ['C:\\Users\\ss\\Documents\\HmarePanditJi'];

processMarkdown(p1, baseDirs);
processMarkdown(p2, baseDirs);
