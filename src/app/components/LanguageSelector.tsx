"use client";

import React, { useEffect, useState } from "react";
import { Languages, ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Common languages for quick access, the widget will support "all"
const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Read current language from cookie
        const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
        if (match && match[1]) {
            setCurrentLang(match[1]);
        }

        // Add Google Translate Script
        const addScript = () => {
            const script = document.createElement('script');
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        };

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
            }, 'google_translate_element');
        };

        if (!document.querySelector('script[src*="translate_a/element.js"]')) {
            addScript();
        }
    }, []);

    const handleLanguageChange = (langCode: string) => {
        setCurrentLang(langCode);
        setIsOpen(false);

        // Set Google Translate cookie format: /baseLang/targetLang
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
        
        // Force reload to apply translations natively
        window.location.reload();
    };

    const filteredLanguages = LANGUAGES.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative">
            {/* Hidden default Google widget */}
            <div id="google_translate_element" style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none' }}></div>
            
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-zinc-600 dark:text-zinc-300 min-w-[120px]"
            >
                <Languages size={18} className="text-blue-500" />
                <span className="text-sm font-bold uppercase">{currentLang}</span>
                <ChevronDown size={14} className={cn("ml-auto transition-transform", isOpen && "rotate-180")} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div 
                            className="fixed inset-0 z-[60]" 
                            onClick={() => setIsOpen(false)}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-700 shadow-2xl z-[70] overflow-hidden"
                        >
                            <div className="p-3 border-b border-zinc-100 dark:border-slate-800 flex items-center gap-2">
                                <Search size={14} className="text-zinc-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search language..." 
                                    className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            
                            <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-slate-700">
                                {filteredLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                                            currentLang === lang.code 
                                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold" 
                                                : "hover:bg-zinc-50 dark:hover:bg-slate-800 text-zinc-600 dark:text-zinc-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </div>
                                        {currentLang === lang.code && <Check size={16} />}
                                    </button>
                                ))}
                                {filteredLanguages.length === 0 && (
                                    <div className="p-4 text-center text-zinc-400 text-sm">
                                        No language found.
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-zinc-50 dark:bg-slate-800/50 border-t border-zinc-100 dark:border-slate-800">
                                <p className="text-[10px] text-zinc-400 text-center">
                                    Powered by Google Translate
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .goog-te-banner-frame { display: none !important; }
                body { top: 0 !important; }
                .goog-te-menu-value { display: none !important; }
                .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
                .goog-te-gadget .goog-te-combo { margin: 0 !important; }
                #goog-gt-tt { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
            `}</style>
        </div>
    );
}
