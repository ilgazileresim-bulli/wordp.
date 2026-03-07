"use client";

import React, { memo, useState } from "react";
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, Baseline as BaselineIcon, Highlighter, Scissors, Copy,
    ClipboardPaste as Paste, Sparkles, ChevronDown, MoveVertical, Search, RefreshCw,
    MousePointer2, ArrowRight as ArrowRightIcon, Subscript, Superscript, Strikethrough,
    Paintbrush, RemoveFormatting, Type, Palette, ListChecks, ArrowUpDown, Eye, EyeOff,
    Square, PaintBucket, Pilcrow, WrapText, Columns, LayoutList, Repeat, Eraser,
    CaseSensitive, LetterText, Sigma, IndentDecrease, IndentIncrease, Undo2, Redo2, TextCursorInput, ArrowLeftRight, ALargeSmall, ChevronsUp, Space, Brush, CopyCheck, Hash
} from "lucide-react";
import { cn } from "../utils";

interface HomeTabProps {
    editor: any;
    handleCopy: () => void;
    changeCase: (type: 'upper' | 'lower' | 'capitalize') => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
}

const FONT_FAMILIES = [
    "Arial", "Calibri", "Times New Roman", "Georgia", "Verdana",
    "Courier New", "Trebuchet MS", "Comic Sans MS", "Impact", "Segoe UI",
    "Tahoma", "Garamond", "Palatino Linotype", "Century Gothic", "Lucida Console",
    "Cambria", "Book Antiqua", "Candara", "Consolas", "Franklin Gothic Medium"
];

const FONT_SIZES = ["8", "9", "10", "10.5", "11", "12", "14", "16", "18", "20", "22", "24", "26", "28", "36", "48", "72", "96"];

const FONT_COLORS = [
    "#000000", "#434343", "#666666", "#999999", "#cccccc",
    "#c0392b", "#e74c3c", "#e67e22", "#f39c12", "#f1c40f",
    "#27ae60", "#2ecc71", "#1abc9c", "#16a085", "#2980b9",
    "#3498db", "#8e44ad", "#9b59b6", "#d35400", "#7f8c8d",
    "#2c3e50", "#e91e63", "#00bcd4", "#ff5722", "#795548",
];

const HIGHLIGHT_COLORS = [
    { name: "Sarı", value: "#fef08a" }, { name: "Yeşil", value: "#bbf7d0" },
    { name: "Mavi", value: "#bfdbfe" }, { name: "Pembe", value: "#fecdd3" },
    { name: "Turuncu", value: "#fed7aa" }, { name: "Mor", value: "#ddd6fe" },
    { name: "Kırmızı", value: "#fca5a5" }, { name: "Turkuaz", value: "#a5f3fc" },
    { name: "Gri", value: "#e5e7eb" }, { name: "Yeşil2", value: "#d9f99d" },
];

