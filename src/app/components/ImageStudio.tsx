"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Download, Upload, ZoomIn, ZoomOut, RotateCcw, Sliders, CheckCircle, RefreshCcw, Sparkles, Sun, Palette, Droplets, Contrast, Eye } from 'lucide-react';
import { cn } from "./editor/utils";

const FILTER_CONFIGS: Record<string, { title: string; desc: string; icon: any; color: string; controls: { id: string; label: string; min: number; max: number; step: number; default: number }[] }> = {
  'brightness-contrast': {
    title: "Brightness & Contrast", desc: "Balance the light and dark.", icon: Sun, color: "from-yellow-400 to-orange-500",
    controls: [
      { id: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, default: 0 },
      { id: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, default: 0 }
    ]
  },
  'hue-saturation': {
    title: "Hue & Saturation", desc: "Vibrancy and color shifting.", icon: Palette, color: "from-fuchsia-500 to-purple-600",
    controls: [
      { id: 'hue', label: 'Hue Shift', min: -180, max: 180, step: 1, default: 0 },
      { id: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, default: 0 }
    ]
  },
  'exposure': {
    title: "Exposure", desc: "Simulate camera exposure.", icon: Sparkles, color: "from-blue-400 to-indigo-500",
    controls: [ { id: 'exposure', label: 'Exposure (EV)', min: -5, max: 5, step: 0.1, default: 0 } ]
  },
  'vignette': {
    title: "Vignette Effect", desc: "Create edge darkening.", icon: Eye, color: "from-slate-700 to-slate-900",
    controls: [
      { id: 'amount', label: 'Amount', min: 0, max: 100, step: 1, default: 50 },
      { id: 'size', label: 'Size', min: 0, max: 100, step: 1, default: 50 }
    ]
  },
  'sepia-vintage': {
    title: "Sepia & Vintage", desc: "Old film aesthetics.", icon: RefreshCcw, color: "from-amber-600 to-orange-800",
    controls: [ { id: 'intensity', label: 'Blend Intensity', min: 0, max: 100, step: 1, default: 100 } ]
  },
  'invert-colors': {
    title: "Invert Colors", desc: "Create a negative effect.", icon: Contrast, color: "from-zinc-800 to-black",
    controls: [ { id: 'amount', label: 'Inversion', min: 0, max: 100, step: 1, default: 100 } ]
  },
  'threshold': {
    title: "Threshold", desc: "Sharp black and white contrast.", icon: Contrast, color: "from-zinc-400 to-zinc-600",
    controls: [ { id: 'level', label: 'Threshold Level', min: 1, max: 255, step: 1, default: 128 } ]
  },
  'sharpen': {
    title: "Sharpen", desc: "Apply matrix sharpening.", icon: Droplets, color: "from-teal-400 to-emerald-600",
    controls: [ { id: 'strength', label: 'Intensity', min: 0, max: 100, step: 1, default: 50 } ]
  }
};

