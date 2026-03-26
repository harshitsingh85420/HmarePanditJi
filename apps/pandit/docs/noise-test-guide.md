# Noise Environment Testing Guide

This document describes how to test the voice system in various noise environments.

## Test Audio Library

Test audio files should be placed in `src/test/audio/`:

| File | Environment | dB Level | Description |
|------|-------------|----------|-------------|
| `silence.wav` | Silence | 0-20dB | Near-silent environment |
| `quiet-room.wav` | Quiet Room | 20-40dB | Typical indoor quiet space |
| `conversation.wav` | Conversation | 40-60dB | Normal conversation level |
| `temple-bells.wav` | Temple Bells | 60-75dB | Religious environment with bells |
| `heavy-traffic.wav` | Heavy Traffic | 75-85dB | Busy street noise |
| `extreme-noise.wav` | Extreme Noise | 85-100dB | Very loud environment |

## Noise Threshold Behavior

The voice system has an 85dB threshold:

- **< 85dB**: Voice recognition enabled
- **> 85dB**: Keyboard fallback suggested

## Manual Testing Procedure

### Step 1: Prepare Test Environment

1. Connect device to speakers
2. Open Chrome DevTools → Console
3. Navigate to voice input screen

### Step 2: Play Background Noise

```javascript
// In browser console
const audio = new Audio('/src/test/audio/conversation.wav');
audio.loop = true;
audio.play();
```

### Step 3: Test Voice Phrases

Speak each phrase and record STT result:

| Phrase Type | Test Phrase (Hindi) | Expected Output |
|-------------|---------------------|-----------------|
| Mobile | "मेरा नंबर नौ आठ सात शून्य है" | 9870 |
| OTP | "एक चार दो पांच सात नौ" | 142579 |
| Name | "रमेश शर्मा" | रमेश शर्मा |
| Yes | "हाँ" | yes |
| No | "नहीं" | no |

### Step 4: Record Results

For each environment, record:
- Background dB level
- Voice accuracy (%)
- Whether keyboard was triggered
- Any errors or issues

## Expected Results

| Environment | dB Level | Voice Accuracy | Keyboard Triggered |
|-------------|----------|----------------|-------------------|
| Silence | 0-20dB | 100% | No |
| Quiet Room | 20-40dB | 100% | No |
| Conversation | 40-60dB | 95% | No |
| Temple Bells | 60-75dB | 85% | No |
| Heavy Traffic | 75-85dB | 70% | No |
| Extreme Noise | 85-100dB | N/A | Yes |

## Device-Specific Testing

Test on the following devices:

| Device | OS | Browser | Notes |
|--------|----|---------|-------|
| Galaxy S21 | Android 13 | Chrome 120 | Primary test device |
| Galaxy A12 | Android 11 | Chrome 108 | Budget Android |
| iPhone 12 | iOS 17 | Safari 17 | iOS testing |
| iPhone SE | iOS 15 | Safari 15 | Older iOS |
| Desktop | Windows 11 | Chrome 120 | Desktop baseline |

## Automated Noise Testing (Optional)

For automated testing, use virtual audio cable:

1. Install VB-Cable or similar
2. Set virtual cable as default input
3. Play test audio through cable
4. Run voice recognition tests
5. Compare results

## Troubleshooting

### Issue: Voice not recognized in quiet environment
- Check microphone permissions
- Verify microphone is not muted
- Check browser console for errors

### Issue: Keyboard not triggering in loud environment
- Verify ambient noise detection is enabled
- Check dB threshold setting (default 85dB)
- Test with known loud audio file

### Issue: Inconsistent results
- Run multiple tests (minimum 5 per environment)
- Average the results
- Note any patterns in failures
