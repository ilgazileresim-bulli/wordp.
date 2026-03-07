"use client";

import React, { memo, useState } from "react";
import { Grid3X3, RotateCcw, Square as SquareIcon, Columns, File as FileIcon, Hash, AlignJustify, ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon, Layers, AlignLeft, RotateCw, ChevronDown, SeparatorHorizontal, ListOrdered, WrapText, CornerDownRight, MinusSquare, RotateCcw as ResetIcon } from "lucide-react";
import { cn } from "../utils";

interface LayoutTabProps {
    margins: number;
    setMargins: (margins: number) => void;
    orientation: "portrait" | "landscape";
    setOrientation: (orientation: "portrait" | "landscape") => void;
    isSplit: boolean;
    setIsSplit: (split: boolean) => void;
}

const MARGIN_PRESETS = [
    { name: "Normal", value: 96, desc: "Üst: 2.54cm, Alt: 2.54cm" },
    { name: "Dar", value: 48, desc: "Üst: 1.27cm, Alt: 1.27cm" },
    { name: "Geniş", value: 144, desc: "Üst: 3.81cm, Alt: 3.81cm" },
    { name: "Orta", value: 72, desc: "Üst: 1.91cm, Alt: 1.91cm" },
];

const PAGE_SIZES = [
    { name: "A4", desc: "21cm × 29.7cm", width: 794, height: 1123 },
    { name: "Letter", desc: "21.59cm × 27.94cm", width: 816, height: 1056 },
    { name: "Legal", desc: "21.59cm × 35.56cm", width: 816, height: 1344 },
    { name: "A5", desc: "14.8cm × 21cm", width: 559, height: 794 },
];

