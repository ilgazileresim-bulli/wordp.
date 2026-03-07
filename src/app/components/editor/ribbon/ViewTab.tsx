"use client";

import React, { memo, useState } from "react";
import { BookOpen, FileText, Globe, List, Maximize, Volume2, MoveVertical, Columns, Search, CheckCircle2, File as FileIcon, Files, Maximize2, PlusSquare, Layout, Split, Settings, Moon, ListOrdered, Map, BookOpenCheck, Timer, Printer, PanelLeft, ArrowUpDown, RotateCcw, SwitchCamera, GripHorizontal, Compass, Focus } from "lucide-react";
import { cn } from "../utils";

interface ViewTabProps {
    viewMode: 'print' | 'read' | 'web';
    setViewMode: (mode: 'print' | 'read' | 'web') => void;
    setIsFocusMode: (focus: boolean) => void;
    showRuler: boolean;
    setShowRuler: (show: boolean) => void;
    showGridlines: boolean;
    setShowGridlines: (show: boolean) => void;
    showNavPane: boolean;
    setShowNavPane: (show: boolean) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    isSplit: boolean;
    setIsSplit: (split: boolean) => void;
}

const ViewTab = ({
    viewMode,
    setViewMode,
    setIsFocusMode,
    showRuler,
    setShowRuler,
    showGridlines,
    setShowGridlines,
    showNavPane,
    setShowNavPane,
    zoom,
    setZoom,
    isSplit,
    setIsSplit
}: ViewTabProps) => {
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const [showMacroMenu, setShowMacroMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(false);

    const enterFullScreenReader = () => {
        const el = document.querySelector('.ProseMirror')?.closest('[class*="bg-"]') as HTMLElement;
        if (el) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                el.requestFullscreen().catch(() => {
                    // Fallback: maximize the view
                    setIsFocusMode(true);
                });
            }
        } else {
            setIsFocusMode(true);
        }
    };

    const showOutline = () => {
        // Toggle nav pane and switch to outline/heading mode
        setShowNavPane(true);
    };

    const showDraft = () => {
        // Simplified view mode
        setViewMode('web');
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (el) {
            el.style.maxWidth = '100%';
            el.style.padding = '20px';
        }
    };

    const showDocProperties = () => {
        const el = document.querySelector('.ProseMirror');
        if (!el) return;
        const text = el.textContent || '';
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        const paragraphs = el.querySelectorAll('p, h1, h2, h3, h4, h5, h6').length;

        const propDiv = document.createElement('div');
        propDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border:1px solid #ddd;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.2);padding:24px 32px;z-index:10000;min-width:300px;font-family:system-ui;';
        propDiv.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;font-size:16px;color:#1e293b;font-weight:700;">📄 Belge Özellikleri</h3>
                <button id="close-props" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999;">✕</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                <div style="color:#64748b;">Sözcük Sayısı:</div><div style="font-weight:700;color:#1e293b;">${words.toLocaleString('tr-TR')}</div>
                <div style="color:#64748b;">Karakter Sayısı:</div><div style="font-weight:700;color:#1e293b;">${chars.toLocaleString('tr-TR')}</div>
                <div style="color:#64748b;">Paragraf Sayısı:</div><div style="font-weight:700;color:#1e293b;">${paragraphs}</div>
                <div style="color:#64748b;">Tahmini Okuma:</div><div style="font-weight:700;color:#1e293b;">${Math.max(1, Math.ceil(words / 200))} dk</div>
                <div style="color:#64748b;">Oluşturulma:</div><div style="font-weight:700;color:#1e293b;">${new Date().toLocaleDateString('tr-TR')}</div>
            </div>
        `;
        document.body.appendChild(propDiv);
        propDiv.querySelector('#close-props')?.addEventListener('click', () => propDiv.remove());
        // Also close on backdrop click
        const backdrop = document.createElement('div');
        backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9999;';
        backdrop.onclick = () => { propDiv.remove(); backdrop.remove(); };
        document.body.appendChild(backdrop);
    };

    const runMacro = (type: string) => {
        const el = document.querySelector('.ProseMirror') as HTMLElement;
        if (!el) return;
        setShowMacroMenu(false);

        if (type === 'removeEmptyLines') {
            // Remove empty paragraphs
            const emptyPs = el.querySelectorAll('p:empty');
            emptyPs.forEach(p => p.remove());
        } else if (type === 'trimSpaces') {
            // Trim multiple spaces
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                if (node.textContent) {
                    node.textContent = node.textContent.replace(/  +/g, ' ');
                }
            }
        } else if (type === 'uppercase') {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                if (node.textContent) {
                    node.textContent = node.textContent.toUpperCase();
                }
            }
        }
    };

    const toggleDarkMode = () => {
        const editor = document.querySelector('.ProseMirror') as HTMLElement;
        const wrapper = editor?.closest('[class*="bg-"]') as HTMLElement;
        if (editor) {
            if (!isDarkMode) {
                editor.style.backgroundColor = '#1e1e1e';
                editor.style.color = '#d4d4d4';
                if (wrapper) wrapper.style.backgroundColor = '#2d2d2d';
            } else {
                editor.style.backgroundColor = '';
                editor.style.color = '';
                if (wrapper) wrapper.style.backgroundColor = '';
            }
            setIsDarkMode(!isDarkMode);
        }
    };

    const toggleLineNumbers = () => {
        const editor = document.querySelector('.ProseMirror') as HTMLElement;
        if (editor) {
            if (!showLineNumbers) {
                editor.style.counterReset = 'line-number';
                const style = document.createElement('style');
                style.id = 'line-number-style';
                style.textContent = `.ProseMirror > * { counter-increment: line-number; position: relative; padding-left: 40px !important; } .ProseMirror > *::before { content: counter(line-number); position: absolute; left: 4px; color: #999; font-size: 10px; font-family: monospace; }`;
                document.head.appendChild(style);
            } else {
                editor.style.counterReset = '';
                document.getElementById('line-number-style')?.remove();
            }
            setShowLineNumbers(!showLineNumbers);
        }
    };

    const toggleMiniMap = () => {
        if (showMiniMap) {
            document.getElementById('minimap-container')?.remove();
            setShowMiniMap(false);
            return;
        }
        const editor = document.querySelector('.ProseMirror') as HTMLElement;
        if (!editor) return;

        const minimap = document.createElement('div');
        minimap.id = 'minimap-container';
        minimap.style.cssText = 'position:fixed;right:16px;top:180px;width:120px;max-height:300px;overflow:hidden;border:1px solid #ddd;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:100;background:#fff;pointer-events:none;';
        const clone = editor.cloneNode(true) as HTMLElement;
        clone.style.cssText = 'transform:scale(0.12);transform-origin:top left;width:833%;pointer-events:none;';
        minimap.appendChild(clone);
        document.body.appendChild(minimap);
        setShowMiniMap(true);
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Görünümler Group */}
            <div className="flex flex-col items-center h-full min-w-[300px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <div onClick={() => setViewMode('read')} className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer group w-16 transition-all", viewMode === 'read' ? "btn-active" : "hover:bg-white/60")}>
                        <BookOpen size={22} className={cn(viewMode === 'read' ? "text-[#2b579a]" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Okuma Modu</span>
                    </div>
                    <div onClick={() => setViewMode('print')} className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer group w-16 transition-all", viewMode === 'print' ? "btn-active" : "hover:bg-white/60")}>
                        <FileText size={22} className={cn(viewMode === 'print' ? "text-[#2b579a]" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Yazdırma Düzeni</span>
                    </div>
                    <div onClick={() => setViewMode('web')} className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer group w-16 transition-all", viewMode === 'web' ? "btn-active" : "hover:bg-white/60")}>
                        <Globe size={22} className={cn(viewMode === 'web' ? "text-[#2b579a]" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Web Düzeni</span>
                    </div>
                    <div className="flex flex-col justify-center gap-1 ml-1 border-l border-zinc-200 pl-2">
                        <button onClick={showOutline} className="flex items-center gap-2 px-1 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700">
                            <List size={14} className="text-zinc-400" /> Ana Hat
                        </button>
                        <button onClick={showDraft} className="flex items-center gap-2 px-1 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700">
                            <FileText size={14} className="text-zinc-400" /> Taslak
                        </button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Görünümler</span>
            </div>

            {/* Tam Ekran Group */}
            <div className="flex flex-col items-center h-full min-w-[140px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <div onClick={() => setIsFocusMode(true)} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14">
                        <Maximize size={20} className="text-purple-600" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">Odak</span>
                    </div>
                    <div onClick={enterFullScreenReader} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16">
                        <Volume2 size={20} className="text-blue-500" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Tam Ekran</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Tam Ekran</span>
            </div>

            {/* Sayfa Hareketleri Group */}
            <div className="flex flex-col items-center h-full min-w-[140px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <div onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) { el.style.columnCount = '1'; el.style.columnGap = ''; }
                    }} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14 transition-all">
                        <MoveVertical size={20} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">Dikey</span>
                    </div>
                    <div onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) { el.style.columnCount = '2'; el.style.columnGap = '2em'; }
                    }} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14">
                        <Columns size={20} className="text-zinc-500" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center">Kitap Sayfası</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Sayfa Hareketleri</span>
            </div>

            {/* Göster Group */}
            <div className="flex flex-col items-center h-full min-w-[140px] border-r border-[#dadada] px-4">
                <div className="flex-1 flex flex-col justify-center gap-1 w-full">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div onClick={() => setShowRuler(!showRuler)} className={cn("w-3 h-3 border border-zinc-400 rounded-sm flex items-center justify-center", showRuler && "bg-[#2b579a] border-[#2b579a]")}>
                            {showRuler && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-[9px] font-bold text-zinc-700">Cetvel</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div onClick={() => setShowGridlines(!showGridlines)} className={cn("w-3 h-3 border border-zinc-400 rounded-sm flex items-center justify-center", showGridlines && "bg-[#2b579a] border-[#2b579a]")}>
                            {showGridlines && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-[9px] font-bold text-zinc-700">Kılavuz Çizgileri</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div onClick={() => setShowNavPane(!showNavPane)} className={cn("w-3 h-3 border border-zinc-400 rounded-sm flex items-center justify-center", showNavPane && "bg-[#2b579a] border-[#2b579a]")}>
                            {showNavPane && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-[9px] font-bold text-zinc-700">Gezinti Bölmesi</span>
                    </label>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Göster</span>
            </div>

            {/* Yakınlaştır Group */}
            <div className="flex flex-col items-center h-full min-w-[260px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <div className="relative">
                        <div onClick={() => setShowZoomMenu(!showZoomMenu)} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-18">
                            <Search size={22} className="text-zinc-500" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">%{zoom}</span>
                        </div>
                        {showZoomMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[100px] py-1">
                                {[50, 75, 100, 125, 150, 200].map(z => (
                                    <button key={z}
                                        className={cn("w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-blue-50",
                                            zoom === z ? "text-[#2b579a] bg-blue-50" : "text-zinc-700")}
                                        onClick={() => { setZoom(z); setShowZoomMenu(false); }}>
                                        %{z}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div onClick={() => setZoom(100)} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14">
                        <CheckCircle2 size={22} className="text-[#2b579a]" strokeWidth={2.5} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">%100</span>
                    </div>
                    <div className="flex flex-col justify-center gap-1 border-l border-zinc-200 pl-3 ml-1">
                        <button onClick={() => setZoom(100)} className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><FileIcon size={14} className="text-zinc-400" /> Bir Sayfa</button>
                        <button onClick={() => setZoom(75)} className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><Files size={14} className="text-zinc-400" /> Birden Çok Sayfa</button>
                        <button onClick={() => setZoom(150)} className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/60 rounded text-[9px] font-bold text-zinc-700"><Maximize2 size={14} className="text-zinc-400" /> Sayfa Genişliği</button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Yakınlaştır</span>
            </div>

            {/* Pencere Group */}
            <div className="flex flex-col items-center h-full min-w-[180px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <div onClick={() => window.open(window.location.href, '_blank')} className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16">
                        <PlusSquare size={22} className="text-blue-500" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Yeni Pencere</span>
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                        <button onClick={() => {
                            // Tile all windows - maximize current
                            if (document.fullscreenElement) document.exitFullscreen();
                            window.resizeTo(screen.availWidth / 2, screen.availHeight);
                            window.moveTo(0, 0);
                        }} className="text-[9px] font-bold text-zinc-700 hover:bg-white/60 px-2 py-0.5 rounded text-left flex items-center gap-2"><Layout size={13} className="text-zinc-400" /> Tümünü Yerleştir</button>
                        <button onClick={() => setIsSplit(!isSplit)} className={cn("text-[9px] font-bold px-2 py-0.5 rounded text-left flex items-center gap-2 transition-all", isSplit ? "btn-active text-[#2b579a]" : "text-zinc-700 hover:bg-white/60")}>
                            <Split size={13} className={isSplit ? "text-[#2b579a]" : "text-zinc-400"} /> Böl
                        </button>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Pencere</span>
            </div>

            {/* Makrolar Group */}
            <div className="flex flex-col items-center h-full min-w-[80px] border-r border-[#dadada] px-2">
                <div className="relative flex-1 flex flex-col items-center justify-center">
                    <div className="p-1.5 hover:bg-white/60 rounded cursor-pointer group w-14 flex flex-col items-center"
                        onClick={() => setShowMacroMenu(!showMacroMenu)}>
                        <Search size={22} className="text-yellow-600" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">Makrolar</span>
                    </div>
                    {showMacroMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown min-w-[160px] py-1">
                            <button className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-700 hover:bg-blue-50"
                                onClick={() => runMacro('removeEmptyLines')}>
                                🗑 Boş Satırları Sil
                            </button>
                            <button className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-700 hover:bg-blue-50"
                                onClick={() => runMacro('trimSpaces')}>
                                ✂ Fazla Boşlukları Temizle
                            </button>
                            <button className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-700 hover:bg-blue-50"
                                onClick={() => runMacro('uppercase')}>
                                🔤 Tümünü Büyük Harf Yap
                            </button>
                        </div>
                    )}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Makrolar</span>
            </div>

            {/* Özellikler */}
            <div className="flex flex-col items-center h-full min-w-[100px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                    onClick={showDocProperties}>
                    <Settings size={22} className="text-zinc-400" strokeWidth={2} />
                    <span className="text-[9px] font-black text-zinc-800 pt-1">Özellikler</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Belge</span>
            </div>

            {/* Yeni Görünüm Araçları */}
            <div className="flex flex-col items-center h-full min-w-[180px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={toggleDarkMode} title="Karanlık Mod" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-14 transition-all", isDarkMode ? "btn-active" : "hover:bg-white/60")}>
                        <Moon size={18} className={cn(isDarkMode ? "text-yellow-400" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Karanlık</span>
                    </button>
                    <button onClick={toggleLineNumbers} title="Satır Numaraları" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-14 transition-all", showLineNumbers ? "btn-active" : "hover:bg-white/60")}>
                        <ListOrdered size={18} className={cn(showLineNumbers ? "text-[#2b579a]" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Satır No</span>
                    </button>
                    <button onClick={toggleMiniMap} title="Mini Harita" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-14 transition-all", showMiniMap ? "btn-active" : "hover:bg-white/60")}>
                        <Map size={18} className={cn(showMiniMap ? "text-emerald-500" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Mini Harita</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Gelişmiş</span>
            </div>

            {/* Ek Görünüm Araçları */}
            <div className="flex flex-col items-center h-full min-w-[400px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) { el.style.maxWidth = '600px'; el.style.margin = '0 auto'; el.style.fontSize = '18px'; el.style.lineHeight = '2'; }
                        setIsFocusMode(true);
                    }} title="Odak Okuma" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <BookOpenCheck size={16} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Odak Oku</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) { el.style.transition = 'all 0.3s'; el.style.letterSpacing = '1px'; el.style.wordSpacing = '3px'; }
                    }} title="Okuma Hızı Ayarla" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Timer size={16} className="text-amber-500" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">İlg. Süre</span>
                    </button>
                    <button onClick={() => {
                        const html = document.querySelector('.ProseMirror')?.innerHTML || '';
                        const win = window.open('', '_blank');
                        if (win) { win.document.write(`<html><head><title>Baskı Önizleme</title><style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:auto;}</style></head><body>${html}</body></html>`); win.document.close(); }
                    }} title="Baskı Önizleme" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Printer size={16} className="text-emerald-600" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5 text-center leading-tight">Baskı Ön.</span>
                    </button>
                    <button onClick={() => setIsSplit(!isSplit)} title="Yan Yana Görünüm" className={cn("flex flex-col items-center justify-center p-1.5 rounded cursor-pointer w-12", isSplit ? "btn-active" : "hover:bg-white/60")}>
                        <PanelLeft size={16} className={cn(isSplit ? "text-[#2b579a]" : "text-zinc-500")} strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Yan Yana</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
                    }} title="Konumu Sıfırla" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <RotateCcw size={16} className="text-red-400" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Başa Dön</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) { el.style.columnCount = el.style.columnCount === '2' ? '1' : '2'; el.style.columnGap = '2em'; }
                    }} title="Çift Sütun" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <GripHorizontal size={16} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Çift Sütun</span>
                    </button>
                    <button onClick={() => {
                        const headings = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3');
                        if (headings.length > 0) {
                            headings.forEach((h, i) => {
                                (h as HTMLElement).style.border = '1px dashed #93c5fd';
                                (h as HTMLElement).style.padding = '4px';
                                setTimeout(() => { (h as HTMLElement).style.border = ''; (h as HTMLElement).style.padding = ''; }, 3000);
                            });
                        }
                    }} title="Sayfa Haritası" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Compass size={16} className="text-teal-500" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Harita</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            el.style.maxWidth = el.style.maxWidth === '500px' ? '' : '500px';
                            el.style.margin = el.style.maxWidth ? '0 auto' : '';
                            el.style.fontSize = el.style.maxWidth ? '16px' : '';
                        }
                    }} title="Tam Odak Modu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Focus size={16} className="text-indigo-500" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Odak</span>
                    </button>
                    <button onClick={() => {
                        const el = document.querySelector('.ProseMirror') as HTMLElement;
                        if (el) {
                            const isSepia = el.style.filter === 'sepia(0.3)';
                            el.style.filter = isSepia ? '' : 'sepia(0.3)';
                        }
                    }} title="Sepia Filtre" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <SwitchCamera size={16} className="text-orange-400" strokeWidth={2} />
                        <span className="text-[7px] font-black text-zinc-700 pt-0.5">Sepia</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Ek Görünüm</span>
            </div>
        </div>
    );
};

export default memo(ViewTab);
