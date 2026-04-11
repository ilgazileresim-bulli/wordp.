"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, PieChart, Library, ArrowRightLeft, FileSearch, MousePointer2, Image, FileImage, Clock, Trash2, ExternalLink, FolderOpen, RefreshCw, Type, Combine, Heart, LayoutTemplate, ArrowLeft, Code, FileCode, Braces, FileCode2, Zap, Video, Music, MonitorPlay, Mic, Headphones, Film, TerminalSquare, SearchCode, Network, KeyRound, Fingerprint, TextCursorInput, FileDigit, AlignLeft, Table, TableProperties, Tags, MonitorSmartphone, Clock4, Contrast, Unlock, Link, Code2, Archive, Hash, Calculator as CalculatorIcon, Briefcase, Coffee, TrendingUp, LineChart, Wallet, PiggyBank, TrendingDown, Home, Coins, Receipt, CreditCard, BarChart3, Landmark, Scale, Compass, Target, Percent, Car, Bitcoin, Megaphone, Shield, Eye, PenTool, Monitor, Keyboard, LayoutGrid } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
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
    { id: "video-converter", title: "Video Dönüştürücü", icon: RefreshCw, color: "from-pink-500 to-rose-500", desc: "Video formatlarını dönüştürün", badge: "POPÜLER", group: "video-audio" },
    { id: "audio-converter", title: "Ses Dönüştürücü", icon: RefreshCw, color: "from-fuchsia-500 to-purple-500", desc: "Ses formatlarını dönüştürün", badge: "POPÜLER", group: "video-audio" },
    { id: "video-to-mp3", title: "Videodan MP3'e", icon: Headphones, color: "from-indigo-500 to-blue-500", desc: "Videoları MP3'e çevirin", badge: "POPÜLER", group: "video-audio" },
    { id: "video-compressor", title: "Video Sıkıştırıcı", icon: Combine, color: "from-blue-500 to-cyan-500", desc: "Video boyutunu küçültün", badge: "POPÜLER", group: "video-audio" },
    { id: "trim-video", title: "Videoyu Kısalt", icon: Film, color: "from-violet-500 to-purple-500", desc: "Videoları kesin veya kısaltın", badge: "YENİ", group: "video-audio" },
    { id: "trim-audio", title: "Ses Kesici", icon: Music, color: "from-pink-500 to-rose-500", desc: "Ses dosyalarını kesin", badge: "YENİ", group: "video-audio" },
    { id: "video-to-gif", title: "Videodan GIF'e", icon: Image, color: "from-rose-500 to-red-500", desc: "Videoları GIF animasyonuna çevirin", badge: "YENİ", group: "video-audio" },
    { id: "gif-to-video", title: "GIF'den Videoya", icon: Film, color: "from-indigo-500 to-violet-500", desc: "GIF'leri videoya çevirin", badge: "YENİ", group: "video-audio" },
    { id: "merge-videos", title: "Videoları Birleştir", icon: Combine, color: "from-blue-500 to-indigo-500", desc: "Birden fazla videoyu birleştirin", badge: "YENİ", group: "video-audio" },
    { id: "merge-audio", title: "Ses Birleştirici", icon: Music, color: "from-purple-500 to-indigo-500", desc: "Ses dosyalarını birleştirin", badge: "YENİ", group: "video-audio" },
    { id: "video-thumbnail", title: "Video Küçük Resmi", icon: Image, color: "from-slate-700 to-slate-900", desc: "Videodan küçük resim çıkar", badge: "YENİ", group: "video-audio" },
    { id: "mute-video", title: "Videoyu Sessize Al", icon: Headphones, color: "from-indigo-500 to-purple-500", desc: "Videonun sesini kaldırın", badge: "YENİ", group: "video-audio" },
    { id: "mp3-to-wav", title: "MP3'ten WAV'a", icon: Music, color: "from-fuchsia-500 to-pink-500", desc: "MP3 sesini WAV formatına çevir", badge: "YENİ", group: "video-audio" },
    { id: "wav-to-mp3", title: "WAV'dan MP3'e", icon: Music, color: "from-purple-500 to-fuchsia-500", desc: "WAV sesini MP3 formatına çevir", badge: "YENİ", group: "video-audio" },
    { id: "m4a-to-mp3", title: "M4A'dan MP3'e", icon: Music, color: "from-violet-500 to-purple-500", desc: "M4A sesini MP3 formatına çevir", badge: "YENİ", group: "video-audio" },
    { id: "flac-to-mp3", title: "FLAC'tan MP3'e", icon: Music, color: "from-indigo-500 to-violet-500", desc: "FLAC sesini MP3 formatına çevir", badge: "YENİ", group: "video-audio" },
    { id: "ogg-to-mp3", title: "OGG'dan MP3'e", icon: Music, color: "from-pink-500 to-rose-500", desc: "OGG sesini MP3 formatına çevir", badge: "YENİ", group: "video-audio" },
    { id: "aac-to-mp3", title: "AAC'dan MP3'e", icon: Music, color: "from-rose-500 to-red-500", desc: "AAC sesini MP3 formatına çevir", badge: "YENİ", group: "video-audio" },
    { id: "mov-to-mp4", title: "MOV'dan MP4'e", icon: Film, color: "from-fuchsia-500 to-purple-500", desc: "MOV videoyu MP4'e çevir", badge: "YENİ", group: "video-audio" },
    { id: "avi-to-mp4", title: "AVI'den MP4'e", icon: Film, color: "from-violet-500 to-indigo-500", desc: "AVI videoyu MP4'e çevir", badge: "POPÜLER", group: "video-audio" },
    { id: "webm-to-mp4", title: "WebM'den MP4'e", icon: Film, color: "from-purple-500 to-pink-500", desc: "WebM videoyu MP4'e çevir", badge: "POPÜLER", group: "video-audio" },
    { id: "mkv-to-mp4", title: "MKV'dan MP4'e", icon: Film, color: "from-indigo-500 to-blue-500", desc: "MKV videoyu MP4'e çevir", badge: "POPÜLER", group: "video-audio" },

    // PDF STUDIO (PDF Araçları)
    { id: "pdf-compress", title: "PDF Sıkıştır", icon: FileSearch, color: "from-blue-500 to-cyan-500", desc: "Kaliteyi korurken PDF dosya boyutunu azaltın.", badge: "POPÜLER", group: "pdf" },
    { id: "pdf-merge", title: "PDF Birleştir", icon: Combine, color: "from-cyan-500 to-teal-500", desc: "Birden fazla PDF dosyasını tek bir belgede birleştirin.", badge: "POPÜLER", group: "pdf" },
    { id: "pdf-split", title: "PDF Ayır", icon: FileCode2, color: "from-teal-500 to-emerald-500", desc: "PDF'yi birden fazla dosyaya bölün.", group: "pdf" },
    { id: "pdf-to-word", title: "PDF'den Word'e", icon: FileText, color: "from-emerald-500 to-green-500", desc: "PDF dosyalarını düzenlenebilir Word belgelerine dönüştürün.", badge: "POPÜLER", group: "pdf" },
    { id: "pdf-to-image", title: "PDF'den Görüntüye", icon: Image, color: "from-indigo-500 to-violet-500", desc: "PDF sayfalarını yüksek kaliteli JPEG/PNG'ye çevirin.", group: "pdf" },
    { id: "image-to-pdf", title: "Görüntüden PDF'ye", icon: FileImage, color: "from-violet-500 to-purple-500", desc: "Resim dosyalarından anında PDF oluşturun.", group: "pdf" },
    { id: "pdf-rotate", title: "PDF Döndür", icon: RefreshCw, color: "from-purple-500 to-fuchsia-500", desc: "PDF sayfalarını 90°, 180° veya 270° döndürün.", badge: "YENİ", group: "pdf" },
    { id: "pdf-flatten", title: "PDF Düzleştir", icon: AlignLeft, color: "from-fuchsia-500 to-pink-500", desc: "PDF form alanlarını ve notları düzleştirir.", group: "pdf" },
    { id: "pdf-unlock", title: "PDF Kilidini Aç", icon: Unlock, color: "from-pink-500 to-rose-500", desc: "PDF'lerden şifre korumasını kaldırın.", group: "pdf" },
    { id: "pdf-to-text", title: "PDF'den Metne", icon: FileText, color: "from-rose-500 to-red-500", desc: "PDF içindeki yazıları metin formatında dökün.", group: "pdf" },
    { id: "pdf-add-page-numbers", title: "Sayfa Numaraları Ekle", icon: FileDigit, color: "from-red-500 to-orange-500", desc: "PDF'nize profesyonel sayfa numaraları ekleyin.", group: "pdf" },
    { id: "html-to-pdf", title: "HTML'den PDF'ye", icon: Code2, color: "from-orange-500 to-amber-500", desc: "Web sayfalarını ve HTML kodunu PDF yapın.", group: "pdf" },
    { id: "excel-to-pdf", title: "Excel'den PDF'ye", icon: TableProperties, color: "from-amber-500 to-yellow-500", desc: "Excel tablolarını bozulmadan PDF'ye dönüştürün.", group: "pdf" },
    { id: "pdf-to-excel", title: "PDF'den Excel'e", icon: Table, color: "from-yellow-500 to-lime-500", desc: "PDF'den yapılandırılmış Excel tabloları çıkarın.", badge: "POPÜLER", group: "pdf" },
    { id: "pdf-watermark", title: "PDF Filigranı", icon: Shield, color: "from-lime-500 to-green-500", desc: "Özel metin filigranları ile damgalayın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-redact", title: "PDF Kapat", icon: Eye, color: "from-stone-500 to-slate-600", desc: "Hassas bilgileri kalıcı olarak siyahbant ile karartın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-resize", title: "PDF Boyutlandır", icon: LayoutTemplate, color: "from-cyan-600 to-blue-600", desc: "A4, Letter, Legal gibi standart formatlara boyutlandırın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-sign", title: "PDF İmzala", icon: PenTool, color: "from-blue-600 to-indigo-600", desc: "Belgelerinize güvenli dijital imza ekleyin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-ocr", title: "PDF OCR", icon: SearchCode, color: "from-indigo-600 to-violet-600", desc: "AI tabanlı OCR kullanarak taranmış metni okuyun.", badge: "POPÜLER", group: "pdf" },
    { id: "pdf-crop", title: "PDF Kırp", icon: Image, color: "from-violet-600 to-purple-600", desc: "Sayfa boyutunu kırpıp gereksiz boşlukları atın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-extract-pages", title: "Sayfaları Çıkar", icon: FileCode, color: "from-purple-600 to-fuchsia-600", desc: "PDF içinden sadece belirli sayfaları ayırın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-delete-pages", title: "Sayfaları Sil", icon: Trash2, color: "from-fuchsia-600 to-pink-600", desc: "Gereksiz gördüğünüz PDF sayfalarını kalıcı olarak silin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-to-pdf-a", title: "PDF'den PDF/A'ya", icon: Archive, color: "from-slate-600 to-slate-800", desc: "Gelecekte veri kaybetmemek için arşiv standardı yapın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-repair", title: "PDF Onar", icon: Heart, color: "from-rose-600 to-red-600", desc: "Bozulmuş veya hasar görmüş PDF dosyalarını düzeltin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-compare", title: "PDF'leri Karşılaştır", icon: ArrowRightLeft, color: "from-sky-500 to-indigo-500", desc: "İki PDF dosyasını piksel düzeyinde farklılıkları için haritalayın.", badge: "YENİ", group: "pdf" },
    { id: "word-to-pdf", title: "Word'den PDF'ye", icon: FileText, color: "from-blue-400 to-cyan-500", desc: "Word dosyalarını orijinal haliyle PDF yapın.", group: "pdf" },
    { id: "ppt-to-pdf", title: "PPT'den PDF'ye", icon: Monitor, color: "from-orange-400 to-rose-400", desc: "PowerPoint sunum slaytlarınızı PDF olarak kaydedin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-edit-metadata", title: "Meta Verileri Düzenle", icon: TextCursorInput, color: "from-teal-400 to-emerald-400", desc: "Yazar, başlık ve oluşturma özelliklerini düzenleyin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-to-html", title: "PDF'den HTML'ye", icon: Code, color: "from-fuchsia-400 to-pink-400", desc: "PDF dosyalarını internet tarayıcısı HTML formatına çevirin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-to-ppt", title: "PDF'den PPT'ye", icon: LayoutTemplate, color: "from-violet-400 to-purple-400", desc: "PDF sayfalarını düzenlenebilir PPTX slaydı yapın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-fill-form", title: "PDF Formunu Doldur", icon: Keyboard, color: "from-emerald-400 to-green-400", desc: "Araç üzerinden direkt etkileşimli PDF formlarını girin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-grayscale", title: "Gri tonlamalı PDF", icon: Contrast, color: "from-zinc-500 to-zinc-700", desc: "PDF'leri tamamen siyah beyaz renge bürü.", badge: "YENİ", group: "pdf" },
    { id: "pdf-extract-images", title: "Görüntüleri Çıkar", icon: Image, color: "from-cyan-400 to-blue-400", desc: "PDF belgesine gömülü fotoğrafları klasörlük ayıkla.", badge: "YENİ", group: "pdf" },
    { id: "pdf-header-footer", title: "Başlık ve Altbilgi", icon: ArrowLeft, color: "from-slate-400 to-slate-600", desc: "Sayfa üst ve altına özel yazılar / tarihler basın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-bates", title: "Bates Numaralandırma", icon: Hash, color: "from-stone-600 to-stone-800", desc: "Avukatlar ve mahkemeler için Bates endeksi oluşturun.", badge: "YENİ", group: "pdf" },
    { id: "pdf-layout", title: "Sayfa Düzeni", icon: LayoutGrid, color: "from-indigo-400 to-violet-400", desc: "Birden fazla PDF sayfasını 2'li veya 4'lü yapraklara çevirin.", badge: "YENİ", group: "pdf" },
    { id: "pdf-to-markdown", title: "PDF'den Markdown'a", icon: FileDigit, color: "from-pink-400 to-rose-400", desc: "PDF verisini hiyerarşik yapılandırılmış MD koduna ayırın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-to-csv", title: "PDF'den CSV'ye", icon: TableProperties, color: "from-teal-500 to-emerald-500", desc: "PDF tablolarını güvenilir CSV dökümanı yapın.", badge: "YENİ", group: "pdf" },
    { id: "pdf-stamp", title: "PDF Mühürü", icon: Briefcase, color: "from-amber-600 to-orange-700", desc: "Onay, Denetim vb. hazır profesyonel damgalar basın.", badge: "YENİ", group: "pdf" },
    
    // IMAGE TOOLS (Görüntü Araçları)
    { id: "image-compressor", title: "Görüntü Sıkıştır", icon: Image, color: "from-blue-500 to-indigo-500", desc: "Fotoğraf ve grafikleri toplu olarak sıkıştırın", badge: "POPÜLER", group: "photo" },
    { id: "image-resizer", title: "Görüntü Boyutlandır", icon: Image, color: "from-indigo-500 to-purple-500", desc: "Herhangi bir platform için resimleri boyutlandır", badge: "POPÜLER", group: "photo" },
    { id: "image-converter", title: "Görüntü Dönüştür", icon: RefreshCw, color: "from-purple-500 to-pink-500", desc: "Görüntü dosyalarını toplu dönüştürün", badge: "POPÜLER", group: "photo" },
    { id: "image-cropper-2", title: "Görüntü Kırp", icon: Image, color: "from-pink-500 to-rose-500", desc: "Canlı çıktı önizlemesiyle fotoğrafları kesin", group: "photo" },
    { id: "image-watermark", title: "Görüntü Filigranı", icon: FileImage, color: "from-amber-500 to-orange-500", desc: "Metin veya logo filigranları uygulayın", badge: "YENİ", group: "photo" },
    
    // FORMAT CONVERTERS (HEIC vb.)
    { id: "heic-to-jpg", title: "HEIC'den JPG'ye", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "Apple HEIC fotoğraflarını JPG yap", badge: "YENİ", group: "photo" },
    { id: "heic-to-png", title: "HEIC'den PNG'ye", icon: RefreshCw, color: "from-emerald-500 to-cyan-500", desc: "Apple HEIC fotoğraflarını PNG yap", group: "photo" },
    { id: "heic-to-webp", title: "HEIC'den WebP'ye", icon: RefreshCw, color: "from-cyan-500 to-blue-500", desc: "Apple HEIC fotoğraflarını WebP yap", badge: "YENİ", group: "photo" },
    { id: "heic-to-gif", title: "HEIC'den GIF'e", icon: RefreshCw, color: "from-blue-500 to-indigo-500", desc: "Apple HEIC fotoğraflarını GIF'e çevir", badge: "YENİ", group: "photo" },
    { id: "heif-to-jpg", title: "HEIF'den JPG'ye", icon: RefreshCw, color: "from-indigo-500 to-violet-500", desc: "HEIF formatını JPG yap", badge: "YENİ", group: "photo" },
    { id: "png-to-jpg", title: "PNG'den JPG'ye", icon: RefreshCw, color: "from-violet-500 to-purple-500", desc: "PNG resimlerini JPG formatına çevir", badge: "POPÜLER", group: "photo" },
    { id: "jpg-to-png", title: "JPG'den PNG'ye", icon: RefreshCw, color: "from-purple-500 to-fuchsia-500", desc: "JPG resimlerini PNG formatına çevir", group: "photo" },
    { id: "webp-to-png", title: "WebP'den PNG'ye", icon: RefreshCw, color: "from-fuchsia-500 to-pink-500", desc: "WebP formatından PNG'ye çevir", group: "photo" },
    { id: "webp-to-jpg", title: "WebP'den JPG'ye", icon: RefreshCw, color: "from-pink-500 to-rose-500", desc: "WebP formatından JPG'ye çevir", group: "photo" },
    { id: "png-to-webp", title: "PNG'den WebP'ye", icon: RefreshCw, color: "from-gray-600 to-gray-800", desc: "PNG formatından WebP'ye çevir", group: "photo" },
    { id: "jpg-to-webp", title: "JPG'den WebP'ye", icon: RefreshCw, color: "from-gray-700 to-gray-900", desc: "JPG formatından WebP'ye çevir", group: "photo" },
    { id: "svg-to-png", title: "SVG'den PNG'ye", icon: RefreshCw, color: "from-orange-500 to-red-500", desc: "Vektörel SVG'leri PNG yap", group: "photo" },
    { id: "gif-to-png", title: "GIF'den PNG'ye", icon: RefreshCw, color: "from-red-500 to-rose-500", desc: "GIF karelerini PNG yap", group: "photo" },
    { id: "bmp-to-jpg", title: "BMP'den JPG'ye", icon: RefreshCw, color: "from-rose-500 to-pink-500", desc: "BMP resimleri JPG formatına çevir", group: "photo" },
    { id: "tiff-to-jpg", title: "TIFF'den JPG'ye", icon: RefreshCw, color: "from-pink-500 to-purple-500", desc: "TIFF belgelerini JPG yap", badge: "YENİ", group: "photo" },
    { id: "tiff-to-png", title: "TIFF'den PNG'ye", icon: RefreshCw, color: "from-purple-500 to-indigo-500", desc: "TIFF belgelerini PNG yap", badge: "YENİ", group: "photo" },
    { id: "jpg-to-bmp", title: "JPG'den BMP'ye", icon: RefreshCw, color: "from-indigo-500 to-cyan-500", desc: "JPG resimlerini BMP yap", badge: "YENİ", group: "photo" },
    { id: "png-to-bmp", title: "PNG'den BMP'ye", icon: RefreshCw, color: "from-cyan-500 to-teal-500", desc: "PNG resimlerini BMP yap", badge: "YENİ", group: "photo" },
    { id: "avif-to-jpg", title: "AVIF'den JPG'ye", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "AVIF formatını JPG yap", badge: "YENİ", group: "photo" },
    { id: "avif-to-png", title: "AVIF'den PNG'ye", icon: RefreshCw, color: "from-emerald-500 to-green-500", desc: "AVIF formatını PNG yap", badge: "YENİ", group: "photo" },
    { id: "ico-to-png", title: "ICO'dan PNG'ye", icon: RefreshCw, color: "from-yellow-400 to-orange-500", desc: "Windows ikonlarını PNG yap", badge: "YENİ", group: "photo" },
    { id: "gif-to-jpg", title: "GIF'ten JPG'ye", icon: RefreshCw, color: "from-orange-500 to-red-500", desc: "GIF animasyonlarını JPG yap", badge: "YENİ", group: "photo" },
    
    // PHOTO ADJUSTMENTS
    { id: "brightness-contrast", title: "Parlaklık & Kontrast", icon: Image, color: "from-yellow-300 to-orange-400", desc: "Görüntü parlaklığını ve kontrastını ayarlayın", badge: "POPÜLER", group: "photo" },
    { id: "hue-saturation", title: "Renk Tonu & Doygunluk", icon: Image, color: "from-fuchsia-500 to-pink-500", desc: "Profesyonel HSL renk ayarı", badge: "POPÜLER", group: "photo" },
    { id: "exposure", title: "Pozlama", icon: Image, color: "from-slate-200 to-slate-400", desc: "Görüntü pozlamasını ayarlayın ve düzeltin", badge: "YENİ", group: "photo" },
    { id: "color-balance", title: "Renk Dengesi", icon: Image, color: "from-blue-400 to-cyan-400", desc: "Profesyonel renk dengesi ayarı", badge: "YENİ", group: "photo" },
    { id: "levels", title: "Seviyeler", icon: Image, color: "from-gray-500 to-slate-600", desc: "Profesyonel histogram ve nokta-eğrisi ayarları", badge: "POPÜLER", group: "photo" },
    { id: "curves", title: "Eğriler", icon: Image, color: "from-violet-500 to-fuchsia-500", desc: "Renk uyumunu ve RGB ton eğrilerini yönetin", badge: "POPÜLER", group: "photo" },
    { id: "vibrance", title: "Canlılık", icon: Image, color: "from-orange-400 to-rose-400", desc: "Cilt tonlarını koruyarak renkleri artırın", badge: "YENİ", group: "photo" },
    { id: "white-balance", title: "Beyaz Dengesi", icon: Image, color: "from-zinc-100 to-zinc-300", desc: "Sıcaklığı ayarlayın ve ton kaymalarını nötralize edin", badge: "YENİ", group: "photo" },
    { id: "channel-mixer", title: "Kanal Karıştırıcı", icon: Image, color: "from-red-400 to-blue-400", desc: "Gelişmiş RGB kanalı değiştirme", badge: "YENİ", group: "photo" },
    { id: "selective-color", title: "Seçici Renk", icon: Image, color: "from-emerald-400 to-teal-500", desc: "Belirli renk aralıklarını hedefleyin", badge: "YENİ", group: "photo" },
    { id: "sharpen", title: "Keskinleştir", icon: Image, color: "from-sky-400 to-indigo-500", desc: "Unsharp mask ve yüksek geçişli keskinleştirme", badge: "YENİ", group: "photo" },
    { id: "vignette", title: "Vinyet Efekti", icon: Image, color: "from-slate-800 to-black", desc: "Sinematik karanlık veya beyaz kenarlar oluşturun", badge: "YENİ", group: "photo" },
    { id: "dust-noise", title: "Toz & Gürültü", icon: Image, color: "from-stone-400 to-stone-600", desc: "Film greni ekleyin veya dijital gürültüyü kaldırın", badge: "YENİ", group: "photo" },
    
    // FILTERS & EFFECTS
    { id: "duotone", title: "İki Ton Efekti", icon: Image, color: "from-fuchsia-600 to-rose-600", desc: "Spotify tarzı Duotone renk haritaları uygulayın", badge: "YENİ", group: "photo" },
    { id: "3d-lut", title: "3D LUT", icon: Image, color: "from-indigo-600 to-slate-800", desc: "Sinematik Look-Up Tabloları uygulayın", badge: "YENİ", group: "photo" },
    { id: "posterize", title: "Postere Dönüştür", icon: Image, color: "from-yellow-500 to-red-500", desc: "Sanatsal posterizasyon ve renk bantlama", badge: "YENİ", group: "photo" },
    { id: "threshold", title: "Eşik", icon: Image, color: "from-black to-white", desc: "Yüksek kontrastlı siyah beyaz dönüştürme", badge: "YENİ", group: "photo" },
    { id: "invert-colors", title: "Renkleri Ters Çevir", icon: Image, color: "from-violet-600 to-lime-500", desc: "Anında renkleri tersine ve negatife çevirin", badge: "YENİ", group: "photo" },
    { id: "sepia-vintage", title: "Sepya & Vintage", icon: Image, color: "from-amber-700 to-yellow-900", desc: "Otantik sepya ve eski film efektleri", badge: "YENİ", group: "photo" },
    { id: "shadow-highlight", title: "Gölge & Vurgu", icon: Image, color: "from-slate-300 to-slate-600", desc: "Dinamik aralığı dengeleyin", badge: "YENİ", group: "photo" },
    { id: "clarity-texture", title: "Açıklık & Doku", icon: Image, color: "from-teal-600 to-emerald-700", desc: "Orta ton kontrastını ve dokuyu artırın", badge: "YENİ", group: "photo" },
    { id: "dehaze", title: "Bulanıklığı Gider", icon: Image, color: "from-cyan-300 to-blue-500", desc: "Sisi, buharı ve dumanı kaldırın", badge: "YENİ", group: "photo" },
    { id: "color-grading", title: "Renk Derecelendirme", icon: Image, color: "from-violet-800 to-fuchsia-800", desc: "Profesyonel sinematik renk derecelendirme", badge: "YENİ", group: "photo" },
    { id: "chromatic-aberration", title: "Kromatik Aberasyon", icon: Image, color: "from-red-500 to-cyan-500", desc: "Renk sızıntılarını ve bozulmaları düzeltin", badge: "YENİ", group: "photo" },
    
    // TRANSFORMS & FUN
    { id: "rotate-flip", title: "Döndür & Çevir", icon: Image, color: "from-blue-400 to-indigo-500", desc: "Fotoğraf yönünü anında düzeltin", badge: "YENİ", group: "photo" },
    { id: "perspective", title: "Perspektif", icon: Image, color: "from-stone-500 to-stone-700", desc: "Eğik ufuk ve keystone düzeltmesi", badge: "YENİ", group: "photo" },
    { id: "tilt-shift", title: "Eğik Kaydırma", icon: Image, color: "from-lime-500 to-green-600", desc: "Minyatürşehir bulanıklık efekti oluşturun", badge: "YENİ", group: "photo" },
    { id: "mirror-effect", title: "Ayna", icon: Image, color: "from-cyan-400 to-sky-500", desc: "Kaleidoskop ve yansıma efektleri", badge: "YENİ", group: "photo" },
    { id: "distortion", title: "Bozulma", icon: Image, color: "from-purple-400 to-pink-500", desc: "Fisheye, swirl ve pinch efektleri", badge: "YENİ", group: "photo" },
    { id: "photo-filters", title: "Fotoğraf Filtreleri", icon: Image, color: "from-rose-400 to-orange-400", desc: "Hazır renk filtreleri uygulayın", badge: "YENİ", group: "photo" },
    { id: "text-overlay", title: "Metin Üst Katmanı", icon: Type, color: "from-indigo-400 to-blue-500", desc: "Fotoğraflara gösterişli tipografi ekleyin", badge: "YENİ", group: "photo" },
    { id: "border-frame", title: "Kenar & Çerçeve", icon: Image, color: "from-amber-600 to-orange-700", desc: "Fotoğraflara premium sınırlar ekleyin", badge: "YENİ", group: "photo" },
    { id: "collage-maker", title: "Kolaj Oluşturucu", icon: LayoutTemplate, color: "from-fuchsia-500 to-violet-500", desc: "Şık fotoğraf kolajları oluşturun", badge: "YENİ", group: "photo" },
    { id: "meme-generator", title: "Meme Oluşturucu", icon: Image, color: "from-yellow-400 to-red-400", desc: "Hızlıca memeler hazırlayın", badge: "YENİ", group: "photo" },
    { id: "batch-edit", title: "Toplu Düzenleme", icon: Library, color: "from-slate-600 to-slate-800", desc: "Görselleri toplu yeniden boyutlandır ve filtrele", badge: "POPÜLER", group: "photo" },
    { id: "replace-color", title: "Renk Değiştir", icon: Image, color: "from-teal-400 to-emerald-500", desc: "Resimdeki belirli renkleri değiştirin", badge: "YENİ", group: "photo" },
    
    // UTILITIES
    { id: "histogram", title: "Histogram", icon: PieChart, color: "from-blue-600 to-indigo-700", desc: "Görüntü pozlama ve renk analizörü", badge: "YENİ", group: "photo" },
    { id: "exif-editor", title: "EXIF Düzenleyici", icon: FileText, color: "from-gray-500 to-slate-700", desc: "Görüntü meta verilerini düzenleyin ve çıkarın", badge: "YENİ", group: "photo" },
    { id: "social-media-resizer", title: "Sosyal Medya Yeniden Boyutlandır", icon: Image, color: "from-pink-500 to-purple-600", desc: "Instagram, YouTube ve TikTok için kırp", badge: "POPÜLER", group: "photo" },
    { id: "sketch-effect", title: "Eskiz Efekti", icon: Image, color: "from-stone-300 to-stone-500", desc: "Görüntüyü kurşun kalem eskizine çevir", badge: "YENİ", group: "photo" },
    { id: "gradient-map", title: "Gradyan Haritası", icon: Image, color: "from-cyan-500 to-fuchsia-500", desc: "Karmaşık renk derecelendirme haritaları", badge: "YENİ", group: "photo" },
    { id: "split-toning", title: "Bölünmüş Tonlama", icon: Image, color: "from-amber-400 to-indigo-400", desc: "Gölge ve vurgu tonlaması ayrımı", badge: "YENİ", group: "photo" },
    { id: "liquify", title: "Sıvılaştır", icon: Image, color: "from-emerald-400 to-cyan-500", desc: "Photoshop tarzı etkileşimli sıvılaştırma", badge: "YENİ", group: "photo" },
    { id: "photo-mosaic", title: "Fotoğraf Mozaik", icon: LayoutTemplate, color: "from-purple-500 to-pink-500", desc: "Binlerce resimden foto mozaik oluştur", badge: "YENİ", group: "photo" },
    { id: "overlay-blend", title: "Üst Katman & Karıştır", icon: Image, color: "from-rose-400 to-red-500", desc: "16 farklı karışım modu dokusu", badge: "YENİ", group: "photo" },
    { id: "compare-images", title: "Görüntüleri Karşılaştır", icon: ArrowRightLeft, color: "from-slate-400 to-slate-600", desc: "İki görüntüyü yan yana detaylı karşılaştır", badge: "YENİ", group: "photo" },
    { id: "color-picker", title: "Renk Seçici", icon: MousePointer2, color: "from-blue-400 to-teal-400", desc: "Resimden damlalık ile renk seç", badge: "YENİ", group: "photo" },
    { id: "color-palette", title: "Renk Paleti", icon: Image, color: "from-fuchsia-400 to-purple-500", desc: "Resimlerden en iyi renk paletini çıkar", badge: "POPÜLER", group: "photo" },
    { id: "screenshot-beautifier", title: "Ekran Görüntüsü Güzelleştirici", icon: MonitorPlay, color: "from-indigo-400 to-sky-400", desc: "Ekran görüntülerini gölge be arkaplan ile süsle", badge: "POPÜLER", group: "photo" },
    
    // TEXT TOOLS (Metin Araçları)
    { id: "word-counter", title: "Kelime Sayacı", icon: Type, color: "from-blue-500 to-cyan-500", desc: "Kelime, harf ve paragraf sayacı", badge: "POPÜLER", group: "text-tools" },
    { id: "case-converter", title: "Büyük/Küçük Harf Dönüştürücü", icon: Type, color: "from-indigo-500 to-purple-500", desc: "Metin boyutunu ve formatını değiştirin", group: "text-tools" },
    { id: "lorem-ipsum", title: "Lorem İpsum", icon: FileText, color: "from-slate-500 to-slate-700", desc: "Rastgele yer tutucu metin oluşturun", group: "text-tools" },
    { id: "text-diff", title: "Metin Farkı", icon: ArrowRightLeft, color: "from-orange-500 to-red-500", desc: "İki metin arasındaki farkları bulun", badge: "YENİ", group: "text-tools" },
    { id: "fancy-text", title: "Şık Metin", icon: Type, color: "from-pink-500 to-rose-500", desc: "Sosyal medya için şekilli metin yazma", badge: "POPÜLER", group: "text-tools" },
    { id: "text-cleaner", title: "Metin Temizleyici", icon: RefreshCw, color: "from-teal-500 to-emerald-500", desc: "Hatalı boşlukları ve fazlalıkları sil", badge: "YENİ", group: "text-tools" },
    { id: "invisible-text", title: "Görünmez Metin", icon: Type, color: "from-slate-300 to-slate-400", desc: "Kopyalanabilir boş karakter oluştur", badge: "YENİ", group: "text-tools" },
    { id: "slug-generator", title: "Slug Üretici", icon: FileText, color: "from-cyan-500 to-blue-500", desc: "URL dostu metin dönüştürücü", badge: "YENİ", group: "text-tools" },
    { id: "binary-converter", title: "İkili Dönüştürücü", icon: Code, color: "from-green-500 to-emerald-600", desc: "Metni bilgisayar ikili sistemine çevir", badge: "YENİ", group: "text-tools" },
    { id: "reverse-text", title: "Metni Ters Çevir", icon: ArrowRightLeft, color: "from-purple-500 to-indigo-500", desc: "Metninizi sağdan sola ters çevirin", badge: "YENİ", group: "text-tools" },
    { id: "remove-duplicates", title: "Yinelenenleri Kaldır", icon: Trash2, color: "from-red-400 to-rose-500", desc: "Aynı satır ve kelimeleri silin", badge: "YENİ", group: "text-tools" },
    { id: "text-repeater", title: "Metin Tekrarlayıcı", icon: RefreshCw, color: "from-yellow-400 to-orange-500", desc: "Metni binlerce kez otomatik yazdırın", badge: "YENİ", group: "text-tools" },
    { id: "zalgo-text", title: "Zalgo Metni", icon: Type, color: "from-zinc-700 to-black", desc: "Lanetli ve korkutucu metin efekti", badge: "YENİ", group: "text-tools" },
    { id: "text-to-speech", title: "Metinden Sese", icon: Mic, color: "from-fuchsia-600 to-purple-600", desc: "Yazıları tarayıcıda sesli okutun", badge: "POPÜLER", group: "text-tools" },

    // BUSINESS TOOLS (İş & Finans Araçları)
    { id: "biz-compound", title: "Bileşik Faiz", icon: CalculatorIcon, color: "from-emerald-500 to-teal-500", desc: "Yatırımlarınızın bileşik getirisini hesaplayın", badge: "POPÜLER", group: "business" },
    { id: "biz-loan", title: "Kredi Hesaplayıcı", icon: Briefcase, color: "from-blue-500 to-indigo-500", desc: "Aylık kredi ödemeleri ve faiz cetveli", badge: "POPÜLER", group: "business" },
    { id: "biz-tip", title: "Bahşiş Hesaplayıcı", icon: Coffee, color: "from-orange-400 to-amber-500", desc: "Restoran hesaplarını ve bahşişleri kolayca bölün", badge: "YENİ", group: "business" },
    { id: "biz-percentage", title: "Yüzde Hesaplama", icon: PieChart, color: "from-rose-400 to-red-500", desc: "Hızlı orantı ve basit yüzde problemleri", badge: "POPÜLER", group: "business" },
    { id: "biz-discount", title: "İndirim Hesaplama", icon: Tags, color: "from-pink-500 to-rose-500", desc: "İndirim oranları ve net tutarı hesaplayın", badge: "YENİ", group: "business" },
    { id: "biz-margin", title: "Kar Marjı", icon: TrendingUp, color: "from-lime-500 to-green-600", desc: "Ürün maliyeti üzerinden satış kârını analiz edin", badge: "YENİ", group: "business" },
    { id: "biz-roi", title: "ROI Hesaplayıcı", icon: LineChart, color: "from-cyan-500 to-blue-600", desc: "Yatırım Getirisi (Return on Investment) oranı", badge: "YENİ", group: "business" },
    { id: "biz-salary", title: "Maaş Hesaplayıcı", icon: Wallet, color: "from-violet-500 to-purple-600", desc: "Brüt, net maaş ve saatlik kazanç dökümü", badge: "YENİ", group: "business" },
    { id: "biz-savings", title: "Tasarruf Hedefi", icon: PiggyBank, color: "from-fuchsia-400 to-pink-500", desc: "Güvenli gelecek için tasarruf planlayıcısı", badge: "YENİ", group: "business" },
    { id: "biz-inflation", title: "Enflasyon", icon: TrendingDown, color: "from-red-500 to-rose-600", desc: "Yıllara göre paranın alım gücü kaybı", badge: "YENİ", group: "business" },
    { id: "biz-mortgage", title: "İpotek Hesaplama", icon: Home, color: "from-teal-500 to-emerald-600", desc: "Ev kredileri ve ipotek maliyeti çıkarın", badge: "POPÜLER", group: "business" },
    { id: "biz-currency", title: "Para Birimi", icon: Coins, color: "from-amber-400 to-yellow-500", desc: "Döviz kurları arası anında fiyat dönüştürücü", badge: "POPÜLER", group: "business" },
    { id: "biz-paycheck", title: "Maaş Çeki", icon: Receipt, color: "from-sky-400 to-blue-500", desc: "Kesinti ve vergi sonrası maaş çeki hesapla", badge: "POPÜLER", group: "business" },
    { id: "biz-emi", title: "EMI Hesaplayıcı", icon: CreditCard, color: "from-indigo-400 to-violet-500", desc: "Eşit Aylık Taksit (Equated Monthly Installment)", badge: "POPÜLER", group: "business" },
    { id: "biz-sip", title: "SIP Hesaplayıcı", icon: BarChart3, color: "from-purple-500 to-fuchsia-600", desc: "Sistematik Yatırım Planı servet tahmini", badge: "POPÜLER", group: "business" },
    { id: "biz-debt", title: "Borç Ödeme", icon: Landmark, color: "from-rose-500 to-red-600", desc: "Borç sıfırlama stratejileri ve zaman çizelgesi", badge: "YENİ", group: "business" },
    { id: "biz-budget", title: "Bütçe", icon: CalculatorIcon, color: "from-green-400 to-emerald-500", desc: "Kişisel finans ve aylık gider bütçeleme", badge: "YENİ", group: "business" },
    { id: "biz-networth", title: "Net Değer", icon: Scale, color: "from-blue-400 to-cyan-500", desc: "Tüm varlıklar - yükümlülükler net servet analizi", badge: "YENİ", group: "business" },
    { id: "biz-retirement", title: "Emeklilik", icon: Compass, color: "from-yellow-500 to-orange-500", desc: "Erken emeklilik ve birikim fonu hesaplaması", badge: "POPÜLER", group: "business" },
    { id: "biz-investment", title: "Yatırım Hedefi", icon: Target, color: "from-teal-400 to-cyan-500", desc: "Finansal bağımsızlık için gereken yatırım hedefleri", badge: "YENİ", group: "business" },
    { id: "biz-vat", title: "KDV Hesaplayıcı", icon: Percent, color: "from-sky-500 to-indigo-500", desc: "Dahil veya hariç Katma Değer Vergisi matrahı", badge: "POPÜLER", group: "business" },
    { id: "biz-creditcard", title: "Kredi Kartı Ödemesi", icon: CreditCard, color: "from-violet-400 to-purple-500", desc: "Kredi kartı borcunu faizden kurtulmak için ne zaman ödemelisin?", badge: "YENİ", group: "business" },
    { id: "biz-auto", title: "Otomobil Kredisi", icon: Car, color: "from-rose-400 to-pink-500", desc: "Taşıt kredisi taksitleri ve geri ödemesi", badge: "POPÜLER", group: "business" },
    { id: "biz-crypto", title: "Kripto Kar", icon: Bitcoin, color: "from-amber-400 to-yellow-600", desc: "Kripto para trade işlemlerinizde Kar/Zarar hesabı", badge: "POPÜLER", group: "business" },
    { id: "biz-breakeven", title: "Başabaş", icon: ArrowRightLeft, color: "from-emerald-400 to-teal-500", desc: "Bir girişimin zarardan kara geçme noktasını bulun", badge: "YENİ", group: "business" },
    { id: "biz-cpm", title: "CPM Hesaplayıcı", icon: Megaphone, color: "from-cyan-500 to-blue-500", desc: "Bin Gösterim Başına Maliyet (Cost Per Mille)", badge: "YENİ", group: "business" },
    { id: "biz-cagr", title: "CAGR Hesaplayıcı", icon: TrendingUp, color: "from-purple-500 to-pink-500", desc: "Bileşik Yıllık Büyüme Oranı performans metriği", badge: "POPÜLER", group: "business" },
    { id: "biz-tvm", title: "TVM Hesaplayıcı", icon: Clock, color: "from-orange-400 to-red-400", desc: "Paranın Zaman Değeri (Time Value of Money)", badge: "YENİ", group: "business" },
    { id: "biz-rentvsbuy", title: "Kiralama vs Satın Alma", icon: Home, color: "from-indigo-400 to-blue-500", desc: "Emlak kiralamanın mı satın almanın mı karlı olduğu", badge: "YENİ", group: "business" },

    // DEV TOOLS (Geliştirici Araçları)
    { id: "json-formatter", title: "JSON Biçimlendirici", icon: Code2, color: "from-emerald-500 to-teal-500", desc: "JSON kodunu temizleyin ve formatlayın", badge: "POPÜLER", group: "dev-tools" },
    { id: "json-graph", title: "JSON Grafiği", icon: Network, color: "from-teal-500 to-cyan-500", desc: "JSON verisini ağaç yapısında görselleştirin", badge: "POPÜLER", group: "dev-tools" },
    { id: "base64", title: "Base64", icon: FileCode2, color: "from-cyan-500 to-blue-500", desc: "Base64 formatında kodlayın veya çözün", badge: "POPÜLER", group: "dev-tools" },
    { id: "hash-generator", title: "Hash Üretici", icon: KeyRound, color: "from-blue-500 to-indigo-500", desc: "MD5, SHA-256 ve SHA-512 şifreleme", badge: "POPÜLER", group: "dev-tools" },
    { id: "uuid-generator", title: "UUID Üretici", icon: Fingerprint, color: "from-indigo-500 to-violet-500", desc: "Rastgele güvenli V4 kimlikleri oluşturun", badge: "POPÜLER", group: "dev-tools" },
    { id: "regex-tester", title: "Regex Test Aracı", icon: TextCursorInput, color: "from-violet-500 to-purple-500", desc: "Düzenli ifadeleri test edin ve hata ayıklayın", badge: "POPÜLER", group: "dev-tools" },
    { id: "markdown-editor", title: "Markdown Editörü", icon: FileDigit, color: "from-purple-500 to-fuchsia-500", desc: "Canlı önizlemeli MD kod oluşturucu", badge: "YENİ", group: "dev-tools" },
    { id: "code-formatter", title: "Kod Biçimlendirici", icon: AlignLeft, color: "from-fuchsia-500 to-pink-500", desc: "HTML, CSS ve JavaScript kodlarını düzenleyin", badge: "POPÜLER", group: "dev-tools" },
    { id: "json-to-csv", title: "JSON'dan CSV'ye", icon: TableProperties, color: "from-pink-500 to-rose-500", desc: "JSON dizilerini Excel formatına çevirin", badge: "POPÜLER", group: "dev-tools" },
    { id: "meta-tag-generator", title: "Meta Etiket Üretici", icon: Tags, color: "from-rose-500 to-red-500", desc: "SEO için head tagleri ve meta veriler", badge: "YENİ", group: "dev-tools" },
    { id: "og-preview", title: "OG Önizleme", icon: MonitorSmartphone, color: "from-red-500 to-orange-500", desc: "Open Graph sosyal medya kartlarını test edin", badge: "POPÜLER", group: "dev-tools" },
    { id: "cron-expression", title: "CRON İfadesi", icon: Clock4, color: "from-orange-500 to-amber-500", desc: "Zamanlanmış görev sözdizimi üretin", badge: "POPÜLER", group: "dev-tools" },
    { id: "color-contrast", title: "Renk Kontrastı", icon: Contrast, color: "from-amber-500 to-yellow-500", desc: "Erişilebilirlik oranı ve HEX testi", badge: "POPÜLER", group: "dev-tools" },
    { id: "json-schema", title: "JSON Şeması", icon: Braces, color: "from-yellow-500 to-lime-500", desc: "Veri modelinizden ts/json şeması çıkarın", badge: "POPÜLER", group: "dev-tools" },
    { id: "jwt-decoder", title: "JWT Çözücü", icon: Unlock, color: "from-lime-500 to-green-500", desc: "JSON Web Token (JWT) içeriğini anında görün", badge: "POPÜLER", group: "dev-tools" },
    { id: "html-entities", title: "HTML Varlığı", icon: Code, color: "from-green-500 to-emerald-500", desc: "Karakterleri güvenli HTML entity'sine çevir", badge: "POPÜLER", group: "dev-tools" },
    { id: "url-encoder", title: "URL Kodlayıcı", icon: Link, color: "from-emerald-600 to-teal-600", desc: "Bağlantıları kodlayın (URI encoding)", badge: "POPÜLER", group: "dev-tools" }
];

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
                                        { id: "word", title: "Templates & Scenes", subtitle: "Start instantly with over 50 ready-made professional templates.", icon: LayoutTemplate, bg: "from-blue-400 to-indigo-600", borderHover: "hover:border-blue-500/50", glow: "group-hover:shadow-blue-500/20" },
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
                                            Start with Templates
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
