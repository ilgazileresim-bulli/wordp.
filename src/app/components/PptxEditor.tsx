"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    ArrowLeft, Download, Upload, Plus, Trash2, Copy, Type, Square,
    Circle, Image, Palette, MousePointer2, ChevronDown,
    ZoomIn, ZoomOut, Undo, Redo, Minus, Triangle, Star,
    LayoutTemplate, X, Bold, Italic, Underline, Maximize,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Presentation,
    Scissors, Clipboard, PaintBucket, Pipette,
    Table, Film, Music, Link, FileText, Shapes,
    SlidersHorizontal, Wand2, Sparkles, Eye, Play,
    Search, Replace, MessageSquare, CheckCircle, Columns,
    Monitor, Grid3X3, StickyNote, PenTool, Paintbrush,
    HelpCircle, Mic
} from "lucide-react";
import { cn } from "./editor/utils";

// ─── Types ───────────────────────────────────────────────────────────
interface SlideElement {
    id: string;
    type: "text" | "image" | "shape";
    x: number; y: number;
    width: number; height: number;
    content: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    shapeType?: "rect" | "circle" | "triangle" | "star" | "line";
    imageData?: string;
    isPlaceholder?: boolean;
}

interface Slide {
    id: string;
    elements: SlideElement[];
    background: string;
    layout: "blank" | "title" | "titleContent" | "twoColumn" | "sectionHeader";
}

interface PptxEditorProps {
    onBack: () => void;
    initialFile?: File;
}

// ─── Constants ───────────────────────────────────────────────────────
const CANVAS_W = 960;
const CANVAS_H = 540;
const COLORS = ["#000000", "#ffffff", "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050", "#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0"];
const THEME_COLORS = ["#44546a", "#4472c4", "#ed7d31", "#a5a5a5", "#ffc000", "#5b9bd5", "#70ad47", "#264478", "#9b57a0", "#636363"];

const FONT_FAMILIES = ["Arial", "Calibri", "Times New Roman", "Verdana", "Georgia", "Tahoma", "Trebuchet MS", "Comic Sans MS"];

const BG_COLORS = [
    "#ffffff", "#f2f2f2", "#d9e2f3", "#e2efda", "#fce4d6", "#fff2cc",
    "#1f4e79", "#2e75b6", "#375623", "#c00000", "#0f172a", "#1e293b",
];

