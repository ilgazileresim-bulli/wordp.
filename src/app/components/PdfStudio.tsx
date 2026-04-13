"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, Combine, SplitSquareHorizontal, 
  Settings, Download, UploadCloud, RefreshCw, Layers, 
  Trash2, Plus, ArrowRight, Shield, Zap, Search, Eye
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { cn } from './editor/utils';
import PdfEditor from './PdfEditor';

type PDFTab = 'edit' | 'merge' | 'split' | 'to-image';

interface PdfStudioProps {
  onBack: () => void;
  initialTool?: string;
}

export default function PdfStudio({ onBack, initialTool }: PdfStudioProps) {
  const [activeTab, setActiveTab] = useState<PDFTab>(() => {
    if (initialTool === 'pdf-merge') return 'merge';
    if (initialTool === 'pdf-split' || initialTool === 'pdf-extract-pages') return 'split';
    if (initialTool === 'pdf-to-image') return 'to-image';
    if (initialTool === 'pdf-compress') return 'split'; // For now, or add a tab
    return 'edit';
  });
  
  // -- Unified States --
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [splitRange, setSplitRange] = useState("");
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Handlers --
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files!);
      setFiles(prev => [...prev, ...newFiles]);

      if (activeTab === 'to-image' && newFiles.length > 0) {
        generateThumbnails(newFiles[0]);
      }
    }
  };

  const generateThumbnails = async (file: File) => {
    setIsProcessing(true);
    setPdfImages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: string[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await (page as any).render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/png"));
      }
      setPdfImages(images);
    } catch (err) {
      console.error("PDF to Image conversion error:", err);
      alert("PDF görsele dönüştürülürken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
        const updated = prev.filter((_, i) => i !== index);
        if (activeTab === 'to-image') {
            if (updated.length > 0) generateThumbnails(updated[0]);
            else setPdfImages([]);
        }
        return updated;
    });
  };

  const downloadBlob = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllImages = async () => {
    if (pdfImages.length === 0) return;
    setIsProcessing(true);
    try {
        const JSZip = (await import("jszip")).default;
        const { saveAs } = await import("file-saver");
        const zip = new JSZip();
        
        pdfImages.forEach((imgData, i) => {
            const base64Data = imgData.split(',')[1];
            zip.file(`sayfa_${i+1}.png`, base64Data, { base64: true });
        });
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${files[0].name.replace('.pdf', '')}_gorseller.zip`);
    } catch (err) {
        console.error("Zip error:", err);
    } finally {
        setIsProcessing(false);
    }
  };

  const parseRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
          for (let i = start; i <= Math.min(end, maxPages); i++) {
            pages.add(i - 1); 
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num > 0 && num <= maxPages) {
          pages.add(num - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
        alert("Birleştirmek için en az 2 PDF dosyası seçmelisiniz.");
        return;
    }
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      downloadBlob(pdfBytes, "Birleştirilmiş-Belgeler.pdf");
    } catch (err) {
      console.error(err);
      alert("Hata!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = async () => {
      if (files.length === 0 || !splitRange) {
          alert("Lütfen bir dosya seçin ve aralık belirtin.");
          return;
      }
      setIsProcessing(true);
      try {
          const file = files[0];
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const indices = parseRange(splitRange, pdf.getPageCount());
          
          if (indices.length === 0) {
              alert("Geçersiz aralık!");
              return;
          }

          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdf, indices);
          copiedPages.forEach(p => newPdf.addPage(p));

          const bytes = await newPdf.save();
          downloadBlob(bytes, `Ayrılmış-${file.name}`);
      } catch (err) {
          console.error(err);
      } finally {
          setIsProcessing(false);
      }
  };

  const TABS = [
    { id: 'edit', label: 'Düzenleyici', icon: FileText, desc: 'Not Ekle & İmzala' },
    { id: 'merge', label: 'Birleştir', icon: Combine, desc: 'Dosyaları Birleştir' },
    { id: 'split', label: 'Ayır (Kırp)', icon: SplitSquareHorizontal, desc: 'Sayfa Çıkar' },
  ];

  return (
    <div className="min-h-screen bg-[#05050f] text-slate-200 font-sans flex overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Premium Sidebar */}
      <aside className="w-80 bg-[#0a0a1a]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col z-50 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
                <h1 className="font-black text-white text-sm tracking-tight uppercase tracking-widest">PDF Studio</h1>
                <span className="text-[9px] text-rose-500 font-bold tracking-widest uppercase">Professional Edition</span>
            </div>
        </div>

        <div className="flex-1 p-6 space-y-3 overflow-y-auto mt-4 custom-scrollbar">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as PDFTab)}
                    className={cn(
                        "w-full flex items-center gap-4 p-5 rounded-[1.25rem] transition-all duration-500 group relative overflow-hidden",
                        activeTab === tab.id 
                            ? "bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 text-white shadow-[0_8px_32px_rgba(244,63,94,0.15)]" 
                            : "hover:bg-white/5 text-slate-400 border border-transparent hover:border-white/5"
                    )}
                >
                    <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-500 shadow-lg",
                        activeTab === tab.id 
                            ? "bg-rose-500 text-white shadow-rose-500/40 scale-110" 
                            : "bg-[#1a1a2e] text-slate-500 group-hover:text-slate-300 group-hover:scale-105"
                    )}>
                        <tab.icon size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className={cn(
                            "text-sm font-black tracking-tight transition-colors",
                            activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        )}>{tab.label}</span>
                        <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider">{tab.desc}</span>
                    </div>
                    {activeTab === tab.id && (
                        <motion.div 
                            layoutId="activeTabGlow" 
                            className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none" 
                        />
                    )}
                </button>
            ))}
        </div>

        <div className="p-8 bg-gradient-to-t from-black/40 to-transparent border-t border-white/5">
            <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-2xl p-5 border border-rose-500/10 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-2xl rounded-full" />
                <div className="flex items-center gap-3 text-rose-400">
                    <Shield size={16} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Güvenlik</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">
                    Tüm işlemler yerel cihazınızda gerçekleşir. Verileriniz %100 gizli kalır.
                </p>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div 
               key="edit"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="flex-1 flex flex-col h-full bg-[#1a1a2e]"
            >
                <PdfEditor onBack={onBack} initialFile={files[0]} isEmbedded={true} />
            </motion.div>
          ) : (
            <motion.div 
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="flex-1 p-12 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        {activeTab === 'merge' ? 'PDF Dosyalarını Birleştir' : 'PDF Sayfalarını Ayır'}
                    </h2>
                    <p className="text-slate-400 font-medium">Professional grade PDF manipulation engine.</p>
                </div>

                {/* Unified Upload Area */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-rose-500/20 hover:border-rose-500/40 bg-[#0a0a1a]/40 backdrop-blur-xl hover:bg-rose-500/5 transition-all duration-700 rounded-[3rem] p-24 flex flex-col items-center justify-center cursor-pointer text-center relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-24 h-24 bg-gradient-to-br from-rose-500/20 to-rose-600/10 text-rose-400 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-700 shadow-[0_0_50px_rgba(244,63,94,0.2)] border border-rose-500/20"
                    >
                      <UploadCloud size={48} />
                    </motion.div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Döküman Yükleyin</h3>
                    <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                        Dosyalarınızı sürükleyin veya göz atmak için tıklayın.<br/>
                        <span className="text-rose-500/60 text-[11px] font-black uppercase mt-2 block tracking-widest">Maksimum Gizlilik • %100 Yerel</span>
                    </p>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      className="hidden" 
                      accept=".pdf"
                      multiple={activeTab === 'merge'} 
                      onChange={handleFileChange} 
                    />
                </div>

                {/* File List */}
                {files.length > 0 && (
                   <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Seçili Dosyalar ({files.length})</h3>
                            <button onClick={() => setFiles([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-tight">Tümünü Temizle</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {files.map((file, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i} 
                                    className="flex items-center justify-between bg-[#1e1e3a] p-4 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-200 truncate max-w-[300px]">{file.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF BELGESİ</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(i)} className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {activeTab === 'split' && (
                            <div className="bg-[#1e1e3a] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
                                <span className="block text-xs uppercase font-black text-slate-400 tracking-widest">Çıkarılacak Sayfalar</span>
                                <input 
                                    type="text"
                                    value={splitRange}
                                    onChange={(e) => setSplitRange(e.target.value)}
                                    placeholder="Örn: 1-3, 5, 8-10"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 outline-none text-white font-mono"
                                />
                                <div className="flex items-start gap-3 p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                    <Zap size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Sayfaları virgülle ayırın veya bir aralık belirtin. Sistem seçilen sayfaları kapsayan yeni bir döküman oluşturur.</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 w-full">
                            <button 
                                onClick={activeTab === 'merge' ? handleMerge : handleSplit}
                                disabled={isProcessing || (activeTab === 'merge' && files.length < 2) || (activeTab === 'split' && (files.length === 0 || !splitRange))}
                                className="w-full py-5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-rose-900/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : (activeTab === 'merge' ? <Combine size={20} /> : <SplitSquareHorizontal size={20} />)}
                                {isProcessing ? 'İşleniyor...' : (activeTab === 'merge' ? 'PDF Dosyalarını Birleştir' : 'Seçili Sayfaları Ayır')}
                            </button>
                        </div>
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
