"use client";

import React, { memo, useState } from "react";
import {
    FileText, File as FileIcon, LogOut as LogOutIcon, Table as TableIcon,
    Image as ImageIcon, Shapes as ShapesIcon, Tag as TagIcon, Box as BoxIcon,
    BarChart as BarChartIcon, Link as LinkIcon, Bookmark as BookmarkIcon,
    ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon, Hash, Type,
    Baseline as BaselineIcon, Calendar as CalendarIcon, ChevronDown, Circle,
    Square, Minus, ArrowRight, Video, LetterText, Globe, PenTool, Camera,
    FileSignature, AlertTriangle, MessageSquare, Columns, StickyNote, Smile,
    Code, Ruler, Star, Triangle, Diamond, Hexagon, Pentagon, Heart, Zap, Volume2
} from "lucide-react";
import { cn } from "../utils";
import { InputModal, InfoToast } from "../InputModal";

interface InsertTabProps {
    editor: any;
    insertPageBreak: () => void;
    imageInputRef: React.RefObject<HTMLInputElement | null>;
    videoInputRef: React.RefObject<HTMLInputElement | null>;
    insertShape: (type: string) => void;
    insertDate: () => void;
    insertSymbol: (symbol: string) => void;
}

const SYMBOLS = [
    { symbol: "©", name: "Telif Hakkı" }, { symbol: "®", name: "Tescilli" },
    { symbol: "™", name: "Marka" }, { symbol: "•", name: "Madde İm" },
    { symbol: "→", name: "Ok" }, { symbol: "←", name: "Sol Ok" },
    { symbol: "↑", name: "Yukarı" }, { symbol: "↓", name: "Aşağı" },
    { symbol: "±", name: "Artı Eksi" }, { symbol: "÷", name: "Bölme" },
    { symbol: "×", name: "Çarpma" }, { symbol: "≠", name: "Eşit Değil" },
    { symbol: "≤", name: "Küçük Eşit" }, { symbol: "≥", name: "Büyük Eşit" },
    { symbol: "∞", name: "Sonsuz" }, { symbol: "√", name: "Karekök" },
    { symbol: "∑", name: "Toplam" }, { symbol: "∫", name: "İntegral" },
    { symbol: "Ω", name: "Omega" }, { symbol: "π", name: "Pi" },
    { symbol: "Δ", name: "Delta" }, { symbol: "α", name: "Alfa" },
    { symbol: "β", name: "Beta" }, { symbol: "θ", name: "Teta" },
    { symbol: "★", name: "Yıldız" }, { symbol: "♥", name: "Kalp" },
    { symbol: "♦", name: "Karo" }, { symbol: "♣", name: "Sinek" },
    { symbol: "♠", name: "Maça" }, { symbol: "☺", name: "Gülen" },
    { symbol: "✓", name: "Onay" }, { symbol: "✗", name: "Çarpı" },
];

const SHAPES = [
    { type: "rect", label: "Dikdörtgen", icon: Square },
    { type: "circle", label: "Daire", icon: Circle },
    { type: "triangle", label: "Üçgen", icon: Triangle },
    { type: "diamond", label: "Eşkenar", icon: Diamond },
    { type: "star", label: "Yıldız", icon: Star },
    { type: "heart", label: "Kalp", icon: Heart },
    { type: "hexagon", label: "Altıgen", icon: Hexagon },
    { type: "line", label: "Çizgi", icon: Minus },
    { type: "arrow", label: "Ok", icon: ArrowRight },
];

const EMOJI_LIST = [
    "😀", "😂", "😍", "🤔", "😎", "👍", "👎", "🎉", "🔥", "💡",
    "⭐", "❤️", "✅", "❌", "⚠️", "📌", "📎", "📝", "🏷️", "🔗",
];

