/**
 * Number Word Mapper for Hindi/Bhojpuri/Maithili/Tamil/Telugu/Bengali/etc.
 * Converts spoken number words to digits for mobile numbers, OTPs, and dates
 *
 * CRITICAL USE CASES:
 * - Mobile number: "नौ आठ सात शून्य" → 9870
 * - OTP: "एक चार दो पांच सात नौ" → 142579
 * - Date: "पच्चीस मार्च" → 25 March
 * - Tamil: "ஒன்று இரண்டு மூன்று" → 123
 * - Telugu: "ఒకటి రెండు మూడు" → 123
 * - Bengali: "এক দুই তিন" → 123
 */

// ─────────────────────────────────────────────────────────────
// NUMBER WORD MAPPINGS - ALL INDIAN LANGUAGES
// ─────────────────────────────────────────────────────────────

// Hindi/Devanagari (0-9)
const HINDI_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Hindi/Devanagari (unique keys only)
  'शून्य': '0', 'सिफर': '0', 'जीरो': '0',
  'एक': '1', 'इक': '1', 'एक्': '1',
  'दो': '2', 'दू': '2', 'दु': '2',
  'तीन': '3', 'ती': '3', 'टिन': '3',
  'चार': '4', 'चर': '4',
  'पांच': '5', 'पाँच': '5', 'पंच': '5', 'पाच': '5',
  'छह': '6', 'छ': '6', 'छै': '6',
  'सात': '7', 'सा': '7',
  'आठ': '8', 'अठ': '8',
  'नौ': '9', 'न': '9',

  // English transliterations
  'shoonya': '0', 'shunya': '0', 'zero': '0', 'sifar': '0', 'zee-ro': '0',
  'ek': '1', 'aik': '1', 'one': '1', 'won': '1',
  'do': '2', 'doo': '2', 'two': '2', 'too': '2', 'dui': '2',
  'teen': '3', 'tri': '3', 'three': '3', 'tin': '3',
  'char': '4', 'chaar': '4', 'four': '4', 'for': '4',
  'paanch': '5', 'panch': '5', 'five': '5', 'faiv': '5',
  'chhah': '6', 'chhe': '6', 'chha': '6', 'six': '6', 'siks': '6',
  'saat': '7', 'sath': '7', 'seven': '7', 'sevan': '7',
  'aath': '8', 'ath': '8', 'eight': '8', 'eit': '8',
  'nau': '9', 'nine': '9', 'nain': '9',

  // Bhojpuri variants (unique)
  'नऊ': '9',
  'दुइ': '2',
  'तिन': '3',

  // Maithili variants (unique)
  'तेन': '3',
  'चारि': '4',
}

// ─────────────────────────────────────────────────────────────
// TAMIL NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const TAMIL_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Tamil script
  'பூஜ்யம்': '0', 'சுஜ்ஜியம்': '0',
  'ஒன்று': '1', 'ஒன்ணு': '1',
  'இரண்டு': '2', 'ரெண்டு': '2',
  'மூன்று': '3', 'மூணு': '3',
  'நான்கு': '4', 'நாலு': '4',
  'ஐந்து': '5', 'அஞ்சு': '5',
  'ஆறு': '6',
  'ஏழு': '7',
  'எட்டு': '8',
  'ஒன்பது': '9', 'ஒம்பது': '9',

  // English transliterations
  'poojyam': '0', 'sujjiyam': '0', 'zero': '0',
  'onnu': '1', 'ondru': '1',
  'randu': '2', 'erandu': '2',
  'moonu': '3', 'moondru': '3',
  'naalu': '4', 'naanku': '4',
  'aindhu': '5', 'anju': '5',
  'aaru': '6',
  'yezhu': '7', 'ezhu': '7',
  'ettu': '8',
  'ombathu': '9', 'onbathu': '9',
}

// ─────────────────────────────────────────────────────────────
// TELUGU NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const TELUGU_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Telugu script
  'సున్నా': '0', 'శూన్యం': '0',
  'ఒకటి': '1', 'ఒక్కటి': '1',
  'రెండు': '2',
  'మూడు': '3',
  'నాలుగు': '4',
  'ఐదు': '5',
  'ఆరు': '6',
  'ఏడు': '7',
  'ఎనిమిది': '8',
  'తొమ్మిది': '9',

  // English transliterations
  'sunna': '0', 'soonya': '0', 'zero': '0',
  'okati': '1', 'okkati': '1',
  'rendu': '2',
  'moodu': '3',
  'naalugu': '4',
  'aidu': '5',
  'aaru': '6',
  'eedu': '7',
  'enimidi': '8',
  'tommidi': '9', 'tonmidi': '9',
}

