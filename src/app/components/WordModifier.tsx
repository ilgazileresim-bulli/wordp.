"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Upload, FileText, Type, Check, Download, Wand2, RefreshCw, X, Palette, Bold, Italic, Underline, Loader2 } from "lucide-react";
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

    const [isBold, setIsBold] = useState(true);
    const [isItalic, setIsItalic] = useState(false);
    const [color, setColor] = useState("#4F46E5"); 
    const [isUnderline, setIsUnderline] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");

    const highlightedHtml = useMemo(() => {
        if (!previewHtml || targetWords.length === 0) return previewHtml || "<p class='opacity-50 italic'>No readable text found.</p>";
        let styleStr = "";
        if (isBold) styleStr += "font-weight: bold; ";
        if (isItalic) styleStr += "font-style: italic; ";
        if (isUnderline) styleStr += "text-decoration: underline; ";
        if (color && color !== "#000000") styleStr += `color: ${color}; `;
        if (!styleStr) styleStr = "background-color: rgba(99, 102, 241, 0.2); color: inherit;";
        const escapedWords = targetWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(`(?![^<]*>)(${escapedWords})`, 'gi');
        return previewHtml.replace(regex, `<span style="${styleStr} border-radius: 2px; padding: 0 2px;">$1</span>`);
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
                console.error("Preview error:", err);
                setPreviewHtml("<p class='text-red-500'>Preview failed to load.</p>");
            } finally {
                setIsLoadingPreview(false);
            }
        }
    };

    const processWordFile = async () => {
        if (!file || targetWords.length === 0) return;
        setIsProcessing(true);
        setStatus("Mounting Document...");

        try {
            const JSZip = (await import("jszip")).default;
            const { saveAs } = await import("file-saver");
            const zip = new JSZip();
            const docArchive = await zip.loadAsync(file);
            setStatus("Injecting Styles...");
            const parser = new DOMParser();
            const serializer = new XMLSerializer();
            let totalReplacements = 0;

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
                            const parentR = wt.parentNode;
                            if (!parentR || parentR.nodeName !== "w:r") continue;
                            const parentP = parentR.parentNode;
                            if (!parentP) continue;
                            const fragment = xmlDoc.createDocumentFragment();
                            const rPr = Array.from(parentR.childNodes).find(n => n.nodeName === "w:rPr");
                            for (let j = 0; j < parts.length; j++) {
                                if (!parts[j]) continue;
                                if (j % 2 === 0) {
                                    const newRun = xmlDoc.createElement("w:r");
                                    if (rPr) newRun.appendChild(rPr.cloneNode(true));
                                    const newWt = xmlDoc.createElement("w:t");
                                    newWt.setAttribute("xml:space", "preserve");
                                    newWt.textContent = parts[j];
                                    newRun.appendChild(newWt);
                                    fragment.appendChild(newRun);
                                } else {
                                    const highlightRun = xmlDoc.createElement("w:r");
                                    const newRPr = xmlDoc.createElement("w:rPr");
                                    if (rPr) Array.from(rPr.childNodes).forEach(child => newRPr.appendChild(child.cloneNode(true)));
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
            setStatus("Exporting Result...");
            const modifiedBlob = await docArchive.generateAsync({ type: "blob" });
            saveAs(modifiedBlob, "Styled_" + file.name);
            setStatus(`Success! Optimized ${totalReplacements} instances.`);
            setTimeout(() => {
                setIsProcessing(false);
                setFile(null);
                setStatus("");
                setTargetWords([]);
            }, 3000);
        } catch (err) {
            console.error("Word edit error:", err);
            setStatus("Process Failed.");
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
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Type size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Word Stylist</h1>
                        <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black tracking-widest uppercase">Intelligent Batch Styling Engine</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-8 flex flex-col items-center">
                <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-white/5 overflow-hidden">
                    {!file ? (
                        <label className="group p-24 flex flex-col items-center justify-center cursor-pointer text-center">
                            <div className="w-24 h-24 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                                <Upload size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-3 uppercase tracking-tight">Import DOCX</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Select a document to begin batch processing.</p>
                            <input type="file" accept=".docx" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Left Side: Preview */}
                            <div className="p-10 border-r border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} /> Living Preview
                                    </h2>
                                    <button onClick={() => handleFileSelect(null)} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Replace File</button>
                                </div>
                                <div className="bg-white dark:bg-black/40 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 h-[500px] overflow-auto shadow-inner relative custom-scrollbar">
                                    {isLoadingPreview ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
                                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Rendering DOM...</span>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Controls */}
                            <div className="p-10 flex flex-col justify-between">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <Wand2 size={14} /> Target Entities
                                        </label>
                                        <div className="bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex flex-wrap gap-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                                            {targetWords.map((word, idx) => (
                                                <span key={idx} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                                                    {word}
                                                    <X size={14} className="cursor-pointer hover:scale-110" onClick={() => removeWord(word)} />
                                                </span>
                                            ))}
                                            <input 
                                                className="bg-transparent outline-none flex-1 min-w-[120px] text-sm font-bold placeholder:text-zinc-400"
                                                placeholder={targetWords.length ? "Add more..." : "Type words and hit Enter..."}
                                                value={wordInput}
                                                onChange={e => setWordInput(e.target.value)}
                                                onKeyDown={handleWordKeyDown}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <Palette size={14} /> Visual Signature
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setIsBold(!isBold)} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg", isBold ? "bg-indigo-600 text-white shadow-indigo-600/30" : "bg-zinc-100 dark:bg-white/5 text-zinc-400")}>
                                                <Bold size={24} />
                                            </button>
                                            <button onClick={() => setIsItalic(!isItalic)} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg", isItalic ? "bg-indigo-600 text-white shadow-indigo-600/30" : "bg-zinc-100 dark:bg-white/5 text-zinc-400")}>
                                                <Italic size={24} />
                                            </button>
                                            <button onClick={() => setIsUnderline(!isUnderline)} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg", isUnderline ? "bg-indigo-600 text-white shadow-indigo-600/30" : "bg-zinc-100 dark:bg-white/5 text-zinc-400")}>
                                                <Underline size={24} />
                                            </button>
                                            <div className="relative group">
                                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-14 h-14 opacity-0 cursor-pointer absolute inset-0 z-10" />
                                                <div style={{ backgroundColor: color }} className="w-14 h-14 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-20">
                                    <button 
                                        onClick={processWordFile}
                                        disabled={!targetWords.length || isProcessing}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-6 rounded-3xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                                    >
                                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                                        {status || "Apply and Export DOCX"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
