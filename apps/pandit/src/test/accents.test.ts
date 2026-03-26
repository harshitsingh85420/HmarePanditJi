/**
 * Accent Tests
 * Tests number word conversion across Hindi, Bhojpuri, Maithili, and Hinglish
 */

import { describe, it, expect } from 'vitest'
import { convertNumberWordsToDigits } from '../lib/number-mapper'

describe('Accent Tests', () => {
  describe('Hindi (Standard)', () => {
    it('converts "नौ आठ सात शून्य"', () => {
      expect(convertNumberWordsToDigits('नौ आठ सात शून्य').digits).toBe('9870')
    })

    it('converts "एक दो तीन चार"', () => {
      expect(convertNumberWordsToDigits('एक दो तीन चार').digits).toBe('1234')
    })

    it('converts "पांच छह सात आठ"', () => {
      expect(convertNumberWordsToDigits('पांच छह सात आठ').digits).toBe('5678')
    })

    it('converts "नौ शून्य एक दो"', () => {
      expect(convertNumberWordsToDigits('नौ शून्य एक दो').digits).toBe('9012')
    })

    it('converts full sequence "एक दो तीन चार पांच छह सात आठ नौ शून्य"', () => {
      expect(convertNumberWordsToDigits('एक दो तीन चार पांच छह सात आठ नौ शून्य').digits).toBe('1234567890')
    })
  })

  describe('Bhojpuri', () => {
    it('converts "नऊ आठ सात सिफर"', () => {
      expect(convertNumberWordsToDigits('नऊ आठ सात सिफर').digits).toBe('9870')
    })

    it('converts "एक दुइ तीन चारि"', () => {
      expect(convertNumberWordsToDigits('एक दुइ तीन चारि').digits).toBe('1234')
    })

    it('converts "नऊ नऊ आठ"', () => {
      expect(convertNumberWordsToDigits('नऊ नऊ आठ').digits).toBe('998')
    })

    it('converts "दुइ तिन चारि"', () => {
      expect(convertNumberWordsToDigits('दुइ तिन चारि').digits).toBe('234')
    })

    it('converts Bhojpuri mobile "नऊ आठ सात शून्य एक दुइ"', () => {
      expect(convertNumberWordsToDigits('नऊ आठ सात शून्य एक दुइ').digits).toBe('987012')
    })
  })

  describe('Maithili', () => {
    it('converts "एक दुइ तीन"', () => {
      expect(convertNumberWordsToDigits('एक दुइ तीन').digits).toBe('123')
    })

    it('converts "चारि पांच छह"', () => {
      expect(convertNumberWordsToDigits('चारि पांच छह').digits).toBe('456')
    })

    it('converts "एक दुइ चारि पांच"', () => {
      expect(convertNumberWordsToDigits('एक दुइ चारि पांच').digits).toBe('1245')
    })

    it('converts "तेन चारि पांच"', () => {
      expect(convertNumberWordsToDigits('तेन चारि पांच').digits).toBe('345')
    })

    it('converts Maithili mobile "एक दुइ तीन चारि पांच छह"', () => {
      expect(convertNumberWordsToDigits('एक दुइ तीन चारि पांच छह').digits).toBe('123456')
    })
  })

  describe('Hinglish (Code-mixed)', () => {
    it('converts "one दो three चार"', () => {
      expect(convertNumberWordsToDigits('one दो three चार').digits).toBe('1234')
    })

    it('converts "चार five छह"', () => {
      expect(convertNumberWordsToDigits('चार five छह').digits).toBe('456')
    })

    it('converts "ek do तीन chaar"', () => {
      expect(convertNumberWordsToDigits('ek do तीन chaar').digits).toBe('1234')
    })

    it('converts "nine आठ seven छह"', () => {
      expect(convertNumberWordsToDigits('nine आठ seven छह').digits).toBe('9876')
    })

    it('converts "mera number नौ eight सात zero"', () => {
      expect(convertNumberWordsToDigits('mera number नौ eight सात zero').digits).toBe('9870')
    })

    it('converts Hinglish mobile "98 seven zero एक दो three"', () => {
      expect(convertNumberWordsToDigits('98 seven zero एक दो three').digits).toBe('9870123')
    })
  })

  describe('Mixed Accent Scenarios', () => {
    it('handles Hindi-Bhojpuri mix "नौ दुइ तीन"', () => {
      expect(convertNumberWordsToDigits('नौ दुइ तीन').digits).toBe('923')
    })

    it('handles Bhojpuri-Maithili mix "नऊ दुइ चारि"', () => {
      expect(convertNumberWordsToDigits('नऊ दुइ चारि').digits).toBe('924')
    })

    it('handles Hindi-Hinglish mix "एक two तीन"', () => {
      expect(convertNumberWordsToDigits('एक two तीन').digits).toBe('123')
    })

    it('handles all variants for 9 "नौ नऊ nine"', () => {
      expect(convertNumberWordsToDigits('नौ नऊ nine').digits).toBe('999')
    })

    it('handles all variants for 2 "दो दुइ two"', () => {
      expect(convertNumberWordsToDigits('दो दुइ two').digits).toBe('222')
    })
  })

  describe('Regional Number Word Variants', () => {
    describe('Number 9 Variants', () => {
      it('Hindi "नौ"', () => {
        expect(convertNumberWordsToDigits('नौ').digits).toBe('9')
      })

      it('Bhojpuri "नऊ"', () => {
        expect(convertNumberWordsToDigits('नऊ').digits).toBe('9')
      })

      it('Transliterated "nau"', () => {
        expect(convertNumberWordsToDigits('nau').digits).toBe('9')
      })

      it('English "nine"', () => {
        expect(convertNumberWordsToDigits('nine').digits).toBe('9')
      })
    })

    describe('Number 2 Variants', () => {
      it('Hindi "दो"', () => {
        expect(convertNumberWordsToDigits('दो').digits).toBe('2')
      })

      it('Bhojpuri/Maithili "दुइ"', () => {
        expect(convertNumberWordsToDigits('दुइ').digits).toBe('2')
      })

      it('Transliterated "do"', () => {
        expect(convertNumberWordsToDigits('do').digits).toBe('2')
      })

      it('English "two"', () => {
        expect(convertNumberWordsToDigits('two').digits).toBe('2')
      })
    })

    describe('Number 4 Variants', () => {
      it('Hindi "चार"', () => {
        expect(convertNumberWordsToDigits('चार').digits).toBe('4')
      })

      it('Maithili "चारि"', () => {
        expect(convertNumberWordsToDigits('चारि').digits).toBe('4')
      })

      it('Transliterated "char"', () => {
        expect(convertNumberWordsToDigits('char').digits).toBe('4')
      })

      it('English "four"', () => {
        expect(convertNumberWordsToDigits('four').digits).toBe('4')
      })
    })
  })

  describe('Word Error Rate (WER) Simulation', () => {
    it('calculates WER for perfect recognition', () => {
      const expected = '9870'
      const actual = convertNumberWordsToDigits('नौ आठ सात शून्य').digits
      expect(actual).toBe(expected)
    })

    it('handles partial recognition', () => {
      // If STT misses one word
      const result = convertNumberWordsToDigits('नौ आठ शून्य')
      expect(result.digits).toBe('980')
    })

    it('handles extra words', () => {
      // If STT adds extra words
      const result = convertNumberWordsToDigits('नौ आठ सात शून्य एक')
      expect(result.digits).toBe('98701')
    })
  })

  describe('Mobile Number Context', () => {
    it('extracts 10-digit Hindi mobile', () => {
      const result = convertNumberWordsToDigits(
        'एक दो तीन चार पांच छह सात आठ नौ शून्य',
        'mobile'
      )
      expect(result.digits).toBe('1234567890')
      expect(result.confidence).toBe(1.0)
    })

    it('extracts 10-digit Bhojpuri mobile', () => {
      const result = convertNumberWordsToDigits(
        'नऊ आठ सात शून्य एक दुइ तीन चारि पांच',
        'mobile'
      )
      expect(result.digits).toBe('987012345')
    })

    it('extracts 10-digit Hinglish mobile', () => {
      const result = convertNumberWordsToDigits(
        '98 seven zero एक दो three four',
        'mobile'
      )
      expect(result.digits).toBe('98701234')
    })
  })

  describe('OTP Context', () => {
    it('extracts 6-digit Hindi OTP', () => {
      const result = convertNumberWordsToDigits(
        'एक दो तीन चार पांच छह',
        'otp'
      )
      expect(result.digits).toBe('123456')
    })

    it('extracts 6-digit Bhojpuri OTP', () => {
      const result = convertNumberWordsToDigits(
        'नऊ आठ सात शून्य एक दुइ',
        'otp'
      )
      expect(result.digits).toBe('987012')
    })

    it('extracts 6-digit Hinglish OTP', () => {
      const result = convertNumberWordsToDigits(
        'one two three four five six',
        'otp'
      )
      expect(result.digits).toBe('123456')
    })
  })
})