const LAYOUTS: { id: Slide["layout"]; label: string; elements: Omit<SlideElement, "id">[] }[] = [
    { id: "blank", label: "Boş Slayt", elements: [] },
    {
        id: "title", label: "Başlık Slaytı", elements: [
            { type: "text", x: 60, y: 120, width: 840, height: 120, content: "Başlık eklemek için tıklayın", fontSize: 44, fontWeight: "bold", fontFamily: "Calibri", textAlign: "center", color: "#333333", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
            { type: "text", x: 180, y: 280, width: 600, height: 80, content: "Alt başlık eklemek için tıklayın", fontSize: 22, fontFamily: "Calibri", textAlign: "center", color: "#666666", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
        ]
    },
    {
        id: "titleContent", label: "Başlık ve İçerik", elements: [
            { type: "text", x: 50, y: 20, width: 860, height: 60, content: "Başlık eklemek için tıklayın", fontSize: 32, fontWeight: "bold", fontFamily: "Calibri", color: "#333333", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
            { type: "text", x: 50, y: 100, width: 860, height: 400, content: "• Metin eklemek için tıklayın\n• İkinci düzey\n• Üçüncü düzey", fontSize: 20, fontFamily: "Calibri", color: "#444444", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
        ]
    },
    {
        id: "sectionHeader", label: "Bölüm Başlığı", elements: [
            { type: "text", x: 60, y: 180, width: 840, height: 80, content: "Bölüm başlığı", fontSize: 40, fontWeight: "bold", fontFamily: "Calibri", textAlign: "left", color: "#333333", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
            { type: "text", x: 60, y: 280, width: 840, height: 50, content: "Açıklama", fontSize: 18, fontFamily: "Calibri", textAlign: "left", color: "#888888", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
        ]
    },
    {
        id: "twoColumn", label: "İki İçerik", elements: [
            { type: "text", x: 50, y: 20, width: 860, height: 50, content: "Başlık", fontSize: 30, fontWeight: "bold", fontFamily: "Calibri", color: "#333333", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
            { type: "text", x: 50, y: 90, width: 420, height: 400, content: "• Sol içerik", fontSize: 18, fontFamily: "Calibri", color: "#444444", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
            { type: "text", x: 490, y: 90, width: 420, height: 400, content: "• Sağ içerik", fontSize: 18, fontFamily: "Calibri", color: "#444444", backgroundColor: "transparent", isPlaceholder: true, borderColor: "#a0a0a0", borderWidth: 1 },
        ]
    },
];

function uid() { return Math.random().toString(36).substr(2, 9); }

function createSlide(layout: Slide["layout"] = "blank", bg = "#ffffff"): Slide {
    const tmpl = LAYOUTS.find(l => l.id === layout) || LAYOUTS[0];
    return { id: uid(), background: bg, layout, elements: tmpl.elements.map(e => ({ ...e, id: uid() })) };
}

// ─── Ribbon Tab Types ────────────────────────────────────────────────
type RibbonTab = "dosya" | "giris" | "ekle" | "tasarim" | "gecisler" | "animasyonlar" | "slaytgosterisi" | "gozdengeçir" | "gorunum" | "kayit" | "yardim";

// ─── Component ───────────────────────────────────────────────────────
export default function PptxEditor({ onBack, initialFile }: PptxEditorProps) {
    const [slides, setSlides] = useState<Slide[]>([createSlide("title")]);
    const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
    const [selectedElId, setSelectedElId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<string>("select");
    const [zoom, setZoom] = useState(100);
    const [fileName, setFileName] = useState("Sunu1");
    const [history, setHistory] = useState<Slide[][]>([]);
    const [redoStack, setRedoStack] = useState<Slide[][]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>("giris");
    const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
    const [showShapeDropdown, setShowShapeDropdown] = useState(false);
    const [showBgDropdown, setShowBgDropdown] = useState(false);
    const [showDosya, setShowDosya] = useState(false);
    const [clipboardElement, setClipboardElement] = useState<SlideElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgInputRef = useRef<HTMLInputElement>(null);

    const currentSlide = slides[currentSlideIdx] || slides[0];
    const selectedEl = currentSlide?.elements.find(e => e.id === selectedElId) || null;

    // ─── History ─────────────────────────────────────────────────────
    const pushHistory = useCallback((newSlides: Slide[]) => {
        setHistory(prev => [...prev.slice(-29), slides]);
        setRedoStack([]);
        setSlides(newSlides);
    }, [slides]);

    const undo = () => { if (!history.length) return; setRedoStack(p => [slides, ...p]); setSlides(history[history.length - 1]); setHistory(p => p.slice(0, -1)); };
    const redo = () => { if (!redoStack.length) return; setHistory(p => [...p, slides]); setSlides(redoStack[0]); setRedoStack(p => p.slice(1)); };

    // ─── Slide Ops ───────────────────────────────────────────────────
    const updateSlide = useCallback((idx: number, patch: Partial<Slide>) => {
        pushHistory(slides.map((s, i) => i === idx ? { ...s, ...patch } : s));
    }, [slides, pushHistory]);

    const updateElement = useCallback((elId: string, patch: Partial<SlideElement>) => {
        updateSlide(currentSlideIdx, { elements: currentSlide.elements.map(e => e.id === elId ? { ...e, ...patch } : e) });
    }, [currentSlide, currentSlideIdx, updateSlide]);

    const addSlide = (layout: Slide["layout"] = "blank") => {
        const ns = createSlide(layout);
        const a = [...slides]; a.splice(currentSlideIdx + 1, 0, ns);
        pushHistory(a); setCurrentSlideIdx(currentSlideIdx + 1); setShowLayoutDropdown(false);
    };
    const deleteSlide = () => { if (slides.length <= 1) return; pushHistory(slides.filter((_, i) => i !== currentSlideIdx)); setCurrentSlideIdx(Math.min(currentSlideIdx, slides.length - 2)); };
    const duplicateSlide = () => { const d: Slide = { ...currentSlide, id: uid(), elements: currentSlide.elements.map(e => ({ ...e, id: uid() })) }; const a = [...slides]; a.splice(currentSlideIdx + 1, 0, d); pushHistory(a); setCurrentSlideIdx(currentSlideIdx + 1); };

    // ─── Element Ops ─────────────────────────────────────────────────
    const addTextElement = () => {
        const el: SlideElement = { id: uid(), type: "text", x: 100, y: 200, width: 400, height: 60, content: "", fontSize: 24, fontFamily: "Calibri", color: "#333333", backgroundColor: "transparent", textAlign: "left", fontWeight: "normal", fontStyle: "normal" };
        updateSlide(currentSlideIdx, { elements: [...currentSlide.elements, el] }); setSelectedElId(el.id); setEditingTextId(el.id); setActiveTool("select");
    };
    const addShape = (shapeType: SlideElement["shapeType"] = "rect") => {
        const el: SlideElement = { id: uid(), type: "shape", x: 200, y: 150, width: 200, height: 150, content: "", shapeType, backgroundColor: "#4472c4", borderColor: "#2f5496", borderWidth: 2, color: "#ffffff" };
        updateSlide(currentSlideIdx, { elements: [...currentSlide.elements, el] }); setSelectedElId(el.id); setActiveTool("select"); setShowShapeDropdown(false);
    };
    const addImage = () => { imgInputRef.current?.click(); };
    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { const img = new window.Image(); img.onload = () => { const a = img.width / img.height; const w = Math.min(400, img.width); const h = w / a; const el: SlideElement = { id: uid(), type: "image", x: (CANVAS_W - w) / 2, y: (CANVAS_H - h) / 2, width: w, height: h, content: "", imageData: reader.result as string }; updateSlide(currentSlideIdx, { elements: [...currentSlide.elements, el] }); setSelectedElId(el.id); setActiveTool("select"); }; img.src = reader.result as string; };
        reader.readAsDataURL(file); e.target.value = "";
    };
    const deleteElement = () => { if (!selectedElId) return; updateSlide(currentSlideIdx, { elements: currentSlide.elements.filter(e => e.id !== selectedElId) }); setSelectedElId(null); };

    // ─── Clipboard & Layering Ops ────────────────────────────────────
    const handleCopy = useCallback(() => { if (selectedEl) setClipboardElement(selectedEl); }, [selectedEl]);
    const handleCut = useCallback(() => { if (selectedEl) { setClipboardElement(selectedEl); deleteElement(); } }, [selectedEl, deleteElement]);
    const handlePaste = useCallback(() => {
        if (clipboardElement) {
            const el: SlideElement = { ...clipboardElement, id: uid(), x: clipboardElement.x + 20, y: clipboardElement.y + 20 };
            updateSlide(currentSlideIdx, { elements: [...currentSlide.elements, el] });
            setSelectedElId(el.id);
            setActiveTool("select");
        }
    }, [clipboardElement, currentSlideIdx, updateSlide, currentSlide]);

    const bringForward = () => {
        if (!selectedElId) return;
        const els = [...currentSlide.elements];
        const idx = els.findIndex(e => e.id === selectedElId);
        if (idx < els.length - 1) {
            const temp = els[idx]; els[idx] = els[idx + 1]; els[idx + 1] = temp;
            updateSlide(currentSlideIdx, { elements: els });
        }
    };
    const sendBackward = () => {
        if (!selectedElId) return;
        const els = [...currentSlide.elements];
        const idx = els.findIndex(e => e.id === selectedElId);
        if (idx > 0) {
            const temp = els[idx]; els[idx] = els[idx - 1]; els[idx - 1] = temp;
            updateSlide(currentSlideIdx, { elements: els });
        }
    };
    
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => console.error(err));
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    useEffect(() => {
        const handleFullscreenChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // ─── Mouse ───────────────────────────────────────────────────────
    const getCanvasPos = (e: React.MouseEvent) => { if (!canvasRef.current) return { x: 0, y: 0 }; const r = canvasRef.current.getBoundingClientRect(); const s = zoom / 100; return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        const pos = getCanvasPos(e);
        const clicked = [...currentSlide.elements].reverse().find(el => pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height);
        if (clicked) {
            let isEditingNow = editingTextId === clicked.id;

            // Clear placeholder on first click
            if (clicked.isPlaceholder) {
                updateElement(clicked.id, { isPlaceholder: false, content: "", borderColor: "transparent", borderWidth: 0 });
                setEditingTextId(clicked.id);
                setSelectedElId(clicked.id);
                isEditingNow = true;
            } else if (!isEditingNow && clicked.type === "text") {
                // If we click a text element, we shouldn't necessarily enter edit mode immediately on mousedown if double click is expected,
                // BUT to make it easier to write, let's just use double click as implemented in the div below.
                // We just need to make sure we don't clear the editingTextId incorrectly.
                // Wait, if we click ANOTHER element, we should clear edit mode.
                setEditingTextId(null);
            }

            // If already editing THIS element, don't restart dragging
            if (isEditingNow) {
                return; // Let the textarea handle its own mousedown (selection, etc.)
            }

            setSelectedElId(clicked.id);
            // If they click on a shape or text box, they can double-click to edit, or single click to select.
            setIsDragging(true); setDragStart({ x: pos.x - clicked.x, y: pos.y - clicked.y });

            if (pos.x >= clicked.x + clicked.width - 12 && pos.y >= clicked.y + clicked.height - 12) { setIsResizing(true); setIsDragging(false); }
        } else { setSelectedElId(null); setEditingTextId(null); }
    };
    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!selectedElId) return; const pos = getCanvasPos(e);
        if (isDragging) { const nx = Math.max(0, Math.min(CANVAS_W - 20, pos.x - dragStart.x)); const ny = Math.max(0, Math.min(CANVAS_H - 20, pos.y - dragStart.y)); setSlides(p => p.map((s, i) => i !== currentSlideIdx ? s : { ...s, elements: s.elements.map(el => el.id === selectedElId ? { ...el, x: nx, y: ny } : el) })); }
        if (isResizing) { const el = currentSlide.elements.find(e2 => e2.id === selectedElId); if (!el) return; setSlides(p => p.map((s, i) => i !== currentSlideIdx ? s : { ...s, elements: s.elements.map(e2 => e2.id === selectedElId ? { ...e2, width: Math.max(40, pos.x - el.x), height: Math.max(30, pos.y - el.y) } : e2) })); }
    };
    const handleCanvasMouseUp = () => { if (isDragging || isResizing) { setHistory(p => [...p.slice(-29), slides]); setRedoStack([]); } setIsDragging(false); setIsResizing(false); };

    // ─── Export/Import ───────────────────────────────────────────────
    const exportPptx = async () => {
        try {
            const PptxGenJS = (await import("pptxgenjs")).default;
            const pptx = new PptxGenJS(); pptx.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 }); pptx.layout = "CUSTOM";
            for (const slide of slides) {
                const s = pptx.addSlide();
                if (slide.background.startsWith("#")) s.background = { fill: slide.background.replace("#", "") };
                for (const el of slide.elements) {
                    const xIn = el.x / CANVAS_W * 10, yIn = el.y / CANVAS_H * 5.625, wIn = el.width / CANVAS_W * 10, hIn = el.height / CANVAS_H * 5.625;
                    if (el.type === "text") s.addText(el.content, { x: xIn, y: yIn, w: wIn, h: hIn, fontSize: (el.fontSize || 24) * 0.6, color: (el.color || "#000").replace("#", ""), bold: el.fontWeight === "bold", italic: el.fontStyle === "italic", align: (el.textAlign as any) || "left", valign: "top", fontFace: el.fontFamily || "Calibri" });
                    if (el.type === "image" && el.imageData) s.addImage({ data: el.imageData, x: xIn, y: yIn, w: wIn, h: hIn });
                    if (el.type === "shape") s.addShape("rect" as any, { x: xIn, y: yIn, w: wIn, h: hIn, fill: { color: (el.backgroundColor || "#4472c4").replace("#", "") }, line: { color: (el.borderColor || "#2f5496").replace("#", ""), width: el.borderWidth || 1 } });
                }
            }
            await pptx.writeFile({ fileName: `${fileName}.pptx` });
        } catch (err) { console.error("PPTX export error:", err); alert("An error occurred while exporting PPTX."); }
    };

    const importPptx = async (file: File) => {
        try {
            const JSZip = (await import("jszip")).default; const zip = await new JSZip().loadAsync(file);
            setFileName(file.name.replace(/\.[^/.]+$/, ""));
            const mediaFiles = Object.keys(zip.files).filter(p => p.startsWith("ppt/media/") && /\.(png|jpg|jpeg|gif)$/i.test(p));
            const slideFiles = Object.keys(zip.files).filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p)).sort();
            const newSlides: Slide[] = [];
            for (let i = 0; i < Math.max(slideFiles.length, 1); i++) {
                const s = createSlide("blank");
                if (mediaFiles[i]) { const d = await zip.files[mediaFiles[i]].async("base64"); const ext = mediaFiles[i].endsWith(".png") ? "png" : "jpeg"; s.elements.push({ id: uid(), type: "image", x: 0, y: 0, width: CANVAS_W, height: CANVAS_H, content: "", imageData: `data:image/${ext};base64,${d}` }); }
                newSlides.push(s);
            }
            if (!newSlides.length) newSlides.push(createSlide("title"));
            pushHistory(newSlides); setCurrentSlideIdx(0);
        } catch (err) { console.error("Import error:", err); alert("An error occurred while opening PPTX."); }
    };

    const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) importPptx(f); e.target.value = ""; };
    useEffect(() => { if (initialFile) importPptx(initialFile); }, [initialFile]);

    // ─── Keyboard ────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e: KeyboardEvent) => { 
            if (isFullscreen) {
                if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
                    if (currentSlideIdx < slides.length - 1) setCurrentSlideIdx(currentSlideIdx + 1);
                    else { if (document.fullscreenElement) document.exitFullscreen(); setIsFullscreen(false); }
                } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
                    if (currentSlideIdx > 0) setCurrentSlideIdx(currentSlideIdx - 1);
                } else if (e.key === "Escape") {
                    if (document.fullscreenElement) document.exitFullscreen(); setIsFullscreen(false);
                }
                return;
            }
            if (editingTextId) return; 
            if (selectedElId && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const el = currentSlide.elements.find(e2 => e2.id === selectedElId);
                if (el && (el.type === "text" || el.type === "shape")) {
                    setEditingTextId(selectedElId);
                    // The very first character they type initiates editing. 
                    const v = el.content === "" ? e.key : el.content + e.key;
                    setSlides(p => p.map((s, i) => i !== currentSlideIdx ? s : { ...s, elements: s.elements.map(e3 => e3.id === selectedElId ? { ...e3, content: v } : e3) }));
                    e.preventDefault();
                    return;
                }
            }
            if (e.key === "Delete" || e.key === "Backspace") { if (selectedElId) deleteElement(); } 
            if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); } 
            if (e.ctrlKey && e.key === "y") { e.preventDefault(); redo(); } 
            if (e.ctrlKey && e.key === "c") { e.preventDefault(); handleCopy(); }
            if (e.ctrlKey && e.key === "x") { e.preventDefault(); handleCut(); }
            if (e.ctrlKey && e.key === "v") { e.preventDefault(); handlePaste(); }
        };
        window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
    }, [selectedElId, editingTextId, history, redoStack, slides, isFullscreen, currentSlideIdx, handleCopy, handleCut, handlePaste]);

    // ─── Render Shape ────────────────────────────────────────────────
    const renderShape = (el: SlideElement) => {
        const s: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" };
        if (el.shapeType === "circle") return <div style={{ ...s, borderRadius: "50%", backgroundColor: el.backgroundColor, border: `${el.borderWidth || 2}px solid ${el.borderColor}` }} />;
        if (el.shapeType === "triangle") return <div style={s}><svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><polygon points="50,5 95,95 5,95" fill={el.backgroundColor} stroke={el.borderColor} strokeWidth={el.borderWidth || 2} /></svg></div>;
        if (el.shapeType === "star") return <div style={s}><svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={el.backgroundColor || "#ffc000"} stroke={el.borderColor || "#bf9000"} strokeWidth={el.borderWidth || 2} /></svg></div>;
        return <div style={{ ...s, backgroundColor: el.backgroundColor, border: `${el.borderWidth || 2}px solid ${el.borderColor}`, borderRadius: 2 }} />;
    };

    // ─── Ribbon Group Component ──────────────────────────────────────
    const RibbonGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col items-center border-r border-[#d5d5d5] pr-2 mr-2 last:border-r-0 last:pr-0 last:mr-0">
            <div className="flex items-center gap-0.5 py-0.5">{children}</div>
            <span className="text-[9px] text-[#666] mt-0.5 leading-none">{label}</span>
        </div>
    );

    // ─── Small ribbon button ─────────────────────────────────────────
    const RBtn = ({ icon: Icon, label, onClick, active, size = 16 }: { icon: any; label: string; onClick?: () => void; active?: boolean; size?: number }) => (
        <button onClick={onClick} title={label} className={cn("p-1 rounded hover:bg-[#c8dcf0] transition-colors", active && "bg-[#b8cce4]")}>
            <Icon size={size} className="text-[#444]" />
        </button>
    );

    // ─── Big ribbon button ───────────────────────────────────────────
    const BigBtn = ({ icon: Icon, label, onClick, sub }: { icon: any; label: string; onClick?: () => void; sub?: boolean }) => (
        <button onClick={onClick} className="flex flex-col items-center px-2 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors min-w-[50px]">
            <Icon size={22} className="text-[#444] mb-0.5" />
            <span className="text-[10px] text-[#444] leading-tight flex items-center gap-0.5">{label}{sub && <ChevronDown size={8} />}</span>
        </button>
    );

    // ─── Ribbon Content ──────────────────────────────────────────────
    const renderRibbon = () => {
        if (activeRibbonTab === "giris") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* ── Pano ── */}
                <RibbonGroup label="Pano">
                    <BigBtn icon={Clipboard} label="Yapıştır" sub onClick={handlePaste} />
                    <div className="flex flex-col gap-px">
                        <button onClick={handleCut} className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Scissors size={12} /> Kes</button>
                        <button onClick={handleCopy} className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Copy size={12} /> Kopyala</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Paintbrush size={12} /> Biçim Boyacısı</button>
                    </div>
                </RibbonGroup>
                {/* ── Slaytlar ── */}
                <RibbonGroup label="Slaytlar">
                    <div className="flex flex-col gap-px">
                        <div className="relative z-50">
                            <button onClick={() => setShowLayoutDropdown(!showLayoutDropdown)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444] border border-[#bbb] bg-white">
                                <Plus size={11} /> Düzen <ChevronDown size={9} />
                            </button>
                            {showLayoutDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-[#ccc] shadow-xl rounded-sm w-44">
                                    {LAYOUTS.map(l => (
                                        <button key={l.id} onClick={() => addSlide(l.id)} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#d6e4f0] text-[#333]">{l.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={duplicateSlide} className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Copy size={11} /> Çoğalt</button>
                        <button onClick={deleteSlide} className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Trash2 size={11} /> Sil</button>
                    </div>
                </RibbonGroup>
                {/* ── Yazı Tipi ── */}
                <RibbonGroup label="Yazı Tipi">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-0.5">
                            <select value={selectedEl?.fontFamily || "Calibri"} onChange={e => selectedEl && updateElement(selectedEl.id, { fontFamily: e.target.value })}
                                className="h-[20px] border border-[#bbb] rounded-sm text-[10px] text-[#333] w-[100px] bg-white px-1">
                                {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <select value={selectedEl?.fontSize || 24} onChange={e => selectedEl && updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                                className="h-[20px] border border-[#bbb] rounded-sm text-[10px] text-[#333] w-[36px] bg-white px-0.5">
                                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 54, 60, 72, 96].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={() => selectedEl && updateElement(selectedEl.id, { fontSize: Math.min(96, (selectedEl.fontSize || 24) + 2) })}
                                className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[11px] text-[#444] font-medium" title="Yazı Tipi Boyutunu Büyüt">A↑</button>
                            <button onClick={() => selectedEl && updateElement(selectedEl.id, { fontSize: Math.max(8, (selectedEl.fontSize || 24) - 2) })}
                                className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[10px] text-[#444]" title="Yazı Tipi Boyutunu Küçült">A↓</button>
                        </div>
                        <div className="flex items-center gap-0">
                            <button onClick={() => selectedEl && updateElement(selectedEl.id, { fontWeight: selectedEl.fontWeight === "bold" ? "normal" : "bold" })}
                                className={cn("w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[12px] font-bold text-[#444]", selectedEl?.fontWeight === "bold" && "bg-[#b8cce4]")} title="Kalın">K</button>
                            <button onClick={() => selectedEl && updateElement(selectedEl.id, { fontStyle: selectedEl.fontStyle === "italic" ? "normal" : "italic" })}
                                className={cn("w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[12px] italic text-[#444]", selectedEl?.fontStyle === "italic" && "bg-[#b8cce4]")} title="Eğik">T</button>
                            <button onClick={() => selectedEl && updateElement(selectedEl.id, { textDecoration: selectedEl.textDecoration === "underline" ? "none" : "underline" })}
                                className={cn("w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[12px] underline text-[#444]", selectedEl?.textDecoration === "underline" && "bg-[#b8cce4]")} title="Altı Çizili">A</button>
                            <button onClick={() => selectedEl && updateElement(selectedEl.id, { textDecoration: selectedEl.textDecoration === "line-through" ? "none" : "line-through" })}
                                className={cn("w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[12px] line-through text-[#444]", selectedEl?.textDecoration === "line-through" && "bg-[#b8cce4]")} title="Üstü Çizili">S</button>
                            <div className="w-px h-4 bg-[#ccc] mx-0.5" />
                            <button className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[10px] text-[#444]" title="Büyük/Küçük Harf">Aa<ChevronDown size={7} className="ml-px" /></button>
                            <div className="w-px h-4 bg-[#ccc] mx-0.5" />
                            {/* Font Color */}
                            <div className="relative group/fc">
                                <label className="w-[22px] h-[20px] flex flex-col items-center justify-center rounded-sm hover:bg-[#c8dcf0] cursor-pointer" title="Yazı Tipi Rengi">
                                    <span className="text-[12px] font-bold text-[#444] leading-none">A</span>
                                    <div className="w-4 h-[3px] rounded-sm" style={{ backgroundColor: selectedEl?.color || "#c00000" }} />
                                    <input type="color" value={selectedEl?.color || "#000000"} onChange={e => selectedEl && updateElement(selectedEl.id, { color: e.target.value })} className="absolute opacity-0 w-0 h-0" />
                                </label>
                            </div>
                            {/* Highlight */}
                            <label className="w-[22px] h-[20px] flex flex-col items-center justify-center rounded-sm hover:bg-[#c8dcf0] cursor-pointer" title="Vurgulama Rengi">
                                <span className="text-[10px] text-[#444] leading-none">ab</span>
                                <div className="w-4 h-[3px] rounded-sm" style={{ backgroundColor: selectedEl?.backgroundColor === "transparent" ? "#ffff00" : (selectedEl?.backgroundColor || "#ffff00") }} />
                                <input type="color" value={selectedEl?.backgroundColor === "transparent" ? "#ffffff" : (selectedEl?.backgroundColor || "#ffffff")} onChange={e => selectedEl && updateElement(selectedEl.id, { backgroundColor: e.target.value })} className="absolute opacity-0 w-0 h-0" />
                            </label>
                        </div>
                    </div>
                </RibbonGroup>
                {/* ── Paragraf ── */}
                <RibbonGroup label="Paragraf">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-0">
                            <button className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0]" title="Madde İşaretleri">
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="#444"><circle cx="3" cy="4" r="1.5" /><rect x="6" y="3" width="8" height="2" rx="0.5" /><circle cx="3" cy="8" r="1.5" /><rect x="6" y="7" width="8" height="2" rx="0.5" /><circle cx="3" cy="12" r="1.5" /><rect x="6" y="11" width="8" height="2" rx="0.5" /></svg>
                            </button>
                            <button className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0]" title="Numaralandırma">
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="#444"><text x="1" y="5" fontSize="4" fontWeight="bold">1.</text><rect x="6" y="3" width="8" height="2" rx="0.5" /><text x="1" y="9" fontSize="4" fontWeight="bold">2.</text><rect x="6" y="7" width="8" height="2" rx="0.5" /><text x="1" y="13" fontSize="4" fontWeight="bold">3.</text><rect x="6" y="11" width="8" height="2" rx="0.5" /></svg>
                            </button>
                            <div className="w-px h-4 bg-[#ccc] mx-0.5" />
                            <button className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[12px] text-[#444]" title="Girintiyi Azalt">←</button>
                            <button className="w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0] text-[12px] text-[#444]" title="Girintiyi Artır">→</button>
                        </div>
                        <div className="flex items-center gap-0">
                            {(["left", "center", "right", "justify"] as const).map(a => (
                                <button key={a} onClick={() => selectedEl && updateElement(selectedEl.id, { textAlign: a })}
                                    className={cn("w-[20px] h-[20px] flex items-center justify-center rounded-sm hover:bg-[#c8dcf0]", selectedEl?.textAlign === a && "bg-[#b8cce4]")}>
                                    {a === "left" ? <AlignLeft size={12} className="text-[#444]" /> : a === "center" ? <AlignCenter size={12} className="text-[#444]" /> : a === "right" ? <AlignRight size={12} className="text-[#444]" /> : <AlignJustify size={12} className="text-[#444]" />}
                                </button>
                            ))}
                            <div className="w-px h-4 bg-[#ccc] mx-0.5" />
                            <RBtn icon={Columns} label="Sütunlar" size={12} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-px ml-1">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Wand2 size={11} /> Metin Yönü <ChevronDown size={8} /></button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Grid3X3 size={11} /> Hizala <ChevronDown size={8} /></button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Sparkles size={11} /> SmartArt{"'"}a Dönüştür <ChevronDown size={8} /></button>
                    </div>
                </RibbonGroup>
                {/* ── Çizim ── */}
                <RibbonGroup label="Çizim">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-0.5">
                            <div className="flex border border-[#bbb] rounded-sm overflow-hidden">
                                {([["rect", Square], ["circle", Circle], ["triangle", Triangle], ["star", Star]] as [string, any][]).map(([t, I]) => (
                                    <button key={t} onClick={() => addShape(t as any)} className="w-[22px] h-[22px] flex items-center justify-center hover:bg-[#c8dcf0] border-r border-[#ddd] last:border-r-0" title={t}>
                                        <I size={12} className="text-[#444]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <div className="relative group z-50">
                                <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Shapes size={11} /> Yerleştir <ChevronDown size={8} /></button>
                                <div className="absolute top-full left-0 hidden group-hover:block mt-1 bg-white border border-[#ccc] shadow-xl rounded-sm w-32 py-1">
                                    <button onClick={bringForward} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#d6e4f0] text-[#333]">Bir Öne Getir</button>
                                    <button onClick={sendBackward} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#d6e4f0] text-[#333]">Bir Arkaya Gönder</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-px ml-1">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Eye size={11} /> Şekil Dolgusu <ChevronDown size={8} /></button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><PenTool size={11} /> Veri Alanı Hızlı <ChevronDown size={8} /></button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Sparkles size={11} /> Şekil Efektleri <ChevronDown size={8} /></button>
                    </div>
                </RibbonGroup>
                {/* ── Düzenleme ── */}
                <RibbonGroup label="Düzenleme">
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Search size={12} /> Bul</button>
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Replace size={12} /> Değiştir</button>
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><MousePointer2 size={12} /> Seç <ChevronDown size={9} /></button>
                    </div>
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "ekle") return (
            <div className="flex items-end px-3 py-1 gap-0">
                <RibbonGroup label="Slaytlar">
                    <BigBtn icon={Plus} label="Yeni Slayt" onClick={() => addSlide("titleContent")} sub />
                </RibbonGroup>
                <RibbonGroup label="Tablolar">
                    <BigBtn icon={Table} label="Tablo" />
                </RibbonGroup>
                <RibbonGroup label="Resimler">
                    <BigBtn icon={Image} label="Resimler" onClick={addImage} />
                    <BigBtn icon={Image} label={"Çevrimiçi\nGörüntüler"} />
                    <BigBtn icon={Image} label={"Fotoğraf\nAlbümü"} sub />
                </RibbonGroup>
                <RibbonGroup label="Çizimler">
                    <div className="relative">
                        <BigBtn icon={Shapes} label="Şekiller" onClick={() => setShowShapeDropdown(!showShapeDropdown)} sub />
                        {showShapeDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-[#ccc] shadow-xl z-50 rounded-sm p-2 flex gap-1">
                                {([["rect", Square, "Dikdörtgen"], ["circle", Circle, "Daire"], ["triangle", Triangle, "Üçgen"], ["star", Star, "Yıldız"]] as [string, any, string][]).map(([t, I, l]) => (
                                    <button key={t} onClick={() => addShape(t as any)} className="p-2 hover:bg-[#d6e4f0] rounded" title={l}><I size={18} className="text-[#444]" /></button>
                                ))}
                            </div>
                        )}
                    </div>
                    <BigBtn icon={Sparkles} label="Simgeler" />
                    <BigBtn icon={Grid3X3} label="SmartArt" />
                    <BigBtn icon={SlidersHorizontal} label="Grafik" />
                </RibbonGroup>
                <RibbonGroup label="Eklentiler">
                    <div className="flex flex-col gap-0.5">
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Sparkles size={12} /> Eklentileri Edinin</button>
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><FileText size={12} /> Eklentilerim</button>
                    </div>
                </RibbonGroup>
                <RibbonGroup label="Bağlantılar">
                    <BigBtn icon={Eye} label="Önizleme" />
                    <BigBtn icon={Link} label="Bağlantı" />
                    <BigBtn icon={Play} label="Eylem" />
                </RibbonGroup>
                <RibbonGroup label="Açıklamalar">
                    <BigBtn icon={MessageSquare} label="Yorum" />
                </RibbonGroup>
                <RibbonGroup label="Metin">
                    <BigBtn icon={Type} label={"Metin\nKutusu"} onClick={addTextElement} />
                    <BigBtn icon={FileText} label={"Üst Bilgi\nve Alt Bilgi"} />
                    <BigBtn icon={Wand2} label="WordArt" />
                    <div className="flex flex-col gap-0.5">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]">Tarih ve Saat</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]">Slayt Numarası</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]">Nesne</button>
                    </div>
                </RibbonGroup>
                <RibbonGroup label="Simgeler">
                    <BigBtn icon={FileText} label="Denklem" />
                    <BigBtn icon={Star} label="Simge" />
                </RibbonGroup>
                <RibbonGroup label="Medya">
                    <BigBtn icon={Film} label="Video" sub />
                    <BigBtn icon={Music} label="Ses" sub />
                    <BigBtn icon={Monitor} label={"Ekran\nKaydı"} />
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "tasarim") return (
            <div className="flex items-end px-3 py-1 gap-0">
                <RibbonGroup label="Temalar">
                    <div className="flex gap-[3px] items-center overflow-x-auto max-w-[680px]">
                        {[
                            { bg: "#ffffff", fg: "#333", border: "#ccc", style: "normal" },
                            { bg: "#ffffff", fg: "#333", border: "#ccc", style: "serif" },
                            { bg: "#c00000", fg: "#fff", border: "#a00", style: "normal" },
                            { bg: "#e04020", fg: "#fff", border: "#c03010", style: "bold" },
                            { bg: "linear-gradient(135deg, #ff0 0%, #f0f 50%, #0ff 100%)", fg: "#333", border: "#ccc", style: "normal" },
                            { bg: "#002060", fg: "#dde", border: "#001040", style: "serif" },
                            { bg: "#ffffff", fg: "#444", border: "#ccc", style: "light" },
                            { bg: "#375623", fg: "#cfc", border: "#2a4018", style: "normal" },
                            { bg: "#ff6600", fg: "#fff", border: "#cc5200", style: "bold" },
                            { bg: "#4472c4", fg: "#fff", border: "#335da0", style: "normal" },
                            { bg: "#ffc000", fg: "#333", border: "#dda600", style: "serif" },
                            { bg: "#7030a0", fg: "#fff", border: "#5a2580", style: "normal" },
                            { bg: "#c00000", fg: "#ffd", border: "#900", style: "bold" },
                            { bg: "#1f4e79", fg: "#9cf", border: "#0d3050", style: "serif" },
                        ].map((t, i) => (
                            <button key={i} onClick={() => updateSlide(currentSlideIdx, { background: t.bg.startsWith("linear") ? "#ffffff" : t.bg })}
                                className={cn(
                                    "w-[50px] h-[42px] rounded-[2px] border-[1.5px] transition-all flex items-center justify-center shrink-0 relative overflow-hidden",
                                    (currentSlide.background === t.bg || (i === 0 && currentSlide.background === "#ffffff"))
                                        ? "border-[#c43e1c] shadow-sm ring-1 ring-[#c43e1c]/30"
                                        : `border-[${t.border}] hover:border-[#888] hover:shadow-sm`
                                )} style={{
                                    background: t.bg,
                                    borderColor: (currentSlide.background === t.bg || (i === 0 && currentSlide.background === "#ffffff")) ? "#c43e1c" : t.border
                                }}>
                                <span className="relative z-10" style={{
                                    fontFamily: t.style === "serif" ? "Georgia, serif" : t.style === "light" ? "Calibri Light, sans-serif" : "Calibri, sans-serif",
                                    fontSize: t.style === "bold" ? "16px" : "15px",
                                    fontWeight: t.style === "bold" ? 700 : 400,
                                    color: t.fg,
                                    letterSpacing: "-0.5px",
                                }}>Aa</span>
                            </button>
                        ))}
                        {/* Scroll arrows */}
                        <div className="flex flex-col gap-px ml-0.5 shrink-0">
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▲</button>
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▼</button>
                        </div>
                    </div>
                </RibbonGroup>
                <RibbonGroup label="Çeşitlemeler">
                    <div className="flex gap-[3px] items-center">
                        {[
                            { top: "#ffffff", mid: "#4472c4", bot: "#2b579a", accent: "#ed7d31" },
                            { top: "#f8f8f8", mid: "#333", bot: "#555", accent: "#c00000" },
                            { top: "#1a1a2e", mid: "#16213e", bot: "#0f3460", accent: "#e94560" },
                            { top: "#ffffff", mid: "#2e75b6", bot: "#1e4d7b", accent: "#ffc000" },
                        ].map((v, i) => (
                            <button key={i} onClick={() => updateSlide(currentSlideIdx, { background: v.top })}
                                className={cn("w-[36px] h-[42px] rounded-[2px] border-[1.5px] transition-all flex flex-col overflow-hidden shrink-0",
                                    i === 0 ? "border-[#c43e1c]" : "border-[#bbb] hover:border-[#888]"
                                )}>
                                <div className="flex-1" style={{ backgroundColor: v.top }} />
                                <div className="h-[6px]" style={{ backgroundColor: v.mid }} />
                                <div className="h-[4px]" style={{ backgroundColor: v.bot }} />
                                <div className="h-[3px]" style={{ backgroundColor: v.accent }} />
                            </button>
                        ))}
                        {/* Scroll arrows for variants */}
                        <div className="flex flex-col gap-px ml-0.5 shrink-0">
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▲</button>
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▼</button>
                        </div>
                    </div>
                </RibbonGroup>
                <RibbonGroup label="Özelleştir">
                    <div className="flex flex-col gap-0.5">
                        <button className="flex flex-col items-center px-3 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors">
                            <Maximize size={20} className="text-[#444] mb-0.5" />
                            <span className="text-[9px] text-[#444] leading-tight whitespace-nowrap">Slayt<br />Boyutu</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="relative">
                            <button onClick={() => setShowBgDropdown(!showBgDropdown)} className="flex flex-col items-center px-2 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors">
                                <PaintBucket size={20} className="text-[#444] mb-0.5" />
                                <span className="text-[9px] text-[#444] leading-tight whitespace-nowrap text-center">Arka Planı<br />Biçimlendir</span>
                            </button>
                            {showBgDropdown && (
                                <div className="absolute top-full right-0 mt-1 bg-white border border-[#ccc] shadow-xl z-50 rounded-sm p-3 w-52">
                                    <p className="text-[10px] font-bold text-[#666] mb-2">Arka Plan Renkleri</p>
                                    <div className="grid grid-cols-6 gap-1">
                                        {BG_COLORS.map((bg, i) => (
                                            <button key={i} onClick={() => { updateSlide(currentSlideIdx, { background: bg }); setShowBgDropdown(false); }}
                                                className={cn("w-7 h-7 rounded-sm border transition-all", currentSlide.background === bg ? "border-[#4472c4] border-2" : "border-[#bbb]")} style={{ backgroundColor: bg }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "gecisler") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* Önizleme */}
                <RibbonGroup label="Önizleme">
                    <BigBtn icon={Eye} label="Önizleme" />
                </RibbonGroup>
                {/* Bu Slayda Geçiş */}
                <RibbonGroup label="Bu Slayda Geçiş">
                    <div className="flex gap-[3px] items-center overflow-x-auto max-w-[580px]">
                        {[
                            "Yok", "Dönüşüm", "Soluklaşarak", "İtmek", "Süpürerek", "Böl",
                            "Göster", "Kesme", "Rastgele Çiz.", "Şerit", "Açarak", "Kapatarak",
                            "Parlama", "Devirme", "Pano Perde", "Perdeler"
                        ].map((name, i) => (
                            <button key={i} className={cn(
                                "w-[50px] h-[42px] rounded-[2px] border-[1.5px] transition-all flex flex-col items-center justify-center shrink-0 bg-white hover:border-[#888] hover:shadow-sm",
                                i === 0 ? "border-[#c43e1c] shadow-sm" : "border-[#bbb]"
                            )}>
                                <div className="w-7 h-5 mb-0.5 rounded-sm bg-[#f0f0f0] border border-[#ddd] flex items-center justify-center">
                                    {i === 0 ? <X size={10} className="text-[#999]" /> :
                                        i === 1 ? <span className="text-[7px] text-[#666]">⟳</span> :
                                            i === 2 ? <span className="text-[8px] text-[#999]">◐</span> :
                                                i === 3 ? <span className="text-[8px] text-[#666]">→</span> :
                                                    i === 4 ? <span className="text-[8px] text-[#666]">↗</span> :
                                                        i === 5 ? <span className="text-[8px] text-[#666]">║</span> :
                                                            i === 6 ? <span className="text-[8px] text-[#666]">▣</span> :
                                                                i === 7 ? <span className="text-[8px] text-[#666]">✂</span> :
                                                                    i === 8 ? <span className="text-[8px] text-[#666]">✦</span> :
                                                                        i === 9 ? <span className="text-[8px] text-[#666]">☰</span> :
                                                                            i === 10 ? <span className="text-[8px] text-[#666]">◇</span> :
                                                                                i === 11 ? <span className="text-[8px] text-[#666]">◆</span> :
                                                                                    i === 12 ? <span className="text-[8px] text-[#666]">✧</span> :
                                                                                        i === 13 ? <span className="text-[8px] text-[#666]">↻</span> :
                                                                                            i === 14 ? <span className="text-[8px] text-[#666]">▥</span> :
                                                                                                <span className="text-[8px] text-[#666]">▦</span>}
                                </div>
                                <span className="text-[7px] text-[#555] leading-none truncate w-full text-center px-0.5">{name}</span>
                            </button>
                        ))}
                        {/* Scroll arrows */}
                        <div className="flex flex-col gap-px ml-0.5 shrink-0">
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▲</button>
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▼</button>
                        </div>
                    </div>
                </RibbonGroup>
                {/* Efekt Seçenekleri */}
                <div className="flex flex-col items-center border-r border-[#d5d5d5] pr-2 mr-2">
                    <button className="flex flex-col items-center px-3 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors">
                        <Sparkles size={20} className="text-[#444] mb-0.5" />
                        <span className="text-[9px] text-[#444] leading-tight text-center">Efekt<br />Seçenekleri</span>
                    </button>
                </div>
                {/* Zamanlama */}
                <RibbonGroup label="Zamanlama">
                    <div className="flex flex-col gap-[3px]">
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#555] w-7">Ses:</span>
                            <select className="h-[18px] border border-[#bbb] rounded-sm text-[9px] text-[#333] w-[80px] bg-white px-0.5">
                                <option>[Ses Yok]</option>
                                <option>Alkış</option>
                                <option>Kamera</option>
                                <option>Rüzgar</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#555] w-7">Süre:</span>
                            <input type="text" defaultValue="02,00" className="h-[18px] border border-[#bbb] rounded-sm text-[9px] text-[#333] w-[50px] bg-white px-1" />
                        </div>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444] border border-[#bbb] bg-white">
                            <Star size={10} /> Tümüne Uygula
                        </button>
                    </div>
                    <div className="flex flex-col gap-[3px] ml-2">
                        <span className="text-[9px] text-[#555] font-medium">Slaydı İlerlet:</span>
                        <label className="flex items-center gap-1 text-[9px] text-[#555]">
                            <input type="checkbox" defaultChecked className="w-3 h-3 rounded-sm accent-[#4472c4]" />
                            Tıklandığında
                        </label>
                        <label className="flex items-center gap-1 text-[9px] text-[#555]">
                            <input type="checkbox" className="w-3 h-3 rounded-sm accent-[#4472c4]" />
                            Bu kadar saniye sonra:
                            <input type="text" defaultValue="00:00,00" className="h-[16px] border border-[#bbb] rounded-sm text-[8px] text-[#333] w-[52px] bg-white px-0.5" />
                        </label>
                    </div>
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "animasyonlar") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* Önizleme */}
                <RibbonGroup label="Önizleme">
                    <BigBtn icon={Eye} label="Önizleme" />
                </RibbonGroup>
                {/* Animasyon */}
                <RibbonGroup label="Animasyon">
                    <div className="flex gap-[3px] items-center overflow-x-auto max-w-[480px]">
                        {[
                            "Yok", "Yeniden Oy.", "Geri Sar", "Lütrüncü", "Sıvama", "Uçarak Giriş",
                            "İçin Kayar", "Böl", "Süpür", "Sesli", "İstedikle", "Rastgele Çiz.", "Uzat ve Çevir"
                        ].map((name, i) => (
                            <button key={i} className={cn(
                                "w-[50px] h-[42px] rounded-[2px] border-[1.5px] transition-all flex flex-col items-center justify-center shrink-0 bg-white hover:border-[#888] hover:shadow-sm",
                                i === 0 ? "border-[#c43e1c] shadow-sm" : "border-[#bbb]"
                            )}>
                                <div className="w-7 h-5 mb-0.5 rounded-sm bg-[#f0f0f0] border border-[#ddd] flex items-center justify-center">
                                    {i === 0 ? <X size={10} className="text-[#999]" /> :
                                        <Star size={10} className={cn("text-[#999]", i <= 5 ? "text-[#4caf50]" : i <= 9 ? "text-[#ffc000]" : "text-[#c00]")} />}
                                </div>
                                <span className="text-[7px] text-[#555] leading-none truncate w-full text-center px-0.5">{name}</span>
                            </button>
                        ))}
                        <div className="flex flex-col gap-px ml-0.5 shrink-0">
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▲</button>
                            <button className="w-[14px] h-[14px] flex items-center justify-center border border-[#bbb] rounded-sm bg-white hover:bg-[#e0e0e0] text-[8px] text-[#666]">▼</button>
                        </div>
                    </div>
                </RibbonGroup>
                {/* Efekt Seçenekleri */}
                <div className="flex flex-col items-center border-r border-[#d5d5d5] pr-2 mr-2">
                    <button className="flex flex-col items-center px-3 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors">
                        <Sparkles size={20} className="text-[#444] mb-0.5" />
                        <span className="text-[9px] text-[#444] leading-tight text-center">Efekt<br />Seçenekleri</span>
                    </button>
                </div>
                {/* Gelişmiş Animasyon */}
                <RibbonGroup label="Gelişmiş Animasyon">
                    <BigBtn icon={Sparkles} label={"Animasyon\nBelirteci"} />
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Play size={10} /> Tetikleyici <ChevronDown size={8} /></button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Paintbrush size={10} /> Animasyon Boyacısı</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><SlidersHorizontal size={10} /> Geciktirme</button>
                    </div>
                </RibbonGroup>
                {/* Zamanlama */}
                <RibbonGroup label="Zamanlama">
                    <div className="flex flex-col gap-[3px]">
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#555]">Başlangıç:</span>
                            <select className="h-[18px] border border-[#bbb] rounded-sm text-[9px] text-[#333] w-[80px] bg-white px-0.5">
                                <option>Tıklandığında</option>
                                <option>Öncekiyle</option>
                                <option>Öncekinden Sonra</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#555]">Süre:</span>
                            <input type="text" defaultValue="00,50" className="h-[18px] border border-[#bbb] rounded-sm text-[9px] text-[#333] w-[50px] bg-white px-1 ml-[18px]" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#555]">Geciktirme:</span>
                            <input type="text" defaultValue="00,00" className="h-[18px] border border-[#bbb] rounded-sm text-[9px] text-[#333] w-[50px] bg-white px-1" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-[3px] ml-2">
                        <span className="text-[9px] text-[#555] font-medium">Animasyonu Yeniden Sırala</span>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444] border border-[#bbb] bg-white">↑ Daha Erken Taşı</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444] border border-[#bbb] bg-white">↓ Daha Sonraya Taşı</button>
                    </div>
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "slaytgosterisi") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* Slayt Gösterisini Başlat */}
                <RibbonGroup label="Slayt Gösterisini Başlat">
                    <BigBtn icon={Play} label="Baştan" onClick={() => { setCurrentSlideIdx(0); toggleFullscreen(); }} />
                    <BigBtn icon={Monitor} label={"Geçerli\nSlayttan"} onClick={toggleFullscreen} />
                    <BigBtn icon={Presentation} label={"Özel Slayt\nGösterisi"} sub />
                </RibbonGroup>
                {/* Ayarla */}
                <RibbonGroup label="Ayarla">
                    <BigBtn icon={SlidersHorizontal} label={"Slayt Gösterisini\nAyarla"} />
                    <BigBtn icon={Eye} label={"Slaydı\nGizle"} />
                    <BigBtn icon={Play} label={"Zamanlama\nProvası"} />
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Sparkles size={10} /> Açıklamaları Çal</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><SlidersHorizontal size={10} /> Zamanlamaları Kullan</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Film size={10} /> Medya Denetimlerini Göster</button>
                    </div>
                </RibbonGroup>
                {/* Monitörler */}
                <RibbonGroup label="Monitörler">
                    <div className="flex flex-col gap-[3px]">
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#555]">Monitör:</span>
                            <select className="h-[18px] border border-[#bbb] rounded-sm text-[9px] text-[#333] w-[90px] bg-white px-0.5">
                                <option>Otomatik</option>
                                <option>Birincil Monitör</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-1 text-[9px] text-[#555]">
                            <input type="checkbox" defaultChecked className="w-3 h-3 rounded-sm accent-[#4472c4]" />
                            Sunucu Görünümünü Göster
                        </label>
                    </div>
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "gozdengeçir") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* Yazım Denetleme */}
                <RibbonGroup label="Yazım Denetleme">
                    <BigBtn icon={CheckCircle} label={"Yazım\nDenetimi"} />
                    <BigBtn icon={Eye} label={"Erişilebilirlik\nDenetçisi"} />
                </RibbonGroup>
                {/* Görseller */}
                <RibbonGroup label="Görseller">
                    <BigBtn icon={Search} label="Ara" />
                </RibbonGroup>
                {/* Dil */}
                <RibbonGroup label="Dil">
                    <BigBtn icon={FileText} label="Çevir" sub />
                    <BigBtn icon={FileText} label="Dil" sub />
                </RibbonGroup>
                {/* Açıklamalar */}
                <RibbonGroup label="Açıklamalar">
                    <BigBtn icon={MessageSquare} label={"Yeni\nAçıklama"} />
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Trash2 size={10} /> Sil <ChevronDown size={8} /></button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]">← Önceki</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]">→ Sonraki</button>
                    </div>
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Eye size={10} /> Yorumları Göster <ChevronDown size={8} /></button>
                    </div>
                </RibbonGroup>
                {/* Karşılaştır */}
                <RibbonGroup label="Karşılaştır">
                    <BigBtn icon={Copy} label="Karşılaştır" />
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><CheckCircle size={10} /> Kabul</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><X size={10} /> Reddet</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><FileText size={10} /> Gözden Geçirme Bölmesi</button>
                    </div>
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]">← Önceki</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]">→ Sonraki</button>
                    </div>
                </RibbonGroup>
                {/* Mürekkep */}
                <RibbonGroup label="Mürekkep">
                    <BigBtn icon={PenTool} label={"Mürekkep\nGizle"} />
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "kayit") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* Kaydet */}
                <RibbonGroup label="Kaydet">
                    <BigBtn icon={Play} label={"Slayt Gösterisini\nKaydet"} sub />
                    <BigBtn icon={Monitor} label={"Ekran\nGörüntüsü"} sub />
                </RibbonGroup>
                {/* Medya Otomatik Yönet */}
                <RibbonGroup label="Medya Otomatik Yönet">
                    <BigBtn icon={Monitor} label={"Ekran\nKaydı"} />
                    <BigBtn icon={Film} label="Video" sub />
                    <BigBtn icon={Music} label="Ses" sub />
                </RibbonGroup>
                {/* Kaydet */}
                <RibbonGroup label="Kaydet">
                    <BigBtn icon={Download} label={"Güvenli\nOlarak Kaydet"} />
                    <BigBtn icon={Film} label={"Videoya\nAktar"} />
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "yardim") return (
            <div className="flex items-center px-3 py-3 gap-4">
                <RibbonGroup label="Yardım">
                    <BigBtn icon={HelpCircle} label="Yardım" />
                    <BigBtn icon={MessageSquare} label="Geri Bildirim" />
                </RibbonGroup>
            </div>
        );
        if (activeRibbonTab === "gorunum") return (
            <div className="flex items-end px-2 py-1 gap-0">
                {/* Sunum Görünümleri */}
                <RibbonGroup label="Sunum Görünümleri">
                    <BigBtn icon={Monitor} label="Normal" />
                    <BigBtn icon={FileText} label={"Ana Hat\nGörünümü"} />
                    <BigBtn icon={Grid3X3} label={"Slayt\nSıralayıcısı"} />
                    <BigBtn icon={StickyNote} label={"Sayfa\nNotları"} />
                    <BigBtn icon={Eye} label={"Okuma\nGörünümü"} />
                </RibbonGroup>
                {/* Asıl Dığe Görünümleri */}
                <RibbonGroup label="Asıl Dığe Görünümleri">
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Monitor size={10} /> Asıl Slayt</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><FileText size={10} /> Asıl Dağıtım Sayfası</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><StickyNote size={10} /> Asıl Notlar</button>
                    </div>
                </RibbonGroup>
                {/* Göster */}
                <RibbonGroup label="Göster">
                    <div className="flex flex-col gap-[3px]">
                        <label className="flex items-center gap-1 text-[9px] text-[#555]"><input type="checkbox" className="w-3 h-3 accent-[#4472c4]" /> Cetvel</label>
                        <label className="flex items-center gap-1 text-[9px] text-[#555]"><input type="checkbox" className="w-3 h-3 accent-[#4472c4]" /> Kılavuz Çizgileri</label>
                        <label className="flex items-center gap-1 text-[9px] text-[#555]"><input type="checkbox" className="w-3 h-3 accent-[#4472c4]" /> Kılavuzlar</label>
                    </div>
                </RibbonGroup>
                {/* Notlar */}
                <div className="flex flex-col items-center border-r border-[#d5d5d5] pr-2 mr-2">
                    <BigBtn icon={StickyNote} label="Notlar" />
                </div>
                {/* Yakınlaştır */}
                <RibbonGroup label="Yakınlaştır">
                    <BigBtn icon={Search} label="Yakınlaştır" />
                    <BigBtn icon={Maximize} label={"Pencereye\nSığdır"} />
                </RibbonGroup>
                {/* Renk/Gri Tonlamalı */}
                <RibbonGroup label="Renk/Gri Tonlamalı">
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#c43e1c]/10 text-[9px] text-[#444] font-medium"><Palette size={10} className="text-[#c43e1c]" /> Renkli</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Palette size={10} /> Ön Tonlamalı</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Palette size={10} /> Siyah ve Beyaz</button>
                    </div>
                </RibbonGroup>
                {/* Pencere */}
                <RibbonGroup label="Pencere">
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Columns size={10} /> Tümünü Yerleştir</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Monitor size={10} /> Yeni Pencere</button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Columns size={10} /> Basamaklı</button>
                    </div>
                    <div className="flex flex-col gap-px">
                        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Maximize size={10} /> Bölme Sunum Taşı</button>
                    </div>
                </RibbonGroup>
                {/* Makrolar */}
                <RibbonGroup label="Makrolar">
                    <BigBtn icon={FileText} label="Makrolar" />
                </RibbonGroup>
            </div>
        );
        return null;
    };

    // ─── TAB DEFINITIONS ─────────────────────────────────────────────
    const RIBBON_TABS: { id: RibbonTab; label: string }[] = [
        { id: "dosya", label: "Dosya" },
        { id: "giris", label: "Giriş" },
        { id: "ekle", label: "Ekle" },
        { id: "tasarim", label: "Tasarım" },
        { id: "gecisler", label: "Geçişler" },
        { id: "animasyonlar", label: "Animasyonlar" },
        { id: "slaytgosterisi", label: "Slayt Gösterisi" },
        { id: "gozdengeçir", label: "Gözden Geçir" },
        { id: "gorunum", label: "Görünüm" },
        { id: "kayit", label: "Kayıt" },
        { id: "yardim", label: "Yardım" },
    ];

    // ─── BACKSTAGE VIEW ─────────────────────────────────────────────
    const TEMPLATES_PPT = [
        { name: "Boş Sunu", bg: "#ffffff", fg: "#333" },
        { name: "PowerPoint'e Hoş Geldiniz", bg: "#d35400", fg: "#fff" },
        { name: "Madison", bg: "#2c3e50", fg: "#ecf0f1" },
        { name: "Atlas", bg: "#c0392b", fg: "#fff" },
        { name: "Galeri", bg: "#f5f5f5", fg: "#333" },
        { name: "Paket", bg: "#ecf0f1", fg: "#333" },
        { name: "Tahta Yazı", bg: "#2ecc71", fg: "#fff" },
        { name: "Geometrik Renk Bloku", bg: "#e74c3c", fg: "#fff" },
        { name: "Çiçekli Süs", bg: "#8e44ad", fg: "#fff" },
    ];

    if (showDosya) {
        return (
            <div className="flex h-screen font-['Segoe_UI',sans-serif] bg-[#f3f3f3]">
                {/* ── Left Sidebar ── */}
                <div className="w-[220px] bg-[#b33519] flex flex-col shrink-0 select-none">
                    {/* Back arrow */}
                    <button onClick={() => setShowDosya(false)} className="flex items-center gap-2 px-4 py-3 hover:bg-[#9e2f16] text-white">
                        <ArrowLeft size={20} />
                    </button>
                    {/* Menu Items */}
                    {[
                        { label: "Giriş", active: true },
                        { label: "Yeni" },
                        { label: "Aç" },
                        { sep: true },
                        { label: "Bilgi" },
                        { label: "Kaydet", action: () => { exportPptx(); setShowDosya(false); } },
                        { label: "Farklı Kaydet" },
                        { label: "Adobe PDF olarak Kaydet" },
                        { sep: true },
                        { label: "Yazdır" },
                        { label: "Paylaş" },
                        { label: "Adobe PDF bağlantısı olarak paylaşma" },
                        { label: "Dışarı Aktar", action: () => { exportPptx(); setShowDosya(false); } },
                        { label: "Kapat", action: () => { onBack(); } },
                    ].map((item, i) => {
                        if ('sep' in item) return <div key={i} className="h-px bg-white/20 mx-3 my-1" />;
                        return (
                            <button key={i} onClick={item.action || (() => { })}
                                className={cn(
                                    "text-left px-5 py-2 text-[12px] transition-colors",
                                    item.active ? "bg-[#c43e1c] text-white font-semibold" : "text-white/90 hover:bg-[#9e2f16]"
                                )}>
                                {item.label}
                            </button>
                        );
                    })}
                    <div className="flex-1" />
                    {/* Bottom items */}
                    {[
                        { label: "Hesap", color: "text-[#ffda6b]" },
                        { label: "Geri Bildirim", color: "text-[#ffda6b]" },
                        { label: "Seçenekler", color: "text-[#ffda6b]" },
                    ].map((item, i) => (
                        <button key={i} className={cn("text-left px-5 py-2 text-[12px] hover:bg-[#9e2f16]", item.color)}>
                            {item.label}
                        </button>
                    ))}
                </div>
                {/* ── Main Content ── */}
                <div className="flex-1 overflow-y-auto px-10 py-6">
                    <h1 className="text-[28px] font-light text-[#b33519] mb-6">Günaydın</h1>
                    {/* Templates */}
                    <div className="mb-6">
                        <button className="text-[12px] text-[#444] mb-3 flex items-center gap-1"><ChevronDown size={12} /> Yeni</button>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {TEMPLATES_PPT.map((t, i) => (
                                <button key={i} onClick={() => setShowDosya(false)}
                                    className="flex flex-col items-center shrink-0 group">
                                    <div className="w-[120px] h-[68px] rounded-[3px] border-2 border-[#ddd] hover:border-[#c43e1c] transition-all flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md"
                                        style={{ backgroundColor: t.bg }}>
                                        {i === 0 ? <Plus size={24} className="text-[#bbb]" /> :
                                            <span style={{ color: t.fg, fontFamily: "Georgia, serif", fontSize: "14px" }}>{t.name.split(' ')[0]}</span>}
                                    </div>
                                    <span className="text-[10px] text-[#555] mt-1 max-w-[120px] truncate">{t.name}</span>
                                </button>
                            ))}
                        </div>
                        <button className="text-[11px] text-[#c43e1c] mt-2 flex items-center gap-1 hover:underline">Diğer temalar →</button>
                    </div>
                    {/* Recent Files */}
                    <div>
                        <div className="flex gap-4 mb-3 border-b border-[#ddd]">
                            <button className="text-[12px] text-[#333] font-semibold pb-2 border-b-2 border-[#c43e1c]">Son kullanılanlar</button>
                            <button className="text-[12px] text-[#888] pb-2 hover:text-[#555]">Sabitlenmiş</button>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center px-2 py-1 text-[10px] text-[#999] border-b border-[#eee]">
                                <span className="flex-1">Ad</span>
                                <span className="w-[100px] text-right">Değiştirme tarihi</span>
                            </div>
                            {[
                                { name: "sunum.pptx", loc: "Masaüstü", date: "Bugün" },
                                { name: "proje_sunumu.pptx", loc: "Belgeler", date: "Dün" },
                                { name: "ders_notları.pptx", loc: "İndirilenler", date: "2 gün önce" },
                                { name: "toplantı_sunum.pptx", loc: "OneDrive", date: "1 hafta önce" },
                                { name: "rapor.pptx", loc: "Masaüstü", date: "15.02.2025" },
                            ].map((f, i) => (
                                <button key={i} onClick={() => setShowDosya(false)}
                                    className="flex items-center gap-3 px-2 py-2.5 hover:bg-[#e8e8e8] rounded transition-colors group">
                                    <Presentation size={18} className="text-[#c43e1c] shrink-0" />
                                    <div className="flex-1 text-left">
                                        <p className="text-[12px] text-[#333] group-hover:text-[#b33519]">{f.name}</p>
                                        <p className="text-[10px] text-[#999]">{f.loc}</p>
                                    </div>
                                    <span className="text-[10px] text-[#999] w-[100px] text-right">{f.date}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#e6e6e6] text-[#333] font-['Segoe_UI',sans-serif]">
            {/* ═══ Title Bar ═══ */}
            <div className="h-[30px] bg-[#c43e1c] flex items-center px-2 z-[100] shrink-0 select-none">
                {/* Quick Access Toolbar */}
                <div className="flex items-center gap-0.5">
                    <button onClick={onBack} className="p-1 hover:bg-white/20 rounded text-white" title="Geri"><ArrowLeft size={14} /></button>
                    <button onClick={exportPptx} className="p-1 hover:bg-white/20 rounded text-white" title="Kaydet"><Download size={14} /></button>
                    <button onClick={undo} disabled={!history.length} className="p-1 hover:bg-white/20 rounded text-white disabled:opacity-30" title="Geri Al"><Undo size={14} /></button>
                    <button onClick={redo} disabled={!redoStack.length} className="p-1 hover:bg-white/20 rounded text-white disabled:opacity-30" title="Yinele"><Redo size={14} /></button>
                </div>
                {/* Title */}
                <div className="flex-1 flex justify-center">
                    <span className="text-[11px] text-white font-semibold">{fileName} - PowerPoint</span>
                </div>
                {/* Search */}
                <div className="flex items-center bg-[#d95a3a] rounded-sm px-2 py-0.5 mr-2">
                    <Search size={12} className="text-white/70 mr-1" />
                    <span className="text-[10px] text-white/70">Ara</span>
                </div>
            </div>

            {/* ═══ Ribbon Tabs ═══ */}
            <div className="bg-[#f3f3f3] border-b border-[#d5d5d5] shrink-0">
                <div className="flex items-center h-[28px] px-1 gap-0">
                    {RIBBON_TABS.map(tab => (
                        <button key={tab.id}
                            onClick={() => { if (tab.id === "dosya") { setShowDosya(true); return; } setActiveRibbonTab(tab.id); }}
                            className={cn(
                                "px-3 py-1 text-[11px] font-medium transition-colors rounded-t-sm relative",
                                tab.id === "dosya" ? "bg-[#c43e1c] text-white hover:bg-[#b33516]" :
                                    activeRibbonTab === tab.id ? "bg-white text-[#333] border-t-2 border-x border-[#d5d5d5] border-t-[#c43e1c] -mb-px z-10" :
                                        "text-[#555] hover:bg-[#e0e0e0]"
                            )}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ Ribbon Content ═══ */}
            <div className="bg-white border-b border-[#d5d5d5] min-h-[72px] shrink-0">
                {renderRibbon()}
            </div>

            {/* ═══ Main Area ═══ */}
            <div className="flex flex-1 overflow-hidden">
                {/* Slide Panel */}
                <div className="w-[140px] bg-[#f3f3f3] border-r border-[#d5d5d5] overflow-y-auto py-2 px-2 shrink-0">
                    {slides.map((slide, i) => (
                        <div key={slide.id} onClick={() => { setCurrentSlideIdx(i); setSelectedElId(null); setEditingTextId(null); }}
                            className="mb-1.5 cursor-pointer group">
                            <div className="flex items-start gap-1">
                                <span className="text-[9px] text-[#888] font-medium mt-1 w-3 text-right shrink-0">{i + 1}</span>
                                <div className={cn("relative w-full aspect-video rounded-[2px] overflow-hidden border-2 transition-all",
                                    i === currentSlideIdx ? "border-[#c43e1c] shadow-sm" : "border-[#ccc] hover:border-[#999]"
                                )}>
                                    <div className="w-full h-full" style={{ background: slide.background }}>
                                        <div className="relative w-full h-full" style={{ fontSize: "2.5px" }}>
                                            {slide.elements.map(el => (
                                                <div key={el.id} className="absolute overflow-hidden" style={{
                                                    left: `${el.x / CANVAS_W * 100}%`, top: `${el.y / CANVAS_H * 100}%`,
                                                    width: `${el.width / CANVAS_W * 100}%`, height: `${el.height / CANVAS_H * 100}%`,
                                                }}>
                                                    {el.type === "text" && <div className="leading-tight truncate" style={{ color: el.color, fontSize: "inherit" }}>{el.content}</div>}
                                                    {el.type === "image" && el.imageData && <img src={el.imageData} className="w-full h-full object-cover" alt="" />}
                                                    {el.type === "shape" && <div className="w-full h-full" style={{ backgroundColor: el.backgroundColor, borderRadius: el.shapeType === "circle" ? "50%" : 1 }} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {slides.length > 1 && (
                                        <button onClick={e => { e.stopPropagation(); setCurrentSlideIdx(i); setTimeout(deleteSlide, 0); }}
                                            className="absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"><X size={8} /></button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto flex items-center justify-center bg-[#b5b5b5] p-6">
                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center", transition: "transform 0.15s" }}>
                        <div ref={canvasRef} className="relative shadow-[0_2px_8px_rgba(0,0,0,0.3)] select-none"
                            style={{ width: CANVAS_W, height: CANVAS_H, background: currentSlide.background, cursor: isDragging ? "grabbing" : "default" }}
                            onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} onMouseLeave={handleCanvasMouseUp}>

                            {currentSlide.elements.map(el => (
                                <div key={el.id}
                                    className={cn("absolute", selectedElId === el.id && "outline outline-2 outline-[#4472c4]")}
                                    style={{ left: el.x, top: el.y, width: el.width, height: el.height, zIndex: selectedElId === el.id ? 50 : 1, border: el.isPlaceholder ? `1px dashed ${el.borderColor || "#a0a0a0"}` : "none" }}>

                                    {el.type === "image" && el.imageData && <img src={el.imageData} className="w-full h-full object-contain pointer-events-none" alt="" draggable={false} />}
                                    {el.type === "shape" && renderShape(el)}

                                    {(el.type === "text" || el.type === "shape") && (
                                        editingTextId === el.id ? (
                                            <textarea value={el.content}
                                                onChange={e2 => { const v = e2.target.value; setSlides(p => p.map((s, i) => i !== currentSlideIdx ? s : { ...s, elements: s.elements.map(e3 => e3.id === el.id ? { ...e3, content: v } : e3) })); }}
                                                onBlur={() => { setEditingTextId(null); setHistory(p => [...p.slice(-29), [...p.slice(-1)[0].slice(0, currentSlideIdx), slides[currentSlideIdx], ...p.slice(-1)[0].slice(currentSlideIdx + 1)]]); }} 
                                                autoFocus
                                                onMouseDown={e => e.stopPropagation()}
                                                className="absolute inset-0 w-full h-full bg-transparent outline-none resize-none p-2 select-text"
                                                style={{ fontSize: el.fontSize || 24, fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: el.textDecoration, textAlign: el.textAlign as any || (el.type === "shape" ? "center" : "left"), color: el.color || (el.type === "shape" ? "#ffffff" : "#333333"), fontFamily: el.fontFamily || "Calibri, sans-serif" }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 w-full h-full overflow-hidden whitespace-pre-wrap p-2 cursor-text flex items-center"
                                                style={{ fontSize: el.fontSize || 24, fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: el.textDecoration, textAlign: el.textAlign as any || (el.type === "shape" ? "center" : "left"), color: el.isPlaceholder ? "#888" : (el.color || (el.type === "shape" ? "#ffffff" : "#333333")), fontFamily: el.fontFamily || "Calibri, sans-serif", justifyContent: (el.textAlign || (el.type === "shape" ? "center" : "left")) === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start" }}
                                                onDoubleClick={() => { setEditingTextId(el.id); setSelectedElId(el.id); setIsDragging(false); }}
                                                onMouseDown={(e) => {
                                                    if (el.isPlaceholder) {
                                                        // Handled by canvas mousedown
                                                    } else if (editingTextId === el.id) {
                                                        e.stopPropagation();
                                                    }
                                                }}>
                                                {el.content}
                                            </div>
                                        )
                                    )}
                                    {selectedElId === el.id && (
                                        <>
                                            {/* Corner handles */}
                                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-nw-resize" />
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-ne-resize" />
                                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-sw-resize" />
                                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-se-resize" />
                                            {/* Edge handles */}
                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-n-resize" />
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-s-resize" />
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-w-resize" />
                                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-[#4472c4] rounded-full cursor-e-resize" />
                                            {/* Rotation handle */}
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-[#4472c4] rounded-full cursor-pointer" />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Status Bar ═══ */}
            <div className="h-[24px] bg-[#f0f0f0] border-t border-[#d5d5d5] px-3 flex items-center justify-between text-[10px] text-[#666] shrink-0 select-none">
                <div className="flex items-center gap-4">
                    <span>Slayt {currentSlideIdx + 1} / {slides.length}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="hover:bg-[#ddd] p-0.5 rounded text-[10px]">📝 Notlar</button>
                    <button className="hover:bg-[#ddd] p-0.5 rounded text-[10px]">💬 Açıklamalar</button>
                    <div className="flex items-center gap-1 border-l border-[#ccc] pl-3 ml-1">
                        <button className={cn("p-0.5 rounded", "bg-[#ddd]")}><Monitor size={12} /></button>
                        <button className="p-0.5 rounded hover:bg-[#ddd]"><Grid3X3 size={12} /></button>
                        <button className="p-0.5 rounded hover:bg-[#ddd]"><SlidersHorizontal size={12} /></button>
                    </div>
                    <div className="flex items-center gap-1 border-l border-[#ccc] pl-3 ml-1">
                        <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="hover:bg-[#ddd] p-0.5 rounded"><Minus size={11} /></button>
                        <input type="range" min={25} max={200} value={zoom} onChange={e => setZoom(Number(e.target.value))}
                            className="w-20 h-1 appearance-none bg-[#ccc] rounded cursor-pointer accent-[#666]" />
                        <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="hover:bg-[#ddd] p-0.5 rounded"><Plus size={11} /></button>
                        <span className="text-[10px] w-8 text-center">{zoom}%</span>
                    </div>
                </div>
            </div>

            {/* Hidden inputs */}
            <input ref={fileInputRef} type="file" accept=".pptx" className="hidden" onChange={handleFileOpen} />
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            
            {/* Fullscreen Presentation Mode */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer select-none"
                    onClick={() => {
                        if (currentSlideIdx < slides.length - 1) setCurrentSlideIdx(currentSlideIdx + 1);
                        else {
                            if (document.fullscreenElement) document.exitFullscreen().catch(err => console.error(err));
                            setIsFullscreen(false);
                        }
                    }}
                >
                    <div className="relative bg-white" style={{ 
                        width: CANVAS_W, height: CANVAS_H, background: currentSlide.background,
                        transform: `scale(min(100vw / ${CANVAS_W}, 100vh / ${CANVAS_H}))`,
                        transformOrigin: "center center"
                    }}>
                        {currentSlide.elements.map(el => (
                            <div key={el.id} className="absolute overflow-hidden" style={{
                                left: el.x, top: el.y, width: el.width, height: el.height,
                            }}>
                                {el.type === "text" && <div className="leading-tight p-2 flex items-center w-full h-full" style={{ 
                                    color: el.isPlaceholder ? "transparent" : el.color, 
                                    fontSize: el.fontSize || 24, 
                                    fontWeight: el.fontWeight, fontStyle: el.fontStyle, 
                                    textDecoration: el.textDecoration, textAlign: el.textAlign as any,
                                    fontFamily: el.fontFamily || "Calibri, sans-serif",
                                    justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {el.isPlaceholder ? "" : el.content}
                                </div>}
                                {el.type === "image" && el.imageData && <img src={el.imageData} className="w-full h-full object-contain pointer-events-none" alt="" draggable={false} />}
                                {el.type === "shape" && renderShape(el)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
