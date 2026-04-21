// MIGRATION 8: Replaced Puter.js with direct Anthropic API calls

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

/**
 * @deprecated Alias for backward compatibility with GurujiAIChat component
 */
export type PuterMessage = ChatMessage;

/**
 * @deprecated No longer needed with direct API - always resolves immediately
 * Kept for backward compatibility with GurujiAIChat.tsx
 */
export async function waitForPuter(_timeoutMs = 10000): Promise<boolean> {
    // API route is always available, no need to wait for SDK
    return true;
}

/**
 * @deprecated No longer needed - always true now
 */
export function isPuterReady(): boolean {
    return true;
}

/**
 * Single-turn chat with Claude (Anthropic API)
 * @param userMessage - User's message
 * @param systemPrompt - Optional system prompt override
 */
export async function chatWithClaude(
    userMessage: string,
    systemPrompt?: string,
): Promise<string> {
    const messages: ChatMessage[] = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt } as ChatMessage] : []),
        { role: "user", content: userMessage },
    ];

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Chat request failed");
    }

    const data = await response.json();
    return data.message;
}

/**
 * Multi-turn conversation with Claude (Anthropic API)
 * @param messages - Full conversation history
 */
export async function chatMultiTurn(messages: ChatMessage[]): Promise<string> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Chat request failed");
    }

    const data = await response.json();
    return data.message;
}

/**
 * System prompt for Guruji AI (pandit advisor)
 */
export const PANDIT_ADVISOR_SYSTEM_PROMPT = `You are Guruji AI, a knowledgeable and respectful Hindu priest assistant for HmarePanditJi.

Your expertise includes:
- Hindu rituals and ceremonies (vivah, upanayana, griha pravesh, etc.)
- Puja procedures and required samagri (ritual items)
- Muhurat (auspicious dates and times)
- Priest booking process and pricing
- Delhi-NCR specific information

Guidelines:
- Respond in the same language as the user (Hindi or English)
- Be warm, respectful, and culturally sensitive
- Provide accurate information about Hindu traditions
- If unsure, acknowledge limitations
- Never make up information
- Maintain professional priest-patron relationship tone`;
