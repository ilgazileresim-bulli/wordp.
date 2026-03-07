"use client";

import React, { memo, useState } from "react";
import { Palette, Pipette, Baseline as BaselineIcon, AlignJustify, FileText, Droplet, Square as SquareIcon, ChevronDown, RotateCcw, Image as ImageIcon, PaintBucket, Sparkles, Type, SunDim, Moon, Flower2, CircleDot, Scaling } from "lucide-react";
import { cn } from "../utils";

interface DesignTabProps {
    watermark: string | null;
    toggleWatermark: (text: string) => void;
    pageColor: string;
    setPageColor: (color: string) => void;
    editor?: any;
}

const PAGE_COLORS = [
    { name: "Beyaz", value: "#ffffff" },
    { name: "Krem", value: "#fdf6e3" },
    { name: "Açık Gri", value: "#f3f4f6" },
    { name: "Açık Mavi", value: "#eff6ff" },
    { name: "Açık Yeşil", value: "#f0fdf4" },
    { name: "Açık Sarı", value: "#fefce8" },
    { name: "Açık Pembe", value: "#fdf2f8" },
    { name: "Koyu", value: "#1e293b" },
];

const THEME_PRESETS = [
    { name: "Kurumsal", heading: "#1e3a5f", body: "#334155", accent: "#2563eb", font: "Georgia, serif" },
    { name: "Modern", heading: "#0f172a", body: "#475569", accent: "#7c3aed", font: "'Segoe UI', sans-serif" },
    { name: "Klasik", heading: "#1a1a1a", body: "#333333", accent: "#b91c1c", font: "'Times New Roman', serif" },
    { name: "Minimal", heading: "#111827", body: "#6b7280", accent: "#059669", font: "'Helvetica Neue', sans-serif" },
    { name: "Akademik", heading: "#1a202c", body: "#4a5568", accent: "#2b6cb0", font: "'Cambria', 'Georgia', serif" },
    { name: "Doğa", heading: "#22543d", body: "#4a5568", accent: "#38a169", font: "'Trebuchet MS', sans-serif" },
    { name: "Gece", heading: "#e2e8f0", body: "#a0aec0", accent: "#805ad5", font: "'Segoe UI', sans-serif" },
    { name: "Pastel", heading: "#553c9a", body: "#6b7280", accent: "#d53f8c", font: "'Poppins', sans-serif" },
];

const WATERMARK_PRESETS = ["TASLAK", "GİZLİ", "ÖNEMLİ", "KOPYA", "ÖRNEK", "ONAYLANDI"];

const BORDER_PRESETS = [
    { name: "Kenarlık Yok", value: "none" },
    { name: "İnce Çerçeve", value: "1px solid #ccc" },
    { name: "Kalın Çerçeve", value: "3px solid #333" },
    { name: "Çift Çerçeve", value: "3px double #2b579a" },
    { name: "Kesik Çizgi", value: "2px dashed #666" },
    { name: "Noktalı", value: "2px dotted #999" },
    { name: "Gölgeli", value: "2px solid #2b579a" },
];

