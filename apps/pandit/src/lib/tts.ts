'use client'

export interface TTSOptions {
  lang?: string
  rate?: number    
  pitch?: number   
  volume?: number  
}

class TTSManager {
  private static instance: TTSManager
  private currentUtterance: SpeechSynthesisUtterance | null = null

  static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager()
    }
    return TTSManager.instance
  }

  async getIndianVoice(lang: string): Promise<SpeechSynthesisVoice | null> {
    return new Promise(resolve => {
      const getVoice = () => {
        const voices = window.speechSynthesis.getVoices()
        
        const priorities = [
          voices.find(v => v.lang === lang && v.localService),
          voices.find(v => v.lang === lang),
          voices.find(v => v.lang.startsWith('hi') && v.localService),
          voices.find(v => v.lang.startsWith('hi')),
          voices.find(v => v.name.toLowerCase().includes('india')),
          voices.find(v => v.name.toLowerCase().includes('hindi')),
          voices[0], 
        ]
        
        resolve(priorities.find(v => v !== undefined) || null)
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        getVoice()
      } else {
        window.speechSynthesis.onvoiceschanged = getVoice
        setTimeout(getVoice, 1000) 
      }
    })
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!('speechSynthesis' in window)) return
    
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || 'hi-IN'
    utterance.rate = options.rate || 0.82  
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0

    const voice = await this.getIndianVoice(utterance.lang)
    if (voice) utterance.voice = voice

    this.currentUtterance = utterance

    return new Promise((resolve) => {
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    this.currentUtterance = null
  }

  isSpeaking(): boolean {
    return 'speechSynthesis' in window ? window.speechSynthesis.speaking : false
  }
}

export const tts = typeof window !== 'undefined' ? TTSManager.getInstance() : null

export const PHRASES = {
  hi: {
    welcome: 'Namaste Pandit Ji. HmarePanditJi mein aapka swagat hai.',
    enterMobile: 'Kripya apna 10 digit mobile number boliye ya type karein.',
    confirmMobile: (number: string) => `Aapne kaha ${number.split('').join(' ')} — sahi hai? Haan boliye ya Nahi boliye.`,
    enterOtp: 'OTP ke ank boliye ya type kariye.',
    success: (step: string) => `${step} ho gaya! Bahut achha Pandit Ji.`,
    retry1: 'Maaf kijiye, phir se boliye.',
    retry2: 'Kripya dhire aur saaf boliye.',
    retry3: 'Aap type karke bhi bilkul aasani se registration kar sakte hain. Neeche button dabayein.',
    micExplain: 'Is app mein aapko kuch bhi type karne ki zaroorat nahi. Aap bolenge — app sunaga.',
    saved: 'Aapka kaam save ho gaya.',
  }
} as const
