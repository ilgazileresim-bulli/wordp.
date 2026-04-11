"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Download, Upload, ZoomIn, ZoomOut, RotateCcw, Sliders, CheckCircle, RefreshCcw } from 'lucide-react';

const FILTER_CONFIGS: Record<string, { title: string; desc: string; controls: { id: string; label: string; min: number; max: number; step: number; default: number }[] }> = {
  'brightness-contrast': {
    title: "Parlaklık & Kontrast", desc: "Görüntü ışığını dengeleyin",
    controls: [
      { id: 'brightness', label: 'Parlaklık', min: -100, max: 100, step: 1, default: 0 },
      { id: 'contrast', label: 'Kontrast', min: -100, max: 100, step: 1, default: 0 }
    ]
  },
  'hue-saturation': {
    title: "Renk Tonu & Doygunluk", desc: "Canlılık ve renk kaydırma",
    controls: [
      { id: 'hue', label: 'Renk Tonu (Hue)', min: -180, max: 180, step: 1, default: 0 },
      { id: 'saturation', label: 'Doygunluk', min: -100, max: 100, step: 1, default: 0 }
    ]
  },
  'exposure': {
    title: "Pozlama", desc: "Simüle edilmiş kamera pozlaması",
    controls: [ { id: 'exposure', label: 'Pozlama (EV)', min: -5, max: 5, step: 0.1, default: 0 } ]
  },
  'vignette': {
    title: "Vinyet Efekti", desc: "Kenar karartması oluşturun",
    controls: [
      { id: 'amount', label: 'Miktar', min: 0, max: 100, step: 1, default: 50 },
      { id: 'size', label: 'Boyut', min: 0, max: 100, step: 1, default: 50 }
    ]
  },
  'sepia-vintage': {
    title: "Sepya & Vintage", desc: "Eski film etkisi",
    controls: [ { id: 'intensity', label: 'Karışım Yoğunluğu', min: 0, max: 100, step: 1, default: 100 } ]
  },
  'invert-colors': {
    title: "Renkleri Ters Çevir", desc: "Negatif etkisi",
    controls: [ { id: 'amount', label: 'Ters Çevirme', min: 0, max: 100, step: 1, default: 100 } ]
  },
  'threshold': {
    title: "Eşik", desc: "Sert siyah-beyaz yüksek kontrast",
    controls: [ { id: 'level', label: 'Eşik Seviyesi', min: 1, max: 255, step: 1, default: 128 } ]
  },
  'sharpen': {
    title: "Keskinleştir", desc: "Matris keskinleştirme uygulayın",
    controls: [ { id: 'strength', label: 'Yoğunluk', min: 0, max: 100, step: 1, default: 50 } ]
  },
  'duotone': {
    title: "İki Ton Efekti", desc: "Luma tabanlı haritalama",
    controls: [ { id: 'mix', label: 'Harita Karışımı', min: 0, max: 100, step: 1, default: 100 } ]
  },
  'blur': {
    title: "Bulanıklaştır", desc: "Yumuşak odak efekti",
    controls: [ { id: 'radius', label: 'Yarıçap', min: 0, max: 50, step: 1, default: 10 } ]
  }
};

