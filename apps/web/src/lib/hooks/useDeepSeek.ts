/**
 * useDeepSeek.ts
 * --------------
 * React hook for DeepSeek AI chat with streaming support.
 * 
 * Usage:
 *   const { messages, sendMessage, isLoading, error } = useDeepSeek();
 */

import { useState, useCallback, useRef } from 'react';
import { chatStream, DeepSeekMessage } from '@/lib/deepseek-ai';

interface UseDeepSeekOptions {
    systemPrompt?: string;
    model?: string;
    initialMessages?: DeepSeekMessage[];
}

interface UseDeepSeekReturn {
    messages: DeepSeekMessage[];
    sendMessage: (content: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    clearChat: () => void;
    setMessages: (msgs: DeepSeekMessage[]) => void;
}

export function useDeepSeek(options: UseDeepSeekOptions = {}): UseDeepSeekReturn {
    const {
        systemPrompt = 'You are a helpful AI assistant.',
        model = 'deepseek-chat',
        initialMessages = [],
    } = options;

    const [messages, setMessagesState] = useState<DeepSeekMessage[]>(
        initialMessages.length > 0
            ? initialMessages
            : [{ role: 'system', content: systemPrompt }]
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        setIsLoading(true);
        setError(null);

        // Add user message
        const userMessage: DeepSeekMessage = { role: 'user', content };
        setMessagesState((prev) => [...prev, userMessage]);

        try {
            // Use streaming
            const allMessages = [...messages, userMessage];
            let assistantContent = '';

            for await (const chunk of chatStream(allMessages, { model })) {
                assistantContent += chunk;
                // Update assistant message in real-time
                setMessagesState((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { role: 'assistant', content: last.content + chunk },
                        ];
                    }
                    return [...prev, { role: 'assistant', content: chunk }];
                });
            }

            // If streaming didn't work, fall back to regular API call
            if (!assistantContent) {
                const res = await fetch('/api/v1/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: allMessages,
                        model,
                    }),
                });

                if (!res.ok) throw new Error('Failed to get response');

                const data = await res.json();
                assistantContent = data.data?.response || '';

                setMessagesState((prev) => [
                    ...prev,
                    { role: 'assistant', content: assistantContent },
                ]);
            }
        } catch (err: any) {
            console.error('[useDeepSeek] Error:', err);
            setError(err.message || 'Something went wrong');
            // Remove user message on error
            setMessagesState((prev) => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    }, [messages, model]);

    const clearChat = useCallback(() => {
        setMessagesState([{ role: 'system', content: systemPrompt }]);
        setError(null);
    }, [systemPrompt]);

    const setMessages = useCallback((msgs: DeepSeekMessage[]) => {
        setMessagesState(msgs);
    }, []);

    return {
        messages: messages.filter(m => m.role !== 'system'), // Hide system message from UI
        sendMessage,
        isLoading,
        error,
        clearChat,
        setMessages,
    };
}

// --------------------------------------------------------------------------
// Simple non-streaming version
// --------------------------------------------------------------------------
export function useDeepSeekSimple(options: UseDeepSeekOptions = {}): Omit<UseDeepSeekReturn, 'setMessages'> {
    const {
        systemPrompt = 'You are a helpful AI assistant.',
        model = 'deepseek-chat',
    } = options;

    const [messages, setMessagesState] = useState<DeepSeekMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        setIsLoading(true);
        setError(null);

        const userMessage: DeepSeekMessage = { role: 'user', content };
        const allMessages = [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage,
        ];

        try {
            const res = await fetch('/api/v1/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: allMessages,
                    model,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to get response');
            }

            const data = await res.json();
            const assistantMessage: DeepSeekMessage = {
                role: 'assistant',
                content: data.data?.response || '',
            };

            setMessagesState((prev) => [...prev, userMessage, assistantMessage]);
        } catch (err: any) {
            console.error('[useDeepSeekSimple] Error:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }, [messages, model, systemPrompt]);

    const clearChat = useCallback(() => {
        setMessagesState([]);
        setError(null);
    }, []);

    return {
        messages,
        sendMessage,
        isLoading,
        error,
        clearChat,
    };
}
