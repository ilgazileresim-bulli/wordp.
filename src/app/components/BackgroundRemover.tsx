"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Download, Settings, RefreshCw, Wand2, PaintBucket, Focus, X, ShieldCheck, Zap, Palette, Loader2, Sparkles } from "lucide-react";
import { removeBackground, Config } from "@imgly/background-removal";
import { cn } from "./editor/utils";

interface BackgroundRemoverProps {
    onBack: () => void;
}

export default function BackgroundRemover({ onBack }: BackgroundRemoverProps) {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [transparentImage, setTransparentImage] = useState<string | null>(null);
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState<string>(""); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const PRESET_COLORS = [
        "", // Transparent
        "#ffffff", // White
        "#000000", // Black
        "#ef4444", // Red
        "#3b82f6", // Blue
        "#10b981", // Green
        "#f59e0b", // Yellow
        "#8b5cf6", // Purple
    ];

    useEffect(() => {
        if (transparentImage || sourceImage) redrawCanvas();
    }, [transparentImage, sourceImage, bgImage, bgColor]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const mainImgSrc = transparentImage || sourceImage;
        if (!mainImgSrc) return;
        const mainImg = new Image();
        mainImg.onload = () => {
            canvas.width = mainImg.width;
            canvas.height = mainImg.height;
            if (bgColor) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (!bgImage && transparentImage) {
                 ctx.clearRect(0,0, canvas.width, canvas.height);
            }
            if (bgImage) {
                const bImg = new Image();
                bImg.onload = () => {
                    const canvasAspect = canvas.width / canvas.height;
                    const imgAspect = bImg.width / bImg.height;
                    let drawWidth, drawHeight, offsetX, offsetY;
                    if (canvasAspect > imgAspect) {
                        drawWidth = canvas.width;
                        drawHeight = canvas.width / imgAspect;
                        offsetX = 0;
                        offsetY = (canvas.height - drawHeight) / 2;
                    } else {
                        drawHeight = canvas.height;
                        drawWidth = canvas.height * imgAspect;
                        offsetX = (canvas.width - drawWidth) / 2;
                        offsetY = 0;
                    }
                    ctx.drawImage(bImg, offsetX, offsetY, drawWidth, drawHeight);
                    ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);
                };
                bImg.src = bgImage;
            } else {
                ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);
            }
        };
        mainImg.src = mainImgSrc;
    };

    const handleUploadSource = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSourceImage(url);
        setTransparentImage(null);
        setBgImage(null);
        setBgColor("");
    };

    const handleRemoveBackground = async () => {
        if (!sourceImage) return;
        setIsProcessing(true);
        setStatusText("Neural Analysis...");
        setProgress(0);
        try {
            const config: Config = {
                progress: (key, current, total) => {
                    setStatusText(`Processing: ${key}`);
                    if (total > 0) setProgress(Math.round((current / total) * 100));
                }
            };
            const imageBlob = await fetch(sourceImage).then(r => r.blob());
            const resultBlob = await removeBackground(imageBlob, config);
            const resultUrl = URL.createObjectURL(resultBlob);
            setTransparentImage(resultUrl);
            setStatusText("Synthesis Complete!");
            setProgress(100);
            setTimeout(() => setIsProcessing(false), 1000);
        } catch (error) {
            console.error("Background removal error:", error);
            setStatusText("Processing Failure.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
            <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/20">
                        <Wand2 size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Neural Remover</h1>
                        <p className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-black tracking-widest uppercase flex items-center gap-2">
                           <ShieldCheck size={12} /> Privacy-First • On-Device AI
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {sourceImage && (
                        <button onClick={() => setSourceImage(null)} className="p-3 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all">
                            <Trash2 size={24} />
                        </button>
                    )}
                    {transparentImage && (
                        <button onClick={() => {
                            const canvas = canvasRef.current;
                            if (canvas) {
                                canvas.toBlob(blob => {
                                    if (blob) {
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = "neural_export.png";
                                        a.click();
                                    }
                                });
                            }
                        }} className="px-8 py-3 bg-fuchsia-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition-all">
                            <Download size={16} className="inline mr-2" /> Export Bundle
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-[3rem] border border-zinc-200 dark:border-white/5 shadow-2xl flex flex-col relative overflow-hidden min-h-[500px]">
                        {!sourceImage ? (
                            <label className="flex-1 flex flex-col items-center justify-center p-20 cursor-pointer group">
                                <div className="w-24 h-24 bg-fuchsia-500/10 text-fuchsia-500 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-3">Load Vision Source</h2>
                                <p className="text-zinc-500 font-medium">Neural processing occurs exclusively on your hardware.</p>
                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadSource} />
                            </label>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-10 bg-zinc-100 dark:bg-black/40 relative">
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                <div className="relative z-10 max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-white dark:bg-slate-900">
                                    <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain block" />
                                </div>

                                <AnimatePresence>
                                    {isProcessing && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/90 dark:bg-[#0a0a1a]/95 backdrop-blur-xl flex flex-col items-center justify-center">
                                            <div className="w-80 space-y-8 flex flex-col items-center">
                                                <div className="relative w-24 h-24">
                                                    <Loader2 className="w-full h-full text-fuchsia-600 animate-spin" />
                                                    <Zap className="absolute inset-0 m-auto text-fuchsia-500 animate-pulse" size={32} />
                                                </div>
                                                <div className="w-full text-center">
                                                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4">{statusText}</h3>
                                                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-fuchsia-600 shadow-[0_0_15px_rgba(192,38,211,0.5)]" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-fuchsia-500 mt-3 block">QUANTUM BUFFER: {progress}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-2xl space-y-10">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                                <Zap size={14} className="text-fuchsia-500" /> Neural Actions
                            </label>
                            <button 
                                onClick={handleRemoveBackground}
                                disabled={!sourceImage || isProcessing || !!transparentImage}
                                className={cn(
                                    "w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl shadow-fuchsia-600/20",
                                    sourceImage && !transparentImage ? "bg-fuchsia-600 text-white hover:scale-[1.02] active:scale-[0.98]" : "bg-zinc-100 dark:bg-white/5 text-zinc-400 opacity-50"
                                )}
                            >
                                <Sparkles size={20} /> Deploy AI Model
                            </button>
                        </div>

                        {transparentImage && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                                        <Palette size={14} className="text-fuchsia-500" /> Environment Swap
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {PRESET_COLORS.map((c, i) => (
                                            <button 
                                                key={i} onClick={() => { setBgColor(c); setBgImage(null); }}
                                                className={cn(
                                                    "w-full aspect-square rounded-2xl border-2 transition-all active:scale-90",
                                                    bgColor === c ? "border-fuchsia-600 shadow-xl" : "border-zinc-100 dark:border-white/5",
                                                    !c && "bg-slate-200/50"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                                        <ImageIcon size={14} className="text-fuchsia-500" /> Custom Context
                                    </label>
                                    <label className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[2rem] cursor-pointer hover:bg-fuchsia-600/5 transition-colors group">
                                        <Upload size={24} className="text-zinc-400 group-hover:text-fuchsia-500 transition-colors" />
                                        <span className="text-[10px] font-black text-zinc-400 mt-3 uppercase tracking-widest">Inject Scene</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) { setBgImage(URL.createObjectURL(file)); setBgColor(""); }
                                        }} />
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
