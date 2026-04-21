// Quick patch to add S07 extended translations for Tamil
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/pandit/src/lib/tutorial-translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add Tamil S07 extended keys
content = content.replace(
  /(Tamil: \{[^}]*S07: \{[^}]*cta: '[^']*'\s*\})/s,
  `Tamil: {
    skip: 'தவிர் →', back: '← திரும்ப', next: 'முன்னேறு →', screens: { S01: { greeting: 'வணக்கம்', welcome: 'பண்டித் ஜி.', subtitle: 'HmarePanditJi இல் உங்களை வரவேற்கிறோம்.', moolMantra1: 'ஆப் பண்டித் için உள்ளது,', moolMantra2: 'பண்டித் ஆப் için இல்லை.', cta: 'அறிய (2 நிமிடங்கள்) →' }, S02: { title: 'உங்கள் வருமானம் எப்படி அதிகரிக்கும்?', testimonial: 'பண்டித் ரமேஷ் சர்மா - வாராணசி', subtitle: '3 புதிய வழிகள்:', cta: 'தொடர்ந்து பார்க்க →' }, S03: { title: 'இனி பேரம் இல்லை.', before: '❌ முன்பு:', after: '✅ இப்போது:', cta: 'அடுத்த நன்மை பார்க்க →' }, S04: { title: 'வீட்டில் இருந்தே சம்பாதிக்க', subtitle: '(2 புதிய வழிகள்)', card1Title: 'ஆஃப்லைன் பூஜைகள்', card1Desc: '(ஏற்கனவே உள்ளது)', card2Title: 'ஆன்லைன் பூஜைகள்', card2Desc: '(புதிய வாய்ப்பு)', example: 'உதாரணம்: 20 நிமிடங்கள் = ₹800', cta: 'தொடர்ந்து பார்க்க →' }, S05: { title: 'செய்யாமலேயே', subtitle: '₹2,000?', step1: 'பூஜை புக் ஆனது', step2: 'ஆஃபர் வந்தது', step3: 'நீங்கள் ஹான் சொன்னீர்கள்', outcome1: 'முதன்மை பண்டித் பூஜை செய்தார்', outcome2: 'முதன்மை பண்டித் ரத்து செய்தார்', cta: 'அடுத்த நன்மை பார்க்க →' }, S06: { title: 'பூஜை முடிந்தது.', subtitle: '2 நிமிடங்களில் பணம்.', cta: 'அடுத்த நன்மை பார்க்க →' }, S07: { title: 'டைப்பிங் தேவையில்லை.', subtitle: 'பேசுங்கள் → டைப் ஆகிவிடும்', demoText: 'ஹான் அல்லது நஹி சொல்லிப் பார்க்கவும்', cta: 'அடுத்த நன்மை பார்க்க →', voiceBadge: 'ஹான்', speakTypes: 'பேசுங்கள் → டைப் ஆகிவிடும்', whenYouSee: 'இது தோன்றும்போது:', listening: 'கேட்கிறது...', thenSpeak: 'அப்போது பேசுங்கள்.', successMessage: '✅ நன்றாக இருந்தது! சரியாக இருந்தது!', keyboardFallback: 'பேசுவதில் சிரமம் இருந்தால்:', keyboardAlways: '⌨️ கீபோர்டு எப்போதும் கீழே உள்ளது' }, S08: { title: 'எந்த போனும்,', subtitle: 'வேலை செய்யும்.', smartphone: 'ஸ்மார்ட்போன்', keypad: 'கீபேட் போன்', family: 'மகன் அல்லது குடும்பம் உதவலாம்.', cta: 'அடுத்த நன்மை பார்க்க →' }, S09: { title: 'பயண கவலை இல்லை.', subtitle: 'இரட்டை புக்கிங் இல்லை.', cta: 'தொடர்ந்து பார்க்க → (கிட்டத்தட்ட முடிந்தது!)' }, S10: { title: '✅ வெரிஃபைட் என்றால்', subtitle: 'அதிக புக்கிங்குகள்', cta: 'தொடர்ந்து பார்க்க → (கிட்டத்தட்ட முடிந்தது!)' }, S11: { title: 'HmarePanditJi இன்', guarantee1: 'மரியாதை', guarantee2: 'வசதி', guarantee3: 'பாதுகாப்பு', guarantee4: 'செழிப்பு', socialProof: '3,00,000+ பண்டித்கள் இணைந்துள்ளனர்', cta: 'ரெஜிஸ்ட்ரேஷன் தொடங்க →' }, S12: { title: 'ரெஜிஸ்ட்ரேஷன் தொடங்கவா?', subtitle: 'முற்றிலும் இலவசம். 10 நிமிடங்கள்.', cta: '✅ ஹான், ரெஜிஸ்ட்ரேஷன் தொடங்க →', later: 'பிறகு செய்கிறேன்' } }`
);

fs.writeFileSync(filePath, content);
console.log('✓ Added Tamil S07 extended keys');
