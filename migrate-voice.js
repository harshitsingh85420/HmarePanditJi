/**
 * Migration script: Update all tutorial screens that still use the old voice-engine speak/startListening
 * to use useSarvamVoiceFlow with the correct scripts from the spec.
 * 
 * Run: node migrate-voice.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'apps/pandit/src/app/onboarding/screens');

// Screens that use old voice-engine and need migration to useSarvamVoiceFlow
// Maps: filename → { script, repromptScript, intentHandler }
const SCREEN_MIGRATIONS = {
  'LanguageSetScreen.tsx': {
    oldImport: "import { speak, stopSpeaking } from '@/lib/voice-engine';",
    newImport: "import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';",
    replacements: [
      { from: 'speak(', to: 'void speakWithSarvam({ text:', onEndFix: true },
      { from: 'stopSpeaking()', to: 'stopCurrentSpeech()' },
    ],
  },
  'HelpScreen.tsx': {
    oldImport: "import { speak, stopSpeaking } from '@/lib/voice-engine';",
    newImport: "import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';",
  },
};

// Simple replacements for all files - just replace the imports
const FILES_TO_FIX_IMPORT = [
  'LanguageSetScreen.tsx',
  'HelpScreen.tsx',
];

const TUTORIAL_SCREENS_TO_MIGRATE = [
  {
    file: 'tutorial/TutorialIncome.tsx',
    script: 'सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे। आज वे तिरसठ हज़ार कमा रहे हैं। मैं आपको भी यही तीन तरीके दिखाता हूँ।',
  },
  {
    file: 'tutorial/TutorialDakshina.tsx',
    script: 'कितनी बार ऐसा हुआ है कि आपने दो घंटे की पूजा की — और ग्राहक ने कह दिया, दो हज़ार ले लो। आप कुछ नहीं बोल पाए। अब नहीं होगा यह। आप खुद दक्षिणा तय करेंगे। मोलभाव खत्म।',
  },
  {
    file: 'tutorial/TutorialOnlineRevenue.tsx',
    script: 'दो बिल्कुल नए तरीके हैं। पहला — घर बैठे पूजा। Video call से पूजा कराइए। एक पूजा में दो हज़ार से पाँच हज़ार रुपये। दूसरा — पंडित से बात। बीस मिनट की एक call में आठ सौ रुपये सीधे आपको।',
  },
  {
    file: 'tutorial/TutorialBackup.tsx',
    script: 'जब कोई booking होती है — आपको offer आता है। आप हाँ कहते हैं। उस दिन free रहते हैं। मुख्य पंडित ने पूजा कर ली — भी आपको दो हज़ार। मुख्य पंडित cancel किए — पूरी booking आपकी और ऊपर से दो हज़ार। दोनों तरफ से फ़ायदा।',
  },
];

// Generate the useSarvamVoiceFlow pattern for simple tutorial screens
function generateSimpleTutorialScreen(file, script) {
  const content = fs.readFileSync(path.join(BASE, file), 'utf8');
  
  // Replace the old voice-engine import with useSarvamVoiceFlow
  let updated = content.replace(
    /import { speak, startListening, stopListening, stopSpeaking } from '@\/lib\/voice-engine';/,
    `import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';`
  );

  console.log(`Processing ${file}: ${updated !== content ? 'import replaced' : 'import not found - no change'}`);
  
  if (updated !== content) {
    fs.writeFileSync(path.join(BASE, file), updated);
  }
}

// Process each tutorial screen
for (const { file, script } of TUTORIAL_SCREENS_TO_MIGRATE) {
  try {
    generateSimpleTutorialScreen(file, script);
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
}

console.log('\nMigration complete. Now need to manually update the useEffect logic in each screen.');
console.log('The screens should now import useSarvamVoiceFlow instead of voice-engine.');
