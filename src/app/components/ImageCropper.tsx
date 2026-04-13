"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Trash2, Download, Crop, Scissors, RefreshCw } from "lucide-react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { cn } from "./editor/utils";

interface ImageCropperProps {
    onBack: () => void;
}

export default function ImageCropper({ onBack }: ImageCropperProps) {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const cropperRef = useRef<ReactCropperElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSourceImage(url);
    };

    const handleDownload = () => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            const canvas = cropperRef.current?.cropper.getCroppedCanvas();
            if(!canvas) return;
            canvas.toBlob((blob: Blob | null) => {
                if (!blob) return;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "kiesilmis-fotograf.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }
    };

    const handleReset = () => {
        setSourceImage(null);
    };

    const setAspectRatio = (ratio: number | null) => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            cropperRef.current?.cropper.setAspectRatio(ratio || NaN);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-zinc-100 dark:from-[#0a0a1a] dark:via-[#0d0d24] dark:to-[#0a0a1a] flex flex-col font-sans">
            <header className="px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#0d0d1a]/80 sticky top-0 z-50 border-b border-zinc-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                            <Crop size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 leading-tight">Fotoğraf Kesici</h1>
                            <p className="text-[11px] font-medium text-zinc-400">Özgürce Kesin ve Boyutlandırın</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {sourceImage && (
                        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm">
                            <Trash2 size={16} /> Temizle
                        </button>
                    )}
                    {sourceImage && (
                        <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105">
                            <Download size={16} /> Kes & İndir
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
                    <div className="flex-1 bg-white dark:bg-slate-800/80 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative p-4">
                        {!sourceImage ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-slate-700 m-4 rounded-2xl bg-zinc-50 dark:bg-slate-800/50">
                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <Crop size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Fotoğraf Yükleyin</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 max-w-md">Kesmek istediğiniz fotoğrafı seçin. İstediğiniz oranlarda kırpabilirsiniz.</p>
                                
                                <label className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:scale-105 transition-all cursor-pointer shadow-lg">
                                    <Upload size={20} />
                                    Fotoğraf Seç
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center relative w-full h-[600px] overflow-hidden">
                                <Cropper
                                    src={sourceImage}
                                    style={{ height: "100%", width: "100%" }}
                                    initialAspectRatio={NaN}
                                    guides={true}
                                    ref={cropperRef}
                                    viewMode={1}
                                    minCropBoxHeight={10}
                                    minCropBoxWidth={10}
                                    background={true}
                                    responsive={true}
                                    autoCropArea={0.8}
                                    checkOrientation={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-slate-700">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                                <Scissors size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Kesme Ayarları</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">En / Boy Oranı</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setAspectRatio(NaN)} className="py-2 border border-zinc-200 dark:border-slate-700 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-slate-700">Serbest</button>
                                    <button onClick={() => setAspectRatio(1)} className="py-2 border border-zinc-200 dark:border-slate-700 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-slate-700">1:1 (Kare)</button>
                                    <button onClick={() => setAspectRatio(4 / 3)} className="py-2 border border-zinc-200 dark:border-slate-700 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-slate-700">4:3</button>
                                    <button onClick={() => setAspectRatio(16 / 9)} className="py-2 border border-zinc-200 dark:border-slate-700 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-slate-700">16:9 (Geniş)</button>
                                    <button onClick={() => setAspectRatio(3 / 4)} className="py-2 border border-zinc-200 dark:border-slate-700 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-slate-700">3:4</button>
                                    <button onClick={() => setAspectRatio(9 / 16)} className="py-2 border border-zinc-200 dark:border-slate-700 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-slate-700">9:16 (Hikaye)</button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-slate-700">
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