const InsertTab = ({
    editor, insertPageBreak, imageInputRef, videoInputRef, insertShape, insertDate, insertSymbol
}: InsertTabProps) => {
    const [showShapeMenu, setShowShapeMenu] = useState(false);
    const [showSymbolMenu, setShowSymbolMenu] = useState(false);
    const [showTableGrid, setShowTableGrid] = useState(false);
    const [showEmojiMenu, setShowEmojiMenu] = useState(false);
    const [showIconMenu, setShowIconMenu] = useState(false);
    const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
    const [toast, setToast] = useState<string | null>(null);
    const [footnoteCount, setFootnoteCount] = useState(1);
    // Modals
    const [linkModal, setLinkModal] = useState(false);
    const [bookmarkModal, setBookmarkModal] = useState(false);
    const [wordArtModal, setWordArtModal] = useState(false);
    const [equationModal, setEquationModal] = useState(false);
    const [videoUrlModal, setVideoUrlModal] = useState(false);
    const [imageUrlModal, setImageUrlModal] = useState(false);
    const [footnoteModal, setFootnoteModal] = useState(false);
    const [crossRefModal, setCrossRefModal] = useState(false);

    console.log("InsertTab rendering v2.1");

    function insertFootnote() { setFootnoteModal(true); }
    function insertCrossRef() { setCrossRefModal(true); }

    const TABLE_ROWS = 10;
    const TABLE_COLS = 6;

    if (!editor) return null;

    const closeMenus = () => {
        setShowShapeMenu(false); setShowSymbolMenu(false); setShowTableGrid(false);
        setShowEmojiMenu(false); setShowIconMenu(false);
    };

    const insertCoverPage = () => {
        editor.chain().focus().insertContent(
            `<div style="page-break-after: always; min-height: 800px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px;">
                <div style="border: 3px double #2b579a; padding: 60px 40px; width: 100%;">
                    <h1 style="font-size: 36px; color: #2b579a; margin-bottom: 20px;">Belge Başlığı</h1>
                    <h2 style="font-size: 20px; color: #666; font-weight: normal; margin-bottom: 40px;">Alt Başlık</h2>
                    <hr style="border: 1px solid #2b579a; width: 60%; margin: 20px auto;" />
                    <p style="font-size: 14px; color: #888; margin-top: 40px;">Hazırlayan: Yazar Adı</p>
                    <p style="font-size: 12px; color: #aaa;">${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>`
        ).run();
    };

    const handleLink = (vals: Record<string, string>) => {
        const url = vals.url?.trim();
        const label = vals.label?.trim();
        if (!url) { setLinkModal(false); return; }
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) { editor.chain().focus().setLink({ href: url, target: '_blank' }).run(); }
        else { editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${label || url}</a>`).run(); }
        setLinkModal(false);
    };
    const handleBookmark = (vals: Record<string, string>) => {
        const name = vals.name?.trim();
        if (name) editor.chain().focus().insertContent(`<span id="bookmark-${name.replace(/\s/g, '-')}" style="background: #dbeafe; padding: 1px 6px; border-radius: 4px; font-size: 10px; color: #2b579a; font-weight: bold;">📌 ${name}</span>`).run();
        setBookmarkModal(false);
    };
    const insertHeader = () => { editor.chain().focus().insertContentAt(0, `<div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 16px; font-size: 10px; color: #888; text-align: center;">Belge Üst Bilgisi</div>`).run(); };
    const insertFooter = () => { editor.chain().focus().insertContent(`<div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 16px; font-size: 10px; color: #888; text-align: center;">Belge Alt Bilgisi</div>`).run(); };
    const insertPageNumber = () => { editor.chain().focus().insertContent(`<span style="font-size: 10px; color: #888; font-weight: bold;">— Sayfa 1 —</span>`).run(); };
    const insertTextBox = () => { editor.chain().focus().insertContent(`<div style="border: 2px solid #2b579a; padding: 16px; margin: 12px 0; border-radius: 6px; background: #f8fafc; min-height: 60px;">Metin kutusu — buraya yazın...</div>`).run(); };
    const handleWordArt = (vals: Record<string, string>) => {
        const text = vals.text?.trim() || 'WordArt';
        editor.chain().focus().insertContent(`<div style="font-size: 48px; font-weight: 900; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; padding: 16px; letter-spacing: 2px;">${text}</div>`).run();
        setWordArtModal(false);
    };
    const handleEquation = (vals: Record<string, string>) => {
        const eq = vals.eq?.trim() || 'E = mc²';
        editor.chain().focus().insertContent(`<div style="font-family: 'Cambria Math', 'Times New Roman', serif; font-size: 18px; padding: 12px 24px; margin: 8px 0; text-align: center; background: #f8f9fa; border-radius: 6px; border: 1px solid #e5e7eb;">${eq}</div>`).run();
        setEquationModal(false);
    };
    const insertChart = () => {
        editor.chain().focus().insertContent(
            `<div style="border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 12px 0;">
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 12px;">📊 Veri Tablosu</div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #2b579a; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">Kategori</th><th style="padding: 8px; border: 1px solid #ddd;">Değer</th><th style="padding: 8px; border: 1px solid #ddd;">Oran</th></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Kategori A</td><td style="padding: 8px; border: 1px solid #ddd;">45</td><td style="padding: 8px; border: 1px solid #ddd;">30%</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">Kategori B</td><td style="padding: 8px; border: 1px solid #ddd;">72</td><td style="padding: 8px; border: 1px solid #ddd;">48%</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Kategori C</td><td style="padding: 8px; border: 1px solid #ddd;">33</td><td style="padding: 8px; border: 1px solid #ddd;">22%</td></tr>
                </table>
            </div>`
        ).run();
    };
    const insertShapeExtended = (type: string) => {
        if (type === "line") editor.chain().focus().insertContent(`<hr style="border: 2px solid #2b579a; margin: 16px 0;" />`).run();
        else if (type === "arrow") editor.chain().focus().insertContent(`<div style="text-align: center; font-size: 36px; color: #2b579a;">→</div>`).run();
        else if (type === "triangle") editor.chain().focus().insertContent(`<div style="width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 70px solid #2b579a; display: inline-block; margin: 8px;"></div>`).run();
        else if (type === "diamond") editor.chain().focus().insertContent(`<div style="width: 60px; height: 60px; background: #dbeafe; border: 2px solid #2b579a; transform: rotate(45deg); display: inline-block; margin: 20px;"></div>`).run();
        else if (type === "star") editor.chain().focus().insertContent(`<div style="text-align: center; font-size: 48px; color: #f59e0b;">★</div>`).run();
        else if (type === "heart") editor.chain().focus().insertContent(`<div style="text-align: center; font-size: 48px; color: #e11d48;">♥</div>`).run();
        else if (type === "hexagon") editor.chain().focus().insertContent(`<div style="text-align: center; font-size: 48px; color: #2b579a;">⬡</div>`).run();
        else insertShape(type);
        setShowShapeMenu(false);
    };
    const insertDropCap = () => { editor.chain().focus().insertContent(`<span style="float: left; font-size: 72px; line-height: 0.8; padding: 4px 8px 0 0; font-family: 'Georgia', serif; color: #2b579a; font-weight: bold;">A</span>`).run(); };
    const handleOnlineVideo = (vals: Record<string, string>) => {
        const url = vals.url?.trim();
        if (url) {
            let embedUrl = url;
            const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([-\w]+)/);
            if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
            const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
            if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            editor.chain().focus().insertContent(`<div style="margin: 16px 0; text-align: center;"><iframe src="${embedUrl}" width="560" height="315" style="border: none; border-radius: 8px; max-width: 100%;" allowfullscreen></iframe></div>`).run();
        }
        setVideoUrlModal(false);
    };

    const handleOnlineImage = (vals: Record<string, string>) => {
        const url = vals.url?.trim();
        if (url) editor.chain().focus().setImage({ src: url }).run();
        setImageUrlModal(false);
    };
    const insertScreenshot = () => {
        setToast('📋 Ekran görüntüsünü panoya kopyalayın ve Ctrl+V ile belgeye yapıştırın.');
    };
    const insertSignatureLine = () => {
        editor.chain().focus().insertContent(
            `<div style="margin: 40px 0 20px; text-align: left;">
                <div style="border-top: 1px solid #333; width: 250px; padding-top: 4px;">
                    <p style="font-size: 10px; color: #666; margin: 0;">İmza: _______________</p>
                    <p style="font-size: 10px; color: #666; margin: 2px 0;">Ad Soyad:</p>
                    <p style="font-size: 10px; color: #666; margin: 2px 0;">Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>`
        ).run();
    };
    const insertCalloutBox = (type: 'info' | 'warning' | 'success' | 'error') => {
        const styles: Record<string, { bg: string; border: string; icon: string; title: string }> = {
            info: { bg: '#dbeafe', border: '#3b82f6', icon: 'ℹ️', title: 'Bilgi' },
            warning: { bg: '#fef3c7', border: '#f59e0b', icon: '⚠️', title: 'Uyarı' },
            success: { bg: '#dcfce7', border: '#22c55e', icon: '✅', title: 'Başarılı' },
            error: { bg: '#fee2e2', border: '#ef4444', icon: '❌', title: 'Hata' },
        };
        const s = styles[type];
        editor.chain().focus().insertContent(
            `<div style="background: ${s.bg}; border-left: 4px solid ${s.border}; padding: 12px 16px; border-radius: 4px; margin: 12px 0;">
                <strong style="color: ${s.border};">${s.icon} ${s.title}</strong>
                <p style="margin: 4px 0 0; color: #333;">Buraya metin girin...</p>
            </div>`
        ).run();
        setShowIconMenu(false);
    };
    const insertCodeBlock = () => {
        editor.chain().focus().insertContent(
            `<pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-family: 'Consolas', monospace; font-size: 13px; overflow-x: auto; margin: 12px 0;">// Kod bloğu\nconsole.log("Merhaba Dünya!");</pre>`
        ).run();
    };
    const insertStickyNote = () => {
        editor.chain().focus().insertContent(
            `<div style="background: #fef08a; padding: 16px; border-radius: 2px; margin: 12px 0; box-shadow: 3px 3px 8px rgba(0,0,0,0.15); transform: rotate(-1deg); max-width: 250px; font-family: 'Comic Sans MS', cursive;">
                <p style="margin: 0; color: #713f12;">📝 Not: Buraya yazın...</p>
            </div>`
        ).run();
    };
    const insertColumns = (count: number) => {
        const cols = Array.from({ length: count }, (_, i) => `<div style="flex: 1; padding: 0 8px;">Sütun ${i + 1} metni...</div>`).join('');
        editor.chain().focus().insertContent(
            `<div style="display: flex; gap: 16px; margin: 12px 0; border: 1px dashed #ccc; padding: 12px; border-radius: 4px;">${cols}</div>`
        ).run();
    };
    const insertHorizontalLine = () => { editor.chain().focus().setHorizontalRule().run(); };
    const insertTOC = () => {
        const json = editor.getJSON();
        const headings: string[] = [];
        const traverse = (node: any) => {
            if (node.type === 'heading' && node.content) {
                const text = node.content.map((c: any) => c.text || '').join('');
                const level = node.attrs?.level || 1;
                headings.push(`${'  '.repeat(level - 1)}${level}. ${text}`);
            }
            if (node.content) node.content.forEach(traverse);
        };
        traverse(json);
        if (headings.length === 0) { setToast('⚠️ Belgede başlık bulunamadı. Önce Başlık 1/2/3 ekleyin.'); return; }
        const tocHtml = `<div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 16px 0; background: #fafafa;">
            <h3 style="color: #2b579a; margin-bottom: 12px; font-size: 16px;">📑 İçindekiler</h3>
            ${headings.map(h => `<p style="margin: 4px 0; font-size: 12px; color: #555;">${h}</p>`).join('')}
        </div>`;
        editor.chain().focus().insertContent(tocHtml).run();
    };
    const insertEmoji = (emoji: string) => { editor.chain().focus().insertContent(emoji).run(); setShowEmojiMenu(false); };
    const handleFootnote = (vals: Record<string, string>) => {
        const noteText = vals.text?.trim();
        if (noteText) {
            const num = footnoteCount;
            setFootnoteCount(p => p + 1);
            editor.chain().focus().insertContent(
                `<sup data-footnote="${num}" style="color: #2b579a; font-weight: bold; cursor: pointer; font-size: 10px;">[${num}]</sup>`
            ).run();
        }
        setFootnoteModal(false);
    };
    const handleCrossRef = (vals: Record<string, string>) => {
        const ref = vals.ref?.trim();
        if (ref) editor.chain().focus().insertContent(`<a href="#bookmark-${ref.replace(/\s/g, '-')}" style="color: #2b579a; text-decoration: underline;">→ ${ref}</a>`).run();
        setCrossRefModal(false);
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Sayfalar Group */}
            <div className="flex flex-col items-center h-full min-w-[140px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center justify-center gap-1 w-full">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14"
                        title="Kapak Sayfası Ekle" onClick={insertCoverPage}>
                        <FileText size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 text-center leading-tight">Kapak Sayfası</span>
                    </div>
                    <div className="flex flex-col gap-0.5 ml-1">
                        <button onClick={insertPageBreak} title="Boş Sayfa Ekle" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><FileIcon size={14} className="text-blue-500" /> Boş Sayfa</button>
                        <button onClick={insertPageBreak} title="Sayfa Sonu Ekle" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><LogOutIcon size={14} className="text-red-500 rotate-90" /> Sayfa Sonu</button>
                        <button onClick={insertTOC} title="İçindekiler Ekle" className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><Hash size={14} className="text-emerald-500" /> İçindekiler</button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Sayfalar</span>
            </div>

            {/* Tablolar */}
            <div className="flex flex-col items-center h-full min-w-[70px] border-r border-[#dadada] px-2">
                <div className="relative flex-1 flex flex-col items-center justify-center">
                    <div className="p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14 flex flex-col items-center"
                        onClick={() => { closeMenus(); setShowTableGrid(!showTableGrid); }}>
                        <TableIcon size={22} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">Tablo</span>
                    </div>
                    {showTableGrid && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2.5">
                            <p className="text-[8px] font-bold text-zinc-400 uppercase mb-1">Tablo Ekle</p>
                            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${TABLE_COLS}, 1fr)` }}>
                                {Array.from({ length: TABLE_ROWS * TABLE_COLS }).map((_, i) => {
                                    const r = Math.floor(i / TABLE_COLS) + 1; const c = (i % TABLE_COLS) + 1;
                                    return (<div key={i} className={cn("w-5 h-5 border cursor-pointer transition-all", r <= tableHover.rows && c <= tableHover.cols ? "bg-blue-200 border-blue-400" : "bg-white border-zinc-300")}
                                        onMouseEnter={() => setTableHover({ rows: r, cols: c })} onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })}
                                        onClick={() => { editor.chain().focus().insertTable({ rows: r, cols: c }).run(); setShowTableGrid(false); }} />);
                                })}
                            </div>
                            <span className="text-[9px] text-zinc-500 font-bold">{tableHover.rows > 0 ? `${tableHover.rows} × ${tableHover.cols}` : 'Boyut seçin'}</span>
                        </div>
                    )}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Tablolar</span>
            </div>

            {/* Çizimler / Medya */}
            <div className="flex flex-col items-center h-full min-w-[280px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center gap-0.5">
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Resim Ekle" onClick={() => imageInputRef.current?.click()}>
                        <ImageIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Resim</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Online Resim" onClick={() => setImageUrlModal(true)}>
                        <Globe size={18} className="text-emerald-600" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Online Resim</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Ekran Görüntüsü" onClick={insertScreenshot}>
                        <Camera size={18} className="text-violet-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Ekran Gör.</span>
                    </div>
                    <div className="relative">
                        <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" onClick={() => { closeMenus(); setShowShapeMenu(!showShapeMenu); }}>
                            <ShapesIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Şekiller</span>
                        </div>
                        {showShapeMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[130px] py-1">
                                {SHAPES.map(s => (
                                    <button key={s.type} className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50 flex items-center gap-2"
                                        onClick={() => insertShapeExtended(s.type)}><s.icon size={14} className="text-[#2b579a]" /> {s.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Grafik Ekle" onClick={insertChart}>
                        <BarChartIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Grafik</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Video Ekle (Dosyadan)" onClick={() => videoInputRef.current?.click()}>
                        <Video size={18} className="text-red-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Video</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Çizimler</span>
            </div>

            {/* Bağlantılar */}
            <div className="flex flex-col items-center h-full min-w-[130px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center gap-0.5 justify-center">
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Bağlantı" onClick={() => setLinkModal(true)}>
                        <LinkIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Bağlantı</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Yer İşareti" onClick={() => setBookmarkModal(true)}>
                        <BookmarkIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Yer İşareti</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Çapraz Referans" onClick={insertCrossRef}>
                        <Zap size={18} className="text-amber-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Ç.Referans</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Bağlantılar</span>
            </div>

            {/* Üst/Alt Bilgi */}
            <div className="flex flex-col items-center h-full min-w-[150px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center gap-0.5">
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Üst Bilgi" onClick={insertHeader}>
                        <ArrowUpIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Üst Bilgi</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Alt Bilgi" onClick={insertFooter}>
                        <ArrowDownIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Alt Bilgi</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Sayfa Numarası" onClick={insertPageNumber}>
                        <Hash size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Sayfa No</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Dipnot" onClick={insertFootnote}>
                        <Type size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Dipnot</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Üst/Alt Bilgi</span>
            </div>

            {/* Metin */}
            <div className="flex flex-col items-center h-full min-w-[260px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center gap-0.5">
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Metin Kutusu" onClick={insertTextBox}>
                        <Type size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Metin Kutusu</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="WordArt" onClick={() => setWordArtModal(true)}>
                        <BaselineIcon size={18} className="text-orange-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">WordArt</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Büyük Harf" onClick={insertDropCap}>
                        <LetterText size={18} className="text-emerald-600" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Drop Cap</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Tarih/Saat" onClick={insertDate}>
                        <CalendarIcon size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">Tarih</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="İmza Satırı" onClick={insertSignatureLine}>
                        <FileSignature size={18} className="text-violet-600" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">İmza</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Kod Bloğu" onClick={insertCodeBlock}>
                        <Code size={18} className="text-slate-600" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Kod</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Metin</span>
            </div>

            {/* Özel Ekle */}
            <div className="flex flex-col items-center h-full min-w-[180px] px-2">
                <div className="flex-1 flex items-center gap-0.5">
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Yapışkan Not" onClick={insertStickyNote}>
                        <StickyNote size={18} className="text-yellow-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Not</span>
                    </div>
                    {/* Callout dropdown */}
                    <div className="relative">
                        <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Bilgi Kutusu"
                            onClick={() => { closeMenus(); setShowIconMenu(!showIconMenu); }}>
                            <AlertTriangle size={18} className="text-amber-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Kutu</span>
                        </div>
                        {showIconMenu && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[120px] py-1">
                                <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => insertCalloutBox('info')}>ℹ️ Bilgi</button>
                                <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => insertCalloutBox('warning')}>⚠️ Uyarı</button>
                                <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => insertCalloutBox('success')}>✅ Başarılı</button>
                                <button className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => insertCalloutBox('error')}>❌ Hata</button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11" title="Yatay Çizgi" onClick={insertHorizontalLine}>
                        <Minus size={18} className="text-zinc-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Çizgi</span>
                    </div>
                    {/* Emoji */}
                    <div className="relative">
                        <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11"
                            onClick={() => { closeMenus(); setShowEmojiMenu(!showEmojiMenu); }}>
                            <Smile size={18} className="text-amber-400" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Emoji</span>
                        </div>
                        {showEmojiMenu && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[170px]">
                                <div className="grid grid-cols-5 gap-1">
                                    {EMOJI_LIST.map(e => (
                                        <button key={e} className="w-7 h-7 flex items-center justify-center text-[16px] hover:bg-blue-50 rounded" onClick={() => insertEmoji(e)}>{e}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Symbols */}
                    <div className="relative">
                        <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-11"
                            onClick={() => { closeMenus(); setShowSymbolMenu(!showSymbolMenu); }}>
                            <span className="text-[16px]">Ω</span><span className="text-[8px] font-black text-zinc-800 pt-0.5">Simge</span>
                        </div>
                        {showSymbolMenu && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[280px]">
                                <div className="grid grid-cols-8 gap-1">
                                    {SYMBOLS.map(s => (
                                        <button key={s.symbol} className="w-7 h-7 flex items-center justify-center text-[14px] hover:bg-blue-50 rounded border border-transparent hover:border-blue-200"
                                            title={s.name} onClick={() => { insertSymbol(s.symbol); setShowSymbolMenu(false); }}>{s.symbol}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Özel Ekle</span>
            </div>

            {/* Ek Ekleme Araçları */}
            <div className="flex flex-col items-center h-full min-w-[300px] border-r border-[#dadada] px-2">
                <div className="flex-1 flex items-center gap-0.5">
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Online Video" onClick={() => setVideoUrlModal(true)}>
                        <Video size={18} className="text-red-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5 text-center leading-tight">O.Video</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Denklem Ekle" onClick={() => setEquationModal(true)}>
                        <span className="text-[16px] text-violet-600">∑</span><span className="text-[8px] font-black text-zinc-800 pt-0.5">Denklem</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Ses Dosyası Ekle" onClick={() => {
                        editor.chain().focus().insertContent('<div style="background: #f0f4ff; padding: 12px; border-radius: 8px; margin: 8px 0; text-align: center;"><span style="font-size: 24px;">🎵</span><p style="font-size: 10px; color: #666; margin: 4px 0 0;">Ses dosyası eklemek için audio URL yapıştırın</p></div>').run();
                    }}>
                        <Volume2 size={18} className="text-emerald-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Ses</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="QR Kod Ekle" onClick={() => {
                        const url = prompt('QR Kod için URL girin:') || 'https://example.com';
                        editor.chain().focus().insertContent(`<div style="text-align: center; margin: 12px 0;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}" alt="QR" style="width: 150px; height: 150px;" /></div>`).run();
                    }}>
                        <Square size={18} className="text-[#2b579a]" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">QR Kod</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="Çift Çizgi" onClick={() => {
                        editor.chain().focus().insertContent('<hr style="border: none; border-top: 3px double #2b579a; margin: 16px 0;" />').run();
                    }}>
                        <Ruler size={18} className="text-amber-600" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">Çift Çiz.</span>
                    </div>
                    <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer w-12" title="2 Sütun Ekle" onClick={() => insertColumns(2)}>
                        <Columns size={18} className="text-purple-500" strokeWidth={2} /><span className="text-[8px] font-black text-zinc-800 pt-0.5">2 Sütun</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Ek Ekle</span>
            </div>

            {/* Modals */}
            <InputModal isOpen={linkModal} title="Bağlantı Ekle"
                fields={[
                    { label: "URL", key: "url", placeholder: "https://..." },
                    { label: "Bağlantı metni (seçim yoksa)", key: "label", placeholder: "örn: Web sitesi" },
                ]}
                onConfirm={handleLink} onClose={() => setLinkModal(false)} confirmText="Ekle" />

            <InputModal isOpen={bookmarkModal} title="Yer İşareti Ekle"
                fields={[{ label: "Yer işareti adı", key: "name", placeholder: "yer-imi-1" }]}
                onConfirm={handleBookmark} onClose={() => setBookmarkModal(false)} confirmText="Ekle" />

            <InputModal isOpen={wordArtModal} title="WordArt Ekle"
                fields={[{ label: "Metin", key: "text", placeholder: "WordArt metni..." }]}
                onConfirm={handleWordArt} onClose={() => setWordArtModal(false)} confirmText="Ekle" />

            <InputModal isOpen={equationModal} title="Denklem Ekle"
                fields={[{ label: "Denklem", key: "eq", placeholder: "E = mc²" }]}
                onConfirm={handleEquation} onClose={() => setEquationModal(false)} confirmText="Ekle" />

            <InputModal isOpen={videoUrlModal} title="Online Video Ekle"
                fields={[{ label: "Video URL (YouTube/Vimeo)", key: "url", placeholder: "https://youtu.be/..." }]}
                onConfirm={handleOnlineVideo} onClose={() => setVideoUrlModal(false)} confirmText="Ekle" />

            <InputModal isOpen={imageUrlModal} title="Online Resim Ekle"
                fields={[{ label: "Resim URL", key: "url", placeholder: "https://...jpg" }]}
                onConfirm={handleOnlineImage} onClose={() => setImageUrlModal(false)} confirmText="Ekle" />

            <InputModal isOpen={footnoteModal} title="Dipnot Ekle"
                fields={[{ label: "Dipnot Metni", key: "text", placeholder: "Dipnot içeriği..." }]}
                onConfirm={handleFootnote} onClose={() => setFootnoteModal(false)} confirmText="Ekle" />

            <InputModal isOpen={crossRefModal} title="Çapraz Referans Ekle"
                fields={[{ label: "Referans (Yer İşareti Adı)", key: "ref", placeholder: "yer-imi-1" }]}
                onConfirm={handleCrossRef} onClose={() => setCrossRefModal(false)} confirmText="Ekle" />
            <input type="file" ref={imageInputRef} className="hidden" accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && editor) {
                        const reader = new FileReader();
                        reader.onload = (ev) => { const result = ev.target?.result as string; if (result) editor.chain().focus().setImage({ src: result }).run(); };
                        reader.readAsDataURL(file); e.target.value = '';
                    }
                }} />
            <input type="file" ref={videoInputRef} className="hidden" accept="video/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && editor) {
                        const url = URL.createObjectURL(file);
                        editor.chain().focus().insertContent({
                            type: 'video',
                            attrs: { src: url },
                        }).run();
                    }
                    e.target.value = '';
                }} />



        </div>
    );
};

export default memo(InsertTab);
