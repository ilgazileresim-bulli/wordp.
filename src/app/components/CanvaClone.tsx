"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Download, Type, Image as ImageIcon, Square, Circle, Triangle, 
    Trash2, SlidersHorizontal, MousePointer2, MoveUp, MoveDown, LayoutTemplate,
    Instagram, FileText, MonitorPlay, Smartphone, CreditCard, Plus, Search
} from "lucide-react";
import { cn } from "./editor/utils";

type ElementType = "text" | "shape" | "image" | "sticker";

interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    rotation?: number;
}

interface TextElement extends BaseElement {
    type: "text";
    content: string;
    fontSize: number;
    color: string;
    fontFamily: string;
    fontWeight: string;
    fontStyle?: "normal" | "italic";
    textAlign: "left" | "center" | "right";
    curve?: number;
}

interface ShapeElement extends BaseElement {
    type: "shape";
    shapeType: "rectangle" | "circle" | "triangle";
    backgroundColor: string;
}

interface ImageElement extends BaseElement {
    type: "image";
    src: string;
}

interface StickerElement extends BaseElement {
    type: "sticker";
    shapeType: "rectangle" | "circle";
    backgroundColor: string;
    content: string;
    textColor: string;
    fontSize: number;
    fontStyle?: "normal" | "italic";
}

type CanvasElement = TextElement | ShapeElement | ImageElement | StickerElement;

// Curved text primitive
const CurvedText = ({ text, curve, fontSize }: { text: string, curve: number, fontSize: number }) => {
    if (!curve || curve === 0) return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'inline-block' }}>{text}</span>;
    
    const absCurve = Math.abs(curve);
    const radius = Math.max(fontSize * 1.5, 5000 / (absCurve * 1.5));
    const dir = curve > 0 ? 1 : -1;
    const chars = text.split("");
    const charWidth = fontSize * 0.45; 
    const anglePerChar = (charWidth / radius) * (180 / Math.PI);
    const totalAngle = anglePerChar * text.length;

    return (
        <div style={{ position: 'relative', height: `${fontSize}px`, width: '100%', display: 'flex', justifyContent: 'center' }}>
            {chars.map((c, i) => {
                const angle = (-(totalAngle / 2) + (i * anglePerChar)) * dir;
                return (
                    <span
                        key={i}
                        style={{
                            position: 'absolute',
                            top: dir === 1 ? '0' : 'auto',
                            bottom: dir === -1 ? '0' : 'auto',
                            height: `${radius}px`,
                            transformOrigin: dir === 1 ? 'bottom center' : 'top center',
                            transform: `rotate(${angle}deg)`,
                            display: 'flex',
                            alignItems: dir === 1 ? 'flex-start' : 'flex-end',
                            justifyContent: 'center',
                            width: `${charWidth}px`
                        }}
                    >
                        {c === " " ? "\u00A0" : c}
                    </span>
                );
            })}
        </div>
    );
};

type ViewState = "dashboard" | "editor";

const TEMPLATES = [
    { id: "instagram", name: "Instagram Post", width: 1080, height: 1080, icon: Instagram, color: "from-pink-500 to-rose-500" },
    { id: "a4", name: "A4 Document", width: 794, height: 1123, icon: FileText, color: "from-blue-500 to-indigo-600" },
    { id: "presentation", name: "Presentation (16:9)", width: 1920, height: 1080, icon: MonitorPlay, color: "from-amber-500 to-orange-500" },
    { id: "story", name: "Instagram Story", width: 1080, height: 1920, icon: Smartphone, color: "from-fuchsia-500 to-purple-600" },
    { id: "card", name: "Business Card", width: 1050, height: 600, icon: CreditCard, color: "from-emerald-500 to-teal-600" },
];