export default function ImageStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  const validToolId = FILTER_CONFIGS[initialToolId] ? initialToolId : 'brightness-contrast';
  const conf = FILTER_CONFIGS[validToolId];

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState<Record<string, number>>({});
  const [isCopied, setIsCopied] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const initParams: Record<string, number> = {};
    conf.controls.forEach(c => initParams[c.id] = c.default);
    setParams(initParams);
  }, [validToolId, conf]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    const img = new Image();
    img.onload = () => {
       origImgRef.current = img;
       applyFilters();
    };
    img.src = url;
  };

  const applyFilters = () => {
    if (!origImgRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    
    requestAnimationFrame(() => {
      const cvs = canvasRef.current!;
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const img = origImgRef.current!;
      cvs.width = img.width;
      cvs.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imgData.data;

      if (validToolId === 'brightness-contrast') {
        const b = params.brightness || 0;
        const c = params.contrast || 0;
        const factor = (259 * (c + 255)) / (255 * (259 - c));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128 + b;
          data[i+1] = factor * (data[i+1] - 128) + 128 + b;
          data[i+2] = factor * (data[i+2] - 128) + 128 + b;
        }
      } else if (validToolId === 'sepia-vintage') {
        const intensity = (params.intensity || 0) / 100;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const tr = (r * 0.393) + (g * 0.769) + (b * 0.189);
          const tg = (r * 0.349) + (g * 0.686) + (b * 0.168);
          const tb = (r * 0.272) + (g * 0.534) + (b * 0.131);
          data[i] = r + (tr - r) * intensity;
          data[i+1] = g + (tg - g) * intensity;
          data[i+2] = b + (tb - b) * intensity;
        }
      } else if (validToolId === 'invert-colors') {
        const amount = (params.amount || 0) / 100;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] + (255 - data[i] - data[i]) * amount;
          data[i+1] = data[i+1] + (255 - data[i+1] - data[i+1]) * amount;
          data[i+2] = data[i+2] + (255 - data[i+2] - data[i+2]) * amount;
        }
      } else if (validToolId === 'threshold') {
        const lvl = params.level || 128;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const val = luma >= lvl ? 255 : 0;
          data[i] = data[i+1] = data[i+2] = val;
        }
      } else if (validToolId === 'exposure') {
        const ev = params.exposure || 0;
        const mult = Math.pow(2, ev);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * mult;
          data[i+1] = data[i+1] * mult;
          data[i+2] = data[i+2] * mult;
        }
      } else if (validToolId === 'sharpen') {
         const strength = (params.strength || 0) / 100;
         if (strength > 0) {
            const w = cvs.width;
            const h = cvs.height;
            const src = new Uint8ClampedArray(data);
            const mix = strength;
            const matrix = [0, -1, 0, -1, 5, -1, 0, -1, 0];
            const side = 3;
            const halfSide = 1;
            for (let y = 0; y < h; y++) {
               for (let x = 0; x < w; x++) {
                  const dstOff = (y*w+x)*4;
                  let r=0, g=0, b=0;
                  for (let cy = 0; cy < side; cy++) {
                     for (let cx = 0; cx < side; cx++) {
                        const scy = y + cy - halfSide;
                        const scx = x + cx - halfSide;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                           const srcOff = (scy*w+scx)*4;
                           const wt = matrix[cy*side+cx];
                           r += src[srcOff] * wt;
                           g += src[srcOff+1] * wt;
                           b += src[srcOff+2] * wt;
                        }
                     }
                  }
                  data[dstOff]   = src[dstOff]   + (r - src[dstOff]) * mix;
                  data[dstOff+1] = src[dstOff+1] + (g - src[dstOff+1]) * mix;
                  data[dstOff+2] = src[dstOff+2] + (b - src[dstOff+2]) * mix;
               }
            }
         }
      }

      ctx.putImageData(imgData, 0, 0);

      if (validToolId === 'vignette') {
         const amount = (params.amount || 0) / 100;
         const size = (params.size || 50) / 100;
         if (amount > 0) {
            ctx.globalCompositeOperation = 'multiply';
            const gradient = ctx.createRadialGradient(
              cvs.width/2, cvs.height/2, Math.max(cvs.width, cvs.height) * size * 0.1,
              cvs.width/2, cvs.height/2, Math.max(cvs.width, cvs.height) * 0.7
            );
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(1, `rgba(0,0,0,${amount})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0,cvs.width,cvs.height);
            ctx.globalCompositeOperation = 'source-over';
         }
      }

      setIsProcessing(false);
    });
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => applyFilters(), 50);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `macrotar_image_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="h-20 border-b border-zinc-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br", conf.color)}>
            <conf.icon size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">{conf.title}</h1>
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{conf.desc}</p>
          </div>
        </div>
        
        {imageSrc && (
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black text-xs rounded-xl shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isCopied ? <CheckCircle size={16} /> : <Download size={16} />}
            {isCopied ? "EXPORTED" : "EXPORT IMAGE"}
          </button>
        )}
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* Canvas Area */}
        <div className="flex-[3] bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden relative flex items-center justify-center min-h-[60vh] shadow-inner">
           {!imageSrc ? (
             <label className="flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-white/5 w-full h-full p-12 transition-all group">
               <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Upload size={40} />
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Import Image</h3>
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm font-medium uppercase tracking-tight">Select a photo for professional enhancement and filtering.</p>
               </div>
               <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
             </label>
           ) : (
             <div className="relative w-full h-full flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
               {isProcessing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                    <RefreshCcw size={48} className="text-white animate-spin" />
                  </div>
               )}
               <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-3xl rounded-2xl" style={{ maxHeight: 'calc(100vh - 250px)' }} />
             </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-[2.5rem] p-8 min-w-[360px] max-w-[400px] shadow-2xl flex flex-col">
           <div className="flex items-center gap-3 mb-10 pb-6 border-b border-zinc-100 dark:border-slate-800">
              <Sliders size={22} className="text-blue-500" />
              <h2 className="text-xs uppercase font-black text-zinc-400 tracking-widest">Adjustments</h2>
           </div>

           {!imageSrc ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-100 dark:border-slate-800 rounded-3xl">
                 <ImageIcon size={32} className="text-zinc-300 mb-4" />
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Upload an image to unlock controls</p>
              </div>
           ) : (
             <div className="space-y-10 flex flex-col flex-1">
                {conf.controls.map(c => (
                   <div key={c.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{c.label}</label>
                         <span className={cn("font-mono text-[10px] font-black px-2 py-1 rounded-lg bg-zinc-100 dark:bg-slate-800 text-blue-500")}>{params[c.id]}</span>
                      </div>
                      <input 
                         type="range" 
                         min={c.min} max={c.max} step={c.step}
                         value={params[c.id] !== undefined ? params[c.id] : c.default}
                         onChange={(e) => setParams(p => ({ ...p, [c.id]: parseFloat(e.target.value) }))}
                         className="w-full accent-blue-600 h-1.5 appearance-none bg-zinc-100 dark:bg-slate-800 rounded-full"
                      />
                   </div>
                ))}

                <div className="pt-10 mt-auto">
                   <button 
                     onClick={() => {
                       const defaults: Record<string, number> = {};
                       conf.controls.forEach(c => defaults[c.id] = c.default);
                       setParams(defaults);
                     }}
                     className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-zinc-600 dark:text-zinc-300"
                   >
                      <RotateCcw size={18} /> Reset Settings
                   </button>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
