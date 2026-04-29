"use client";

import React, { memo } from "react";
import {
    FileText,
    CheckCircle2,
    BookOpen,
    Layout,
    Globe,
    Minus,
    Plus,
    HelpCircle
} from "lucide-react";
import { cn } from "./utils";

interface EditorStatusBarProps {
    currentPage: number;
    pageCount: number;
    wordCount: number;
    viewMode: 'print' | 'read' | 'web';
    setViewMode: (mode: 'print' | 'read' | 'web') => void;
    zoom: number;
    setZoom: (zoom: number) => void;
}

const EditorStatusBar = ({
    currentPage,
    pageCount,
    wordCount,
    viewMode,
    setViewMode,
    zoom,
    setZoom
}: EditorStatusBarProps) => {
    return (
        <div className="h-6 bg-[#2b579a] dark:bg-[#0d0d1a] text-white flex items-center justify-between px-3 text-[10px] z-[60] shrink-0 no-print shadow-[0_-1px_3px_rgba(0,0,0,0.1)] overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-4 h-full shrink-0">
                <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors">
                    <FileText size={12} strokeWidth={2.5} />
                    <span className="font-bold uppercase tracking-tighter">PAGE {currentPage} / {pageCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-l border-white/10 ml-[-12px]">
                    <span className="font-bold uppercase tracking-tighter">{wordCount} WORDS</span>
                </div>
                <div className="hidden lg:flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-l border-white/10">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    <span className="font-bold uppercase tracking-tighter">Accessibility: Good</span>
                </div>
            </div>
            <div className="flex items-center gap-0 h-full shrink-0">
                <div className="flex items-center h-full mr-4 gap-0.5">
                    <button onClick={() => setViewMode('read')} className={cn("p-1 px-2 h-full transition-colors hover:bg-white/10", viewMode === 'read' && "bg-white/20 shadow-inner")} title="Read Mode"><BookOpen size={13} strokeWidth={2.5} /></button>
                    <button onClick={() => setViewMode('print')} className={cn("p-1 px-2 h-full transition-colors hover:bg-white/10", viewMode === 'print' && "bg-white/20 shadow-inner")} title="Print Layout"><Layout size={13} strokeWidth={2.5} /></button>
                    <button onClick={() => setViewMode('web')} className={cn("p-1 px-2 h-full transition-colors hover:bg-white/10", viewMode === 'web' && "bg-white/20 shadow-inner")} title="Web Layout"><Globe size={13} strokeWidth={2.5} /></button>
                </div>
                <div className="flex items-center gap-2 px-3 border-l border-white/10 h-full">
                    <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="hover:bg-white/10 p-1 rounded transition-colors"><Minus size={11} strokeWidth={3} /></button>
                    <div className="w-24 h-1 bg-white/20 rounded-full relative group cursor-pointer">
                        <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${(zoom / 200) * 100}%` }}></div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md hidden group-hover:block" style={{ left: `${(zoom / 200) * 100}%` }}></div>
                    </div>
                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="hover:bg-white/10 p-1 rounded transition-colors"><Plus size={11} strokeWidth={3} /></button>
                    <span className="w-10 text-right font-black text-[9px]">{zoom}%</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto pl-3">
                    <button onClick={() => alert('Connecting to help center...')} className="p-1 px-2 hover:bg-white/10 rounded transition-colors text-white" title="Help">
                        <HelpCircle size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(EditorStatusBar);
