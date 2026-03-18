/**
 * puter-ai.ts
 * -----------
 * Thin wrapper around puter.js AI API.
 * Uses the FREE puter.js client — no API keys or backend required.
 * Model: claude-sonnet-4-5  (Claude Sonnet 4.5)
 *
 * Puter.js is loaded via <Script> in layout.tsx and exposes `window.puter`.
 * All calls are client-side only.  Never import this file from a Server Component.
 */

export const PUTER_AI_MODEL = "claude-sonnet-4-5";

// --------------------------------------------------------------------------
// Type shims — puter.js is loaded globally; not typed as an npm package
// --------------------------------------------------------------------------
declare global {
    interface Window {
        puter?: {
            ai: {
                chat: (
                    messages: string | PuterMessage | PuterMessage[],
                    options?: PuterAIOptions
                ) => Promise<PuterAIResponse>;
            };
            auth: {
                signIn: () => Promise<void>;
                isSignedIn: () => Promise<boolean>;
            };
        };
    }
}

export interface PuterMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface PuterAIOptions {
    model?: string;
    stream?: boolean;
}

export interface PuterAIResponse {
    message?: {
        content?: Array<{ text?: string }> | string;
    };
    // Some versions return text directly
    text?: string;
}

// --------------------------------------------------------------------------
// Helper: extract text from puter AI response
// --------------------------------------------------------------------------
export function extractText(response: PuterAIResponse): string {
    if (!response) return "";
    // Claude-via-puter format
    if (response.message?.content) {
        const c = response.message.content;
        if (typeof c === "string") return c;
        if (Array.isArray(c)) {
            return c.map((b) => b.text ?? "").join("");
        }
    }
    // Fallback
    return response.text ?? "";
}

// --------------------------------------------------------------------------
// isPuterReady — check if window.puter exists
// --------------------------------------------------------------------------
export function isPuterReady(): boolean {
    return typeof window !== "undefined" && typeof window.puter !== "undefined";
}

// --------------------------------------------------------------------------
// waitForPuter — polls until puter.js is fully loaded
// --------------------------------------------------------------------------
export function waitForPuter(timeoutMs = 10_000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (isPuterReady()) {
            resolve();
            return;
        }
        const deadline = Date.now() + timeoutMs;
        const id = setInterval(() => {
            if (isPuterReady()) {
                clearInterval(id);
                resolve();
            } else if (Date.now() > deadline) {
                clearInterval(id);
                reject(new Error("puter.js did not load within the timeout period"));
            }
        }, 100);
    });
}

// --------------------------------------------------------------------------
// chatWithClaude — single-turn convenience wrapper
// --------------------------------------------------------------------------
export async function chatWithClaude(
    userMessage: string,
    systemPrompt?: string
): Promise<string> {
    await waitForPuter();

    const messages: PuterMessage[] = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: userMessage });

    const response = await window.puter!.ai.chat(messages, {
        model: PUTER_AI_MODEL,
    });
    return extractText(response);
}

// --------------------------------------------------------------------------
// chatMultiTurn — multi-turn conversation wrapper
// --------------------------------------------------------------------------
export async function chatMultiTurn(
    messages: PuterMessage[]
): Promise<string> {
    await waitForPuter();

    const response = await window.puter!.ai.chat(messages, {
        model: PUTER_AI_MODEL,
    });
    return extractText(response);
}

// --------------------------------------------------------------------------
// SYSTEM PROMPT — HmarePanditJi Pandit Advisor
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
• Do NOT reveal you are built on Claude or puter.js — say "I am Guruji AI, powered by HmarePanditJi".
• Always end with a warm spiritual greeting like "🙏 Jai Shri Ram" or "🙏 Om Namah Shivaya".`;