const LINE_SPACING_OPTIONS = [
    { label: "1.0", value: "1" }, { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" }, { label: "2.0", value: "2" },
    { label: "2.5", value: "2.5" }, { label: "3.0", value: "3" },
];

const STYLES = [
    { name: "Normal", level: 0 }, { name: "Aralık Yok", level: -1 },
    { name: "Başlık 1", level: 1 }, { name: "Başlık 2", level: 2 },
    { name: "Başlık 3", level: 3 }, { name: "Başlık 4", level: 4 },
    { name: "Başlık", level: 1 }, { name: "Altyazı", level: 2 },
    { name: "Alıntı", level: -2 }, { name: "Vurgulu", level: -3 },
];

const BORDER_STYLES = [
    { name: "Kenarlık Yok", css: "none" },
    { name: "Alt Kenarlık", css: "border-bottom: 1px solid #333" },
    { name: "Üst Kenarlık", css: "border-top: 1px solid #333" },
    { name: "Sol Kenarlık", css: "border-left: 3px solid #2b579a" },
    { name: "Kutu Kenarlık", css: "border: 1px solid #333" },
    { name: "Kalın Kutu", css: "border: 2px solid #333" },
    { name: "Gölgeli Kutu", css: "border: 1px solid #333; box-shadow: 3px 3px 6px rgba(0,0,0,0.15)" },
];

const SHADING_COLORS = [
    "#ffffff", "#f8f9fa", "#e5e7eb", "#d1d5db", "#fef3c7",
    "#dbeafe", "#dcfce7", "#fce7f3", "#f3e8ff", "#fed7aa",
];

const HomeTab = ({
    editor, handleCopy, changeCase, showSearch, setShowSearch
}: HomeTabProps) => {
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const [showCaseMenu, setShowCaseMenu] = useState(false);
    const [showLineSpacing, setShowLineSpacing] = useState(false);
    const [showFontColor, setShowFontColor] = useState(false);
    const [showHighlightColor, setShowHighlightColor] = useState(false);
    const [showBorders, setShowBorders] = useState(false);
    const [showShading, setShowShading] = useState(false);
    const [showTextEffects, setShowTextEffects] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [formatPainterActive, setFormatPainterActive] = useState(false);
    const [savedMarks, setSavedMarks] = useState<any>(null);
    const [currentFontColor, setCurrentFontColor] = useState("#000000");
    const [showFormattingMarks, setShowFormattingMarks] = useState(false);

    if (!editor) return null;

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) editor.chain().focus().insertContent(text).run();
        } catch { document.execCommand('paste'); }
    };
    const handlePasteSpecial = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) editor.chain().focus().insertContent(text.replace(/<[^>]*>/g, '')).run();
        } catch { document.execCommand('paste'); }
    };
    const handleCut = () => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (text) { navigator.clipboard.writeText(text).catch(() => { }); editor.chain().focus().deleteSelection().run(); }
    };
    const handleFormatPainter = () => {
        if (formatPainterActive) { setFormatPainterActive(false); setSavedMarks(null); return; }
        const marks = editor.getAttributes('textStyle');
        const isBold = editor.isActive('bold');
        const isItalic = editor.isActive('italic');
        const isUnderline = editor.isActive('underline');
        const highlight = editor.isActive('highlight') ? editor.getAttributes('highlight') : null;
        setSavedMarks({ ...marks, isBold, isItalic, isUnderline, highlight });
        setFormatPainterActive(true);
    };
    if (formatPainterActive && savedMarks) {
        const applyFormat = () => {
            const chain = editor.chain().focus();
            if (savedMarks.fontFamily) chain.setFontFamily(savedMarks.fontFamily);
            if (savedMarks.fontSize) chain.setFontSize(savedMarks.fontSize);
            if (savedMarks.color) chain.setColor(savedMarks.color);
            if (savedMarks.isBold) chain.toggleBold();
            if (savedMarks.isItalic) chain.toggleItalic();
            if (savedMarks.isUnderline) chain.toggleUnderline();
            if (savedMarks.highlight) chain.toggleHighlight(savedMarks.highlight);
            chain.run();
            setFormatPainterActive(false); setSavedMarks(null);
        };
        editor.on('selectionUpdate', applyFormat);
        setTimeout(() => editor.off('selectionUpdate', applyFormat), 10000);
    }

    const clearAllFormatting = () => { editor.chain().focus().clearNodes().unsetAllMarks().run(); };

    const handleStyleClick = (style: typeof STYLES[0]) => {
        if (style.name === 'Normal') { editor.chain().focus().setParagraph().run(); }
        else if (style.name === 'Aralık Yok') { editor.chain().focus().setParagraph().run(); const el = document.querySelector('.ProseMirror') as HTMLElement; if (el) el.style.lineHeight = '1'; }
        else if (style.name === 'Alıntı') { editor.chain().focus().toggleBlockquote().run(); }
        else if (style.name === 'Vurgulu') { editor.chain().focus().toggleBold().run(); editor.chain().focus().setColor('#2b579a').run(); }
        else if (style.name === 'Başlık' || style.name === 'Altyazı') { editor.chain().focus().toggleHeading({ level: style.level as 1 | 2 }).run(); }
        else if (style.level >= 1 && style.level <= 6) { editor.chain().focus().toggleHeading({ level: style.level as 1 | 2 | 3 | 4 | 5 | 6 }).run(); }
    };
    const setFontColor = (color: string) => { setCurrentFontColor(color); editor.chain().focus().setColor(color).run(); setShowFontColor(false); };
    const setHighlight = (color: string) => { editor.chain().focus().toggleHighlight({ color }).run(); setShowHighlightColor(false); };

    const currentFont = editor.getAttributes('textStyle')?.fontFamily || 'Calibri';
    const currentSize = editor.getAttributes('textStyle')?.fontSize?.replace('px', '') || '11';

    const closeMenus = () => {
        setShowFontMenu(false); setShowSizeMenu(false); setShowCaseMenu(false);
        setShowLineSpacing(false); setShowFontColor(false); setShowHighlightColor(false);
        setShowBorders(false); setShowShading(false); setShowTextEffects(false); setShowSortMenu(false);
    };

    // New Tool: Sort selection
    const sortSelection = (order: 'asc' | 'desc') => {
        const text = editor.getText();
        const lines = text.split('\n').filter((l: string) => l.trim());
        lines.sort((a: string, b: string) => order === 'asc' ? a.localeCompare(b, 'tr') : b.localeCompare(a, 'tr'));
        editor.chain().focus().selectAll().insertContent(lines.map((l: string) => `<p>${l}</p>`).join('')).run();
        setShowSortMenu(false);
    };

    // New Tool: Toggle formatting marks
    const toggleFormattingMarks = () => {
        setShowFormattingMarks(!showFormattingMarks);
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (el) {
            if (!showFormattingMarks) {
                if (!document.getElementById('formatting-marks-style')) {
                    const style = document.createElement('style');
                    style.id = 'formatting-marks-style';
                    style.textContent = `.ProseMirror.show-marks p::after { content: "¶"; color: #ccc; font-size: 10px; } .ProseMirror.show-marks br::after { content: "↵"; color: #ccc; font-size: 10px; }`;
                    document.head.appendChild(style);
                }
                el.classList.add('show-marks');
            } else {
                el.classList.remove('show-marks');
            }
        }
    };

    // New Tool: Apply border to paragraph
    const applyBorder = (css: string) => {
        const el = document.querySelector('.ProseMirror .is-active, .ProseMirror p:focus-within, .ProseMirror') as HTMLElement;
        if (el) {
            if (css === 'none') { el.style.border = 'none'; el.style.boxShadow = 'none'; }
            else { el.style.cssText += `;${css};padding:8px;margin:4px 0;border-radius:4px;`; }
        }
        setShowBorders(false);
    };

    // New Tool: Apply shading
    const applyShading = (color: string) => {
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (el) el.style.backgroundColor = color;
        setShowShading(false);
    };

    // New Tool: Text effects
    const applyTextEffect = (effect: string) => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (!text) { setShowTextEffects(false); return; }
        let html = '';
        if (effect === 'shadow') html = `<span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${text}</span>`;
        else if (effect === 'outline') html = `<span style="-webkit-text-stroke: 1px #333; color: transparent;">${text}</span>`;
        else if (effect === 'glow') html = `<span style="text-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6;">${text}</span>`;
        else if (effect === 'emboss') html = `<span style="text-shadow: -1px -1px 0 rgba(255,255,255,0.8), 1px 1px 0 rgba(0,0,0,0.3);">${text}</span>`;
        else if (effect === 'neon') html = `<span style="color: #39ff14; text-shadow: 0 0 7px #39ff14, 0 0 10px #39ff14, 0 0 21px #39ff14;">${text}</span>`;
        else if (effect === 'gradient') html = `<span style="background: linear-gradient(90deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${text}</span>`;
        if (html) editor.chain().focus().insertContent(html).run();
        setShowTextEffects(false);
    };

    // New Tool: Insert horizontal rule
    const insertHR = () => { editor.chain().focus().setHorizontalRule().run(); };

    // New Tool: Select all same formatting
    const selectAllSameFormat = () => {
        const isBold = editor.isActive('bold');
        const isItalic = editor.isActive('italic');
        alert(`Aynı biçimdeki metin aranıyor...\n${isBold ? '✓ Kalın' : ''}${isItalic ? ' ✓ İtalik' : ''}\n\nBu özellik gelecekte geliştirilecek.`);
    };

    // New Tool: Repeat last action
    const repeatLastAction = () => { editor.chain().focus().redo().run(); };

    // New Tool: Insert task list
    const insertTaskList = () => { editor.chain().focus().toggleTaskList().run(); };

    // New Tool: Toggle blockquote
    const toggleBlockquote = () => { editor.chain().focus().toggleBlockquote().run(); };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Pano Group - 5 tools */}
            <div className="flex flex-col items-center h-full min-w-[130px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center gap-1 w-full">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group"
                        title="Yapıştır (Ctrl+V)" onClick={handlePaste}>
                        <Paste size={28} className="text-[#2b579a]" strokeWidth={1.5} />
                        <span className="text-[9px] font-black text-zinc-800">Yapıştır</span>
                    </div>
                    <div className="flex flex-col gap-0.5 ml-1">
                        <button onClick={handleCut} title="Kes (Ctrl+X)" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><Scissors size={12} className="text-zinc-500" /> Kes</button>
                        <button onClick={handleCopy} title="Kopyala (Ctrl+C)" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><Copy size={12} className="text-zinc-500" /> Kopyala</button>
                        <button onClick={handlePasteSpecial} title="Özel Yapıştır" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><Paste size={12} className="text-zinc-500" /> Özel Yapıştır</button>
                        <button onClick={handleFormatPainter} title="Biçim Boyacısı" className={cn("flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700 italic", formatPainterActive && "bg-yellow-100 ring-1 ring-yellow-400")}><Paintbrush size={12} className="text-orange-500" /> Boyacı</button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Pano</span>
            </div>

            {/* Yazı Tipi Group - ~25 tools */}
            <div className="flex flex-col items-center h-full min-w-[300px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-1">
                        {/* Font Family */}
                        <div className="relative">
                            <div className="flex items-center bg-white border border-[#dadada] rounded px-2 py-0.5 h-6 w-32 shadow-sm cursor-pointer hover:border-[#2b579a]"
                                onClick={() => { closeMenus(); setShowFontMenu(!showFontMenu); }}>
                                <span className="text-[10px] font-medium text-zinc-700 truncate">{currentFont}</span>
                                <ChevronDown size={12} className="ml-auto text-zinc-400" />
                            </div>
                            {showFontMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[200px] py-1 max-h-[300px] overflow-y-auto">
                                    {FONT_FAMILIES.map(font => (
                                        <button key={font}
                                            className={cn("w-full text-left px-3 py-1.5 text-[10px] hover:bg-blue-50",
                                                currentFont === font ? "font-bold text-[#2b579a] bg-blue-50" : "text-zinc-700")}
                                            style={{ fontFamily: font }}
                                            onClick={() => { editor.chain().focus().setFontFamily(font).run(); setShowFontMenu(false); }}>
                                            {font}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Font Size */}
                        <div className="relative">
                            <div className="flex items-center bg-white border border-[#dadada] rounded px-1.5 py-0.5 h-6 w-12 shadow-sm cursor-pointer hover:border-[#2b579a]"
                                onClick={() => { closeMenus(); setShowSizeMenu(!showSizeMenu); }}>
                                <span className="text-[10px] font-medium text-zinc-700">{currentSize}</span>
                                <ChevronDown size={12} className="ml-auto text-zinc-400" />
                            </div>
                            {showSizeMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[60px] py-1 max-h-[250px] overflow-y-auto">
                                    {FONT_SIZES.map(size => (
                                        <button key={size}
                                            className={cn("w-full text-left px-3 py-1 text-[10px] hover:bg-blue-50",
                                                currentSize === size ? "font-bold text-[#2b579a] bg-blue-50" : "text-zinc-700")}
                                            onClick={() => { editor.chain().focus().setFontSize(`${size}px`).run(); setShowSizeMenu(false); }}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Grow/Shrink */}
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] text-zinc-700 font-bold text-[10px]"
                            title="Yazı Boyutunu Büyüt"
                            onClick={() => { const cur = parseInt(currentSize) || 11; const idx = FONT_SIZES.indexOf(String(cur)); const next = idx >= 0 && idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : String(cur + 2); editor.chain().focus().setFontSize(`${next}px`).run(); }}>A▲</button>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] text-zinc-700 font-bold text-[10px]"
                            title="Yazı Boyutunu Küçült"
                            onClick={() => { const cur = parseInt(currentSize) || 11; const idx = FONT_SIZES.indexOf(String(cur)); const next = idx > 0 ? FONT_SIZES[idx - 1] : String(Math.max(6, cur - 2)); editor.chain().focus().setFontSize(`${next}px`).run(); }}>A▼</button>
                    </div>
                    <div className="flex items-center gap-0.5 flex-wrap">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} title="Kalın (Ctrl+B)" className={cn("w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] transition-all", editor.isActive('bold') && "btn-active")}><Bold size={14} strokeWidth={2.5} className={cn(editor.isActive('bold') ? "text-[#2b579a]" : "text-zinc-600")} /></button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} title="İtalik (Ctrl+I)" className={cn("w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] transition-all", editor.isActive('italic') && "btn-active")}><Italic size={14} strokeWidth={2.5} className={cn(editor.isActive('italic') ? "text-[#2b579a]" : "text-zinc-600")} /></button>
                        <button onClick={() => editor.chain().focus().toggleUnderline().run()} title="Altı Çizili (Ctrl+U)" className={cn("w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] transition-all", editor.isActive('underline') && "btn-active")}><UnderlineIcon size={14} strokeWidth={2.5} className={cn(editor.isActive('underline') ? "text-[#2b579a]" : "text-zinc-600")} /></button>
                        <button onClick={() => editor.chain().focus().toggleStrike().run()} title="Üstü Çizili" className={cn("w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] transition-all", editor.isActive('strike') && "btn-active")}><Strikethrough size={14} strokeWidth={2.5} className={cn(editor.isActive('strike') ? "text-[#2b579a]" : "text-zinc-600")} /></button>
                        <button onClick={() => editor.chain().focus().toggleSubscript().run()} title="Alt Simge" className={cn("w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] transition-all text-[10px] font-bold", editor.isActive('subscript') ? "text-[#2b579a] btn-active" : "text-zinc-600")}>X₂</button>
                        <button onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Üst Simge" className={cn("w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] transition-all text-[10px] font-bold", editor.isActive('superscript') ? "text-[#2b579a] btn-active" : "text-zinc-600")}>X²</button>
                        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />
                        {/* Text Effects */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowTextEffects(!showTextEffects); }} title="Metin Efektleri" className="w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] text-zinc-600 text-[10px] font-bold">A✦</button>
                            {showTextEffects && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[140px] py-1">
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyTextEffect('shadow')}>🌑 Gölge</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyTextEffect('outline')}>⭕ Anahat</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyTextEffect('glow')}>💡 Parlama</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyTextEffect('emboss')}>🔲 Kabartma</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyTextEffect('neon')}>💚 Neon</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyTextEffect('gradient')}>🌈 Gradyan</button>
                                </div>
                            )}
                        </div>
                        {/* Change Case */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowCaseMenu(!showCaseMenu); }} title="Büyük/Küçük Harf" className="w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] text-zinc-600 text-[10px] font-bold">Aa</button>
                            {showCaseMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[140px] py-1">
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => { changeCase('upper'); setShowCaseMenu(false); }}>BÜYÜK HARF</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => { changeCase('lower'); setShowCaseMenu(false); }}>küçük harf</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => { changeCase('capitalize'); setShowCaseMenu(false); }}>Baş Harf Büyük</button>
                                </div>
                            )}
                        </div>
                        <button onClick={clearAllFormatting} title="Tüm Biçimlendirmeyi Temizle" className="w-6 h-6 flex items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] text-zinc-600"><RemoveFormatting size={14} strokeWidth={2} /></button>
                        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />
                        {/* Font Color */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowFontColor(!showFontColor); }} title="Yazı Tipi Rengi"
                                className="w-6 h-6 flex flex-col items-center justify-center hover:bg-white/60 rounded border border-transparent hover:border-[#dadada]">
                                <Type size={12} strokeWidth={2.5} className="text-zinc-600" />
                                <div className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: currentFontColor }} />
                            </button>
                            {showFontColor && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[142px]">
                                    <p className="text-[8px] font-bold text-zinc-500 mb-1 uppercase">Yazı Rengi</p>
                                    <div className="grid grid-cols-5 gap-1">
                                        {FONT_COLORS.map(color => (
                                            <button key={color} className={cn("w-5 h-5 rounded-sm border border-zinc-200 hover:scale-125 transition-transform", currentFontColor === color && "ring-2 ring-[#2b579a] ring-offset-1")}
                                                style={{ backgroundColor: color }} onClick={() => setFontColor(color)} />
                                        ))}
                                    </div>
                                    <button className="w-full mt-1.5 text-[9px] font-bold text-[#2b579a] hover:bg-blue-50 py-1 rounded"
                                        onClick={() => { const color = prompt("Renk kodu girin (#ff0000):"); if (color) setFontColor(color); }}>Diğer Renkler...</button>
                                </div>
                            )}
                        </div>
                        {/* Highlight */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowHighlightColor(!showHighlightColor); }} title="Metin Vurgu Rengi"
                                className={cn("w-6 h-6 flex items-center justify-center rounded transition-all", editor.isActive('highlight') ? "btn-active" : "hover:bg-white/60")}>
                                <Highlighter size={14} strokeWidth={2.5} className="text-yellow-600" />
                            </button>
                            {showHighlightColor && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[150px]">
                                    <p className="text-[8px] font-bold text-zinc-500 mb-1 uppercase">Vurgu Rengi</p>
                                    <div className="grid grid-cols-5 gap-1">
                                        {HIGHLIGHT_COLORS.map(c => (
                                            <button key={c.value} className="w-5 h-5 rounded-sm border border-zinc-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c.value }} title={c.name} onClick={() => setHighlight(c.value)} />
                                        ))}
                                    </div>
                                    <button className="w-full mt-1.5 text-[9px] font-bold text-red-500 hover:bg-red-50 py-1 rounded"
                                        onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightColor(false); }}>Vurguyu Kaldır</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Yazı Tipi</span>
            </div>

            {/* Paragraf Group - ~20 tools */}
            <div className="flex flex-col items-center h-full min-w-[240px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-0.5">
                        <button onClick={() => editor.chain().focus().toggleBulletList().run()} title="Madde İm Listesi" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive('bulletList') && "btn-active")}><List size={15} className={editor.isActive('bulletList') ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numaralı Liste" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive('orderedList') && "btn-active")}><ListOrdered size={15} className={editor.isActive('orderedList') ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <button onClick={insertTaskList} title="Görev Listesi" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive('taskList') && "btn-active")}><ListChecks size={15} className={editor.isActive('taskList') ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />
                        <button onClick={() => editor.chain().focus().outdent().run()} title="Girintiyi Azalt"><IndentDecrease size={15} className="text-zinc-600 p-0.5 hover:bg-white/60 rounded" /></button>
                        <button onClick={() => editor.chain().focus().indent().run()} title="Girintiyi Artır"><IndentIncrease size={15} className="text-zinc-600 p-0.5 hover:bg-white/60 rounded" /></button>
                        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />
                        {/* Sort */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowSortMenu(!showSortMenu); }} title="Sırala" className="p-1 hover:bg-white/60 rounded"><ArrowUpDown size={15} className="text-zinc-600" /></button>
                            {showSortMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[130px] py-1">
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => sortSelection('asc')}>A → Z Artan</button>
                                    <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => sortSelection('desc')}>Z → A Azalan</button>
                                </div>
                            )}
                        </div>
                        {/* Show/Hide marks */}
                        <button onClick={toggleFormattingMarks} title="Biçimlendirme İşaretlerini Göster/Gizle"
                            className={cn("p-1 hover:bg-white/60 rounded", showFormattingMarks && "btn-active")}>
                            <Pilcrow size={15} className={showFormattingMarks ? "text-[#2b579a]" : "text-zinc-600"} />
                        </button>
                        {/* Line spacing */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowLineSpacing(!showLineSpacing); }} title="Satır ve Paragraf Aralığı" className="p-1 hover:bg-white/60 rounded"><MoveVertical size={15} className="text-zinc-600" /></button>
                            {showLineSpacing && (
                                <div className="absolute top-full right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[160px] py-1">
                                    <p className="px-3 py-1 text-[8px] font-bold text-zinc-400 uppercase">Satır Aralığı</p>
                                    {LINE_SPACING_OPTIONS.map(s => (
                                        <button key={s.value} className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50"
                                            onClick={() => { const el = document.querySelector('.ProseMirror') as HTMLElement; if (el) el.style.lineHeight = s.value; setShowLineSpacing(false); }}>{s.label}</button>
                                    ))}
                                    <div className="border-t border-zinc-100 my-1" />
                                    <p className="px-3 py-1 text-[8px] font-bold text-zinc-400 uppercase">Paragraf Öncesi</p>
                                    <div className="flex items-center gap-1 px-3 py-1">
                                        {["0", "6", "12", "24"].map(v => (
                                            <button key={v} className="text-[10px] font-bold text-zinc-600 hover:bg-blue-50 px-2 py-0.5 rounded"
                                                onClick={() => { const el = document.querySelector('.ProseMirror') as HTMLElement; if (el) el.style.paddingTop = `${v}px`; setShowLineSpacing(false); }}>{v}pt</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Sola Hizala" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive({ textAlign: 'left' }) && "btn-active")}><AlignLeft size={15} className={editor.isActive({ textAlign: 'left' }) ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Ortala" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive({ textAlign: 'center' }) && "btn-active")}><AlignCenter size={15} className={editor.isActive({ textAlign: 'center' }) ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Sağa Hizala" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive({ textAlign: 'right' }) && "btn-active")}><AlignRight size={15} className={editor.isActive({ textAlign: 'right' }) ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="İki Yana Yasla" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive({ textAlign: 'justify' }) && "btn-active")}><AlignJustify size={15} className={editor.isActive({ textAlign: 'justify' }) ? "text-[#2b579a]" : "text-zinc-600"} /></button>
                        <div className="w-[1px] h-4 bg-zinc-300 mx-0.5" />
                        {/* Borders */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowBorders(!showBorders); }} title="Kenarlıklar" className="p-1 hover:bg-white/60 rounded"><Square size={15} className="text-zinc-600" /></button>
                            {showBorders && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[150px] py-1">
                                    {BORDER_STYLES.map(b => (
                                        <button key={b.name} className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => applyBorder(b.css)}>{b.name}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Shading */}
                        <div className="relative">
                            <button onClick={() => { closeMenus(); setShowShading(!showShading); }} title="Gölgeleme" className="p-1 hover:bg-white/60 rounded"><PaintBucket size={15} className="text-zinc-600" /></button>
                            {showShading && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[135px]">
                                    <p className="text-[8px] font-bold text-zinc-500 mb-1 uppercase">Gölgeleme</p>
                                    <div className="grid grid-cols-5 gap-1">
                                        {SHADING_COLORS.map(c => (
                                            <button key={c} className="w-5 h-5 rounded-sm border border-zinc-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }} onClick={() => applyShading(c)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Blockquote */}
                        <button onClick={toggleBlockquote} title="Alıntı" className={cn("p-1 hover:bg-white/60 rounded", editor.isActive('blockquote') && "btn-active")}>
                            <WrapText size={15} className={editor.isActive('blockquote') ? "text-[#2b579a]" : "text-zinc-600"} />
                        </button>
                        {/* Horizontal Rule */}
                        <button onClick={insertHR} title="Yatay Çizgi Ekle" className="p-1 hover:bg-white/60 rounded">
                            <div className="w-4 h-[2px] bg-zinc-500 mt-1" />
                        </button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Paragraf</span>
            </div>

            {/* Stiller Group - 10 styles */}
            <div className="flex flex-col items-center h-full min-w-[360px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1 overflow-x-auto h-full py-1 custom-scrollbar">
                    <div className="flex border border-[#dadada] bg-white rounded-sm divide-x divide-[#dadada] h-full shadow-sm">
                        {STYLES.map((style, i) => (
                            <div key={i}
                                className={cn("flex flex-col px-3 py-1 hover:bg-blue-50 cursor-pointer min-w-[55px] transition-all",
                                    (style.name === 'Normal' && !editor.isActive('heading') && !editor.isActive('blockquote')) && "bg-blue-50/50",
                                    (style.level >= 1 && style.level <= 6 && editor.isActive('heading', { level: style.level })) && "btn-active",
                                    (style.name === 'Alıntı' && editor.isActive('blockquote')) && "btn-active"
                                )}
                                onClick={() => handleStyleClick(style)}>
                                <span className={cn("text-[11px] leading-tight",
                                    style.name.includes('Başlık') ? "font-bold text-[#2b579a]" :
                                        style.name === 'Altyazı' ? "italic text-zinc-500" :
                                            style.name === 'Alıntı' ? "italic text-zinc-600 border-l-2 border-[#2b579a] pl-1" :
                                                style.name === 'Vurgulu' ? "font-bold text-[#2b579a]" : "text-zinc-800"
                                )}>AaBbCc</span>
                                <span className="text-[7px] text-zinc-500 font-bold mt-auto truncate">{style.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Stiller</span>
            </div>

            {/* Düzenleme Group - 5 tools */}
            <div className="flex flex-col items-center h-full min-w-[110px] px-3">
                <div className="flex-1 flex flex-col justify-center gap-0.5">
                    <button onClick={() => setShowSearch(!showSearch)} title="Bul (Ctrl+F)" className={cn("flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700", showSearch && "bg-[#2b579a] text-white shadow-sm")}><Search size={12} /> Bul</button>
                    <button onClick={() => setShowSearch(!showSearch)} title="Bul ve Değiştir (Ctrl+H)" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><RefreshCw size={12} /> Değiştir</button>
                    <button onClick={() => editor.chain().focus().selectAll().run()} title="Tümünü Seç (Ctrl+A)" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><MousePointer2 size={12} /> Tümünü Seç</button>
                    <button onClick={selectAllSameFormat} title="Aynı Biçimi Seç" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><CaseSensitive size={12} /> Biçim Seç</button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Düzenleme</span>
            </div>

            {/* Ek Araçlar Group */}
            <div className="flex flex-col items-center h-full min-w-[200px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => editor.chain().focus().undo().run()} title="Geri Al (Ctrl+Z)" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Undo2 size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Geri Al</span>
                    </button>
                    <button onClick={() => editor.chain().focus().redo().run()} title="Yinele (Ctrl+Y)" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Redo2 size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Yinele</span>
                    </button>
                    <button onClick={() => {
                        const text = editor.getText();
                        const chars = text.length;
                        const words = text.split(/\s+/).filter((w: string) => w.length > 0).length;
                        const lines = text.split('\n').length;
                        alert(`📊lKarakter: ${chars}\nKelime: ${words}\nSatır: ${lines}`);
                    }} title="Karakter Sayacı" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <TextCursorInput size={18} className="text-emerald-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Say</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            const current = el.style.direction;
                            el.style.direction = current === 'rtl' ? 'ltr' : 'rtl';
                            el.style.textAlign = current === 'rtl' ? 'left' : 'right';
                        }
                    }} title="Metin Yönü (RTL/LTR)" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <ArrowLeftRight size={18} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Yön</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Ek Araçlar</span>
            </div>

            {/* Metin Biçim */}
            <div className="flex flex-col items-center h-full min-w-[300px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Üst Simge" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-12", editor.isActive('superscript') ? 'btn-active' : 'hover:bg-white/60')}>
                        <ChevronsUp size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Üst S.</span>
                    </button>
                    <button onClick={() => editor.chain().focus().toggleSubscript().run()} title="Alt Simge" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-12", editor.isActive('subscript') ? 'btn-active' : 'hover:bg-white/60')}>
                        <ALargeSmall size={18} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Alt S.</span>
                    </button>
                    <button onClick={() => changeCase('lower')} title="Küçük Harf" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <span className="text-[14px] font-mono text-emerald-600">ab</span>
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">küçük</span>
                    </button>
                    <button onClick={() => changeCase('upper')} title="Büyük Harf" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <span className="text-[14px] font-mono text-red-500">AB</span>
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">BÜYÜK</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) el.style.lineHeight = el.style.lineHeight === '2' ? '1.5' : '2';
                    }} title="Çift Aralık" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Space size={18} className="text-amber-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Çift Ar.</span>
                    </button>
                    <button onClick={() => {
                        try { document.execCommand('copy'); } catch { }
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            const sel = window.getSelection();
                            if (sel && sel.toString()) {
                                navigator.clipboard.writeText(sel.toString());
                                alert('📋 Format kopyalandı!');
                            }
                        }
                    }} title="Format Kopyala" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <CopyCheck size={18} className="text-teal-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">F.Kopya</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Metin Biçim</span>
            </div>
        </div>
    );
};

export default memo(HomeTab);
