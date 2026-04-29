"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, Plus, Search, PieChart, Library, ArrowRightLeft, FileSearch, MousePointer2, 
    Image, FileImage, Clock, Trash2, ExternalLink, FolderOpen, RefreshCw, Type, Combine, 
    Heart, LayoutTemplate, ArrowLeft, Code, FileCode, Braces, FileCode2, Zap, Video, 
    Music, MonitorPlay, Mic, Headphones, Film, TerminalSquare, SearchCode, Network, 
    KeyRound, Fingerprint, TextCursorInput, FileDigit, AlignLeft, Table, TableProperties, 
    Tags, MonitorSmartphone, Clock4, Contrast, Unlock, Link, Code2, Archive, Hash, 
    Calculator as CalculatorIcon, Briefcase, Coffee, TrendingUp, LineChart, Wallet, 
    PiggyBank, TrendingDown, Home, Coins, Receipt, CreditCard, BarChart3, Landmark, 
    Scale, Compass, Target, Percent, Car, Bitcoin, Megaphone, Shield, Eye, PenTool, 
    Monitor, Keyboard, LayoutGrid, Languages, Sparkles, Wand2, Globe, ChevronDown, Gamepad2
} from "lucide-react";

import { cn } from "./editor/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../data/templates";
import { getRecentDocuments, deleteRecentDocument, clearRecentDocuments, type RecentDocument } from "../utils/recentDocuments";