// ─────────────────────────────────────────────────────────────
// BENGALI NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const BENGALI_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Bengali script
  'শূন্য': '0',
  'এক': '1', 'ঐক': '1',
  'দুই': '2', 'দু': '2',
  'তিন': '3',
  'চার': '4',
  'পাঁচ': '5',
  'ছয়': '6',
  'সাত': '7',
  'আট': '8',
  'নয়': '9',

  // English transliterations
  'shunno': '0', 'shunyo': '0', 'zero': '0',
  'ek': '1', 'aik': '1',
  'dui': '2', 'du': '2',
  'tin': '3',
  'char': '4',
  'pach': '5', 'panch': '5',
  'chho': '6', 'cho': '6',
  'sat': '7',
  'aath': '8', 'at': '8',
  'no': '9', 'noy': '9',
}

// ─────────────────────────────────────────────────────────────
// KANNADA NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const KANNADA_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Kannada script
  'ಶೂನ್ಯ': '0',
  'ಒಂದು': '1',
  'ಎರಡು': '2',
  'ಮೂರು': '3',
  'ನಾಲ್ಕು': '4',
  'ಐದು': '5',
  'ಆರು': '6',
  'ಏಳು': '7',
  'ಎಂಟು': '8',
  'ಒಂಬತ್ತು': '9',

  // English transliterations
  'shoonya': '0', 'soonya': '0', 'zero': '0',
  'ondu': '1',
  'eradu': '2',
  'mooru': '3',
  'naalku': '4', 'nalku': '4',
  'aidu': '5',
  'aaru': '6',
  'yelu': '7', 'elu': '7',
  'entu': '8',
  'ombattu': '9', 'ombathu': '9',
}

// ─────────────────────────────────────────────────────────────
// MALAYALAM NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const MALAYALAM_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Malayalam script
  'പൂജ്യം': '0',
  'ഒന്ന്': '1',
  'രണ്ട്': '2',
  'മൂന്ന്': '3',
  'നാല്': '4',
  'അഞ്ച്': '5',
  'ആറ്': '6',
  'ഏഴ്': '7',
  'എട്ട്': '8',
  'ഒമ്പത്': '9',

  // English transliterations
  'poojyam': '0', 'zero': '0',
  'onnu': '1',
  'randu': '2',
  'moonnu': '3',
  'naalu': '4',
  'anchu': '5',
  'aaru': '6',
  'yezu': '7', 'elu': '7',
  'ettu': '8',
  'ombathu': '9',
}

// ─────────────────────────────────────────────────────────────
// MARATHI NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const MARATHI_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Marathi/Devanagari
  'शून्य': '0',
  'एक': '1',
  'दोन': '2',
  'तीन': '3',
  'चार': '4',
  'पाच': '5',
  'सहा': '6',
  'सात': '7',
  'आठ': '8',
  'नऊ': '9',

  // English transliterations
  'shunya': '0', 'zero': '0',
  'ek': '1',
  'don': '2',
  'teen': '3',
  'char': '4',
  'paach': '5',
  'saha': '6',
  'saat': '7',
  'nau': '9',
}

// ─────────────────────────────────────────────────────────────
// GUJARATI NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const GUJARATI_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Gujarati script
  'શૂન્ય': '0',
  'એક': '1',
  'બે': '2',
  'ત્રણ': '3',
  'ચાર': '4',
  'પાંચ': '5',
  'છ': '6',
  'સાત': '7',
  'આઠ': '8',
  'નવ': '9',

  // English transliterations
  'shunya': '0', 'zero': '0',
  'ek': '1',
  'be': '2',
  'tran': '3', 'trann': '3',
  'chaar': '4',
  'paanch': '5',
  'chh': '6',
  'saat': '7',
  'aath': '8',
  'nav': '9',
}

