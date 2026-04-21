'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SupportedLanguage, LANGUAGE_DISPLAY, getBrandName } from '@/lib/onboarding-store'

interface ScriptChoiceScreenProps {
  language: SupportedLanguage
  onChooseNative: () => void
  onChooseLatin: () => void
  onChangeLanguage: () => void
  onBack?: () => void
}

export default function ScriptChoiceScreen({
  language,
  onChooseNative,
  onChooseLatin,
  onChangeLanguage,
  onBack
}: ScriptChoiceScreenProps) {
  const langInfo = LANGUAGE_DISPLAY[language]

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    }
  }

  return (
    <main className="font-body min-h-screen flex flex-col bg-[#fbf9f3]">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-[#fbf9f3]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.button
          onClick={handleBackClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ delay: 0.3 }}
          className="h-10 w-10 rounded-full bg-[#e4e2dd] flex items-center justify-center hover:bg-[#ddd9d2] transition-colors"
          aria-label="वापस जाएं"
        >
          <svg className="w-6 h-6 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="font-serif text-[#904d00] text-xl font-bold">
            HmarePanditJi
          </span>
        </motion.div>

        <div className="w-10" /> {/* Spacer for center alignment */}
      </motion.header>

      <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
        {/* Language Info Card */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <p className="text-[#564334] text-sm font-medium mb-2">
              आपने चुनी है
            </p>
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-[#ff8c00]/20">
              <span className="text-4xl">{langInfo.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-[#1b1c19] text-lg">
                  {langInfo.nativeName}
                </p>
                <p className="text-[#564334] text-sm">
                  {langInfo.latinName}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="font-headline text-2xl font-bold text-[#1b1c19] mb-3">
            आप कैसे पढ़ना चाहेंगे?
          </h1>
          <p className="text-[#564334] text-lg leading-relaxed">
            अपनी पसंदीदा स्क्रिप्ट शैली चुनें
          </p>
        </motion.div>

        {/* Option 1: Pure Language (Native Script) */}
        <motion.button
          onClick={onChooseNative}
          className="w-full mb-4 p-5 bg-white rounded-2xl border-2 border-[#e4e2dd] hover:border-[#ff8c00] hover:shadow-lg transition-all text-left group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ff9500] flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-2xl font-bold">
                {langInfo.scriptChar}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🇮🇳</span>
                <h3 className="font-headline text-xl font-bold text-[#1b1c19]">
                  शुद्ध {langInfo.nativeName}
                </h3>
              </div>
              <p className="text-[#564334] text-base mb-2">
                {langInfo.nativeName} ({langInfo.nativeName} लिपि)
              </p>
              <p className="text-[#8a7960] text-sm">
                सब कुछ {langInfo.nativeName} लिपि में
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f5f3ee] flex items-center justify-center group-hover:bg-[#ff8c00] transition-colors">
              <svg className="w-5 h-5 text-[#564334] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.button>

        {/* Option 2: Language + English (Latin/Romanized Script) */}
        <motion.button
          onClick={onChooseLatin}
          className="w-full mb-6 p-5 bg-white rounded-2xl border-2 border-[#e4e2dd] hover:border-[#ff8c00] hover:shadow-lg transition-all text-left group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#45a049] flex items-center justify-center flex-shrink-0 shadow-lg">
              <div className="flex flex-col items-center leading-none">
                <span className="text-white text-xl font-bold">{langInfo.scriptChar}</span>
                <span className="text-white/80 text-[10px] font-bold">a</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🌍</span>
                <h3 className="font-headline text-xl font-bold text-[#1b1c19]">
                  {langInfo.nativeName} + अंग्रेज़ी
                </h3>
              </div>
              <p className="text-[#564334] text-base mb-2">
                {langInfo.nativeName} (अंग्रेज़ी अक्षरों में)
              </p>
              <p className="text-[#8a7960] text-sm">
                {langInfo.nativeName} अंग्रेज़ी लिपि में लिखी हुई
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f5f3ee] flex items-center justify-center group-hover:bg-[#ff8c00] transition-colors">
              <svg className="w-5 h-5 text-[#564334] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.button>

        {/* Divider */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e4e2dd]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#fbf9f3] px-4 text-[#8a7960] text-sm font-medium">
              या
            </span>
          </div>
        </motion.div>

        {/* Change Language Button */}
        <motion.button
          onClick={onChangeLanguage}
          className="w-full h-14 bg-[#f5f3ee] text-[#564334] font-bold text-lg rounded-xl border-2 border-[#e4e2dd] hover:border-[#ff8c00] hover:bg-[#fff8f0] transition-all flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          भाषा बदलें
        </motion.button>

        {/* Help Text */}
        <motion.p
          className="text-center text-[#8a7960] text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          💡 आप सेटिंग्स में कभी भी यह बदल सकते हैं
        </motion.p>
      </div>
    </main>
  )
}
