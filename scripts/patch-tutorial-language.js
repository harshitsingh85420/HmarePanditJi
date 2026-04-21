// Patch script to add language prop to all tutorial screens
const fs = require('fs');
const path = require('path');

const tutorialDir = path.join(__dirname, 'apps/pandit/src/app/onboarding/screens/tutorial');

const files = [
  'TutorialSwagat.tsx',
  'TutorialIncome.tsx',
  'TutorialDakshina.tsx',
  'TutorialOnlineRevenue.tsx',
  'TutorialBackup.tsx',
  'TutorialPayment.tsx',
  'TutorialDualMode.tsx',
  'TutorialTravel.tsx',
  'TutorialVideoVerify.tsx',
  'TutorialGuarantees.tsx',
  'TutorialCTA.tsx',
];

files.forEach(file => {
  const filePath = path.join(tutorialDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find TutorialShell opening and add language prop
  content = content.replace(
    /(<TutorialShell[\s\S]*?onKeyboardToggle=\{[^}]*\})\s*(>)/g,
    '$1\n      language={language}\n    $2'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Fixed ${file}`);
});

console.log('\n✅ All tutorial screens patched!');
