"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./components/LandingPage";
import { saveRecentDocument, type RecentDocument } from "./utils/recentDocuments";
import Dock from "./components/Dock";
import AIAssistant from "./components/AIAssistant";

// Dynamic imports for tools...
const Editor = dynamic<{ initialContent?: string; onBack: (content?: string) => void; pendingImage?: string; onImageInserted?: () => void }>(() => import("./components/Editor"), { ssr: false });
const PdfEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/PdfEditor"), { ssr: false });
const ExcelEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/ExcelEditor"), { ssr: false });
const CvWizard = dynamic<{ onBack: () => void }>(() => import("./components/CvWizard"), { ssr: false });
const InvoiceWizard = dynamic<{ onBack: () => void }>(() => import("./components/InvoiceWizard"), { ssr: false });
const OcrTool = dynamic<{ onBack: () => void }>(() => import("./components/OcrTool"), { ssr: false });
const BackgroundRemover = dynamic<{ onBack: () => void }>(() => import("./components/BackgroundRemover"), { ssr: false });
const ImageCropper = dynamic<{ onBack: () => void }>(() => import("./components/ImageCropper"), { ssr: false });
const ImageEnhancer = dynamic<{ onBack: () => void }>(() => import("./components/ImageEnhancer"), { ssr: false });
const CanvaClone = dynamic<{ onBack: () => void }>(() => import("./components/CanvaClone"), { ssr: false });
const CodeEditor = dynamic<{ onBack: () => void; initialLang?: "html" | "css" | "js" }>(() => import("./components/CodeEditor"), { ssr: false });
const FolderCodeEditor = dynamic<{ onBack: () => void }>(() => import("./components/FolderCodeEditor"), { ssr: false });
const CpsTest = dynamic<{ onBack: () => void }>(() => import("./components/CpsTest"), { ssr: false });
const MediaStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/MediaStudio"), { ssr: false });
const UniversalConverter = dynamic<{ onBack: () => void; onOpenPdfInEditor: (f: File) => void }>(() => import("./components/UniversalConverter"), { ssr: false });
const PptxEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/PptxEditor"), { ssr: false });
const TextBoxStudio = dynamic<{ onBack: () => void }>(() => import("./components/TextBoxStudio"), { ssr: false });
const DevStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/DevStudio"), { ssr: false });
const TextStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/TextStudio"), { ssr: false });
const ImageStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/ImageStudio"), { ssr: false });
const BusinessStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/BusinessStudio"), { ssr: false });
const ChartStudio = dynamic<{ onBack: (content?: string) => void; initialType?: string }>(() => import("./components/ChartStudio"), { ssr: false });
const PdfStudio = dynamic<{ onBack: () => void; initialTool?: string }>(() => import("./components/PdfStudio"), { ssr: false });
const PdfMergeSplit = dynamic<{ onBack: () => void }>(() => import("./components/PdfMergeSplit"), { ssr: false });
const WordModifier = dynamic<{ onBack: () => void }>(() => import("./components/WordModifier"), { ssr: false });
const Calculator = dynamic<{ onBack: () => void }>(() => import("./components/Calculator"), { ssr: false });
const PlayersStudio = dynamic<{ onBack: () => void }>(() => import("./components/PlayersStudio"), { ssr: false });