// ─────────────────────────────────────────────────────────────
// PUNJABI NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const PUNJABI_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Punjabi/Gurmukhi
  'ਸਿਫਰ': '0', 'ਸੂਨਿਆ': '0',
  'ਇੱਕ': '1',
  'ਦੋ': '2',
  'ਤਿੰਨ': '3',
  'ਚਾਰ': '4',
  'ਪੰਜ': '5',
  'ਛੇ': '6',
  'ਸੱਤ': '7',
  'ਅੱਠ': '8',
  'ਨੌਂ': '9',

  // English transliterations
  'sifar': '0', 'sooniya': '0', 'zero': '0',
  'ikk': '1', 'ik': '1',
  'do': '2',
  'tin': '3', 'tinn': '3',
  'chaar': '4',
  'panj': '5',
  'chhe': '6',
  'satt': '7',
  'atth': '8',
  'naun': '9', 'na': '9',
}

// ─────────────────────────────────────────────────────────────
// ODIA NUMBER WORDS (0-9)
// ─────────────────────────────────────────────────────────────

const ODIA_NUMBER_WORDS: Record<string, string> = {
  // 0-9 in Odia script
  'ଶୂନ୍ୟ': '0',
  'ଗୋଟିଏ': '1', 'ଏକ': '1',
  'ଦୁଇ': '2',
  'ତିନି': '3',
  'ଚାରି': '4',
  'ପାଞ୍ଚ': '5',
  'ଛଅ': '6',
  'ସାତ': '7',
  'ଆଠ': '8',
  'ନଅ': '9',

  // English transliterations
  'shunya': '0', 'zero': '0',
  'gotie': '1', 'ek': '1',
  'dui': '2',
  'tini': '3',
  'chari': '4',
  'pancha': '5',
  'chha': '6',
  'saata': '7',
  'aatha': '8',
  'naa': '9',
}

// Combined map for all Indian languages
const ALL_NUMBER_WORDS: Record<string, string> = {
  ...HINDI_NUMBER_WORDS,
  ...TAMIL_NUMBER_WORDS,
  ...TELUGU_NUMBER_WORDS,
  ...BENGALI_NUMBER_WORDS,
  ...KANNADA_NUMBER_WORDS,
  ...MALAYALAM_NUMBER_WORDS,
  ...MARATHI_NUMBER_WORDS,
  ...GUJARATI_NUMBER_WORDS,
  ...PUNJABI_NUMBER_WORDS,
  ...ODIA_NUMBER_WORDS,
}

// Date number words (1-31)
const DATE_NUMBER_WORDS: Record<string, string> = {
  'एक': '1', 'पहला': '1', 'first': '1',
  'दो': '2', 'दूसरा': '2', 'second': '2',
  'तीन': '3', 'तीसरा': '3', 'third': '3',
  'चार': '4', 'चौथा': '4', 'fourth': '4',
  'पांच': '5', 'पांचवां': '5', 'fifth': '5',
  'छह': '6', 'छठा': '6', 'sixth': '6',
  'सात': '7', 'सातवां': '7', 'seventh': '7',
  'आठ': '8', 'आठवां': '8', 'eighth': '8',
  'नौ': '9', 'नौवां': '9', 'ninth': '9',
  'दस': '10', 'दसवां': '10', 'tenth': '10',
  'ग्यारह': '11', 'ग्यारहवां': '11', 'eleventh': '11',
  'बारह': '12', 'बारहवां': '12', 'twelfth': '12',
  'तेरह': '13', 'तेरहवां': '13',
  'चौदह': '14', 'चौदहवां': '14',
  'पंद्रह': '15', 'पंद्रहवां': '15',
  'सोलह': '16', 'सोलहवां': '16',
  'सत्रह': '17', 'सत्रहवां': '17',
  'अठारह': '18', 'अठारहवां': '18',
  'उन्नीस': '19', 'उन्नीसवां': '19',
  'बीस': '20', 'बीसवां': '20',
  'इक्कीस': '21', 'इक्कीसवां': '21',
  'बाईस': '22', 'बाईसवां': '22',
  'तेईस': '23', 'तेईसवां': '23',
  'चौबीस': '24', 'चौबीसवां': '24',
  'पच्चीस': '25', 'पच्चीसवां': '25',
  'छब्बीस': '26', 'छब्बीसवां': '26',
  'सत्ताईस': '27', 'सत्ताईसवां': '27',
  'अट्ठाईस': '28', 'अट्ठाईसवां': '28',
  'उनतीस': '29', 'उनतीसवां': '29',
  'तीस': '30', 'तीसवां': '30',
  'इकतीस': '31', 'इकतीसवां': '31',

  // English transliterations
  'ek': '1', 'pehla': '1',
  'do': '2', 'dusra': '2',
  'teen': '3', 'teesra': '3',
  'chaar': '4', 'chautha': '4',
  'paanch': '5', 'paanchwan': '5',
  'chhah': '6', 'chhatha': '6',
  'saat': '7', 'saatwan': '7',
  'aath': '8', 'aathwan': '8',
  'nau': '9', 'nauwan': '9',
  'das': '10', 'daswan': '10',
  'gyarah': '11', 'gyarahwan': '11',
  'baarah': '12', 'baarahwan': '12',
  'terah': '13', 'terahwan': '13',
  'chaudah': '14', 'chaudahwan': '14',
  'pandrah': '15', 'pandrahwan': '15',
  'solah': '16', 'solahwan': '16',
  'satrah': '17', 'satrahwan': '17',
  'atharah': '18', 'atharahwan': '18',
  'unnees': '19', 'unneeswan': '19',
  'bees': '20', 'beeswan': '20',
  'ikkis': '21', 'ikkiswan': '21',
  'baais': '22', 'baaiswan': '22',
  'teis': '23', 'teiswan': '23',
  'chaubis': '24', 'chaubiswan': '24',
  'pachchees': '25', 'pachcheeswan': '25',
  'chhabbis': '26', 'chhabbiswan': '26',
  'sattais': '27', 'sattaiswan': '27',
  'aththais': '28', 'aththaiswan': '28',
  'untis': '29', 'untiswan': '29',
  'tees': '30', 'teeswan': '30',
  'iktis': '31', 'iktiswan': '31',
}

