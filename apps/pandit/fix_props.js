const fs = require('fs');
const path = require('path');
const files = [
  'src/app/(registration)/mobile/page.tsx',
  'src/app/onboarding/screens/tutorial/TutorialSwagat.tsx'
];

for (const file of files) {
  const p = path.join(__dirname, file);
  let content = fs.readFileSync(p, 'utf8');
  // Revert attribute quotes: label=&quot;...&quot; -> label="..."
  content = content.replace(/=&quot;(.*?)&quot;/g, '="$1"');
  fs.writeFileSync(p, content, 'utf8');
}
console.log('Fixed attributes!');
