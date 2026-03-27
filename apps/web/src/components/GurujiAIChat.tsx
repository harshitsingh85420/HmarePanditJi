"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    chatMultiTurn,
    PANDIT_ADVISOR_SYSTEM_PROMPT,
    waitForPuter,
    type PuterMessage,
} from "../lib/puter-ai";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const QUICK_SUGGESTIONS = [
    "Griha Pravesh ke liye pandit chahiye",
    "Satyanarayan katha kab karein?",
    "Vivah muhurat November 2025",
    "Mundan samagri list",
    "How to book a pandit?",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function uid() {
    return Math.random().toString(36).slice(2);
}

function formatTime(d: Date) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function GurujiAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: &quot;welcome&quot;,
            role: &quot;assistant&quot;,
            content:
                &quot;🙏 Namaste! Main Guruji AI hoon — HmarePanditJi ka virtual advisor.\n\nMain aapki help kar sakta hoon:\n• Sahi pandit dhundhne mein\n• Muhurat suggest karne mein\n• Puja samagri ki jankari mein\n• Ritual ki significance samjhane mein\n\nAap kya jaanna chahte hain?&quot;,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState(&quot;&quot;);
    const [isLoading, setIsLoading] = useState(false);
    const [puterReady, setPuterReady] = useState(false);
    const [puterError, setPuterError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Wait for puter.js to load
    useEffect(() => {
        waitForPuter(15_000)
            .then(() => setPuterReady(true))
            .catch(() =>
                setPuterError(
                    &quot;AI service could not be loaded. Please refresh the page.&quot;
                )
            );
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const buildHistory = useCallback((): PuterMessage[] => {
        const history: PuterMessage[] = [
            { role: &quot;system&quot;, content: PANDIT_ADVISOR_SYSTEM_PROMPT },
        ];
        messages.forEach((m) => {
            history.push({ role: m.role, content: m.content });
        });
        return history;
    }, [messages]);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            const userMsg: ChatMessage = {
                id: uid(),
                role: &quot;user&quot;,
                content: trimmed,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setInput(&quot;&quot;);
            setIsLoading(true);

            try {
                const history = buildHistory();
                history.push({ role: &quot;user&quot;, content: trimmed });

                const reply = await chatMultiTurn(history);

                const assistantMsg: ChatMessage = {
                    id: uid(),
                    role: &quot;assistant&quot;,
                    content: reply || &quot;Kshama karein, koi jawab nahi mila. Dobara try karein. 🙏&quot;,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } catch (err: unknown) {
                const errorMsg: ChatMessage = {
                    id: uid(),
                    role: &quot;assistant&quot;,
                    content:
                        &quot;Maafi chahta hoon! Abhi AI service temporarily unavailable hai. Please thodi der mein dobara try karein. 🙏&quot;,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMsg]);
                console.error(&quot;[GurujiAI] Error calling puter AI:&quot;, err);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, buildHistory]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === &quot;Enter&quot; && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    // ─────────────────────────────────────────────────────────────────
    // Render — Floating Button
    // ─────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Floating trigger button */}
            <button
                id="guruji-ai-chat-button"
                onClick={() => setIsOpen((o) => !o)}
                aria-label="Open Guruji AI Chat"
                className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: &quot;linear-gradient(135deg, #f59e0b 0%, #d97706 100%)&quot;,
                    boxShadow: &quot;0 8px 32px rgba(245,158,11,0.45)&quot;,
                }}
            >
                {isOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="white"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
                ) : (
                    <span
                        className="text-2xl select-none"
                        role="img"
                        aria-label="praying hands"
                    >
                        🙏
                    </span>
                )}
                {/* Pulse ring */}
                {!isOpen && (
                    <span
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ background: "#f59e0b" }}
                    />
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    id="guruji-ai-chat-panel"
                    className="fixed bottom-44 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
                    style={{
                        width: "min(380px, calc(100vw - 24px))",
                        height: "min(560px, calc(100vh - 200px))",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        background: "#fff",
                        animation: "slideUpFade 0.25s ease-out",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        }}
                    >
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
                            🕉️
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-lg leading-tight">
                                Guruji AI
                            </p>
                            <p className="text-white/80 text-[11px] leading-tight">
                                {puterReady ? (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-300 mr-1 align-middle" />
                                        Powered by Claude · HmarePanditJi
                                    </>
                                ) : (
                                    &quot;Loading AI...&quot;
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Close chat"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Error banner */}
                    {puterError && (
                        <div className="px-4 py-2 bg-red-50 text-red-600 text-base border-b border-red-100">
                            ⚠️ {puterError}
                        </div>
                    )}

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                        style={{ background: "#fafaf8" }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                {/* Avatar */}
                                <div
                                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-base mt-0.5"
                                    style={{
                                        background:
                                            msg.role === "assistant"
                                                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                                                : "#e5e7eb",
                                    }}
                                >
                                    {msg.role === &quot;assistant&quot; ? &quot;🕉️&quot; : &quot;👤&quot;}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`max-w-[78%] rounded-2xl px-5 py-2 text-lg leading-relaxed whitespace-pre-wrap break-words ${msg.role === "user"
                                            ? "rounded-tr-sm text-white"
                                            : "rounded-tl-sm text-gray-800"
                                        }`}
                                    style={{
                                        background:
                                            msg.role === "user"
                                                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                                                : "#ffffff",
                                        boxShadow:
                                            msg.role === "assistant"
                                                ? "0 1px 4px rgba(0,0,0,0.07)"
                                                : "none",
                                    }}
                                >
                                    {msg.content}
                                    <p
                                        className={`text-[10px] mt-1 ${msg.role === "user"
                                                ? "text-white/60 text-right"
                                                : "text-gray-400"
                                            }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-base"
                                    style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                                    🕉️
                                </div>
                                <div
                                    className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
                                    style={{
                                        background: "#ffffff",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                                    }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-amber-400 inline-block"
                                            style={{
                                                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick suggestions (only when last message is from assistant & messages ≤ 2) */}
                    {messages.length <= 2 && !isLoading && (
                        <div className="px-5 pb-2 flex gap-2 flex-wrap flex-shrink-0 border-t border-gray-100 pt-2">
                            {QUICK_SUGGESTIONS.slice(0, 3).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-[11px] px-5 py-3.5 rounded-full border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors whitespace-nowrap"
                                    disabled={!puterReady}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input area */}
                    <div
                        className="flex items-end gap-2 px-5 py-3 flex-shrink-0 border-t border-gray-100"
                        style={{ background: "#fff" }}
                    >
                        <textarea
                            ref={inputRef}
                            id="guruji-ai-chat-input"
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                puterReady
                                    ? &quot;Apna sawal puchein... (Enter to send)&quot;
                                    : &quot;AI loading...&quot;
                            }
                            disabled={!puterReady || isLoading}
                            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-5 py-2 text-lg outline-none focus:border-amber-400 focus:bg-white transition-colors placeholder:text-gray-400 disabled:opacity-50"
                            style={{ maxHeight: &quot;120px&quot;, lineHeight: &quot;1.5&quot; }}
                            onInput={(e) => {
                                const t = e.currentTarget;
                                t.style.height = &quot;auto&quot;;
                                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                            }}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!puterReady || isLoading || !input.trim()}
                            aria-label="Send message"
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                            style={{
                                background:
                                    puterReady && !isLoading && input.trim()
                                        ? &quot;linear-gradient(135deg,#f59e0b,#d97706)&quot;
                                        : &quot;#e5e7eb&quot;,
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke={
                                    puterReady && !isLoading && input.trim() ? "white" : "#9ca3af"
                                }
                                className="w-4 h-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Keyframe animations injected inline */}
            <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scaleY(0.6); }
          40%           { transform: scaleY(1.2); }
        }
      `}</style>
        </>
    );
}
