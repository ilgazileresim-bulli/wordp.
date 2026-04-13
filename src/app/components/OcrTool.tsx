import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, FileText, Loader2, Copy, CheckCircle2, Download, Cloud } from "lucide-react";
import Tesseract from "tesseract.js";

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
      const result = await Tesseract.recognize(selectedFile, "tur+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setExtractedText(result.data.text);
    } catch (err) {
      console.error("OCR Error:", err);
      alert("An error occurred during text extraction.");
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

  const mockSaveToCloud = () => {
    if (!extractedText) return;
    setIsCloudSaved(true);
    setTimeout(() => {
      alert("Text successfully saved to Cloud (Google Drive simulation)!");
      setIsCloudSaved(false);
    }, 1500);
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-result.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/10 dark:from-[#0a0a1a] dark:to-[#0d0d2a]">
      {/* Header */}
      <header className="flex-none p-4 flex items-center justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-zinc-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-xl transition-colors dark:text-zinc-400"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="text-blue-500" size={24} />
              Advanced OCR Tool
            </h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Instantly extract text from images</span>
          </div>
        </div>

        <div className="flex gap-2">
          {extractedText && (
            <button
              onClick={mockSaveToCloud}
              disabled={isCloudSaved}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isCloudSaved ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
              {isCloudSaved ? "Saving..." : "Save to Cloud"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-8">
        
        {/* Left Column - Upload/Preview */}
        <div className="bg-white dark:bg-slate-800/60 border border-zinc-200 dark:border-slate-700/60 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!imagePreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-80 border-2 border-dashed border-zinc-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Upload size={48} className="text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">Select or Drag an Image</h3>
              <p className="text-sm text-zinc-500 mt-2">PNG, JPG, JPEG supported</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-900 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-slate-700 hover:bg-zinc-200 dark:hover:bg-slate-600 text-zinc-700 dark:text-zinc-200 font-medium rounded-xl transition-colors"
                >
                  Select Another
                </button>
                <button
                  onClick={processImage}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing ({progress}%)
                    </>
                  ) : (
                    "Extract Text (OCR)"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="bg-white dark:bg-slate-800/60 border border-zinc-200 dark:border-slate-700/60 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Extracted Text</h3>
            {extractedText && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-zinc-100 dark:bg-slate-700 hover:bg-zinc-200 dark:hover:bg-slate-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  {isCopied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  Copy
                </button>
                <button
                  onClick={downloadText}
                  className="p-2 bg-zinc-100 dark:bg-slate-700 hover:bg-zinc-200 dark:hover:bg-slate-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-h-[400px]">
            {isProcessing ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                <p>Reading image, please wait...</p>
              </div>
            ) : extractedText ? (
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-full min-h-[400px] p-4 bg-zinc-50 dark:bg-[#0a0a1a] border border-zinc-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-zinc-800 dark:text-zinc-200 font-mono text-sm shadow-inner"
                placeholder="Click to edit..."
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-slate-700 rounded-xl bg-zinc-50/50 dark:bg-slate-900/50 text-zinc-400">
                <p>Results will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
