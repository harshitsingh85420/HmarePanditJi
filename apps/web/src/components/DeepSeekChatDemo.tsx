/**
 * DeepSeekChatDemo.tsx
 * --------------------
 * Example chat component using DeepSeek AI with streaming.
 * 
 * Copy this to your components folder and customize as needed.
 */

'use client';

import { useState } from 'react';
import { useDeepSeek } from '@/lib/hooks/useDeepSeek';
import { PANDIT_ADVISOR_SYSTEM_PROMPT } from '@/lib/deepseek-ai';

export default function DeepSeekChatDemo() {
    const [input, setInput] = useState('');
    const { messages, sendMessage, isLoading, error, clearChat } = useDeepSeek({
        systemPrompt: PANDIT_ADVISOR_SYSTEM_PROMPT,
        model: 'deepseek-chat', // or 'deepseek-reasoner' for reasoning tasks
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        await sendMessage(input);
        setInput('');
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    🤖 Guruji AI (Powered by DeepSeek-V3)
                </h2>
                <button
                    onClick={clearChat}
                    className="text-lg text-red-600 hover:text-red-700 font-medium"
                >
                    Clear Chat
                </button>
            </div>

            {/* Chat Messages */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-20">
                        <span className="text-4xl mb-2 block">🙏</span>
                        <p>Ask me anything about Hindu rituals, pujas, or pandit booking!</p>
                        <p className="text-lg mt-2">Example: &quot;How do I book a pandit for Griha Pravesh?&quot;</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                        msg.role === 'user'
                                            ? 'bg-[#1152d4] text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                    }`}
                                >
                                    <p className="text-lg whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-lg mt-4">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about rituals, muhurat, or pandit booking..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1152d4] focus:border-transparent outline-none"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-2 bg-[#1152d4] text-white rounded-lg font-medium hover:bg-[#0d42a3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? &apos;Sending...&apos; : &apos;Send&apos;}
                </button>
            </form>

            {/* Model Info */}
            <div className="mt-4 text-center text-base text-slate-400">
                Powered by DeepSeek-V3 • {process.env.NODE_ENV === &apos;development&apos; ? &apos;Dev Mode&apos; : &apos;Production&apos;}
            </div>
        </div>
    );
}
