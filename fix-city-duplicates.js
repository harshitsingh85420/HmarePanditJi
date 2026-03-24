const fs = require('fs');

const file = 'apps/pandit/src/app/onboarding/screens/ManualCityScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
const seenKeys = new Set();
let removedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const keyMatch = lines[i].match(/^\s*'([^']+)':/);
  if (keyMatch) {
    const key = keyMatch[1];
    if (seenKeys.has(key)) {
      lines[i] = lines[i].replace(/^(\s*)'/, '$1// \'');
      removedCount++;
      console.log(`Line ${i + 1}: Removed duplicate '${key}'`);
    } else {
      seenKeys.add(key);
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log(`\nFixed ${removedCount} duplicate keys in ManualCityScreen.tsx`);