const ALL_TOOLS = [
    { id: "pptx-editor", title: "PowerPoint Editor", icon: PieChart, color: "from-red-500 to-orange-500", desc: "Create & Edit Presentations", badge: "NEW", group: "powerpoint" },
    { id: "pptx-open", title: "Open PPTX File", icon: Library, color: "from-amber-500 to-orange-500", desc: "Edit Existing Presentation", group: "powerpoint" },
    { id: "pdf-to-pptx", title: "PDF to PPTX", icon: PieChart, color: "from-orange-500 to-orange-600", desc: "Convert PDF to Slides", group: "converters" },
    { id: "pptx-to-pdf", title: "PPTX to PDF", icon: Library, color: "from-blue-500 to-blue-600", desc: "Make Presentation PDF", group: "converters" },
    { id: "pptx-to-png", title: "PPTX to PNG", icon: Image, color: "from-teal-500 to-emerald-500", desc: "Convert Slides to Images", group: "converters" },
    { id: "docx-to-pptx", title: "Word to PPTX", icon: FileText, color: "from-sky-500 to-blue-600", desc: "Create Slides from Document", group: "converters" },
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
    { id: "birthday-message", title: "Birthday Message", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Generate Long Messages", badge: "NEW", group: "office" },
    { id: "code-editor-html", title: "HTML Editor", icon: FileCode, color: "from-orange-500 to-red-500", desc: "Write & Preview HTML", badge: "NEW", group: "code" },
    { id: "code-editor-css", title: "CSS Editor", icon: Braces, color: "from-blue-500 to-cyan-500", desc: "Edit CSS Styles", badge: "NEW", group: "code" },
    { id: "code-editor-js", title: "JavaScript Editor", icon: FileCode2, color: "from-yellow-400 to-orange-500", desc: "Write & Run JS Code", badge: "NEW", group: "code" },
    { id: "folder-code-editor", title: "Real Project Editor", icon: FolderOpen, color: "from-violet-500 to-indigo-600", desc: "Open Project from Folder", badge: "NEW", group: "code" },
    { id: "cps-test", title: "Click Speed (CPS)", icon: MousePointer2, color: "from-yellow-400 to-orange-600", desc: "Test Clicks Per Second", badge: "NEW", group: "performance" },
    { id: "video-converter", title: "Video Converter", icon: RefreshCw, color: "from-pink-500 to-rose-500", desc: "Convert various video formats", badge: "POPULAR", group: "video-audio" },
    { id: "audio-converter", title: "Audio Converter", icon: RefreshCw, color: "from-fuchsia-500 to-purple-500", desc: "Convert various audio formats", badge: "POPULAR", group: "video-audio" },
    { id: "video-to-mp3", title: "Video to MP3", icon: Headphones, color: "from-indigo-500 to-blue-500", desc: "Extract high quality audio", badge: "POPULAR", group: "video-audio" },
    { id: "video-compressor", title: "Video Compressor", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "Reduce video size", badge: "POPULAR", group: "video-audio" },
    { id: "trim-video", title: "Trim Video", icon: Film, color: "from-violet-500 to-purple-500", desc: "Cut or trim video clips", badge: "NEW", group: "video-audio" },
    { id: "video-to-gif", title: "Video to GIF", icon: Image, color: "from-rose-500 to-red-500", desc: "Create animated GIFs", badge: "NEW", group: "video-audio" },
    { id: "pdf-compress", title: "Compress PDF", icon: FileSearch, color: "from-blue-500 to-cyan-500", desc: "Reduce PDF file size", badge: "POPULAR", group: "pdf" },
    { id: "pdf-merge", title: "Merge PDF", icon: Combine, color: "from-cyan-500 to-teal-500", desc: "Combine multiple PDF files", badge: "POPULAR", group: "pdf" },
    { id: "pdf-split", title: "Split PDF", icon: FileCode2, color: "from-teal-500 to-emerald-500", desc: "Split a PDF into files", group: "pdf" },
    { id: "pdf-to-word", title: "PDF to Word", icon: FileText, color: "from-emerald-500 to-green-500", desc: "Convert PDF to Word", badge: "POPULAR", group: "pdf" },
    { id: "pdf-to-image", title: "PDF to Image", icon: Image, color: "from-indigo-500 to-violet-500", desc: "Convert PDF pages to images", group: "pdf" },
    { id: "image-to-pdf", title: "Image to PDF", icon: FileImage, color: "from-violet-500 to-purple-500", desc: "Create PDF from images", group: "pdf" },
    { id: "pdf-unlock", title: "Unlock PDF", icon: Unlock, color: "from-pink-500 to-rose-500", desc: "Remove PDF password", group: "pdf" },
    { id: "pdf-to-excel", title: "PDF to Excel", icon: Table, color: "from-yellow-500 to-lime-500", desc: "Extract Excel from PDF", badge: "POPULAR", group: "pdf" },
    { id: "pdf-ocr", title: "PDF OCR", icon: SearchCode, color: "from-indigo-600 to-violet-600", desc: "Read scanned text", badge: "POPULAR", group: "pdf" },
    { id: "word-to-pdf", title: "Word to PDF", icon: FileText, color: "from-blue-400 to-cyan-500", desc: "Convert Word files to PDF.", group: "pdf" },
    { id: "image-compressor", title: "Image Compressor", icon: Image, color: "from-blue-500 to-indigo-500", desc: "Batch compress photos", badge: "POPULAR", group: "photo" },
    { id: "image-resizer", title: "Image Resizer", icon: Image, color: "from-indigo-500 to-purple-500", desc: "Resize images for platforms", badge: "POPULAR", group: "photo" },
    { id: "heic-to-jpg", title: "HEIC to JPG", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "Convert Apple HEIC to JPG", badge: "NEW", group: "photo" },
    { id: "png-to-jpg", title: "PNG to JPG", icon: RefreshCw, color: "from-violet-500 to-purple-500", desc: "Convert PNG to JPG", badge: "POPULAR", group: "photo" },
    { id: "brightness-contrast", title: "Brightness & Contrast", icon: Image, color: "from-yellow-300 to-orange-400", desc: "Adjust photo light", badge: "POPULAR", group: "photo" },
    { id: "hue-saturation", title: "Hue & Saturation", icon: Image, color: "from-fuchsia-500 to-pink-500", desc: "Color adjustments", badge: "POPULAR", group: "photo" },
    { id: "word-counter", title: "Word Counter", icon: Type, color: "from-blue-500 to-cyan-500", desc: "Count words & chars.", badge: "POPULAR", group: "text-tools" },
    { id: "fancy-text", title: "Fancy Text", icon: Type, color: "from-pink-500 to-rose-500", desc: "Stylish text generation.", badge: "POPULAR", group: "text-tools" },
    { id: "text-to-speech", title: "Text to Speech", icon: Mic, color: "from-fuchsia-600 to-purple-600", desc: "Read text aloud.", badge: "POPULAR", group: "text-tools" },
    { id: "text-box", title: "Text Box Studio", icon: Archive, color: "from-amber-600 to-orange-700", desc: "300+ text tools in one box.", badge: "MEGA", group: "text-tools" },
    { id: "translator", title: "AI Translator", icon: Languages, color: "from-blue-600 to-indigo-600", desc: "Translate 100+ languages.", badge: "NEW", group: "text-tools" },
    { id: "biz-compound", title: "Compound Interest", icon: CalculatorIcon, color: "from-emerald-500 to-teal-500", desc: "Calculate compound growth", badge: "POPULAR", group: "business" },
    { id: "biz-loan", title: "Loan Calculator", icon: Briefcase, color: "from-blue-500 to-indigo-500", desc: "Monthly payouts calculator", badge: "POPULAR", group: "business" },
    { id: "biz-mortgage", title: "Mortgage Calc", icon: Home, color: "from-teal-500 to-emerald-600", desc: "Home loan calculations", badge: "POPULAR", group: "business" },
    { id: "json-formatter", title: "JSON Formatter", icon: Code2, color: "from-emerald-500 to-teal-500", desc: "Clean and format JSON", badge: "POPULAR", group: "dev-tools" },
    { id: "uuid-generator", title: "UUID Generator", icon: Fingerprint, color: "from-indigo-500 to-violet-500", desc: "Generate secure random IDs", badge: "POPULAR", group: "dev-tools" },
    { id: "chart-studio", title: "Chart Studio", icon: BarChart3, color: "from-blue-600 to-cyan-600", desc: "Professional Data Viz", badge: "NEW", group: "office" },
    { id: "pdf-studio", title: "PDF Toolbox", icon: FileSearch, color: "from-rose-500 to-red-600", desc: "All PDF utilities", badge: "MEGA", group: "pdf" },
    { id: "image-studio", title: "Image Studio", icon: Image, color: "from-fuchsia-500 to-purple-600", desc: "Advanced Image FX", badge: "NEW", group: "photo" },
    { id: "dev-studio", title: "Dev Studio", icon: TerminalSquare, color: "from-zinc-700 to-zinc-900", desc: "Developer Utilities", badge: "NEW", group: "code" },
    { id: "media-studio", title: "Media Studio", icon: Video, color: "from-pink-500 to-rose-600", desc: "Video & Audio Tools", badge: "MEGA", group: "video-audio" },
    { id: "business-studio", title: "Biz Studio", icon: Landmark, color: "from-amber-600 to-orange-700", desc: "Financial Intelligence", badge: "NEW", group: "business" },
    { id: "text-studio", title: "Text Studio Pro", icon: Type, color: "from-indigo-600 to-purple-600", desc: "AI Writing Hub", badge: "NEW", group: "text-tools" },
    { id: "players-studio", title: "Players Studio", icon: Gamepad2, color: "from-purple-700 to-violet-900", desc: "Instant Replay Recorder", badge: "NEW", group: "players" },
];

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
    activeGroup?: string | null;
    onGroupSelect?: (group: string | null) => void;
}

