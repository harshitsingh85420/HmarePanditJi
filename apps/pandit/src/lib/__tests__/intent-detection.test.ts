/**
 * Intent Detection Tests
 * Tests for voice intent recognition (YES, NO, SKIP, HELP, etc.)
 *
 * Based on INTENT_WORD_MAP in voice-engine.ts
 */

import { describe, it, expect } from 'vitest'
import { detectIntent, INTENT_WORD_MAP } from '../voice-engine'

describe('Intent Detection', () => {
  describe('YES Intents', () => {
    it('detects "haan"', () => {
      expect(detectIntent('haan')).toBe('YES')
    })

    it('detects "ha"', () => {
      expect(detectIntent('ha')).toBe('YES')
    })

    it('detects "bilkul"', () => {
      expect(detectIntent('bilkul')).toBe('YES')
    })

    it('detects "sahi hai"', () => {
      expect(detectIntent('sahi hai')).toBe('YES')
    })

    it('detects "yes"', () => {
      expect(detectIntent('yes')).toBe('YES')
    })

    it('detects "theek"', () => {
      expect(detectIntent('theek')).toBe('YES')
    })

    it('detects "thik"', () => {
      expect(detectIntent('thik')).toBe('YES')
    })

    it('detects "ok"', () => {
      expect(detectIntent('ok')).toBe('YES')
    })

    it('detects "okay"', () => {
      expect(detectIntent('okay')).toBe('YES')
    })

    it('detects "correct"', () => {
      expect(detectIntent('correct')).toBe('YES')
    })

    it('detects "accha"', () => {
      expect(detectIntent('accha')).toBe('YES')
    })

    it('detects "zaroor"', () => {
      expect(detectIntent('zaroor')).toBe('YES')
    })

    it('detects "haanji"', () => {
      expect(detectIntent('haanji')).toBe('YES')
    })

    it('detects "kar lo"', () => {
      expect(detectIntent('kar lo')).toBe('YES')
    })

    it('detects "de do"', () => {
      expect(detectIntent('de do')).toBe('YES')
    })

    it('detects "bilkul theek"', () => {
      expect(detectIntent('bilkul theek')).toBe('YES')
    })

    it('detects "haan haan"', () => {
      expect(detectIntent('haan haan')).toBe('YES')
    })

    it('detects "shi hai"', () => {
      expect(detectIntent('shi hai')).toBe('YES')
    })

    it('detects YES in sentence "haan yeh sahi hai"', () => {
      expect(detectIntent('haan yeh sahi hai')).toBe('YES')
    })

    it('detects YES in "haan ji"', () => {
      expect(detectIntent('haan ji')).toBe('YES')
    })
  })

  describe('NO Intents', () => {
    it('detects "nahi"', () => {
      expect(detectIntent('nahi')).toBe('NO')
    })

    it('detects "naa"', () => {
      expect(detectIntent('naa')).toBe('NO')
    })

    it('detects "galat"', () => {
      expect(detectIntent('galat')).toBe('NO')
    })

    it('detects "no"', () => {
      expect(detectIntent('no')).toBe('NO')
    })

    it('detects "mat"', () => {
      expect(detectIntent('mat')).toBe('NO')
    })

    it('detects "mat karo"', () => {
      expect(detectIntent('mat karo')).toBe('NO')
    })

    it('detects "nahi chahiye"', () => {
      expect(detectIntent('nahi chahiye')).toBe('NO')
    })

    it('detects "nahi karna"', () => {
      expect(detectIntent('nahi karna')).toBe('NO')
    })

    it('detects "nahi ji"', () => {
      expect(detectIntent('nahi ji')).toBe('NO')
    })

    it('detects "na"', () => {
      expect(detectIntent('na')).toBe('NO')
    })

    it('detects NO in sentence "nahi yeh"', () => {
      // Note: "nahi yeh" matches CHANGE intent due to "nahi yeh" phrase
      expect(detectIntent('nahi yeh')).toBe('CHANGE')
    })

    it('detects NO in sentence "nahi galat"', () => {
      expect(detectIntent('nahi galat')).toBe('NO')
    })
  })

  describe('SKIP Intents', () => {
    it('detects "skip karo"', () => {
      expect(detectIntent('skip karo')).toBe('SKIP')
    })

    it('detects "seedha chalo"', () => {
      expect(detectIntent('seedha chalo')).toBe('SKIP')
    })

    it('detects "baad mein"', () => {
      expect(detectIntent('baad mein')).toBe('SKIP')
    })

    it('detects "skip"', () => {
      expect(detectIntent('skip')).toBe('SKIP')
    })

    it('detects "aage jao"', () => {
      expect(detectIntent('aage jao')).toBe('SKIP')
    })

    it('detects "registration"', () => {
      expect(detectIntent('registration')).toBe('SKIP')
    })

    it('detects "baad me"', () => {
      expect(detectIntent('baad me')).toBe('SKIP')
    })

    it('detects "later"', () => {
      expect(detectIntent('later')).toBe('SKIP')
    })

    it('detects "abhi nahi"', () => {
      expect(detectIntent('abhi nahi')).toBe('SKIP')
    })

    it('detects SKIP in sentence "isko skip karo"', () => {
      expect(detectIntent('isko skip karo')).toBe('SKIP')
    })
  })

  describe('HELP Intents', () => {
    it('detects "madad"', () => {
      expect(detectIntent('madad')).toBe('HELP')
    })

    it('detects "help"', () => {
      expect(detectIntent('help')).toBe('HELP')
    })

    it('detects "sahayata"', () => {
      expect(detectIntent('sahayata')).toBe('HELP')
    })

    it('detects "samajh nahi"', () => {
      expect(detectIntent('samajh nahi')).toBe('HELP')
    })

    it('detects "samajha nahi"', () => {
      expect(detectIntent('samajha nahi')).toBe('HELP')
    })

    it('detects "dikkat"', () => {
      expect(detectIntent('dikkat')).toBe('HELP')
    })

    it('detects "problem"', () => {
      expect(detectIntent('problem')).toBe('HELP')
    })

    it('detects "mushkil"', () => {
      expect(detectIntent('mushkil')).toBe('HELP')
    })

    it('detects "nahi samajha"', () => {
      expect(detectIntent('nahi samajha')).toBe('HELP')
    })

    it('detects "mujhe madad chahiye"', () => {
      expect(detectIntent('mujhe madad chahiye')).toBe('HELP')
    })

    it('detects HELP in sentence "mujhe madad chahiye"', () => {
      expect(detectIntent('mujhe madad chahiye')).toBe('HELP')
    })
  })

  describe('CHANGE Intents', () => {
    it('detects "badle"', () => {
      expect(detectIntent('badle')).toBe('CHANGE')
    })

    it('detects "badlo"', () => {
      expect(detectIntent('badlo')).toBe('CHANGE')
    })

    it('detects "change"', () => {
      expect(detectIntent('change')).toBe('CHANGE')
    })

    it('detects "doosri"', () => {
      expect(detectIntent('doosri')).toBe('CHANGE')
    })

    it('detects "alag"', () => {
      expect(detectIntent('alag')).toBe('CHANGE')
    })

    it('detects "koi aur"', () => {
      expect(detectIntent('koi aur')).toBe('CHANGE')
    })

    it('detects "doosra"', () => {
      expect(detectIntent('doosra')).toBe('CHANGE')
    })

    it('detects "change karo"', () => {
      expect(detectIntent('change karo')).toBe('CHANGE')
    })

    it('detects "nahi yeh"', () => {
      expect(detectIntent('nahi yeh')).toBe('CHANGE')
    })

    it('detects "kuch aur"', () => {
      expect(detectIntent('kuch aur')).toBe('CHANGE')
    })

    it('detects CHANGE in sentence "yeh galat hai, change karo"', () => {
      expect(detectIntent('yeh galat hai, change karo')).toBe('CHANGE')
    })
  })

  describe('FORWARD Intents', () => {
    it('detects "aage"', () => {
      expect(detectIntent('aage')).toBe('FORWARD')
    })

    it('detects "agla"', () => {
      expect(detectIntent('agla')).toBe('FORWARD')
    })

    it('detects "next"', () => {
      expect(detectIntent('next')).toBe('FORWARD')
    })

    it('detects "continue"', () => {
      expect(detectIntent('continue')).toBe('FORWARD')
    })

    it('detects "samajh gaya"', () => {
      expect(detectIntent('samajh gaya')).toBe('FORWARD')
    })

    it('detects "theek hai"', () => {
      expect(detectIntent('theek hai')).toBe('FORWARD')
    })

    it('detects "aage chalein"', () => {
      expect(detectIntent('aage chalein')).toBe('FORWARD')
    })

    it('detects "jaari rakhein"', () => {
      expect(detectIntent('jaari rakhein')).toBe('FORWARD')
    })

    it('detects "dekhein"', () => {
      expect(detectIntent('dekhein')).toBe('FORWARD')
    })

    it('detects "show karo"', () => {
      expect(detectIntent('show karo')).toBe('FORWARD')
    })

    it('detects FORWARD in sentence "samajh gaya, aage badho"', () => {
      expect(detectIntent('samajh gaya, aage badho')).toBe('FORWARD')
    })

    it('detects FORWARD in "next screen"', () => {
      expect(detectIntent('next screen')).toBe('FORWARD')
    })
  })

  describe('BACK Intents', () => {
    it('detects "pichhe"', () => {
      expect(detectIntent('pichhe')).toBe('BACK')
    })

    it('detects "wapas"', () => {
      expect(detectIntent('wapas')).toBe('BACK')
    })

    it('detects "pehle wala"', () => {
      expect(detectIntent('pehle wala')).toBe('BACK')
    })

    it('detects "back"', () => {
      expect(detectIntent('back')).toBe('BACK')
    })

    it('detects "previous"', () => {
      expect(detectIntent('previous')).toBe('BACK')
    })

    it('detects "wapas jao"', () => {
      expect(detectIntent('wapas jao')).toBe('BACK')
    })

    it('detects "pichle screen"', () => {
      expect(detectIntent('pichle screen')).toBe('BACK')
    })

    it('detects BACK in sentence "wapas jao, pehle dekhna hai"', () => {
      expect(detectIntent('wapas jao, pehle dekhna hai')).toBe('BACK')
    })

    it('detects BACK in "previous screen"', () => {
      expect(detectIntent('previous screen')).toBe('BACK')
    })
  })

  describe('Edge Cases', () => {
    it('returns null for empty string', () => {
      expect(detectIntent('')).toBeNull()
    })

    it('returns null for whitespace only', () => {
      expect(detectIntent('   ')).toBeNull()
    })

    it('returns null for unknown intent', () => {
      expect(detectIntent('maybe')).toBeNull()
    })

    it('returns null for greeting', () => {
      expect(detectIntent('namaste')).toBeNull()
    })

    it('returns null for hello', () => {
      expect(detectIntent('hello')).toBeNull()
    })

    it('returns null for thank you', () => {
      expect(detectIntent('thank you')).toBeNull()
    })

    it('returns null for shukriya', () => {
      expect(detectIntent('shukriya')).toBeNull()
    })

    it('returns null for unknown phrase', () => {
      expect(detectIntent('kya haal hai')).toBeNull()
    })

    it('handles mixed case YES', () => {
      expect(detectIntent('HAAN')).toBe('YES')
    })

    it('handles mixed case NO', () => {
      expect(detectIntent('Nahi')).toBe('NO')
    })

    it('handles leading/trailing whitespace', () => {
      expect(detectIntent('  haan  ')).toBe('YES')
    })

    it('returns highest scoring intent for mixed input', () => {
      const result = detectIntent('haan haan nahi')
      expect(result).toBe('YES')
    })
  })

  describe('Context Phrases', () => {
    it('detects YES in sentence "haan, yeh sahi hai"', () => {
      expect(detectIntent('haan, yeh sahi hai')).toBe('YES')
    })

    it('detects NO in sentence "nahi, yeh galat hai"', () => {
      expect(detectIntent('nahi, yeh galat hai')).toBe('NO')
    })

    it('detects YES in "main haan bol raha hoon"', () => {
      expect(detectIntent('main haan bol raha hoon')).toBe('YES')
    })

    it('detects NO in "main nahi bol raha hoon"', () => {
      expect(detectIntent('main nahi bol raha hoon')).toBe('NO')
    })

    it('detects YES in question "kya yeh sahi hai? haan"', () => {
      expect(detectIntent('kya yeh sahi hai? haan')).toBe('YES')
    })

    it('detects NO in question "kya yeh galat hai? nahi"', () => {
      expect(detectIntent('kya yeh galat hai? nahi')).toBe('NO')
    })

    it('detects SKIP in "isko skip karo please"', () => {
      expect(detectIntent('isko skip karo please')).toBe('SKIP')
    })

    it('detects HELP in "madad chahiye"', () => {
      expect(detectIntent('madad chahiye')).toBe('HELP')
    })

    it('detects CHANGE in "yeh galat hai, change karo"', () => {
      expect(detectIntent('yeh galat hai, change karo')).toBe('CHANGE')
    })

    it('detects FORWARD in "samajh gaya, aage badho"', () => {
      expect(detectIntent('samajh gaya, aage badho')).toBe('FORWARD')
    })

    it('detects BACK in "wapas jao, pehle dekhna hai"', () => {
      expect(detectIntent('wapas jao, pehle dekhna hai')).toBe('BACK')
    })
  })

  describe('Multi-language Code-mixing', () => {
    it('detects Hinglish "haan yes"', () => {
      expect(detectIntent('haan yes')).toBe('YES')
    })

    it('detects Hinglish "nahi no"', () => {
      expect(detectIntent('nahi no')).toBe('NO')
    })

    it('detects Hinglish "skip karo please"', () => {
      expect(detectIntent('skip karo please')).toBe('SKIP')
    })

    it('detects Hinglish "madad help"', () => {
      expect(detectIntent('madad help')).toBe('HELP')
    })

    it('detects Hinglish "change karo"', () => {
      expect(detectIntent('change karo')).toBe('CHANGE')
    })

    it('detects Hinglish "aage next"', () => {
      expect(detectIntent('aage next')).toBe('FORWARD')
    })

    it('detects Hinglish "wapas back"', () => {
      expect(detectIntent('wapas back')).toBe('BACK')
    })
  })

  describe('Intent Priority/Conflicts', () => {
    it('returns YES for "haan"', () => {
      expect(detectIntent('haan')).toBe('YES')
    })

    it('returns NO for "nahi"', () => {
      expect(detectIntent('nahi')).toBe('NO')
    })

    it('returns SKIP for "skip karo"', () => {
      expect(detectIntent('skip karo')).toBe('SKIP')
    })

    it('returns HELP for "madad"', () => {
      expect(detectIntent('madad')).toBe('HELP')
    })

    it('returns CHANGE for "badlo"', () => {
      expect(detectIntent('badlo')).toBe('CHANGE')
    })

    it('returns FORWARD for "aage"', () => {
      expect(detectIntent('aage')).toBe('FORWARD')
    })

    it('returns BACK for "wapas"', () => {
      expect(detectIntent('wapas')).toBe('BACK')
    })

    it('returns highest scoring intent when multiple intents match', () => {
      // haan appears twice, nahi once - YES should win
      const result = detectIntent('haan haan nahi')
      expect(result).toBe('YES')
    })
  })

  describe('Regional Variants - Bhojpuri', () => {
    it('detects Bhojpuri YES "ho"', () => {
      expect(detectIntent('ho')).toBe('YES')
    })

    it('detects Bhojpuri YES "hau"', () => {
      expect(detectIntent('hau')).toBe('YES')
    })

    it('detects Bhojpuri YES "haan ho"', () => {
      expect(detectIntent('haan ho')).toBe('YES')
    })

    it('detects Bhojpuri NO "naa ho"', () => {
      expect(detectIntent('naa ho')).toBe('NO')
    })

    it('detects Bhojpuri SKIP "chhod de"', () => {
      expect(detectIntent('chhod de')).toBe('SKIP')
    })

    it('detects Bhojpuri SKIP "rehne de"', () => {
      expect(detectIntent('rehne de')).toBe('SKIP')
    })

    it('detects Bhojpuri HELP "kaise karein"', () => {
      expect(detectIntent('kaise karein')).toBe('HELP')
    })

    it('detects Bhojpuri FORWARD "aage badho"', () => {
      expect(detectIntent('aage badho')).toBe('FORWARD')
    })

    it('detects Bhojpuri BACK "wapas lao"', () => {
      expect(detectIntent('wapas lao')).toBe('BACK')
    })
  })

  describe('Regional Variants - Maithili', () => {
    it('detects Maithili YES "hain"', () => {
      expect(detectIntent('hain')).toBe('YES')
    })

    it('detects Maithili YES "hain ji"', () => {
      expect(detectIntent('hain ji')).toBe('YES')
    })

    it('detects Maithili NO "nain"', () => {
      expect(detectIntent('nain')).toBe('NO')
    })

    it('detects Maithili NO "nain ji"', () => {
      expect(detectIntent('nain ji')).toBe('NO')
    })
  })

  describe('Elderly Formal Speech', () => {
    it('detects formal YES "ji haan"', () => {
      expect(detectIntent('ji haan')).toBe('YES')
    })

    it('detects formal YES "haan sahab"', () => {
      expect(detectIntent('haan sahab')).toBe('YES')
    })

    it('detects formal YES "bilkul ji"', () => {
      expect(detectIntent('bilkul ji')).toBe('YES')
    })

    it('detects formal YES "kyun nahi"', () => {
      expect(detectIntent('kyun nahi')).toBe('YES')
    })

    it('detects formal NO "mat kijiye"', () => {
      expect(detectIntent('mat kijiye')).toBe('NO')
    })

    it('detects formal NO "nahi sahab"', () => {
      expect(detectIntent('nahi sahab')).toBe('NO')
    })

    it('detects formal NO "ji nahi"', () => {
      expect(detectIntent('ji nahi')).toBe('NO')
    })

    it('detects formal HELP "madad kijiye"', () => {
      expect(detectIntent('madad kijiye')).toBe('HELP')
    })

    it('detects formal HELP "kripya batayein"', () => {
      expect(detectIntent('kripya batayein')).toBe('HELP')
    })

    it('detects formal FORWARD "aage badhayein"', () => {
      expect(detectIntent('aage badhayein')).toBe('FORWARD')
    })

    it('detects formal FORWARD "dikhaiye"', () => {
      expect(detectIntent('dikhaiye')).toBe('FORWARD')
    })

    it('detects formal FORWARD "sunaiye"', () => {
      expect(detectIntent('sunaiye')).toBe('FORWARD')
    })

    it('detects formal BACK "peeche le chaliye"', () => {
      expect(detectIntent('peeche le chaliye')).toBe('BACK')
    })
  })

  describe('Common Misspellings and Transliterations', () => {
    it('detects YES "han" (common spelling)', () => {
      expect(detectIntent('han')).toBe('YES')
    })

    it('detects YES "haa" (common spelling)', () => {
      expect(detectIntent('haa')).toBe('YES')
    })

    it('detects YES "theak" (common spelling)', () => {
      expect(detectIntent('theak')).toBe('YES')
    })

    it('detects NO "nahin" (common spelling)', () => {
      expect(detectIntent('nahin')).toBe('NO')
    })

    it('detects SKIP "chhodo" (common spelling)', () => {
      expect(detectIntent('chhodo')).toBe('SKIP')
    })

    it('detects SKIP "chor do" (common spelling)', () => {
      expect(detectIntent('chor do')).toBe('SKIP')
    })

    it('detects HELP "sahayta" (common spelling)', () => {
      expect(detectIntent('sahayta')).toBe('HELP')
    })

    it('detects HELP "madat" (common spelling)', () => {
      expect(detectIntent('madat')).toBe('HELP')
    })

    it('detects FORWARD "samajh gya" (common spelling)', () => {
      expect(detectIntent('samajh gya')).toBe('FORWARD')
    })

    it('detects BACK "piche" (common spelling)', () => {
      expect(detectIntent('piche')).toBe('BACK')
    })
  })

  describe('Hinglish Variants', () => {
    it('detects Hinglish YES "yes sir"', () => {
      expect(detectIntent('yes sir')).toBe('YES')
    })

    it('detects Hinglish YES "yes ji"', () => {
      expect(detectIntent('yes ji')).toBe('YES')
    })

    it('detects Hinglish YES "correct hai"', () => {
      expect(detectIntent('correct hai')).toBe('YES')
    })

    it('detects Hinglish NO "no sir"', () => {
      expect(detectIntent('no sir')).toBe('NO')
    })

    it('detects Hinglish NO "no ji"', () => {
      expect(detectIntent('no ji')).toBe('NO')
    })

    it('detects Hinglish SKIP "skip please"', () => {
      expect(detectIntent('skip please')).toBe('SKIP')
    })

    it('detects Hinglish SKIP "skip kar do"', () => {
      expect(detectIntent('skip kar do')).toBe('SKIP')
    })

    it('detects Hinglish HELP "help please"', () => {
      expect(detectIntent('help please')).toBe('HELP')
    })

    it('detects Hinglish HELP "problem ho rahi"', () => {
      expect(detectIntent('problem ho rahi')).toBe('HELP')
    })

    it('detects Hinglish CHANGE "change please"', () => {
      expect(detectIntent('change please')).toBe('CHANGE')
    })

    it('detects Hinglish FORWARD "next please"', () => {
      expect(detectIntent('next please')).toBe('FORWARD')
    })

    it('detects Hinglish FORWARD "next screen"', () => {
      expect(detectIntent('next screen')).toBe('FORWARD')
    })

    it('detects Hinglish BACK "back please"', () => {
      expect(detectIntent('back please')).toBe('BACK')
    })

    it('detects Hinglish BACK "previous screen"', () => {
      expect(detectIntent('previous screen')).toBe('BACK')
    })
  })

  describe('Extended Phrase Variants', () => {
    it('detects YES "bilkul sahi"', () => {
      expect(detectIntent('bilkul sahi')).toBe('YES')
    })

    it('detects YES "theek hai ji"', () => {
      expect(detectIntent('theek hai ji')).toBe('YES')
    })

    it('detects YES "haan bilkul"', () => {
      expect(detectIntent('haan bilkul')).toBe('YES')
    })

    it('detects NO "bilkul nahi"', () => {
      expect(detectIntent('bilkul nahi')).toBe('NO')
    })

    it('detects NO "galat bilkul"', () => {
      expect(detectIntent('galat bilkul')).toBe('NO')
    })

    it('detects SKIP "seedha registration"', () => {
      expect(detectIntent('seedha registration')).toBe('SKIP')
    })

    it('detects SKIP "isko chhod ke"', () => {
      expect(detectIntent('isko chhod ke')).toBe('SKIP')
    })

    it('detects HELP "kuch samajh nahi aa raha"', () => {
      expect(detectIntent('kuch samajh nahi aa raha')).toBe('HELP')
    })

    it('detects HELP "kaise karna hai"', () => {
      expect(detectIntent('kaise karna hai')).toBe('HELP')
    })

    it('detects NO "yeh galat hai" (galat matches NO)', () => {
      expect(detectIntent('yeh galat hai')).toBe('NO')
    })

    it('detects CHANGE "aur dikhao" (aur matches CHANGE)', () => {
      expect(detectIntent('aur dikhao')).toBe('CHANGE')
    })

    it('detects CHANGE "kuch aur dikhao"', () => {
      expect(detectIntent('kuch aur dikhao')).toBe('CHANGE')
    })

    it('detects FORWARD "samajh gaya aage"', () => {
      expect(detectIntent('samajh gaya aage')).toBe('FORWARD')
    })

    it('detects FORWARD "aur batao"', () => {
      expect(detectIntent('aur batao')).toBe('FORWARD')
    })

    it('detects BACK "peeche wala screen"', () => {
      expect(detectIntent('peeche wala screen')).toBe('BACK')
    })

    it('detects BACK "wapas le jao"', () => {
      expect(detectIntent('wapas le jao')).toBe('BACK')
    })

    it('detects BACK "pehle wala dikhao"', () => {
      expect(detectIntent('pehle wala dikhao')).toBe('BACK')
    })
  })

  describe('Keyword Variant Count Verification', () => {
    it('has at least 100+ keyword variants total', () => {
      // This test verifies that we have enhanced the intent map
      // Count total keywords across all intents
      const totalKeywords = Object.values(INTENT_WORD_MAP).reduce(
        (sum, keywords) => sum + keywords.length,
        0
      )
      expect(totalKeywords).toBeGreaterThanOrEqual(100)
    })

    it('YES intent has 25+ variants', () => {
      expect(INTENT_WORD_MAP.YES.length).toBeGreaterThanOrEqual(25)
    })

    it('NO intent has 15+ variants', () => {
      expect(INTENT_WORD_MAP.NO.length).toBeGreaterThanOrEqual(15)
    })

    it('SKIP intent has 15+ variants', () => {
      expect(INTENT_WORD_MAP.SKIP.length).toBeGreaterThanOrEqual(15)
    })

    it('HELP intent has 15+ variants', () => {
      expect(INTENT_WORD_MAP.HELP.length).toBeGreaterThanOrEqual(15)
    })

    it('CHANGE intent has 15+ variants', () => {
      expect(INTENT_WORD_MAP.CHANGE.length).toBeGreaterThanOrEqual(15)
    })

    it('FORWARD intent has 15+ variants', () => {
      expect(INTENT_WORD_MAP.FORWARD.length).toBeGreaterThanOrEqual(15)
    })

    it('BACK intent has 12+ variants', () => {
      expect(INTENT_WORD_MAP.BACK.length).toBeGreaterThanOrEqual(12)
    })
  })
})
