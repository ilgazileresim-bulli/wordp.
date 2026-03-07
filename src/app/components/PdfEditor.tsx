"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    FileText,
    ArrowLeft,
    Download,
    Upload,
    Layers,
    MousePointer2,
    Type,
    Highlighter,
    Eraser,
    Signature,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Settings,
    Search,
    Printer,
    Share2,
    Eye,
    X,
    Check,
    Undo,
    Redo,
    Trash2,
    Maximize,
    Stamp,
    Square,
    Circle,
    Minus,
    ArrowRight,
    RotateCw,
    StickyNote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import ThemeToggle from "./ThemeToggle";

// Set up the worker for pdfjs-dist inside functions for reliability

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Annotation {
    id: string;
    type: "draw" | "highlight" | "text" | "sign" | "stamp" | "shape" | "note";
    points: { x: number; y: number }[];
    x?: number;
    y?: number;
    text?: string;
    signatureData?: string;
    color: string;
    width: number;
    fontSize?: number;
    page: number;
    shapeType?: "rect" | "circle" | "line" | "arrow";
    w?: number;
    h?: number;
}

const STAMP_PRESETS = [
    { label: "ONAYLANDI", color: "#16a34a" },
    { label: "REDDEDİLDİ", color: "#dc2626" },
    { label: "TASLAK", color: "#d97706" },
    { label: "GİZLİ", color: "#7c3aed" },
    { label: "ACİL", color: "#e11d48" },
    { label: "KOPYA", color: "#6b7280" },
];

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

interface PdfEditorProps {
    onBack: () => void;
    initialFile?: File;
}

