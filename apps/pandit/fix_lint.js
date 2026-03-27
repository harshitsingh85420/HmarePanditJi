const fs = require('fs');
const path = require('path');

const svgFiles = [
  'src/app/onboarding/screens/ManualCityScreen.tsx',
  'src/app/onboarding/screens/MobileNumberScreen.tsx',
  'src/app/onboarding/screens/OTPScreen.tsx',
  'src/app/onboarding/screens/RegistrationFlow.tsx'
];

for (const file of svgFiles) {
  const p = path.join(__dirname, file);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/\s+(xs|sm)-(width|height)="[0-9]+"/g, '');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed SVG in', file);
}

// deepgramSTT.ts case block fix
const pDeepgram = path.join(__dirname, 'src/lib/deepgramSTT.ts');
let dgContent = fs.readFileSync(pDeepgram, 'utf8');
dgContent = dgContent.replace(`case 'yes_no':
        const answer = this.normalizeYesNo(transcript)`, `case 'yes_no': {
        const answer = this.normalizeYesNo(transcript)`);
dgContent = dgContent.replace(`finalConfidence = 0.2
        }
        break
      case 'name':`, `finalConfidence = 0.2
        }
        break
      }
      case 'name':`);
fs.writeFileSync(pDeepgram, dgContent, 'utf8');
console.log('Fixed deepgramSTT.ts');

const quoteFiles = [
  'src/app/(auth)/voice-tutorial/page.tsx',
  'src/app/(registration)/mobile/page.tsx',
  'src/app/onboarding/screens/tutorial/TutorialDakshina.tsx',
  'src/app/onboarding/screens/tutorial/TutorialSwagat.tsx',
  'src/app/onboarding/screens/tutorial/TutorialVoiceNav.tsx'
];

for (const file of quoteFiles) {
  const p = path.join(__dirname, file);
  let content = fs.readFileSync(p, 'utf8');
  // Just blanket replace unescaped double quotes inside JSX text if it violates the rule.
  // Actually, let's just replace all straight quotes inside the Hindi/English text that caused errors.
  content = content.replace(/“(.*?)”/g, '&ldquo;$1&rdquo;');
  content = content.replace(/"बोल कर"/g, '&quot;बोल कर&quot;');
  content = content.replace(/"हाँ"/g, '&quot;हाँ&quot;');
  content = content.replace(/"नहीं"/g, '&quot;नहीं&quot;');
  content = content.replace(/"छोड़ें"/g, '&quot;छोड़ें&quot;');
  content = content.replace(/"ठीक है"/g, '&quot;ठीक है&quot;');
  content = content.replace(/"(ऑनलाइन|नकद)"/g, '&quot;$1&quot;');
  content = content.replace(/"जैसे: .*?"/g, (match) => '&quot;' + match.slice(1, -1) + '&quot;');
  content = content.replace(/"(.*?)"/g, (match, p1) => {
    // If it's an attribute like className="...", keep it.
    // If it has spaces and Hindi characters, it's probably text.
    if (/[\u0900-\u097F]/.test(match)) {
      return '&quot;' + p1 + '&quot;';
    }
    return match;
  });
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed quotes in', file);
}