export default function Home() {
    const [view, setView] = useState<string>("landing");
    const [initialContent, setInitialContent] = useState<string>("");
    const [initialPdfFile, setInitialPdfFile] = useState<File | null>(null);
    const [initialExcelFile, setInitialExcelFile] = useState<File | null>(null);
    const [initialPptxFile, setInitialPptxFile] = useState<File | null>(null);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [activeMediaTool, setActiveMediaTool] = useState<string>("video-converter");
    const [activeTextTool, setActiveTextTool] = useState<string>("word-counter");
    const [activeImageTool, setActiveImageTool] = useState<string>("brightness-contrast");
    const [activeDevTool, setActiveDevTool] = useState<string>("json-formatter");
    const [activeBusinessTool, setActiveBusinessTool] = useState<string>("biz-compound");
    const [activePdfTool, setActivePdfTool] = useState<string>("pdf");
    const [initialChartType, setInitialChartType] = useState<string>("bar");
    const [codeEditorLang, setCodeEditorLang] = useState<"html" | "css" | "js">("html");
    
    const currentDocIdRef = useRef<string | undefined>(undefined);

    const handleEditorBack = useCallback((content?: string) => {
        if (content) {
            const id = saveRecentDocument(content, currentDocIdRef.current);
            currentDocIdRef.current = id;
        }
        currentDocIdRef.current = undefined;
        setView("landing");
    }, []);

    // ── Media Studio tool IDs (video/audio only) ─────────────────────────────
    const MEDIA_TOOL_IDS = new Set([
        "media-studio", "video-converter", "audio-converter", "video-to-mp3",
        "video-compressor", "trim-video", "trim-audio", "video-to-gif",
        "gif-to-video", "video-thumbnail", "mute-video", "merge-videos",
        "merge-audio", "image-compressor", "image-resizer", "heic-to-jpg",
        "png-to-jpg", "jpg-to-png"
    ]);

    // ── Document converter IDs (go to universal-converter) ────────────────────
    const DOC_CONVERTER_IDS = new Set([
        "pdf-to-pptx", "pptx-to-pdf", "pptx-to-png", "docx-to-pptx",
        "png-to-pdf", "png-to-docx", "docx-to-png", "pdf-to-png", "word-to-pdf"
    ]);

    // ── PDF Studio tool IDs ───────────────────────────────────────────────────
    const PDF_STUDIO_IDS = new Set([
        "pdf-studio", "pdf-compress", "pdf-merge", "pdf-split", "pdf-to-word",
        "pdf-to-image", "image-to-pdf", "pdf-unlock", "pdf-to-excel",
        "pdf-ocr"
    ]);

    const handleSelectTemplate = (id: string, content: string) => {
        if (id.startsWith("recent:")) {
            setView("editor");
            setInitialContent(content);
            return;
        }

        setInitialContent(content);

        // ── Dedicated component routes ────────────────────────────────────────
        if (id === "pdf") { setView("pdf-editor"); }
        else if (id === "players-studio") { setView("players-studio"); }
        else if (id === "pdf-merge-split") { setView("pdf-merge-split"); }
        else if (id === "ocr-tool") { setView("ocr-tool"); }
        else if (id === "excel-editor" || id === "excel-open") { setView("excel-editor"); }
        else if (id === "cv-wizard") { setView("cv-wizard"); }
        else if (id === "invoice-wizard") { setView("invoice-wizard"); }
        else if (id === "bg-remover") { setView("bg-remover"); }
        else if (id === "image-cropper") { setView("image-cropper"); }
        else if (id === "image-enhancer") { setView("image-enhancer"); }
        else if (id === "canva-clone") { setView("canva-clone"); }
        else if (id === "cps-test") { setView("cps-test"); }
        else if (id === "pptx-editor" || id === "pptx-open") { setView("pptx-editor"); }
        else if (id === "universal-converter" || DOC_CONVERTER_IDS.has(id)) { setView("universal-converter"); }
        else if (id === "text-box") { setView("text-box-studio"); }
        else if (id === "chart-studio") { setView("chart-studio"); }
        else if (id === "word-modifier") { setView("word-modifier"); }
        else if (id === "calculator") { setView("calculator"); }
        // ── Code editors ─────────────────────────────────────────────────────
        else if (id.startsWith("code-editor-")) {
            if (id === "code-editor-css") setCodeEditorLang("css");
            else if (id === "code-editor-js") setCodeEditorLang("js");
            else setCodeEditorLang("html");
            setView("code-editor");
        }
        else if (id === "folder-code-editor") { setView("folder-code-editor"); }
        // ── Studio routes ─────────────────────────────────────────────────────
        else if (MEDIA_TOOL_IDS.has(id)) {
            setActiveMediaTool(id === "media-studio" ? "video-converter" : id);
            setView("media-studio");
        }
        else if (id === "business-studio" || id.startsWith("biz-")) {
            setActiveBusinessTool(id === "business-studio" ? "biz-compound" : id);
            setView("business-studio");
        }
        else if (id === "dev-studio" || id.startsWith("json-") || id.startsWith("hash-") || id.startsWith("regex-") || id.startsWith("jwt-") || id.startsWith("uuid-") || ["markdown-editor", "meta-tag-generator", "og-preview", "cron-expression", "color-contrast", "html-entities", "url-encoder", "base64", "code-formatter", "json-to-csv"].includes(id)) {
            setActiveDevTool(id === "dev-studio" ? "json-formatter" : id);
            setView("dev-studio");
        }
        else if (id === "text-studio" || ["word-counter", "case-converter", "lorem-ipsum", "text-diff", "fancy-text", "text-cleaner", "invisible-text", "slug-generator", "binary-converter", "reverse-text", "remove-duplicates", "text-repeater", "zalgo-text", "text-to-speech", "translator"].includes(id)) {
            setActiveTextTool(id === "text-studio" ? "word-counter" : id);
            setView("text-studio");
        }
        else if (id === "image-studio" || ["brightness-contrast", "hue-saturation", "exposure", "color-balance", "levels", "curves", "vibrance", "white-balance", "channel-mixer", "selective-color", "sharpen", "vignette", "dust-noise", "duotone", "3d-lut", "posterize", "threshold", "invert-colors", "sepia-vintage", "shadow-highlight", "clarity-texture", "dehaze", "color-grading", "chromatic-aberration", "rotate-flip", "perspective", "tilt-shift", "mirror-effect", "distortion", "photo-filters", "text-overlay", "border-frame", "collage-maker", "meme-generator", "batch-edit", "replace-color", "histogram", "exif-editor", "social-media-resizer", "sketch-effect", "gradient-map", "split-toning", "liquify", "photo-mosaic", "overlay-blend", "compare-images", "color-picker", "color-palette", "screenshot-beautifier"].includes(id)) {
            setActiveImageTool(id === "image-studio" ? "brightness-contrast" : id);
            setView("image-studio");
        }
        else if (PDF_STUDIO_IDS.has(id)) {
            setActivePdfTool(id === "pdf-studio" ? "pdf-compress" : id);
            setView("pdf-studio");
        }
        else {
            setView("editor");
        }
    };

    const handleOpenRecent = (doc: RecentDocument) => {
        currentDocIdRef.current = doc.id;
        setInitialContent(doc.content);
        setView("editor");
    };

    const renderView = () => {
        switch (view) {
            case "landing":
                return <LandingPage onSelectTemplate={handleSelectTemplate} onOpenRecentDocument={handleOpenRecent} activeGroup={activeGroup} onGroupSelect={setActiveGroup} />;
            case "editor":
                return <Editor initialContent={initialContent} onBack={handleEditorBack} />;
            case "pdf-editor":
                return <PdfEditor onBack={() => setView("landing")} initialFile={initialPdfFile || undefined} />;
            case "pdf-merge-split":
                return <PdfMergeSplit onBack={() => setView("landing")} />;
            case "excel-editor":
                return <ExcelEditor onBack={() => setView("landing")} initialFile={initialExcelFile || undefined} />;
            case "cv-wizard":
                return <CvWizard onBack={() => setView("landing")} />;
            case "invoice-wizard":
                return <InvoiceWizard onBack={() => setView("landing")} />;
            case "ocr-tool":
                return <OcrTool onBack={() => setView("landing")} />;
            case "bg-remover":
                return <BackgroundRemover onBack={() => setView("landing")} />;
            case "image-cropper":
                return <ImageCropper onBack={() => setView("landing")} />;
            case "image-enhancer":
                return <ImageEnhancer onBack={() => setView("landing")} />;
            case "canva-clone":
                return <CanvaClone onBack={() => setView("landing")} />;
            case "code-editor":
                return <CodeEditor onBack={() => setView("landing")} initialLang={codeEditorLang} />;
            case "folder-code-editor":
                return <FolderCodeEditor onBack={() => setView("landing")} />;
            case "cps-test":
                return <CpsTest onBack={() => setView("landing")} />;
            case "media-studio":
                return <MediaStudio onBack={() => setView("landing")} initialToolId={activeMediaTool} />;
            case "universal-converter":
                return <UniversalConverter onBack={() => setView("landing")} onOpenPdfInEditor={(f) => { setInitialPdfFile(f); setView("pdf-editor"); }} />;
            case "pptx-editor":
                return <PptxEditor onBack={() => setView("landing")} initialFile={initialPptxFile || undefined} />;
            case "text-box-studio":
                return <TextBoxStudio onBack={() => setView("landing")} />;
            case "word-modifier":
                return <WordModifier onBack={() => setView("landing")} />;
            case "calculator":
                return <Calculator onBack={() => setView("landing")} />;
            case "players-studio":
                return <PlayersStudio onBack={() => setView("landing")} />;

            case "text-studio":
                return <TextStudio onBack={() => setView("landing")} initialToolId={activeTextTool} />;
            case "image-studio":
                return <ImageStudio onBack={() => setView("landing")} initialToolId={activeImageTool} />;
            case "dev-studio":
                return <DevStudio onBack={() => setView("landing")} initialToolId={activeDevTool} />;
            case "business-studio":
                return <BusinessStudio onBack={() => setView("landing")} initialToolId={activeBusinessTool} />;
            case "chart-studio":
                return <ChartStudio onBack={handleEditorBack} initialType={initialChartType} />;
            case "pdf-studio":
                return <PdfStudio onBack={() => setView("landing")} initialTool={activePdfTool} />;
            default:
                return <LandingPage onSelectTemplate={handleSelectTemplate} onOpenRecentDocument={handleOpenRecent} activeGroup={activeGroup} onGroupSelect={setActiveGroup} />;
        }
    };

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-slate-950 font-[family-name:var(--font-inter)] selection:bg-blue-500/30">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full"
                >
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-screen mesh-gradient">
                            <div className="flex flex-col items-center gap-6">
                                <motion.div 
                                    animate={{ 
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full shadow-2xl"
                                />
                                <span className="text-white font-black uppercase tracking-widest text-sm">Macrotar OS Loading...</span>
                            </div>
                        </div>
                    }>
                        {renderView()}
                    </Suspense>
                </motion.div>
            </AnimatePresence>

            {/* Persistent OS Elements */}
            {view !== "players-studio" && (
                <Dock 
                    activeGroup={activeGroup} 
                    onGroupSelect={(group) => {
                        setActiveGroup(group);
                        if (view !== "landing") setView("landing");
                    }} 
                    onAiClick={() => setIsAiOpen(!isAiOpen)}
                />
            )}

            <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
        </main>
    );
}