export default function ImageStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  // If the initialToolId doesn't exist in our optimized list, fallback to brightness-contrast as a generic editor
  const validToolId = FILTER_CONFIGS[initialToolId] ? initialToolId : 'brightness-contrast';
  const conf = FILTER_CONFIGS[validToolId];

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState<Record<string, number>>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origImgRef = useRef<HTMLImageElement | null>(null);

  // Initialize params when tool changes
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
    
    // We use a small timeout to allow UI to render the "Processing..." state
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

      // PROCESS PIXELS
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
      } else if (validToolId === 'duotone') {
        const mix = (params.mix || 0) / 100;
        // Spotify style Duotone (simplified approximation mapping luma to Blue-Red gradient)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; // 0 to 1
          
          const dtR = luma * 255;
          const dtG = luma * 50;  // Dark red/magenta tint
          const dtB = (1 - luma) * 255; // Inverse mapping for shadows to blue
          
          data[i] = r + (dtR - r) * mix;
          data[i+1] = g + (dtG - g) * mix;
          data[i+2] = b + (dtB - b) * mix;
        }
      } else if (validToolId === 'sharpen') {
         const strength = (params.strength || 0) / 100;
         if (strength > 0) {
            const w = cvs.width;
            const h = cvs.height;
            const src = new Uint8ClampedArray(data); // clone orig
            const mix = strength; // 0 to 1
            const matrix = [
               0, -1, 0,
              -1,  5, -1,
               0, -1, 0
            ];
            const side = Math.round(Math.sqrt(matrix.length));
            const halfSide = Math.floor(side / 2);
            
            for (let y = 0; y < h; y++) {
               for (let x = 0; x < w; x++) {
                  const dstOff = (y*w+x)*4;
                  let r=0, g=0, b=0;
                  // Extremely naïve convolution loop (unoptimized for edges)
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

      // Vignette implementation (overlaying gradient)
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

  // Re-apply when params change
  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => applyFilters(), 50);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `edited_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white">
            <ImageIcon size={16} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">{conf.title}</h1>
            <p className="text-[10px] text-fuchsia-400 font-semibold tracking-wider uppercase">{conf.desc}</p>
          </div>
        </div>
        
        {imageSrc && (
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Download size={16} /> Aktar (JPG)
          </button>
        )}
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Canvas Working Area */}
        <div className="flex-[3] bg-[#0c0c0e] border border-white/5 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center min-h-[60vh] fancy-bg">
           
           <style dangerouslySetInnerHTML={{ __html: `
             .fancy-bg {
                background-image: 
                  linear-gradient(45deg, #15151a 25%, transparent 25%), 
                  linear-gradient(-45deg, #15151a 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #15151a 75%), 
                  linear-gradient(-45deg, transparent 75%, #15151a 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
             }
           `}} />

           {!imageSrc ? (
             <label className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 w-full h-full p-12 transition-colors">
               <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)]">
                 <Upload size={32} />
               </div>
               <div className="text-center">
                 <h3 className="text-xl font-bold text-white mb-2">Görsel Yükle</h3>
                 <p className="text-slate-500 text-sm max-w-sm">Düzeltme, filtreleme veya renk oynamaları için bir fotoğraf seçin.</p>
               </div>
               <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
             </label>
           ) : (
             <div className="relative w-full h-full flex items-center justify-center p-8">
               {isProcessing && (
                 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                       <RefreshCcw size={32} className="text-white animate-spin" />
                       <span className="text-sm font-bold tracking-widest text-white uppercase">İşleniyor</span>
                    </div>
                 </div>
               )}
               <canvas 
                 ref={canvasRef} 
                 className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                 style={{ maxHeight: 'calc(100vh - 200px)' }}
               />
             </div>
           )}
        </div>

        {/* Adjustments Sidebar */}
        <div className="flex-1 bg-[#111115] border border-white/5 rounded-3xl p-6 min-w-[320px] max-w-[400px]">
           <div className="flex items-center gap-3 mb-8">
              <Sliders size={20} className="text-fuchsia-500" />
              <h2 className="text-sm uppercase font-black text-slate-300 tracking-wider">Ayar Paneli</h2>
           </div>

           {!imageSrc ? (
              <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                 <p className="text-slate-500 text-sm">Ayarları görebilmek için önce bir görsel yüklemelisiniz.</p>
              </div>
           ) : (
             <div className="space-y-8 flex flex-col">
                {conf.controls.map(c => (
                   <div key={c.id} className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                         <label className="font-bold text-slate-300 tracking-wide">{c.label}</label>
                         <span className="font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded text-xs">{params[c.id]}</span>
                      </div>
                      <input 
                         type="range" 
                         min={c.min} max={c.max} step={c.step}
                         value={params[c.id] !== undefined ? params[c.id] : c.default}
                         onChange={(e) => setParams(p => ({ ...p, [c.id]: parseFloat(e.target.value) }))}
                         className="w-full accent-fuchsia-500 bg-black/50 overflow-hidden rounded-full h-2 appearance-none"
                         style={{ boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)' }}
                      />
                   </div>
                ))}

                <div className="pt-8 border-t border-white/5">
                   <button 
                     onClick={() => {
                       const defaults: Record<string, number> = {};
                       conf.controls.forEach(c => defaults[c.id] = c.default);
                       setParams(defaults);
                       applyFilters();
                     }}
                     className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all text-white"
                   >
                      <RotateCcw size={16} /> Değerleri Sıfırla
                   </button>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
