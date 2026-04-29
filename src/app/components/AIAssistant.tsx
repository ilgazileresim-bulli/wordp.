"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Bot, User, Languages, Zap, FileText } from "lucide-react";
import { cn } from "./editor/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AIAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your Macrotar AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { role: "user" as const, content: input }];
        setMessages(newMessages);
        setInput("");

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "I'm currently in 'Demo Mode'. In the full version, I can translate your text, summarize documents, or even generate designs directly here!" 
            }]);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                    className="fixed bottom-24 right-6 w-96 h-[500px] z-[110] glass dark:glass-dark rounded-[2rem] border-2 border-white/20 dark:border-white/10 shadow-3xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Sparkles size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-800 dark:text-white">Macrotar AI</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                    msg.role === "user" ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-indigo-500"
                                )}>
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%]",
                                    msg.role === "user" 
                                        ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10" 
                                        : "bg-white dark:bg-slate-800 text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-slate-700 rounded-tl-none shadow-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="px-5 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        {[
                            { icon: Languages, label: "Translate" },
                            { icon: Zap, label: "Summarize" },
                            { icon: FileText, label: "Rewrite" },
                        ].map((action, i) => (
                            <button key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-white/20 rounded-full text-[10px] font-bold text-zinc-600 dark:text-zinc-300 transition-all whitespace-nowrap">
                                <action.icon size={12} />
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-5 border-t border-white/10">
                        <div className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type your message..."
                                className="w-full bg-white/50 dark:bg-slate-900/50 border-2 border-transparent group-focus-within:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all placeholder:text-zinc-400"
                            />
                            <button 
                                onClick={handleSend}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
