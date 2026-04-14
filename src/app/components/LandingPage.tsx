"use client";
// Cache bust: 2026-04-12T19:25:00

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, PieChart, Library, ArrowRightLeft, FileSearch, MousePointer2, Image, FileImage, Clock, Trash2, ExternalLink, FolderOpen, RefreshCw, Type, Combine, Heart, LayoutTemplate, ArrowLeft, Code, FileCode, Braces, FileCode2, Zap, Video, Music, MonitorPlay, Mic, Headphones, Film, TerminalSquare, SearchCode, Network, KeyRound, Fingerprint, TextCursorInput, FileDigit, AlignLeft, Table, TableProperties, Tags, MonitorSmartphone, Clock4, Contrast, Unlock, Link, Code2, Archive, Hash, Calculator as CalculatorIcon, Briefcase, Coffee, TrendingUp, LineChart, Wallet, PiggyBank, TrendingDown, Home, Coins, Receipt, CreditCard, BarChart3, Landmark, Scale, Compass, Target, Percent, Car, Bitcoin, Megaphone, Shield, Eye, PenTool, Monitor, Keyboard, LayoutGrid, Activity } from "lucide-react";
import { cn } from "./editor/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../data/templates";
import { getRecentDocuments, deleteRecentDocument, clearRecentDocuments, type RecentDocument } from "../utils/recentDocuments";

