"use client";

import React, { memo, useState } from "react";
import { Hash, FileText, Bookmark, List, ArrowDown, Quote, Image as ImageIcon, Type, Table2, LibraryBig, Search, BookOpenCheck, StickyNote, Footprints, ArrowUpDown, Eye, FileSearch, Zap, ClipboardList, LayoutList, RefreshCw, Settings2, ScrollText, Stamp, GraduationCap } from "lucide-react";
import { cn } from "../utils";
import { InputModal, InfoToast } from "../InputModal";

interface ReferencesTabProps {
    editor: any;
}

const CITATION_STYLES = [
    { name: "APA", format: (a: string, y: string, t: string) => `${a} (${y}). ${t}.` },
    { name: "MLA", format: (a: string, y: string, t: string) => `${a}. ${t}. ${y}.` },
    { name: "Chicago", format: (a: string, y: string, t: string) => `${a}. ${t}. ${y}.` },
    { name: "IEEE", format: (a: string, y: string, t: string) => `[#] ${a}, "${t}," ${y}.` },
];

const ReferencesTab = ({ editor }: ReferencesTabProps) => {
    const [footnoteCount, setFootnoteCount] = useState(1);
    const [showCitationStyle, setShowCitationStyle] = useState(false);
    const [selectedCitationStyle, setSelectedCitationStyle] = useState("APA");
    const [citations, setCitations] = useState<{ id: number; author: string; year: string; title: string }[]>([]);
    const [toast, setToast] = useState<string | null>(null);

    // Modal states
    const [endnoteModal, setEndnoteModal] = useState(false);
    const [citationModal, setCitationModal] = useState(false);
    const [captionFigureModal, setCaptionFigureModal] = useState(false);
    const [captionTableModal, setCaptionTableModal] = useState(false);
    const [bookmarkModal, setBookmarkModal] = useState(false);

    if (!editor) return null;

    const showToast = (msg: string) => setToast(msg);

    const insertTOC = () => {
        const json = editor.getJSON();
        const headings: { level: number; text: string }[] = [];
        const extract = (node: any) => {
            if (node.type === 'heading' && node.content)
                headings.push({ level: node.attrs?.level || 1, text: node.content.map((c: any) => c.text || '').join('') });
            if (node.content) node.content.forEach(extract);
        };
        extract(json);
        if (headings.length === 0) { showToast("⚠️ Belgede başlık bulunamadı. Önce Başlık 1/2/3 ekleyin."); return; }
        let html = '<div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 16px 0; background: #fafafa;">';
        html += '<h2 style="color: #2b579a; margin-bottom: 12px; font-size: 18px; border-bottom: 2px solid #2b579a; padding-bottom: 8px;">İçindekiler</h2>';
        headings.forEach((h, i) => {
            const indent = (h.level - 1) * 24;
            const fs = h.level === 1 ? '13px' : h.level === 2 ? '12px' : '11px';
            const fw = h.level === 1 ? 'bold' : 'normal';
            html += `<p style="margin: 4px 0 4px ${indent}px; font-size: ${fs}; font-weight: ${fw}; color: #333;">${i + 1}. ${h.text}</p>`;
        });
        html += '</div>';
        editor.chain().focus().insertContent(html).run();
    };

    const insertFootnote = () => {
        const num = footnoteCount;
        setFootnoteCount(p => p + 1);
        editor.chain().focus().insertContent(`<sup style="color: #2b579a; font-weight: bold; cursor: pointer; font-size: 10px;">[${num}]</sup>`).run();
        showToast(`Dipnot [${num}] eklendi`);
    };

    const handleEndnote = (vals: Record<string, string>) => {
        const num = footnoteCount;
        setFootnoteCount(p => p + 1);
        editor.chain().focus().insertContent(`<sup style="color: #e11d48; font-weight: bold; font-size: 10px;">[${num}]</sup>`).run();
        editor.commands.insertContentAt(editor.state.doc.content.size,
            `<div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 8px; font-size: 10px; color: #666;"><sup style="color: #e11d48; font-weight: bold;">[${num}]</sup> ${vals.text}</div>`);
        setEndnoteModal(false);
    };

    const handleCitation = (vals: Record<string, string>) => {
        const { author, title, year } = vals;
        const newCitation = { id: citations.length + 1, author, year, title };
        setCitations(p => [...p, newCitation]);
        let inText = '';
        if (selectedCitationStyle === "APA" || selectedCitationStyle === "Chicago") inText = `(${author}, ${year})`;
        else if (selectedCitationStyle === "MLA") inText = `(${author})`;
        else inText = `[${newCitation.id}]`;
        editor.chain().focus().insertContent(`<span style="color: #2b579a; font-weight: 500;">${inText}</span>`).run();
        setCitationModal(false);
    };

    const insertBibliography = () => {
        if (citations.length === 0) { showToast("⚠️ Henüz alıntı eklenmedi. Önce alıntı ekleyin."); return; }
        const style = CITATION_STYLES.find(s => s.name === selectedCitationStyle) || CITATION_STYLES[0];
        let html = '<div style="border-top: 2px solid #2b579a; margin-top: 40px; padding-top: 16px;">';
        html += '<h2 style="color: #2b579a; font-size: 16px; margin-bottom: 12px;">Kaynakça</h2>';
        citations.forEach((c, i) => {
            const f = style.format(c.author, c.year, c.title);
            html += `<p style="margin: 6px 0; font-size: 11px; color: #333; padding-left: 32px; text-indent: -32px;">${selectedCitationStyle === "IEEE" ? `[${i + 1}] ` : ''}${f}</p>`;
        });
        html += '</div>';
        editor.chain().focus().insertContent(html).run();
    };

    const handleCaption = (type: 'figure' | 'table') => (vals: Record<string, string>) => {
        const label = type === 'figure' ? 'Şekil' : 'Tablo';
        editor.chain().focus().insertContent(
            `<p style="font-size: 11px; color: #555; text-align: center; margin: 8px 0; font-style: italic;"><strong>${label} ${vals.num}:</strong> ${vals.text}</p>`
        ).run();
        if (type === 'figure') setCaptionFigureModal(false);
        else setCaptionTableModal(false);
    };

    const handleBookmark = (vals: Record<string, string>) => {
        const name = vals.name;
        if (name) {
            editor.chain().focus().insertContent(
                `<span id="bookmark-${name.replace(/\s/g, '-')}" style="background: #dbeafe; padding: 1px 6px; border-radius: 4px; font-size: 10px; color: #2b579a; font-weight: bold;">📌 ${name}</span>`
            ).run();
        }
        setBookmarkModal(false);
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* İçindekiler */}
            <div className="flex flex-col items-center h-full min-w-[100px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-16"
                        title="İçindekiler Oluştur" onClick={insertTOC}>
                        <List size={22} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">İçindekiler</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">İçindekiler</span>
            </div>

            {/* Dipnot/Sonnot */}
            <div className="flex flex-col items-center h-full min-w-[140px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Dipnot Ekle" onClick={insertFootnote}>
                        <ArrowDown size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Dipnot</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Son Not Ekle" onClick={() => setEndnoteModal(true)}>
                        <ArrowDown size={20} className="text-orange-500 rotate-180" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Son Not</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Dipnotlar</span>
            </div>

            {/* Alıntı & Kaynakça */}
            <div className="flex flex-col items-center h-full min-w-[220px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                            onClick={() => setShowCitationStyle(!showCitationStyle)}>
                            <div className="w-6 h-6 rounded bg-[#2b579a] text-white flex items-center justify-center text-[8px] font-black">{selectedCitationStyle}</div>
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Stil</span>
                        </div>
                        {showCitationStyle && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[120px] py-1">
                                {CITATION_STYLES.map(s => (
                                    <button key={s.name}
                                        className={cn("w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50",
                                            selectedCitationStyle === s.name ? "text-[#2b579a] bg-blue-50" : "text-zinc-700")}
                                        onClick={() => { setSelectedCitationStyle(s.name); setShowCitationStyle(false); }}>
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Alıntı Ekle" onClick={() => setCitationModal(true)}>
                        <Quote size={20} className="text-amber-600" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Alıntı</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Kaynakça Oluştur" onClick={insertBibliography}>
                        <FileText size={20} className="text-emerald-600" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Kaynakça</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Alıntılar ve Kaynakça</span>
            </div>

            {/* Resim Yazıları */}
            <div className="flex flex-col items-center h-full min-w-[140px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Şekil Yazısı" onClick={() => setCaptionFigureModal(true)}>
                        <ImageIcon size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Şekil</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Tablo Yazısı" onClick={() => setCaptionTableModal(true)}>
                        <Type size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Tablo</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Resim Yazıları</span>
            </div>

            {/* Yer İmleri */}
            <div className="flex flex-col items-center h-full min-w-[80px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14"
                        title="Yer İmi Ekle" onClick={() => setBookmarkModal(true)}>
                        <Bookmark size={22} className="text-emerald-500" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Yer İmi</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Yer İmleri</span>
            </div>

            {/* Dizin & Tablo */}
            <div className="flex flex-col items-center h-full min-w-[280px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const json = editor.getJSON();
                        const figures: string[] = [];
                        const traverse = (node: any) => {
                            if (node.type === 'paragraph' && node.content) {
                                const text = node.content.map((c: any) => c.text || '').join('');
                                if (text.startsWith('Şekil ') || text.startsWith('Figure ')) figures.push(text);
                            }
                            if (node.content) node.content.forEach(traverse);
                        };
                        traverse(json);
                        if (figures.length === 0) { showToast('Şekil yazısı bulunamadı.'); return; }
                        let html = '<div style="border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 16px 0; background: #fafafa;"><h3 style="color: #2b579a; font-size: 14px; margin-bottom: 8px;">Şekiller Tablosu</h3>';
                        figures.forEach((f, i) => { html += `<p style="font-size: 11px; margin: 3px 0; color: #555;">${i + 1}. ${f}</p>`; });
                        html += '</div>';
                        editor.chain().focus().insertContent(html).run();
                    }} title="Şekiller Tablosu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Table2 size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Şekil Tab.</span>
                    </button>
                    <button onClick={() => {
                        editor.chain().focus().insertContent(
                            '<div style="border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 16px 0; background: #fafafa;"><h3 style="color: #2b579a; font-size: 14px; margin-bottom: 8px;">Dizin</h3><p style="font-size: 11px; color: #777;">Dizin öğeleri buraya eklenecektir...</p></div>'
                        ).run();
                    }} title="Dizin Ekle" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <LibraryBig size={18} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Dizin</span>
                    </button>
                    <button onClick={() => showToast(`📚 Kaynak sayısı: ${citations.length}\n${citations.map(c => `- ${c.author} (${c.year})`).join('\n') || 'Henüz kaynak eklenmemiş.'}`)} title="Kaynakları Yönet" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Settings2 size={18} className="text-emerald-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Kaynak Yön.</span>
                    </button>
                    <button onClick={() => {
                        const notes = document.querySelectorAll('sup[style*="color: #2b579a"]');
                        if (notes.length === 0) { showToast('Dipnot bulunamadı.'); return; }
                        const next = notes[notes.length - 1] as HTMLElement;
                        next.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        next.style.background = '#fef08a';
                        setTimeout(() => { next.style.background = ''; }, 2000);
                    }} title="Sonraki Dipnot" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Footprints size={18} className="text-amber-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Sonraki DN</span>
                    </button>
                    <button onClick={() => {
                        const notes = document.querySelectorAll('sup[style*="color: #2b579a"], sup[style*="color: #e11d48"]');
                        showToast(`📝 Toplam not sayısı: ${notes.length}`);
                    }} title="Notları Göster" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Eye size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Notlar</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Dizin & Tablo</span>
            </div>

            {/* Araştırma */}
            <div className="flex flex-col items-center h-full min-w-[260px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const sel = editor.state.selection;
                        const text = editor.state.doc.textBetween(sel.from, sel.to, ' ');
                        if (text) window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(text)}`, '_blank');
                        else showToast('Aramak için metin seçin.');
                    }} title="Araştır (Google Scholar)" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Search size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Araştır</span>
                    </button>
                    <button onClick={() => {
                        const sel = editor.state.selection;
                        const text = editor.state.doc.textBetween(sel.from, sel.to, ' ');
                        if (text) window.open(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(text)}`, '_blank');
                        else showToast('Aramak için metin seçin.');
                    }} title="Akıllı Arama (Wikipedia)" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <BookOpenCheck size={18} className="text-emerald-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Akıllı Ara</span>
                    </button>
                    <button onClick={() => {
                        const { from, to } = editor.state.selection;
                        const text = editor.state.doc.textBetween(from, to, ' ');
                        if (!text) { showToast('Alıntı kaldırmak için alıntı metnini seçin.'); return; }
                        editor.chain().focus().unsetMark('link').run();
                        showToast('Alıntı biçimi kaldırıldı.');
                    }} title="Alıntı Kaldır" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Zap size={18} className="text-red-400" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Alıntı Sil</span>
                    </button>
                    <button onClick={() => {
                        editor.chain().focus().insertContent(
                            '<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 12px 0; border-radius: 4px;"><p style="font-size: 11px; color: #166534; margin: 0;"><strong>Çapraz Başvuru:</strong> Bkz. Bölüm ...</p></div>'
                        ).run();
                    }} title="Çapraz Başvuru" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <FileSearch size={18} className="text-teal-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Çapraz B.</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Araştırma</span>
            </div>

            {/* Ek Başvuru Araçları */}
            <div className="flex flex-col items-center h-full min-w-[280px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const json = editor.getJSON();
                        const imgs: string[] = [];
                        const traverse = (n: any) => { if (n.type === 'image' && n.attrs?.src) imgs.push(n.attrs.src); if (n.content) n.content.forEach(traverse); };
                        traverse(json);
                        showToast(`🖼️ Belgede ${imgs.length} resim bulundu.`);
                    }} title="Resim Dizini" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <ClipboardList size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Resim Diz.</span>
                    </button>
                    <button onClick={() => {
                        const tables = document.querySelectorAll('.ProseMirror table');
                        showToast(`📊 Belgede ${tables.length} tablo bulundu.`);
                    }} title="Tablo Dizini" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <LayoutList size={18} className="text-indigo-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Tablo Diz.</span>
                    </button>
                    <button onClick={() => {
                        editor.chain().focus().insertContent(
                            '<div style="float: right; width: 120px; background: #fef9c3; padding: 8px; border-left: 2px solid #eab308; margin: 0 0 8px 12px; font-size: 10px; color: #854d0e;"><strong>Kenar Notu:</strong> Not yazın...</div>'
                        ).run();
                    }} title="Kenar Notu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <StickyNote size={18} className="text-yellow-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Kenar N.</span>
                    </button>
                    <button onClick={insertBibliography} title="Kaynakça Güncelle" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <RefreshCw size={18} className="text-emerald-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Güncelle</span>
                    </button>
                    <button onClick={() => {
                        editor.chain().focus().insertContent(
                            '<div style="border: 1px solid #e5e7eb; padding: 12px; margin: 12px 0; border-radius: 6px; background: #f8fafc;"><p style="font-size: 11px; color: #666; margin: 0;"><strong>🎓 Yetkilendirme:</strong> Bu belge ... tarafından hazırlanmıştır.</p></div>'
                        ).run();
                    }} title="Yetkilendirme Tablosu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <GraduationCap size={18} className="text-violet-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Yetki</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Ek Araçlar</span>
            </div>

            {/* Modals */}
            <InputModal isOpen={endnoteModal} title="Son Not Ekle"
                fields={[{ label: "Son not metni", key: "text", placeholder: "Son not içeriği..." }]}
                onConfirm={handleEndnote} onClose={() => setEndnoteModal(false)} confirmText="Ekle" />

            <InputModal isOpen={citationModal} title="Alıntı Ekle"
                fields={[
                    { label: "Yazar adı", key: "author", placeholder: "Yazar Soyadı, Adı" },
                    { label: "Eser adı", key: "title", placeholder: "Kitap / Makale adı" },
                    { label: "Yıl", key: "year", placeholder: "2024" },
                ]}
                onConfirm={handleCitation} onClose={() => setCitationModal(false)} confirmText="Ekle" />

            <InputModal isOpen={captionFigureModal} title="Şekil Yazısı"
                fields={[
                    { label: "Şekil numarası", key: "num", placeholder: "1" },
                    { label: "Açıklama", key: "text", placeholder: "Şekil açıklaması..." },
                ]}
                onConfirm={handleCaption('figure')} onClose={() => setCaptionFigureModal(false)} confirmText="Ekle" />

            <InputModal isOpen={captionTableModal} title="Tablo Yazısı"
                fields={[
                    { label: "Tablo numarası", key: "num", placeholder: "1" },
                    { label: "Açıklama", key: "text", placeholder: "Tablo açıklaması..." },
                ]}
                onConfirm={handleCaption('table')} onClose={() => setCaptionTableModal(false)} confirmText="Ekle" />

            <InputModal isOpen={bookmarkModal} title="Yer İmi Ekle"
                fields={[{ label: "Yer imi adı", key: "name", placeholder: "yer-imi-1" }]}
                onConfirm={handleBookmark} onClose={() => setBookmarkModal(false)} confirmText="Ekle" />

            {toast && <InfoToast message={toast} onClose={() => setToast(null)} />}
        </div>
    );
};


export default memo(ReferencesTab);

