"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, FileText, Image as ImageIcon, File, PieChart, FileSearch, Download, RefreshCw, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./editor/utils";

export type Format = "docx" | "pdf" | "pptx" | "png" | "jpg";

const FORMATS: { id: Format; label: string; icon: any; color: string }[] = [
    { id: "docx", label: "Word (.docx)", icon: FileText, color: "text-blue-600 bg-blue-50" },
    { id: "pdf", label: "PDF (.pdf)", icon: FileSearch, color: "text-red-500 bg-red-50" },
    { id: "pptx", label: "PowerPoint (.pptx)", icon: PieChart, color: "text-orange-500 bg-orange-50" },
    { id: "png", label: "PNG Görsel (.png)", icon: ImageIcon, color: "text-emerald-500 bg-emerald-50" },
    { id: "jpg", label: "JPG Görsel (.jpg)", icon: ImageIcon, color: "text-amber-500 bg-amber-50" },
];

const SUPPORTED_CONVERSIONS: Record<Format, Format[]> = {
    docx: ["pdf", "pptx", "png"],
    pdf: ["pptx", "png", "docx"],
    pptx: ["pdf", "png"],
    png: ["pdf", "docx"],
    jpg: ["pdf", "docx"],
};

interface UniversalConverterProps {
    onBack: () => void;
    // We pass handleOpenEditor if pdf->docx needs to happen via editor
    onOpenPdfInEditor: (file: File) => void;
}

