const fs = require('fs');

const p1 = fs.readFileSync('C:\\Users\\ss\\Documents\\HmarePanditJi\\prompts\\part 0\\HPJ_AI_Implementation_Prompts.md', 'utf8');

function extractTarget(filename, outPath) {
    const idx = p1.indexOf("FILE: " + filename);
    if(idx === -1) {
        console.log("Not found: " + filename);
        return;
    }
    const chunk = p1.substring(idx);
    let codeStart = chunk.indexOf("```tsx\n");
    if(codeStart === -1) {
       codeStart = chunk.indexOf("'use client'");
    } else {
       codeStart += 7;
    }
    
    // Find next block boundary
    let nextBoundary = chunk.indexOf("\n\nFILE:", 100);
    if(nextBoundary === -1) nextBoundary = chunk.indexOf("\n\n━━━━━━━━━", 100);
    if(nextBoundary === -1) nextBoundary = chunk.indexOf("```\n", codeStart);
    if(nextBoundary === -1) nextBoundary = chunk.length;
    
    let content = chunk.substring(codeStart, nextBoundary).trim();
    if(content.endsWith('```')) content = content.substring(0, content.length-3).trim();
    
    fs.writeFileSync(outPath, content, 'utf8');
    console.log("Restored " + outPath);
}

extractTarget('apps/pandit/lib/onboarding-store.ts', 'C:\\Users\\ss\\Documents\\HmarePanditJi\\apps\\pandit\\src\\lib\\onboarding-store.ts');
extractTarget('apps/pandit/lib/tts.ts', 'C:\\Users\\ss\\Documents\\HmarePanditJi\\apps\\pandit\\src\\lib\\tts.ts');
extractTarget('apps/pandit/stores/uiStore.ts', 'C:\\Users\\ss\\Documents\\HmarePanditJi\\apps\\pandit\\src\\stores\\uiStore.ts');
