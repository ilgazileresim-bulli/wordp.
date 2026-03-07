"use client";

import React, { memo } from "react";
import { Save, Undo, Redo, Search, ChevronDown, Printer, X, RefreshCw, FileText, Download } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EditorTopBarProps {
    isSaving: boolean;
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onPrint: () => void;
    onBack: () => void;
    onExportPdf: () => void;
    onExportDocx: () => void;
}

const EditorTopBar = ({
    isSaving,
    onSave,
    onUndo,
    onRedo,
    onPrint,
    onBack,
    onExportPdf,
    onExportDocx
}: EditorTopBarProps) => {
    return (
        <div className="h-10 bg-[#2b579a] dark:bg-[#0d0d1a] flex items-center px-4 z-[60] shrink-0 no-print border-b border-[#1a478a] dark:border-[#1e1e30]">
            <div className="flex items-center gap-3 min-w-[300px]">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-tighter">Otomatik Kaydet</span>
                    <div className="w-8 h-4 bg-white/20 rounded-full relative cursor-pointer ring-1 ring-white/10">
                        <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                    <button onClick={onSave} className={cn("p-1.5 hover:bg-white/10 rounded transition-colors text-white relative", isSaving && "animate-pulse")} title="Kaydet">
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                    </button>
                    <button onClick={onExportPdf} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white flex items-center gap-1" title="PDF İndir">
                        <FileText size={16} strokeWidth={2.5} className="text-red-300" />
                        <span className="text-[9px] font-black uppercase tracking-tighter hidden sm:inline">PDF</span>
                    </button>
                    <button onClick={onExportDocx} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white flex items-center gap-1" title="Word İndir">
                        <Download size={16} strokeWidth={2.5} className="text-blue-200" />
                        <span className="text-[9px] font-black uppercase tracking-tighter hidden sm:inline">DOCX</span>
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button onClick={onUndo} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white" title="Geri Al"><Undo size={16} strokeWidth={2.5} /></button>
                    <button onClick={onRedo} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white" title="Yinele"><Redo size={16} strokeWidth={2.5} /></button>
                </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <div className="flex items-center gap-2 px-6 py-1 bg-white/10 rounded-md border border-white/5 max-w-sm w-full cursor-pointer hover:bg-white/15 transition-colors group">
                    <Search size={14} className="text-white/60 group-hover:text-white" />
                    <span className="text-xs font-bold text-white/90 truncate">Belge1 - Word P.</span>
                    <ChevronDown size={14} className="text-white/60 ml-auto" />
                </div>
            </div>
            <div className="flex items-center gap-1 min-w-[200px] justify-end">
                <button onClick={onPrint} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white" title="Yazdır"><Printer size={18} strokeWidth={2.5} /></button>
                <button onClick={onBack} className="p-1.5 hover:bg-red-500 rounded transition-colors text-white" title="Kapat"><X size={18} strokeWidth={2.5} /></button>
            </div>
        </div>
    );
};

export default memo(EditorTopBar);