export default function UniversalConverter({ onBack, onOpenPdfInEditor }: UniversalConverterProps) {
    const [inputFormat, setInputFormat] = useState<Format>("docx");
    const [outputFormat, setOutputFormat] = useState<Format>("pdf");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [statusText, setStatusText] = useState("");

    const handleInputFormatChange = (fmt: Format) => {
        setInputFormat(fmt);
        setSelectedFile(null);
        // Otomatik çıktı formatı düzeltme
        if (!SUPPORTED_CONVERSIONS[fmt].includes(outputFormat)) {
            setOutputFormat(SUPPORTED_CONVERSIONS[fmt][0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const runConversion = async () => {
        if (!selectedFile) return;
        setIsConverting(true);
        setStatusText("Dönüştürülüyor, lütfen bekleyin...");
        
        try {
            if (inputFormat === "docx" && outputFormat === "pdf") await docxToPdf(selectedFile);
            else if (inputFormat === "docx" && outputFormat === "pptx") await docxToPptx(selectedFile);
            else if (inputFormat === "docx" && outputFormat === "png") await docxToPng(selectedFile);
            else if (inputFormat === "pdf" && outputFormat === "pptx") await pdfToPptx(selectedFile);
            else if (inputFormat === "pdf" && outputFormat === "png") await pdfToPng(selectedFile);
            else if (inputFormat === "pdf" && outputFormat === "docx") {
                // Özel durum: Editor'de aç
                onOpenPdfInEditor(selectedFile);
                return; 
            }
            else if (inputFormat === "pptx" && outputFormat === "pdf") await pptxToPdf(selectedFile);
            else if (inputFormat === "pptx" && outputFormat === "png") await pptxToPng(selectedFile);
            else if ((inputFormat === "png" || inputFormat === "jpg") && outputFormat === "pdf") await imgToPdf(selectedFile);
            else if ((inputFormat === "png" || inputFormat === "jpg") && outputFormat === "docx") await imgToDocx(selectedFile);
            
            setStatusText("Dönüştürme Başarılı!");
            setTimeout(() => {
                setIsConverting(false);
                setSelectedFile(null);
            }, 2000);
        } catch (err) {
            console.error("Dönüştürme hatası:", err);
            setStatusText("Dönüştürme sırasında hata oluştu!");
            setTimeout(() => setIsConverting(false), 3000);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // CONVERSION LOGICS (Ported from page.tsx)
    // ─────────────────────────────────────────────────────────────────────────────

    // DOCX -> PPTX
    const docxToPptx = async (file: File) => {
        const mammoth = await import("mammoth");
        const PptxGenJS = (await import("pptxgenjs")).default;
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const paragraphs = Array.from(tempDiv.querySelectorAll("h1,h2,h3,p,li")).map(el => el.textContent || "").filter(t => t.trim());
        const pptx = new PptxGenJS();
        pptx.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });
        pptx.layout = "CUSTOM";
        
        const titleSlide = pptx.addSlide();
        titleSlide.addText(paragraphs[0] || file.name, { x: 1, y: 1.5, w: 8, h: 2, fontSize: 36, bold: true, color: "1e293b", align: "center" });
        for (let i = 1; i < paragraphs.length; i += 5) {
            const slide = pptx.addSlide();
            const chunk = paragraphs.slice(i, i + 5).join("\n\n");
            slide.addText(chunk, { x: 0.5, y: 0.5, w: 9, h: 4.5, fontSize: 16, color: "334155", valign: "top" });
        }
        await pptx.writeFile({ fileName: file.name.replace(/\.[^/.]+$/, "") + ".api.pptx" });
    };

    // DOCX -> PNG
    const docxToPng = async (file: File) => {
        const mammoth = await import("mammoth");
        const htmlToImage = await import("html-to-image");
        const { saveAs } = await import("file-saver");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:0;top:-20000px;width:794px;background:white;padding:40px;box-sizing:border-box;font-family:sans-serif;line-height:1.5;color:black;";
        container.innerHTML = result.value;
        document.body.appendChild(container);
        
        const images = container.getElementsByTagName("img");
        await Promise.all(Array.from(images).map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })));
        await new Promise(r => setTimeout(r, 600));

        const A4_HEIGHT = 1123;
        const totalPages = Math.ceil(container.offsetHeight / A4_HEIGHT) || 1;
        const baseName = file.name.replace(/\.[^/.]+$/, "");

        if (totalPages === 1) {
            const canvas = await htmlToImage.toCanvas(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: 794, height: A4_HEIGHT });
            canvas.toBlob(blob => { if (blob) saveAs(blob, baseName + ".png"); }, "image/png");
        } else {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            const fullCanvas = await htmlToImage.toCanvas(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: 794 });
            for (let i = 0; i < totalPages; i++) {
                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = 794 * 2;
                pageCanvas.height = A4_HEIGHT * 2;
                const ctx = pageCanvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(fullCanvas, 0, i * A4_HEIGHT * 2, 794 * 2, A4_HEIGHT * 2, 0, 0, 794 * 2, A4_HEIGHT * 2);
                    const blob: Blob = await new Promise(resolve => pageCanvas.toBlob(b => resolve(b!), "image/png"));
                    zip.file(`${baseName}_sayfa_${i + 1}.png`, blob);
                }
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_sayfalar.zip");
        }
        document.body.removeChild(container);
    };

    // DOCX -> PDF
    const docxToPdf = async (file: File) => {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:0;top:-10000px;width:210mm;min-height:297mm;background:white;padding:2.54cm;box-sizing:border-box;opacity:1;";
        container.innerHTML = result.value;
        document.body.appendChild(container);
        
        const images = container.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })));
        await new Promise(resolve => setTimeout(resolve, 800));

        const jsPDFModule = await import("jspdf");
        const jsPDF = jsPDFModule.default;
        const htmlToImage = await import("html-to-image");

        const A4_HEIGHT_PX = 1123; 
        const totalPages = Math.ceil(container.offsetHeight / A4_HEIGHT_PX) || 1;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const canvas = await htmlToImage.toCanvas(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: 794 });
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        const pdfWidth = 210;
        const pdfHeight = 297;
        const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -(i * pdfHeight), pdfWidth, imgHeightMm, undefined, 'FAST');
        }
        pdf.save(file.name.replace(".docx", ".pdf"));
        document.body.removeChild(container);
    };

    // PPTX -> PNG
    const pptxToPng = async (file: File) => {
        const JSZip = (await import("jszip")).default;
        const { saveAs } = await import("file-saver");
        const zip = new JSZip();
        const content2 = await zip.loadAsync(file);
        const mediaFiles = Object.keys(content2.files).filter(p => p.startsWith("ppt/media/") && (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg")));
        if (mediaFiles.length === 0) throw new Error("Görsel içerik bulunamadı.");
        
        if (mediaFiles.length === 1) {
            const imgData = await content2.files[mediaFiles[0]].async("blob");
            saveAs(imgData, file.name.replace(/\.[^/.]+$/, "") + ".png");
        } else {
            const outZip = new JSZip();
            for (let i = 0; i < mediaFiles.length; i++) {
                const blob = await content2.files[mediaFiles[i]].async("blob");
                const ext = mediaFiles[i].split(".").pop();
                outZip.file(`slayt_${i + 1}.${ext}`, blob);
            }
            const zipBlob = await outZip.generateAsync({ type: "blob" });
            saveAs(zipBlob, file.name.replace(/\.[^/.]+$/, "") + "_gorseller.zip");
        }
    };

    // PPTX -> PDF
    const pptxToPdf = async (file: File) => {
        const JSZip = (await import("jszip")).default;
        const jsPDF = (await import("jspdf")).default;
        const zip = new JSZip();
        const content = await zip.loadAsync(file);
        const mediaFiles = Object.keys(content.files).filter(path => path.startsWith("ppt/media/") && (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg")));
        if (mediaFiles.length === 0) throw new Error("Görsel içerik bulunamadı.");

        const pdf = new jsPDF({ unit: 'px', compress: true });
        for (let i = 0; i < mediaFiles.length; i++) {
            const imgData = await content.files[mediaFiles[i]].async("base64");
            const format = mediaFiles[i].endsWith(".png") ? "PNG" : "JPEG";
            const img = new Image();
            img.src = `data:image/${format.toLowerCase()};base64,${imgData}`;
            await new Promise((resolve) => { img.onload = resolve; });
            const imgWidth = img.width; const imgHeight = img.height;
            if (i > 0) pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
            else {
                (pdf as any).internal.pageSize.width = imgWidth;
                (pdf as any).internal.pageSize.height = imgHeight;
            }
            pdf.addImage(`data:image/${format.toLowerCase()};base64,${imgData}`, format, 0, 0, imgWidth, imgHeight);
        }
        pdf.save(file.name.replace(/\.[^/.]+$/, "") + ".pdf");
    };

    // PDF -> PPTX
    const pdfToPptx = async (file: File) => {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";
        const PptxGenJS = (await import("pptxgenjs")).default;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pptx = new PptxGenJS();

        const firstPage = await pdf.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 1.0 });
        pptx.defineLayout({ name: 'CUSTOM_PDF', width: firstViewport.width / 72, height: firstViewport.height / 72 });
        pptx.layout = 'CUSTOM_PDF';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const renderViewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = renderViewport.width; canvas.height = renderViewport.height;
            if (context) {
                await (page as any).render({ canvasContext: context, viewport: renderViewport }).promise;
                const imgData = canvas.toDataURL("image/png");
                const slide = pptx.addSlide();
                slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
            }
        }
        await pptx.writeFile({ fileName: file.name.replace(/\.[^/.]+$/, "") + ".pptx" });
    };

    // PDF -> PNG
    const pdfToPng = async (file: File) => {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";
        const { saveAs } = await import("file-saver");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const baseName = file.name.replace(/\.[^/.]+$/, "");

        if (pdf.numPages === 1) {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width; canvas.height = viewport.height;
            await (page as any).render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
            canvas.toBlob(blob => { if (blob) saveAs(blob, baseName + ".png"); }, "image/png");
        } else {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width; canvas.height = viewport.height;
                await (page as any).render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), "image/png"));
                zip.file(`${baseName}_sayfa_${i}.png`, blob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_sayfalar.zip");
        }
    };

    // IMAGE -> DOCX
    const imgToDocx = async (file: File) => {
        const { Document, Packer, Paragraph, ImageRun } = await import("docx");
        const { saveAs } = await import("file-saver");
        const arrayBuffer = await file.arrayBuffer();

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });

        const maxWidth = 600;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: arrayBuffer,
                                    transformation: { width: w, height: h },
                                    type: file.type === "image/png" ? "png" : "jpg",
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, file.name.replace(/\.[^/.]+$/, "") + ".docx");
    };

    // IMAGE -> PDF
    const imgToPdf = async (file: File) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const dataUrl = reader.result as string;
                const img = new Image();
                img.src = dataUrl;
                img.onload = async () => {
                    try {
                        const jsPDF = (await import("jspdf")).default;
                        const pdf = new jsPDF({
                            orientation: img.width > img.height ? "landscape" : "portrait",
                            unit: "px",
                            format: [img.width, img.height],
                        });
                        pdf.addImage(dataUrl, file.type === "image/jpeg" ? "JPEG" : "PNG", 0, 0, img.width, img.height);
                        pdf.save(file.name.replace(/\.[^/.]+$/, "") + ".pdf");
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-zinc-100 dark:from-[#0a0a1a] dark:via-[#0d0d24] dark:to-[#0a0a1a] flex flex-col font-sans">
            <header className="px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#0d0d1a]/80 sticky top-0 z-50 border-b border-zinc-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 leading-tight">Evrensel Dönüştürücü</h1>
                            <p className="text-[11px] font-medium text-zinc-400">Tüm formatlar arasında tek tıkla dönüşüm</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col items-center justify-center">
                <div className="w-full bg-white dark:bg-slate-800 rounded-3xl border border-zinc-200 dark:border-slate-700 shadow-xl p-8 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 mb-3">Format Dönüştürücü</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">İstediğiniz girdi ve çıktı formatını seçin, gerisini yapay zeka halletsin.</p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                            {/* Input Format Selector */}
                            <div className="flex-1 w-full bg-zinc-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-zinc-200 dark:border-slate-600">
                                <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-4 uppercase tracking-wider text-center">Girdi Formatı (Dönüşen)</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {FORMATS.map(f => (
                                        <button 
                                            key={f.id} 
                                            onClick={() => handleInputFormatChange(f.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                                                inputFormat === f.id ? "border-blue-500 bg-white dark:bg-slate-800 shadow-md transform scale-105" : "border-zinc-200 dark:border-slate-600 hover:border-zinc-300 bg-white/50 dark:bg-slate-800/50 grayscale hover:grayscale-0"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", f.color)}>
                                                <f.icon size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{f.id.toUpperCase()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full items-center justify-center text-white shadow-lg shrink-0 z-10">
                                <ArrowRight size={28} />
                            </div>

                            {/* Output Format Selector */}
                            <div className="flex-1 w-full bg-blue-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-blue-100 dark:border-indigo-800/30">
                                <label className="block text-sm font-bold text-blue-800 dark:text-indigo-300 mb-4 uppercase tracking-wider text-center">Çıktı Formatı (Dönüştürülen)</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {FORMATS.map(f => {
                                        const isSupported = SUPPORTED_CONVERSIONS[inputFormat].includes(f.id);
                                        return (
                                            <button 
                                                key={f.id} 
                                                disabled={!isSupported}
                                                onClick={() => setOutputFormat(f.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                                                    !isSupported ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-slate-700" :
                                                    outputFormat === f.id ? "border-indigo-500 bg-white dark:bg-slate-800 shadow-md transform scale-105" : "border-blue-200 dark:border-indigo-800/50 hover:border-blue-400 bg-white/50 dark:bg-slate-800/50 grayscale hover:grayscale-0"
                                                )}
                                            >
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", f.color)}>
                                                    <f.icon size={20} />
                                                </div>
                                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{f.id.toUpperCase()}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="flex flex-col items-center">
                            {!selectedFile ? (
                                <label className="w-full flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-indigo-600/50 bg-blue-50 dark:bg-indigo-900/20 rounded-2xl p-10 cursor-pointer hover:bg-blue-100 dark:hover:bg-indigo-900/40 transition-colors group">
                                    <div className="flex flex-col items-center text-blue-600 dark:text-indigo-400">
                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                            <Upload size={32} />
                                        </div>
                                        <span className="text-lg font-bold mb-1">Dönüştürülecek {inputFormat.toUpperCase()} Dosyasını Seçin</span>
                                        <span className="text-sm opacity-80">veya sürükleyip bırakın</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept={`.${inputFormat}`} 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                    />
                                </label>
                            ) : (
                                <div className="w-full bg-zinc-50 dark:bg-slate-700/50 border border-zinc-200 dark:border-slate-600 rounded-2xl p-6 flex flex-col items-center">
                                    <File size={48} className="text-blue-500 mb-4" />
                                    <p className="font-bold text-zinc-800 dark:text-zinc-100 mb-2 truncate max-w-sm">{selectedFile.name}</p>
                                    <p className="text-sm text-zinc-500 mb-6">Boyut: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setSelectedFile(null)}
                                            className="px-6 py-3 rounded-xl font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600 hover:bg-zinc-100 dark:hover:bg-slate-600 transition-colors"
                                            disabled={isConverting}
                                        >
                                            İptal
                                        </button>
                                        <button 
                                            onClick={runConversion}
                                            disabled={isConverting}
                                            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {isConverting ? (
                                                <RefreshCw size={20} className="animate-spin" />
                                            ) : (
                                                <Wand2 size={20} />
                                            )}
                                            Dönüştür ({inputFormat.toUpperCase()} → {outputFormat.toUpperCase()})
                                        </button>
                                    </div>

                                    {statusText && (
                                        <p className="mt-4 text-sm font-bold text-blue-600 dark:text-indigo-400">{statusText}</p>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
