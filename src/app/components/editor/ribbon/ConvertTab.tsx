"use client";

import React, { memo, useRef, useState } from "react";
import {
    Library,
    PieChart,
    ArrowRightLeft,
    Download,
    Upload,
    RefreshCw,
    Info,
    AlertCircle,
    Layout,
    FileText,
    FileCode,
    FileType,
    Hash,
    Printer,
    BookOpen,
    Table2,
    GraduationCap,
    FileSpreadsheet,
    FileArchive,
    Globe
} from "lucide-react";
import { cn } from "../utils";
import PptxGenJS from "pptxgenjs";

interface ConvertTabProps {
    editor?: any;
}

const ConvertTab = ({ editor }: ConvertTabProps) => {
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const pdfToPptxInputRef = useRef<HTMLInputElement>(null);
    const pptxToPdfInputRef = useRef<HTMLInputElement>(null);

    const handlePdfToPptx = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsConverting(true);
        setProgress(0);

        try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            const pptx = new PptxGenJS();

            const firstPage = await pdf.getPage(1);
            const firstViewport = firstPage.getViewport({ scale: 1.0 });
            const widthInches = firstViewport.width / 72;
            const heightInches = firstViewport.height / 72;

            pptx.defineLayout({ name: 'CUSTOM_PDF', width: widthInches, height: heightInches });
            pptx.layout = 'CUSTOM_PDF';

            for (let i = 1; i <= pdf.numPages; i++) {
                setProgress(Math.round((i / pdf.numPages) * 100));
                const page = await pdf.getPage(i);
                const renderViewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = renderViewport.width;
                canvas.height = renderViewport.height;

                if (context) {
                    await (page as any).render({ canvasContext: context, viewport: renderViewport }).promise;
                    const imgData = canvas.toDataURL("image/png");
                    const slide = pptx.addSlide();
                    slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
                }
            }

            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".pptx";
            await pptx.writeFile({ fileName });
            alert("Başarıyla dönüştürüldü! Sayfa düzeni korundu.");
        } catch (error) {
            console.error("PDF to PPTX Error:", error);
            alert("Dönüştürme sırasında bir hata oluştu.");
        } finally {
            setIsConverting(false);
            setProgress(0);
            if (pdfToPptxInputRef.current) pdfToPptxInputRef.current.value = "";
        }
    };

    const handlePptxToPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsConverting(true);
        setProgress(0);

        try {
            const JSZip = (await import("jszip")).default;
            const { jsPDF } = await import("jspdf");
            const zip = new JSZip();
            const content = await zip.loadAsync(file);

            const mediaFiles = Object.keys(content.files).filter(path =>
                path.startsWith("ppt/media/") &&
                (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg"))
            );

            if (mediaFiles.length === 0) {
                alert("Bu sunumdan dönüştürülecek görsel içerik bulunamadı.");
                return;
            }

            const pdf = new jsPDF({ unit: 'px', compress: true });

            for (let i = 0; i < mediaFiles.length; i++) {
                setProgress(Math.round((i / mediaFiles.length) * 100));
                const imgData = await content.files[mediaFiles[i]].async("base64");
                const format = mediaFiles[i].endsWith(".png") ? "PNG" : "JPEG";

                const img = new Image();
                img.src = `data:image/${format.toLowerCase()};base64,${imgData}`;
                await new Promise((resolve) => { img.onload = resolve; });

                const imgWidth = img.width;
                const imgHeight = img.height;

                if (i > 0) pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
                else {
                    (pdf as any).internal.pageSize.width = imgWidth;
                    (pdf as any).internal.pageSize.height = imgHeight;
                }

                pdf.addImage(`data:image/${format.toLowerCase()};base64,${imgData}`, format, 0, 0, imgWidth, imgHeight);
            }

            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".pdf";
            pdf.save(fileName);
            alert("Sunum başarıyla PDF'e dönüştürüldü!");
        } catch (error) {
            console.error("PPTX to PDF Error:", error);
            alert("Dönüştürme sırasında bir hata oluştu.");
        } finally {
            setIsConverting(false);
            setProgress(0);
            if (pptxToPdfInputRef.current) pptxToPdfInputRef.current.value = "";
        }
    };

    // ── New Export Tools ───────────────────────────────────────────────────
    const exportAsDocx = async () => {
        if (!editor) return;
        try {
            const html = editor.getHTML();
            const response = await fetch('/api/export-docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, title: 'belge' }),
            });
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const { saveAs } = await import("file-saver");
            saveAs(blob, 'belge.docx');
        } catch (err) {
            console.error("DOCX export error:", err);
            alert("DOCX dışa aktarımında hata oluştu.");
        }
    };

    const exportAsTxt = () => {
        if (!editor) return;
        const text = editor.getText();
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "belge.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAsHtml = () => {
        if (!editor) return;
        const html = `<!DOCTYPE html>\n<html lang="tr">\n<head><meta charset="UTF-8"><title>Belge</title>\n<style>body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333;}h1,h2,h3{color:#1e3a5f;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ddd;padding:8px;}</style>\n</head>\n<body>${editor.getHTML()}</body>\n</html>`;
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "belge.html";
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAsMarkdown = () => {
        if (!editor) return;
        const html = editor.getHTML();
        // Simple HTML to Markdown conversion
        let md = html
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
            .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
            .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
            .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i>(.*?)<\/i>/gi, '*$1*')
            .replace(/<u>(.*?)<\/u>/gi, '_$1_')
            .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
            .replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~')
            .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
            .replace(/<code>(.*?)<\/code>/gi, '`$1`')
            .replace(/<hr\s*\/?>/gi, '---\n\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "belge.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* PDF Conversion Group */}
            <div className="flex flex-col items-center h-full min-w-[150px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-2">
                    <input type="file" ref={pdfToPptxInputRef} className="hidden" accept=".pdf" onChange={handlePdfToPptx} disabled={isConverting} />
                    <div
                        onClick={() => !isConverting && pdfToPptxInputRef.current?.click()}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded cursor-pointer transition-all",
                            isConverting ? "opacity-50 cursor-not-allowed" : "hover:bg-white/60 bg-white/40 ring-1 ring-[#dadada]"
                        )}
                        title="PDF → PPTX Dönüştür"
                    >
                        <PieChart size={28} className="text-[#d04423]" strokeWidth={1.5} />
                        <span className="text-[9px] font-black text-zinc-800 mt-1">PDF → PPTX</span>
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                        <div className="text-[10px] text-zinc-600 font-bold border-b border-zinc-200 pb-1">PDF İşlemleri</div>
                        <div className="flex items-center gap-1.5 px-1 py-0.5 text-[9px] font-bold text-zinc-500">
                            <Info size={12} /> Hızlı Dönüşüm
                        </div>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">PDF Dönüştürücü</span>
            </div>

            {/* PPTX Conversion Group */}
            <div className="flex flex-col items-center h-full min-w-[150px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-2">
                    <input type="file" ref={pptxToPdfInputRef} className="hidden" accept=".pptx" onChange={handlePptxToPdf} disabled={isConverting} />
                    <div
                        onClick={() => !isConverting && pptxToPdfInputRef.current?.click()}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded cursor-pointer transition-all",
                            isConverting ? "opacity-50 cursor-not-allowed" : "hover:bg-white/60 bg-white/40 ring-1 ring-[#dadada]"
                        )}
                        title="PPTX → PDF Dönüştür"
                    >
                        <Library size={28} className="text-[#2b579a]" strokeWidth={1.5} />
                        <span className="text-[9px] font-black text-zinc-800 mt-1">PPTX → PDF</span>
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                        <div className="text-[10px] text-zinc-600 font-bold border-b border-zinc-200 pb-1">Sunum İşlemleri</div>
                        <div className="flex items-center gap-1.5 px-1 py-0.5 text-[9px] font-bold text-zinc-500">
                            <Layout size={12} /> Sayfa Düzeni
                        </div>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Sunum Dönüştürücü</span>
            </div>

            {/* Document Export Group — 4 NEW TOOLS */}
            <div className="flex flex-col items-center h-full min-w-[280px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={exportAsDocx} title="Word (DOCX) olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[60px] transition-all">
                        <FileText size={22} className="text-[#2b579a]" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">DOCX</span>
                    </button>
                    <button onClick={exportAsTxt} title="Düz metin (TXT) olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[60px] transition-all">
                        <FileType size={22} className="text-emerald-600" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">TXT</span>
                    </button>
                    <button onClick={exportAsHtml} title="HTML olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[60px] transition-all">
                        <FileCode size={22} className="text-orange-500" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">HTML</span>
                    </button>
                    <button onClick={exportAsMarkdown} title="Markdown olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[60px] transition-all">
                        <Hash size={22} className="text-violet-600" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">MD</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Belge Dışa Aktar</span>
            </div>

            {/* Ek Format Dışa Aktarma */}
            <div className="flex flex-col items-center h-full min-w-[340px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        if (!editor) return;
                        const html = editor.getHTML();
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                            printWindow.document.write(`<html><head><title>Yazdır</title></head><body style="font-family: sans-serif; padding: 40px;">${html}</body></html>`);
                            printWindow.document.close();
                            printWindow.print();
                        }
                    }} title="Yazdır" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[50px]">
                        <Printer size={20} className="text-[#2b579a]" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">Yazdır</span>
                    </button>
                    <button onClick={() => {
                        if (!editor) return;
                        const text = editor.getText();
                        const rtfContent = `{\\rtf1\\ansi ${text.replace(/\n/g, '\\par ')}}`;
                        const blob = new Blob([rtfContent], { type: 'application/rtf' });
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'belge.rtf'; a.click();
                    }} title="RTF olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[50px]">
                        <FileText size={20} className="text-teal-600" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">RTF</span>
                    </button>
                    <button onClick={() => {
                        if (!editor) return;
                        const html = editor.getHTML();
                        const epubXml = `<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>Belge</title></head>\n<body>${html}</body></html>`;
                        const blob = new Blob([epubXml], { type: 'application/xhtml+xml' });
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'belge.xhtml'; a.click();
                    }} title="EPUB formatında dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[50px]">
                        <BookOpen size={20} className="text-purple-500" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">EPUB</span>
                    </button>
                    <button onClick={() => {
                        if (!editor) return;
                        const text = editor.getText();
                        const lines = text.split('\n').map((l: string) => l.split('\t').join(','));
                        const csv = lines.join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'belge.csv'; a.click();
                    }} title="CSV olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[50px]">
                        <Table2 size={20} className="text-green-600" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">CSV</span>
                    </button>
                    <button onClick={() => {
                        if (!editor) return;
                        const text = editor.getText();
                        const latex = `\\documentclass{article}\n\\begin{document}\n${text}\n\\end{document}`;
                        const blob = new Blob([latex], { type: 'text/plain' });
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'belge.tex'; a.click();
                    }} title="LaTeX olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[50px]">
                        <GraduationCap size={20} className="text-amber-700" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">LaTeX</span>
                    </button>
                    <button onClick={() => {
                        if (!editor) return;
                        const html = editor.getHTML();
                        const odt = `<?xml version="1.0" encoding="UTF-8"?>\n<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0">\n<office:body><office:text>${html}</office:text></office:body></office:document>`;
                        const blob = new Blob([odt], { type: 'application/xml' });
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'belge.odt.xml'; a.click();
                    }} title="ODT olarak dışa aktar" className="flex flex-col items-center justify-center p-2 hover:bg-white/60 rounded cursor-pointer min-w-[50px]">
                        <Globe size={20} className="text-blue-500" strokeWidth={1.8} />
                        <span className="text-[8px] font-black text-zinc-700 mt-1">ODT</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Ek Formatlar</span>
            </div>

            {/* Progress / Status Group */}
            {isConverting && (
                <div className="flex flex-col justify-center px-4 animate-in fade-in slide-in-from-left-2 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <RefreshCw size={14} className="text-[#2b579a] animate-spin" />
                        <span className="text-[11px] font-black text-[#2b579a] uppercase tracking-wider">İşleniyor... %{progress}</span>
                    </div>
                    <div className="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#2b579a] to-[#3b67aa] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {!isConverting && (
                <div className="flex flex-col items-center justify-center px-4 opacity-40">
                    <ArrowRightLeft size={24} className="text-zinc-400" />
                    <span className="text-[8px] font-bold text-zinc-500 uppercase mt-1">Hazır</span>
                </div>
            )}
        </div>
    );
};

export default memo(ConvertTab);

