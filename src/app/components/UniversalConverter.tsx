"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, FileText, Image as ImageIcon, File, PieChart, FileSearch, Download, RefreshCw, Wand2, ShieldCheck, Zap, Layers, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "./editor/utils";

export type Format = "docx" | "pdf" | "pptx" | "png" | "jpg";

const FORMATS: { id: Format; label: string; icon: any; color: string; border: string }[] = [
    { id: "docx", label: "Word", icon: FileText, color: "text-blue-500 bg-blue-500/10", border: "border-blue-500/20" },
    { id: "pdf", label: "PDF", icon: FileSearch, color: "text-rose-500 bg-rose-500/10", border: "border-rose-500/20" },
    { id: "pptx", label: "PowerPoint", icon: PieChart, color: "text-orange-500 bg-orange-500/10", border: "border-orange-500/20" },
    { id: "png", label: "PNG Image", icon: ImageIcon, color: "text-emerald-500 bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "jpg", label: "JPG Image", icon: ImageIcon, color: "text-amber-500 bg-amber-500/10", border: "border-amber-500/20" },
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
        if (!SUPPORTED_CONVERSIONS[fmt].includes(outputFormat)) {
            setOutputFormat(SUPPORTED_CONVERSIONS[fmt][0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const runConversion = async () => {
        if (!selectedFile) return;
        setIsConverting(true);
        setStatusText("Mounting Virtual Canvas...");
        try {
            if (inputFormat === "docx" && outputFormat === "pdf") await docxToPdf(selectedFile);
            else if (inputFormat === "docx" && outputFormat === "pptx") await docxToPptx(selectedFile);
            else if (inputFormat === "docx" && outputFormat === "png") await docxToPng(selectedFile);
            else if (inputFormat === "pdf" && outputFormat === "pptx") await pdfToPptx(selectedFile);
            else if (inputFormat === "pdf" && outputFormat === "png") await pdfToPng(selectedFile);
            else if (inputFormat === "pdf" && outputFormat === "docx") {
                onOpenPdfInEditor(selectedFile);
                return; 
            }
            else if (inputFormat === "pptx" && outputFormat === "pdf") await pptxToPdf(selectedFile);
            else if (inputFormat === "pptx" && outputFormat === "png") await pptxToPng(selectedFile);
            else if ((inputFormat === "png" || inputFormat === "jpg") && outputFormat === "pdf") await imgToPdf(selectedFile);
            else if ((inputFormat === "png" || inputFormat === "jpg") && outputFormat === "docx") await imgToDocx(selectedFile);
            
            setStatusText("Deployment Successful!");
            setTimeout(() => {
                setIsConverting(false);
                setSelectedFile(null);
            }, 2000);
        } catch (err) {
            console.error("Conversion error:", err);
            setStatusText("Operation Failed.");
            setTimeout(() => setIsConverting(false), 3000);
        }
    };

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
                    zip.file(`page_${i + 1}.png`, blob);
                }
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_pages.zip");
        }
        document.body.removeChild(container);
    };

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
        const jsPDF = (await import("jspdf")).default;
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

    const pptxToPng = async (file: File) => {
        const JSZip = (await import("jszip")).default;
        const { saveAs } = await import("file-saver");
        const zip = new JSZip();
        const content2 = await zip.loadAsync(file);
        const mediaFiles = Object.keys(content2.files).filter(p => p.startsWith("ppt/media/") && (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg")));
        if (mediaFiles.length === 0) throw new Error("No image content found.");
        if (mediaFiles.length === 1) {
            const imgData = await content2.files[mediaFiles[0]].async("blob");
            saveAs(imgData, file.name.replace(/\.[^/.]+$/, "") + ".png");
        } else {
            const outZip = new JSZip();
            for (let i = 0; i < mediaFiles.length; i++) {
                const blob = await content2.files[mediaFiles[i]].async("blob");
                const ext = mediaFiles[i].split(".").pop();
                outZip.file(`slide_${i + 1}.${ext}`, blob);
            }
            const zipBlob = await outZip.generateAsync({ type: "blob" });
            saveAs(zipBlob, file.name.replace(/\.[^/.]+$/, "") + "_images.zip");
        }
    };

    const pptxToPdf = async (file: File) => {
        const JSZip = (await import("jszip")).default;
        const jsPDF = (await import("jspdf")).default;
        const zip = new JSZip();
        const content = await zip.loadAsync(file);
        const mediaFiles = Object.keys(content.files).filter(path => path.startsWith("ppt/media/") && (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg")));
        if (mediaFiles.length === 0) throw new Error("No image content found.");
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
                zip.file(`${baseName}_page_${i}.png`, blob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_pages.zip");
        }
    };

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
            sections: [{ properties: {}, children: [new Paragraph({ children: [new ImageRun({ data: arrayBuffer, transformation: { width: w, height: h }, type: file.type === "image/png" ? "png" : "jpg" })] })] }]
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, file.name.replace(/\.[^/.]+$/, "") + ".docx");
    };

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
                        const pdf = new jsPDF({ orientation: img.width > img.height ? "landscape" : "portrait", unit: "px", format: [img.width, img.height] });
                        pdf.addImage(dataUrl, file.type === "image/jpeg" ? "JPEG" : "PNG", 0, 0, img.width, img.height);
                        pdf.save(file.name.replace(/\.[^/.]+$/, "") + ".pdf");
                        resolve();
                    } catch (e) { reject(e); }
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
            <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Universal Converter</h1>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase flex items-center gap-2">
                           <ShieldCheck size={12} /> High-Fidelity Logic • Private
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-8 flex flex-col items-center">
                <div className="w-full bg-white dark:bg-slate-900/40 rounded-[3rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                        {/* Source Format */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                <Layers size={14} /> Source Specification
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMATS.map(f => (
                                    <button 
                                        key={f.id} 
                                        onClick={() => handleInputFormatChange(f.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95",
                                            inputFormat === f.id ? "border-blue-600 bg-blue-50/50 dark:bg-blue-600/10 shadow-lg" : "border-zinc-100 dark:border-white/5 opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", f.color)}>
                                            <f.icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tight">{f.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Result Format */}
                        <div className="space-y-6 relative">
                            <div className="absolute left-[-2.5rem] top-[60%] hidden md:flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg z-10 animate-pulse">
                                <ArrowRight size={20} />
                            </div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                <Zap size={14} /> Output Destination
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMATS.map(f => {
                                    const isSupported = SUPPORTED_CONVERSIONS[inputFormat].includes(f.id);
                                    return (
                                        <button 
                                            key={f.id} 
                                            disabled={!isSupported}
                                            onClick={() => setOutputFormat(f.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95",
                                                !isSupported ? "opacity-10 cursor-not-allowed grayscale" :
                                                outputFormat === f.id ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/10 shadow-lg" : "border-zinc-100 dark:border-white/5 opacity-40 hover:opacity-100"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", f.color)}>
                                                <f.icon size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{f.id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {!selectedFile ? (
                        <label className="group border-2 border-dashed border-blue-600/20 hover:border-blue-600/50 bg-blue-600/[0.02] hover:bg-blue-600/[0.05] transition-all rounded-[2.5rem] p-16 flex flex-col items-center justify-center cursor-pointer text-center">
                            <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={36} />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Drop {inputFormat} File</h3>
                            <p className="text-zinc-500 font-medium text-sm">Targeted format conversion starts instantly.</p>
                            <input type="file" accept={`.${inputFormat}`} onChange={handleFileChange} className="hidden" />
                        </label>
                    ) : (
                        <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center shadow-inner">
                            <div className="flex items-center gap-6 mb-10 w-full px-6">
                                <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-3xl flex items-center justify-center text-blue-600 shadow-xl">
                                    <File size={40} />
                                </div>
                                <div className="flex-1 truncate">
                                    <h4 className="text-lg font-black text-zinc-900 dark:text-white truncate">{selectedFile.name}</h4>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • READY FOR COMPILATION</p>
                                </div>
                                <button onClick={() => setSelectedFile(null)} className="p-3 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all"><X size={24} /></button>
                            </div>
                            
                            <button 
                                onClick={runConversion}
                                disabled={isConverting}
                                className="w-full max-w-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                            >
                                {isConverting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                                {statusText || `Convert to ${outputFormat.toUpperCase()}`}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
