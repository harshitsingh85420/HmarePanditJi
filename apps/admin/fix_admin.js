const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "src/app/pandits/[panditId]/page.tsx");
let txt = fs.readFileSync(p, "utf8");

// 1. prefer-const body
txt = txt.replace(/let body: any = /g, "const body: any = ");

// 2. jsx-no-target-blank
txt = txt.replace(/target="_blank"/g, 'target="_blank" rel="noopener noreferrer"');

// 3. no-unescaped-entities: for replace(/_/g, ' ') -> replace(/_/g, " ")
txt = txt.replace(/\.replace\(\/_\\/g, \' \'\)/g, '.replace(/_/g, " ")');

// 4. no-unescaped-entities: for " 
// Line 337 has `transform: scale(...) rotate(...)` inside style. Or maybe `className="max-w-full..."`? 
// The error is `337:108 Error: " can be escaped with &quot;`.
txt = txt.replace(/"/g, (match, offset) => {
    // Let's replace quotes in text elements by just wrapping them in braces or escaping.
    // Actually, I can just find the word Pandit's and replace it. But this file is [panditId]/page.tsx. Does it have "Pandit's"? No.
    return match;
});

// Since the error on 337 is `"` in JSX, let's fix JSX text nodes that have `"` or `'`.
txt = txt.replace(/>\s*([^\n<]*["'][^\n<]*)\s*<\//g, (m, p1) => {
    return ">{`" + p1.replace(/`/g, "\\`") + "`}</";
});

fs.writeFileSync(p, txt);
console.log("Done fixed.");
