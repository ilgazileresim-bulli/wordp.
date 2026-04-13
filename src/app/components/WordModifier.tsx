"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Upload, FileText, Type, Check, Download, Wand2, RefreshCw } from "lucide-react";
import { cn } from "./editor/utils";

export default function WordModifier({ onBack }: { onBack: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewHtml, setPreviewHtml] = useState("");
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [targetWords, setTargetWords] = useState<string[]>([]);
    const [wordInput, setWordInput] = useState("");

    const handleWordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newWord = wordInput.trim();
            if (newWord && !targetWords.includes(newWord)) {
                setTargetWords([...targetWords, newWord]);
                setWordInput("");
            }
        }
    };
    
    const removeWord = (wordToRemove: string) => {
        setTargetWords(targetWords.filter(w => w !== wordToRemove));
    };
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [color, setColor] = useState("#ff0000"); // Varsayılan Kırmızı
    const [isUnderline, setIsUnderline] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");

    const highlightedHtml = useMemo(() => {
        if (!previewHtml || targetWords.length === 0) return previewHtml || "<p>İçerik boş veya okunabiliyor metin bulunamadı.</p>";
        let styleStr = "";
        if (isBold) styleStr += "font-weight: bold; ";
        if (isItalic) styleStr += "font-style: italic; ";
        if (isUnderline) styleStr += "text-decoration: underline; ";
        if (color && color !== "#000000") styleStr += `color: ${color}; `;
        if (!styleStr) styleStr = "background-color: rgba(99, 102, 241, 0.2); color: inherit;";
        const escapedWords = targetWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(`(?![^<]*>)(${escapedWords})`, 'gi');
        return previewHtml.replace(regex, `<span style="${styleStr} border-radius: 2px;">$1</span>`);
    }, [previewHtml, targetWords, isBold, isItalic, color, isUnderline]);

    const handleFileSelect = async (selectedFile: File | null) => {
        setFile(selectedFile);
        setTargetWords([]);
        setWordInput("");
        setPreviewHtml("");
        if (selectedFile) {
            setIsLoadingPreview(true);
            try {
                const mammoth = await import("mammoth");
                const arrayBuffer = await selectedFile.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setPreviewHtml(result.value);
            } catch (err) {
                console.error("Önizleme hatası:", err);
                setPreviewHtml("<p class='text-red-500'>Önizleme yüklenemedi.</p>");
            } finally {
                setIsLoadingPreview(false);
            }
        }
    };

    const processWordFile = async () => {
        if (!file || targetWords.length === 0) return;
        setIsProcessing(true);
        setStatus("Belge okunuyor...");

        try {
            const JSZip = (await import("jszip")).default;
            const { saveAs } = await import("file-saver");
            
            const zip = new JSZip();
            const docArchive = await zip.loadAsync(file);
            
            setStatus("Kelimeler aranıyor ve değiştiriliyor...");
            
            const parser = new DOMParser();
            const serializer = new XMLSerializer();
            let totalReplacements = 0;

            // Hem ana belge hem de üstbilgi/altbilgi gibi yerlerde arama yapalım
            for (const [filename, fileObj] of Object.entries(docArchive.files)) {
                if (filename.startsWith("word/") && filename.endsWith(".xml")) {
                    const xmlText = await fileObj.async("text");
                    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                    const wtNodes = Array.from(xmlDoc.getElementsByTagName("w:t"));

                    let modified = false;

                    const escapedRegexStr = targetWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
                    const splitRegex = new RegExp(`(${escapedRegexStr})`, 'gi');

                    for (const wt of wtNodes) {
                        const text = wt.textContent || "";
                        const hasMatch = targetWords.some(w => text.toLowerCase().includes(w.toLowerCase()));
                        
                        if (hasMatch) {
                            const parts = text.split(splitRegex);
                            const parentR = wt.parentNode; // <w:r>
                            if (!parentR || parentR.nodeName !== "w:r") continue;

                            const parentP = parentR.parentNode; // <w:p>
                            if (!parentP) continue;

                            const fragment = xmlDoc.createDocumentFragment();
                            const rPr = Array.from(parentR.childNodes).find(n => n.nodeName === "w:rPr");

                            for (let j = 0; j < parts.length; j++) {
                                if (!parts[j]) continue;

                                if (j % 2 === 0) {
                                    // Orijinal metin
                                    const newRun = xmlDoc.createElement("w:r");
                                    if (rPr) newRun.appendChild(rPr.cloneNode(true));
                                    const newWt = xmlDoc.createElement("w:t");
                                    newWt.setAttribute("xml:space", "preserve");
                                    newWt.textContent = parts[j];
                                    newRun.appendChild(newWt);
                                    fragment.appendChild(newRun);
                                } else {
                                    // Stil uygulanacak hedef kelime
                                    const highlightRun = xmlDoc.createElement("w:r");
                                    const newRPr = xmlDoc.createElement("w:rPr");
                                    
                                    if (rPr) {
                                        Array.from(rPr.childNodes).forEach(child => newRPr.appendChild(child.cloneNode(true)));
                                    }

                                    // Uygulanacak Formatlar
                                    if (isBold) newRPr.appendChild(xmlDoc.createElement("w:b"));
                                    if (isItalic) newRPr.appendChild(xmlDoc.createElement("w:i"));
                                    if (isUnderline) {
                                        const u = xmlDoc.createElement("w:u");
                                        u.setAttribute("w:val", "single");
                                        newRPr.appendChild(u);
                                    }
                                    if (color && color !== "#000000") {
                                        const c = xmlDoc.createElement("w:color");
                                        c.setAttribute("w:val", color.replace("#", ""));
                                        newRPr.appendChild(c);
                                    }
                                    
                                    highlightRun.appendChild(newRPr);
                                    const highlightWt = xmlDoc.createElement("w:t");
                                    highlightWt.setAttribute("xml:space", "preserve");
                                    highlightWt.textContent = parts[j];
                                    highlightRun.appendChild(highlightWt);
                                    fragment.appendChild(highlightRun);
                                    
                                    totalReplacements++;
                                }
                            }
                            
                            parentP.insertBefore(fragment, parentR);
                            parentP.removeChild(parentR);
                            modified = true;
                        }
                    }

                    if (modified) {
                        const newXml = serializer.serializeToString(xmlDoc);
                        docArchive.file(filename, newXml);
                    }
                }
            }

            setStatus("Belge kaydediliyor...");
            const modifiedBlob = await docArchive.generateAsync({ type: "blob" });
            saveAs(modifiedBlob, "Degistirilmis_" + file.name);
            
            setStatus(`Başarılı! Toplam ${totalReplacements} yerde değişiklik yapıldı.`);
            setTimeout(() => {
                setIsProcessing(false);
                setFile(null);
                setStatus("");
                setTargetWords([]);
                setWordInput("");
            }, 3000);

        } catch (err) {
            console.error("Word düzenleme hatası:", err);
            setStatus("Hata oluştu! Lütfen geçerli bir Word belgesi yükleyin.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] font-sans flex flex-col">
            <header className="px-6 py-4 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md text-white">
                            <Type size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Word Metin Stili Değiştirici</h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Word belgenizdeki spesifik bir kelimeye otomatik stil verin</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8 flex flex-col justify-center items-center">
                <div className="w-full bg-white dark:bg-slate-800/90 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none border border-indigo-50 dark:border-slate-700 p-8 md:p-10 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="relative z-10 w-full flex flex-col gap-10">

                        {/* File Upload Section */}
                        {!file ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-16 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-500/20 transition-all group">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform text-indigo-500">
                                    <Upload size={36} />
                                </div>
                                <span className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Word (DOCX) Belgenizi Yükleyin</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">Üzerinde değişiklik yapılacak olan dosyayı seçin</span>
                                <input 
                                    type="file" 
                                    accept=".docx" 
                                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} 
                                    className="hidden" 
                                />
                            </label>
                        ) : (
                            <div className="flex flex-col gap-8 w-full">
                                {/* Selected File View */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleFileSelect(null)}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        Değiştir
                                    </button>
                                </div>

                                {/* Document Preview */}
                                <div className="w-full h-48 md:h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-inner relative">
                                    <div className="sticky top-0 float-right bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl z-20 shadow-sm border border-indigo-200 dark:border-indigo-800">
                                        BELGE ÖNİZLEME
                                    </div>
                                    {isLoadingPreview ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                                            <RefreshCw size={24} className="animate-spin text-indigo-500" />
                                            <span className="text-sm font-medium">Önizleme hazırlanıyor...</span>
                                        </div>
                                    ) : (
                                        <div 
                                            className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 opacity-80"
                                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                                        />
                                    )}
                                </div>

                                {/* Form Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hedef Kelimeler (Enter tuşu ile ekleyin)</label>
                                        <div className="w-full flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition-all focus-within:ring-2 focus-within:ring-indigo-500 min-h-[56px] items-center">
                                            {targetWords.map((word, idx) => (
                                                <span key={idx} className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                                                    {word}
                                                    <button onClick={() => removeWord(word)} className="text-indigo-400 hover:text-red-500 ml-1 transition-colors">
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={wordInput}
                                                onChange={(e) => setWordInput(e.target.value)}
                                                onKeyDown={handleWordKeyDown}
                                                placeholder={targetWords.length === 0 ? "Örn: elma (yazıp Enter'a basın)" : "Yeni kelime..."} 
                                                className="flex-1 min-w-[150px] bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-500">Bu kelimelerin tümü belgede bulunduğunda belirttiğiniz stile dönüşecek.</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stil Ayarları</label>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button 
                                                onClick={() => setIsBold(!isBold)}
                                                className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg transition-all", isBold ? "bg-slate-800 text-white dark:bg-indigo-500 dark:text-white shadow-md font-bold" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}
                                            >
                                                K
                                            </button>
                                            <button 
                                                onClick={() => setIsItalic(!isItalic)}
                                                className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg italic transition-all", isItalic ? "bg-slate-800 text-white dark:bg-indigo-500 dark:text-white shadow-md" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}
                                            >
                                                T
                                            </button>
                                            <button 
                                                onClick={() => setIsUnderline(!isUnderline)}
                                                className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg underline transition-all", isUnderline ? "bg-slate-800 text-white dark:bg-indigo-500 dark:text-white shadow-md" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}
                                            >
                                                A
                                            </button>
                                            
                                            <div className="relative flex items-center ml-2">
                                                <input 
                                                    type="color" 
                                                    value={color}
                                                    onChange={e => setColor(e.target.value)}
                                                    className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                                                />
                                                <div 
                                                    className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                                                    style={{ backgroundColor: color }}
                                                >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="mt-4 flex flex-col items-center">
                                    <button 
                                        onClick={processWordFile}
                                        disabled={targetWords.length === 0 || isProcessing}
                                        className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw size={20} className="animate-spin" />
                                                <span>{status || "İşleniyor..."}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={20} />
                                                <span>Stili Uygula ve İndir</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    {!isProcessing && status && (
                                        <p className="mt-4 text-sm font-bold text-emerald-600 flex items-center gap-1">
                                            <Check size={16} /> {status}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
