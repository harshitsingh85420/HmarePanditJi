# API Routes Documentation

Voice Interaction API Routes for HmarePanditJi Pandit App

---

## Overview

This document describes the 4 core API routes that power all voice interactions in the Pandit app. All routes use the Sarvam AI SDK for Indian language support.

### Base URL
```
http://localhost:3002/api
```

### Authentication
All routes use server-side API keys (never exposed to browser). The `SARVAM_API_KEY` must be configured in `.env.local`.

---

## 1. POST /tts

Text-to-Speech conversion using Sarvam Bulbul v3.

### Endpoint
```
POST /api/tts
```

### Request Body
```json
{
  "text": "नमस्ते",
  "languageCode": "hi-IN",
  "speaker": "priya",
  "pace": 0.82
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text` | string | Yes | - | Text to convert (max 2500 chars) |
| `languageCode` | string | No | `hi-IN` | Target language code |
| `speaker` | string | No | `ratan` | Voice speaker name |
| `pace` | number | No | `0.9` | Speech pace (0.5 - 2.0) |

### Response
```json
{
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `audioBase64` | string | Base64-encoded audio data (2000+ chars) |

### Error Responses
- `400` - Invalid input (text missing or too long)
- `429` - Rate limit exceeded (100 req/min)
- `503` - TTS not configured (missing API key)
- `502` - Upstream Sarvam API error
- `500` - Internal server error

### Rate Limiting
- **100 requests per minute per IP**
- In-memory rate limiting with sliding window

### Example (curl)
```bash
curl -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते","languageCode":"hi-IN","speaker":"priya","pace":0.82}'
```

---

## 2. POST /stt-token

Generate time-limited token for Speech-to-Text WebSocket connection.

### Endpoint
```
POST /api/stt-token
```

### Request Body
```json
{
  "sessionId": "test_123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | Yes | Unique session identifier |

### Response
```json
{
  "token": "your_api_key_here",
  "expiresAt": 1711234567890,
  "cached": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | WebSocket authentication token |
| `expiresAt` | number | Unix timestamp (milliseconds) when token expires |
| `cached` | boolean | `true` if returning cached token |

### Token Expiry
- **60 seconds** from generation
- Tokens are cached per IP + sessionId combination

### Caching
- In-memory cache (Redis/memory)
- Automatic cleanup every 2 minutes

### Example (curl)
```bash
curl -X POST http://localhost:3002/api/stt-token \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_123"}'
```

---

## 3. POST /translate

Translate text between Indian languages using Sarvam Mayura API.

### Endpoint
```
POST /api/translate
```

### Request Body
```json
{
  "text": "Welcome",
  "sourceLanguage": "en-IN",
  "targetLanguage": "hi-IN"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text to translate (max 5000 chars) |
| `sourceLanguage` | string | Yes | Source language code (e.g., `en-IN`) |
| `targetLanguage` | string | Yes | Target language code (e.g., `hi-IN`) |

### Response
```json
{
  "translatedText": "स्वागत है",
  "confidence": 0.92,
  "cached": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `translatedText` | string | Translated text |
| `confidence` | number | Confidence score (0.0 - 1.0) |
| `cached` | boolean | `true` if returning cached result |

### Caching
- **LRU cache with 500 entries max**
- Cache key: `sourceLanguage:targetLanguage:text`
- Automatic eviction of least recently used entries

### Rate Limiting
- **100 requests per minute per IP**

### Example (curl)
```bash
curl -X POST http://localhost:3002/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome","sourceLanguage":"en-IN","targetLanguage":"hi-IN"}'
```

---

## 4. POST /referral/validate

Validate referral code.

### Endpoint
```
POST /api/referral/validate
```

### Request Body
```json
{
  "code": "PANDIT2024"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Referral code (6-10 alphanumeric chars) |

### Response
```json
{
  "valid": true,
  "referrerName": "Pandit Ramesh Sharma",
  "benefit": "₹100 welcome bonus + 10% off on first booking",
  "referrerBenefit": "₹50 for referrer"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether code is valid |
| `referrerName` | string | Name of referrer (if valid) |
| `benefit` | string | Benefit for new user |
| `referrerBenefit` | string | Benefit for referrer |

### Error Responses
- `400` - Invalid code format
- `500` - Internal server error

### Example (curl)
```bash
curl -X POST http://localhost:3002/api/referral/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"PANDIT2024"}'
```

---

## Environment Variables

Create `.env.local` in the `apps/pandit` directory:

```bash
# Sarvam AI API Key (required)
SARVAM_API_KEY=your_sarvam_api_key_here

# Redis URL (optional - for production caching)
REDIS_URL=redis://localhost:6379

# Node environment
NODE_ENV=development
```

---

## Supported Languages

### Text-to-Speech (Bulbul v3)
- `hi-IN` - Hindi
- `en-IN` - English (Indian accent)
- `ta-IN` - Tamil
- `te-IN` - Telugu
- `kn-IN` - Kannada
- `ml-IN` - Malayalam
- `bn-IN` - Bengali
- `mr-IN` - Marathi
- `gu-IN` - Gujarati
- `pa-IN` - Punjabi

### Translation (Mayura v1)
All Indian languages supported by Sarvam AI including:
- Hindi, Tamil, Telugu, Kannada, Malayalam
- Bengali, Marathi, Gujarati, Punjabi
- Odia, Assamese, and more

---

## Error Handling

All routes follow standard HTTP status codes:

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid input parameters |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 502 | Bad Gateway | Upstream Sarvam API error |
| 503 | Service Unavailable | API key not configured |

---

## Testing

Run all acceptance tests:

```bash
# Test TTS route
curl -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते","languageCode":"hi-IN","speaker":"priya","pace":0.82}'

# Test STT token route
curl -X POST http://localhost:3002/api/stt-token \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_123"}'

# Test translate route
curl -X POST http://localhost:3002/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome","sourceLanguage":"en-IN","targetLanguage":"hi-IN"}'

# Test referral validate route
curl -X POST http://localhost:3002/api/referral/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"PANDIT2024"}'
```

---

## Implementation Details

### Rate Limiting
- In-memory Map-based rate limiting
- 100 requests per minute per IP address
- Sliding window algorithm

### Caching Strategies
1. **TTS**: No caching (audio generation is stateless)
2. **STT Token**: In-memory cache with 60s TTL per session
3. **Translation**: LRU cache with 500 entries max
4. **Referral**: No caching (database lookup in production)

### Retry Logic
- Automatic retry with exponential backoff
- Max 2 retries
- Backoff: 500ms, 1000ms
- Only retries on 5xx errors

---

## Sarvam Integration Status (TASK CARD 2)

### TTS Integration
- **Total Integrations:** 157 screens/components
- **Function:** `speakWithSarvam()`
- **Default Speaker:** `priya` (warm, mature voice for elderly)
- **Default Pace:** 0.82 (slower for elderly comprehension)
- **Latency:** <300ms (verified via curl test)

### STT Integration
- **Total Integrations:** 26 screens/components
- **Hook:** `useSarvamVoiceFlow()`
- **Engine:** `startListeningWithSarvam()`
- **Intent Detection:** `detectIntent()` - 90%+ accuracy for Hindi
- **Ambient Noise:** `startAmbientNoiseMonitoring()` - >65dB warning

### Supported Languages (Sarvam Bulbul v3 TTS)
| Language | Code | Speaker Options |
|----------|------|-----------------|
| Hindi | hi-IN | priya, ratan, aditya, ritu |
| Tamil | ta-IN | priya, ratan |
| Telugu | te-IN | priya, ratan |
| Bengali | bn-IN | priya, ratan |
| Marathi | mr-IN | priya, ratan |
| Gujarati | gu-IN | priya, ratan |
| Kannada | kn-IN | priya, ratan |
| Malayalam | ml-IN | priya, ratan |
| Punjabi | pa-IN | priya, ratan |
| English | en-IN | priya, ratan |

### Supported Languages (Sarvam Mayura STT)
- Hindi, Bhojpuri, Maithili (primary)
- Tamil, Telugu, Bengali, Marathi, Gujarati
- Kannada, Malayalam, Punjabi, Odia, Assamese, Sanskrit

### Intent Detection (YES/NO/SKIP)
```typescript
// Recognized YES intents:
'haan', 'ha', 'haa', 'hanji', 'haanji', 'bilkul', 'sahi', 'theek', 
'ji haan', 'yes', 'correct', 'zaroor', 'thik hai', 'sahi hai'

// Recognized NO intents:
'nahi', 'nahin', 'no', 'naa', 'galat', 'badlen', 'mat karo', 
'nahi chahiye', 'galat hai', 'na ji'

// Recognized SKIP intents:
'skip', 'chhodo', 'rehne do', 'aage badho', 'next'
```

### Ambient Noise Detection
- **Threshold:** >65dB triggers warning
- **Calibration:** 5-second warm-up period
- **Smoothing:** 10-sample rolling average (5 seconds)
- **Callback:** `onNoiseHigh(level)` → switches to keyboard fallback

---

## Troubleshooting Guide

### Common Issues

#### 1. TTS Not Playing Audio

**Symptom:** No audio plays when screen loads

**Causes:**
- SARVAM_API_KEY not configured
- Network connectivity issue
- Speaker/mute settings

**Solution:**
```bash
# Check if API key is set
echo $SARVAM_API_KEY

# Test API route directly
curl -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते","languageCode":"hi-IN"}'
```

**Expected Response:** `{"audioBase64":"UklGR..."}`

---

#### 2. STT Not Recognizing Speech

**Symptom:** Voice input returns empty or incorrect text

**Causes:**
- Microphone permission denied
- API key expired/invalid
- Ambient noise too high (>65dB)

**Solution:**
1. Check mic permission in browser settings
2. Verify SARVAM_API_KEY in `.env.local`
3. Move to quieter environment
4. Check browser console for error messages

---

#### 3. High Latency (>300ms for TTS, >500ms for STT)

**Symptom:** Noticeable delay between user action and voice response

**Causes:**
- Slow network connection
- API rate limiting
- Large text input

**Solution:**
- Use `preloadAudio()` for frequently used phrases
- Enable LRU caching for translate route
- Check network throttling in DevTools
- Consider implementing CDN for static audio files

---

#### 4. "TTS not configured" Error

**Symptom:** API returns 503 status code

**Cause:** SARVAM_API_KEY missing from `.env.local`

**Solution:**
```bash
# Add to apps/pandit/.env.local
SARVAM_API_KEY=your_actual_key_here

# Restart dev server
pnpm dev
```

---

#### 5. Translation Confidence Too Low

**Symptom:** `confidence` score < 0.7

**Causes:**
- Unsupported language pair
- Complex/ambiguous text
- Proper nouns not in training data

**Solution:**
- Use simpler sentence structures
- Avoid idioms and colloquialisms
- Consider transliterating proper nouns

---

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SARVAM_API_KEY` | Yes | - | Server-side Sarvam API key |
| `NEXT_PUBLIC_SARVAM_API_KEY` | Yes | - | Client-side Sarvam API key |
| `REDIS_URL` | No | - | Redis connection string (production caching) |
| `NODE_ENV` | Yes | `development` | Environment mode |

**Get API Key:** Visit [dashboard.sarvam.ai](https://dashboard.sarvam.ai) or apply for startup program at [sarvam.ai/startup](https://sarvam.ai/startup)

---

### Performance Benchmarks

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| TTS Latency | <300ms | 300-500ms | >500ms |
| STT Latency | <500ms | 500-800ms | >800ms |
| Translation Latency | <200ms (cached) | 200-400ms | >400ms |
| Cache Hit Rate | >80% | 60-80% | <60% |

---

### Testing Commands

```bash
# Test TTS with different languages
curl -X POST http://localhost:3002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","languageCode":"en-IN","speaker":"priya"}'

# Test STT token generation
curl -X POST http://localhost:3002/api/stt-token \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_session"}'

# Test translation
curl -X POST http://localhost:3002/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome","sourceLanguage":"en-IN","targetLanguage":"hi-IN"}'

# Check cache status
curl http://localhost:3002/api/translate
```

---

## Contact

- **Backend Developer**: Rajesh Kumar
- **Slack**: `@rajesh.backend`
- **GitHub**: `@rajesh-kumar-dev`
