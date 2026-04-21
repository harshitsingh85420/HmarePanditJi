const fs = require('fs');
const path = require('path');

function processMarkdown(filePath, baseOutputDirs) {
  if (!fs.existsSync(filePath)) {
     console.log("File not found: " + filePath);
     return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`Processing ${filePath}...`);
  
  const regex = /(?:FILE(?:\s+\d+)?:?\s*|Create file:\s*)([a-zA-Z0-9_\-\.\/\\]+\.(?:tsx|ts|js|jsx|css|html))/gim;
  
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
    
    // Look for next FILE or end of string
    let nextIndex = content.length;
    if (i + 1 < matches.length) {
        nextIndex = matches[i + 1].index;
    }
    
    // BUT we also want to stop if there's a huge break, like a new IMPL block or a ``` boundary that ends the current section
    const chunk = content.substring(current.index + current.matchLength, nextIndex);
    
    // Extract the block using more exact markdown code ticks
    let block = '';
    const ticksStart = chunk.indexOf('```');
    if (ticksStart !== -1 && ticksStart < 300) { // If there is a codeblock shortly after the filename
        const innerContent = chunk.substring(ticksStart + 3);
        const newLineIdx = innerContent.indexOf('\n');
        const nextTicks = innerContent.indexOf('\n```', newLineIdx);
        if (nextTicks !== -1) {
            block = innerContent.substring(newLineIdx + 1, nextTicks).trim();
        } else {
            block = innerContent.substring(newLineIdx + 1).trim();
        }
    } else {
        // Fallback: Just grab till next string of equals or verifications
        block = chunk;
        block = block.replace(/.*?Create.*?:/is, '');
        block = block.replace(/^[━═─\n\r\s]+/, '');
        block = block.replace(/[━═─\n\r\s]+$/, '');
        const verifIndex = block.lastIndexOf('VERIFICATION:');
        if (verifIndex !== -1 && verifIndex > block.length - 1000) block = block.substring(0, verifIndex);
        const nextPromptIndex = block.indexOf('## PROMPT');
        if (nextPromptIndex !== -1) block = block.substring(0, nextPromptIndex);
        block = block.trim();
    }
    
    // Fix src path
    let outPath = current.path;
    outPath = outPath.replace(/^apps\/pandit\/(app|components|lib|hooks|stores|types)\//, 'apps/pandit/src/$1/');
    if (outPath.startsWith('src/')) {
       outPath = 'apps/pandit/' + outPath;
    }
    
    // Sanity check valid block (ignore if it's less than 10 characters or just empty)
    if (block.length < 10) continue;
    
    for (const base of baseOutputDirs) {
      const fullPath = path.join(base, outPath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, block, 'utf8');
      console.log(`Wrote: ${fullPath} - ${block.length} chars`);
    }
  }
}

const p1 = 'C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 0\\HPJ_AI_Implementation_Prompts.md';
const p2 = 'C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 0\\HPJ_Voice_System_Complete.md';
const p3 = 'C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 1\\HPJ_Developer_Prompts_Master.md';
const p4 = 'C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 1\\HPJ_Voice_Complete_Guide.md';

const baseDirs = ['C:\\Users\\ss\\Documents\\HmarePanditJi'];

processMarkdown(p1, baseDirs);
processMarkdown(p2, baseDirs);
processMarkdown(p3, baseDirs);
processMarkdown(p4, baseDirs);
