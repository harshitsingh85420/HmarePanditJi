const fs = require('fs');
const path = require('path');
const BASE = 'C:/Users/ss/Documents/HmarePanditJi/apps/pandit/src/app/onboarding/screens';

const screens = [
  'tutorial/TutorialOnlineRevenue.tsx',
  'tutorial/TutorialBackup.tsx',
  'tutorial/TutorialVoiceNav.tsx',
];

const OLD = "import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';";
const NEW = "import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';";

for (const screen of screens) {
  const fp = path.join(BASE, screen);
  let content = fs.readFileSync(fp, 'utf8');
  if (content.includes(OLD)) {
    content = content.replace(OLD, NEW);
    fs.writeFileSync(fp, content);
    console.log('Updated: ' + screen);
  } else {
    console.log('Already updated or not found: ' + screen);
  }
}

// Also fix LanguageSetScreen and HelpScreen
const simpleScreens = [
  { file: 'LanguageSetScreen.tsx', old: "import { speak, stopSpeaking } from '@/lib/voice-engine';", newImp: "import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';" },
  { file: 'HelpScreen.tsx', old: "import { speak, stopSpeaking } from '@/lib/voice-engine';", newImp: "import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';" },
  { file: 'ManualCityScreen.tsx', old: "import { startListening, stopListening, speak, stopSpeaking } from '@/lib/voice-engine';", newImp: "import { useSarvamVoiceFlow, detectCityName } from '@/lib/hooks/useSarvamVoiceFlow';\nimport { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';" },
  { file: 'LanguageListScreen.tsx', old: "import { speak, startListening, stopListening, stopSpeaking, detectLanguageName } from '@/lib/voice-engine';", newImp: "import { useSarvamVoiceFlow, detectLanguageName } from '@/lib/hooks/useSarvamVoiceFlow';\nimport { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';" },
  { file: 'LanguageChoiceConfirmScreen.tsx', old: "import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';", newImp: "import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';" },
  { file: 'VoiceTutorialScreen.tsx', old: "import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';", newImp: "import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';" },
];

for (const { file, old, newImp } of simpleScreens) {
  const fp = path.join(BASE, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (content.includes(old)) {
    content = content.replace(old, newImp);
    fs.writeFileSync(fp, content);
    console.log('Updated: ' + file);
  } else {
    console.log('Not found/already done: ' + file);
  }
}

console.log('\nAll done!');
