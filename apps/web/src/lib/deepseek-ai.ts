/**
 * deepseek-ai.ts
 * --------------
 * DeepSeek AI integration using backend proxy (API keys stay on server).
 * Supports DeepSeek-V3 (deepseek-chat) and DeepSeek-R1 (deepseek-reasoner).
 *
 * API keys are stored on the backend server and never exposed to the client.
 */

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
// Helper: Chat with DeepSeek (via backend proxy)
// --------------------------------------------------------------------------
export async function chatWithDeepSeek(
    userMessage: string,
    options: DeepSeekChatOptions = {}
): Promise<string> {
    const {
        model = 'deepseek-chat',
        temperature = 0.7,
        max_tokens = 1024,
        top_p = 1,
        system_prompt = PANDIT_ADVISOR_SYSTEM_PROMPT,
    } = options;

    const messages: DeepSeekMessage[] = [];
    if (system_prompt) {
        messages.push({ role: 'system', content: system_prompt });
    }
    messages.push({ role: 'user', content: userMessage });

    // Get auth token from localStorage
    const token = localStorage.getItem('hpj_token');
    if (!token) {
        throw new Error('Authentication required. Please login to use AI chat.');
    }

    const response = await fetch(`${API_BASE}/ai/deepseek/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `DeepSeek API error: ${response.status}`);
    }

    const json = await response.json();
    const data: DeepSeekChatResponse = json.data;
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
        model = 'deepseek-chat',
        temperature = 0.7,
        max_tokens = 1024,
        top_p = 1,
    } = options;

    // Get auth token from localStorage
    const token = localStorage.getItem('hpj_token');
    if (!token) {
        throw new Error('Authentication required. Please login to use AI chat.');
    }

    const response = await fetch(`${API_BASE}/ai/deepseek/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `DeepSeek API error: ${response.status}`);
    }

    const json = await response.json();
    const data: DeepSeekChatResponse = json.data;
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
        model = 'deepseek-chat',
        temperature = 0.7,
        max_tokens = 1024,
        top_p = 1,
    } = options;

    // Get auth token from localStorage
    const token = localStorage.getItem('hpj_token');
    if (!token) {
        throw new Error('Authentication required. Please login to use AI chat.');
    }

    // Note: Streaming would require implementing SSE support in the backend route
    // For now, use non-streaming version
    const content = await chatMultiTurn(messages, options);
    yield content;
}

// --------------------------------------------------------------------------
// Utility: Check if DeepSeek is available
// --------------------------------------------------------------------------
export function isDeepSeekConfigured(): boolean {
    // Since we're using backend proxy, we assume it's configured
    // Backend will return 503 if not configured
    return true;
}

// --------------------------------------------------------------------------
// Available DeepSeek Models
// --------------------------------------------------------------------------
export const DEEPSEEK_MODELS = {
    V3: 'deepseek-chat',      // DeepSeek-V3 (latest general model)
    R1: 'deepseek-reasoner',  // DeepSeek-R1 (reasoning model)
} as const;
