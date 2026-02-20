/**
 * HmarePanditJi — Bhashini Voice AI Service
 *
 * PANDIT UI RULE (Master Rule #9):
 * Every screen in the Pandit app must have a voice button.
 * Tapping it reads the screen content aloud using Bhashini TTS.
 *
 * This service handles:
 * 1. Text-to-Speech (TTS) — Read screen content aloud in Hindi
 * 2. Speech-to-Text (STT) — Parse pandit voice input during registration
 * 3. Voice-guided registration flow
 */

import { env } from "../config/env";
import { logger } from "../utils/logger";

const BHASHINI_BASE_URL = "https://dhruva-api.bhashini.gov.in/services/inference";

interface BhashiniTTSRequest {
    pipelineTasks: Array<{
        taskType: string;
        config: {
            language: { sourceLanguage: string };
            serviceId: string;
            gender?: string;
        };
    }>;
    inputData: {
        input: Array<{ source: string }>;
    };
}

interface BhashiniSTTRequest {
    pipelineTasks: Array<{
        taskType: string;
        config: {
            language: { sourceLanguage: string };
            serviceId: string;
        };
    }>;
    inputData: {
        audio: Array<{ audioContent: string }>;
    };
}

// ─── Text-to-Speech ──────────────────────────────────────────────────────────

/**
 * Convert text to speech using Bhashini API.
 * Returns Base64-encoded audio (WAV).
 *
 * @param text - Text to convert to speech
 * @param language - Language code ('hi', 'en', 'bn', 'ta', 'te', 'mr')
 * @returns Base64 audio content string
 */
export async function textToSpeech(text: string, language: string = "hi"): Promise<string> {
    if (!env.BHASHINI_API_KEY || !env.BHASHINI_USER_ID) {
        logger.warn("[Bhashini] API not configured — returning mock audio");
        return ""; // Return empty in dev mode
    }

    try {
        const payload: BhashiniTTSRequest = {
            pipelineTasks: [
                {
                    taskType: "tts",
                    config: {
                        language: { sourceLanguage: language },
                        serviceId: env.BHASHINI_PIPELINE_ID || "ai4bharat/indic-tts-coqui-hindi",
                        gender: "female",
                    },
                },
            ],
            inputData: {
                input: [{ source: text }],
            },
        };

        const response = await fetch(BHASHINI_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: env.BHASHINI_API_KEY,
                userID: env.BHASHINI_USER_ID,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`[Bhashini TTS] API error ${response.status}: ${errorText}`);
            throw new Error(`Bhashini TTS failed: ${response.status}`);
        }

        const data = (await response.json()) as { pipelineResponse?: Array<{ audio?: Array<{ audioContent?: string }> }> };
        const audioContent = data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent;

        if (!audioContent) {
            throw new Error("No audio content in Bhashini response");
        }

        return audioContent;
    } catch (err) {
        logger.error(`[Bhashini TTS] Error: ${(err as Error).message}`);
        throw err;
    }
}

// ─── Speech-to-Text ──────────────────────────────────────────────────────────

/**
 * Convert speech audio to text using Bhashini API.
 *
 * @param audioBase64 - Base64-encoded audio content
 * @param language - Source language code
 * @returns Transcribed text
 */
export async function speechToText(audioBase64: string, language: string = "hi"): Promise<string> {
    if (!env.BHASHINI_API_KEY || !env.BHASHINI_USER_ID) {
        logger.warn("[Bhashini] API not configured — returning empty transcript");
        return "";
    }

    try {
        const payload: BhashiniSTTRequest = {
            pipelineTasks: [
                {
                    taskType: "asr",
                    config: {
                        language: { sourceLanguage: language },
                        serviceId: env.BHASHINI_PIPELINE_ID || "ai4bharat/conformer-hi-gpu--t4",
                    },
                },
            ],
            inputData: {
                audio: [{ audioContent: audioBase64 }],
            },
        };

        const response = await fetch(BHASHINI_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: env.BHASHINI_API_KEY,
                userID: env.BHASHINI_USER_ID,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`[Bhashini STT] API error ${response.status}: ${errorText}`);
            throw new Error(`Bhashini STT failed: ${response.status}`);
        }

        const data = (await response.json()) as { pipelineResponse?: Array<{ output?: Array<{ source?: string }> }> };
        const transcript = data?.pipelineResponse?.[0]?.output?.[0]?.source;

        if (!transcript) {
            throw new Error("No transcript in Bhashini response");
        }

        return transcript;
    } catch (err) {
        logger.error(`[Bhashini STT] Error: ${(err as Error).message}`);
        throw err;
    }
}

