"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface NavPaneProps {
    isOpen: boolean;
    onClose: () => void;
}

const NavPane = ({ isOpen, onClose }: NavPaneProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute md:relative z-50 md:z-auto h-full bg-white dark:bg-[#16162a] border-r border-zinc-300 dark:border-slate-700 overflow-hidden flex flex-col shrink-0 no-print shadow-2xl md:shadow-none"
                >
                    <div className="p-3 border-b border-zinc-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gezinti</span>
                        <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-slate-700 rounded"><X size={12} /></button>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-zinc-100 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="h-2 w-1/2 bg-zinc-100 dark:bg-slate-700 rounded animate-pulse" />
                        </div>
                        <div className="text-[11px] text-zinc-400 italic text-center mt-10">
                            Başlıklar, sayfalar veya sonuçlar burada görünecektir.
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default memo(NavPane);
