"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, FileText, Loader2, Copy, CheckCircle2, Download, Cloud, ScanLine, Image as ImageIcon, Sparkles, X, ShieldCheck } from "lucide-react";
import Tesseract from "tesseract.js";
import { cn } from "./editor/utils";

interface OcrToolProps {
  onBack: () => void;
}

export default function OcrTool({ onBack }: OcrToolProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isCloudSaved, setIsCloudSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setExtractedText("");
      setProgress(0);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      const result = await Tesseract.recognize(selectedFile, "eng+tur", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setExtractedText(result.data.text);
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Text extraction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <ScanLine size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Vision OCR</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase flex items-center gap-2">
                <ShieldCheck size={12} /> Privacy-First • Tesseract Engine
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-hidden">
        
        {/* Left: Source */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 flex flex-col h-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ImageIcon size={14} /> Visual Source
              </h2>
              {imagePreview && (
                <button onClick={() => { setSelectedFile(null); setImagePreview(null); setExtractedText(""); }} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-zinc-50 dark:bg-black/40 rounded-3xl border border-dashed border-zinc-200 dark:border-white/5 relative overflow-hidden shadow-inner group">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                
                {!imagePreview ? (
                    <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center cursor-pointer p-10 text-center">
                        <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Upload size={36} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Import Image</h3>
                        <p className="text-zinc-500 text-sm font-medium">Extract text from PNG, JPG or BMP</p>
                    </div>
                ) : (
                    <div className="w-full h-full relative p-4 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                    </div>
                )}
            </div>

            <div className="mt-8">
                <button 
                    onClick={processImage}
                    disabled={!selectedFile || isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                    {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                    {isProcessing ? `Scanning DOM (${progress}%)` : "Compile Text (OCR)"}
                </button>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 flex flex-col h-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={14} /> Compiled Result
              </h2>
              {extractedText && (
                <div className="flex items-center gap-2">
                    <button onClick={copyToClipboard} className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", isCopied ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}>
                        {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        {isCopied ? "Copied" : "Copy Buffer"}
                    </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-zinc-50 dark:bg-black/40 rounded-3xl p-8 border border-zinc-200 dark:border-white/5 shadow-inner">
                {isProcessing ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                        <Loader2 size={48} className="animate-spin text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Analyzing Micro-Structure...</span>
                    </div>
                ) : extractedText ? (
                    <textarea 
                        value={extractedText}
                        onChange={e => setExtractedText(e.target.value)}
                        className="w-full h-full bg-transparent border-none outline-none resize-none text-zinc-900 dark:text-zinc-100 font-mono text-sm leading-relaxed"
                        placeholder="Extracted content will appear here..."
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400/50">
                        <ScanLine size={64} className="mb-4 opacity-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Waiting for Compilation</p>
                    </div>
                )}
            </div>

            {extractedText && (
                <div className="mt-8">
                    <button onClick={() => {
                        const blob = new Blob([extractedText], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "ocr_result.txt";
                        a.click();
                    }} className="w-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-sm">
                        <Download size={24} /> Export .txt Buffer
                    </button>
                </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