// ─── Voice Prompts for Registration Steps ────────────────────────────────────

export const REGISTRATION_VOICE_PROMPTS: Record<string, { hi: string; en: string }> = {
    welcome: {
        hi: "नमस्ते! हमारे पंडित जी में आपका स्वागत है। आइए आपका पंजीकरण शुरू करें। कृपया अपना पूरा नाम बताएं।",
        en: "Namaste! Welcome to Hmare Pandit Ji. Let's start your registration. Please tell us your full name.",
    },
    experience: {
        hi: "धन्यवाद। अब कृपया बताएं कि आपको कितने वर्षों का अनुभव है?",
        en: "Thank you. Now please tell us how many years of experience you have?",
    },
    specializations: {
        hi: "अच्छा। अब बताएं कि आप कौन-कौन सी पूजा करते हैं? जैसे - विवाह, गृह प्रवेश, सत्यनारायण कथा।",
        en: "Good. Now tell us which pujas you perform? For example - Vivah, Griha Pravesh, Satyanarayan Katha.",
    },
    languages: {
        hi: "कृपया बताएं आप कौन-कौन सी भाषाएं बोलते हैं?",
        en: "Please tell us which languages you speak?",
    },
    location: {
        hi: "आप कहाँ रहते हैं? अपने शहर और राज्य का नाम बताएं।",
        en: "Where do you live? Tell us your city and state name.",
    },
    aadhaar: {
        hi: "अब कृपया अपना 12 अंकों का आधार नंबर बताएं। यह पूरी तरह सुरक्षित रहेगा।",
        en: "Now please tell us your 12-digit Aadhaar number. It will be kept completely secure.",
    },
    documents: {
        hi: "कृपया अपने आधार कार्ड की फोटो अपलोड करें — आगे और पीछे दोनों तरफ की।",
        en: "Please upload photos of your Aadhaar card — both front and back sides.",
    },
    bank: {
        hi: "अब कृपया अपने बैंक खाते की जानकारी दें — खाता धारक का नाम, खाता नंबर, और IFSC कोड।",
        en: "Now please provide your bank account details — account holder name, account number, and IFSC code.",
    },
    video_kyc: {
        hi: "अंतिम चरण — कृपया एक छोटा वीडियो बनाएं जिसमें आप श्लोक पढ़ रहे हों और अपना नाम बताएं।",
        en: "Final step — please record a short video where you recite a shloka and tell your name.",
    },
    complete: {
        hi: "बधाई हो! आपका पंजीकरण पूरा हो गया है। हमारी टीम जल्द ही आपके दस्तावेज़ों की समीक्षा करेगी।",
        en: "Congratulations! Your registration is complete. Our team will review your documents shortly.",
    },
};

/**
 * Get voice prompt audio for a registration step.
 * @param step - Registration step key
 * @param language - Language code ('hi' or 'en')
 * @returns Base64 audio content or empty string if Bhashini is not configured
 */
export async function getRegistrationVoicePrompt(
    step: string,
    language: string = "hi"
): Promise<{ text: string; audio: string }> {
    const lang = language === "en" ? "en" : "hi";
    const prompt = REGISTRATION_VOICE_PROMPTS[step];

    if (!prompt) {
        return { text: "", audio: "" };
    }

    const text = prompt[lang];
    let audio = "";

    try {
        audio = await textToSpeech(text, lang);
    } catch {
        logger.warn(`[Bhashini] Could not generate audio for step: ${step}`);
    }

    return { text, audio };
}
