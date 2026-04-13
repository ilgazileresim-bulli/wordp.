"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Download, Settings, RefreshCw, Wand2, PaintBucket, Focus } from "lucide-react";
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

    // Preset Background Colors
    const PRESET_COLORS = [
        "", // Transparent
        "#ffffff", // White
        "#000000", // Black
        "#ef4444", // Red
        "#3b82f6", // Blue
        "#10b981", // Green
        "#f59e0b", // Yellow
        "#8b5cf6", // Purple
        "#ec4899", // Pink
    ];

    useEffect(() => {
        // Redraw canvas whenever transparentImage, bgImage, or bgColor changes
        if (transparentImage || sourceImage) {
            redrawCanvas();
        }
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

            // 1. Draw Background Color (if any)
            if (bgColor) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (!bgImage && transparentImage) {
                 // Draw a checkerboard pattern just visually? No, canvas is transparent, let CSS handle checkerboard
                 ctx.clearRect(0,0, canvas.width, canvas.height);
            }

            // 2. Draw Background Image (if any)
            if (bgImage) {
                const bImg = new Image();
                bImg.onload = () => {
                    // Cover mode drawing
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
                    // 3. Draw Foreground Image
                    ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);
                };
                bImg.src = bgImage;
            } else {
                // 3. Draw Foreground Image directly
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

    const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setBgImage(url);
        setBgColor(""); // Reset color if image is uploaded
    };

    const handleRemoveBackground = async () => {
        if (!sourceImage) return;

        setIsProcessing(true);
        setStatusText("Removing background...");
        setProgress(0);

        try {
            const config: Config = {
                progress: (key, current, total) => {
                    setStatusText(`Processing: ${key}`);
                    // Avoid NaN
                    if (total > 0) {
                        setProgress(Math.round((current / total) * 100));
                    }
                }
            };

            const imageBlob = await fetch(sourceImage).then(r => r.blob());
            const resultBlob = await removeBackground(imageBlob, config);
            const resultUrl = URL.createObjectURL(resultBlob);
            
            setTransparentImage(resultUrl);
            setStatusText("Process completed!");
            setProgress(100);
            setTimeout(() => {
                setIsProcessing(false);
            }, 1000);
        } catch (error) {
            console.error("Background removal error:", error);
            setStatusText("An error occurred.");
            setIsProcessing(false);
            alert("An error occurred while removing the background. Please try again later.");
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "background-removed.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, "image/png");
    };

    const handleReset = () => {
        setSourceImage(null);
        setTransparentImage(null);
        setBgImage(null);
        setBgColor("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-zinc-100 dark:from-[#0a0a1a] dark:via-[#0d0d24] dark:to-[#0a0a1a] flex flex-col font-sans">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#0d0d1a]/80 sticky top-0 z-50 border-b border-zinc-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-200/50 dark:shadow-fuchsia-900/20 text-white">
                            <Wand2 size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 leading-tight">Background Remover</h1>
                            <p className="text-[11px] font-medium text-zinc-400">AI Powered</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {sourceImage && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                    )}
                    {(transparentImage || bgImage || bgColor) && (
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all hover:scale-105"
                        >
                            <Download size={16} />
                            Download
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Editor Area */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
                    <div className="flex-1 bg-white dark:bg-slate-800/80 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative">
                        
                        {!sourceImage ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-slate-700 m-4 rounded-2xl bg-zinc-50 dark:bg-slate-800/50">
                                <div className="w-20 h-20 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <ImageIcon size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Upload Photo</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 max-w-md">Select the photo you want to remove the background from. AI will clean the background in seconds.</p>
                                
                                <label className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:scale-105 transition-all cursor-pointer shadow-lg shadow-zinc-200 dark:shadow-none hover:shadow-xl">
                                    <Upload size={20} />
                                    Select Photo
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUploadSource} />
                                </label>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-zinc-100 dark:bg-slate-900 relative">
                                <div 
                                    className="absolute inset-0 opacity-20 pointer-events-none" 
                                    style={{
                                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                    }}
                                />
                                
                                <div className="relative z-10 max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-zinc-200 dark:border-slate-700">
                                    <canvas 
                                        ref={canvasRef} 
                                        className="max-w-full max-h-[70vh] object-contain block"
                                    />
                                </div>

                                {isProcessing && (
                                    <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                        <div className="w-64 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-slate-700 flex flex-col items-center">
                                            <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                                                <div className="absolute inset-0 border-4 border-fuchsia-100 dark:border-fuchsia-900/30 rounded-full"></div>
                                                <div 
                                                    className="absolute inset-0 border-4 border-fuchsia-600 rounded-full border-t-transparent animate-spin"
                                                ></div>
                                                <Wand2 className="text-fuchsia-600 absolute animate-pulse" size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2">{statusText}</p>
                                            <div className="w-full bg-zinc-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ ease: "linear" }}
                                                />
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-2">%{progress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-slate-700">
                            <div className="w-10 h-10 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl flex items-center justify-center">
                                <Settings size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Tools</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Actions */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Actions</h4>
                                <button
                                    onClick={handleRemoveBackground}
                                    disabled={!sourceImage || isProcessing || transparentImage !== null}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-md text-sm",
                                        sourceImage && !transparentImage
                                            ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:opacity-90 hover:-translate-y-0.5"
                                            : "bg-zinc-100 dark:bg-slate-700 text-zinc-400 cursor-not-allowed shadow-none"
                                    )}
                                >
                                    <Wand2 size={18} />
                                    Remove Background
                                </button>
                                
                                <label className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm border-2 cursor-pointer",
                                    "border-zinc-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 text-zinc-600 dark:text-zinc-300"
                                )}>
                                    <RefreshCw size={18} />
                                    Upload New Photo
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUploadSource} />
                                </label>
                            </div>

                            {/* Background Customization */}
                            <AnimatePresence>
                                {transparentImage && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-5 pt-4 border-t border-zinc-100 dark:border-slate-700"
                                    >
                                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Add Background</h4>
                                        
                                        {/* Color Presets */}
                                        <div>
                                            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2 mb-3">
                                                <PaintBucket size={16} /> Select Color
                                            </label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {PRESET_COLORS.map((color, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setBgColor(color);
                                                            setBgImage(null);
                                                        }}
                                                        className={cn(
                                                            "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                                                            bgColor === color ? "border-blue-500 scale-110 shadow-sm z-10" : "border-zinc-200 dark:border-slate-600 hover:scale-105",
                                                            color === "" && "bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-zinc-200"
                                                        )}
                                                        style={{ backgroundColor: color || "transparent" }}
                                                        title={color === "" ? "Transparent" : color}
                                                    >
                                                        {color === "" && <div className="absolute inset-0 bg-red-400 w-full h-[2px] rotate-45 top-1/2 -translate-y-1/2 opacity-50"></div>}
                                                    </button>
                                                ))}
                                                <div className="relative">
                                                     <input 
                                                        type="color" 
                                                        value={bgColor || "#ffffff"}
                                                        onChange={(e) => {
                                                            setBgColor(e.target.value);
                                                            setBgImage(null);
                                                        }}
                                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                                                    />
                                                    <div className="w-10 h-10 rounded-lg border-2 border-zinc-200 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-500 via-green-500 to-blue-500 pointer-events-none">
                                                        <PlusIcon />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2 mb-3">
                                                <ImageIcon size={16} /> Upload Image
                                            </label>
                                            <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-zinc-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col items-center text-zinc-500">
                                                    <Upload size={24} className="mb-2" />
                                                    <span className="text-sm font-medium">Select Image</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUploadBackground} />
                                            </label>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