export default function CanvaClone({ onBack }: { onBack: () => void }) {
    const [currentView, setCurrentView] = useState<ViewState>("dashboard");
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
    
    // Custom size inputs
    const [customWidth, setCustomWidth] = useState(800);
    const [customHeight, setCustomHeight] = useState(600);

    const canvasRef = useRef<HTMLDivElement>(null);
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [canvasBg, setCanvasBg] = useState<string>("#ffffff");
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchImages, setSearchImages] = useState<{ url: string; thumb: string }[]>([]);
    const [isSearchingImage, setIsSearchingImage] = useState(false);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const getMaxZIndex = () => {
        return elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    };

    // Smart sticker suggestions based on Turkish/English keywords
    const getStickerSuggestions = (q: string) => {
        const low = q.toLowerCase();
        const s: { text: string; bg: string; shape: "rectangle" | "circle"; color: string }[] = [];
        if (low.includes("indirim") || low.includes("sale") || low.includes("discount") || low.includes("off")) {
            s.push(
                { text: "%50 İndirim", bg: "#ef4444", shape: "circle", color: "#fff" },
                { text: "%30 OFF", bg: "#dc2626", shape: "circle", color: "#fff" },
                { text: "MEGA İNDİRİM", bg: "#f59e0b", shape: "rectangle", color: "#000" },
                { text: "Flash Satış!", bg: "#f97316", shape: "rectangle", color: "#fff" },
            );
        }
        if (low.includes("yeni") || low.includes("new")) {
            s.push(
                { text: "YENİ ÜRÜN", bg: "#3b82f6", shape: "rectangle", color: "#fff" },
                { text: "NEW", bg: "#1d4ed8", shape: "circle", color: "#fff" },
                { text: "🆕 Yeni!", bg: "#6366f1", shape: "rectangle", color: "#fff" },
            );
        }
        if (low.includes("ücretsiz") || low.includes("free") || low.includes("bedava") || low.includes("gratis")) {
            s.push(
                { text: "ÜCRETSİZ", bg: "#10b981", shape: "rectangle", color: "#fff" },
                { text: "FREE", bg: "#059669", shape: "circle", color: "#fff" },
            );
        }
        if (low.includes("acil") || low.includes("urgent") || low.includes("son") || low.includes("limited") || low.includes("sınır")) {
            s.push(
                { text: "🔥 ACİL", bg: "#ef4444", shape: "rectangle", color: "#fff" },
                { text: "Son Fırsat!", bg: "#f97316", shape: "rectangle", color: "#fff" },
                { text: "LİMİTED", bg: "#7c3aed", shape: "circle", color: "#fff" },
            );
        }
        if (low.includes("kampanya") || low.includes("fırsat") || low.includes("promo")) {
            s.push(
                { text: "KAMPANYA", bg: "#ec4899", shape: "rectangle", color: "#fff" },
                { text: "Özel Fiyat", bg: "#a855f7", shape: "rectangle", color: "#fff" },
            );
        }
        // Always add generic ones for any query
        s.push(
            { text: q.toUpperCase().slice(0, 20), bg: "#6366f1", shape: "rectangle", color: "#fff" },
            { text: q.slice(0, 15), bg: "#0ea5e9", shape: "circle", color: "#fff" },
        );
        return s;
    };

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            const q = searchQuery.trim();
            if (q.length > 1) {
                setIsSearchingImage(true);
                try {
                    // LoremFlickr: free, no API key needed, returns topically relevant photos
                    const count = 8;
                    const seed = Date.now();
                    const results = Array.from({ length: count }, (_, i) => {
                        // Use different random seeds to get varied results
                        const w = 300, h = 300;
                        const url = `https://loremflickr.com/${w}/${h}/${encodeURIComponent(q)}?lock=${seed + i}`;
                        return { url, thumb: url };
                    });
                    setSearchImages(results);
                } catch (error) {
                    console.error("Search error", error);
                    setSearchImages([]);
                }
                setIsSearchingImage(false);
            } else {
                setSearchImages([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreateDesign = (width: number, height: number) => {
        setCanvasDimensions({ width, height });
        setElements([]); // Clear any previous designs if re-entering
        setCanvasBg("#ffffff");
        setCurrentView("editor");
    };

    const addText = (textType: "h1" | "h2" | "p") => {
        const config = {
                    h1: { fontSize: 48, fontWeight: "bold", content: "Big Heading" },
            h2: { fontSize: 32, fontWeight: "bold", content: "Subheading" },
            p: { fontSize: 18, fontWeight: "normal", content: "Body text here..." }
        };
        const newEl: TextElement = {
            id: generateId(),
            type: "text",
            x: canvasDimensions.width / 2 - 150,
            y: canvasDimensions.height / 2 - 50,
            width: 300,
            height: 100,
            zIndex: getMaxZIndex() + 1,
            content: config[textType].content,
            fontSize: config[textType].fontSize,
            fontWeight: config[textType].fontWeight,
            fontStyle: "normal",
            color: "#000000",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const addShape = (shapeType: "rectangle" | "circle" | "triangle") => {
        const newEl: ShapeElement = {
            id: generateId(),
            type: "shape",
            x: canvasDimensions.width / 2 - 75,
            y: canvasDimensions.height / 2 - 75,
            width: 150,
            height: 150,
            zIndex: getMaxZIndex() + 1,
            shapeType: shapeType,
            backgroundColor: "#3b82f6",
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const addSticker = (content: string, backgroundColor: string, shapeType: "rectangle" | "circle", textColor = "#ffffff") => {
        const width = shapeType === 'circle' ? 200 : 250;
        const height = shapeType === 'circle' ? 200 : 80;
        const newEl: StickerElement = {
            id: generateId(),
            type: "sticker",
            x: canvasDimensions.width / 2 - width / 2,
            y: canvasDimensions.height / 2 - height / 2,
            width,
            height,
            zIndex: getMaxZIndex() + 1,
            shapeType, 
            content, 
            backgroundColor, 
            textColor, 
            fontSize: 24,
            fontStyle: "normal"
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const addSearchedImage = (src: string) => {
        const img = new Image();
        img.onload = () => {
            const width = 300;
            const height = 300;
            const newEl: ImageElement = {
                id: generateId(),
                type: "image",
                x: canvasDimensions.width / 2 - width / 2,
                y: canvasDimensions.height / 2 - height / 2,
                width,
                height,
                zIndex: getMaxZIndex() + 1,
                src,
            };
            setElements(prev => [...prev, newEl]);
            setSelectedId(newEl.id);
        }
        img.src = src;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const src = event.target?.result as string;
            
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                const maxDim = 400;
                
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = (h / w) * maxDim;
                        w = maxDim;
                    } else {
                        w = (w / h) * maxDim;
                        h = maxDim;
                    }
                }

                const newEl: ImageElement = {
                    id: generateId(),
                    type: "image",
                    x: canvasDimensions.width / 2 - w / 2,
                    y: canvasDimensions.height / 2 - h / 2,
                    width: w,
                    height: h,
                    zIndex: getMaxZIndex() + 1,
                    src: src,
                };
                setElements(prev => [...prev, newEl]);
                setSelectedId(newEl.id);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    };

    const updateElement = (id: string, partial: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...partial } : el) as CanvasElement[]);
    };

    const deleteElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const bringToFront = (id: string) => {
        updateElement(id, { zIndex: getMaxZIndex() + 1 });
    };

    const sendToBack = (id: string) => {
        const minZ = Math.min(...elements.map(e => e.zIndex));
        updateElement(id, { zIndex: minZ - 1 });
    };

    const exportToPng = async () => {
        if (!canvasRef.current) return;
        setIsExporting(true);
        setSelectedId(null); 
        
        await new Promise(r => setTimeout(r, 100));

        try {
            const htmlToImage = await import("html-to-image");
            const dataUrl = await htmlToImage.toPng(canvasRef.current, {
                pixelRatio: 2,
                backgroundColor: canvasBg,
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                style: { transform: "none" }
            });

            const link = document.createElement("a");
            link.download = `design_${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Export error:", error);
            alert("An error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    // ================= DASHBOARD RENDER =================
    if (currentView === "dashboard") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#0d0d1a] dark:to-[#0a0a1a] flex flex-col">
                <header className="px-8 py-6 flex items-center justify-between border-b border-zinc-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-zinc-200 dark:hover:bg-slate-800 rounded-full text-zinc-600 dark:text-zinc-300 transition-colors"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
                                <LayoutTemplate size={18} />
                            </div>
                            <span className="font-bold text-xl">Macrotar Design</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-4">
                            Bugün ne tasarlayacaksın?
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                            Önceden hazırlanmış boyutları seçin veya kendi özel boyutunuzu girerek yaratıcılığınızı konuşturun.
                        </p>
                    </motion.div>

                    {/* Pre-defined sizes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                        {TEMPLATES.map((tmpl, i) => (
                            <motion.button
                                key={tmpl.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleCreateDesign(tmpl.width, tmpl.height)}
                                className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xl transition-all text-center flex flex-col items-center gap-4"
                            >
                                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br group-hover:scale-110 transition-transform", tmpl.color)}>
                                    <tmpl.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm mb-1">{tmpl.name}</h3>
                                    <p className="text-xs text-zinc-400 font-medium">{tmpl.width} × {tmpl.height} px</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Custom Size Form */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-slate-700 shadow-sm max-w-2xl mx-auto flex items-center flex-col md:flex-row gap-6"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1">Özel Boyut Tasarım</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Genişlik ve yükseklik piksel (px) değerlerini belirleyin.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <label className="text-xs text-zinc-400 font-bold mb-1 ml-1 uppercase">Genişlik</label>
                                <input 
                                    type="number" 
                                    min={100}
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                                    className="w-24 px-3 py-2 border border-zinc-200 dark:border-slate-600 rounded-lg bg-zinc-50 dark:bg-slate-900 text-zinc-800 dark:text-zinc-100 font-medium"
                                />
                            </div>
                            <span className="text-zinc-400 font-bold mt-5">×</span>
                            <div className="flex flex-col">
                                <label className="text-xs text-zinc-400 font-bold mb-1 ml-1 uppercase">Height</label>
                                <input 
                                    type="number" 
                                    min={100}
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                                    className="w-24 px-3 py-2 border border-zinc-200 dark:border-slate-600 rounded-lg bg-zinc-50 dark:bg-slate-900 text-zinc-800 dark:text-zinc-100 font-medium"
                                />
                            </div>
                            <button 
                                onClick={() => handleCreateDesign(customWidth, customHeight)}
                                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-bold transition-all shadow-md shadow-blue-200/50"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    // ================= EDITOR RENDER =================
    return (
        <div className="flex flex-col h-screen bg-zinc-100 dark:bg-[#05050f] border-none m-0 p-0 overflow-hidden">
            {/* Topbar */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentView("dashboard")}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-2"
                        title="Back to Home"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-semibold max-sm:hidden">Home</span>
                    </button>
                    <div className="w-px h-6 bg-zinc-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <LayoutTemplate size={16} className="text-fuchsia-500" />
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Macrotar Design - {canvasDimensions.width}x{canvasDimensions.height}px
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToPng}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
                    >
                        <Download size={16} />
                        {isExporting ? "Exporting..." : "Download"}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Tools */}
                <aside className="w-20 md:w-64 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-800 flex flex-col items-center md:items-stretch shrink-0 z-10 overflow-y-auto">
                    <div className="p-4 space-y-6">

                        {/* Search Group */}
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:block mb-2">🔍 Fotoğraf & Etiket Ara</span>
                            <div className="relative mb-2 hidden md:block">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-400 transition-colors"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                    </button>
                                )}
                                <input 
                                    type="text" 
                                    placeholder="cat, flower, discount..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-7 py-2 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <AnimatePresence>
                            {searchQuery.length > 1 && (
                                <motion.div 
                                    key={searchQuery}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-0.5 hidden md:flex custom-scrollbar"
                                >
                                    {/* Smart sticker suggestions */}
                                    {(() => {
                                        const stickers = getStickerSuggestions(searchQuery);
                                        return stickers.length > 0 ? (
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tag Suggestions</p>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {stickers.map((s, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => addSticker(s.text, s.bg, s.shape, s.color)}
                                                            className="px-2 py-2 rounded-xl text-[11px] font-bold shadow hover:scale-105 active:scale-95 transition-transform text-center leading-tight truncate"
                                                            style={{ backgroundColor: s.bg, color: s.color }}
                                                        >
                                                            {s.text}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Image results */}
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Photos</p>
                                        {isSearchingImage ? (
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <div key={i} className="aspect-square rounded-xl bg-zinc-200 dark:bg-slate-700 animate-pulse" />
                                                ))}
                                            </div>
                                        ) : searchImages.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {searchImages.map((img, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => addSearchedImage(img.url)} 
                                                        className="rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all aspect-square relative group shadow-sm bg-zinc-100 dark:bg-slate-800"
                                                    >
                                                        <img 
                                                            src={img.thumb} 
                                                            alt={`${searchQuery} ${idx + 1}`} 
                                                            className="w-full h-full object-cover" 
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                const btn = (e.target as HTMLImageElement).closest('button');
                                                                if (btn) btn.style.display = 'none';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-[9px] font-bold bg-blue-500 px-2 py-0.5 rounded-full">+ Add</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-[10px] text-zinc-400 py-3 bg-zinc-50 dark:bg-slate-800/50 rounded-xl">
                                                📷 No photos found
                                            </div>
                                        )}
                                    </div>

                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>

                        <div className="w-full h-px bg-zinc-200/50 dark:bg-slate-800 hidden md:block" />
                        
                        {/* Text Group */}
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:block mb-3">Add Text</span>
                            <div className="flex flex-col gap-2 relative">
                                <button onClick={() => addText("h1")} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-slate-700 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Type size={16} />
                                    </div>
                                    <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100 hidden md:block">Big Heading</span>
                                </button>
                                <button onClick={() => addText("h2")} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-slate-700 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Type size={14} />
                                    </div>
                                    <span className="font-bold text-base text-zinc-700 dark:text-zinc-200 hidden md:block">Subheading</span>
                                </button>
                                <button onClick={() => addText("p")} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-slate-700 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Type size={12} />
                                    </div>
                                    <span className="font-medium text-sm text-zinc-600 dark:text-zinc-300 hidden md:block">Body Text</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200/50 dark:bg-slate-800" />
                        
                        {/* Shape Group */}
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:block mb-3">Shapes</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <button onClick={() => addShape("rectangle")} className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-zinc-100 dark:border-slate-800">
                                    <Square size={24} className="text-zinc-600 dark:text-zinc-400" />
                                    <span className="text-[10px] font-bold uppercase hidden md:block text-zinc-500">Square</span>
                                </button>
                                <button onClick={() => addShape("circle")} className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-zinc-100 dark:border-slate-800">
                                    <Circle size={24} className="text-zinc-600 dark:text-zinc-400" />
                                    <span className="text-[10px] font-bold uppercase hidden md:block text-zinc-500">Circle</span>
                                </button>
                                <button onClick={() => addShape("triangle")} className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-zinc-100 dark:border-slate-800 md:col-span-2">
                                    <Triangle size={24} className="text-zinc-600 dark:text-zinc-400" />
                                    <span className="text-[10px] font-bold uppercase hidden md:block text-zinc-500">Triangle</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200/50 dark:bg-slate-800" />

                        {/* Image Group */}
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:block mb-3">Upload Manually</span>
                            <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-xl cursor-pointer transition-colors text-blue-600 dark:text-blue-400">
                                <ImageIcon size={24} />
                                <span className="text-sm font-bold hidden md:block text-center">Upload Image<br/>from Computer</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Main Canvas Area */}
                <main 
                    className="flex-1 overflow-auto flex relative items-center justify-center bg-zinc-100/50 dark:bg-[#05050f]/80 p-8"
                    onClick={() => setSelectedId(null)}
                >
                    <div 
                        className="max-w-full max-h-full overflow-auto rounded-xl p-4 custom-scrollbar"
                    >
                        <div 
                            ref={canvasRef}
                            className="relative shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-all bg-white"
                            style={{
                                width: canvasDimensions.width,
                                height: canvasDimensions.height,
                                backgroundColor: canvasBg,
                                overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {elements.map((el) => {
                                const isSelected = selectedId === el.id;
                                return (
                                    <motion.div
                                        key={el.id}
                                        drag={isSelected}
                                        dragMomentum={false}
                                        onDragEnd={(e, info) => {
                                            updateElement(el.id, {
                                                x: Math.max(0, el.x + info.offset.x),
                                                y: Math.max(0, el.y + info.offset.y)
                                            });
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(el.id);
                                        }}
                                        className={cn(
                                            "absolute flex items-center justify-center",
                                            isSelected ? "cursor-move" : "cursor-pointer"
                                        )}
                                        style={{
                                            x: el.x,
                                            y: el.y,
                                            width: (el.type === "shape" || el.type === "image" || el.type === "sticker") ? el.width : undefined,
                                            height: (el.type === "shape" || el.type === "sticker") ? el.height : undefined,
                                            zIndex: el.zIndex,
                                            rotate: el.rotation || 0,
                                            minWidth: el.type === "text" ? 20 : undefined,
                                            outline: isSelected && !isExporting ? "2px solid #3b82f6" : "none",
                                            outlineOffset: "4px"
                                        }}
                                    >
                                        {/* Resize Handles */}
                                        {isSelected && !isExporting && (
                                            <>
                                                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-sm" />
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-sm" />
                                                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-sm" />
                                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-sm" />
                                            </>
                                        )}

                                        {/* Render Elements */}
                                        {el.type === "text" && (
                                            <div 
                                                style={{
                                                    fontSize: el.fontSize,
                                                    fontWeight: el.fontWeight,
                                                    fontStyle: el.fontStyle || "normal",
                                                    fontFamily: el.fontFamily,
                                                    color: el.color,
                                                    textAlign: el.textAlign,
                                                    lineHeight: 1.2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "100%",
                                                    userSelect: "none"
                                                }}
                                            >
                                                <CurvedText text={el.content} curve={el.curve || 0} fontSize={el.fontSize} />
                                            </div>
                                        )}

                                        {el.type === "shape" && (
                                            <div 
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: el.shapeType !== 'triangle' ? el.backgroundColor : 'transparent',
                                                    borderRadius: el.shapeType === 'circle' ? '50%' : '0',
                                                    clipPath: el.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                                                }}
                                            >
                                                {el.shapeType === 'triangle' && (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: el.backgroundColor
                                                    }} />
                                                )}
                                            </div>
                                        )}

                                        {el.type === "image" && (
                                            <img 
                                                src={el.src} 
                                                alt="" 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none',
                                                }} 
                                                draggable={false}
                                            />
                                        )}

                                        {el.type === "sticker" && (
                                            <div 
                                                className="flex items-center justify-center text-center px-4 overflow-hidden shadow-md"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: el.backgroundColor,
                                                    borderRadius: el.shapeType === 'circle' ? '50%' : '12px',
                                                    color: el.textColor,
                                                    fontSize: el.fontSize,
                                                    fontWeight: 'bold',
                                                    fontStyle: el.fontStyle || "normal",
                                                    fontFamily: 'Inter, sans-serif'
                                                }}
                                            >
                                                <span style={{ wordBreak: 'break-word', width: '100%', lineHeight: 1.1 }}>{el.content}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-72 bg-white dark:bg-slate-900 border-l border-zinc-200 dark:border-slate-800 flex flex-col shrink-0 z-10 overflow-y-auto">
                    <div className="p-4 border-b border-zinc-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-bold mb-4">
                            <SlidersHorizontal size={18} className="text-zinc-500" />
                            <h2>Özellikler</h2>
                        </div>
                    </div>

                    <div className="p-4 flex-1">
                        {!selectedElement ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase">Tuval Arkaplan Rengi</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={canvasBg} 
                                            onChange={(e) => setCanvasBg(e.target.value)}
                                            className="w-10 h-10 rounded-xl cursor-pointer p-0 border border-zinc-200 dark:border-slate-700 overflow-hidden"
                                        />
                                        <span className="text-sm font-semibold uppercase text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-slate-700">{canvasBg}</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
                                    <MousePointer2 size={18} className="shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium leading-relaxed">Elemanları düzenlemek için tuval üzerinden seçin. Sürükleyerek yerlerini değiştirebilirsiniz.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                
                                {/* Positioning / Width / Height / Rotation */}
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedElement.type !== "text" && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Genişlik</label>
                                                <input 
                                                    type="number" 
                                                    value={selectedElement.width} 
                                                    onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                                                    className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Yükseklik</label>
                                                <input 
                                                    type="number" 
                                                    value={(selectedElement as ShapeElement | ImageElement | StickerElement).height} 
                                                    onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                                                    className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex justify-between mb-1 uppercase">
                                            <span>Döndürme Açısı (Yamukluk)</span>
                                            <span className="text-blue-600 dark:text-blue-400">{selectedElement.rotation || 0}°</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            min="-180" max="180" 
                                            value={selectedElement.rotation || 0}
                                            onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-2 uppercase">Katman Sırası</label>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => sendToBack(selectedElement.id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 border border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <MoveDown size={14} /> Alta Al
                                            </button>
                                            <button 
                                                onClick={() => bringToFront(selectedElement.id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 border border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <MoveUp size={14} /> Üste Al
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-zinc-100 dark:bg-slate-800" />

                                {/* Type Specific - TEXT */}
                                {selectedElement.type === "text" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Metin İçeriği</label>
                                            <textarea 
                                                value={(selectedElement as TextElement).content} 
                                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                                className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex justify-between mb-1 uppercase">
                                                <span>Yazı Büyüklüğü</span>
                                                <span className="text-blue-600 dark:text-blue-400">{(selectedElement as TextElement).fontSize}px</span>
                                            </label>
                                            <input 
                                                type="range" 
                                                min="8" max="150" 
                                                value={(selectedElement as TextElement).fontSize}
                                                onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                className="w-full accent-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Yazı Stili</label>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => updateElement(selectedElement.id, { fontStyle: (selectedElement as TextElement).fontStyle === "italic" ? "normal" : "italic" })}
                                                    className={cn("flex-1 p-2 rounded-lg border text-sm font-bold transition-colors", (selectedElement as TextElement).fontStyle === "italic" ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400" : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-slate-800 dark:border-slate-700 dark:text-zinc-300")}
                                                >
                                                    <span className="italic">İtalik (Eğik)</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex justify-between mb-1 uppercase">
                                                <span>Kavis (Yuvarlama)</span>
                                                <span className="text-blue-600 dark:text-blue-400">{(selectedElement as TextElement).curve || 0}</span>
                                            </label>
                                            <input 
                                                type="range" 
                                                min="-100" max="100" 
                                                value={(selectedElement as TextElement).curve || 0}
                                                onChange={(e) => updateElement(selectedElement.id, { curve: Number(e.target.value) })}
                                                className="w-full accent-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Metin Rengi</label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="color" 
                                                    value={(selectedElement as TextElement).color}
                                                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="w-10 h-10 rounded-xl cursor-pointer p-0 border border-zinc-200 dark:border-slate-700 overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Type Specific - SHAPE */}
                                {selectedElement.type === "shape" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Şekil Rengi</label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="color" 
                                                    value={(selectedElement as ShapeElement).backgroundColor}
                                                    onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                                    className="w-10 h-10 rounded-xl cursor-pointer p-0 border border-zinc-200 dark:border-slate-700 overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Type Specific - STICKER */}
                                {selectedElement.type === "sticker" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Etiket İçeriği</label>
                                            <textarea 
                                                value={(selectedElement as StickerElement).content} 
                                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                                className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex justify-between mb-1 uppercase">
                                                <span>Yazı Boyutu</span>
                                                <span className="text-blue-600 dark:text-blue-400">{(selectedElement as StickerElement).fontSize}px</span>
                                            </label>
                                            <input 
                                                type="range" 
                                                min="8" max="150" 
                                                value={(selectedElement as StickerElement).fontSize}
                                                onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                className="w-full accent-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Yazı Stili</label>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => updateElement(selectedElement.id, { fontStyle: (selectedElement as StickerElement).fontStyle === "italic" ? "normal" : "italic" })}
                                                    className={cn("flex-1 p-2 rounded-lg border text-sm font-bold transition-colors", (selectedElement as StickerElement).fontStyle === "italic" ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400" : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-slate-800 dark:border-slate-700 dark:text-zinc-300")}
                                                >
                                                    <span className="italic">İtalik (Eğik)</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Arkaplan Rengi</label>
                                                <input 
                                                    type="color" 
                                                    value={(selectedElement as StickerElement).backgroundColor}
                                                    onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                                    className="w-full h-10 rounded-xl cursor-pointer p-0 border border-zinc-200 dark:border-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">Yazı Rengi</label>
                                                <input 
                                                    type="color" 
                                                    value={(selectedElement as StickerElement).textColor}
                                                    onChange={(e) => updateElement(selectedElement.id, { textColor: e.target.value })}
                                                    className="w-full h-10 rounded-xl cursor-pointer p-0 border border-zinc-200 dark:border-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 mt-auto">
                                    <button 
                                        onClick={() => deleteElement(selectedElement.id)}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 py-2.5 rounded-xl text-sm font-bold transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Bu Öğeyi Sil
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