export default function PdfEditor({ onBack, initialFile }: PdfEditorProps) {
    const [zoom, setZoom] = useState(125);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [fileName, setFileName] = useState("Dosya Seçilmedi");
    const [activeTool, setActiveTool] = useState("select");
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pageRatio, setPageRatio] = useState(1.414); // A4 default
    const [isLoading, setIsLoading] = useState(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [history, setHistory] = useState<Annotation[][]>([]);
    const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const pdfBytesRef = useRef<Uint8Array | null>(null);

    const saveToHistory = (newAnnotations: Annotation[]) => {
        setHistory(prev => [...prev.slice(-19), annotations]); // Keep last 20 steps
        setRedoStack([]);
        setAnnotations(newAnnotations);
    };

    const undo = () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        setRedoStack(prev => [annotations, ...prev]);
        setHistory(prev => prev.slice(0, -1));
        setAnnotations(last);
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[0];
        setHistory(prev => [...prev, annotations]);
        setRedoStack(prev => prev.slice(1));
        setAnnotations(next);
    };

    const clearAll = () => {
        if (confirm("Tüm düzenlemeleri temizlemek istediğinize emin misiniz?")) {
            saveToHistory([]);
            setSelectedId(null);
            setIsEditingText(false);
        }
    };

    const deleteSelected = () => {
        if (selectedId) {
            saveToHistory(annotations.filter(a => a.id !== selectedId));
            setSelectedId(null);
            setIsEditingText(false);
        }
    };
    const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isEditingText, setIsEditingText] = useState(false);
    const [isRenderingPdf, setIsRenderingPdf] = useState(false);
    const [activeTab, setActiveTab] = useState("giriş");
    const [brushThickness, setBrushThickness] = useState(4);
    const [brushColor, setBrushColor] = useState("#000000");
    const [showStampMenu, setShowStampMenu] = useState(false);
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const [activeShape, setActiveShape] = useState<"rect" | "circle" | "line" | "arrow">("rect");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cachedPageCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const signatureImageCache = useRef<Record<string, HTMLImageElement>>({});
    const renderTaskRef = useRef<any>(null);

    const tools = [
        { id: "select", icon: MousePointer2, label: "Seç" },
        { id: "draw", icon: Pencil, label: "Çiz" },
        { id: "text", icon: Type, label: "Metin Ekle" },
        { id: "highlight", icon: Highlighter, label: "Vurgula" },
        { id: "erase", icon: Eraser, label: "Sil" },
        { id: "sign", icon: Signature, label: "İmzala" },
        { id: "stamp", icon: Stamp, label: "Damga" },
        { id: "shape", icon: Square, label: "Şekil" },
        { id: "note", icon: StickyNote, label: "Not" },
    ];

    const addStamp = (label: string, color: string) => {
        const newAnnotation: Annotation = {
            id: Math.random().toString(36).substr(2, 9),
            type: "stamp",
            points: [],
            x: 0.3,
            y: 0.5,
            text: label,
            color,
            width: 3,
            fontSize: 36,
            page: currentPage,
        };
        saveToHistory([...annotations, newAnnotation]);
        setShowStampMenu(false);
    };

    const addNote = () => {
        const noteText = prompt("Not metnini girin:");
        if (noteText) {
            const newAnnotation: Annotation = {
                id: Math.random().toString(36).substr(2, 9),
                type: "note",
                points: [],
                x: 0.1,
                y: 0.1,
                text: noteText,
                color: "#fef08a",
                width: 1,
                fontSize: 12,
                page: currentPage,
            };
            saveToHistory([...annotations, newAnnotation]);
        }
    };

    const rotatePage = async () => {
        if (!pdfBytesRef.current) return;
        try {
            const pdfDocToEdit = await PDFDocument.load(pdfBytesRef.current);
            const page = pdfDocToEdit.getPage(currentPage - 1);
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + 90));
            const newBytes = await pdfDocToEdit.save();
            pdfBytesRef.current = new Uint8Array(newBytes);

            // Reload the PDF
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(newBytes.slice(0)) });
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
        } catch (error) {
            console.error("Rotation error:", error);
            alert("Sayfa döndürülürken bir hata oluştu.");
        }
    };

    const processPdfFile = async (file: File) => {
        if (!file || file.type !== "application/pdf") {
            alert("Lütfen geçerli bir PDF dosyası seçin.");
            return;
        }

        const pdfjsLib = await import("pdfjs-dist");
        // Set worker source right before use
        pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";

        setIsLoading(true);
        setFileName(file.name);
        setAnnotations([]); // Clear old annotations

        try {
            console.log("PDF: Processing file:", file.name, "Size:", file.size);
            const arrayBuffer = await file.arrayBuffer();

            // Create separate copies to avoid detachment issues
            const bytesForSaving = new Uint8Array(arrayBuffer.slice(0));
            const bytesForLoading = new Uint8Array(arrayBuffer.slice(0));

            if (bytesForSaving.length === 0) throw new Error("Dosya boş görünüyor.");

            console.log("PDF: Byte array length:", bytesForSaving.length);
            pdfBytesRef.current = bytesForSaving;

            const loadingTask = pdfjsLib.getDocument({
                data: bytesForLoading,
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
                cMapPacked: true,
            });

            const pdf = await loadingTask.promise;
            console.log("PDF Loaded successfully:", pdf.numPages, "pages");

            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
        } catch (error) {
            console.error("PDF loading error:", error);
            alert("PDF dosyası yüklenirken bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        renderPdfToCache();
    }, [pdfDoc, currentPage, zoom]);

    useEffect(() => {
        redrawCanvas();
    }, [annotations, isDrawing, currentStroke, selectedId, currentPage]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processPdfFile(file);
        }
    };

    useEffect(() => {
        if (initialFile) {
            processPdfFile(initialFile);
        }
    }, [initialFile]);

    const handleSave = async () => {
        const bytes = pdfBytesRef.current;
        if (!bytes || bytes.length === 0) {
            alert("Belge verisi bulunamadı. Lütfen PDF dosyasını tekrar yüklemeyi deneyin.");
            return;
        }

        // Validate PDF header (must start with %PDF-)
        const header = String.fromCharCode(...bytes.slice(0, 5));
        if (header !== "%PDF-") {
            console.error("Geçersiz PDF başlığı:", header);
            alert("PDF dosyası bozulmuş olabilir. Lütfen sayfayı yenileyip tekrar deneyin.");
            return;
        }

        try {
            const pdfDocToSave = await PDFDocument.load(bytes);
            const font = await pdfDocToSave.embedFont(StandardFonts.Helvetica);
            const pages = pdfDocToSave.getPages();

            // Add watermark to all pages or just first
            pages.forEach(page => {
                const { height } = page.getSize();
                page.drawText('Word P. ile düzenlendi', {
                    x: 50,
                    y: height - 30,
                    size: 10,
                    font: font,
                    color: rgb(0.1, 0.1, 0.6),
                });
            });

            const modifiedPdfBytes = await pdfDocToSave.save();
            const blob = new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF save error:", error);
            alert("PDF kaydedilirken bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
        }
    };

    const renderPdfToCache = useCallback(async () => {
        if (!pdfDoc) return;

        // If already rendering, don't start another one on the same canvas
        if (isRenderingPdf) {
            console.log("PDF: Render already in progress, skipping.");
            return;
        }

        setIsRenderingPdf(true);
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";

        // Cancel previous task if any
        if (renderTaskRef.current) {
            try {
                await renderTaskRef.current.cancel();
            } catch (e) { }
        }

        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale: 2.0 });

            if (!cachedPageCanvasRef.current) {
                cachedPageCanvasRef.current = document.createElement('canvas');
            }
            const cacheCanvas = cachedPageCanvasRef.current;
            cacheCanvas.width = viewport.width;
            cacheCanvas.height = viewport.height;
            const cacheContext = cacheCanvas.getContext('2d', { alpha: false }); // Optimization

            if (cacheContext) {
                setPageRatio(viewport.height / viewport.width);
                const renderContext = {
                    canvasContext: cacheContext,
                    viewport: viewport,
                    intent: 'display'
                };

                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;
                await renderTask.promise;
                console.log("CACHE: PDF render complete.");
                redrawCanvas();
            }
        } catch (error: any) {
            if (error.name !== 'RenderingCancelledException') {
                console.error("CACHE: Render error", error);
            }
        } finally {
            setIsRenderingPdf(false);
            renderTaskRef.current = null;
        }
    }, [pdfDoc, currentPage, zoom, isRenderingPdf]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const cacheCanvas = cachedPageCanvasRef.current;
        if (!canvas || !cacheCanvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Sync dimensions with cache
        if (canvas.width !== cacheCanvas.width || canvas.height !== cacheCanvas.height) {
            canvas.width = cacheCanvas.width;
            canvas.height = cacheCanvas.height;
        }

        // Clear and draw background from cache
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(cacheCanvas, 0, 0);

        const viewport_width = canvas.width;
        const viewport_height = canvas.height;

        // 2. Render Annotations
        const drawAnnotation = (ann: Annotation | { points: { x: number; y: number }[], type: string, color: string, width: number, text?: string, x?: number, y?: number, fontSize?: number, signatureData?: string }) => {
            if (ann.type === "sign" && ann.signatureData) {
                if (ann.x === undefined || ann.y === undefined) return;
                let img = signatureImageCache.current[ann.signatureData];
                if (!img) {
                    img = new Image();
                    img.src = ann.signatureData;
                    signatureImageCache.current[ann.signatureData] = img;
                    img.onload = () => redrawCanvas();
                }
                const signWidth = 150 * (viewport_width / 1000);
                const signHeight = 80 * (viewport_width / 1000);
                context.drawImage(img, ann.x * viewport_width, ann.y * viewport_height, signWidth, signHeight);

                if (selectedId && (ann as Annotation).id === selectedId) {
                    context.strokeStyle = "#f97316";
                    context.lineWidth = 1;
                    context.strokeRect(ann.x * viewport_width - 5, ann.y * viewport_height - 5, signWidth + 10, signHeight + 10);
                }
                return;
            }

            if (ann.type === "stamp") {
                if (!ann.text || ann.x === undefined || ann.y === undefined) return;
                const scale = viewport_width / 500;
                const fontSize = (ann.fontSize || 36) * scale;
                context.font = `bold ${fontSize}px Arial`;
                const metrics = context.measureText(ann.text);
                const px = ann.x * viewport_width;
                const py = ann.y * viewport_height;
                const padding = 10 * scale;

                // Draw stamp border and background
                context.save();
                context.translate(px + metrics.width / 2, py - fontSize / 2);
                context.rotate(-0.15); // slight tilt
                context.strokeStyle = ann.color;
                context.lineWidth = 3 * scale;
                context.globalAlpha = 0.85;
                context.strokeRect(-metrics.width / 2 - padding, -fontSize / 2 - padding, metrics.width + padding * 2, fontSize + padding * 2);
                context.fillStyle = ann.color;
                context.globalAlpha = 0.15;
                context.fillRect(-metrics.width / 2 - padding, -fontSize / 2 - padding, metrics.width + padding * 2, fontSize + padding * 2);
                context.globalAlpha = 0.85;
                context.fillStyle = ann.color;
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(ann.text, 0, 0);
                context.restore();
                context.globalAlpha = 1.0;

                if (selectedId && (ann as Annotation).id === selectedId) {
                    context.strokeStyle = "#f97316";
                    context.lineWidth = 1;
                    context.strokeRect(px - padding - 5, py - fontSize - padding - 5, metrics.width + padding * 2 + 10, fontSize + padding * 2 + 10);
                }
                return;
            }

            if (ann.type === "note") {
                if (!ann.text || ann.x === undefined || ann.y === undefined) return;
                const scale = viewport_width / 500;
                const fontSize = (ann.fontSize || 12) * scale;
                const px = ann.x * viewport_width;
                const py = ann.y * viewport_height;
                const maxWidth = 150 * scale;
                const padding = 8 * scale;

                context.font = `${fontSize}px Arial`;
                // Word wrap
                const words = ann.text.split(' ');
                const lines: string[] = [];
                let currentLine = '';
                words.forEach(word => {
                    const testLine = currentLine ? currentLine + ' ' + word : word;
                    if (context.measureText(testLine).width > maxWidth - padding * 2) {
                        if (currentLine) lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) lines.push(currentLine);

                const noteHeight = lines.length * fontSize * 1.3 + padding * 2;

                // Draw note background
                context.fillStyle = ann.color || "#fef08a";
                context.globalAlpha = 0.95;
                context.fillRect(px, py, maxWidth, noteHeight);
                context.strokeStyle = "#ca8a04";
                context.lineWidth = 1;
                context.strokeRect(px, py, maxWidth, noteHeight);

                // Draw note header
                context.fillStyle = "#ca8a04";
                context.fillRect(px, py, maxWidth, 3 * scale);

                // Draw text
                context.globalAlpha = 1.0;
                context.fillStyle = "#1a1a1a";
                lines.forEach((line, i) => {
                    context.fillText(line, px + padding, py + padding + fontSize + i * fontSize * 1.3);
                });

                if (selectedId && (ann as Annotation).id === selectedId) {
                    context.strokeStyle = "#f97316";
                    context.lineWidth = 2;
                    context.strokeRect(px - 3, py - 3, maxWidth + 6, noteHeight + 6);
                }
                return;
            }

            if (ann.type === "text") {
                if (!ann.text || ann.x === undefined || ann.y === undefined) return;
                context.font = `${(ann.fontSize || 16) * (viewport_width / 500)}px Arial`;
                context.fillStyle = ann.color;
                context.fillText(ann.text, ann.x * viewport_width, ann.y * viewport_height);

                if (selectedId && (ann as Annotation).id === selectedId) {
                    context.strokeStyle = "#f97316";
                    context.lineWidth = 1;
                    const metrics = context.measureText(ann.text);
                    const padding = 5;
                    context.strokeRect(
                        ann.x * viewport_width - padding,
                        ann.y * viewport_height - (ann.fontSize || 16) * (viewport_width / 500),
                        metrics.width + padding * 2,
                        (ann.fontSize || 16) * (viewport_width / 500) + padding
                    );
                }
                return;
            }

            if (ann.points.length < 2) return;

            context.beginPath();
            context.moveTo(ann.points[0].x * viewport_width, ann.points[0].y * viewport_height);

            ann.points.forEach(p => {
                context.lineTo(p.x * viewport_width, p.y * viewport_height);
            });

            context.strokeStyle = ann.color;
            context.lineWidth = ann.width * (viewport_width / 500);
            context.lineCap = "round";
            context.lineJoin = "round";

            if (ann.type === "highlight") {
                context.globalAlpha = 0.4;
                context.lineWidth = 15 * (viewport_width / 500);
            } else {
                context.globalAlpha = 1.0;
            }

            context.stroke();
            context.globalAlpha = 1.0;
        };

        // Draw past annotations
        annotations.filter(a => a.page === currentPage).forEach(drawAnnotation);

        // Draw current stroke
        if (isDrawing && currentStroke.length > 0) {
            drawAnnotation({
                points: currentStroke,
                type: activeTool === "highlight" ? "highlight" : "draw",
                color: activeTool === "highlight" ? "#eab308" : "#000000",
                width: 2
            });
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Helper to find if we clicked on an annotation
        const findClickedAnnotation = () => {
            return [...annotations].reverse().find(ann => {
                if (ann.page !== currentPage) return false;
                if (ann.type === "text") {
                    if (ann.x === undefined || ann.y === undefined) return false;
                    const fontSize = (ann.fontSize || 16) / 500;
                    const widthLimit = 0.2; // roughly 20% of canvas width
                    return x >= ann.x - 0.02 && x <= ann.x + widthLimit && y >= ann.y - fontSize && y <= ann.y + 0.02;
                }
                return ann.points.some(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 0.02);
            });
        };

        if (activeTool === "select") {
            const clickedAnn = findClickedAnnotation();
            if (clickedAnn) {
                setSelectedId(clickedAnn.id);
                if (clickedAnn.type === "text") {
                    setIsEditingText(true);
                }
            } else {
                setSelectedId(null);
                setIsEditingText(false);
            }
            return;
        }

        if (activeTool === "text") {
            const existingText = findClickedAnnotation();
            if (existingText && existingText.type === "text") {
                setSelectedId(existingText.id);
                setIsEditingText(true);
                return;
            }

            const newId = Math.random().toString(36).substr(2, 9);
            const newAnn: Annotation = {
                id: newId,
                type: "text",
                points: [],
                x: x,
                y: y,
                text: "", // Start with empty text to allow immediate typing
                color: "#000000",
                width: 2,
                fontSize: 20,
                page: currentPage
            };
            saveToHistory([...annotations, newAnn]);
            setSelectedId(newId);
            setIsEditingText(true);
            return;
        }

        if (activeTool === "sign") {
            if (!savedSignature) {
                setIsSignModalOpen(true);
                return;
            }
            const newId = Math.random().toString(36).substr(2, 9);
            const newAnn: Annotation = {
                id: newId,
                type: "sign",
                points: [],
                x: x - 0.05, // center it a bit
                y: y - 0.05,
                signatureData: savedSignature,
                color: "#000000",
                width: 2,
                page: currentPage
            };
            saveToHistory([...annotations, newAnn]);
            setSelectedId(newId);
            setActiveTool("select"); // Switch to select so they can move it
            return;
        }

        if (activeTool === "erase") {
            const newAnns = annotations.filter(ann => {
                if (ann.page !== currentPage) return true;
                if (ann.type === "sign") {
                    if (ann.x === undefined || ann.y === undefined) return true;
                    return !(x >= ann.x - 0.05 && x <= ann.x + 0.15 && y >= ann.y - 0.05 && y <= ann.y + 0.05);
                }
                if (ann.type === "text") {
                    if (!ann.text || ann.x === undefined || ann.y === undefined) return true;
                    const fontSize = (ann.fontSize || 16) / 500;
                    const isHit = x >= ann.x - 0.05 && x <= ann.x + 0.15 && y >= ann.y - fontSize && y <= ann.y + 0.02;
                    return !isHit;
                }
                return !ann.points.some(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 0.02);
            });
            if (newAnns.length !== annotations.length) {
                saveToHistory(newAnns);
            }
            redrawCanvas(); // Ensure canvas updates immediately when erased
            return;
        }

        setIsDrawing(true);
        setCurrentStroke([{ x, y }]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        if (activeTool === "select" && selectedId && e.buttons === 1) {
            setAnnotations(prev => prev.map(ann => {
                if (ann.id === selectedId) {
                    if (ann.type === "text" || ann.type === "sign") {
                        return { ...ann, x, y };
                    }
                }
                return ann;
            }));
            return;
        }

        if (!isDrawing) return;

        if (activeTool === "erase") {
            setAnnotations(prev => prev.filter(ann => {
                if (ann.page !== currentPage) return true;
                if (ann.type === "text") {
                    if (!ann.text || ann.x === undefined || ann.y === undefined) return true;
                    const fontSize = (ann.fontSize || 16) / 500;
                    return !(x >= ann.x - 0.05 && x <= ann.x + 0.15 && y >= ann.y - fontSize && y <= ann.y + 0.02);
                }
                return !ann.points.some(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 0.02);
            }));
            redrawCanvas(); // Immediate feedback for erasing
            return;
        }

        if (activeTool === "draw" || activeTool === "highlight") {
            setCurrentStroke(prev => [...prev, { x, y }]);
            redrawCanvas();
            return;
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;

        if (currentStroke.length > 1) {
            const newAnnotation: Annotation = {
                id: Math.random().toString(36).substr(2, 9),
                type: activeTool === "highlight" ? "highlight" : "draw",
                points: currentStroke,
                color: activeTool === "highlight" ? "#eab308" : brushColor,
                width: brushThickness,
                page: currentPage
            };
            saveToHistory([...annotations, newAnnotation]);
        }

        setIsDrawing(false);
        setCurrentStroke([]);
        redrawCanvas(); // Final redraw after mouse up
    };

    useEffect(() => {
        if (pdfDoc) {
            redrawCanvas();
        }
    }, [currentPage, zoom, pdfDoc, annotations, selectedId]);

    const selectedAnnotation = annotations.find(a => a.id === selectedId);

    return (
        <div className="flex flex-col h-screen bg-[#e6e6e6] text-zinc-800 font-sans selection:bg-blue-500/30">
            {/* Word Header (Blue) */}
            <div className="h-10 bg-[#2b579a] flex items-center px-4 z-[100] no-print shrink-0 border-b border-[#1a478a]">
                {/* Quick Access Toolbar */}
                <div className="flex items-center gap-1 min-w-[300px]">
                    <button onClick={onBack} className="p-1.5 hover:bg-[#3b67aa] rounded text-white transition-colors" title="Geri"><ArrowLeft size={16} strokeWidth={3} /></button>
                    <button onClick={handleSave} className="p-1.5 hover:bg-[#3b67aa] rounded text-white transition-colors flex items-center gap-1 group" title="PDF İndir (Kaydet)">
                        <Download size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">PDF İndir</span>
                    </button>
                    <button className="p-1.5 hover:bg-[#3b67aa] rounded text-white/50 transition-colors flex items-center gap-1 cursor-not-allowed" title="Word Desteği Yakında">
                        <FileText size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">DOCX</span>
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button onClick={undo} disabled={history.length === 0} className="p-1.5 hover:bg-[#3b67aa] rounded text-white transition-colors disabled:opacity-30" title="Geri Al"><Undo size={16} strokeWidth={3} /></button>
                    <button onClick={redo} disabled={redoStack.length === 0} className="p-1.5 hover:bg-[#3b67aa] rounded text-white transition-colors disabled:opacity-30" title="İleri Al"><Redo size={16} strokeWidth={3} /></button>
                </div>

                {/* Centered Filename */}
                <div className="flex-1 flex justify-center overflow-hidden h-full">
                    <div className="flex items-center gap-2 text-white text-[11px] font-black truncate py-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        <FileText size={16} className="!text-white" strokeWidth={2.5} />
                        <span>{fileName || "Belge1"}</span>
                        <span className="text-white/80 font-bold">- Microsoft Word P.</span>
                    </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-1 min-w-[150px] justify-end">
                    <ThemeToggle />
                    <button onClick={() => window.print()} className="p-1.5 hover:bg-[#3b67aa] rounded text-white transition-colors" title="Yazdır"><Printer size={16} /></button>
                </div>
            </div>

            {/* Ribbon Tabs Bar */}
            <div className="h-8 bg-[#2b579a] flex items-center px-0 z-[99] no-print shrink-0">
                <button className="h-full px-5 bg-[#2b579a] text-white text-[11px] font-bold uppercase transition-colors hover:bg-[#1a478a] border-r border-[#1a478a]">Dosya</button>
                <div className="flex items-center h-full">
                    {["Giriş", "Ekle", "Tasarım", "Düzen", "Başvurular", "Posta Gönderileri", "Gözden Geçir", "Görünüm", "Yardım", "Çizim"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={cn(
                                "px-3.5 h-full text-[11px] font-black transition-colors hover:bg-[#3b67aa]",
                                activeTab === tab.toLowerCase() ? "bg-[#f3f2f1] !text-[#2b579a] rounded-t-sm" : "text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Word Ribbon (Light Gray) */}
            <div className="h-24 bg-[#f3f2f1] border-b border-[#dadada] flex items-center px-4 gap-4 z-50 no-print shrink-0 shadow-sm" style={{ overflow: 'visible', position: 'relative' }}>
                {activeTab === "giriş" && (
                    <div className="flex h-full py-2 items-center gap-4">
                        {/* ClipBoard Group */}
                        <div className="flex flex-col items-center h-full min-w-[90px]">
                            <div className="flex-1 flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTool("select")}
                                    className={cn("p-2 rounded transition-all flex flex-col items-center gap-1 w-12", activeTool === "select" ? "bg-white shadow-md ring-2 ring-[#2b579a]" : "hover:bg-white/60")}
                                >
                                    <MousePointer2 size={20} className="text-[#2b579a]" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black text-zinc-900">Seç</span>
                                </button>
                                <div className="flex flex-col gap-0.5">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-1 px-2 hover:bg-white/60 rounded text-[9px] flex items-center gap-2 text-zinc-800 font-bold"><Upload size={12} className="text-[#2b579a]" strokeWidth={2.5} /> Aç</button>
                                    <button onClick={handleSave} className="p-1 px-2 hover:bg-white/60 rounded text-[9px] flex items-center gap-2 !text-zinc-950 font-black"><Download size={14} className="!text-[#2b579a]" strokeWidth={3} /> PDF İndir</button>
                                </div>
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Pano</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Font Group */}
                        <div className="flex flex-col items-center h-full">
                            <div className="flex-1 flex flex-col gap-1 justify-center">
                                <div className="flex items-center gap-1">
                                    <div className="bg-white border border-[#dadada] rounded px-1.5 py-0.5 flex items-center h-6">
                                        <span className="text-[10px] font-medium text-zinc-600 pr-3 border-r border-[#dadada]">Calibri</span>
                                        <input
                                            type="number"
                                            value={selectedId ? (annotations.find(a => a.id === selectedId)?.fontSize || 11) : 11}
                                            onChange={(e) => {
                                                const v = parseInt(e.target.value);
                                                if (selectedId) setAnnotations(prev => prev.map(a => a.id === selectedId ? { ...a, fontSize: v } : a));
                                            }}
                                            className="w-8 bg-transparent text-[10px] font-bold text-center border-none outline-none pl-1"
                                        />
                                    </div>
                                    <div className="flex gap-0.5 h-6">
                                        <button className="w-6 h-6 hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] flex items-center justify-center"><span className="font-bold text-[11px]">K</span></button>
                                        <button className="w-6 h-6 hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] flex items-center justify-center font-serif"><span className="italic text-[11px]">t</span></button>
                                        <button className="w-6 h-6 hover:bg-white/60 rounded border border-transparent hover:border-[#dadada] flex items-center justify-center underline text-[11px]">A</button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTool("text")}
                                    className={cn("px-4 py-1 rounded flex items-center gap-2 transition-all w-full justify-center h-6", activeTool === "text" ? "bg-white shadow-md ring-2 ring-[#2b579a]" : "hover:bg-white/60")}
                                >
                                    <Type size={16} className="!text-[#2b579a]" strokeWidth={3} />
                                    <span className="text-[10px] font-black !text-zinc-950">Metin Ekle</span>
                                </button>
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Yazı Tipi</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Edit Group */}
                        <div className="flex flex-col items-center h-full">
                            <div className="flex-1 flex items-center gap-1">
                                <button onClick={deleteSelected} disabled={!selectedId} className="p-2 rounded hover:bg-red-50 disabled:opacity-20 flex flex-col items-center gap-1 w-12 transition-colors group">
                                    <Trash2 size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-medium text-red-600">Sil</span>
                                </button>
                                <button onClick={() => window.print()} className="p-2 rounded hover:bg-white/60 flex flex-col items-center gap-1 w-12 transition-colors">
                                    <Printer size={22} className="!text-[#2b579a]" strokeWidth={3} />
                                    <span className="text-[9px] font-black !text-zinc-950">Yazdır</span>
                                </button>
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Düzenle</span>
                        </div>
                    </div>
                )}

                {activeTab === "çizim" && (
                    <div className="flex h-full py-2 items-center gap-4">
                        {/* Tools Group */}
                        <div className="flex flex-col items-center h-full">
                            <div className="flex-1 flex items-center gap-1">
                                <button
                                    onClick={() => setActiveTool("draw")}
                                    className={cn("p-2 rounded transition-all flex flex-col items-center gap-1 w-12", activeTool === "draw" ? "bg-white shadow-md ring-2 ring-[#2b579a]" : "hover:bg-white/60")}
                                >
                                    <Pencil size={20} className="text-orange-600" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black text-zinc-900">Kalem</span>
                                </button>
                                <button
                                    onClick={() => setActiveTool("erase")}
                                    className={cn("p-2 rounded transition-all flex flex-col items-center gap-1 w-12", activeTool === "erase" ? "bg-white shadow-md ring-2 ring-[#2b579a]" : "hover:bg-white/60")}
                                >
                                    <Eraser size={22} className="!text-blue-700" strokeWidth={3} />
                                    <span className="text-[9px] font-black !text-zinc-950">Silgi</span>
                                </button>
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Araçlar</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Pen Gallery */}
                        <div className="flex flex-col items-center h-full">
                            <div className="flex-1 flex items-center gap-2 p-1.5 bg-white/40 rounded border border-[#dadada] shadow-inner">
                                {[
                                    { color: "#000000", size: 2, name: "İnce" },
                                    { color: "#005a9e", size: 4, name: "Mavi" },
                                    { color: "#d83b01", size: 4, name: "Turuncu" },
                                    { color: "#ffff00", size: 12, name: "Vurgu", type: "highlight" }
                                ].map((pen, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (pen.type === "highlight") setActiveTool("highlight");
                                            else setActiveTool("draw");
                                            setBrushColor(pen.color);
                                            setBrushThickness(pen.size);
                                        }}
                                        className={cn(
                                            "w-10 h-11 flex flex-col items-center justify-center rounded-sm border bg-white transition-all hover:scale-105 hover:shadow-md",
                                            (brushColor === pen.color && brushThickness === pen.size && ((pen.type === "highlight" && activeTool === "highlight") || (pen.type !== "highlight" && activeTool === "draw"))) ? "border-[#2b579a] ring-1 ring-[#2b579a]/40 shadow-md bg-blue-50/30 scale-105" : "border-[#dadada] hover:border-[#2b579a]/50"
                                        )}
                                    >
                                        <div className="w-1.5 h-6 rounded-full mb-1 shadow-sm" style={{ backgroundColor: pen.color, opacity: pen.type === "highlight" ? 0.6 : 1 }} />
                                        <span className="text-[7px] uppercase font-black text-zinc-600">{pen.name}</span>
                                    </button>
                                ))}
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Kalemler</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Settings Group */}
                        <div className="flex flex-col items-center h-full">
                            <div className="flex-1 flex items-center gap-4">
                                <div className="bg-white p-2 rounded border border-[#dadada] shadow-sm flex flex-col gap-1 min-w-[100px]">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500">
                                        <span>KALINLIK</span>
                                        <span className="text-[#2b579a]">{brushThickness}px</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="25" value={brushThickness}
                                        onChange={(e) => setBrushThickness(parseInt(e.target.value))}
                                        className="w-full h-1 bg-zinc-200 rounded appearance-none cursor-pointer accent-[#2b579a]"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1 max-w-[80px]">
                                    {["#000000", "#ef4444", "#10b981", "#2b579a", "#f97316", "#eab308"].map(c => (
                                        <button
                                            key={c} onClick={() => setBrushColor(c)}
                                            className={cn("w-4 h-4 rounded-full border border-black/10 transition-transform", brushColor === c ? "ring-2 ring-blue-400 scale-110 shadow-sm" : "hover:scale-110")}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Özellikler</span>
                        </div>
                    </div>
                )}

                {activeTab === "ekle" && (
                    <div className="flex h-full py-2 items-center gap-4">
                        {/* Signature */}
                        <div className="flex flex-col items-center h-full">
                            <button
                                onClick={() => savedSignature ? setActiveTool("sign") : setIsSignModalOpen(true)}
                                className={cn("p-2 rounded hover:bg-white/60 transition-all flex flex-col items-center gap-1 w-16", activeTool === "sign" && "bg-white shadow-sm ring-1 ring-[#dadada]")}
                            >
                                <Signature size={24} className="!text-[#2b579a]" strokeWidth={3} />
                                <span className="text-[9px] font-black !text-zinc-950">İmza Ekle</span>
                            </button>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">İmza</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Stamps */}
                        <div className="flex flex-col items-center h-full relative">
                            <button
                                onClick={() => setShowStampMenu(!showStampMenu)}
                                className={cn("p-2 rounded hover:bg-white/60 transition-all flex flex-col items-center gap-1 w-16", activeTool === "stamp" && "bg-white shadow-sm ring-1 ring-[#dadada]")}
                            >
                                <Stamp size={24} className="!text-green-600" strokeWidth={2.5} />
                                <span className="text-[9px] font-black !text-zinc-950">Damga</span>
                            </button>
                            {showStampMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
                                    {STAMP_PRESETS.map(s => (
                                        <button
                                            key={s.label}
                                            onClick={() => addStamp(s.label, s.color)}
                                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Damga</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Sticky Note */}
                        <div className="flex flex-col items-center h-full">
                            <button
                                onClick={addNote}
                                className="p-2 rounded hover:bg-white/60 transition-all flex flex-col items-center gap-1 w-16"
                            >
                                <StickyNote size={24} className="!text-yellow-500" strokeWidth={2.5} />
                                <span className="text-[9px] font-black !text-zinc-950">Not Ekle</span>
                            </button>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Not</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Page Rotation */}
                        <div className="flex flex-col items-center h-full">
                            <button
                                onClick={rotatePage}
                                className="p-2 rounded hover:bg-white/60 transition-all flex flex-col items-center gap-1 w-16"
                            >
                                <RotateCw size={24} className="!text-[#2b579a]" strokeWidth={2.5} />
                                <span className="text-[9px] font-black !text-zinc-950">Döndür</span>
                            </button>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Sayfa</span>
                        </div>
                        <div className="w-[1px] h-12 bg-[#dadada]" />

                        {/* Page Navigation */}
                        <div className="flex flex-col items-center h-full">
                            <div className="flex-1 flex items-center gap-4">
                                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="p-2 hover:bg-white/60 rounded border border-[#dadada] !text-blue-900"><ChevronLeft size={20} strokeWidth={3} /></button>
                                <span className="text-[10px] font-black !text-zinc-950 bg-white px-3 py-1 rounded-sm border border-[#dadada]">{currentPage} / {totalPages}</span>
                                <button onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))} className="p-2 hover:bg-white/60 rounded border border-[#dadada] !text-blue-900"><ChevronRight size={20} strokeWidth={3} /></button>
                            </div>
                            <span className="text-[9px] !text-zinc-950 uppercase tracking-tighter mt-1 font-black">Sayfalar</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Word Navigation Pane (Thumbnails) */}
                <div className="w-56 bg-[#f3f2f1] border-r border-[#dadada] flex flex-col hidden md:flex no-print">
                    <div className="p-3 border-b border-[#dadada] flex items-center justify-between bg-white/50">
                        <span className="text-[10px] font-black uppercase tracking-widest !text-zinc-950">Navigasyon</span>
                        <Layers size={14} className="!text-[#2b579a]" strokeWidth={3} />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {Array.from({ length: totalPages || 0 }).map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    "aspect-[3/4] bg-white rounded-sm border transition-all cursor-pointer flex items-center justify-center relative group shadow-sm",
                                    currentPage === i + 1 ? "border-[#2b579a] ring-2 ring-[#2b579a]" : "border-[#dadada] hover:border-[#2b579a]"
                                )}
                            >
                                <span className="text-[10px] !text-zinc-950 font-black">{i + 1}</span>
                                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 bg-[#e6e6e6] overflow-auto flex flex-col items-center p-8 custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center p-20 min-h-[400px]"
                            >
                                <div className="w-12 h-12 border-4 border-[#2b579a]/20 border-t-[#2b579a] rounded-full animate-spin mb-4 shadow-sm" />
                                <p className="text-zinc-600 font-medium text-sm italic">PDF hazırlanıyor...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={totalPages ? "content" : "empty"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className={cn(
                                    "relative transition-all duration-500 motion-paper origin-top bg-white",
                                    totalPages ? "shadow-[0_0_20px_rgba(0,0,0,0.2),0_0_5px_rgba(0,0,0,0.1)] border border-[#dadada]" : "w-[400px] h-[500px] flex flex-col items-center justify-center rounded-sm bg-white border border-[#dadada] border-dashed"
                                )}
                                style={{
                                    width: totalPages ? '210mm' : '400px',
                                    height: totalPages ? `${210 * pageRatio}mm` : '500px',
                                    transform: totalPages ? `scale(${zoom / 100})` : 'scale(1)',
                                    margin: '0 auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {totalPages ? (
                                    <div className="w-full h-full bg-white shadow-inner relative flex items-center justify-center overflow-hidden">
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                            className={cn(
                                                "w-full h-full bg-white transition-all duration-300",
                                                activeTool === "select" && "cursor-default",
                                                activeTool === "draw" && "cursor-crosshair",
                                                activeTool === "sign" && "cursor-crosshair",
                                                activeTool === "text" && "cursor-text",
                                                activeTool === "highlight" && "cursor-alias",
                                                activeTool === "erase" && "cursor-not-allowed"
                                            )}
                                        />
                                        {isEditingText && selectedAnnotation && selectedAnnotation.type === "text" && (
                                            <div
                                                className="absolute z-[200] bg-white border-2 border-orange-500 rounded-lg p-1.5 shadow-2xl flex items-center gap-2"
                                                style={{
                                                    left: `${selectedAnnotation.x! * 100}%`,
                                                    top: `${selectedAnnotation.y! * 100}%`,
                                                    transform: 'translate(-5%, -100%)'
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    autoFocus
                                                    className="bg-transparent border-none outline-none text-black font-sans min-w-[150px] px-1"
                                                    style={{ fontSize: `${selectedAnnotation.fontSize}px` }}
                                                    value={selectedAnnotation.text}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setAnnotations(prev => prev.map(a => a.id === selectedId ? { ...a, text: newVal } : a));
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") setIsEditingText(false);
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        saveToHistory(annotations.filter(a => a.id !== selectedId));
                                                        setSelectedId(null);
                                                        setIsEditingText(false);
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                                                    title="Sil"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingText(false)}
                                                    className="w-6 h-6 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors shadow-sm"
                                                    title="Tamam"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                                            <FileText size={40} className="text-orange-600" />
                                        </div>
                                        <h2 className="text-2xl font-black text-zinc-800 mb-2">Belge Yüklenmedi</h2>
                                        <p className="text-zinc-600 text-sm font-medium max-w-[280px]">Düzenlemek istediğiniz dosyayı seçerek başlayabilirsiniz.</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-orange-900/40"
                                        >
                                            Dosya Seç
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Word Status Bar */}
            <div className="h-6 bg-[#2b579a] text-white px-4 flex items-center justify-between text-[10px] no-print">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 font-medium">SAYFA {currentPage} / {totalPages || 0}</span>
                    <span className="flex items-center gap-1 font-medium opacity-80 uppercase tracking-tighter italic">0 SÖZCÜK</span>
                    <span className="opacity-40">|</span>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="opacity-100 font-bold uppercase tracking-widest">{fileName || "Belge1"} - Kaydetme Tamamlandı</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-white font-bold">
                    <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="hover:bg-white/20 p-1 rounded-full transition-colors"><ZoomOut size={16} strokeWidth={3} /></button>
                    <div className="w-24 h-[2px] bg-white/30 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-3 bg-white shadow-2xl rounded-[1px] border-2 border-[#1a478a]" style={{ left: `${(zoom / 300) * 100}%` }} />
                    </div>
                    <button onClick={() => setZoom(Math.min(300, zoom + 10))} className="hover:bg-white/20 p-1 rounded-full transition-colors"><ZoomIn size={16} strokeWidth={3} /></button>
                    <span className="w-10 font-black text-right">{zoom}%</span>
                    <span className="opacity-60 text-lg">|</span>
                    <div className="flex items-center gap-5 text-white">
                        <Search size={16} strokeWidth={3} className="cursor-pointer hover:scale-110 active:scale-95 transition-all" />
                        <Printer size={16} strokeWidth={3} onClick={() => window.print()} className="cursor-pointer hover:scale-110 active:scale-95 transition-all" />
                        <Maximize size={16} strokeWidth={3} className="cursor-pointer hover:scale-110 active:scale-95 transition-all" />
                    </div>
                </div>
            </div>

            {/* Signature Modal */}
            <SignatureModal
                isOpen={isSignModalOpen}
                onClose={() => setIsSignModalOpen(false)}
                onSave={(sig) => {
                    setSavedSignature(sig);
                    setActiveTool("sign");
                    setIsSignModalOpen(false);
                }}
            />
        </div >
    );
}

function SignatureModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (sig: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const getCanvasPos = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: any) => {
        setIsDrawing(true);
        const { x, y } = getCanvasPos(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const { x, y } = getCanvasPos(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => setIsDrawing(false);

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL());
        }
    };

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
            }
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-zinc-900 font-bold">İmza Oluştur</h3>
                            <button onClick={onClose}><X size={20} className="text-zinc-400" /></button>
                        </div>
                        <div className="p-6 bg-zinc-50 flex flex-col items-center">
                            <canvas
                                ref={canvasRef}
                                width={360}
                                height={200}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="bg-white border-2 border-dashed border-zinc-200 rounded-xl cursor-crosshair shadow-inner"
                            />
                            <p className="text-[10px] text-zinc-400 mt-4 uppercase font-bold tracking-widest">Aşağıya imzanızı atın</p>
                        </div>
                        <div className="p-4 bg-white flex gap-3">
                            <button
                                onClick={clear}
                                className="flex-1 py-2 text-zinc-600 font-bold text-sm hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200"
                            >
                                Temizle
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg"
                            >
                                İmza Ekle
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
