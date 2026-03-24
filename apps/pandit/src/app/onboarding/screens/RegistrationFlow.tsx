'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  onComplete,
  onBack,
}: {
  language: SupportedLanguage;
  onComplete: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [transcript, setTranscript] = useState('');

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
          // Capitalize each word
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
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-hind text-text-primary flex flex-col shadow-2xl">
      <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-[56px] h-[56px] -ml-2 flex items-center justify-center text-saffron rounded-full min-h-[56px] min-w-[56px]" aria-label="Go back">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold">पंजीकरण — कदम 3/4</h1>
      </header>

      <div className="px-6 pb-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-4 rounded-full ${i <= 3 ? 'bg-saffron' : 'bg-outline-variant'}`} />
          ))}
        </div>
        <p className="text-[18px] text-saffron font-bold mt-2">कदम 3 / 4</p>
      </div>

      <div className="flex-grow flex flex-col items-center px-6 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-[26px] font-bold">👤 आपका नाम?</h2>
          <p className="text-[16px] text-vedic-gold mt-2">जैसा Pandit Ji certificate पर है</p>
        </div>

        {(isListening || isSpeaking) && (
          <div className="w-full mb-4 flex items-center gap-3 px-4 py-3 bg-surface-card rounded-xl border border-saffron/20 min-h-[56px]">
            <div className="flex items-end gap-1 h-5 shrink-0">
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-lg text-text-primary truncate">
              {isSpeaking ? 'बोल रहा हूँ...' : (transcript || 'नाम बोलें...')}
            </span>
          </div>
        )}

        {name && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full py-6 text-center bg-white rounded-2xl border-2 border-saffron mb-6"
          >
            <p className="text-[32px] font-bold text-text-primary">{name}</p>
            <p className="text-lg text-saffron mt-2">क्या यह सही है?</p>
          </motion.div>
        )}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="या यहाँ टाइप करें"
          className="w-full px-4 py-4 min-h-[56px] border-2 border-outline-variant rounded-xl text-lg bg-white focus:border-saffron focus:outline-none text-text-primary mb-4"
        />
      </div>

      <footer className="px-6 pb-10 pt-3 bg-surface-base/90 backdrop-blur-sm border-t border-outline-variant shrink-0">
        {name ? (
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => void speakWithSarvam({ text: 'बहुत अच्छा।', languageCode: 'hi-IN', onEnd: () => onComplete(name) })}
              className="w-full min-h-[56px] bg-saffron text-white rounded-2xl text-[20px] font-bold shadow-cta"
            >
              हाँ, यही नाम सही है →
            </motion.button>
            <button onClick={() => { setName(''); restartListening(); }} className="w-full text-center text-lg text-saffron py-3 min-h-[56px]">
              ✗ बदलें
            </button>
          </div>
        ) : (
          <button disabled className="w-full min-h-[56px] bg-outline-variant/30 text-saffron rounded-2xl text-[20px] font-bold cursor-not-allowed">
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
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-hind text-text-primary flex flex-col shadow-2xl">
      <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-[56px] h-[56px] -ml-2 flex items-center justify-center text-saffron rounded-full min-h-[56px] min-w-[56px]">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold">पंजीकरण — कदम 4/4</h1>
      </header>

      <div className="px-6 pb-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-4 rounded-full bg-saffron`} />
          ))}
        </div>
        <p className="text-[18px] text-saffron font-bold mt-2">कदम 4 / 4</p>
      </div>

      <div className="flex-grow flex flex-col px-6 pt-2">
        <div className="text-center mb-6">
          <h2 className="text-[26px] font-bold">📍 आपका शहर?</h2>
          <p className="text-lg text-saffron mt-2">जहाँ आप पूजाएं कराते हैं</p>
        </div>

        {(isListening || isSpeaking) && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-surface-card rounded-xl border border-saffron/20 min-h-[56px]">
            <div className="flex items-end gap-1 h-5 shrink-0">
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-lg text-text-primary">{isSpeaking ? 'बोल रहा हूँ...' : 'शहर बोलें...'}</span>
          </div>
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 शहर खोजें"
          className="w-full px-4 py-3 min-h-[56px] border-2 border-outline-variant rounded-xl text-lg bg-white focus:border-saffron focus:outline-none text-text-primary mb-4"
        />

        <div className="flex flex-wrap gap-2 overflow-y-auto">
          {filtered.map(c => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-6 py-3 min-h-[56px] rounded-full text-lg font-medium border-2 transition-colors ${city === c
                ? 'bg-saffron text-white border-saffron'
                : 'bg-white text-text-primary border-outline-variant hover:border-saffron/40'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <footer className="px-6 pb-10 pt-3 bg-surface-base/90 backdrop-blur-sm border-t border-outline-variant shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!city}
          onClick={() => void speakWithSarvam({ text: 'बहुत अच्छा।', languageCode: 'hi-IN', onEnd: () => onComplete(city) })}
          className={`w-full min-h-[56px] rounded-2xl text-[20px] font-bold transition-all ${city ? 'bg-saffron text-white shadow-cta' : 'bg-outline-variant/30 text-saffron cursor-not-allowed'
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
    <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base font-hind text-text-primary flex flex-col items-center justify-center shadow-2xl px-6 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <div className="text-[80px] mb-6 animate-gentle-float">🎉</div>
        <h1 className="text-[32px] font-bold text-text-primary mb-2">बधाई हो!</h1>
        <h2 className="text-[24px] font-bold text-saffron mb-4">{name} जी</h2>
        <p className="text-lg text-saffron leading-relaxed mb-8">
          पंजीकरण पूरा हुआ। हमारी टीम <span className="font-bold text-text-primary">24 घंटे में</span> आपसे संपर्क करेगी।
        </p>
        <div className="bg-white rounded-2xl p-4 border border-outline-variant shadow-sm mb-8">
          <p className="text-lg font-medium text-text-primary">📞 1800-HPJ-HELP</p>
          <p className="text-base text-saffron">(Toll Free · सुबह 8 बजे – रात 10 बजे)</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/')}
          className="w-full min-h-[56px] bg-saffron text-white rounded-2xl text-[20px] font-bold shadow-cta"
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
    // CRITICAL: Reset tutorialCompleted on EVERY mount of this page.
    // This ensures the /onboarding page never auto-redirects back here
    // when the Pandit presses the Back button (regardless of how many times
    // they navigate back and forth).
    saveOnboardingState({ ...saved, phase: 'TUTORIAL_CTA', tutorialCompleted: false });
    // Show the welcome voice then go to mobile
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
      <main className="min-h-dvh max-w-[390px] mx-auto bg-surface-base flex flex-col shadow-2xl">
        {/* Back button even on loading screen */}
        <header className="pt-8 px-6 pb-2 flex items-center gap-3 shrink-0">
          <button onClick={goBackToTutorial} className="w-[56px] h-[56px] -ml-2 flex items-center justify-center text-saffron hover:bg-black/5 rounded-full min-h-[56px] min-w-[56px]" aria-label="Go back">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="text-[64px] mb-4 animate-gentle-float">🙏</div>
            <p className="text-[22px] font-bold text-text-primary">तैयार हो रहे हैं...</p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-3 h-3 bg-saffron rounded-full animate-bounce delay-0" />
              <div className="w-3 h-3 bg-saffron rounded-full animate-bounce delay-150" />
              <div className="w-3 h-3 bg-saffron rounded-full animate-bounce delay-300" />
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
