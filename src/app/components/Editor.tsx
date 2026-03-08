"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from "framer-motion";

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { TextAlign } from '@tiptap/extension-text-align';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Extension } from '@tiptap/core';
import { VideoExtension } from './editor/extensions/VideoExtension';
import { Search, X } from "lucide-react";

import { cn, PAGE_HEIGHT_MM, PX_PER_MM } from "./editor/utils";
import EditorTopBar from "./editor/EditorTopBar";
import EditorRibbon from "./editor/EditorRibbon";
import EditorStatusBar from "./editor/EditorStatusBar";
import NavPane from "./editor/NavPane";
import SearchPanel from "./editor/SearchPanel";
import DocumentWorkplace from "./editor/DocumentWorkplace";
import FileMenu from "./editor/FileMenu";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Custom Indent Extension
const Indent = Extension.create({
    name: 'indent',
    addGlobalAttributes() {
        return [
            {
                types: ['heading', 'paragraph'],
                attributes: {
                    indent: {
                        default: 0,
                        renderHTML: attributes => {
                            if (attributes.indent === 0) return {};
                            return { style: `margin-left: ${attributes.indent * 20}px` };
                        },
                        parseHTML: element => parseInt(element.style.marginLeft) / 20 || 0,
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }: any) => {
                const { selection } = state;
                tr = tr.setSelection(selection);
                state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: any) => {
                    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                        const indent = (node.attrs.indent || 0) + 1;
                        tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
            outdent: () => ({ tr, state, dispatch }: any) => {
                const { selection } = state;
                tr = tr.setSelection(selection);
                state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: any) => {
                    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                        const indent = Math.max((node.attrs.indent || 0) - 1, 0);
                        tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
        } as any;
    },
});

// Font Size Extension
const FontSize = Extension.create({
    name: 'fontSize',
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    fontSize: {
                        default: null,
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            },
        } as any;
    },
});

export default function Editor({ initialContent, onBack }: { initialContent?: string; onBack: (content?: string) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'layout' | 'references' | 'review' | 'view' | 'help'>('home');
    const [zoom, setZoom] = useState(100);
    const [pageColor, setPageColor] = useState("#ffffff");
    const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
    const [margins, setMargins] = useState(96);
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'print' | 'read' | 'web'>('print');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showRuler, setShowRuler] = useState(false);
    const [showGridlines, setShowGridlines] = useState(false);
    const [showNavPane, setShowNavPane] = useState(false);
    const [isSplit, setIsSplit] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const [watermark, setWatermark] = useState<string | null>(null);



    const heightCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const checkHeight = useCallback(() => {
        if (!editorContainerRef.current) return;

        if (heightCheckTimeoutRef.current) {
            clearTimeout(heightCheckTimeoutRef.current);
        }

        heightCheckTimeoutRef.current = setTimeout(() => {
            if (!editorContainerRef.current) return;
            const contentHeight = editorContainerRef.current.scrollHeight;
            const pageHeightPx = PAGE_HEIGHT_MM * PX_PER_MM;
            const innerPageHeight = pageHeightPx - (margins * 2);
            const newPageCount = Math.max(1, Math.ceil(contentHeight / innerPageHeight));

            setPageCount(prev => {
                if (prev !== newPageCount) return newPageCount;
                return prev;
            });
        }, 200); // Debounce to 200ms for responsive pagination
    }, [margins]);

    useEffect(() => {
        if (!editorContainerRef.current) return;
        const el = editorContainerRef.current;

        // ResizeObserver for size changes
        const resizeObserver = new ResizeObserver(checkHeight);
        resizeObserver.observe(el);

        // MutationObserver for DOM content changes (e.g. new paragraphs)
        const mutationObserver = new MutationObserver(checkHeight);
        mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [checkHeight]);

    // Memoize extensions to prevent recreation on every render
    const extensions = useMemo(() => [
        StarterKit.configure({
            bulletList: { keepMarks: true, keepAttributes: false },
            orderedList: { keepMarks: true, keepAttributes: false },
        }),
        Underline,
        TextStyle,
        FontSize,
        Color,
        FontFamily,
        Subscript,
        Superscript,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Highlight.configure({ multicolor: true }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        TiptapImage.configure({ allowBase64: true }),
        TiptapLink.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder: 'Yazmaya başlayın...' }),
        CharacterCount,
        Indent,
        VideoExtension,
    ], []);

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        extensions,
        onUpdate: checkHeight,
        content: initialContent?.startsWith("PDF_IMPORT:")
            ? "<p>PDF metni ayıklanıyor...</p>"
            : (initialContent || `<h1>Adsız Belge</h1><p>Yazmaya başlayın...</p>`),
        editorProps: {
            attributes: {
                class: "focus:outline-none w-full prose prose-zinc max-w-none",
                style: `min-height: ${PAGE_HEIGHT_MM * PX_PER_MM - (margins * 2)}px;`
            },
        },
    });

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const pageHeightPx = PAGE_HEIGHT_MM * PX_PER_MM * (zoom / 100);
        const page = Math.floor(scrollTop / pageHeightPx) + 1;
        setCurrentPage(Math.min(page, pageCount));
    }, [zoom, pageCount]);

    const extractTextFromPDF = useCallback(async (file: File) => {
        try {
            const pdfjs = await import("pdfjs-dist");
            pdfjs.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");
                fullText += `<h2>Sayfa ${i}</h2><p>${pageText}</p>`;
            }

            editor?.commands.setContent(fullText || "<p>PDF'den metin ayıklanamadı.</p>");
        } catch (error) {
            console.error("PDF extraction error:", error);
            editor?.commands.setContent("<p>PDF ayıklanırken bir hata oluştu.</p>");
        }
    }, [editor]);

    useEffect(() => {
        if (initialContent?.startsWith("PDF_IMPORT:") && editor) {
            const file = (window as any).__pdfImportFile;
            if (file) {
                editor.commands.setContent("<p>PDF dosyası okunuyor, lütfen bekleyin...</p>");
                extractTextFromPDF(file);
            }
        }
    }, [initialContent, editor, extractTextFromPDF]);

    useEffect(() => {
        if (initialContent && editor && !initialContent.startsWith("PDF_IMPORT:")) {
            editor.commands.setContent(initialContent);
        }
    }, [initialContent, editor]);

    useEffect(() => {
        if (initialContent && editor && (window as any).__autoExportPdf) {
            (window as any).__autoExportPdf = false;
            setTimeout(() => {
                window.print();
            }, 1500);
        }
    }, [initialContent, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    editor.commands.setContent(json);
                } catch (err) {
                    alert('Invalid file format');
                }
            };
            reader.readAsText(file);
        }
    }, [editor]);

    const handleCopy = useCallback(async () => {
        if (!editor) return;
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to);
        await navigator.clipboard.writeText(text);
    }, [editor]);

    const exportToPdf = useCallback(async () => {
        if (!editorContainerRef.current) return;
        setIsSaving(true);
        try {
            const element = editorContainerRef.current;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: pageColor,
                onclone: (clonedDoc) => {
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        if (!htmlEl.style.color) {
                            htmlEl.style.color = '#000000';
                        }
                    });
                }
            });

            const imgData = canvas.toDataURL('image/png');
            // Total height the image occupies in PDF mm units
            const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;
            const totalPages = Math.ceil(imgHeightMm / pdfHeight);

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage();
                // Shift the image up by i pages so the correct slice appears on this page
                pdf.addImage(imgData, 'PNG', 0, -(i * pdfHeight), pdfWidth, imgHeightMm);
            }

            pdf.save('belge.pdf');
        } catch (error) {
            console.error('PDF Export failed:', error);
            alert('PDF oluşturulurken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    }, [pageColor]);

    const downloadDocx = useCallback(async () => {
        if (!editor) return;
        const html = editor.getHTML();
        try {
            const response = await fetch('/api/export-docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, title: 'belge' }),
            });
            if (!response.ok) throw new Error('Export failed');
            const docxBlob = await response.blob();
            saveAs(docxBlob, 'belge.docx');
        } catch (error) {
            console.error('Error generating docx:', error);
            alert('Belge oluşturulurken bir hata oluştu.');
        }
    }, [editor]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleSave = useCallback(() => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 1500);
    }, []);

    const insertDate = useCallback(() => {
        if (!editor) return;
        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        editor.chain().focus().insertContent(dateStr).run();
    }, [editor]);

    const insertSymbol = useCallback((symbol: string) => {
        if (!editor) return;
        editor.chain().focus().insertContent(symbol).run();
    }, [editor]);

    const insertPageBreak = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertContent('<div style="page-break-after: always; height: 1px; border-top: 1px dashed #ccc; margin: 20px 0;"></div>').run();
    }, [editor]);

    const toggleWatermark = useCallback((text: string | null) => {
        setWatermark(watermark === text ? null : text);
    }, [watermark]);

    const changeCase = useCallback((type: 'upper' | 'lower' | 'capitalize') => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return;
        let newText = text;
        if (type === 'upper') newText = text.toUpperCase();
        if (type === 'lower') newText = text.toLowerCase();
        if (type === 'capitalize') newText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

        editor.chain().focus().insertContentAt({ from, to }, newText).run();
    }, [editor]);

    const insertShape = useCallback((type: string) => {
        if (!editor) return;
        let html = "";
        if (type === "rect") html = `<div style="width: 100px; height: 60px; border: 2px solid #2b579a; background-color: #e6f0ff; display: inline-block;"></div>`;
        if (type === "circle") html = `<div style="width: 80px; height: 80px; border: 2px solid #e11d48; background-color: #fff1f2; border-radius: 50%; display: inline-block;"></div>`;
        editor.chain().focus().insertContent(html).run();
    }, [editor]);

    const handleImageInsert = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                editor.chain().focus().setImage({ src: result }).run();
            };
            reader.readAsDataURL(file);
        }
    }, [editor]);

    const handleVideoInsert = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && editor) {
            const url = URL.createObjectURL(file);
            editor.chain().focus().insertContent({
                type: 'video',
                attrs: { src: url },
            }).run();
        }
        event.target.value = '';
    }, [editor]);


    if (!editor) return null;

    const wordCount = editor.storage.characterCount.words();

    return (
        <div className="flex flex-col h-screen bg-[#f3f4f6] dark:bg-[#0f0f1a] overflow-hidden font-sans selection:bg-blue-200 dark:selection:bg-blue-800">
            <EditorTopBar
                isSaving={isSaving}
                onSave={handleSave}
                onUndo={() => editor.chain().focus().undo().run()}
                onRedo={() => editor.chain().focus().redo().run()}
                onPrint={handlePrint}
                onBack={() => onBack(editor?.getHTML())}
                onExportPdf={exportToPdf}
                onExportDocx={downloadDocx}
            />

            <EditorRibbon
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                editor={editor}
                handleCopy={handleCopy}
                changeCase={changeCase}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                insertPageBreak={insertPageBreak}
                imageInputRef={imageInputRef}
                videoInputRef={videoInputRef}
                insertShape={insertShape}
                insertDate={insertDate}
                insertSymbol={insertSymbol}
                watermark={watermark}
                toggleWatermark={toggleWatermark}
                pageColor={pageColor}
                setPageColor={setPageColor}
                margins={margins}
                setMargins={setMargins}
                orientation={orientation}
                setOrientation={setOrientation}
                isSplit={isSplit}
                setIsSplit={setIsSplit}
                viewMode={viewMode}
                setViewMode={setViewMode}
                setIsFocusMode={setIsFocusMode}
                showRuler={showRuler}
                setShowRuler={setShowRuler}
                showGridlines={showGridlines}
                setShowGridlines={setShowGridlines}
                showNavPane={showNavPane}
                setShowNavPane={setShowNavPane}
                zoom={zoom}
                setZoom={setZoom}
                onFileClick={() => setShowFileMenu(true)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                <NavPane isOpen={showNavPane} onClose={() => setShowNavPane(false)} />
                <SearchPanel isOpen={showSearch} onClose={() => setShowSearch(false)} editor={editor} />

                <DocumentWorkplace
                    editor={editor}
                    viewMode={viewMode}
                    zoom={zoom}
                    margins={margins}
                    orientation={orientation}
                    pageColor={pageColor}
                    watermark={watermark}
                    showRuler={showRuler}
                    showGridlines={showGridlines}
                    isSplit={isSplit}
                    pageCount={pageCount}
                    handleScroll={handleScroll}
                    editorContainerRef={editorContainerRef}
                />
            </div>

            <FileMenu
                isOpen={showFileMenu}
                onClose={() => setShowFileMenu(false)}
                onSave={handleSave}
                onPrint={handlePrint}
                onExportPdf={exportToPdf}
                onExportDocx={downloadDocx}
                onExportJson={() => {
                    const json = editor.getJSON();
                    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                    saveAs(blob, 'belge.json');
                }}
                stats={{
                    words: wordCount,
                    chars: editor.storage.characterCount.characters(),
                    paragraphs: editorContainerRef.current?.querySelectorAll('p, h1, h2, h3, h4, h5, h6').length || 0,
                    readingTime: Math.max(1, Math.ceil(wordCount / 200))
                }}
            />

            <AnimatePresence>
                {isFocusMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-900 z-[100] flex flex-col items-center py-20 overflow-auto cursor-default"
                    >
                        <button
                            onClick={() => setIsFocusMode(false)}
                            className="fixed top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 backdrop-blur-md group"
                            title="Odak Modundan Çık"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                        <div className="w-[210mm] bg-white shadow-2xl min-h-[297mm] p-[96px] relative scale-105 origin-top mb-20">
                            <EditorContent editor={editor} />
                        </div>
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-white/40 text-[10px] uppercase font-black tracking-[0.3em]">
                            Odaklanma Modu
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EditorStatusBar
                currentPage={currentPage}
                pageCount={pageCount}
                wordCount={wordCount}
                viewMode={viewMode}
                setViewMode={setViewMode}
                zoom={zoom}
                setZoom={setZoom}
            />
        </div>
    );
}