const LayoutTab = ({
    margins,
    setMargins,
    orientation,
    setOrientation,
    isSplit,
    setIsSplit
}: LayoutTabProps) => {
    const [showMargins, setShowMargins] = useState(false);
    const [showSizes, setShowSizes] = useState(false);
    const [showColumns, setShowColumns] = useState(false);
    const [showBreaks, setShowBreaks] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [lineNumbersActive, setLineNumbersActive] = useState(false);
    const [selectedSize, setSelectedSize] = useState("A4");
    const [indentValue, setIndentValue] = useState(0);
    const [spacingValue, setSpacingValue] = useState(0);
    const [hyphenation, setHyphenation] = useState(false);
    const [showPageNumPos, setShowPageNumPos] = useState(false);

    const applyIndent = (delta: number) => {
        const newVal = Math.max(0, indentValue + delta);
        setIndentValue(newVal);
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (el) {
            el.style.paddingLeft = newVal + 'px';
            el.style.paddingRight = newVal + 'px';
        }
    };

    const applySpacing = (delta: number) => {
        const newVal = Math.max(0, spacingValue + delta);
        setSpacingValue(newVal);
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (el) {
            // Apply spacing before/after paragraphs
            const paras = el.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
            paras.forEach(p => {
                (p as HTMLElement).style.marginTop = newVal + 'px';
                (p as HTMLElement).style.marginBottom = newVal + 'px';
            });
        }
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Sayfa Yapısı Group */}
            <div className="flex flex-col items-center h-full min-w-[320px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    {/* Kenar Boşlukları */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group min-w-[50px]"
                            onClick={() => { setShowMargins(!showMargins); setShowSizes(false); setShowColumns(false); }}>
                            <Grid3X3 size={20} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Kenar Boşlukları</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showMargins && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[180px] py-1">
                                {MARGIN_PRESETS.map((m) => (
                                    <button key={m.name}
                                        className={cn("w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex flex-col",
                                            margins === m.value ? "bg-blue-50" : "")}
                                        onClick={() => { setMargins(m.value); setShowMargins(false); }}>
                                        <span className={cn("text-[10px] font-bold", margins === m.value ? "text-[#2b579a]" : "text-zinc-800")}>{m.name}</span>
                                        <span className="text-[8px] text-zinc-400">{m.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Yönlendirme */}
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group min-w-[50px]"
                        onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}>
                        <RotateCcw size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">{orientation === "portrait" ? "Dikey" : "Yatay"}</span>
                    </div>

                    {/* Boyut */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group min-w-[50px]"
                            onClick={() => { setShowSizes(!showSizes); setShowMargins(false); setShowColumns(false); }}>
                            <SquareIcon size={20} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">{selectedSize}</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showSizes && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[160px] py-1">
                                {PAGE_SIZES.map((s) => (
                                    <button key={s.name}
                                        className={cn("w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex flex-col",
                                            selectedSize === s.name ? "bg-blue-50" : "")}
                                        onClick={() => {
                                            setSelectedSize(s.name);
                                            // Apply page size to document container
                                            const pageEl = document.querySelector('.document-page, [data-page]') as HTMLElement;
                                            const editorContainer = document.querySelector('[style*="overflow: visible"]') as HTMLElement;
                                            if (pageEl) {
                                                pageEl.style.width = s.width + 'px';
                                                pageEl.style.minHeight = s.height + 'px';
                                            } else if (editorContainer?.parentElement) {
                                                editorContainer.parentElement.style.width = s.width + 'px';
                                                editorContainer.parentElement.style.minHeight = s.height + 'px';
                                            }
                                            setShowSizes(false);
                                        }}>
                                        <span className={cn("text-[10px] font-bold", selectedSize === s.name ? "text-[#2b579a]" : "text-zinc-800")}>{s.name}</span>
                                        <span className="text-[8px] text-zinc-400">{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sütunlar */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group min-w-[50px]"
                            onClick={() => { setShowColumns(!showColumns); setShowMargins(false); setShowSizes(false); }}>
                            <Columns size={20} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">Sütunlar</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showColumns && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[120px] py-1">
                                {["1 Sütun", "2 Sütun", "3 Sütun"].map((label, i) => (
                                    <button key={label}
                                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-800 hover:bg-blue-50 transition-colors"
                                        onClick={() => {
                                            const el = document.querySelector('.ProseMirror') as HTMLElement;
                                            if (el) {
                                                el.style.columnCount = String(i + 1);
                                                el.style.columnGap = '2em';
                                            }
                                            setShowColumns(false);
                                        }}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Kesmeler */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group min-w-[50px]"
                            title="Kesmeler"
                            onClick={() => { setShowBreaks(!showBreaks); setShowMargins(false); setShowSizes(false); setShowColumns(false); }}>
                            <SeparatorHorizontal size={20} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">Kesmeler</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showBreaks && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[180px] py-1">
                                <p className="px-3 py-1 text-[8px] font-bold text-zinc-400 uppercase">Sayfa Kesmeleri</p>
                                <button
                                    className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-800 hover:bg-blue-50 transition-colors"
                                    onClick={() => {
                                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                                        if (el) {
                                            const hr = document.createElement('div');
                                            hr.style.cssText = 'page-break-before: always; border-top: 2px dashed #ccc; margin: 24px 0; height: 0;';
                                            el.appendChild(hr);
                                        }
                                        setShowBreaks(false);
                                    }}>Sayfa Sonu</button>
                                <div className="border-t border-zinc-100 my-1" />
                                <p className="px-3 py-1 text-[8px] font-bold text-zinc-400 uppercase">Bölüm Kesmeleri</p>
                                <button
                                    className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-800 hover:bg-blue-50"
                                    onClick={() => {
                                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                                        if (el) {
                                            const section = document.createElement('div');
                                            section.style.cssText = 'border-top: 1px dashed #999; margin: 20px 0; position: relative;';
                                            section.innerHTML = '<span style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: white; padding: 0 8px; font-size: 9px; color: #999; font-weight: bold;">Bölüm Sonu</span>';
                                            el.appendChild(section);
                                        }
                                        setShowBreaks(false);
                                    }}>Sonraki Sayfa</button>
                                <button
                                    className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-800 hover:bg-blue-50"
                                    onClick={() => {
                                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                                        if (el) {
                                            const section = document.createElement('div');
                                            section.style.cssText = 'border-top: 1px dotted #bbb; margin: 16px 0;';
                                            el.appendChild(section);
                                        }
                                        setShowBreaks(false);
                                    }}>Sürekli</button>
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Sayfa Yapısı</span>
            </div>

            {/* Paragraf Group */}
            <div className="flex flex-col items-center h-full min-w-[200px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-zinc-500 w-12">Girinti:</span>
                            <div className="flex items-center bg-white border rounded">
                                <button className="px-1.5 py-0.5 hover:bg-zinc-100 text-[10px] font-bold border-r"
                                    onClick={() => applyIndent(-10)}>
                                    <ArrowDownIcon size={10} className="rotate-90" />
                                </button>
                                <span className="text-[9px] font-bold px-2 min-w-[28px] text-center">{indentValue}</span>
                                <button className="px-1.5 py-0.5 hover:bg-zinc-100 text-[10px] font-bold border-l"
                                    onClick={() => applyIndent(10)}>
                                    <ArrowUpIcon size={10} className="rotate-90" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-zinc-500 w-12">Aralık:</span>
                            <div className="flex items-center bg-white border rounded">
                                <button className="px-1.5 py-0.5 hover:bg-zinc-100 text-[10px] font-bold border-r"
                                    onClick={() => applySpacing(-4)}>
                                    <ArrowDownIcon size={10} />
                                </button>
                                <span className="text-[9px] font-bold px-2 min-w-[28px] text-center">{spacingValue}</span>
                                <button className="px-1.5 py-0.5 hover:bg-zinc-100 text-[10px] font-bold border-l"
                                    onClick={() => applySpacing(4)}>
                                    <ArrowUpIcon size={10} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Paragraf</span>
            </div>

            {/* Düzenle Group */}
            <div className="flex flex-col items-center h-full min-w-[140px] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                        onClick={() => setIsSplit(!isSplit)}>
                        <Layers size={20} className={cn(isSplit ? "text-[#2b579a]" : "text-zinc-400")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">{isSplit ? "Birleştir" : "Böl"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                        title="Satır Numaraları"
                        onClick={() => {
                            setLineNumbersActive(!lineNumbersActive);
                            const el = document.querySelector('.ProseMirror') as HTMLElement;
                            if (el) {
                                if (!lineNumbersActive) {
                                    el.style.counterReset = 'line';
                                    el.classList.add('line-numbers-active');
                                    // Add CSS if not exists
                                    if (!document.getElementById('line-numbers-style')) {
                                        const style = document.createElement('style');
                                        style.id = 'line-numbers-style';
                                        style.textContent = `.line-numbers-active p::before, .line-numbers-active h1::before, .line-numbers-active h2::before, .line-numbers-active h3::before { counter-increment: line; content: counter(line) "."; position: absolute; left: -40px; color: #999; font-size: 10px; font-family: monospace; } .line-numbers-active p, .line-numbers-active h1, .line-numbers-active h2, .line-numbers-active h3 { position: relative; }`;
                                        document.head.appendChild(style);
                                    }
                                } else {
                                    el.classList.remove('line-numbers-active');
                                }
                            }
                        }}>
                        <ListOrdered size={20} className={cn(lineNumbersActive ? "text-[#2b579a]" : "text-zinc-400")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Satır No</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Düzenleme</span>
            </div>

            {/* Yeni Araçlar Group */}
            <div className="flex flex-col items-center h-full min-w-[240px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        setHyphenation(!hyphenation);
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) el.style.hyphens = !hyphenation ? 'auto' : 'none';
                    }} title="Heceleme" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-14 transition-all", hyphenation ? "btn-active" : "hover:bg-white/60")}>
                        <WrapText size={18} className={cn(hyphenation ? "text-[#2b579a]" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Heceleme</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowPageNumPos(!showPageNumPos)} title="Sayfa Numarası Konumu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                            <Hash size={18} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[8px] font-black text-zinc-700 pt-0.5">Sayfa No</span>
                        </button>
                        {showPageNumPos && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[120px] py-1">
                                {['Üst Orta', 'Alt Orta', 'Üst Sağ', 'Alt Sağ'].map(pos => (
                                    <button key={pos} className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => setShowPageNumPos(false)}>{pos}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            const br = document.createElement('div');
                            br.style.cssText = 'break-before: column; border-top: 1px dotted #aaa; margin: 12px 0;';
                            el.appendChild(br);
                        }
                    }} title="Sütun Kesme" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <CornerDownRight size={18} className="text-purple-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Sütun K.</span>
                    </button>
                    <button onClick={() => {
                        setIndentValue(0);
                        setSpacingValue(0);
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            el.style.paddingLeft = '';
                            el.style.paddingRight = '';
                            el.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(p => {
                                (p as HTMLElement).style.marginTop = '';
                                (p as HTMLElement).style.marginBottom = '';
                            });
                        }
                    }} title="Girintileri Sıfırla" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <ResetIcon size={18} className="text-red-400" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Sıfırla</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Gelişmiş</span>
            </div>
        </div>
    );
};

export default memo(LayoutTab);