const ALL_TOOLS = [
    { id: "pptx-editor", title: "PowerPoint Editor", icon: PieChart, color: "from-red-500 to-orange-500", desc: "Create & Edit Presentations", badge: "NEW", group: "powerpoint" },
    { id: "pptx-open", title: "Open PPTX File", icon: Library, color: "from-amber-500 to-orange-500", desc: "Edit Existing Presentation", group: "powerpoint" },
    { id: "pdf-to-pptx", title: "PDF to PPTX", icon: PieChart, color: "from-orange-500 to-orange-600", desc: "Convert PDF to Slides", group: "converters" },
    { id: "pptx-to-pdf", title: "PPTX to PDF", icon: Library, color: "from-blue-500 to-blue-600", desc: "Make Presentation PDF", group: "converters" },
    { id: "pptx-to-png", title: "PPTX to PNG", icon: Image, color: "from-teal-500 to-emerald-500", desc: "Convert Slides to Images", group: "converters" },
    { id: "docx-to-pptx", title: "Word to PPTX", icon: FileText, color: "from-sky-500 to-blue-600", desc: "Create Slides from Document", group: "converters" },
    { id: "pdf-to-word", title: "PDF to Word", icon: FileText, color: "from-indigo-500 to-indigo-600", desc: "Convert PDF to Text", group: "converters" },
    { id: "word-to-pdf", title: "Word to PDF", icon: FileSearch, color: "from-red-500 to-red-600", desc: "Convert Word to PDF", group: "converters" },
    { id: "png-to-pdf", title: "PNG to PDF", icon: Image, color: "from-emerald-500 to-emerald-600", desc: "Make Image PDF", group: "converters" },
    { id: "png-to-docx", title: "PNG to Word", icon: FileImage, color: "from-violet-500 to-violet-600", desc: "Convert Image to DOCX", group: "converters" },
    { id: "docx-to-png", title: "Word to PNG", icon: FileSearch, color: "from-pink-500 to-pink-600", desc: "Convert DOCX to Image", group: "converters" },
    { id: "pdf-to-png", title: "PDF to PNG", icon: Image, color: "from-cyan-500 to-cyan-600", desc: "Convert PDF to Image", group: "converters" },
    { id: "universal-converter", title: "Universal Converter", icon: RefreshCw, color: "from-blue-600 to-indigo-600", desc: "Convert Any File", badge: "NEW", group: "converters" },
    { id: "pdf", title: "PDF Editor", icon: FileSearch, color: "from-rose-500 to-red-600", desc: "Open and Edit PDF", badge: "NEW", group: "pdf" },
    { id: "pdf-merge-split", title: "PDF Merge & Split", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "Manage PDF Files", badge: "NEW", group: "pdf" },
    { id: "ocr-tool", title: "Image to Text (OCR)", icon: FileSearch, color: "from-amber-500 to-orange-600", desc: "Extract Text from Images", badge: "NEW", group: "office" },
    { id: "excel-editor", title: "Excel (Sheet) Editor", icon: PieChart, color: "from-emerald-500 to-teal-600", desc: "Create Spreadsheets", badge: "NEW", group: "office" },
    { id: "excel-open", title: "Open Excel File", icon: Library, color: "from-teal-500 to-cyan-600", desc: "Edit Existing Sheet", group: "office" },
    { id: "cv-wizard", title: "CV Resume Builder", icon: FileText, color: "from-purple-500 to-pink-500", desc: "Quick Resume Creation", badge: "NEW", group: "office" },
    { id: "invoice-wizard", title: "Invoice Generator", icon: FileText, color: "from-indigo-400 to-purple-600", desc: "Export PDF Invoice", badge: "NEW", group: "office" },
    { id: "bg-remover", title: "Background Remover", icon: Image, color: "from-fuchsia-500 to-purple-600", desc: "Remove Background", badge: "NEW", group: "photo" },
    { id: "word-modifier", title: "Word Styler", icon: Type, color: "from-indigo-600 to-purple-600", desc: "Apply Text Styles", badge: "NEW", group: "office" },
    { id: "image-cropper", title: "Image Cropper", icon: Image, color: "from-indigo-500 to-cyan-600", desc: "Resize Images", badge: "NEW", group: "photo" },
    { id: "image-enhancer", title: "Unblur Image", icon: Image, color: "from-emerald-500 to-teal-600", desc: "Sharpen Photos", badge: "NEW", group: "photo" },
    { id: "canva-clone", title: "Design Studio (Canva)", icon: LayoutTemplate, color: "from-fuchsia-500 to-rose-500", desc: "Create Designs and Posters", badge: "NEW", group: "photo" },
    { id: "birthday-message", title: "Birthday Message", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Generate Long Messages", badge: "NEW", group: "office", content: "<h1>Happy Birthday!</h1><p>Happy birthday! I wish your new year of life brings you health, happiness, success, and peace. I hope all your dreams come true and your face always smiles like this. Every moment I spend with you is so precious, I'm glad you exist and I'm glad you're in our lives. May it be a wonderful year where we accumulate many more beautiful memories together. Happy new age! I am the luckiest person in the world because I have such a wonderful friend/person like you. Life can be challenging sometimes, but everything is so easy and fun to overcome with you... May your laughter never be missing from your face, may your heart beat more hopefully than ever. Always be happy, don't let anything worry you, everything go as beautifully as you wish in your life. In short, may everything be as you wish. Many happy years!</p>" },
    { id: "code-editor-html", title: "HTML Editor", icon: FileCode, color: "from-orange-500 to-red-500", desc: "Write & Preview HTML", badge: "NEW", group: "code" },
    { id: "code-editor-css", title: "CSS Editor", icon: Braces, color: "from-blue-500 to-cyan-500", desc: "Edit CSS Styles", badge: "NEW", group: "code" },
    { id: "code-editor-js", title: "JavaScript Editor", icon: FileCode2, color: "from-yellow-400 to-orange-500", desc: "Write & Run JS Code", badge: "NEW", group: "code" },
    { id: "folder-code-editor", title: "Real Project Editor", icon: FolderOpen, color: "from-violet-500 to-indigo-600", desc: "Open Project from Folder", badge: "NEW", group: "code" },
    { id: "cps-test", title: "Click Speed (CPS)", icon: MousePointer2, color: "from-yellow-400 to-orange-600", desc: "Test Clicks Per Second", badge: "NEW", group: "performance" },
    { id: "video-converter", title: "Video Converter", icon: RefreshCw, color: "from-pink-500 to-rose-500", desc: "Convert between various video formats", badge: "POPULAR", group: "video-audio" },
    { id: "audio-converter", title: "Audio Converter", icon: RefreshCw, color: "from-fuchsia-500 to-purple-500", desc: "Convert between various audio formats", badge: "POPULAR", group: "video-audio" },
    { id: "video-to-mp3", title: "Video to MP3", icon: Headphones, color: "from-indigo-500 to-blue-500", desc: "Extract high quality audio from video", badge: "POPULAR", group: "video-audio" },
    { id: "video-compressor", title: "Video Compressor", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "Reduce video size without quality loss", badge: "POPULAR", group: "video-audio" },
    { id: "trim-video", title: "Trim Video", icon: Film, color: "from-violet-500 to-purple-500", desc: "Cut or trim video clips", badge: "NEW", group: "video-audio" },
    { id: "trim-audio", title: "Trim Audio", icon: Music, color: "from-pink-500 to-rose-500", desc: "Cut or trim audio clips", badge: "NEW", group: "video-audio" },
    { id: "video-to-gif", title: "Video to GIF", icon: Image, color: "from-rose-500 to-red-500", desc: "Create animated GIFs from videos", badge: "NEW", group: "video-audio" },
    { id: "gif-to-video", title: "GIF to Video", icon: Film, color: "from-indigo-500 to-violet-500", desc: "Convert GIFs back to video files", badge: "NEW", group: "video-audio" },
    { id: "merge-videos", title: "Merge Videos", icon: Combine, color: "from-blue-500 to-indigo-500", desc: "Combine multiple video clips into one", badge: "NEW", group: "video-audio" },
    { id: "merge-audio", title: "Merge Audio", icon: Music, color: "from-purple-500 to-indigo-500", desc: "Combine multiple audio files into one", badge: "NEW", group: "video-audio" },
    { id: "video-thumbnail", title: "Video Thumbnail", icon: Image, color: "from-slate-700 to-slate-900", desc: "Extract thumbnails from video", badge: "NEW", group: "video-audio" },
    { id: "mute-video", title: "Mute Video", icon: Headphones, color: "from-indigo-500 to-purple-500", desc: "Remove audio track from video", badge: "NEW", group: "video-audio" },
    { id: "mp3-to-wav", title: "MP3 to WAV", icon: Music, color: "from-fuchsia-500 to-pink-500", desc: "Convert MP3 to WAV lossless format", badge: "NEW", group: "video-audio" },
    { id: "wav-to-mp3", title: "WAV to MP3", icon: Music, color: "from-purple-500 to-fuchsia-500", desc: "Convert WAV to MP3 format", badge: "NEW", group: "video-audio" },
    { id: "m4a-to-mp3", title: "M4A to MP3", icon: Music, color: "from-violet-500 to-purple-500", desc: "Convert M4A to MP3 format", badge: "NEW", group: "video-audio" },
    { id: "flac-to-mp3", title: "FLAC to MP3", icon: Music, color: "from-indigo-500 to-violet-500", desc: "Convert FLAC to MP3 format", badge: "NEW", group: "video-audio" },
    { id: "ogg-to-mp3", title: "OGG to MP3", icon: Music, color: "from-pink-500 to-rose-500", desc: "Convert OGG to MP3 format", badge: "NEW", group: "video-audio" },
    { id: "aac-to-mp3", title: "AAC to MP3", icon: Music, color: "from-rose-500 to-red-500", desc: "Convert AAC to MP3 format", badge: "NEW", group: "video-audio" },
    { id: "mov-to-mp4", title: "MOV to MP4", icon: Film, color: "from-fuchsia-500 to-purple-500", desc: "Convert MOV video to MP4", badge: "NEW", group: "video-audio" },
    { id: "avi-to-mp4", title: "AVI to MP4", icon: Film, color: "from-violet-500 to-indigo-500", desc: "Convert AVI video to MP4", badge: "POPULAR", group: "video-audio" },
    { id: "webm-to-mp4", title: "WebM to MP4", icon: Film, color: "from-purple-500 to-pink-500", desc: "Convert WebM video to MP4", badge: "POPULAR", group: "video-audio" },
    { id: "mkv-to-mp4", title: "MKV to MP4", icon: Film, color: "from-indigo-500 to-blue-500", desc: "Convert MKV video to MP4", badge: "POPULAR", group: "video-audio" },
    
    // PDF STUDIO (PDF Tools)
    { id: "pdf-compress", title: "Compress PDF", icon: FileSearch, color: "from-blue-500 to-cyan-500", desc: "Reduce PDF file size while maintaining quality.", badge: "POPULAR", group: "pdf" },
    { id: "pdf-merge", title: "Merge PDF", icon: Combine, color: "from-cyan-500 to-teal-500", desc: "Combine multiple PDF files into one single document.", badge: "POPULAR", group: "pdf" },
    { id: "pdf-split", title: "Split PDF", icon: FileCode2, color: "from-teal-500 to-emerald-500", desc: "Split a PDF into multiple separate files.", group: "pdf" },
    { id: "pdf-to-word", title: "PDF to Word", icon: FileText, color: "from-emerald-500 to-green-500", desc: "Convert PDF files into editable Word documents.", badge: "POPULAR", group: "pdf" },
    { id: "pdf-to-image", title: "PDF to Image", icon: Image, color: "from-indigo-500 to-violet-500", desc: "Convert PDF pages to high quality JPEG/PNG images.", group: "pdf" },
    { id: "image-to-pdf", title: "Image to PDF", icon: FileImage, color: "from-violet-500 to-purple-500", desc: "Instantly create PDF from image files.", group: "pdf" },
    { id: "pdf-rotate", title: "Rotate PDF", icon: RefreshCw, color: "from-purple-500 to-fuchsia-500", desc: "Rotate PDF pages by 90°, 180°, or 270°.", badge: "NEW", group: "pdf" },
    { id: "pdf-flatten", title: "Flatten PDF", icon: AlignLeft, color: "from-fuchsia-500 to-pink-500", desc: "Flatten PDF form fields and annotations.", group: "pdf" },
    { id: "pdf-unlock", title: "Unlock PDF", icon: Unlock, color: "from-pink-500 to-rose-500", desc: "Remove password protection from PDFs.", group: "pdf" },
    { id: "pdf-to-text", title: "PDF to Text", icon: FileText, color: "from-rose-500 to-red-500", desc: "Extract text content from PDF files.", group: "pdf" },
    { id: "pdf-add-page-numbers", title: "Add Page Numbers", icon: FileDigit, color: "from-red-500 to-orange-500", desc: "Add professional page numbers to your PDF.", group: "pdf" },
    { id: "html-to-pdf", title: "HTML to PDF", icon: Code2, color: "from-orange-500 to-amber-500", desc: "Convert web pages and HTML code into PDF.", group: "pdf" },
    { id: "excel-to-pdf", title: "Excel to PDF", icon: TableProperties, color: "from-amber-500 to-yellow-500", desc: "Convert Excel sheets to PDF without layout loss.", group: "pdf" },
    { id: "pdf-to-excel", title: "PDF to Excel", icon: Table, color: "from-yellow-500 to-lime-500", desc: "Extract structured Excel tables from PDF.", badge: "POPULAR", group: "pdf" },
    { id: "pdf-watermark", title: "PDF Watermark", icon: Shield, color: "from-lime-500 to-green-500", desc: "Stamp with custom text or image watermarks.", badge: "NEW", group: "pdf" },
    { id: "pdf-redact", title: "Redact PDF", icon: Eye, color: "from-stone-500 to-slate-600", desc: "Permanently black out sensitive information.", badge: "NEW", group: "pdf" },
    { id: "pdf-resize", title: "Resize PDF", icon: LayoutTemplate, color: "from-cyan-600 to-blue-600", desc: "Resize to A4, Letter, Legal or custom formats.", badge: "NEW", group: "pdf" },
    { id: "pdf-sign", title: "Sign PDF", icon: PenTool, color: "from-blue-600 to-indigo-600", desc: "Add secure digital signatures to your documents.", badge: "NEW", group: "pdf" },
    { id: "pdf-ocr", title: "PDF OCR", icon: SearchCode, color: "from-indigo-600 to-violet-600", desc: "Read scanned text using AI-based OCR.", badge: "POPULAR", group: "pdf" },
    { id: "pdf-crop", title: "Crop PDF", icon: Image, color: "from-violet-600 to-purple-600", desc: "Crop page dimensions and remove margins.", badge: "NEW", group: "pdf" },
    { id: "pdf-extract-pages", title: "Extract Pages", icon: FileCode, color: "from-purple-600 to-fuchsia-600", desc: "Separate specific pages from your PDF.", badge: "NEW", group: "pdf" },
    { id: "pdf-delete-pages", title: "Delete Pages", icon: Trash2, color: "from-fuchsia-600 to-pink-600", desc: "Permanently delete unwanted PDF pages.", badge: "NEW", group: "pdf" },
    { id: "pdf-to-pdf-a", title: "PDF to PDF/A", icon: Archive, color: "from-slate-600 to-slate-800", desc: "Convert to archive standard for long-term storage.", badge: "NEW", group: "pdf" },
    { id: "pdf-repair", title: "Repair PDF", icon: Heart, color: "from-rose-600 to-red-600", desc: "Fix corrupted or damaged PDF files.", badge: "NEW", group: "pdf" },
    { id: "pdf-compare", title: "Compare PDFs", icon: ArrowRightLeft, color: "from-sky-500 to-indigo-500", desc: "Map differences between two PDF files.", badge: "NEW", group: "pdf" },
    { id: "word-to-pdf", title: "Word to PDF", icon: FileText, color: "from-blue-400 to-cyan-500", desc: "Convert Word files to original PDF layout.", group: "pdf" },
    { id: "ppt-to-pdf", title: "PPT to PDF", icon: Monitor, color: "from-orange-400 to-rose-400", desc: "Save PowerPoint slides as PDF.", badge: "NEW", group: "pdf" },
    { id: "pdf-edit-metadata", title: "Edit Metadata", icon: TextCursorInput, color: "from-teal-400 to-emerald-400", desc: "Edit author, title and creation properties.", badge: "NEW", group: "pdf" },
    { id: "pdf-to-html", title: "PDF to HTML", icon: Code, color: "from-fuchsia-400 to-pink-400", desc: "Convert PDF files into browser-friendly HTML.", badge: "NEW", group: "pdf" },
    { id: "pdf-to-ppt", title: "PDF to PPT", icon: LayoutTemplate, color: "from-violet-400 to-purple-400", desc: "Convert PDF pages to editable PPTX slides.", badge: "NEW", group: "pdf" },
    { id: "pdf-fill-form", title: "Fill PDF Form", icon: Keyboard, color: "from-emerald-400 to-green-400", desc: "Fill interactive PDF forms directly on screen.", badge: "NEW", group: "pdf" },
    { id: "pdf-grayscale", title: "Grayscale PDF", icon: Contrast, color: "from-zinc-500 to-zinc-700", desc: "Convert PDF colors to black and white.", badge: "NEW", group: "pdf" },
    { id: "pdf-extract-images", title: "Extract Images", icon: Image, color: "from-cyan-400 to-blue-400", desc: "Extract embedded photos from the PDF document.", badge: "NEW", group: "pdf" },
    { id: "pdf-header-footer", title: "Header & Footer", icon: ArrowLeft, color: "from-slate-400 to-slate-600", desc: "Apply custom text/dates to top and bottom.", badge: "NEW", group: "pdf" },
    { id: "pdf-bates", title: "Bates Numbering", icon: Hash, color: "from-stone-600 to-stone-800", desc: "Generate Bates index for legal documents.", badge: "NEW", group: "pdf" },
    { id: "pdf-layout", title: "Page Layout", icon: LayoutGrid, color: "from-indigo-400 to-violet-400", desc: "Convert PDF pages to 2-up or 4-up sheets.", badge: "NEW", group: "pdf" },
    { id: "pdf-to-markdown", title: "PDF to Markdown", icon: FileDigit, color: "from-pink-400 to-rose-400", desc: "Deconstruct PDF data into structured MD code.", badge: "NEW", group: "pdf" },
    { id: "pdf-to-csv", title: "PDF to CSV", icon: TableProperties, color: "from-teal-500 to-emerald-500", desc: "Convert PDF tables into reliable CSV sheets.", badge: "NEW", group: "pdf" },
    { id: "pdf-stamp", title: "PDF Stamp", icon: Briefcase, color: "from-amber-600 to-orange-700", desc: "Apply Approved, Audit etc. professional stamps.", badge: "NEW", group: "pdf" },
    
    // IMAGE TOOLS (Image Tools)
    { id: "image-compressor", title: "Image Compressor", icon: Image, color: "from-blue-500 to-indigo-500", desc: "Batch compress photos and graphics", badge: "POPULAR", group: "photo" },
    { id: "image-resizer", title: "Image Resizer", icon: Image, color: "from-indigo-500 to-purple-500", desc: "Resize images for any platform", badge: "POPULAR", group: "photo" },
    { id: "image-converter", title: "Image Converter", icon: RefreshCw, color: "from-purple-500 to-pink-500", desc: "Batch convert image files", badge: "POPULAR", group: "photo" },
    { id: "image-cropper-2", title: "Image Cropper", icon: Image, color: "from-pink-500 to-rose-500", desc: "Crop photos with live preview", group: "photo" },
    { id: "image-watermark", title: "Image Watermark", icon: FileImage, color: "from-amber-500 to-orange-500", desc: "Apply text or logo watermarks", badge: "NEW", group: "photo" },
    
    // FORMAT CONVERTERS (HEIC etc.)
    { id: "heic-to-jpg", title: "HEIC to JPG", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "Convert Apple HEIC photos to JPG", badge: "NEW", group: "photo" },
    { id: "heic-to-png", title: "HEIC to PNG", icon: RefreshCw, color: "from-emerald-500 to-cyan-500", desc: "Convert Apple HEIC photos to PNG", group: "photo" },
    { id: "heic-to-webp", title: "HEIC to WebP", icon: RefreshCw, color: "from-cyan-500 to-blue-500", desc: "Convert Apple HEIC photos to WebP", badge: "NEW", group: "photo" },
    { id: "heic-to-gif", title: "HEIC to GIF", icon: RefreshCw, color: "from-blue-500 to-indigo-500", desc: "Convert Apple HEIC photos to GIF", badge: "NEW", group: "photo" },
    { id: "heif-to-jpg", title: "HEIF to JPG", icon: RefreshCw, color: "from-indigo-500 to-violet-500", desc: "Convert HEIF format to JPG", badge: "NEW", group: "photo" },
    { id: "png-to-jpg", title: "PNG to JPG", icon: RefreshCw, color: "from-violet-500 to-purple-500", desc: "Convert PNG images to JPG format", badge: "POPULAR", group: "photo" },
    { id: "jpg-to-png", title: "JPG to PNG", icon: RefreshCw, color: "from-purple-500 to-fuchsia-500", desc: "Convert JPG images to PNG format", group: "photo" },
    { id: "webp-to-png", title: "WebP to PNG", icon: RefreshCw, color: "from-fuchsia-500 to-pink-500", desc: "Convert WebP format to PNG", group: "photo" },
    { id: "webp-to-jpg", title: "WebP to JPG", icon: RefreshCw, color: "from-pink-500 to-rose-500", desc: "Convert WebP format to JPG", group: "photo" },
    { id: "png-to-webp", title: "PNG to WebP", icon: RefreshCw, color: "from-gray-600 to-gray-800", desc: "Convert PNG format to WebP", group: "photo" },
    { id: "jpg-to-webp", title: "JPG to WebP", icon: RefreshCw, color: "from-gray-700 to-gray-900", desc: "Convert JPG format to WebP", group: "photo" },
    { id: "svg-to-png", title: "SVG to PNG", icon: RefreshCw, color: "from-orange-500 to-red-500", desc: "Convert vector SVGs to PNG", group: "photo" },
    { id: "gif-to-png", title: "GIF to PNG", icon: RefreshCw, color: "from-red-500 to-rose-500", desc: "Convert GIF frames to PNG", group: "photo" },
    { id: "bmp-to-jpg", title: "BMP to JPG", icon: RefreshCw, color: "from-rose-500 to-pink-500", desc: "Convert BMP images to JPG format", group: "photo" },
    { id: "tiff-to-jpg", title: "TIFF to JPG", icon: RefreshCw, color: "from-pink-500 to-purple-500", desc: "Convert TIFF documents to JPG", badge: "NEW", group: "photo" },
    { id: "tiff-to-png", title: "TIFF to PNG", icon: RefreshCw, color: "from-purple-500 to-indigo-500", desc: "Convert TIFF documents to PNG", badge: "NEW", group: "photo" },
    { id: "jpg-to-bmp", title: "JPG to BMP", icon: RefreshCw, color: "from-indigo-500 to-cyan-500", desc: "Convert JPG images to BMP", badge: "NEW", group: "photo" },
    { id: "png-to-bmp", title: "PNG to BMP", icon: RefreshCw, color: "from-cyan-500 to-teal-500", desc: "Convert PNG images to BMP", badge: "NEW", group: "photo" },
    { id: "avif-to-jpg", title: "AVIF to JPG", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "Convert AVIF format to JPG", badge: "NEW", group: "photo" },
    { id: "avif-to-png", title: "AVIF to PNG", icon: RefreshCw, color: "from-emerald-500 to-green-500", desc: "Convert AVIF format to PNG", badge: "NEW", group: "photo" },
    { id: "ico-to-png", title: "ICO to PNG", icon: RefreshCw, color: "from-yellow-400 to-orange-500", desc: "Convert Windows icons to PNG", badge: "NEW", group: "photo" },
    { id: "gif-to-jpg", title: "GIF to JPG", icon: RefreshCw, color: "from-orange-500 to-red-500", desc: "Convert GIF animations to JPG", badge: "NEW", group: "photo" },
    
    // PHOTO ADJUSTMENTS
    { id: "brightness-contrast", title: "Brightness & Contrast", icon: Image, color: "from-yellow-300 to-orange-400", desc: "Adjust image brightness and contrast", badge: "POPULAR", group: "photo" },
    { id: "hue-saturation", title: "Hue & Saturation", icon: Image, color: "from-fuchsia-500 to-pink-500", desc: "Professional HSL color adjustments", badge: "POPULAR", group: "photo" },
    { id: "exposure", title: "Exposure", icon: Image, color: "from-slate-200 to-slate-400", desc: "Adjust and correct image exposure", badge: "NEW", group: "photo" },
    { id: "color-balance", title: "Color Balance", icon: Image, color: "from-blue-400 to-cyan-400", desc: "Fine-tune professional color balance", badge: "NEW", group: "photo" },
    { id: "levels", title: "Levels", icon: Image, color: "from-gray-500 to-slate-600", desc: "Professional histogram and point-curve tuning", badge: "POPULAR", group: "photo" },
    { id: "curves", title: "Curves", icon: Image, color: "from-violet-500 to-fuchsia-500", desc: "Manage color harmony and RGB tone curves", badge: "POPULAR", group: "photo" },
    { id: "vibrance", title: "Vibrance", icon: Image, color: "from-orange-400 to-rose-400", desc: "Boost colors while protecting skin tones", badge: "NEW", group: "photo" },
    { id: "white-balance", title: "White Balance", icon: Image, color: "from-zinc-100 to-zinc-300", desc: "Adjust temperature and neutralize color casts", badge: "NEW", group: "photo" },
    { id: "channel-mixer", title: "Channel Mixer", icon: Image, color: "from-red-400 to-blue-400", desc: "Advanced RGB channel swapping", badge: "NEW", group: "photo" },
    { id: "selective-color", title: "Selective Color", icon: Image, color: "from-emerald-400 to-teal-500", desc: "Target specific color ranges", badge: "NEW", group: "photo" },
    { id: "sharpen", title: "Sharpen", icon: Image, color: "from-sky-400 to-indigo-500", desc: "Unsharp mask and high-pass sharpening", badge: "NEW", group: "photo" },
    { id: "vignette", title: "Vignette Effect", icon: Image, color: "from-slate-800 to-black", desc: "Create cinematic dark or white edges", badge: "NEW", group: "photo" },
    { id: "dust-noise", title: "Dust & Noise", icon: Image, color: "from-stone-400 to-stone-600", desc: "Add film grain or remove digital noise", badge: "NEW", group: "photo" },
    
    // FILTERS & EFFECTS
    { id: "duotone", title: "Duotone Effect", icon: Image, color: "from-fuchsia-600 to-rose-600", desc: "Apply Spotify-style Duotone color maps", badge: "NEW", group: "photo" },
    { id: "3d-lut", title: "3D LUT", icon: Image, color: "from-indigo-600 to-slate-800", desc: "Apply cinematic Look-Up Tables", badge: "NEW", group: "photo" },
    { id: "posterize", title: "Posterize", icon: Image, color: "from-yellow-500 to-red-500", desc: "Artistic posterization and color banding", badge: "NEW", group: "photo" },
    { id: "threshold", title: "Threshold", icon: Image, color: "from-black to-white", desc: "High-contrast black and white conversion", badge: "NEW", group: "photo" },
    { id: "invert-colors", title: "Invert Colors", icon: Image, color: "from-violet-600 to-lime-500", desc: "Instantly invert colors to negative", badge: "NEW", group: "photo" },
    { id: "sepia-vintage", title: "Sepia & Vintage", icon: Image, color: "from-amber-700 to-yellow-900", desc: "Authentic sepia and old film effects", badge: "NEW", group: "photo" },
    { id: "shadow-highlight", title: "Shadow & Highlight", icon: Image, color: "from-slate-300 to-slate-600", desc: "Balance the dynamic range", badge: "NEW", group: "photo" },
    { id: "clarity-texture", title: "Clarity & Texture", icon: Image, color: "from-teal-600 to-emerald-700", desc: "Enhance mid-tone contrast and texture", badge: "NEW", group: "photo" },
    { id: "dehaze", title: "Dehaze", icon: Image, color: "from-cyan-300 to-blue-500", desc: "Remove haze, mist and fog", badge: "NEW", group: "photo" },
    { id: "color-grading", title: "Color Grading", icon: Image, color: "from-violet-800 to-fuchsia-800", desc: "Professional cinematic color grading", badge: "NEW", group: "photo" },
    { id: "chromatic-aberration", title: "Chromatic Aberration", icon: Image, color: "from-red-500 to-cyan-500", desc: "Fix or add color fringing and distortions", badge: "NEW", group: "photo" },
    
    // TRANSFORMS & FUN
    { id: "rotate-flip", title: "Rotate & Flip", icon: Image, color: "from-blue-400 to-indigo-500", desc: "Quickly fix orientation of photos", badge: "NEW", group: "photo" },
    { id: "perspective", title: "Perspective", icon: Image, color: "from-stone-500 to-stone-700", desc: "Fix perspective and keystone distortion", badge: "NEW", group: "photo" },
    { id: "tilt-shift", title: "Tilt Shift", icon: Image, color: "from-lime-500 to-green-600", desc: "Create miniature toy-town blur effects", badge: "NEW", group: "photo" },
    { id: "mirror-effect", title: "Mirror Effect", icon: Image, color: "from-cyan-400 to-sky-500", desc: "Kaleidoscope and reflection effects", badge: "NEW", group: "photo" },
    { id: "distortion", title: "Distortion", icon: Image, color: "from-purple-400 to-pink-500", desc: "Fisheye, swirl and pinch effects", badge: "NEW", group: "photo" },
    { id: "photo-filters", title: "Photo Filters", icon: Image, color: "from-rose-400 to-orange-400", desc: "Apply ready-to-use color filters", badge: "NEW", group: "photo" },
    { id: "text-overlay", title: "Text Overlay", icon: Type, color: "from-indigo-400 to-blue-500", desc: "Add stylish typography to photos", badge: "NEW", group: "photo" },
    { id: "border-frame", title: "Border & Frame", icon: Image, color: "from-amber-600 to-orange-700", desc: "Add premium borders to photos", badge: "NEW", group: "photo" },
    { id: "collage-maker", title: "Collage Maker", icon: LayoutTemplate, color: "from-fuchsia-500 to-violet-500", desc: "Create stylish photo collages", badge: "NEW", group: "photo" },
    { id: "meme-generator", title: "Meme Generator", icon: Image, color: "from-yellow-400 to-red-400", desc: "Quickly create hilarious memes", badge: "NEW", group: "photo" },
    { id: "batch-edit", title: "Batch Edit", icon: Library, color: "from-slate-600 to-slate-800", desc: "Resize and filter images in bulk", badge: "POPULAR", group: "photo" },
    { id: "replace-color", title: "Replace Color", icon: Image, color: "from-teal-400 to-emerald-500", desc: "Replace specific colors in an image", badge: "NEW", group: "photo" },
    
    // UTILITIES
    { id: "histogram", title: "Histogram", icon: PieChart, color: "from-blue-600 to-indigo-700", desc: "Image exposure and color analyzer", badge: "NEW", group: "photo" },
    { id: "exif-editor", title: "EXIF Editor", icon: FileText, color: "from-gray-500 to-slate-700", desc: "Edit and extract image metadata", badge: "NEW", group: "photo" },
    { id: "social-media-resizer", title: "Social Media Resizer", icon: Image, color: "from-pink-500 to-purple-600", desc: "Crop for Instagram, YouTube and TikTok", badge: "POPULAR", group: "photo" },
    { id: "sketch-effect", title: "Sketch Effect", icon: Image, color: "from-stone-300 to-stone-500", desc: "Turn images into pencil sketches", badge: "NEW", group: "photo" },
    { id: "gradient-map", title: "Gradient Map", icon: Image, color: "from-cyan-500 to-fuchsia-500", desc: "Create complex color grade maps", badge: "NEW", group: "photo" },
    { id: "split-toning", title: "Split Toning", icon: Image, color: "from-amber-400 to-indigo-400", desc: "Separate shadow and highlight toning", badge: "NEW", group: "photo" },
    { id: "liquify", title: "Liquify", icon: Image, color: "from-emerald-400 to-cyan-500", desc: "Interactive Photoshop-style warping", badge: "NEW", group: "photo" },
    { id: "photo-mosaic", title: "Photo Mosaic", icon: LayoutTemplate, color: "from-purple-500 to-pink-500", desc: "Build mosaics from thousands of images", badge: "NEW", group: "photo" },
    { id: "overlay-blend", title: "Overlay & Blend", icon: Image, color: "from-rose-400 to-red-500", desc: "16 different blend mode textures", badge: "NEW", group: "photo" },
    { id: "compare-images", title: "Compare Images", icon: ArrowRightLeft, color: "from-slate-400 to-slate-600", desc: "Side-by-side detailed image comparison", badge: "NEW", group: "photo" },
    { id: "color-picker", title: "Color Picker", icon: MousePointer2, color: "from-blue-400 to-teal-400", desc: "Pick colors using an eyedropper tool", badge: "NEW", group: "photo" },
    { id: "color-palette", title: "Color Palette", icon: Image, color: "from-fuchsia-400 to-purple-500", desc: "Extract palettes from your images", badge: "POPULAR", group: "photo" },
    { id: "screenshot-beautifier", title: "Screenshot Beautifier", icon: MonitorPlay, color: "from-indigo-400 to-sky-400", desc: "Enhance screenshots with shadows and backgrounds", badge: "POPULAR", group: "photo" },
    
    // TEXT TOOLS (Text Tools)
    { id: "word-counter", title: "Word Counter", icon: Type, color: "from-blue-500 to-cyan-500", desc: "Count words, characters and paragraphs.", badge: "POPULAR", group: "text-tools" },
    { id: "case-converter", title: "Case Converter", icon: Type, color: "from-indigo-500 to-purple-500", desc: "Convert text case and formatting.", group: "text-tools" },
    { id: "lorem-ipsum", title: "Lorem Ipsum", icon: FileText, color: "from-slate-500 to-slate-700", desc: "Generate random placeholder text.", group: "text-tools" },
    { id: "text-diff", title: "Text Difference", icon: ArrowRightLeft, color: "from-orange-500 to-red-500", desc: "Find differences between two blocks of text.", badge: "NEW", group: "text-tools" },
    { id: "fancy-text", title: "Fancy Text", icon: Type, color: "from-pink-500 to-rose-500", desc: "Stylish text generation for social media.", badge: "POPULAR", group: "text-tools" },
    { id: "text-cleaner", title: "Text Cleaner", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "Remove extra spaces and noise.", badge: "NEW", group: "text-tools" },
    { id: "invisible-text", title: "Invisible Text", icon: Type, color: "from-slate-300 to-slate-400", desc: "Create copyable invisible characters.", badge: "NEW", group: "text-tools" },
    { id: "slug-generator", title: "Slug Generator", icon: FileText, color: "from-cyan-500 to-blue-500", desc: "URL-friendly text converter.", badge: "NEW", group: "text-tools" },
    { id: "binary-converter", title: "Binary Converter", icon: Code, color: "from-green-500 to-emerald-600", desc: "Convert text to computer binary code.", badge: "NEW", group: "text-tools" },
    { id: "reverse-text", title: "Reverse Text", icon: ArrowRightLeft, color: "from-purple-500 to-indigo-500", desc: "Flip your text from right to left.", badge: "NEW", group: "text-tools" },
    { id: "remove-duplicates", title: "Remove Duplicates", icon: Trash2, color: "from-red-400 to-rose-500", desc: "Delete duplicate lines and words.", badge: "NEW", group: "text-tools" },
    { id: "text-repeater", title: "Text Repeater", icon: RefreshCw, color: "from-yellow-400 to-orange-500", desc: "Automatically repeat text thousands of times.", badge: "NEW", group: "text-tools" },
    { id: "zalgo-text", title: "Zalgo Text", icon: Type, color: "from-zinc-700 to-black", desc: "Cursed and scary text effects.", badge: "NEW", group: "text-tools" },
    { id: "text-to-speech", title: "Text to Speech", icon: Mic, color: "from-fuchsia-600 to-purple-600", desc: "Read text aloud using browser voices.", badge: "POPULAR", group: "text-tools" },

    // BUSINESS TOOLS (Business & Finance Tools)
    { id: "biz-compound", title: "Compound Interest", icon: CalculatorIcon, color: "from-emerald-500 to-teal-500", desc: "Calculate compound growth of investments", badge: "POPULAR", group: "business" },
    { id: "biz-loan", title: "Loan Calculator", icon: Briefcase, color: "from-blue-500 to-indigo-500", desc: "Monthly payouts and interest schedules", badge: "POPULAR", group: "business" },
    { id: "biz-tip", title: "Tip Calculator", icon: Coffee, color: "from-orange-400 to-amber-500", desc: "Quickly split restaurant bills and tips", badge: "NEW", group: "business" },
    { id: "biz-percentage", title: "Percentage Calc", icon: PieChart, color: "from-rose-400 to-red-500", desc: "Fast proportion and percentage problems", badge: "POPULAR", group: "business" },
    { id: "biz-discount", title: "Discount Calc", icon: Tags, color: "from-pink-500 to-rose-500", desc: "Calculate savings and net prices after discounts", badge: "NEW", group: "business" },
    { id: "biz-margin", title: "Margin Calc", icon: TrendingUp, color: "from-lime-500 to-green-600", desc: "Analyze profit margins based on costs", badge: "NEW", group: "business" },
    { id: "biz-roi", title: "ROI Calculator", icon: LineChart, color: "from-cyan-500 to-blue-600", desc: "Return on Investment percentage growth", badge: "NEW", group: "business" },
    { id: "biz-salary", title: "Salary Calculator", icon: Wallet, color: "from-violet-500 to-purple-600", desc: "Break down gross, net and hourly pay", badge: "NEW", group: "business" },
    { id: "biz-savings", title: "Savings Goal", icon: PiggyBank, color: "from-fuchsia-400 to-pink-500", desc: "Savings planner for a secure future", badge: "NEW", group: "business" },
    { id: "biz-inflation", title: "Inflation", icon: TrendingDown, color: "from-red-500 to-rose-600", desc: "Purchasing power loss over years", badge: "NEW", group: "business" },
    { id: "biz-mortgage", title: "Mortgage Calc", icon: Home, color: "from-teal-500 to-emerald-600", desc: "Home loans and mortgage cost calculations", badge: "POPULAR", group: "business" },
    { id: "biz-currency", title: "Currency Converter", icon: Coins, color: "from-amber-400 to-yellow-500", desc: "Instant foreign exchange rate converter", badge: "POPULAR", group: "business" },
    { id: "biz-paycheck", title: "Paycheck Calc", icon: Receipt, color: "from-sky-400 to-blue-500", desc: "Net pay after deductions and taxes", badge: "POPULAR", group: "business" },
    { id: "biz-emi", title: "EMI Calculator", icon: CreditCard, color: "from-indigo-400 to-violet-500", desc: "Equated Monthly Installment payouts", badge: "POPULAR", group: "business" },
    { id: "biz-sip", title: "SIP Calculator", icon: BarChart3, color: "from-purple-500 to-fuchsia-600", desc: "Systematic Investment Plan wealth estimation", badge: "POPULAR", group: "business" },
    { id: "biz-debt", title: "Debt Payoff", icon: Landmark, color: "from-rose-500 to-red-600", desc: "Debt-free strategies and timelines", badge: "NEW", group: "business" },
    { id: "biz-budget", title: "Budget Planner", icon: CalculatorIcon, color: "from-green-400 to-emerald-500", desc: "Personal finance and monthly budgeting", badge: "NEW", group: "business" },
    { id: "biz-networth", title: "Net Worth", icon: Scale, color: "from-blue-400 to-cyan-500", desc: "All assets - liabilities net wealth analysis", badge: "NEW", group: "business" },
    { id: "biz-retirement", title: "Retirement Calc", icon: Compass, color: "from-yellow-500 to-orange-500", desc: "Early retirement and fund estimation", badge: "POPULAR", group: "business" },
    { id: "biz-investment", title: "Investment Goal", icon: Target, color: "from-teal-400 to-cyan-500", desc: "Target goals for financial independence", badge: "NEW", group: "business" },
    { id: "biz-vat", title: "VAT Calculator", icon: Percent, color: "from-sky-500 to-indigo-500", desc: "Calculate VAT inclusive or exclusive values", badge: "POPULAR", group: "business" },
    { id: "biz-creditcard", title: "Credit Card Payoff", icon: CreditCard, color: "from-violet-400 to-purple-500", desc: "Timeline to become interest-free", badge: "NEW", group: "business" },
    { id: "biz-auto", title: "Auto Loan", icon: Car, color: "from-rose-400 to-pink-500", desc: "Taxes and payouts for vehicle loans", badge: "POPULAR", group: "business" },
    { id: "biz-crypto", title: "Crypto Profit", icon: Bitcoin, color: "from-amber-400 to-yellow-600", desc: "Calculate P/L for crypto trade orders", badge: "POPULAR", group: "business" },
    { id: "biz-breakeven", title: "Breakeven Analysis", icon: ArrowRightLeft, color: "from-emerald-400 to-teal-500", desc: "Find the point where revenue matches costs", badge: "NEW", group: "business" },
    { id: "biz-cpm", title: "CPM Calculator", icon: Megaphone, color: "from-cyan-500 to-blue-500", desc: "Cost Per Mille (thousand impressions)", badge: "NEW", group: "business" },
    { id: "biz-cagr", title: "CAGR Calculator", icon: TrendingUp, color: "from-purple-500 to-pink-500", desc: "Compound Annual Growth Rate performance", badge: "POPULAR", group: "business" },
    { id: "biz-tvm", title: "TVM Calculator", icon: Clock, color: "from-orange-400 to-red-400", desc: "Time Value of Money calculations", badge: "NEW", group: "business" },
    { id: "biz-rentvsbuy", title: "Rent vs Buy", icon: Home, color: "from-indigo-400 to-blue-500", desc: "Analyze if renting or buying is better", badge: "NEW", group: "business" },

    // DEV TOOLS (Dev Tools)
    { id: "json-formatter", title: "JSON Formatter", icon: Code2, color: "from-emerald-500 to-teal-500", desc: "Clean and format your JSON code", badge: "POPULAR", group: "dev-tools" },
    { id: "json-graph", title: "JSON Graph", icon: Network, color: "from-teal-500 to-cyan-500", desc: "Visualize JSON data in a tree structure", badge: "POPULAR", group: "dev-tools" },
    { id: "base64", title: "Base64", icon: FileCode2, color: "from-cyan-500 to-blue-500", desc: "Encode or decode in Base64 format", badge: "POPULAR", group: "dev-tools" },
    { id: "hash-generator", title: "Hash Generator", icon: KeyRound, color: "from-blue-500 to-indigo-500", desc: "MD5, SHA-256 and SHA-512 encryption", badge: "POPULAR", group: "dev-tools" },
    { id: "uuid-generator", title: "UUID Generator", icon: Fingerprint, color: "from-indigo-500 to-violet-500", desc: "Generate random secure V4 IDs", badge: "POPULAR", group: "dev-tools" },
    { id: "regex-tester", title: "Regex Tester", icon: TextCursorInput, color: "from-violet-500 to-purple-500", desc: "Test and debug regular expressions", badge: "POPULAR", group: "dev-tools" },
    { id: "markdown-editor", title: "Markdown Editor", icon: FileDigit, color: "from-purple-500 to-fuchsia-500", desc: "Live preview MD code generator", badge: "NEW", group: "dev-tools" },
    { id: "code-formatter", title: "Code Formatter", icon: AlignLeft, color: "from-fuchsia-500 to-pink-500", desc: "Organize HTML, CSS and JS codes", badge: "POPULAR", group: "dev-tools" },
    { id: "json-to-csv", title: "JSON to CSV", icon: TableProperties, color: "from-pink-500 to-rose-500", desc: "Convert JSON arrays to Excel format", badge: "POPULAR", group: "dev-tools" },
    { id: "meta-tag-generator", title: "Meta Tag Generator", icon: Tags, color: "from-rose-500 to-red-500", desc: "SEO head tags and meta data", badge: "NEW", group: "dev-tools" },
    { id: "og-preview", title: "OG Preview", icon: MonitorSmartphone, color: "from-red-500 to-orange-500", desc: "Test Open Graph social media cards", badge: "POPULAR", group: "dev-tools" },
    { id: "cron-expression", title: "CRON Expression", icon: Clock4, color: "from-orange-500 to-amber-500", desc: "Generate scheduled task syntax", badge: "POPULAR", group: "dev-tools" },
    { id: "color-contrast", title: "Color Contrast", icon: Contrast, color: "from-amber-500 to-yellow-500", desc: "Accessibility ratio and HEX testing", badge: "POPULAR", group: "dev-tools" },
    { id: "json-schema", title: "JSON Schema", icon: Braces, color: "from-yellow-500 to-lime-500", desc: "Generate TS/JSON schemas from data", badge: "POPULAR", group: "dev-tools" },
    { id: "jwt-decoder", title: "JWT Decoder", icon: Unlock, color: "from-lime-500 to-green-500", desc: "Instantly view JSON Web Token content", badge: "POPULAR", group: "dev-tools" },
    { id: "html-entities", title: "HTML Entities", icon: Code, color: "from-green-500 to-emerald-500", desc: "Safe HTML entity character conversion", badge: "POPULAR", group: "dev-tools" },
    { id: "url-encoder", title: "URL Encoder", icon: Link, color: "from-emerald-600 to-teal-600", desc: "Encode links (URI encoding)", badge: "POPULAR", group: "dev-tools" }
];


function formatDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

interface LandingPageProps {
    onSelectTemplate: (id: string, content: string) => void;
    onOpenRecentDocument?: (doc: RecentDocument) => void;
}

export default function LandingPage({ onSelectTemplate, onOpenRecentDocument }: LandingPageProps) {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
    const [activeToolGroup, setActiveToolGroup] = useState<string | null>(null);

    useEffect(() => {
        setRecentDocs(getRecentDocuments());
    }, []);

    const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteRecentDocument(id);
        setRecentDocs(getRecentDocuments());
    };

    const handleClearAll = () => {
        clearRecentDocuments();
        setRecentDocs([]);
    };

    const handleOpenDoc = (doc: RecentDocument) => {
        if (onOpenRecentDocument) {
            onOpenRecentDocument(doc);
        } else {
            onSelectTemplate("recent:" + doc.id, doc.content);
        }
    };

    const filteredTemplates = TEMPLATES.filter(t => {
        const matchesCategory = activeCategory === "all" || t.category === activeCategory;
        const matchesSearch = searchQuery === "" ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0a0a1a] dark:via-[#0d0d24] dark:to-[#0a0a1a] flex flex-col">
            {/* Header */}
            <header className="p-5 flex items-center justify-between backdrop-blur-xl bg-white/70 dark:bg-[#0d0d1a]/80 sticky top-0 z-50 border-b border-zinc-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                        <FileText className="text-white" size={22} />
                    </div>
                    <div>
                        <span className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Word P.</span>
                        <span className="text-[10px] text-zinc-400 block -mt-1 font-medium">Professional Document Editor</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 relative z-10">
                {/* Jaw-Dropping Hero Section */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-14 text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800/50">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                        Word P. OS 2.0 Live
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tight mb-6" suppressHydrationWarning>
                        Productivity Without
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 ml-3">Boundaries.</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                        Manage all your professional documents, designs, and templates from a single super app. Accelerate with tranquility.
                    </p>
                </motion.div>

                {/* Spotlight Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-16 max-w-2xl mx-auto relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[24px] blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center bg-white/70 dark:bg-[#12122b]/80 backdrop-blur-2xl border-2 border-zinc-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-blue-900/5 dark:shadow-none overflow-hidden transition-all group-focus-within:border-blue-500">
                        <div className="pl-6 text-zinc-400">
                            <Search size={26} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search files, tools, or templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-6 py-5 text-lg font-medium bg-transparent text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="relative right-4 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>



                {/* Quick Tools Header */}
                <div className="mb-12" id="quick-tools">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Library size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">Studios</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium -mt-1">Browse all tools by their category.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!activeToolGroup ? (
                            <motion.div
                                key="folders"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-3 justify-items-center"
                            >
                                    {/* Folders List */}
                                    {[
                                        { id: "converters", title: "Converters", subtitle: "10+ converters between PDF, Word, PPTX and Image formats.", icon: RefreshCw, bg: "from-emerald-400 to-teal-600", borderHover: "hover:border-emerald-500/50", glow: "group-hover:shadow-emerald-500/20" },
                                        { id: "pdf", title: "PDF Studio", subtitle: "Merge, split, edit and manage PDF pages with full control.", icon: FileSearch, bg: "from-rose-400 to-red-600", borderHover: "hover:border-rose-500/50", glow: "group-hover:shadow-rose-500/20" },
                                        { id: "code", title: "Code Editor", subtitle: "Write, edit and run HTML, CSS and JavaScript with live preview.", icon: Code, bg: "from-violet-500 to-indigo-600", borderHover: "hover:border-violet-500/50", glow: "group-hover:shadow-violet-500/20" },
                                        { id: "dev-tools", title: "Dev Tools", subtitle: "JSON parsing, crypto hashing, formatting and data testing.", icon: TerminalSquare, bg: "from-emerald-400 to-teal-600", borderHover: "hover:border-emerald-500/50", glow: "group-hover:shadow-emerald-500/20" },
                                        { id: "business", title: "Business Tools", subtitle: "Financial calculators, interest, ROI and company insights.", icon: LineChart, bg: "from-blue-400 to-cyan-600", borderHover: "hover:border-blue-500/50", glow: "group-hover:shadow-blue-500/20" },
                                        { id: "photo", title: "Photo Studio", subtitle: "Canva-style design tools and background removal utilities.", icon: Image, bg: "from-fuchsia-400 to-purple-600", borderHover: "hover:border-fuchsia-500/50", glow: "group-hover:shadow-fuchsia-500/20" },
                                        { id: "text-tools", title: "Text Studio", subtitle: "String manipulation, formatting and robust text generation.", icon: Type, bg: "from-sky-400 to-blue-600", borderHover: "hover:border-sky-500/50", glow: "group-hover:shadow-sky-500/20" },
                                        { id: "word", title: "Word", subtitle: "Open Word files and start with 50+ ready-made professional templates.", icon: FileText, bg: "from-blue-400 to-indigo-600", borderHover: "hover:border-blue-500/50", glow: "group-hover:shadow-blue-500/20" },
                                        { id: "office", title: "Office Tools", subtitle: "Advanced Excel sheet editor and intelligent assistants.", icon: Type, bg: "from-indigo-400 to-violet-600", borderHover: "hover:border-indigo-500/50", glow: "group-hover:shadow-indigo-500/20" },
                                        { id: "performance", title: "Speed & Performance", subtitle: "CPS test and click speed measurement tools.", icon: Zap, bg: "from-yellow-400 to-orange-600", borderHover: "hover:border-yellow-500/50", glow: "group-hover:shadow-yellow-500/20" },
                                        { id: "powerpoint", title: "Presentation (PPTX)", subtitle: "Create professional slide presentations and scene designs.", icon: PieChart, bg: "from-amber-400 to-orange-600", borderHover: "hover:border-amber-500/50", glow: "group-hover:shadow-amber-500/20" },
                                        { id: "video-audio", title: "Video & Audio Studio", subtitle: "Edit, convert and manage video and audio files.", icon: Video, bg: "from-pink-500 to-rose-600", borderHover: "hover:border-pink-500/50", glow: "group-hover:shadow-pink-500/20" }
                                    ].map((folder, i) => (
                                        <motion.button
                                            key={folder.id}
                                            onClick={() => setActiveToolGroup(folder.id)}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={cn("group relative w-72 h-72 sm:w-80 sm:h-80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[32px] p-6 border-2 border-transparent shadow-sm hover:shadow-2xl transition-all text-center overflow-hidden flex flex-col items-center justify-center shrink-0", folder.borderHover, folder.glow)}
                                        >
                                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br", folder.bg)}></div>
                                            
                                            <div className="flex flex-col items-center gap-6 relative z-10 w-full h-full justify-center">
                                                {/* Icon block */}
                                                <div className={cn("w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br", folder.bg)}>
                                                    <folder.icon size={36} strokeWidth={1.5} />
                                                </div>
                                                
                                                {/* Text Block */}
                                                <div className="flex-1 w-full mt-2 flex flex-col justify-center">
                                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{folder.title}</h3>
                                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-3 px-2 leading-relaxed">{folder.subtitle}</p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                        ) : activeToolGroup === "word" ? (
                            <motion.div
                                key="templates"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setActiveToolGroup(null)}
                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                                        >
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                        <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">
                                            Word
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                                        <button
                                            onClick={() => setActiveCategory("all")}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                                activeCategory === "all"
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200/50 dark:shadow-blue-900/40"
                                                    : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600"
                                            )}
                                        >
                                            All
                                        </button>
                                        {TEMPLATE_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                                    activeCategory === cat.id
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200/50 dark:shadow-blue-900/40"
                                                        : "bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600"
                                                )}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Word Tools (Open File + New) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Open Word File */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, translateY: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0 }}
                                        onClick={() => onSelectTemplate("word-open", "")}
                                        className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all text-left border-2 border-white/20"
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl" />
                                        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner">
                                            <FolderOpen size={24} className="text-white" />
                                        </div>
                                        <h3 className="font-bold text-sm text-white mb-1">Open Word File</h3>
                                        <p className="text-[10px] text-blue-100 font-medium line-clamp-2">Open .docx or .doc files in the editor</p>
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">NEW</span>
                                        </div>
                                    </motion.button>

                                    {/* New Blank Document */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, translateY: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        onClick={() => onSelectTemplate("blank", "<h1>Untitled Document</h1><p>Start typing...</p>")}
                                        className="group relative overflow-hidden bg-white/80 backdrop-blur-md dark:bg-slate-800/80 p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-slate-600 hover:border-blue-400 hover:shadow-xl transition-all text-left"
                                    >
                                        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-slate-700 dark:to-slate-600">
                                            <Plus size={24} className="text-zinc-500 dark:text-zinc-300" />
                                        </div>
                                        <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">New Document</h3>
                                        <p className="text-[10px] text-zinc-400 font-medium line-clamp-2">Start from scratch with a blank document</p>
                                    </motion.button>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-700" />
                                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Templates & Scenes</span>
                                    <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-700" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredTemplates.map((template, index) => (
                                        <motion.button
                                            key={template.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => onSelectTemplate(template.id, template.content)}
                                            className="group relative bg-white/80 backdrop-blur-md dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-zinc-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
                                        >
                                            <div className={cn("w-11 h-11 rounded-xl mb-3 flex items-center justify-center text-white shadow-lg bg-gradient-to-br", template.color)}>
                                                <template.icon size={22} />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{template.title}</h3>
                                            <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2">{template.description}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="tools"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <button 
                                        onClick={() => setActiveToolGroup(null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">
                                        {activeToolGroup === "converters" ? "Converters" : activeToolGroup === "pdf" ? "PDF Studio" : activeToolGroup === "photo" ? "Photo Studio" : activeToolGroup === "office" ? "Office Tools" : activeToolGroup === "text-tools" ? "Text Studio" : activeToolGroup === "dev-tools" ? "Developer Tools" : activeToolGroup === "business" ? "Business Tools" : activeToolGroup === "code" ? "Code Editor" : activeToolGroup === "performance" ? "Speed & Performance" : activeToolGroup === "video-audio" ? "Video & Audio Studio" : "PowerPoint Studio"}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {ALL_TOOLS.filter(t => t.group === activeToolGroup).map((tool, i) => (
                                        <motion.button
                                            key={tool.id}
                                            whileHover={{ scale: 1.02, translateY: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => onSelectTemplate(tool.id, (tool as any).content || "")}
                                            className="group relative overflow-hidden bg-white/80 backdrop-blur-md dark:bg-slate-800/80 p-5 rounded-2xl border border-zinc-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left"
                                        >
                                            <div className={cn("w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-lg bg-gradient-to-br", tool.color)}>
                                                <tool.icon size={24} />
                                            </div>
                                            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">{tool.title}</h3>
                                            <p className="text-[10px] text-zinc-400 font-medium line-clamp-2">{tool.desc}</p>

                                            {tool.badge && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{tool.badge}</span>
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>



                {/* Recent Documents */}
                <section className="mt-16">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                <Clock size={18} />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Recent Documents</h2>
                            {recentDocs.length > 0 && (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    {recentDocs.length} files
                                </span>
                            )}
                        </div>
                        {recentDocs.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={12} />
                                Clear All
                            </button>
                        )}
                    </div>

                    {recentDocs.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-zinc-300 dark:border-slate-600 p-10 flex flex-col items-center justify-center text-zinc-400">
                            <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                <FolderOpen size={28} className="text-zinc-300" />
                            </div>
                            <p className="text-base font-medium">No recent documents found</p>
                            <p className="text-sm">Choose a template above to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {recentDocs.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleOpenDoc(doc)}
                                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-zinc-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        {/* Document icon header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                                <FileText size={20} />
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteDoc(doc.id, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500"
                                                title="Delete document"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {doc.title}
                                        </h3>

                                        {/* Preview */}
                                        <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
                                            {doc.preview}
                                        </p>

                                        {/* Meta info */}
                                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(doc.lastModified)}
                                            </span>
                                            <span className="font-medium">{doc.wordCount} words</span>
                                        </div>

                                        {/* Open indicator */}
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                                                <ExternalLink size={12} />
                                            </div>
                                        </div>

                                        {/* Hover gradient */}
                                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-full -mr-6 -mb-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </main>

            <footer className="p-6 text-center text-zinc-400 dark:text-slate-500 text-sm border-t border-zinc-200/50 dark:border-slate-700/50">
                &copy; 2026 Word P. All rights reserved.
            </footer>
        </div>
    );
}