export default function LandingPage({ onSelectTemplate, onOpenRecentDocument, activeGroup, onGroupSelect }: LandingPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
    const [localActiveGroup, setLocalActiveGroup] = useState<string | null>(null);
    const [showAllTools, setShowAllTools] = useState(false);

    const currentGroup = activeGroup !== undefined ? activeGroup : localActiveGroup;
    
    const handleGroupClick = (id: string) => {
        const newGroup = currentGroup === id ? null : id;
        if (onGroupSelect) onGroupSelect(newGroup);
        else setLocalActiveGroup(newGroup);
    };

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

    const filteredTools = useMemo(() => {
        const base = ALL_TOOLS.filter(t => {
            const matchesSearch = searchQuery === "" ||
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.desc.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGroup = !currentGroup || t.group === currentGroup;
            return matchesSearch && matchesGroup;
        });

        if (!currentGroup && searchQuery === "" && !showAllTools) {
            return base.slice(0, 18); 
        }
        return base;
    }, [searchQuery, currentGroup, showAllTools]);

    const categories = [
        { id: "pdf", title: "PDF Studio", icon: FileSearch, color: "from-rose-500 to-red-600", size: "lg" },
        { id: "office", title: "Office Tools", icon: FileText, color: "from-blue-500 to-indigo-600", size: "md" },
        { id: "photo", title: "Design Studio", icon: Image, color: "from-fuchsia-500 to-purple-600", size: "md" },
        { id: "code", title: "Code Lab", icon: Code, color: "from-violet-500 to-indigo-700", size: "sm" },
        { id: "converters", title: "Converters", icon: RefreshCw, color: "from-emerald-500 to-teal-700", size: "md" },
        { id: "business", title: "Business", icon: LineChart, color: "from-amber-500 to-orange-600", size: "sm" }
    ];

    return (
        <div className="min-h-screen mesh-gradient flex flex-col relative overflow-x-hidden">
            {/* Darker Overlay */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/90 pointer-events-none" />
            
            {/* Header */}
            <header className="p-4 flex items-center justify-between sticky top-0 z-[60] bg-white/90 dark:bg-slate-950/90 border-b border-zinc-200 dark:border-slate-800 rounded-b-[1.5rem] mx-4 mt-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white" size={20} fill="currentColor" />
                    </div>
                    <span className="text-xl font-black text-zinc-900 dark:text-white">Macrotar</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg">
                        New Doc
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 relative z-10 pb-32">
                {/* Hero */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none">
                        Ultimate <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Workspace.</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">All tools, simplified.</p>
                </div>

                {/* Search */}
                <div className="mb-12 max-w-2xl mx-auto relative group">
                    <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-zinc-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        <div className="pl-6 text-zinc-400">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-6 py-5 text-lg font-bold bg-transparent text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleGroupClick(cat.id)}
                            className={cn(
                                "relative overflow-hidden rounded-[1.5rem] p-4 bg-white/80 dark:bg-slate-900/80 border border-zinc-200 dark:border-slate-800 transition-all text-left group",
                                currentGroup === cat.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/40"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br mb-3", cat.color)}>
                                <cat.icon size={20} />
                            </div>
                            <h3 className="text-sm font-black text-zinc-800 dark:text-white">{cat.title}</h3>
                        </button>
                    ))}
                </div>

                {/* Tools Grid */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-zinc-800 dark:text-white flex items-center gap-2">
                            <LayoutGrid size={20} className="text-blue-600" />
                            {currentGroup ? "Filtered Results" : "Featured Tools"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => onSelectTemplate(tool.id, (tool as any).content || "")}
                                className="group relative bg-white/90 dark:bg-slate-900/90 p-4 rounded-3xl border border-zinc-200 dark:border-slate-800 hover:border-blue-500/50 transition-all text-center flex flex-col items-center gap-3"
                            >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br", tool.color)}>
                                    <tool.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[11px] text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 transition-colors truncate w-full">
                                        {tool.title}
                                    </h3>
                                </div>
                                {tool.badge && (
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-blue-600/90 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{tool.badge}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {!currentGroup && !showAllTools && searchQuery === "" && (
                        <div className="flex justify-center mt-8">
                            <button 
                                onClick={() => setShowAllTools(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-slate-800/80 rounded-2xl text-xs font-black text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform shadow-lg"
                            >
                                Show All 200+ Tools
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    )}
                </section>

                {/* Players Studio Banner */}
                <section className="mt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-900/80 to-violet-900/80 border border-purple-500/20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-purple-900/30"
                    >
                        {/* BG glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-violet-600/5 pointer-events-none" />
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-purple-600/40">
                            <Gamepad2 size={44} className="text-white" />
                        </div>

                        <div className="relative z-10 flex-1 text-center md:text-left">
                            <span className="inline-block bg-purple-500/30 text-purple-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">⚡ INSTANT REPLAY</span>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Players Studio</h2>
                            <p className="text-purple-200/70 text-sm font-medium max-w-md">
                                Select your game, start recording your screen. Press <span className="text-white font-black">Save Clip</span> anytime to capture the last <span className="text-purple-300 font-black">60 seconds</span> — like NVIDIA ShadowPlay, in your browser.
                            </p>
                        </div>

                        <div className="relative z-10 flex-shrink-0">
                            <button
                                onClick={() => onSelectTemplate("players-studio", "")}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-purple-900 font-black rounded-2xl shadow-2xl hover:scale-105 transition-all text-sm"
                            >
                                <Gamepad2 size={18} />
                                Open Players Studio
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Workspace */}
                {recentDocs.length > 0 && (
                    <section className="mt-20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-zinc-800 dark:text-white flex items-center gap-2">
                                <Clock size={20} className="text-amber-500" />
                                Workspace
                            </h2>
                            <button onClick={handleClearAll} className="text-[10px] font-black text-red-500 uppercase">Purge</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => handleOpenDoc(doc)}
                                    className="group relative bg-white/90 dark:bg-slate-900/60 rounded-2xl p-4 border border-zinc-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                                            <FileText size={16} />
                                        </div>
                                        <h3 className="text-sm font-black text-zinc-800 dark:text-white truncate">{doc.title}</h3>
                                    </div>
                                    <p className="text-zinc-500 text-[10px] line-clamp-2 mb-3">{doc.preview}</p>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                                        <span>{formatDate(doc.lastModified)}</span>
                                        <Trash2 size={12} className="opacity-0 group-hover:opacity-100 text-red-500" onClick={(e) => handleDeleteDoc(doc.id, e)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="p-8 text-center text-zinc-500 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                © 2026 Macrotar OS WorldWide
            </footer>
        </div>
    );
}
