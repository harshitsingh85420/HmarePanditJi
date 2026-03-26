/**
 * Number Word Mapper for Hindi/Bhojpuri/Maithili
 * Converts spoken number words to digits for mobile numbers, OTPs, and dates
 * 
 * CRITICAL USE CASES:
 * - Mobile number: "नौ आठ सात शून्य" → 9870
 * - OTP: "एक चार दो पांच सात नौ" → 142579
 * - Date: "पच्चीस मार्च" → 25 March
 */

// ─────────────────────────────────────────────────────────────
// NUMBER WORD MAPPINGS
// ─────────────────────────────────────────────────────────────

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
    const digit = HINDI_NUMBER_WORDS[word] || DATE_NUMBER_WORDS[word];
    
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
