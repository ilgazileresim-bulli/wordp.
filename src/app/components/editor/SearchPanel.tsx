"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchPanel = ({ isOpen, onClose }: SearchPanelProps) => {
    const [searchTerm, setSearchTerm] = useState("");

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
                        <span className="text-xs font-black text-zinc-800 uppercase tracking-tighter">Gezinti</span>
                        <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex bg-zinc-100 rounded-md p-0.5 mb-4">
                        <button className="flex-1 py-1 text-[10px] font-bold bg-white shadow-sm rounded">Gezin</button>
                        <button className="flex-1 py-1 text-[10px] font-bold text-zinc-500">Değiştir</button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Belgede ara..."
                            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-[#2b579a] focus:border-[#2b579a] outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                        <div className="text-[10px] text-zinc-400 font-medium">SONUÇLAR</div>
                        <div className="py-8 text-center text-zinc-300 text-[11px] italic">
                            Aramanızı buraya yazın...
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default memo(SearchPanel);
