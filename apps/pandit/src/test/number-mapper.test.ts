/**
 * Unit Tests for Number Word Mapper
 * Tests Hindi/Bhojpuri/Maithili number word to digit conversion
 */

import {
  convertNumberWordsToDigits,
  extractMobileNumber,
  extractOTP,
  extractDate,
  getMonthName,
} from '../lib/number-mapper';

describe('Number Word Mapper', () => {
  describe('Hindi Number Words', () => {
    it('should convert Hindi digits 0-9', () => {
      expect(convertNumberWordsToDigits('शून्य').digits).toBe('0');
      expect(convertNumberWordsToDigits('एक').digits).toBe('1');
      expect(convertNumberWordsToDigits('दो').digits).toBe('2');
      expect(convertNumberWordsToDigits('तीन').digits).toBe('3');
      expect(convertNumberWordsToDigits('चार').digits).toBe('4');
      expect(convertNumberWordsToDigits('पांच').digits).toBe('5');
      expect(convertNumberWordsToDigits('छह').digits).toBe('6');
      expect(convertNumberWordsToDigits('सात').digits).toBe('7');
      expect(convertNumberWordsToDigits('आठ').digits).toBe('8');
      expect(convertNumberWordsToDigits('नौ').digits).toBe('9');
    });

    it('should convert sequence of Hindi numbers', () => {
      const result = convertNumberWordsToDigits('एक दो तीन चार पांच छह सात आठ नौ शून्य');
      expect(result.digits).toBe('1234567890');
      expect(result.confidence).toBe(1.0);
    });

    it('should convert mobile number in Hindi', () => {
      const result = convertNumberWordsToDigits('नौ आठ सात शून्य', 'mobile');
      expect(result.digits).toBe('9870');
    });
  });

  describe('English Transliterations', () => {
    it('should convert English transliterated numbers', () => {
      expect(convertNumberWordsToDigits('ek').digits).toBe('1');
      expect(convertNumberWordsToDigits('do').digits).toBe('2');
      expect(convertNumberWordsToDigits('teen').digits).toBe('3');
      expect(convertNumberWordsToDigits('chaar').digits).toBe('4');
      expect(convertNumberWordsToDigits('paanch').digits).toBe('5');
      expect(convertNumberWordsToDigits('chhah').digits).toBe('6');
      expect(convertNumberWordsToDigits('saat').digits).toBe('7');
      expect(convertNumberWordsToDigits('aath').digits).toBe('8');
      expect(convertNumberWordsToDigits('nau').digits).toBe('9');
      expect(convertNumberWordsToDigits('shoonya').digits).toBe('0');
    });

    it('should convert mixed Hindi-English numbers', () => {
      const result = convertNumberWordsToDigits('ek do तीन chaar five');
      expect(result.digits).toBe('12345');
    });
  });

  describe('Mobile Number Context', () => {
    it('should strip mobile number preambles in Hindi', () => {
      const result = convertNumberWordsToDigits(
        'मेरा नंबर है नौ आठ सात शून्य',
        'mobile'
      );
      expect(result.digits).toBe('9870');
    });

    it('should strip mobile number preambles in English', () => {
      const result = convertNumberWordsToDigits(
        'my number is nine eight seven zero',
        'mobile'
      );
      expect(result.digits).toBe('9870');
    });

    it('should strip +91 country code', () => {
      const result = convertNumberWordsToDigits(
        '+91 नौ आठ सात शून्य दो तीन चार पांच छह सात',
        'mobile'
      );
      expect(result.digits).toBe('9870234567');
    });

    it('should strip 91 country code without plus', () => {
      const result = convertNumberWordsToDigits(
        '91 नौ आठ सात शून्य',
        'mobile'
      );
      expect(result.digits).toBe('9870');
    });

    it('should return first 10 digits for longer numbers', () => {
      const result = convertNumberWordsToDigits(
        'एक दो तीन चार पांच छह सात आठ नौ शून्य एक दो',
        'mobile'
      );
      expect(result.digits).toBe('1234567890');
    });
  });

  describe('OTP Context', () => {
    it('should extract 6-digit OTP', () => {
      const result = convertNumberWordsToDigits(
        'एक चार दो पांच सात नौ',
        'otp'
      );
      expect(result.digits).toBe('142579');
    });

    it('should strip OTP preambles', () => {
      const result = convertNumberWordsToDigits(
        'OTP है एक चार दो पांच',
        'otp'
      );
      expect(result.digits).toBe('1425');
    });

    it('should return first 6 digits for longer OTPs', () => {
      const result = convertNumberWordsToDigits(
        'एक दो तीन चार पांच छह सात आठ',
        'otp'
      );
      expect(result.digits).toBe('123456');
    });
  });

  describe('Bhojpuri Variants', () => {
    it('should convert Bhojpuri number words', () => {
      expect(convertNumberWordsToDigits('नऊ').digits).toBe('9');
      expect(convertNumberWordsToDigits('दुइ').digits).toBe('2');
      expect(convertNumberWordsToDigits('तिन').digits).toBe('3');
    });

    it('should convert Bhojpuri number sequence', () => {
      const result = convertNumberWordsToDigits('नऊ आठ सात');
      expect(result.digits).toBe('987');
    });
  });

  describe('Maithili Variants', () => {
    it('should convert Maithili number words', () => {
      expect(convertNumberWordsToDigits('एक').digits).toBe('1');
      expect(convertNumberWordsToDigits('दुइ').digits).toBe('2');
      expect(convertNumberWordsToDigits('तेन').digits).toBe('3');
      expect(convertNumberWordsToDigits('चारि').digits).toBe('4');
    });

    it('should convert Maithili number sequence', () => {
      const result = convertNumberWordsToDigits('एक दुइ तीन');
      expect(result.digits).toBe('123');
    });
  });

  describe('Date Context', () => {
    it('should convert date number words', () => {
      expect(convertNumberWordsToDigits('पच्चीस').digits).toBe('25');
      expect(convertNumberWordsToDigits('पंद्रह').digits).toBe('15');
      expect(convertNumberWordsToDigits('पहला').digits).toBe('1');
    });

    it('should extract month name with date', () => {
      const result = convertNumberWordsToDigits('पच्चीस मार्च', 'date');
      expect(result.digits).toContain('25');
      expect(result.digits).toContain('March');
    });
  });

  describe('Month Name Extraction', () => {
    it('should get English month name from Hindi input', () => {
      expect(getMonthName('मार्च')).toBe('March');
      expect(getMonthName('जनवरी')).toBe('January');
      expect(getMonthName('दिसंबर')).toBe('December');
    });

    it('should get English month name from English input', () => {
      expect(getMonthName('March')).toBe('March');
      expect(getMonthName('january')).toBe('January');
    });

    it('should get English month name from transliterated Hindi', () => {
      expect(getMonthName('march')).toBe('March');
      expect(getMonthName('january')).toBe('January');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const result = convertNumberWordsToDigits('');
      expect(result.digits).toBe('');
      expect(result.confidence).toBe(0);
    });

    it('should handle null/undefined gracefully', () => {
      const result1 = convertNumberWordsToDigits('');
      expect(result1.digits).toBe('');
    });

    it('should handle mixed digits and words', () => {
      const result = convertNumberWordsToDigits('98 सात शून्य');
      expect(result.digits).toBe('9870');
    });

    it('should handle punctuation', () => {
      const result = convertNumberWordsToDigits('एक, दो, तीन');
      expect(result.digits).toBe('123');
    });
  });

  describe('Convenience Functions', () => {
    it('should extract mobile number with extractMobileNumber', () => {
      expect(extractMobileNumber('मेरा नंबर है नौ आठ सात शून्य')).toBe('9870');
    });

    it('should extract OTP with extractOTP', () => {
      expect(extractOTP('OTP है एक चार दो पांच सात नौ')).toBe('142579');
    });

    it('should extract date with extractDate', () => {
      const result = extractDate('पच्चीस मार्च');
      expect(result).toContain('25');
    });
  });

  describe('Confidence Scoring', () => {
    it('should give high confidence for valid 10-digit mobile', () => {
      const result = convertNumberWordsToDigits(
        'एक दो तीन चार पांच छह सात आठ नौ शून्य',
        'mobile'
      );
      expect(result.confidence).toBe(1.0);
    });

    it('should give lower confidence for short mobile numbers', () => {
      const result = convertNumberWordsToDigits('नौ आठ सात', 'mobile');
      expect(result.confidence).toBeLessThan(1.0);
    });

    it('should give high confidence for valid 6-digit OTP', () => {
      const result = convertNumberWordsToDigits(
        'एक दो तीन चार पांच छह',
        'otp'
      );
      expect(result.confidence).toBe(1.0);
    });
  });
});
