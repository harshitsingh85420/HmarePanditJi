'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { loadOnboardingState, saveOnboardingState } from '@/lib/onboarding-store';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import MobileNumberScreen from './MobileNumberScreen';
import OTPScreen from './OTPScreen';

// ─── Registration steps ──────────────────────────────────────
type RegStep = 'welcome' | 'mobile' | 'otp' | 'profile_name' | 'profile_city' | 'complete';

interface RegData {
  mobile: string;
  name: string;
  city: string;
}

// ─── Name capture screen ─────────────────────────────────────
function ProfileNameScreen({
  language,
  step,
  onComplete,
  onBack,
}: {
  language: SupportedLanguage;
  step: number;
  onComplete: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');

  const { isListening, isSpeaking, restartListening } = useSarvamVoiceFlow({
    language,
    script: 'अब आपका नाम बताइए — जैसे पंडित रामेश्वर शर्मा। बोलिए, मैं सुन रहा हूँ।',
    repromptScript: 'अपना पूरा नाम बोलें।',
    initialDelayMs: 600,
    pauseAfterMs: 500,
    onIntent: (intentOrRaw) => {
      if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4).trim();
        if (raw.length >= 2) {
          const capitalized = raw.replace(/\b\w/g, c => c.toUpperCase());
          setName(capitalized);
          void speakWithSarvam({
            text: `${capitalized} — क्या यह सही है? 'हाँ' बोलें।`,
            languageCode: 'hi-IN',
          });
        }
      } else if (intentOrRaw === 'YES' && name) {
        void speakWithSarvam({
          text: 'बहुत अच्छा।',
          languageCode: 'hi-IN',
          onEnd: () => onComplete(name),
        });
      } else if (intentOrRaw === 'NO') {
        setName('');
        restartListening();
      }
    },
  });

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-body text-text-primary flex flex-col shadow-2xl">
      {/* Large Prominent Om Symbol - Trust Signal for Vedic App */}
      <div className="text-center py-8 bg-gradient-to-b from-saffron-light/50 to-transparent border-b-2 border-saffron/30">
        <p className="text-[120px] font-bold text-saffron animate-gentle-float drop-shadow-lg om-glow" aria-label="पवित्र ओम प्रतीक">ॐ</p>
        <p className="text-[32px] font-bold text-saffron mt-3 font-devanagari">स्वागतम्</p>
      </div>

      <header className="pt-6 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-[72px] h-[72px] -ml-3 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[72px] min-w-[72px] focus:ring-4 focus:ring-saffron focus:outline-none" aria-label="पीछे जाएं">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-[36px] font-bold text-text-primary">पंजीकरण</h1>
          <p className="text-[32px] font-bold text-saffron">कदम {step} / 4</p>
        </div>
      </header>

      {/* Bold Progress Steps - Large Clear Visual Indicator for Elderly */}
      <div className="px-6 pb-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`flex-1 h-16 rounded-full transition-colors ${i <= step ? 'bg-saffron' : 'bg-surface-dim'
                }`}
              aria-label={`कदम ${i} में से 4`}
            />
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center px-6 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-[40px] font-bold text-text-primary">👤 आपका नाम?</h2>
          <p className="text-[24px] text-text-secondary mt-3 font-medium">जैसा Pandit Ji certificate पर है</p>
        </div>

        {(isListening || isSpeaking) && (
          <div className="w-full mb-4 flex items-center gap-3 px-5 py-5 bg-surface-card rounded-2xl border-3 border-saffron/40 min-h-[88px] shadow-card">
            <div className="flex items-end gap-2 h-14 shrink-0">
              <div className="w-3 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-3 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-3 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-[28px] text-text-primary truncate font-medium">
              {isSpeaking ? 'बोल रहा हूँ...' : 'नाम बोलें...'}
            </span>
          </div>
        )}

        {name && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full py-8 text-center bg-surface-card rounded-2xl border-3 border-saffron mb-6 shadow-card"
          >
            <p className="text-[42px] font-bold text-text-primary">{name}</p>
            <p className="text-[26px] text-saffron mt-3 font-medium">क्या यह सही है?</p>
          </motion.div>
        )}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="या यहाँ टाइप करें"
          className="w-full px-8 py-6 min-h-[88px] border-3 border-border-default rounded-2xl text-[28px] bg-surface-card focus:border-saffron focus:outline-none text-text-primary mb-6 font-medium shadow-input"
        />
      </div>

      <footer className="px-6 pb-10 pt-3 bg-surface-base/90 backdrop-blur-sm border-t-3 border-border-default shrink-0">
        {name ? (
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => void speakWithSarvam({ text: 'बहुत अच्छा।', languageCode: 'hi-IN', onEnd: () => onComplete(name) })}
              className="w-full min-h-[80px] bg-saffron text-white rounded-2xl text-[28px] font-bold shadow-btn-saffron hover:bg-saffron-dark transition-colors"
            >
              हाँ, यही नाम सही है →
            </motion.button>
            <button onClick={() => { setName(''); restartListening(); }} className="w-full text-center text-[26px] text-saffron py-5 min-h-[80px] font-medium bg-surface-card rounded-2xl border-2 border-saffron/30 hover:bg-saffron-lt transition-colors">
              ✗ बदलें
            </button>
          </div>
        ) : (
          <button disabled className="w-full min-h-[80px] bg-surface-dim text-text-primary rounded-2xl text-[26px] font-bold cursor-not-allowed">
            नाम बोलें या टाइप करें
          </button>
        )}
      </footer>
    </main>
  );
}

// ─── City capture screen ─────────────────────────────────────
function ProfileCityScreen({
  language,
  detectedCity,
  onComplete,
  onBack,
}: {
  language: SupportedLanguage;
  detectedCity: string;
  onComplete: (city: string) => void;
  onBack: () => void;
}) {
  const CITIES = ['Varanasi', 'Delhi', 'Mumbai', 'Lucknow', 'Patna', 'Allahabad', 'Haridwar', 'Rishikesh', 'Mathura', 'Ujjain', 'Nashik', 'Tirupati', 'Gaya', 'Ayodhya'];
  const [city, setCity] = useState(detectedCity || '');
  const [search, setSearch] = useState('');
  const filtered = CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const { isListening, isSpeaking } = useSarvamVoiceFlow({
    language,
    script: detectedCity
      ? `आपका शहर ${detectedCity} लग रहा है। क्या यह सही है? 'हाँ' या अपना शहर बोलें।`
      : 'आप किस शहर में रहते हैं? शहर का नाम बोलें।',
    initialDelayMs: 600,
    onIntent: (intentOrRaw) => {
      if ((intentOrRaw === 'YES' || intentOrRaw === 'FORWARD') && detectedCity) {
        void speakWithSarvam({
          text: 'बहुत अच्छा।',
          languageCode: 'hi-IN',
          onEnd: () => onComplete(detectedCity),
        });
      } else if (intentOrRaw.startsWith('RAW:')) {
        const raw = intentOrRaw.slice(4);
        const matched = CITIES.find(c => raw.toLowerCase().includes(c.toLowerCase()));
        if (matched) {
          setCity(matched);
          void speakWithSarvam({
            text: `${matched} — सही है? 'हाँ' बोलें।`,
            languageCode: 'hi-IN',
          });
        }
      }
    },
  });

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-body text-text-primary flex flex-col shadow-2xl">
      {/* Large Prominent Om Symbol - Trust Signal */}
      <div className="text-center py-8 bg-gradient-to-b from-saffron-light/50 to-transparent border-b-2 border-saffron/30">
        <p className="text-[120px] font-bold text-saffron animate-gentle-float drop-shadow-lg om-glow" aria-label="पवित्र ओम प्रतीक">ॐ</p>
        <p className="text-[32px] font-bold text-saffron mt-3 font-devanagari">स्वागतम्</p>
      </div>

      <header className="pt-6 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-[72px] h-[72px] -ml-3 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[72px] min-w-[72px]" aria-label="पीछे जाएं">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-[36px] font-bold text-text-primary">पंजीकरण</h1>
          <p className="text-[32px] font-bold text-saffron">कदम 4 / 4</p>
        </div>
      </header>

      {/* Bold Progress Steps - Large Clear Visual Indicator for Elderly */}
      <div className="px-6 pb-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`flex-1 h-16 rounded-full bg-saffron`}
              aria-label={`कदम ${i} में से 4 पूरा हुआ`}
            />
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col px-6 pt-2">
        <div className="text-center mb-6">
          <h2 className="text-[40px] font-bold text-text-primary">📍 आपका शहर?</h2>
          <p className="text-[24px] text-saffron mt-3 font-medium">जहाँ आप पूजाएं कराते हैं</p>
        </div>

        {(isListening || isSpeaking) && (
          <div className="mb-4 flex items-center gap-3 px-5 py-5 bg-surface-card rounded-2xl border-3 border-saffron/40 min-h-[88px] shadow-card">
            <div className="flex items-end gap-2 h-14 shrink-0">
              <div className="w-3 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-3 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-3 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-[28px] text-text-primary truncate font-medium">
              {isSpeaking ? 'बोल रहा हूँ...' : 'शहर बोलें...'}
            </span>
          </div>
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 शहर खोजें"
          className="w-full px-8 py-6 min-h-[88px] border-3 border-border-default rounded-2xl text-[28px] bg-surface-card focus:border-saffron focus:outline-none text-text-primary mb-6 font-medium shadow-input"
        />

        <div className="flex flex-wrap gap-4 overflow-y-auto pb-4">
          {filtered.map(c => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-10 py-5 min-h-[80px] rounded-full text-[26px] font-semibold border-3 transition-colors ${city === c
                ? 'bg-saffron text-white border-saffron shadow-btn-saffron'
                : 'bg-surface-card text-text-primary border-border-default hover:border-saffron/60'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <footer className="px-6 pb-10 pt-3 bg-surface-base/90 backdrop-blur-sm border-t-3 border-border-default shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!city}
          onClick={() => void speakWithSarvam({ text: 'बहुत अच्छा।', languageCode: 'hi-IN', onEnd: () => onComplete(city) })}
          className={`w-full min-h-[80px] rounded-2xl text-[28px] font-bold transition-all ${city ? 'bg-saffron text-white shadow-btn-saffron hover:bg-saffron-dark' : 'bg-surface-dim text-saffron cursor-not-allowed'
            }`}
        >
          {city ? `${city} — सही है →` : 'शहर चुनें'}
        </motion.button>
      </footer>
    </main>
  );
}

// ─── Registration Complete Screen ─────────────────────────────
function RegistrationCompleteScreen({ name, language }: { name: string; language: SupportedLanguage }) {
  const router = useRouter();

  useEffect(() => {
    void speakWithSarvam({
      text: `बहुत बढ़िया ${name} जी। Registration पूरा हो गया। हमारी टीम जल्द ही आपसे संपर्क करेगी। HmarePanditJi में आपका स्वागत है।`,
      languageCode: 'hi-IN',
      speaker: 'ratan',
    });
  }, [name]);

  return (
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-body text-text-primary flex flex-col items-center justify-center shadow-2xl px-6 text-center">
      {/* Large Prominent Om Symbol */}
      <div className="text-center py-8 bg-gradient-to-b from-saffron-light/50 to-transparent border-b-2 border-saffron/30 w-full absolute top-0 left-0 right-0">
        <p className="text-[120px] font-bold text-saffron animate-gentle-float drop-shadow-lg om-glow" aria-label="पवित्र ओम प्रतीक">ॐ</p>
        <p className="text-[32px] font-bold text-saffron mt-3 font-devanagari">स्वागतम्</p>
      </div>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' as const }}>
        <div className="text-[96px] mb-8 animate-gentle-float">🎉</div>
        <h1 className="text-[44px] font-bold text-text-primary mb-3">बधाई हो!</h1>
        <h2 className="text-[36px] font-bold text-saffron mb-6">{name} जी</h2>
        <p className="text-[24px] text-text-secondary leading-relaxed mb-10">
          पंजीकरण पूरा हुआ। हमारी टीम <span className="font-bold text-text-primary">24 घंटे में</span> आपसे संपर्क करेगी।
        </p>
        <div className="bg-surface-card rounded-2xl p-6 border-3 border-border-default shadow-card mb-10">
          <p className="text-[32px] font-bold text-text-primary">📞 1800-HPJ-HELP</p>
          <p className="text-[22px] text-saffron mt-2">(Toll Free · सुबह 8 बजे – रात 10 बजे)</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/')}
          className="w-full min-h-[80px] bg-saffron text-white rounded-2xl text-[26px] font-bold shadow-btn-saffron hover:bg-saffron-dark transition-colors"
        >
          होम जाएं →
        </motion.button>
      </motion.div>
    </main>
  );
}

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────
export default function RegistrationFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<RegStep>('welcome');
  const [data, setData] = useState<RegData>({ mobile: '', name: '', city: '' });
  const [language, setLanguage] = useState<SupportedLanguage>('Hindi');

  useEffect(() => {
    const saved = loadOnboardingState();
    setLanguage(saved.selectedLanguage);
    saveOnboardingState({ ...saved, phase: 'TUTORIAL_CTA', tutorialCompleted: false });
    void speakWithSarvam({
      text: 'बहुत अच्छा पंडित जी। अब Registration शुरू करते हैं। बिल्कुल मुफ़्त — दस मिनट लगेंगे।',
      languageCode: 'hi-IN',
      speaker: 'ratan',
      onEnd: () => setStep('mobile'),
    });
  }, []);

  const goBackToTutorial = () => {
    stopCurrentSpeech();
    const saved = loadOnboardingState();
    saveOnboardingState({ ...saved, phase: 'TUTORIAL_CTA', tutorialCompleted: false });
    onBack();
  };

  if (step === 'welcome') {
    return (
      <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-body flex flex-col shadow-2xl">
        {/* Large Prominent Om Symbol */}
        <div className="text-center py-8 bg-gradient-to-b from-saffron-light/50 to-transparent border-b-2 border-saffron/30">
          <p className="text-[120px] font-bold text-saffron animate-gentle-float om-glow" aria-label="पवित्र ओम प्रतीक">ॐ</p>
          <p className="text-[32px] font-bold text-saffron mt-3 font-devanagari">स्वागतम्</p>
        </div>
        <header className="pt-6 px-6 pb-2 flex items-center gap-3 shrink-0">
          <button onClick={goBackToTutorial} className="w-[72px] h-[72px] -ml-3 flex items-center justify-center text-saffron hover:bg-saffron-light rounded-full min-h-[72px] min-w-[72px] focus:ring-4 focus:ring-saffron focus:outline-none" aria-label="पीछे जाएं">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="text-[88px] mb-6 animate-gentle-float">🙏</div>
            <p className="text-[32px] font-bold text-text-primary">तैयार हो रहे हैं...</p>
            <div className="flex justify-center gap-4 mt-8">
              <div className="w-5 h-5 bg-saffron rounded-full animate-bounce delay-0" />
              <div className="w-5 h-5 bg-saffron rounded-full animate-bounce delay-150" />
              <div className="w-5 h-5 bg-saffron rounded-full animate-bounce delay-300" />
            </div>
          </div>
        </div>
      </main>
    );
  }


  if (step === 'mobile') {
    return (
      <MobileNumberScreen
        language={language}
        onComplete={(mobile: string) => {
          setData(prev => ({ ...prev, mobile }));
          setStep('otp');
        }}
        onBack={() => goBackToTutorial()}
      />
    );
  }

  if (step === 'otp') {
    return (
      <OTPScreen
        mobile={data.mobile}
        language={language}
        onVerified={() => setStep('profile_name')}
        onBack={() => setStep('mobile')}
      />
    );
  }

  if (step === 'profile_name') {
    return (
      <ProfileNameScreen
        language={language}
        step={3}
        onComplete={(name) => {
          setData(prev => ({ ...prev, name }));
          setStep('profile_city');
        }}
        onBack={() => setStep('otp')}
      />
    );
  }

  if (step === 'profile_city') {
    const savedCity = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('hpj-onboarding') ?? '{}')?.detectedCity ?? ''
      : '';

    return (
      <ProfileCityScreen
        language={language}
        detectedCity={savedCity}
        onComplete={(city: string) => {
          setData(prev => ({ ...prev, city }));
          setStep('complete');
        }}
        onBack={() => setStep('profile_name')}
      />
    );
  }

  if (step === 'complete') {
    return <RegistrationCompleteScreen name={data.name || 'पंडित जी'} language={language} />;
  }

  return null;
}
