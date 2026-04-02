"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, PieChart, Library, ArrowRightLeft, FileSearch, MousePointer2, Image, FileImage, Clock, Trash2, ExternalLink, FolderOpen, RefreshCw, Type, Combine, Heart } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ThemeToggle from "./ThemeToggle";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../data/templates";
import { getRecentDocuments, deleteRecentDocument, clearRecentDocuments, type RecentDocument } from "../utils/recentDocuments";

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

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2" suppressHydrationWarning>
                        Yeni Belge Oluşturun
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">15+ profesyonel şablondan birini seçin veya sıfırdan başlayın.</p>
                </motion.div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Şablon ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-slate-600 text-sm font-medium bg-white dark:bg-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all",
                            activeCategory === "all"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
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
                                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                                activeCategory === cat.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
                                    : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Quick Tools Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <ArrowRightLeft size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Hızlı Araçlar</h2>
                        <span className="ml-auto text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">Popüler</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { id: "pptx-editor", title: "PowerPoint Editörü", icon: PieChart, color: "from-red-500 to-orange-500", desc: "Sunum Oluştur & Düzenle", badge: "YENİ" },
                            { id: "pptx-open", title: "PPTX Dosyası Aç", icon: Library, color: "from-amber-500 to-orange-500", desc: "Mevcut Sunumu Düzenle" },
                            { id: "pdf-to-pptx", title: "PDF'den PPTX'e", icon: PieChart, color: "from-orange-500 to-orange-600", desc: "PDF'i Sunuma Çevir" },
                            { id: "pptx-to-pdf", title: "PPTX'ten PDF'e", icon: Library, color: "from-blue-500 to-blue-600", desc: "Sunumu PDF Yap" },
                            { id: "pptx-to-png", title: "PPTX'ten PNG'ye", icon: Image, color: "from-teal-500 to-emerald-500", desc: "Slaytları Görsele Çevir" },
                            { id: "docx-to-pptx", title: "Word'den PPTX'e", icon: FileText, color: "from-sky-500 to-blue-600", desc: "Belgeden Sunum Oluştur" },
                            { id: "pdf-to-word", title: "PDF'den Word'e", icon: FileText, color: "from-indigo-500 to-indigo-600", desc: "PDF'i Metne Çevir" },
                            { id: "word-to-pdf", title: "Word'den PDF'e", icon: FileSearch, color: "from-red-500 to-red-600", desc: "Word'ü PDF Yap" },
                            { id: "png-to-pdf", title: "PNG'den PDF'e", icon: Image, color: "from-emerald-500 to-emerald-600", desc: "Görseli PDF Yap" },
                            { id: "png-to-docx", title: "PNG'den Word'e", icon: FileImage, color: "from-violet-500 to-violet-600", desc: "Görseli DOCX Yap" },
                            { id: "docx-to-png", title: "Word'den PNG'ye", icon: FileSearch, color: "from-pink-500 to-pink-600", desc: "DOCX'i Görsel Yap" },
                            { id: "pdf-to-png", title: "PDF'den PNG'ye", icon: Image, color: "from-cyan-500 to-cyan-600", desc: "PDF'i Görsel Yap" },
                            { id: "universal-converter", title: "Tüm Format Dönüştürücü", icon: RefreshCw, color: "from-blue-600 to-indigo-600", desc: "Her Dosyayı Dönüştür", badge: "YENİ" },
                            { id: "ocr-tool", title: "Resimden Yazıya (OCR)", icon: FileSearch, color: "from-amber-500 to-orange-600", desc: "Metni Çıkar", badge: "YENİ" },
                            { id: "excel-editor", title: "Excel (Tablo) Editörü", icon: PieChart, color: "from-emerald-500 to-teal-600", desc: "Tablo Oluştur", badge: "YENİ" },
                            { id: "excel-open", title: "Excel Dosyası Aç", icon: Library, color: "from-teal-500 to-cyan-600", desc: "Mevcut Tabloyu Düzenle" },
                            { id: "pdf-merge-split", title: "PDF Birleştir & Ayır", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "PDF'leri Yönet", badge: "YENİ" },
                            { id: "cv-wizard", title: "CV Özgeçmiş Oluşturucu", icon: FileText, color: "from-purple-500 to-pink-500", desc: "Hızlıca CV Hazırla", badge: "YENİ" },
                            { id: "invoice-wizard", title: "Fatura Kesici", icon: FileText, color: "from-indigo-400 to-purple-600", desc: "PDF Fatura Çıkar", badge: "YENİ" },
                            { id: "bg-remover", title: "Arka Plan Kaldırıcı", icon: Image, color: "from-fuchsia-500 to-purple-600", desc: "Arka Planı Sil", badge: "YENİ" },
                            { id: "word-modifier", title: "Word Seç (Stil Uygula)", icon: Type, color: "from-indigo-600 to-purple-600", desc: "Kelime Stilini Değiştir", badge: "YENİ" },
                            { id: "image-cropper", title: "Fotoğraf Kesme", icon: Image, color: "from-indigo-500 to-cyan-600", desc: "Fotoğraf Boyutlandır", badge: "YENİ" },
                            { id: "image-enhancer", title: "Bulanıklık Giderici", icon: Image, color: "from-emerald-500 to-teal-600", desc: "Fotoğrafı Netleştir", badge: "YENİ" },
                            { id: "birthday-message", title: "Doğum Günü Mesajı", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Uzun Mesaj Oluştur", badge: "YENİ", content: "<h1>İyi ki Doğdun!</h1><p>İyi ki doğdun! Hayatının yeni yaşının sana sağlık, mutluluk, başarı ve huzur getirmesini diliyorum. Umarım tüm hayallerin gerçek olur ve yüzün hep böyle güler. Seninle geçirdiğim her an o kadar kıymetli ki, iyi ki varsın ve iyi ki hayatımızdasın. Birlikte daha nice güzel anılar biriktireceğimiz harika bir yıl olsun. Yeni yaşın kutlu olsun! Dünyanın en şanslı insanıyım çünkü senin gibi harika bir dosta/insana sahibim. Hayat bazen zorlayıcı olabilir ama seninle her şeyin üstesinden gelmek o kadar kolay ve eğlenceli ki... Gülümsemen yüzünden eksik olmasın, kalbin her zamankinden daha umut dolu atsın. Hep mutlu ol, hiçbir şey için canını sıkma, her şey dilediğin gibi güzel geçsin yaşantında. Uzun lafın kısası, her şey gönlünce olsun. Nice mutlu yıllara!</p>" },
                        ].map((tool, i) => (

                            <motion.button
                                key={tool.id}
                                whileHover={{ scale: 1.02, translateY: -4 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => onSelectTemplate(tool.id, (tool as any).content || "")}
                                className="group relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl border border-zinc-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left"
                            >
                                <div className={cn("w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-lg bg-gradient-to-br", tool.color)}>
                                    <tool.icon size={24} />
                                </div>
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.title}</h3>
                                <p className="text-[11px] text-zinc-400 font-medium">{tool.desc}</p>

                                {tool.badge && (
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{tool.badge}</span>
                                    </div>
                                )}

                                <div className={cn("absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", tool.badge && "top-10")}>
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <MousePointer2 size={14} />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Templates Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-600">
                        <Plus size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Şablonla Başlayın</h2>
                </div>

                {/* Templates Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory + searchQuery}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    >
                        {filteredTemplates.map((template, index) => (
                            <motion.button
                                key={template.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => onSelectTemplate(template.id, template.content)}
                                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-zinc-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
                            >
                                <div className={cn("w-11 h-11 rounded-xl mb-3 flex items-center justify-center text-white shadow-lg", template.color)}>
                                    <template.icon size={22} />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{template.title}</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed">{template.description}</p>

                                {/* Category Badge */}
                                <div className="mt-3">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                        {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label || "Diğer"}
                                    </span>
                                </div>

                                {/* Hover gradient */}
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-full -mr-8 -mb-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-16 text-zinc-400">
                        <Search size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">Şablon bulunamadı</p>
                        <p className="text-sm">Farklı anahtar kelimeler deneyin.</p>
                    </div>
                )}

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
