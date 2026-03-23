/**
 * deepseek-ai.ts
 * --------------
 * DeepSeek AI integration using official REST API.
 * Supports DeepSeek-V3 (deepseek-chat) and DeepSeek-R1 (deepseek-reasoner).
 * 
 * API Docs: https://api-docs.deepseek.com/
 * Get API Key: https://platform.deepseek.com/
 */

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------
export const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '';
export const DEEPSEEK_MODEL = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-chat';
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
export interface DeepSeekMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface DeepSeekChatOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    system_prompt?: string;
}

export interface DeepSeekChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: DeepSeekMessage;
        logprobs: number | null;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// --------------------------------------------------------------------------
// System Prompt — HmarePanditJi Pandit Advisor
// --------------------------------------------------------------------------
export const PANDIT_ADVISOR_SYSTEM_PROMPT = `You are "Guruji AI", an expert virtual Hindu ritual advisor for HmarePanditJi — India's first platform for booking Aadhaar-verified Hindu pandits in Delhi-NCR.

Your role:
• Help devotees understand Hindu rituals, traditions, and puja requirements.
• Recommend the right type of pandit for specific ceremonies (Griha Pravesh, Vivah, Satyanarayan Katha, Mundan, Namkaran, Shradh, etc.).
• Suggest auspicious muhurat (timing) based on the user's requirement.
• Help users understand samagri (puja materials) needed.
• Explain the significance of rituals in simple, warm language.
• Guide users on how to book on HmarePanditJi.
• Answer questions in Hindi or English based on user preference.
• Keep responses concise, warm, and spiritually respectful.
• If asked about booking, direct users to search on HmarePanditJi.

Restrictions:
• Do NOT discuss politics, medicine, or unrelated topics.
• Do NOT reveal you are built on DeepSeek — say "I am Guruji AI, powered by HmarePanditJi".
• Always end with a warm spiritual greeting like "🙏 Jai Shri Ram" or "🙏 Om Namah Shivaya".`;

// --------------------------------------------------------------------------
// Helper: Chat with DeepSeek (Server-side or API route)
// --------------------------------------------------------------------------
export async function chatWithDeepSeek(
    userMessage: string,
    options: DeepSeekChatOptions = {}
): Promise<string> {
    const {
        model = DEEPSEEK_MODEL,
        temperature = 0.7,
        max_tokens = 1024,
        top_p = 1,
        system_prompt = PANDIT_ADVISOR_SYSTEM_PROMPT,
    } = options;

    if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is not configured. Please set it in your .env file.');
    }

    const messages: DeepSeekMessage[] = [];
    if (system_prompt) {
        messages.push({ role: 'system', content: system_prompt });
    }
    messages.push({ role: 'user', content: userMessage });

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
            stream: false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data: DeepSeekChatResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

// --------------------------------------------------------------------------
// Multi-turn conversation support
// --------------------------------------------------------------------------
export async function chatMultiTurn(
    messages: DeepSeekMessage[],
    options: DeepSeekChatOptions = {}
): Promise<string> {
    const {
        model = DEEPSEEK_MODEL,
        temperature = 0.7,
        max_tokens = 1024,
        top_p = 1,
    } = options;

    if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is not configured. Please set it in your .env file.');
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
            stream: false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data: DeepSeekChatResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

// --------------------------------------------------------------------------
// Streaming support (for real-time responses)
// --------------------------------------------------------------------------
export async function* chatStream(
    messages: DeepSeekMessage[],
    options: DeepSeekChatOptions = {}
): AsyncGenerator<string, void, unknown> {
    const {
        model = DEEPSEEK_MODEL,
        temperature = 0.7,
        max_tokens = 1024,
        top_p = 1,
    } = options;

    if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is not configured. Please set it in your .env file.');
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
            stream: true,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6);
                if (data === '[DONE]') return;

                try {
                    const parsed = JSON.parse(data);
                    const chunk = parsed.choices?.[0]?.delta?.content;
                    if (chunk) yield chunk;
                } catch {
                    // Ignore parse errors
                }
            }
        }
    }
}

// --------------------------------------------------------------------------
// Utility: Check if DeepSeek is configured
// --------------------------------------------------------------------------
export function isDeepSeekConfigured(): boolean {
    return !!DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 10;
}

// --------------------------------------------------------------------------
// Available DeepSeek Models
// --------------------------------------------------------------------------
export const DEEPSEEK_MODELS = {
    V3: 'deepseek-chat',      // DeepSeek-V3 (latest general model)
    R1: 'deepseek-reasoner',  // DeepSeek-R1 (reasoning model)
} as const;