const DesignTab = ({
    watermark,
    toggleWatermark,
    pageColor,
    setPageColor,
    editor
}: DesignTabProps) => {
    const [showColors, setShowColors] = useState(false);
    const [showWatermarks, setShowWatermarks] = useState(false);
    const [showBorders, setShowBorders] = useState(false);
    const [activeBorder, setActiveBorder] = useState("none");
    const [showTextures, setShowTextures] = useState(false);
    const [fontScale, setFontScale] = useState(100);
    const [showFontScale, setShowFontScale] = useState(false);

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Temalar Group */}
            <div className="flex flex-col items-center h-full min-w-[380px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5 max-w-[400px] custom-scrollbar overflow-x-auto pb-1">
                    {THEME_PRESETS.map((theme, i) => (
                        <div key={i}
                            className="flex flex-col p-1.5 border border-[#dadada] bg-white rounded-sm min-w-[90px] hover:border-blue-400 cursor-pointer shadow-sm group/card transition-all hover:shadow-md"
                            onClick={() => {
                                if (editor) {
                                    editor.chain().focus().selectAll().setFontFamily(theme.font).run();
                                }
                            }}>
                            <div className="text-[9px] font-black truncate" style={{ color: theme.heading }}>{theme.name}</div>
                            <div className="text-[7px] truncate" style={{ color: theme.body }}>Gövde metni</div>
                            <div className="mt-1 h-[3px] w-full flex gap-0.5 rounded overflow-hidden">
                                <div className="h-full w-1/3" style={{ backgroundColor: theme.accent }}></div>
                                <div className="h-full w-1/3" style={{ backgroundColor: theme.heading }}></div>
                                <div className="h-full w-1/3 bg-zinc-200"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Temalar</span>
            </div>

            {/* Sayfa Arka Planı Group */}
            <div className="flex flex-col items-center h-full min-w-[240px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    {/* Filigran */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                            onClick={() => { setShowWatermarks(!showWatermarks); setShowColors(false); setShowBorders(false); }}>
                            <FileText size={20} className={cn(watermark ? "text-red-500" : "text-zinc-400")} strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">Filigran</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showWatermarks && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[140px] py-1">
                                {WATERMARK_PRESETS.map((wm) => (
                                    <button key={wm}
                                        className={cn("w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50 transition-colors",
                                            watermark === wm ? "text-[#2b579a] bg-blue-50" : "text-zinc-700")}
                                        onClick={() => { toggleWatermark(wm); setShowWatermarks(false); }}>
                                        {wm}
                                    </button>
                                ))}
                                {watermark && (
                                    <>
                                        <div className="h-px bg-zinc-200 my-1" />
                                        <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50"
                                            onClick={() => { toggleWatermark(''); setShowWatermarks(false); }}>
                                            Filigranı Kaldır
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sayfa Rengi */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                            onClick={() => { setShowColors(!showColors); setShowWatermarks(false); setShowBorders(false); }}>
                            <Droplet size={20} className="text-orange-500" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Sayfa Rengi</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showColors && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 min-w-[160px]">
                                <div className="grid grid-cols-4 gap-1.5">
                                    {PAGE_COLORS.map((c) => (
                                        <button key={c.value}
                                            className={cn("w-8 h-8 rounded-md border-2 transition-all hover:scale-110",
                                                pageColor === c.value ? "border-[#2b579a] ring-2 ring-blue-200" : "border-zinc-200")}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                            onClick={() => { setPageColor(c.value); setShowColors(false); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sayfa Kenarlıkları */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                            onClick={() => { setShowBorders(!showBorders); setShowColors(false); setShowWatermarks(false); }}>
                            <SquareIcon size={20} className={cn(activeBorder !== "none" ? "text-[#2b579a]" : "text-zinc-400")} strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Kenarlıklar</span>
                            <ChevronDown size={10} className="text-zinc-400" />
                        </div>
                        {showBorders && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[160px] py-1">
                                {BORDER_PRESETS.map((b) => (
                                    <button key={b.name}
                                        className={cn("w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-blue-50 flex items-center gap-2 transition-colors",
                                            activeBorder === b.value ? "text-[#2b579a] bg-blue-50" : "text-zinc-700")}
                                        onClick={() => {
                                            const pages = document.querySelectorAll('.document-page, [data-page]');
                                            const editorEl = document.querySelector('.ProseMirror')?.parentElement?.parentElement as HTMLElement;
                                            if (pages.length > 0) {
                                                pages.forEach(p => { (p as HTMLElement).style.border = b.value; if (b.name === "Gölgeli") (p as HTMLElement).style.boxShadow = "4px 4px 12px rgba(0,0,0,0.15)"; else (p as HTMLElement).style.boxShadow = ""; });
                                            } else if (editorEl) {
                                                editorEl.style.border = b.value;
                                                if (b.name === "Gölgeli") editorEl.style.boxShadow = "4px 4px 12px rgba(0,0,0,0.15)";
                                                else editorEl.style.boxShadow = "";
                                            }
                                            setActiveBorder(b.value);
                                            setShowBorders(false);
                                        }}>
                                        <div className="w-10 h-3" style={{ border: b.value === "none" ? "1px solid #ddd" : b.value, borderRadius: 2 }} />
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Sayfa Arka Planı</span>
            </div>

            {/* Paragraf Aralığı Group */}
            <div className="flex flex-col items-center h-full min-w-[140px] px-3">
                <div className="flex-1 flex flex-col justify-center gap-1">
                    {[
                        { label: "Sıkı", value: "1" },
                        { label: "Normal", value: "1.5" },
                        { label: "Geniş", value: "2" },
                        { label: "Çok Geniş", value: "2.5" },
                    ].map((spacing) => (
                        <button key={spacing.value}
                            className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700 leading-tight transition-colors"
                            onClick={() => {
                                const element = document.querySelector('.ProseMirror') as HTMLElement;
                                if (element) element.style.lineHeight = spacing.value;
                            }}>
                            <AlignJustify size={12} className="text-zinc-500" />
                            {spacing.label} ({spacing.value}x)
                        </button>
                    ))}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Paragraf Aralığı</span>
            </div>

            {/* Gelişmiş Tasarım */}
            <div className="flex flex-col items-center h-full min-w-[380px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        if (editor) editor.chain().focus().selectAll().setFontFamily('inherit').unsetAllMarks().run();
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) { el.style.lineHeight = ''; el.style.fontFamily = ''; }
                    }} title="Varsayılana Sıfırla" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <RotateCcw size={18} className="text-red-400" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Sıfırla</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror')?.parentElement?.parentElement as HTMLElement;
                        if (el) {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = pageColor;
                            input.addEventListener('input', (e) => { setPageColor((e.target as HTMLInputElement).value); });
                            input.click();
                        }
                    }} title="Özel Renk Seç" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Pipette size={18} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Özel Renk</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => { setShowTextures(!showTextures); setShowFontScale(false); }} title="Sayfa Dokusu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                            <CircleDot size={18} className="text-amber-600" strokeWidth={2} />
                            <span className="text-[8px] font-black text-zinc-700 pt-0.5">Doku</span>
                        </button>
                        {showTextures && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[140px] py-1">
                                {[['none', 'Yok'], ['repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)', 'Çizgili'], ['radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)', 'Noktalı'], ['linear-gradient(0deg, rgba(0,0,0,0.03) 1px, transparent 1px)', 'Izgaralı']].map(([v, l]) => (
                                    <button key={l} className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => {
                                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                                        if (el) el.style.backgroundImage = v;
                                        setShowTextures(false);
                                    }}>{l}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror')?.parentElement?.parentElement as HTMLElement;
                        if (el) el.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    }} title="Gradyan Arka Plan" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Sparkles size={18} className="text-indigo-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Gradyan</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => { setShowFontScale(!showFontScale); setShowTextures(false); }} title={`Yazı Ölçeği: %${fontScale}`} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                            <Scaling size={18} className="text-emerald-600" strokeWidth={2} />
                            <span className="text-[8px] font-black text-zinc-700 pt-0.5">%{fontScale}</span>
                        </button>
                        {showFontScale && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[80px] py-1">
                                {[80, 90, 100, 110, 120, 150].map(s => (
                                    <button key={s} className={cn("w-full text-left px-3 py-1 text-[10px] font-bold hover:bg-blue-50", fontScale === s && "text-[#2b579a] bg-blue-50")} onClick={() => {
                                        setFontScale(s);
                                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                                        if (el) el.style.fontSize = `${s}%`;
                                        setShowFontScale(false);
                                    }}>%{s}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            el.style.fontFamily = '"Garamond", "Times New Roman", serif';
                            el.style.letterSpacing = '0.5px';
                        }
                    }} title="Zarif Yazı Tipi" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Type size={18} className="text-rose-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Zarif</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Gelişmiş Tasarım</span>
            </div>
        </div>
    );
};

export default memo(DesignTab);