// Month mappings
const MONTH_MAPPINGS: Record<string, string> = {
  'जनवरी': 'January', 'january': 'January', 'jan': 'January',
  'फरवरी': 'February', 'february': 'February', 'feb': 'February',
  'मार्च': 'March', 'march': 'March', 'mar': 'March',
  'अप्रैल': 'April', 'april': 'April', 'apr': 'April',
  'मई': 'May', 'may': 'May',
  'जून': 'June', 'june': 'June', 'jun': 'June',
  'जुलाई': 'July', 'july': 'July', 'jul': 'July',
  'अगस्त': 'August', 'august': 'August', 'aug': 'August',
  'सितंबर': 'September', 'सितम्बर': 'September', 'september': 'September', 'sep': 'September',
  'अक्टूबर': 'October', 'october': 'October', 'oct': 'October',
  'नवंबर': 'November', 'नवम्बर': 'November', 'november': 'November', 'nov': 'November',
  'दिसंबर': 'December', 'दिसम्बर': 'December', 'december': 'December', 'dec': 'December',
}

// ─────────────────────────────────────────────────────────────
// MAIN CONVERSION FUNCTION
// ─────────────────────────────────────────────────────────────

export interface NumberConversionResult {
  digits: string;
  originalText: string;
  confidence: number;
  extractedNumbers: string[];
}

/**
 * Convert number words to digits based on context
 * Supports Hindi, Bhojpuri, Maithili, Tamil, Telugu, Bengali, Kannada,
 * Malayalam, Marathi, Gujarati, Punjabi, and Odia
 */
