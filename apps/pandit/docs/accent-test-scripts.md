# Accent Testing Scripts

This document contains test phrases for accent testing across Hindi, Bhojpuri, Maithili, and Hinglish.

## Test Phrase Library

### Hindi (Standard)

**Mobile Number Dictation:**
- "नमस्ते, मेरा नाम रमेश शर्मा है"
- "मेरा मोबाइल नंबर नौ आठ सात शून्य है"
- "फोन नंबर है नौ आठ सात शून्य एक दो तीन चार"

**OTP Dictation:**
- "OTP है एक चार दो पांच सात नौ"
- "वेरिफिकेशन कोड एक दो तीन चार पांच छह"

**Name Dictation:**
- "रमेश शर्मा"
- "अमित कुमार"
- "प्रिया सिंह"

**Yes/No Responses:**
- "हाँ"
- "नहीं"
- "जी हाँ"
- "जी नहीं"

### Bhojpuri

**Mobile Number Dictation:**
- "नमस्कार, हमर नाम रमेश शर्मा बा"
- "हमर फोन नंबर नऊ आठ सात सिफर बा"
- "मोबाइल नंबर दुइ तीन चार पांच छह सात"

**OTP Dictation:**
- "OTP बा एक दुइ तीन चार पांच छह"
- "कोड बा नऊ आठ सात शून्य एक दुइ"

**Name Dictation:**
- "रमेश शर्मा"
- "अमित कुमार"
- "दीपक पासवान"

**Yes/No Responses:**
- "हाँ"
- "नहीं"
- "हौ"
- "ना"

### Maithili

**Mobile Number Dictation:**
- "नमस्कार, हमर नाम रमेश शर्मा छि"
- "हमर फोन नंबर एक दुइ तीन चार छि"
- "मोबाइल नंबर पांच छह सात आठ नौ शून्य"

**OTP Dictation:**
- "OTP छि एक चारि दुइ पांच सात नौ"
- "कोड छि दुइ तीन चारि पांच छह सात"

**Name Dictation:**
- "रमेश शर्मा"
- "अमित कुमार"
- "नीलम झा"

**Yes/No Responses:**
- "हाँ"
- "नहीं"
- "हौ"
- "नहि"

### Hinglish (Code-mixed)

**Mobile Number Dictation:**
- "Hello, mera name रमेश शर्मा hai"
- "Mera mobile number नौ आठ सात zero hai"
- "Phone number है 9870 एक दो three four"

**OTP Dictation:**
- "OTP hai एक four दो paanch सात nine"
- "Verification code hai 123456"

**Name Dictation:**
- "रमेश शर्मा"
- "Amit Kumar"
- "प्रिया Singh"

**Yes/No Responses:**
- "Haan"
- "Nahi"
- "Yes"
- "No"

## Word Error Rate (WER) Calculation

Formula:
```
WER = (Substitutions + Deletions + Insertions) / Total Words
```

### Target WER by Language

| Language | Target WER | Pass Rate |
|----------|------------|-----------|
| Hindi | <10% | 95% |
| Bhojpuri | <20% | 85% |
| Maithili | <20% | 85% |
| Hinglish | <15% | 90% |

## Test Procedure

### Step 1: Record Audio

For each accent:
1. Recruit 5 native speakers
2. Have each speaker record all test phrases
3. Save files as: `{accent}_{speaker}_{phrase_type}.wav`

### Step 2: Run Through STT

```typescript
import { processSpeech } from './sarvamSTT';

const result = await processSpeech(audioFile);
const wer = calculateWER(expected, result.transcript);
```

### Step 3: Calculate WER

```typescript
function calculateWER(expected: string, actual: string): number {
  const expectedWords = expected.toLowerCase().split(/\s+/);
  const actualWords = actual.toLowerCase().split(/\s+/);
  
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;
  
  // Simple WER calculation
  const maxLen = Math.max(expectedWords.length, actualWords.length);
  for (let i = 0; i < maxLen; i++) {
    if (expectedWords[i] !== actualWords[i]) {
      if (!expectedWords[i]) insertions++;
      else if (!actualWords[i]) deletions++;
      else substitutions++;
    }
  }
  
  return (substitutions + deletions + insertions) / expectedWords.length;
}
```

### Step 4: Record Results

| Speaker | Accent | Phrase Type | Expected | Actual | WER | Pass/Fail |
|---------|--------|-------------|----------|--------|-----|-----------|
| S1 | Hindi | Mobile | 9870123456 | 9870123456 | 0% | ✅ |
| S2 | Bhojpuri | Mobile | 9870123456 | 9870123456 | 0% | ✅ |

## Recording Guidelines

1. **Environment:** Quiet room (20-40dB background)
2. **Distance:** 15-30cm from microphone
3. **Pace:** Natural speaking speed
4. **Volume:** Normal conversation level
5. **Format:** WAV, 16kHz, 16-bit mono

## Speaker Demographics

| ID | Age | Gender | Region | Native Language |
|----|-----|--------|--------|-----------------|
| S1 | 25-35 | M | Delhi | Hindi |
| S2 | 25-35 | F | Delhi | Hindi |
| S3 | 35-45 | M | Patna | Bhojpuri |
| S4 | 35-45 | F | Patna | Bhojpuri |
| S5 | 25-35 | M | Darbhanga | Maithili |
| S6 | 25-35 | F | Darbhanga | Maithili |
| S7 | 25-35 | M | Mumbai | Hinglish |
| S8 | 25-35 | F | Bangalore | Hinglish |
