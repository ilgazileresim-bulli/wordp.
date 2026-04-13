import React, { useState, useRef } from "react";
import { ArrowLeft, FileText, Plus, SplitSquareHorizontal, Combine, Trash2, Download, Cloud, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PdfMergeSplitProps {
  onBack: () => void;
}

export default function PdfMergeSplit({ onBack }: PdfMergeSplitProps) {
  const [activeTab, setActiveTab] = useState<"merge" | "split">("merge");
  
  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const [isMerging, setIsMerging] = useState(false);

  // Split State
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPages, setSplitPages] = useState<string>("");
  const splitInputRef = useRef<HTMLInputElement>(null);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleMergeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMergeFiles([...mergeFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles(mergeFiles.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
      alert("You must select at least 2 PDF files to merge.");
      return;
    }
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      downloadBlob(pdfBytes, "Merged-Document.pdf");
    } catch (err) {
      console.error("Merge error:", err);
      alert("An error occurred during merging.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleSplitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSplitFile(e.target.files[0]);
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
            pages.add(i - 1); // 0-indexed for pdf-lib
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

  const handleSplit = async () => {
    if (!splitFile) return;
      alert("Please specify the pages to be extracted (e.g.: 1, 3, 5-10)");
      return;
    }
    setIsSplitting(true);
    try {
      const arrayBuffer = await splitFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const indices = parseRange(splitPages, pdf.getPageCount());

        alert("No valid page numbers found.");
        setIsSplitting(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(pdfBytes, "Split-Document.pdf");
    } catch (err) {
      console.error("Split error:", err);
      alert("An error occurred during the split process.");
    } finally {
      setIsSplitting(false);
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white dark:bg-slate-800 border-b border-zinc-200 dark:border-slate-700">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-700 rounded-lg text-zinc-600 dark:text-zinc-400">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            Advanced PDF Tools
          </h1>
          <span className="text-sm text-zinc-500">Merge and Split PDF</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("merge")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-center transition-all flex items-center justify-center gap-2 ${
              activeTab === "merge" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-700"
            }`}
          >
            <Combine size={20} />
            Merge PDF
          </button>
          <button
            onClick={() => setActiveTab("split")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-center transition-all flex items-center justify-center gap-2 ${
              activeTab === "split" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-700"
            }`}
          >
            <SplitSquareHorizontal size={20} />
            Split PDF (Extract Pages)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "merge" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-zinc-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-100">Files to Merge</h2>
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              className="hidden" 
              ref={mergeInputRef} 
              onChange={handleMergeFileChange} 
            />
            
            <div className="space-y-3 mb-6">
              {mergeFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-slate-700 rounded-lg bg-zinc-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <FileText className="text-red-500" size={24} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {file.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeMergeFile(i)}
                    className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => mergeInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-blue-300 dark:border-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                Add PDF File
              </button>
            </div>

            <button
              onClick={handleMerge}
              disabled={mergeFiles.length < 2 || isMerging}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMerging ? <Loader2 size={20} className="animate-spin" /> : <Combine size={20} />}
              {isMerging ? "Merging..." : "Merge All and Download"}
            </button>
          </div>
        )}

        {activeTab === "split" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-zinc-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-100">Extract Pages</h2>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={splitInputRef} 
              onChange={handleSplitFileChange} 
            />

            {!splitFile ? (
              <button 
                onClick={() => splitInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-emerald-300 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex flex-col items-center justify-center gap-2 font-medium mb-6"
              >
                <FileText size={40} className="mb-2 opacity-50" />
                Upload Main PDF File
              </button>
            ) : (
              <div className="mb-6 flex items-center justify-between p-4 border border-zinc-200 dark:border-slate-700 rounded-xl bg-zinc-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <FileText className="text-emerald-500" size={32} />
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-100">{splitFile.name}</p>
                    <p className="text-xs text-zinc-500">{(splitFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSplitFile(null)}
                  className="text-sm font-medium text-zinc-400 hover:text-red-500 px-3 py-1 bg-zinc-200 dark:bg-slate-800 rounded-lg"
                >
                  Değiştir
                </button>
              </div>
            )}

            <div className={`transition-opacity ${!splitFile ? "opacity-50 pointer-events-none" : ""}`}>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Which pages do you want to extract?
              </label>
              <input
                type="text"
                value={splitPages}
                onChange={(e) => setSplitPages(e.target.value)}
                placeholder="e.g.: 1, 3, 5-10"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-slate-900 border border-zinc-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-800 dark:text-zinc-100 font-mono mb-6"
              />

              <button
                onClick={handleSplit}
                disabled={!splitFile || !splitPages || isSplitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSplitting ? <Loader2 size={20} className="animate-spin" /> : <SplitSquareHorizontal size={20} />}
                {isSplitting ? "Splitting..." : "Extract Pages and Download"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
