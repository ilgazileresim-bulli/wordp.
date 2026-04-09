"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, PieChart, Library, ArrowRightLeft, FileSearch, MousePointer2, Image, FileImage, Clock, Trash2, ExternalLink, FolderOpen, RefreshCw, Type, Combine, Heart, LayoutTemplate, ArrowLeft, Code, FileCode, Braces, FileCode2, Zap } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../data/templates";
import { getRecentDocuments, deleteRecentDocument, clearRecentDocuments, type RecentDocument } from "../utils/recentDocuments";
import Calculator from "./Calculator";


const ALL_TOOLS = [
    { id: "pptx-editor", title: "PowerPoint Editor", icon: PieChart, color: "from-red-500 to-orange-500", desc: "Create & Edit Presentations", badge: "NEW", group: "powerpoint" },
    { id: "pptx-open", title: "Open PPTX File", icon: Library, color: "from-amber-500 to-orange-500", desc: "Edit Existing Presentation", group: "powerpoint" },
    { id: "pdf-to-pptx", title: "PDF to PPTX", icon: PieChart, color: "from-orange-500 to-orange-600", desc: "Convert PDF to Slides", group: "converters" },
    { id: "pptx-to-pdf", title: "PPTX to PDF", icon: Library, color: "from-blue-500 to-blue-600", desc: "Make Presentation PDF", group: "converters" },
    { id: "pptx-to-png", title: "PPTX to PNG", icon: Image, color: "from-teal-500 to-emerald-500", desc: "Convert Slides to Images", group: "converters" },
    { id: "docx-to-pptx", title: "Word to PPTX", icon: FileText, color: "from-sky-500 to-blue-600", desc: "Create Slides from Document", group: "converters" },
    { id: "pdf-to-word", title: "PDF to Word", icon: FileText, color: "from-indigo-500 to-indigo-600", desc: "Convert PDF to Text", group: "converters" },
    { id: "word-to-pdf", title: "Word to PDF", icon: FileSearch, color: "from-red-500 to-red-600", desc: "Convert Word to PDF", group: "converters" },
    { id: "png-to-pdf", title: "PNG to PDF", icon: Image, color: "from-emerald-500 to-emerald-600", desc: "Make Image PDF", group: "converters" },
    { id: "png-to-docx", title: "PNG to Word", icon: FileImage, color: "from-violet-500 to-violet-600", desc: "Convert Image to DOCX", group: "converters" },
    { id: "docx-to-png", title: "Word to PNG", icon: FileSearch, color: "from-pink-500 to-pink-600", desc: "Convert DOCX to Image", group: "converters" },
    { id: "pdf-to-png", title: "PDF to PNG", icon: Image, color: "from-cyan-500 to-cyan-600", desc: "Convert PDF to Image", group: "converters" },
    { id: "universal-converter", title: "Universal Converter", icon: RefreshCw, color: "from-blue-600 to-indigo-600", desc: "Convert Any File", badge: "NEW", group: "converters" },
    { id: "pdf", title: "PDF Editor", icon: FileSearch, color: "from-rose-500 to-red-600", desc: "Open and Edit PDF", badge: "NEW", group: "pdf" },
    { id: "pdf-merge-split", title: "PDF Merge & Split", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "Manage PDF Files", badge: "NEW", group: "pdf" },
    { id: "ocr-tool", title: "Image to Text (OCR)", icon: FileSearch, color: "from-amber-500 to-orange-600", desc: "Extract Text from Images", badge: "NEW", group: "office" },
    { id: "excel-editor", title: "Excel (Sheet) Editor", icon: PieChart, color: "from-emerald-500 to-teal-600", desc: "Create Spreadsheets", badge: "NEW", group: "office" },
    { id: "excel-open", title: "Open Excel File", icon: Library, color: "from-teal-500 to-cyan-600", desc: "Edit Existing Sheet", group: "office" },
    { id: "cv-wizard", title: "CV Resume Builder", icon: FileText, color: "from-purple-500 to-pink-500", desc: "Quick Resume Creation", badge: "NEW", group: "office" },
    { id: "invoice-wizard", title: "Invoice Generator", icon: FileText, color: "from-indigo-400 to-purple-600", desc: "Export PDF Invoice", badge: "NEW", group: "office" },
    { id: "bg-remover", title: "Background Remover", icon: Image, color: "from-fuchsia-500 to-purple-600", desc: "Remove Background", badge: "NEW", group: "photo" },
    { id: "word-modifier", title: "Word Styler", icon: Type, color: "from-indigo-600 to-purple-600", desc: "Apply Text Styles", badge: "NEW", group: "office" },
    { id: "image-cropper", title: "Image Cropper", icon: Image, color: "from-indigo-500 to-cyan-600", desc: "Resize Images", badge: "NEW", group: "photo" },
    { id: "image-enhancer", title: "Unblur Image", icon: Image, color: "from-emerald-500 to-teal-600", desc: "Sharpen Photos", badge: "NEW", group: "photo" },
    { id: "canva-clone", title: "Design Studio (Canva)", icon: LayoutTemplate, color: "from-fuchsia-500 to-rose-500", desc: "Create Designs and Posters", badge: "NEW", group: "photo" },
    { id: "birthday-message", title: "Birthday Message", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Generate Long Messages", badge: "NEW", group: "office", content: "<h1>Happy Birthday!</h1><p>Happy birthday! I wish your new year of life brings you health, happiness, success, and peace. I hope all your dreams come true and your face always smiles like this. Every moment I spend with you is so precious, I'm glad you exist and I'm glad you're in our lives. May it be a wonderful year where we accumulate many more beautiful memories together. Happy new age! I am the luckiest person in the world because I have such a wonderful friend/person like you. Life can be challenging sometimes, but everything is so easy and fun to overcome with you... May your laughter never be missing from your face, may your heart beat more hopefully than ever. Always be happy, don't let anything worry you, everything go as beautifully as you wish in your life. In short, may everything be as you wish. Many happy years!</p>" },
    { id: "code-editor-html", title: "HTML Editor", icon: FileCode, color: "from-orange-500 to-red-500", desc: "Write & Preview HTML", badge: "NEW", group: "code" },
    { id: "code-editor-css", title: "CSS Editor", icon: Braces, color: "from-blue-500 to-cyan-500", desc: "Edit CSS Styles", badge: "NEW", group: "code" },
    { id: "code-editor-js", title: "JavaScript Editor", icon: FileCode2, color: "from-yellow-400 to-orange-500", desc: "Write & Run JS Code", badge: "NEW", group: "code" },
    { id: "folder-code-editor", title: "Real Project Editor", icon: FolderOpen, color: "from-violet-500 to-indigo-600", desc: "Open Project from Folder", badge: "NEW", group: "code" },
    { id: "cps-test", title: "Click Speed (CPS)", icon: MousePointer2, color: "from-yellow-400 to-orange-600", desc: "Test Clicks Per Second", badge: "NEW", group: "performance" },
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

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
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
                        <span className="text-[10px] text-zinc-400 block -mt-1 font-medium">Professional Document Editor</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
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
                        Word P. OS 2.0 Live
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tight mb-6" suppressHydrationWarning>
                        Productivity Without
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 ml-3">Boundaries.</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                        Manage all your professional documents, designs, and templates from a single super app. Accelerate with tranquility.
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
                            placeholder="Search files, tools, or templates..."
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
                            <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">Studios</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium -mt-1">Browse all tools by their category.</p>
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
                                        { id: "converters", title: "Converters", subtitle: "10+ converters between PDF, Word, PPTX and Image formats.", icon: RefreshCw, bg: "from-emerald-400 to-teal-600", borderHover: "hover:border-emerald-500/50", glow: "group-hover:shadow-emerald-500/20" },
                                        { id: "pdf", title: "PDF Studio", subtitle: "Merge, split, edit and manage PDF pages with full control.", icon: FileSearch, bg: "from-rose-400 to-red-600", borderHover: "hover:border-rose-500/50", glow: "group-hover:shadow-rose-500/20" },
                                        { id: "code", title: "Code Editor", subtitle: "Write, edit and run HTML, CSS and JavaScript with live preview.", icon: Code, bg: "from-violet-500 to-indigo-600", borderHover: "hover:border-violet-500/50", glow: "group-hover:shadow-violet-500/20" },
                                        { id: "photo", title: "Photo Studio", subtitle: "Canva-style design tools and background removal utilities.", icon: Image, bg: "from-fuchsia-400 to-purple-600", borderHover: "hover:border-fuchsia-500/50", glow: "group-hover:shadow-fuchsia-500/20" },
                                        { id: "word", title: "Templates & Scenes", subtitle: "Start instantly with over 50 ready-made professional templates.", icon: LayoutTemplate, bg: "from-blue-400 to-indigo-600", borderHover: "hover:border-blue-500/50", glow: "group-hover:shadow-blue-500/20" },
                                        { id: "office", title: "Office Tools", subtitle: "Advanced Excel sheet editor and intelligent assistants.", icon: Type, bg: "from-indigo-400 to-violet-600", borderHover: "hover:border-indigo-500/50", glow: "group-hover:shadow-indigo-500/20" },
                                        { id: "performance", title: "Speed & Performance", subtitle: "CPS test and click speed measurement tools.", icon: Zap, bg: "from-yellow-400 to-orange-600", borderHover: "hover:border-yellow-500/50", glow: "group-hover:shadow-yellow-500/20" },
                                        { id: "powerpoint", title: "Presentation (PPTX)", subtitle: "Create professional slide presentations and scene designs.", icon: PieChart, bg: "from-amber-400 to-orange-600", borderHover: "hover:border-amber-500/50", glow: "group-hover:shadow-amber-500/20" }
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
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                        <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">
                                            Start with Templates
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
                                            All
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
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">
                                        {activeToolGroup === "converters" ? "Converters" : activeToolGroup === "pdf" ? "PDF Studio" : activeToolGroup === "photo" ? "Photo Studio" : activeToolGroup === "office" ? "Office Tools" : activeToolGroup === "code" ? "Code Editor" : activeToolGroup === "performance" ? "Speed & Performance" : "PowerPoint Studio"}
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
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Recent Documents</h2>
                            {recentDocs.length > 0 && (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    {recentDocs.length} files
                                </span>
                            )}
                        </div>
                        {recentDocs.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={12} />
                                Clear All
                            </button>
                        )}
                    </div>

                    {recentDocs.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-zinc-300 dark:border-slate-600 p-10 flex flex-col items-center justify-center text-zinc-400">
                            <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                <FolderOpen size={28} className="text-zinc-300" />
                            </div>
                            <p className="text-base font-medium">No recent documents found</p>
                            <p className="text-sm">Choose a template above to get started.</p>
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
                                                title="Delete document"
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
                                            <span className="font-medium">{doc.wordCount} words</span>
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

                <Calculator />
            </main>

            <footer className="p-6 text-center text-zinc-400 dark:text-slate-500 text-sm border-t border-zinc-200/50 dark:border-slate-700/50">
                &copy; 2026 Word P. All rights reserved.
            </footer>
        </div>
    );
}
