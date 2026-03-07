"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { EditorContent } from '@tiptap/react';
import { cn, PAGE_HEIGHT_MM, PX_PER_MM } from "./utils";

interface DocumentWorkplaceProps {
    editor: any;
    viewMode: 'print' | 'read' | 'web';
    zoom: number;
    margins: number;
    orientation: "portrait" | "landscape";
    pageColor: string;
    watermark: string | null;
    showRuler: boolean;
    showGridlines: boolean;
    isSplit: boolean;
    pageCount: number;
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    editorContainerRef: React.RefObject<HTMLDivElement | null>;
}

const DocumentWorkplace = ({
    editor,
    viewMode,
    zoom,
    margins,
    orientation,
    pageColor,
    watermark,
    showRuler,
    showGridlines,
    isSplit,
    pageCount,
    handleScroll,
    editorContainerRef
}: DocumentWorkplaceProps) => {
    return (
        <div
            className={cn(
                "flex-1 overflow-auto flex flex-col items-center custom-scrollbar shadow-inner relative transition-all duration-500",
                viewMode === 'read' ? "bg-zinc-800" : "bg-[#f3f4f6] dark:bg-[#0c0c18]"
            )}
            onScroll={handleScroll}
        >
            {/* Horizontal Ruler */}
            {showRuler && viewMode !== 'web' && (
                <div className="sticky top-0 left-0 right-0 h-8 bg-[#f3f4f6] dark:bg-[#0c0c18] border-b border-zinc-300 dark:border-slate-700 z-[45] flex items-end px-[calc(50%-105mm)] no-print">
                    <div className="w-[210mm] h-4 flex items-end border-l border-r border-zinc-400 dark:border-slate-600 relative">
                        {Array.from({ length: 21 }).map((_, i) => (
                            <div key={i} className="absolute h-2 border-l border-zinc-400 dark:border-slate-600 text-[8px] text-zinc-500 dark:text-slate-400 pl-0.5" style={{ left: `${i * 10}mm` }}>
                                {i > 0 && i < 21 ? i : ""}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={cn(
                "flex flex-col items-center py-12 px-8 w-full min-h-full transition-all duration-500",
                isSplit && "grid grid-rows-2 h-full"
            )}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        padding: viewMode === 'web' ? '20mm 15%' : `${margins}px`,
                        backgroundColor: viewMode === 'read' ? '#fff9f0' : pageColor,
                        width: viewMode === 'web' ? "100%" : (orientation === "portrait" ? "210mm" : "297mm"),
                        minHeight: viewMode === 'web' ? "100%" : `${pageCount * PAGE_HEIGHT_MM}mm`,
                        zoom: zoom / 100,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundImage: showGridlines ? 'radial-gradient(#ddd 1px, transparent 1px)' : 'none',
                        backgroundSize: showGridlines ? '20px 20px' : 'auto'
                    }}
                    className={cn(
                        "shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-all duration-500 ring-1 ring-zinc-300 dark:ring-slate-700 bg-white motion-paper",
                        viewMode === 'web' && "ring-0 shadow-none my-0 max-w-full rounded-none"
                    )}
                >
                    {/* Watermark Overlay */}
                    {watermark && viewMode !== 'web' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                            <span className="text-[120px] font-black text-black opacity-[0.03] -rotate-45 select-none uppercase tracking-[0.2em]">
                                {watermark}
                            </span>
                        </div>
                    )}

                    {/* Visual Page Dividers */}
                    {viewMode === 'print' && Array.from({ length: pageCount - 1 }).map((_, i) => (
                        <div
                            key={`divider-${i}`}
                            className="absolute left-0 right-0 h-8 bg-[#f3f4f6] dark:bg-[#0c0c18] z-10 flex items-center justify-center no-print page-divider"
                            style={{ top: `${(i + 1) * PAGE_HEIGHT_MM}mm`, transform: 'translateY(-50%)', width: '3000px', left: '-1000px' }}
                        >
                            <div className="w-full border-t border-b border-zinc-300 dark:border-slate-700 h-2 bg-zinc-200/30 dark:bg-slate-800/30 shadow-inner" />
                        </div>
                    ))}

                    <div ref={editorContainerRef} className="relative z-20 w-full" style={{ overflow: 'visible', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: `${PAGE_HEIGHT_MM * PX_PER_MM - (margins * 2)}px` }}>
                        <EditorContent editor={editor} />
                    </div>

                    {/* Page Numbers Overlay */}
                    {Array.from({ length: pageCount }).map((_, i) => (
                        <div
                            key={`pagenum-${i}`}
                            className="absolute left-1/2 -translate-x-1/2 text-[11px] text-zinc-400 font-bold select-none pointer-events-none z-30 opacity-50 hover:opacity-100 transition-opacity"
                            style={{ top: `${(i + 1) * PAGE_HEIGHT_MM - 15}mm` }}
                        >
                            {i + 1} / {pageCount}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default memo(DocumentWorkplace);
