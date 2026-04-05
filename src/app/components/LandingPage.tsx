"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, PieChart, Library, ArrowRightLeft, FileSearch, MousePointer2, Image, FileImage, Clock, Trash2, ExternalLink, FolderOpen, RefreshCw, Type, Combine, Heart, LayoutTemplate, ArrowLeft, Code, FileCode, Braces, FileCode2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ThemeToggle from "./ThemeToggle";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../data/templates";
import { getRecentDocuments, deleteRecentDocument, clearRecentDocuments, type RecentDocument } from "../utils/recentDocuments";

const ALL_TOOLS = [
    { id: "pptx-editor", title: "PowerPoint Editörü", icon: PieChart, color: "from-red-500 to-orange-500", desc: "Sunum Oluştur & Düzenle", badge: "YENİ", group: "powerpoint" },
    { id: "pptx-open", title: "PPTX Dosyası Aç", icon: Library, color: "from-amber-500 to-orange-500", desc: "Mevcut Sunumu Düzenle", group: "powerpoint" },
    { id: "pdf-to-pptx", title: "PDF'den PPTX'e", icon: PieChart, color: "from-orange-500 to-orange-600", desc: "PDF'i Sunuma Çevir", group: "converters" },
    { id: "pptx-to-pdf", title: "PPTX'ten PDF'e", icon: Library, color: "from-blue-500 to-blue-600", desc: "Sunumu PDF Yap", group: "converters" },
    { id: "pptx-to-png", title: "PPTX'ten PNG'ye", icon: Image, color: "from-teal-500 to-emerald-500", desc: "Slaytları Görsele Çevir", group: "converters" },
    { id: "docx-to-pptx", title: "Word'den PPTX'e", icon: FileText, color: "from-sky-500 to-blue-600", desc: "Belgeden Sunum Oluştur", group: "converters" },
    { id: "pdf-to-word", title: "PDF'den Word'e", icon: FileText, color: "from-indigo-500 to-indigo-600", desc: "PDF'i Metne Çevir", group: "converters" },
    { id: "word-to-pdf", title: "Word'den PDF'e", icon: FileSearch, color: "from-red-500 to-red-600", desc: "Word'ü PDF Yap", group: "converters" },
    { id: "png-to-pdf", title: "PNG'den PDF'e", icon: Image, color: "from-emerald-500 to-emerald-600", desc: "Görseli PDF Yap", group: "converters" },
    { id: "png-to-docx", title: "PNG'den Word'e", icon: FileImage, color: "from-violet-500 to-violet-600", desc: "Görseli DOCX Yap", group: "converters" },
    { id: "docx-to-png", title: "Word'den PNG'ye", icon: FileSearch, color: "from-pink-500 to-pink-600", desc: "DOCX'i Görsel Yap", group: "converters" },
    { id: "pdf-to-png", title: "PDF'den PNG'ye", icon: Image, color: "from-cyan-500 to-cyan-600", desc: "PDF'i Görsel Yap", group: "converters" },
    { id: "universal-converter", title: "Tüm Format Dönüştürücü", icon: RefreshCw, color: "from-blue-600 to-indigo-600", desc: "Her Dosyayı Dönüştür", badge: "YENİ", group: "converters" },
    { id: "pdf", title: "PDF Düzenleyici", icon: FileSearch, color: "from-rose-500 to-red-600", desc: "PDF Aç ve Düzenle", badge: "YENİ", group: "pdf" },
    { id: "pdf-merge-split", title: "PDF Birleştir & Ayır", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "PDF'leri Yönet", badge: "YENİ", group: "pdf" },
    { id: "ocr-tool", title: "Resimden Yazıya (OCR)", icon: FileSearch, color: "from-amber-500 to-orange-600", desc: "Metni Çıkar", badge: "YENİ", group: "office" },
    { id: "excel-editor", title: "Excel (Tablo) Editörü", icon: PieChart, color: "from-emerald-500 to-teal-600", desc: "Tablo Oluştur", badge: "YENİ", group: "office" },
    { id: "excel-open", title: "Excel Dosyası Aç", icon: Library, color: "from-teal-500 to-cyan-600", desc: "Mevcut Tabloyu Düzenle", group: "office" },
    { id: "cv-wizard", title: "CV Özgeçmiş Oluşturucu", icon: FileText, color: "from-purple-500 to-pink-500", desc: "Hızlıca CV Hazırla", badge: "YENİ", group: "office" },
    { id: "invoice-wizard", title: "Fatura Kesici", icon: FileText, color: "from-indigo-400 to-purple-600", desc: "PDF Fatura Çıkar", badge: "YENİ", group: "office" },
    { id: "bg-remover", title: "Arka Plan Kaldırıcı", icon: Image, color: "from-fuchsia-500 to-purple-600", desc: "Arka Planı Sil", badge: "YENİ", group: "photo" },
    { id: "word-modifier", title: "Word Seç (Stil Uygula)", icon: Type, color: "from-indigo-600 to-purple-600", desc: "Kelime Stilini Değiştir", badge: "YENİ", group: "office" },
    { id: "image-cropper", title: "Fotoğraf Kesme", icon: Image, color: "from-indigo-500 to-cyan-600", desc: "Fotoğraf Boyutlandır", badge: "YENİ", group: "photo" },
    { id: "image-enhancer", title: "Bulanıklık Giderici", icon: Image, color: "from-emerald-500 to-teal-600", desc: "Fotoğrafı Netleştir", badge: "YENİ", group: "photo" },
    { id: "canva-clone", title: "Tasarım Stüdyosu (Canva)", icon: LayoutTemplate, color: "from-fuchsia-500 to-rose-500", desc: "Tasarım ve Afiş Yap", badge: "YENİ", group: "photo" },
    { id: "birthday-message", title: "Doğum Günü Mesajı", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Uzun Mesaj Oluştur", badge: "YENİ", group: "office", content: "<h1>İyi ki Doğdun!</h1><p>İyi ki doğdun! Hayatının yeni yaşının sana sağlık, mutluluk, başarı ve huzur getirmesini diliyorum. Umarım tüm hayallerin gerçek olur ve yüzün hep böyle güler. Seninle geçirdiğim her an o kadar kıymetli ki, iyi ki varsın ve iyi ki hayatımızdasın. Birlikte daha nice güzel anılar biriktireceğimiz harika bir yıl olsun. Yeni yaşın kutlu olsun! Dünyanın en şanslı insanıyım çünkü senin gibi harika bir dosta/insana sahibim. Hayat bazen zorlayıcı olabilir ama seninle her şeyin üstesinden gelmek o kadar kolay ve eğlenceli ki... Gülüşmen yüzünden eksik olmasın, kalbin her zamankinden daha umut dolu atsın. Hep mutlu ol, hiçbir şey için canını sıkma, her şey dilediğin gibi güzel geçsin yaşantında. Uzun lafın kısası, her şey gönlünce olsun. Nice mutlu yıllara!</p>" },
    { id: "code-editor-html", title: "HTML Editörü", icon: FileCode, color: "from-orange-500 to-red-500", desc: "HTML Kodunu Yaz ve Görüntüle", badge: "YENİ", group: "code" },
    { id: "code-editor-css", title: "CSS Editörü", icon: Braces, color: "from-blue-500 to-cyan-500", desc: "CSS Stillerini Düzenle", badge: "YENİ", group: "code" },
    { id: "code-editor-js", title: "JavaScript Editörü", icon: FileCode2, color: "from-yellow-400 to-orange-500", desc: "JS Kodu Yaz ve Çalıştır", badge: "YENİ", group: "code" },
    { id: "folder-code-editor", title: "Normal Kod Editörü", icon: FolderOpen, color: "from-violet-500 to-indigo-600", desc: "Klasörden Gerçek Proje Aç", badge: "YENİ", group: "code" },
];

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function formatDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return new Date(timestamp).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

interface LandingPageProps {
    onSelectTemplate: (id: string, content: string) => void;
    onOpenRecentDocument?: (doc: RecentDocument) => void;
}

export default function LandingPage({ onSelectTemplate, onOpenRecentDocument }: LandingPageProps) {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
    const [activeToolGroup, setActiveToolGroup] = useState<string | null>(null);

    useEffect(() => {
        setRecentDocs(getRecentDocuments());
    }, []);

    const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteRecentDocument(id);
        setRecentDocs(getRecentDocuments());
    };

    const handleClearAll = () => {
        clearRecentDocuments();
        setRecentDocs([]);
    };

    const handleOpenDoc = (doc: RecentDocument) => {
        if (onOpenRecentDocument) {
            onOpenRecentDocument(doc);
        } else {
            onSelectTemplate("recent:" + doc.id, doc.content);
        }
    };

    const filteredTemplates = TEMPLATES.filter(t => {
        const matchesCategory = activeCategory === "all" || t.category === activeCategory;
        const matchesSearch = searchQuery === "" ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0a0a1a] dark:via-[#0d0d24] dark:to-[#0a0a1a] flex flex-col">
            {/* Header */}
            <header className="p-5 flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#0d0d1a]/80 sticky top-0 z-50 border-b border-zinc-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                        <FileText className="text-white" size={22} />
                    </div>
                    <div>
                        <span className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Word P.</span>
                        <span className="text-[10px] text-zinc-400 block -mt-1 font-medium">Profesyonel Belge Düzenleyici</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 relative z-10">
                {/* Jaw-Dropping Hero Section */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-14 text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800/50">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                        Word P. OS 2.0 Yayında
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tight mb-6" suppressHydrationWarning>
                        Sınırları Aşan
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 ml-3">Üretkenlik.</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                        Tüm profesyonel belgelerinizi, tasarımlarınızı ve şablonlarınızı tek bir süper uygulamadan yönetin. Sükunetle hızlanın.
                    </p>
                </motion.div>

                {/* Spotlight Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-16 max-w-2xl mx-auto relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[24px] blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center bg-white/70 dark:bg-[#12122b]/80 backdrop-blur-2xl border-2 border-zinc-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-blue-900/5 dark:shadow-none overflow-hidden transition-all group-focus-within:border-blue-500">
                        <div className="pl-6 text-zinc-400">
                            <Search size={26} />
                        </div>
                        <input
                            type="text"
                            placeholder="Dosya, araç veya şablon arayın..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-6 py-5 text-lg font-medium bg-transparent text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="relative right-4 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>



                {/* Quick Tools Header */}
                <div className="mb-12" id="quick-tools">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Library size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">Stüdyolar</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium -mt-1">Tüm araçlara alanlarına göre göz atın.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!activeToolGroup ? (
                            <motion.div
                                key="folders"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-3 justify-items-center"
                            >
                                    {/* Folders List */}
                                    {[
                                        { id: "converters", title: "Çeviriciler", subtitle: "PDF, Word, PPTX ve Görüntü formatları arasında 10+ dönüştürücü.", icon: RefreshCw, bg: "from-emerald-400 to-teal-600", borderHover: "hover:border-emerald-500/50", glow: "group-hover:shadow-emerald-500/20" },
                                        { id: "pdf", title: "PDF Stüdyosu", subtitle: "PDF dosyalarını birleştir, ayır, düzenle ve sayfa bazlı kontrol sağla.", icon: FileSearch, bg: "from-rose-400 to-red-600", borderHover: "hover:border-rose-500/50", glow: "group-hover:shadow-rose-500/20" },
                                        { id: "code", title: "Kod Editörü", subtitle: "HTML, CSS ve JavaScript kodlarını canlı önizlemeyle yaz, düzenle ve çalıştır.", icon: Code, bg: "from-violet-500 to-indigo-600", borderHover: "hover:border-violet-500/50", glow: "group-hover:shadow-violet-500/20" },
                                        { id: "photo", title: "Fotoğraf Stüdyosu", subtitle: "Canva stili tasarım posterleri, arka plan kaldırma araçları.", icon: Image, bg: "from-fuchsia-400 to-purple-600", borderHover: "hover:border-fuchsia-500/50", glow: "group-hover:shadow-fuchsia-500/20" },
                                        { id: "word", title: "Şablonlar & Sahneler", subtitle: "50'den fazla hazır sektörel şablon tasarımıyla hemen başla.", icon: LayoutTemplate, bg: "from-blue-400 to-indigo-600", borderHover: "hover:border-blue-500/50", glow: "group-hover:shadow-blue-500/20" },
                                        { id: "office", title: "Ofis Araçları", subtitle: "Gelişmiş Excel tablo düzenleyici ve akıllı asistanlar.", icon: Type, bg: "from-indigo-400 to-violet-600", borderHover: "hover:border-indigo-500/50", glow: "group-hover:shadow-indigo-500/20" },
                                        { id: "powerpoint", title: "Sunum (PPTX)", subtitle: "Profesyonel slayt sunumları oluşturun ve sahne tasarımları yapın.", icon: PieChart, bg: "from-amber-400 to-orange-600", borderHover: "hover:border-amber-500/50", glow: "group-hover:shadow-amber-500/20" }
                                    ].map((folder, i) => (
                                        <motion.button
                                            key={folder.id}
                                            onClick={() => setActiveToolGroup(folder.id)}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={cn("group relative w-72 h-72 sm:w-80 sm:h-80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[32px] p-6 border-2 border-transparent shadow-sm hover:shadow-2xl transition-all text-center overflow-hidden flex flex-col items-center justify-center shrink-0", folder.borderHover, folder.glow)}
                                        >
                                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br", folder.bg)}></div>
                                            
                                            <div className="flex flex-col items-center gap-6 relative z-10 w-full h-full justify-center">
                                                {/* Icon block */}
                                                <div className={cn("w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br", folder.bg)}>
                                                    <folder.icon size={36} strokeWidth={1.5} />
                                                </div>
                                                
                                                {/* Text Block */}
                                                <div className="flex-1 w-full mt-2 flex flex-col justify-center">
                                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{folder.title}</h3>
                                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-3 px-2 leading-relaxed">{folder.subtitle}</p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                        ) : activeToolGroup === "word" ? (
                            <motion.div
                                key="templates"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setActiveToolGroup(null)}
                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                                        >
                                            <ArrowLeft size={16} /> Geri Dön
                                        </button>
                                        <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">
                                            Şablonlarla Başlayın
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                                        <button
                                            onClick={() => setActiveCategory("all")}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                                activeCategory === "all"
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200/50 dark:shadow-blue-900/40"
                                                    : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600"
                                            )}
                                        >
                                            Tümü
                                        </button>
                                        {TEMPLATE_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                                    activeCategory === cat.id
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200/50 dark:shadow-blue-900/40"
                                                        : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600"
                                                )}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredTemplates.map((template, index) => (
                                        <motion.button
                                            key={template.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => onSelectTemplate(template.id, template.content)}
                                            className="group relative bg-white/80 backdrop-blur-md dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-zinc-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
                                        >
                                            <div className={cn("w-11 h-11 rounded-xl mb-3 flex items-center justify-center text-white shadow-lg bg-gradient-to-br", template.color)}>
                                                <template.icon size={22} />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{template.title}</h3>
                                            <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2">{template.description}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="tools"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <button 
                                        onClick={() => setActiveToolGroup(null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Geri Dön
                                    </button>
                                    <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">
                                        {activeToolGroup === "converters" ? "Çeviriciler" : activeToolGroup === "pdf" ? "PDF Stüdyosu" : activeToolGroup === "photo" ? "Fotoğraf Stüdyosu" : activeToolGroup === "office" ? "Ofis Araçları" : activeToolGroup === "code" ? "Kod Editörü" : "PowerPoint Stüdyosu"}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {ALL_TOOLS.filter(t => t.group === activeToolGroup).map((tool, i) => (
                                        <motion.button
                                            key={tool.id}
                                            whileHover={{ scale: 1.02, translateY: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => onSelectTemplate(tool.id, (tool as any).content || "")}
                                            className="group relative overflow-hidden bg-white/80 backdrop-blur-md dark:bg-slate-800/80 p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left"
                                        >
                                            <div className={cn("w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-lg bg-gradient-to-br", tool.color)}>
                                                <tool.icon size={24} />
                                            </div>
                                            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">{tool.title}</h3>
                                            <p className="text-[10px] text-zinc-400 font-medium line-clamp-2">{tool.desc}</p>

                                            {tool.badge && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{tool.badge}</span>
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>



                {/* Recent Documents */}
                <section className="mt-16">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                <Clock size={18} />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Son Belgeler</h2>
                            {recentDocs.length > 0 && (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    {recentDocs.length} belge
                                </span>
                            )}
                        </div>
                        {recentDocs.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={12} />
                                Tümünü Temizle
                            </button>
                        )}
                    </div>

                    {recentDocs.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-zinc-300 dark:border-slate-600 p-10 flex flex-col items-center justify-center text-zinc-400">
                            <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                <FolderOpen size={28} className="text-zinc-300" />
                            </div>
                            <p className="text-base font-medium">Son belge bulunamadı</p>
                            <p className="text-sm">Yukarıdan bir şablon seçerek başlayın.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {recentDocs.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleOpenDoc(doc)}
                                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-zinc-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        {/* Document icon header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                                <FileText size={20} />
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteDoc(doc.id, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500"
                                                title="Belgeyi sil"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {doc.title}
                                        </h3>

                                        {/* Preview */}
                                        <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
                                            {doc.preview}
                                        </p>

                                        {/* Meta info */}
                                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(doc.lastModified)}
                                            </span>
                                            <span className="font-medium">{doc.wordCount} kelime</span>
                                        </div>

                                        {/* Open indicator */}
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                                                <ExternalLink size={12} />
                                            </div>
                                        </div>

                                        {/* Hover gradient */}
                                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-full -mr-6 -mb-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </main>

            <footer className="p-6 text-center text-zinc-400 dark:text-slate-500 text-sm border-t border-zinc-200/50 dark:border-slate-700/50">
                &copy; 2026 Word P. Tüm hakları saklıdır.
            </footer>
        </div>
    );
}
