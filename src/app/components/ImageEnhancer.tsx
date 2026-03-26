"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Trash2, Download, Sparkles, Wand2, RefreshCw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ImageEnhancerProps {
    onBack: () => void;
}

export default function ImageEnhancer({ onBack }: ImageEnhancerProps) {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [intensity, setIntensity] = useState<number>(50);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const originalImgRef = useRef<HTMLImageElement | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSourceImage(url);
    };

    useEffect(() => {
        if (!sourceImage) return;
        const img = new Image();
        img.onload = () => {
            originalImgRef.current = img;
            applyFilters();
        };
        img.src = sourceImage;
    }, [sourceImage]);

    // Apply Sharpen Convolution + Contrast/Brightness fixes
    const applyFilters = () => {
        const canvas = canvasRef.current;
        const img = originalImgRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Resize canvas to image
        canvas.width = img.width;
        canvas.height = img.height;

        // Step 1: Draw original image
        // Apply slight contrast and brightness boost based on intensity
        const contrast = 100 + (intensity * 0.4); // 100-140%
        const brightness = 100 + (intensity * 0.1); // 100-110%
        ctx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;
        ctx.drawImage(img, 0, 0);
        ctx.filter = "none";

        if (intensity === 0) return;

        // Step 2: Unsharp Mask via Convolution
        const mix = intensity / 100; // 0 to 1
        const w = canvas.width;
        const h = canvas.height;
        
        // Skip convolution for very large images to prevent freezing (fallback to just contrast/brightness if image is huge)
        if (w * h > 3000 * 3000) {
            console.warn("Resim konvolüsyon için fazla büyük, sadece hafif filtre uygulandı.");
            return; 
        }

        setIsProcessing(true);
        setTimeout(() => {
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            const output = ctx.createImageData(w, h);
            const dst = output.data;

            // Simple Sharpen Kernel 3x3
            // [ 0 -1  0 ]
            // [-1  5 -1 ]
            // [ 0 -1  0 ]
            // Reduced effect based on mix
            const center = 1 + (4 * mix);
            const edge = -mix;
            const kat = [
                0, edge, 0,
                edge, center, edge,
                0, edge, 0
            ];

            const side = Math.round(Math.sqrt(kat.length));
            const halfSide = Math.floor(side / 2);

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const dstOff = (y * w + x) * 4;
                    let r = 0, g = 0, b = 0;

                    for (let cy = 0; cy < side; cy++) {
                        for (let cx = 0; cx < side; cx++) {
                            const scy = y + cy - halfSide;
                            const scx = x + cx - halfSide;
                            if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                                const srcOff = (scy * w + scx) * 4;
                                const wt = kat[cy * side + cx];
                                r += data[srcOff] * wt;
                                g += data[srcOff + 1] * wt;
                                b += data[srcOff + 2] * wt;
                            }
                        }
                    }

                    dst[dstOff]     = r;
                    dst[dstOff + 1] = g;
                    dst[dstOff + 2] = b;
                    dst[dstOff + 3] = data[dstOff + 3];
                }
            }
            
            ctx.putImageData(output, 0, 0);
            setIsProcessing(false);
        }, 10);
    };

    // Debounce the slider to avoid blocking UI during convolution
    useEffect(() => {
        if (!sourceImage) return;
        const t = setTimeout(() => {
            applyFilters();
        }, 300);
        return () => clearTimeout(t);
    }, [intensity]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "netlestirilmis-fotograf.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, "image/png");
    };

    const handleReset = () => {
        setSourceImage(null);
        setIntensity(50);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-zinc-100 dark:from-[#0a0a1a] dark:via-[#0d0d24] dark:to-[#0a0a1a] flex flex-col font-sans">
            <header className="px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#0d0d1a]/80 sticky top-0 z-50 border-b border-zinc-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 leading-tight">Bulanıklık Giderici</h1>
                            <p className="text-[11px] font-medium text-zinc-400">Yapay Zeka Destekli Netleştirme</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {sourceImage && (
                        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm">
                            <Trash2 size={16} /> Temizle
                        </button>
                    )}
                    {sourceImage && (
                        <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105">
                            <Download size={16} /> İndir
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
                    <div className="flex-1 bg-white dark:bg-slate-800/80 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative">
                        {!sourceImage ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-slate-700 m-4 rounded-2xl bg-zinc-50 dark:bg-slate-800/50">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <Sparkles size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Bulanık Fotoğraf Yükleyin</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 max-w-md">Eski veya bulanık çıkan fotoğraflarınızı yükleyin, algoritmaların pikselleri nasıl netleştirdiğine şahit olun.</p>
                                
                                <label className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:scale-105 transition-all cursor-pointer shadow-lg">
                                    <Upload size={20} />
                                    Fotoğraf Seç
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-6 bg-zinc-100 dark:bg-slate-900 relative">
                                <div className="relative z-10 max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-zinc-200 dark:border-slate-700">
                                    <canvas 
                                        ref={canvasRef} 
                                        className={cn("max-w-full max-h-[70vh] object-contain block transition-opacity duration-300", isProcessing ? "opacity-30" : "opacity-100")}
                                    />
                                    {isProcessing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-md">
                                            <Wand2 className="animate-spin mb-2" size={32} />
                                            <span className="font-bold">Netleştiriliyor...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-slate-700">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                                <Wand2 size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Netleştirme Ayarları</h3>
                        </div>

                        <div className="space-y-6">
                            <div className={cn("transition-opacity", !sourceImage && "opacity-50 pointer-events-none")}>
                                <div className="flex justify-between mb-2">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Netlik Seviyesi</h4>
                                    <span className="text-xs font-bold text-blue-600 w-10 text-right">% {intensity}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={intensity} 
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="w-full h-2 bg-zinc-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-zinc-400 font-medium">
                                    <span>Orijinal</span>
                                    <span>Maksimum</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-slate-700 mt-6">
                                <label className="flex flex-col items-center justify-center gap-2 py-4 border-2 border-dashed border-zinc-200 dark:border-slate-700 rounded-xl font-bold transition-all text-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 text-zinc-600 dark:text-zinc-300">
                                    <RefreshCw size={20} className="mb-1" />
                                    Yeni Fotoğraf Yükle
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