export function convertNumberWordsToDigits(
  text: string,
  context: 'mobile' | 'otp' | 'date' | 'general' = 'general'
): NumberConversionResult {
  if (!text || typeof text !== 'string') {
    return { digits: '', originalText: '', confidence: 0, extractedNumbers: [] };
  }

  let processedText = text.trim().toLowerCase();
  const extractedNumbers: string[] = [];
  let confidence = 1.0;

  // Step 1: Strip context-specific preambles
  if (context === 'mobile') {
    processedText = stripMobilePreambles(processedText);
  } else if (context === 'otp') {
    processedText = stripOTPPreambles(processedText);
  } else if (context === 'date') {
    processedText = stripDatePreambles(processedText);
  }

  // Step 2: Extract and convert number words
  const words = processedText.split(/[\s,]+/).filter(w => w.length > 0);
  let digitSequence = '';

  for (const word of words) {
    // Try ALL_NUMBER_WORDS first (includes all languages)
    const digit = ALL_NUMBER_WORDS[word] || DATE_NUMBER_WORDS[word];

    if (digit) {
      digitSequence += digit;
      extractedNumbers.push(digit);
    } else {
      const numericMatch = word.match(/\d+/);
      if (numericMatch) {
        digitSequence += numericMatch[0];
        extractedNumbers.push(numericMatch[0]);
      }
    }
  }

  // Step 3: Context-specific validation
  if (context === 'mobile') {
    digitSequence = validateMobileNumber(digitSequence);
    confidence = digitSequence.length === 10 ? 1.0 : 0.5;
  } else if (context === 'otp') {
    digitSequence = validateOTP(digitSequence);
    confidence = digitSequence.length === 6 ? 1.0 : 0.5;
  } else if (context === 'date') {
    digitSequence = processDateContext(digitSequence, processedText);
  }

  return {
    digits: digitSequence,
    originalText: text,
    confidence,
    extractedNumbers,
  };
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function stripMobilePreambles(text: string): string {
  text = text.replace(/^(mera number|hamara number|number|ye number|is number|mera mobile|phone number|mobile|cell number|mobile number)\s*/gi, '');
  text = text.replace(/^(my number|phone number|mobile number|number is)\s*/gi, '');
  text = text.replace(/^(\+91|91|plus 91|plus91)\s*/gi, '');
  return text;
}

function stripOTPPreambles(text: string): string {
  text = text.replace(/^(otp|code|verification code|otp code|your otp|otp hai|code hai)\s*/gi, '');
  return text;
}

function stripDatePreambles(text: string): string {
  text = text.replace(/^(date|tarikh|date hai|tarikh hai|on|ko)\s*/gi, '');
  return text;
}

function validateMobileNumber(digits: string): string {
  const numericOnly = digits.replace(/[^0-9]/g, '');

  if (numericOnly.length === 12 && numericOnly.startsWith('91')) {
    return numericOnly.slice(2);
  }

  if (numericOnly.length === 13 && numericOnly.startsWith('91')) {
    return numericOnly.slice(3);
  }

  return numericOnly.slice(0, 10);
}

function validateOTP(digits: string): string {
  const numericOnly = digits.replace(/[^0-9]/g, '');
  return numericOnly.slice(0, 6);
}

function processDateContext(digits: string, originalText: string): string {
  const monthMatch = Object.keys(MONTH_MAPPINGS).find(month =>
    originalText.toLowerCase().includes(month.toLowerCase())
  );

  const monthName = monthMatch ? MONTH_MAPPINGS[monthMatch] : '';

  if (monthName && digits) {
    return `${digits} ${monthName}`;
  }

  return digits;
}

// ─────────────────────────────────────────────────────────────
// CONVENIENCE FUNCTIONS
// ─────────────────────────────────────────────────────────────

export function extractMobileNumber(text: string): string {
  const result = convertNumberWordsToDigits(text, 'mobile');
  return result.digits;
}

export function extractOTP(text: string): string {
  const result = convertNumberWordsToDigits(text, 'otp');
  return result.digits;
}

export function extractDate(text: string): string {
  const result = convertNumberWordsToDigits(text, 'date');
  return result.digits;
}

export function getMonthName(input: string): string | null {
  const normalized = input.toLowerCase().trim();

  for (const [hindiMonth, englishMonth] of Object.entries(MONTH_MAPPINGS)) {
    if (normalized.includes(hindiMonth.toLowerCase()) || normalized === hindiMonth.toLowerCase()) {
      return englishMonth;
    }
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  for (const month of months) {
    if (normalized.includes(month.toLowerCase())) {
      return month;
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE DETECTION HELPER
// ─────────────────────────────────────────────────────────────

/**
 * Detect language from transcript based on number words used
 */
export function detectLanguageFromNumbers(text: string): string | null {
  const normalized = text.toLowerCase();
  
  // Check for Tamil number words
  if (Object.keys(TAMIL_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Tamil';
  }
  
  // Check for Telugu number words
  if (Object.keys(TELUGU_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Telugu';
  }
  
  // Check for Bengali number words
  if (Object.keys(BENGALI_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Bengali';
  }
  
  // Check for Kannada number words
  if (Object.keys(KANNADA_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Kannada';
  }
  
  // Check for Malayalam number words
  if (Object.keys(MALAYALAM_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Malayalam';
  }
  
  // Check for Marathi number words
  if (Object.keys(MARATHI_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Marathi';
  }
  
  // Check for Gujarati number words
  if (Object.keys(GUJARATI_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Gujarati';
  }
  
  // Check for Punjabi number words
  if (Object.keys(PUNJABI_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Punjabi';
  }
  
  // Check for Odia number words
  if (Object.keys(ODIA_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Odia';
  }
  
  // Default to Hindi if Hindi number words detected
  if (Object.keys(HINDI_NUMBER_WORDS).some(word => normalized.includes(word.toLowerCase()))) {
    return 'Hindi';
  }
  
  return null;
}
