'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import { TUTORIAL_VOICE_NAV } from '@/lib/voice-scripts';
import { speak, startListening, stopListening, stopSpeaking } from '@/lib/voice-engine';
import TutorialShell from './TutorialShell';
import { TutorialScreenProps } from './types';
import { TUTORIAL_TRANSLATIONS, getTutorialLang } from '@/lib/tutorial-translations';

type DemoState = 'ready' | 'listening' | 'success';

export default function TutorialVoiceNav({
  currentDot,
  onNext,
  onBack,
  onSkip,
  language = 'Hindi',
}: TutorialScreenProps) {
  const lang = getTutorialLang(language);
  const t = TUTORIAL_TRANSLATIONS[lang].screens.S07;

  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [demoState, setDemoState] = useState<DemoState>('ready');
  const [helperText, setHelperText] = useState('हाँ या नहीं बोलकर देखें');
  const [ctaPulse, setCtaPulse] = useState(false);

  const startDemo = () => {
    cleanupRef.current?.();
    setDemoState('listening');
    setHelperText('हाँ या नहीं बोलकर देखें');
    setCtaPulse(false);

    cleanupRef.current = startListening({
      language: 'hi-IN',
      listenTimeoutMs: 15000,
      onResult: () => {
        setDemoState('success');
        cleanupRef.current?.();
        cleanupRef.current = undefined;
        setHelperText('हाँ या नहीं बोलकर देखें');

        resetTimerRef.current = setTimeout(() => {
          setDemoState('ready');
          startDemo();
        }, 2000);
      },
      onError: (error) => {
        if (error === 'TIMEOUT') {
          setDemoState('ready');
          setHelperText('कोई बात नहीं। Keyboard से भी चलता है।');
          setCtaPulse(true);
          speak('कोई बात नहीं। Keyboard से भी चलता है। नीचे Keyboard button हमेशा रहेगा।', 'hi-IN');
        }
      },
    });
  };

  const { stopFlow } = useSarvamVoiceFlow({
    language: language as any,
    script: TUTORIAL_VOICE_NAV.scripts.main.hindi,
    autoListen: false,
    onIntent: () => { },
    onScriptComplete: () => {
      window.setTimeout(startDemo, 300);
    },
  });

  useEffect(() => {
    return () => {
      stopFlow();
      clearTimeout(resetTimerRef.current);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
  }, [stopFlow]);

  return (
    <TutorialShell
      currentDot={currentDot}
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      isListening={demoState === 'listening'}
      showKeyboardToggle
      onKeyboardToggle={() => { }}
      language={language}
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h1 className="text-[30px] font-bold leading-tight text-vedic-brown">{t.title}</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center mb-6"
      >
        <div className="w-40 h-40 bg-primary-lt rounded-full flex flex-col items-center justify-center relative mb-2">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-primary/20" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-primary/10" />
          </div>
          <div className="absolute left-5 top-12 h-10 w-10 rounded-full border-2 border-primary/30 border-r-transparent border-b-transparent rotate-[-35deg]" />
          <div className="absolute right-5 top-12 h-10 w-10 rounded-full border-2 border-primary/30 border-l-transparent border-b-transparent rotate-[35deg]" />
          <span className="text-[64px] relative z-10">🎤</span>
          <div className="absolute bottom-4 right-4 bg-white border border-primary/30 rounded-full px-2 py-1 text-[12px] font-bold text-primary shadow-sm">
            {t.voiceBadge || 'हाँ'}
          </div>
        </div>
        <p className="text-[16px] text-vedic-gold">{t.speakTypes || 'बोलो → लिखाई हो जाती है'}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-4"
      >
        <p className="text-[16px] text-vedic-brown-2 mb-2">{t.whenYouSee || 'जब यह दिखे:'}</p>
        <div className="inline-flex items-center gap-2 bg-primary-lt border border-primary px-3 py-1.5 rounded-full mb-3">
          <div className="flex gap-0.5 items-end h-4">
            {[2, 4, 3].map((height, index) => (
              <motion.div
                key={index}
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.15 }}
                className="w-1 bg-primary rounded-full"
                style={{ height: height * 3 }}
              />
            ))}
          </div>
          <span className="text-[14px] font-medium text-primary">{t.listening || 'सुन रहा हूँ...'}</span>
        </div>
        <p className="text-[28px] font-bold text-vedic-brown">{t.thenSpeak || 'तब बोलिए।'}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <div
          className={`w-full h-[104px] rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center transition-colors ${demoState === 'success' ? 'bg-success-lt border-success' : 'bg-primary-lt border-primary'
            }`}
        >
          <div className="relative flex items-center justify-center mb-1">
            {demoState !== 'success' && (
              <>
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute w-11 h-11 rounded-full bg-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute w-11 h-11 rounded-full bg-primary"
                />
              </>
            )}
            <span className="text-[44px] relative z-10">🎤</span>
          </div>
          <p className="text-[18px] text-vedic-brown-2">{helperText || t.demoText}</p>
        </div>

        <AnimatePresence>
          {demoState === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="mt-3 flex justify-center"
            >
              <div className="bg-success-lt border border-success rounded-full px-6 py-3">
                <p className="text-[20px] font-bold text-success">{t.successMessage || '✅ शाबाश! बिल्कुल सही!'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-1"
      >
        <p className="text-[15px] text-vedic-gold">{t.keyboardFallback || 'अगर बोलने में दिक्कत हो:'}</p>
        <p className="text-[15px] font-medium text-vedic-brown-2">{t.keyboardAlways || '⌨️ Keyboard हमेशा नीचे है'}</p>
      </motion.div>

      {ctaPulse && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-full bg-primary-lt px-4 py-2 text-[14px] font-medium text-primary animate-pulse">
            अगले बटन से भी आगे बढ़ सकते हैं
          </div>
        </div>
      )}
    </TutorialShell>
  );
}
