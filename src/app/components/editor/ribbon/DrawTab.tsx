"use client";

import React, { memo, useState, useRef, useCallback, useEffect } from "react";
import { PenTool, Highlighter, Eraser, MousePointer, Type, Circle, Square, Minus, Palette, Undo2, Download, Trash2, Layers, Pipette, Brush, Droplets, Spline, PaintBucket, Sparkles, SunDim, ArrowRight, Triangle, Star, Hexagon, Pencil, Pen } from "lucide-react";
import { cn } from "../utils";

const DRAW_COLORS = [
    "#000000", "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71",
    "#3498db", "#9b59b6", "#1abc9c", "#e91e63", "#795548",
    "#607d8b", "#ffffff",
];

const PEN_WIDTHS = [1, 2, 3, 5, 8, 12];

const DrawTab = () => {
    const [activeTool, setActiveTool] = useState<string>('pen');
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(2);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showWidthPicker, setShowWidthPicker] = useState(false);
    const [canvasActive, setCanvasActive] = useState(false);
    const [customColor, setCustomColor] = useState('');
    const [showCustomColor, setShowCustomColor] = useState(false);
    const [opacity, setOpacity] = useState(100);
    const [showOpacity, setShowOpacity] = useState(false);
    const [lineStyle, setLineStyle] = useState('solid');
    const [showLineStyle, setShowLineStyle] = useState(false);

    // Use refs to avoid closure stale state in canvas event listeners
    const activeToolRef = useRef(activeTool);
    const penColorRef = useRef(penColor);
    const penWidthRef = useRef(penWidth);

    useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
    useEffect(() => { penColorRef.current = penColor; }, [penColor]);
    useEffect(() => { penWidthRef.current = penWidth; }, [penWidth]);

    const toggleCanvas = useCallback(() => {
        if (canvasActive) {
            const canvas = document.getElementById('draw-canvas');
            if (canvas) canvas.remove();
            setCanvasActive(false);
            return;
        }

        const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
        if (!editorEl) return;

        const rect = editorEl.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        canvas.id = 'draw-canvas';
        canvas.width = rect.width;
        canvas.height = Math.max(editorEl.scrollHeight, rect.height);
        canvas.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; cursor: crosshair; pointer-events: auto;`;
        editorEl.style.position = 'relative';
        editorEl.appendChild(canvas);
        setCanvasActive(true);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let isDrawing = false;
        let lastX = 0, lastY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            lastX = e.offsetX;
            lastY = e.offsetY;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const tool = activeToolRef.current;
            const color = penColorRef.current;
            const width = penWidthRef.current;

            ctx.beginPath();
            if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = width * 4;
            } else if (tool === 'highlighter') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 0.35;
                ctx.lineWidth = width * 5;
                ctx.strokeStyle = color;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
                ctx.lineWidth = width;
                ctx.strokeStyle = color;
            }
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            lastX = e.offsetX;
            lastY = e.offsetY;
            ctx.globalAlpha = 1;
        });
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseleave', () => { isDrawing = false; });

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const r = canvas.getBoundingClientRect();
            lastX = touch.clientX - r.left;
            lastY = touch.clientY - r.top;
            isDrawing = true;
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const touch = e.touches[0];
            const r = canvas.getBoundingClientRect();
            const x = touch.clientX - r.left;
            const y = touch.clientY - r.top;
            ctx.beginPath();
            ctx.globalCompositeOperation = activeToolRef.current === 'eraser' ? 'destination-out' : 'source-over';
            ctx.globalAlpha = activeToolRef.current === 'highlighter' ? 0.35 : 1;
            ctx.lineWidth = activeToolRef.current === 'eraser' ? penWidthRef.current * 4 : penWidthRef.current;
            ctx.strokeStyle = penColorRef.current;
            ctx.lineCap = 'round';
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            lastX = x; lastY = y;
        });
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    }, [canvasActive]);

    const clearCanvas = () => {
        const canvas = document.getElementById('draw-canvas') as HTMLCanvasElement;
        if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }
    };

    const saveDrawing = () => {
        const canvas = document.getElementById('draw-canvas') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'cizim.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    const insertShape = (shape: string) => {
        const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
        if (!editorEl) return;
        let html = '';
        if (shape === 'rect') html = `<div style="width: 120px; height: 80px; border: 2px solid ${penColor}; display: inline-block; margin: 8px;"></div>`;
        else if (shape === 'circle') html = `<div style="width: 80px; height: 80px; border: 2px solid ${penColor}; border-radius: 50%; display: inline-block; margin: 8px;"></div>`;
        else if (shape === 'line') html = `<hr style="border: 2px solid ${penColor}; margin: 12px 0;" />`;
        // Inject into the editor via clipboard API as we can't use TipTap directly here
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        editorEl.appendChild(tempDiv.firstChild as Node);
    };

    const applyCustomColor = () => {
        if (/^#[0-9a-fA-F]{3,6}$/.test(customColor)) {
            setPenColor(customColor);
            setShowCustomColor(false);
            setShowColorPicker(false);
        }
    };

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Araçlar */}
            <div className="flex flex-col items-center h-full min-w-[260px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    {[
                        { id: 'select', label: 'Seç', icon: MousePointer },
                        { id: 'pen', label: 'Kalem', icon: PenTool },
                        { id: 'highlighter', label: 'İşaretle', icon: Highlighter },
                        { id: 'eraser', label: 'Silgi', icon: Eraser },
                        { id: 'text', label: 'Metin', icon: Type },
                    ].map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActiveTool(id)} title={label}
                            className={cn("flex flex-col items-center p-1.5 rounded w-11", activeTool === id ? "btn-active" : "hover:bg-white/60")}>
                            <Icon size={18} className={activeTool === id ? "text-[#2b579a]" : "text-zinc-600"} />
                            <span className="text-[7px] font-bold mt-0.5">{label}</span>
                        </button>
                    ))}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Araçlar</span>
            </div>

            {/* Renk ve Kalınlık */}
            <div className="flex flex-col items-center h-full min-w-[180px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-2">
                    {/* Color */}
                    <div className="relative">
                        <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer"
                            onClick={() => { setShowColorPicker(!showColorPicker); setShowWidthPicker(false); }}>
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-300" style={{ backgroundColor: penColor }} />
                            <span className="text-[7px] font-bold mt-0.5">Renk</span>
                        </div>
                        {showColorPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 w-[160px]">
                                <div className="grid grid-cols-4 gap-1 mb-2">
                                    {DRAW_COLORS.map(c => (
                                        <button key={c} className={cn("w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform", penColor === c ? "border-[#2b579a] ring-2 ring-blue-200" : "border-zinc-200")}
                                            style={{ backgroundColor: c }} onClick={() => { setPenColor(c); setShowColorPicker(false); }} />
                                    ))}
                                </div>
                                <div className="flex gap-1">
                                    <input type="color" value={penColor} onChange={e => setPenColor(e.target.value)}
                                        className="w-full h-7 rounded border border-zinc-200 cursor-pointer" title="Özel renk seç" />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Width */}
                    <div className="relative">
                        <div className="flex flex-col items-center p-1 hover:bg-white/60 rounded cursor-pointer"
                            onClick={() => { setShowWidthPicker(!showWidthPicker); setShowColorPicker(false); }}>
                            <div className="w-5 h-5 flex items-center justify-center">
                                <div className="rounded-full bg-zinc-800" style={{ width: Math.min(penWidth * 2, 16), height: Math.min(penWidth * 2, 16) }} />
                            </div>
                            <span className="text-[7px] font-bold mt-0.5">{penWidth}px</span>
                        </div>
                        {showWidthPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 min-w-[100px]">
                                {PEN_WIDTHS.map(w => (
                                    <button key={w} className={cn("w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50", penWidth === w && "bg-blue-50 font-bold")}
                                        onClick={() => { setPenWidth(w); setShowWidthPicker(false); }}>
                                        <div className="rounded-full bg-zinc-800" style={{ width: Math.min(w * 2, 16), height: Math.min(w * 2, 16) }} />
                                        <span className="text-[10px] text-zinc-700">{w}px</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Current color preview */}
                    <div className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded border border-zinc-300 shadow-inner" style={{ backgroundColor: penColor }} />
                        <span className="text-[7px] font-mono text-zinc-600">{penColor}</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Renk & Kalınlık</span>
            </div>

            {/* Çizim */}
            <div className="flex flex-col items-center h-full min-w-[180px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={toggleCanvas} title={canvasActive ? "Çizimi Kapat" : "Çizim Başlat"}
                        className={cn("flex flex-col items-center p-1.5 rounded cursor-pointer w-14", canvasActive ? "bg-green-100 ring-1 ring-green-400" : "hover:bg-white/60")}>
                        <Layers size={18} className={canvasActive ? "text-green-600" : "text-zinc-600"} />
                        <span className="text-[7px] font-bold mt-0.5">{canvasActive ? "Kapat" : "Başlat"}</span>
                    </button>
                    <button onClick={clearCanvas} title="Çizimi Temizle" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Trash2 size={18} className="text-red-500" /><span className="text-[7px] font-bold mt-0.5">Temizle</span>
                    </button>
                    <button onClick={saveDrawing} title="PNG olarak kaydet" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Download size={18} className="text-[#2b579a]" /><span className="text-[7px] font-bold mt-0.5">Kaydet</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Çizim</span>
            </div>

            {/* Şekiller */}
            <div className="flex flex-col items-center h-full min-w-[240px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => insertShape('rect')} title="Dikdörtgen" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Square size={18} className="text-[#2b579a]" /><span className="text-[7px] font-bold mt-0.5">Kutu</span>
                    </button>
                    <button onClick={() => insertShape('circle')} title="Daire" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Circle size={18} className="text-[#2b579a]" /><span className="text-[7px] font-bold mt-0.5">Daire</span>
                    </button>
                    <button onClick={() => insertShape('line')} title="Çizgi" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Minus size={18} className="text-[#2b579a]" /><span className="text-[7px] font-bold mt-0.5">Çizgi</span>
                    </button>
                    <button onClick={() => {
                        const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
                        if (editorEl) editorEl.appendChild(Object.assign(document.createElement('div'), { innerHTML: `<div style="width: 0; height: 0; border-left: 30px solid transparent; border-right: 30px solid transparent; border-bottom: 52px solid ${penColor}; display: inline-block; margin: 8px;"></div>` }).firstChild as Node);
                    }} title="Üçgen" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Triangle size={18} className="text-emerald-500" /><span className="text-[7px] font-bold mt-0.5">Üçgen</span>
                    </button>
                    <button onClick={() => {
                        const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
                        if (editorEl) editorEl.appendChild(Object.assign(document.createElement('div'), { innerHTML: `<div style="text-align: center; font-size: 48px; color: ${penColor};">&#9733;</div>` }).firstChild as Node);
                    }} title="Yıldız" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Star size={18} className="text-yellow-500" /><span className="text-[7px] font-bold mt-0.5">Yıldız</span>
                    </button>
                    <button onClick={() => {
                        const editorEl = document.querySelector('.ProseMirror') as HTMLElement;
                        if (editorEl) editorEl.appendChild(Object.assign(document.createElement('div'), { innerHTML: `<div style="text-align: center; font-size: 36px; color: ${penColor};">→</div>` }).firstChild as Node);
                    }} title="Ok" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <ArrowRight size={18} className="text-red-500" /><span className="text-[7px] font-bold mt-0.5">Ok</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Şekiller</span>
            </div>

            {/* Gelişmiş Çizim Araçları */}
            <div className="flex flex-col items-center h-full min-w-[260px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => setActiveTool('pen')} title="Fırça" className={cn("flex flex-col items-center p-1.5 rounded w-10", activeTool === 'pen' ? "btn-active" : "hover:bg-white/60")}>
                        <Brush size={16} className="text-violet-500" /><span className="text-[7px] font-bold mt-0.5">Fırça</span>
                    </button>
                    <button onClick={() => { setActiveTool('pen'); setPenWidth(8); }} title="Mum Boya" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Pencil size={16} className="text-orange-500" /><span className="text-[7px] font-bold mt-0.5">Boya</span>
                    </button>
                    <button onClick={() => { setActiveTool('highlighter'); setPenWidth(12); }} title="Sprey" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <Droplets size={16} className="text-cyan-500" /><span className="text-[7px] font-bold mt-0.5">Sprey</span>
                    </button>
                    <button onClick={() => {
                        const canvas = document.getElementById('draw-canvas') as HTMLCanvasElement;
                        if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) { ctx.fillStyle = penColor; ctx.fillRect(0, 0, canvas.width, canvas.height); } }
                    }} title="Dolgu" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                        <PaintBucket size={16} className="text-blue-500" /><span className="text-[7px] font-bold mt-0.5">Dolgu</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => { setShowOpacity(!showOpacity); setShowLineStyle(false); }} title={`Opaklık: %${opacity}`} className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                            <SunDim size={16} className="text-amber-500" /><span className="text-[7px] font-bold mt-0.5">%{opacity}</span>
                        </button>
                        {showOpacity && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 min-w-[80px]">
                                {[25, 50, 75, 100].map(o => (
                                    <button key={o} className={cn("w-full text-left px-2 py-1 text-[10px] font-bold hover:bg-blue-50", opacity === o && "text-[#2b579a] bg-blue-50")} onClick={() => { setOpacity(o); setShowOpacity(false); }}>%{o}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => { setShowLineStyle(!showLineStyle); setShowOpacity(false); }} title="Çizgi Stili" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-10">
                            <Spline size={16} className="text-slate-500" /><span className="text-[7px] font-bold mt-0.5">Stil</span>
                        </button>
                        {showLineStyle && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-[9999] ribbon-dropdown p-2 min-w-[100px]">
                                {[['solid', 'Düz'], ['dashed', 'Kesikli'], ['dotted', 'Noktalı']].map(([v, l]) => (
                                    <button key={v} className={cn("w-full text-left px-2 py-1 text-[10px] font-bold hover:bg-blue-50", lineStyle === v && "text-[#2b579a] bg-blue-50")} onClick={() => { setLineStyle(v); setShowLineStyle(false); }}>{l}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Gelişmiş</span>
            </div>

            {/* Gölge & Efekt */}
            <div className="flex flex-col items-center h-full min-w-[120px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const canvas = document.getElementById('draw-canvas') as HTMLCanvasElement;
                        if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) { ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 5; } }
                    }} title="Gölge Ekle" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Sparkles size={16} className="text-purple-500" /><span className="text-[7px] font-bold mt-0.5">Gölge</span>
                    </button>
                    <button onClick={() => {
                        const canvas = document.getElementById('draw-canvas') as HTMLCanvasElement;
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) { const grd = ctx.createLinearGradient(0, 0, canvas.width, 0); grd.addColorStop(0, penColor); grd.addColorStop(1, '#ffffff'); ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height); }
                        }
                    }} title="Gradyan Dolgu" className="flex flex-col items-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-12">
                        <Hexagon size={16} className="text-teal-500" /><span className="text-[7px] font-bold mt-0.5">Gradyan</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Efektler</span>
            </div>
        </div>
    );
};

export default memo(DrawTab);
