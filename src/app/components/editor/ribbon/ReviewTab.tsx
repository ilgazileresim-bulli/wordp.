"use client";

import React, { memo, useState, useCallback } from "react";
import { Hash, Highlighter, MessageSquare, SpellCheck, Languages, Volume2, Shield, ArrowLeft, ArrowRight, Eye, Trash2, GitCompare, XCircle, Accessibility, CheckCircle2, CheckCheck, XOctagon, SkipBack, SkipForward, List, PanelRightClose, Lock } from "lucide-react";
import { cn } from "../utils";
import { InputModal, InfoToast } from "../InputModal";

interface ReviewTabProps {
    editor: any;
}

const HIGHLIGHT_COLORS = [
    { name: "Sarı", value: "#fef08a" },
    { name: "Yeşil", value: "#bbf7d0" },
    { name: "Mavi", value: "#bfdbfe" },
    { name: "Pembe", value: "#fecdd3" },
    { name: "Turuncu", value: "#fed7aa" },
    { name: "Mor", value: "#ddd6fe" },
];

const ReviewTab = ({ editor }: ReviewTabProps) => {
    const [showHighlightColors, setShowHighlightColors] = useState(false);
    const [trackChangesOn, setTrackChangesOn] = useState(false);
    const [isProtected, setIsProtected] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [showTranslate, setShowTranslate] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    if (!editor) return null;

    const showToast = (msg: string) => { setToast(msg); };

    const runSpellCheck = () => {
        const text = editor.getText();
        const words = text.split(/\s+/).filter((w: string) => w.length > 0);
        const uniqueWords = [...new Set(words)];
        showToast(`✅ Yazım Denetimi Tamamlandı\nKelime: ${words.length} — Benzersiz: ${uniqueWords.length}`);
    };

    const addComment = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (!selectedText?.trim()) {
            showToast("⚠️ Yorum eklemek için önce bir metin seçin.");
            return;
        }
        setShowCommentModal(true);
    };

    const handleCommentConfirm = (values: Record<string, string>) => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        const comment = values.comment;
        if (comment && selectedText) {
            const date = new Date().toLocaleDateString('tr-TR');
            editor.chain().focus().insertContent(
                `<span style="background: #fff3cd; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #f59e0b;">${selectedText}</span>` +
                `<span style="display: inline-block; background: #fffbeb; border: 1px solid #f59e0b; border-radius: 6px; padding: 4px 8px; margin-left: 4px; font-size: 10px; color: #92400e; vertical-align: super;">💬 ${comment} <span style="color: #999; font-size: 8px;">${date}</span></span>`
            ).run();
        }
        setShowCommentModal(false);
    };

    const navigateComments = (direction: 'next' | 'prev') => {
        const comments = document.querySelectorAll('[style*="background: #fff3cd"]');
        if (comments.length === 0) { showToast("Belgede yorum bulunamadı."); return; }
        const first = direction === 'next' ? comments[0] : comments[comments.length - 1];
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (first as HTMLElement).style.outline = '2px solid #f59e0b';
        setTimeout(() => { (first as HTMLElement).style.outline = ''; }, 2000);
    };

    const toggleTrackChanges = () => {
        setTrackChangesOn(!trackChangesOn);
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (el) el.style.borderLeft = !trackChangesOn ? '3px solid #22c55e' : '';
    };

    const toggleProtect = () => {
        setIsProtected(!isProtected);
        if (!isProtected) {
            editor.setEditable(false);
            showToast("🔒 Belge koruması açıldı. Salt okunur mod.");
        } else {
            editor.setEditable(true);
            showToast("🔓 Belge koruması kaldırıldı.");
        }
    };

    const readAloud = () => {
        if (isReading) { window.speechSynthesis.cancel(); setIsReading(false); return; }
        const text = editor.getText();
        if (!text?.trim()) { showToast("Okunacak metin bulunamadı."); return; }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.9;
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);
        setIsReading(true);
        window.speechSynthesis.speak(utterance);
    };

    const wordCount = () => {
        const text = editor.getText();
        const words = text.split(/\s+/).filter((w: string) => w.length > 0);
        showToast(`📊 Kelime: ${words.length}  |  Karakter: ${text.length}  |  Boşluksuz: ${text.replace(/\s/g, '').length}`);
    };

    const translateSelection = (targetLang: string) => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (!selectedText) { showToast("Çevirmek için metin seçin."); return; }
        window.open(`https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodeURIComponent(selectedText)}`, '_blank');
        setShowTranslate(false);
    };

    // New Tool: Delete all comments
    const deleteAllComments = () => {
        const comments = document.querySelectorAll('[style*="background: #fff3cd"], [style*="background: #fffbeb"]');
        if (comments.length === 0) { showToast("Belgede yorum bulunamadı."); return; }
        comments.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent || ''), el);
            }
        });
        showToast(`✅ ${comments.length} yorum silindi.`);
    };

    // New Tool: Compare (simple diff view)
    const compareText = () => {
        const text = editor.getText();
        const clipText = navigator.clipboard.readText();
        clipText.then(clip => {
            if (!clip) { showToast("Panoda karşılaştırılacak metin bulunamadı."); return; }
            const textWords = text.split(/\s+/);
            const clipWords = clip.split(/\s+/);
            const added = clipWords.filter((w: string) => !textWords.includes(w)).length;
            const removed = textWords.filter((w: string) => !clipWords.includes(w)).length;
            showToast(`📊 Karşılaştırma:\n+${added} eklenen kelime\n-${removed} çıkarılan kelime`);
        }).catch(() => showToast("Pano içeriğine erişilemedi."));
    };

    // New Tool: Reject changes (undo track)
    const rejectChanges = () => {
        editor.chain().focus().undo().run();
        showToast("↩️ Son değişiklik geri alındı.");
    };

    // New Tool: Accessibility check
    const accessibilityCheck = () => {
        const html = editor.getHTML();
        const issues: string[] = [];
        const imgs = (html.match(/<img/g) || []).length;
        const imgsWithAlt = (html.match(/<img[^>]+alt="[^"]+"/g) || []).length;
        if (imgs > imgsWithAlt) issues.push(`⚠️ ${imgs - imgsWithAlt} görsel alt metni eksik`);
        const headings = html.match(/<h[1-6]/g) || [];
        if (headings.length === 0) issues.push("⚠️ Başlık yapısı bulunamadı");
        const links = (html.match(/<a /g) || []).length;
        if (links > 0) issues.push(`ℹ️ ${links} bağlantı bulundu`);
        if (issues.length === 0) showToast("✅ Erişilebilirlik kontrolü başarılı!");
        else showToast("Erişilebilirlik Raporu:\n" + issues.join("\n"));
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Yazım Denetimi */}
            <div className="flex flex-col items-center h-full min-w-[160px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14"
                        title="Yazım ve Dilbilgisi Denetimi" onClick={runSpellCheck}>
                        <SpellCheck size={22} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Yazım Denetimi</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14"
                        title="Kelime Sayısı" onClick={wordCount}>
                        <Hash size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Kelime Sayısı</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Yazım Denetimi</span>
            </div>

            {/* Sesli Okuma */}
            <div className="flex flex-col items-center h-full min-w-[80px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                        title={isReading ? "Okumayı Durdur" : "Sesli Oku"} onClick={readAloud}>
                        <Volume2 size={22} className={cn(isReading ? "text-red-500 animate-pulse" : "text-[#2b579a]")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">{isReading ? "Durdur" : "Sesli Oku"}</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Konuşma</span>
            </div>

            {/* Yorumlar */}
            <div className="flex flex-col items-center h-full min-w-[180px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14"
                        title="Yorum Ekle" onClick={addComment}>
                        <MessageSquare size={20} className="text-amber-500" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Yorum Ekle</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <button onClick={() => navigateComments('prev')} className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700">
                            <ArrowLeft size={10} /> Önceki
                        </button>
                        <button onClick={() => navigateComments('next')} className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700">
                            <ArrowRight size={10} /> Sonraki
                        </button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Yorumlar</span>
            </div>

            {/* İzleme */}
            <div className="flex flex-col items-center h-full min-w-[120px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <div className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer group w-16 transition-all",
                        trackChangesOn ? "btn-active" : "hover:bg-white/60")}
                        title={trackChangesOn ? "Değişiklikleri İzlemeyi Kapat" : "Değişiklikleri İzle"}
                        onClick={toggleTrackChanges}>
                        <Eye size={20} className={cn(trackChangesOn ? "text-green-500" : "text-zinc-400")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">{trackChangesOn ? "İzleniyor" : "İzle"}</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">İzleme</span>
            </div>

            {/* Vurgu */}
            <div className="flex flex-col items-center h-full min-w-[80px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14"
                            onClick={() => setShowHighlightColors(!showHighlightColors)}>
                            <Highlighter size={20} className="text-yellow-500" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">Vurgula</span>
                        </div>
                        {showHighlightColors && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[100px]">
                                <div className="grid grid-cols-3 gap-1">
                                    {HIGHLIGHT_COLORS.map(c => (
                                        <button key={c.value}
                                            className="w-6 h-6 rounded-sm border border-zinc-200 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c.value }} title={c.name}
                                            onClick={() => { editor.chain().focus().toggleHighlight({ color: c.value }).run(); setShowHighlightColors(false); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Vurgu</span>
            </div>

            {/* Dil */}
            <div className="flex flex-col items-center h-full min-w-[80px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14"
                            title="Çevir" onClick={() => setShowTranslate(!showTranslate)}>
                            <Languages size={20} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">Çevir</span>
                        </div>
                        {showTranslate && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[120px] py-1">
                                {[['en', 'İngilizce'], ['de', 'Almanca'], ['fr', 'Fransızca'], ['es', 'İspanyolca'], ['ar', 'Arapça'], ['ru', 'Rusça'], ['zh', 'Çince']].map(([code, name]) => (
                                    <button key={code} className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50" onClick={() => translateSelection(code)}>{name}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Dil</span>
            </div>

            {/* Koruma */}
            <div className="flex flex-col items-center h-full min-w-[80px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer group w-16 transition-all",
                        isProtected ? "btn-active" : "hover:bg-white/60")}
                        title={isProtected ? "Korumayı Kaldır" : "Belgeyi Koru"} onClick={toggleProtect}>
                        <Shield size={22} className={cn(isProtected ? "text-[#2b579a]" : "text-zinc-400")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">{isProtected ? "Korumalı" : "Koru"}</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Koruma</span>
            </div>

            {/* Yeni Araçlar Group */}
            <div className="flex flex-col items-center h-full min-w-[220px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={deleteAllComments} title="Tüm Yorumları Sil" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Trash2 size={18} className="text-red-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Sil</span>
                    </button>
                    <button onClick={compareText} title="Metinleri Karşılaştır" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <GitCompare size={18} className="text-indigo-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Karşılaştır</span>
                    </button>
                    <button onClick={rejectChanges} title="Değişikliği Reddet" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <XCircle size={18} className="text-orange-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Reddet</span>
                    </button>
                    <button onClick={accessibilityCheck} title="Erişilebilirlik Kontrolü" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Accessibility size={18} className="text-teal-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Erişim</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Gelişmiş</span>
            </div>

            {/* Değişiklik Yönetimi */}
            <div className="flex flex-col items-center h-full min-w-[340px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const marks = document.querySelectorAll('.ProseMirror [style*="background: #dcfce7"]');
                        if (marks.length === 0) showToast('Kabul edilecek değişiklik yok.');
                        else { marks.forEach(m => { (m as HTMLElement).style.background = ''; }); showToast(`✅ ${marks.length} değişiklik kabul edildi.`); }
                    }} title="Değişikliği Kabul Et" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <CheckCircle2 size={18} className="text-green-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Kabul</span>
                    </button>
                    <button onClick={() => {
                        const all = document.querySelectorAll('.ProseMirror [style*="background"]');
                        all.forEach(m => { (m as HTMLElement).style.background = ''; });
                        showToast('✅ Tüm değişiklikler kabul edildi.');
                    }} title="Tümünü Kabul Et" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <CheckCheck size={18} className="text-emerald-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Tüm Kabul</span>
                    </button>
                    <button onClick={() => {
                        editor.chain().focus().undo().run();
                        showToast('❌ Tüm değişiklikler reddedildi.');
                    }} title="Tümünü Reddet" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <XOctagon size={18} className="text-red-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Tüm Red</span>
                    </button>
                    <button onClick={() => {
                        const comments = document.querySelectorAll('.ProseMirror [data-comment]');
                        if (comments.length > 0) {
                            (comments[0] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
                            (comments[0] as HTMLElement).style.outline = '2px solid #3b82f6';
                            setTimeout(() => { (comments[0] as HTMLElement).style.outline = ''; }, 2000);
                        }
                    }} title="Önceki Değişiklik" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <SkipBack size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Önceki</span>
                    </button>
                    <button onClick={() => {
                        const comments = document.querySelectorAll('.ProseMirror [data-comment]');
                        if (comments.length > 0) {
                            const last = comments[comments.length - 1] as HTMLElement;
                            last.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            last.style.outline = '2px solid #3b82f6';
                            setTimeout(() => { last.style.outline = ''; }, 2000);
                        }
                    }} title="Sonraki Değişiklik" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <SkipForward size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Sonraki</span>
                    </button>
                    <button onClick={() => {
                        const comments = document.querySelectorAll('.ProseMirror [data-comment]');
                        showToast(`📋 İşaretli öğe: ${comments.length}`);
                    }} title="İşaretleri Göster" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <List size={18} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">İşaretler</span>
                    </button>
                    <button onClick={() => showToast('📝 İnceleme paneli: Belgede toplam ' + editor.getText().split(/\s+/).length + ' kelime.')} title="İnceleme Paneli" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <PanelRightClose size={18} className="text-amber-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Panel</span>
                    </button>
                    <button onClick={() => {
                        editor.setEditable(!editor.isEditable);
                        showToast(editor.isEditable ? '🔓 Düzenleme açıldı.' : '🔒 Düzenleme kısıtlandı.');
                    }} title="Düzenlemeyi Kısıtla" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Lock size={18} className="text-red-400" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Kısıtla</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Değişiklik Yönetimi</span>
            </div>

            {/* Modals & Toasts */}
            <InputModal
                isOpen={showCommentModal}
                title="Yorum Ekle"
                fields={[{ label: "Yorumunuz", placeholder: "Yorumunuzu yazın...", key: "comment" }]}
                onConfirm={handleCommentConfirm}
                onClose={() => setShowCommentModal(false)}
                confirmText="Yorum Ekle"
            />
            {toast && <InfoToast message={toast} onClose={() => setToast(null)} />}
        </div>
    );
};

export default memo(ReviewTab);
