"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronUp, ChevronDown, Check, ReplaceAll } from "lucide-react";
import { cn } from "./utils";

interface SearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    editor?: any;
}

const SearchPanel = ({ isOpen, onClose, editor }: SearchPanelProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [replaceTerm, setReplaceTerm] = useState("");
    const [mode, setMode] = useState<'search' | 'replace'>('search');
    const [matchCount, setMatchCount] = useState(0);

    // Rough match counting
    React.useEffect(() => {
        if (!editor || !searchTerm) {
            setMatchCount(0);
            return;
        }
        try {
            const text = editor.getText() || "";
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = text.match(regex);
            setMatchCount(matches ? matches.length : 0);
        } catch (e) {
            setMatchCount(0);
        }
    }, [searchTerm, editor?.state?.doc?.content]);

    const handleFindNext = () => {
        if (!searchTerm) return;
        // Browsers built-in text search
        const found = (window as any).find(searchTerm, false, false, true, false, false, false);
        if (!found) {
            // Wrap around
            window.getSelection()?.removeAllRanges();
            (window as any).find(searchTerm, false, false, true, false, false, false);
        }
    };

    const handleFindPrev = () => {
        if (!searchTerm) return;
        const found = (window as any).find(searchTerm, false, true, true, false, false, false);
        if (!found) {
            // Move caret to end to wrap
            const selection = window.getSelection();
            if (selection && document.querySelector('.ProseMirror')) {
                const range = document.createRange();
                range.selectNodeContents(document.querySelector('.ProseMirror') as Node);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                (window as any).find(searchTerm, false, true, true, false, false, false);
            }
        }
    };

    const handleReplace = () => {
        if (!searchTerm || !editor) return;
        const selection = window.getSelection();
        if (selection && selection.toString().toLowerCase() === searchTerm.toLowerCase()) {
            editor.commands.insertContent(replaceTerm);
        }
        handleFindNext();
    };

    const handleReplaceAll = () => {
        if (!searchTerm || !editor) return;
        let count = 0;

        window.getSelection()?.removeAllRanges();
        // Start from beginning
        while ((window as any).find(searchTerm, false, false, true, false, false, false)) {
            editor.commands.insertContent(replaceTerm);
            count++;
        }

        window.getSelection()?.removeAllRanges();
        alert(`${count} replacements made.`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="absolute right-6 top-40 w-72 bg-white shadow-2xl border border-zinc-200 rounded-lg p-4 z-[55] no-print"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-zinc-800 uppercase tracking-tighter">Navigation</span>
                        <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex bg-zinc-100 rounded-md p-0.5 mb-4">
                        <button
                            onClick={() => setMode('search')}
                            className={cn("flex-1 py-1 text-[10px] font-bold rounded", mode === 'search' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500")}
                        >Search</button>
                        <button
                            onClick={() => setMode('replace')}
                            className={cn("flex-1 py-1 text-[10px] font-bold rounded", mode === 'replace' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500")}
                        >Replace</button>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder={mode === 'replace' ? "Find value..." : "Search document..."}
                                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-[#2b579a] focus:border-[#2b579a] outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleFindNext(); }}
                            />
                        </div>

                        {mode === 'replace' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="New value..."
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-[#2b579a] focus:border-[#2b579a] outline-none"
                                    value={replaceTerm}
                                    onChange={(e) => setReplaceTerm(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        {mode === 'search' ? (
                            <>
                                <button onClick={handleFindPrev} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded transition-colors" disabled={!searchTerm}>
                                    <ChevronUp size={14} /> Previous
                                </button>
                                <button onClick={handleFindNext} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-[#2b579a] hover:bg-[#1a478a] text-white text-[10px] font-bold rounded transition-colors" disabled={!searchTerm}>
                                    Next <ChevronDown size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex items-center gap-2">
                                    <button onClick={handleFindNext} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded transition-colors" disabled={!searchTerm}>
                                        Find Next
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleReplace} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-[#2b579a] hover:bg-[#1a478a] text-white text-[10px] font-bold rounded transition-colors" disabled={!searchTerm}>
                                        <Check size={12} /> Replace
                                    </button>
                                    <button onClick={handleReplaceAll} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-black text-white text-[10px] font-bold rounded transition-colors" disabled={!searchTerm}>
                                        Replace All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100">
                        <div className="text-[10px] text-zinc-400 font-medium mb-2">RESULTS</div>
                        {searchTerm ? (
                            <div className="text-center text-zinc-500 text-[11px] font-medium p-4 bg-zinc-50 rounded border border-zinc-100">
                                <span className="text-[#2b579a] font-bold text-lg block mb-1">{matchCount}</span>
                                matches found
                            </div>
                        ) : (
                            <div className="py-6 text-center text-zinc-300 text-[11px] italic">
                                Type your search here...
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default memo(SearchPanel);
