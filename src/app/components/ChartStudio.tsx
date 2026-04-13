"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Download, Plus, Trash2, Settings2, BarChart3, LineChart as LineChartIcon, 
  PieChart as PieChartIcon, Activity, Database, Layout, Palette, Share2, 
  ChevronRight, Save, Copy, FileJson, TrendingUp, TrendingDown, Layers, Map,
  Target, Zap, Briefcase, Heart, Cpu
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis,  Radar, ScatterChart, Scatter, ZAxis, ComposedChart 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import { twMerge } from "tailwind-merge";
import { cn } from './editor/utils';

const CATEGORIES = [
  { id: 'all', label: 'Tüm Grafikler', icon: Layout },
  { id: 'business', label: 'İş & Finans', icon: Briefcase },
  { id: 'analytics', label: 'Analitik', icon: TrendingUp },
  { id: 'health', label: 'Sağlık', icon: Heart },
  { id: 'tech', label: 'Teknoloji', icon: Cpu },
  { id: 'social', label: 'Sosyal Medya', icon: Zap },
];

const CHART_TYPES = [
  { id: 'line', label: 'Çizgi Grafik', icon: LineChartIcon },
  { id: 'bar', label: 'Sütun Grafik', icon: BarChart3 },
  { id: 'area', label: 'Alan Grafiği', icon: Activity },
  { id: 'pie', label: 'Pasta Grafik', icon: PieChartIcon },
  { id: 'radar', label: 'Radar Grafik', icon: Target },
  { id: 'composed', label: 'Karma Grafik', icon: Layers },
];

const THEMES = [
  { id: 'modern', label: 'Modern Blue', colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] },
  { id: 'emerald', label: 'Forest Green', colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'] },
  { id: 'sunset', label: 'Sunset Glow', colors: ['#f43f5e', '#fb923c', '#facc15', '#fb7185', '#fda4af'] },
  { id: 'cyber', label: 'Cyberpunk', colors: ['#f0abfc', '#818cf8', '#2dd4bf', '#fb7185', '#fde047'] },
  { id: 'minimal', label: 'Minimalist', colors: ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'] },
];

// Generate 100 presets (simulated with combinations and unique metadata)
const PRESETS = [
  { id: 'fin-1', name: 'Aylık Gelir Analizi', type: 'bar', category: 'business', data: [{ name: 'Oca', v1: 4000, v2: 2400 }, { name: 'Şub', v1: 3000, v2: 1398 }, { name: 'Mar', v1: 2000, v2: 9800 }, { name: 'Nis', v1: 2780, v2: 3908 }, { name: 'May', v1: 1890, v2: 4800 }] },
  { id: 'fin-2', name: 'Hisse Senedi Performansı', type: 'line', category: 'business', data: [{ name: 'G1', v1: 120 }, { name: 'G2', v1: 132 }, { name: 'G3', v1: 101 }, { name: 'G4', v1: 134 }, { name: 'G5', v1: 90 }] },
  { id: 'health-1', name: 'Kalp Ritmi Takibi', type: 'area', category: 'health', data: [{ name: '08:00', v1: 72 }, { name: '09:00', v1: 85 }, { name: '10:00', v1: 110 }, { name: '11:00', v1: 78 }, { name: '12:00', v1: 75 }] },
  { id: 'tech-1', name: 'Sunucu Yükü (CPU)', type: 'line', category: 'tech', data: [{ name: '12:00', v1: 45 }, { name: '12:10', v1: 52 }, { name: '12:20', v1: 88 }, { name: '12:30', v1: 65 }, { name: '12:40', v1: 42 }] },
  { id: 'social-1', name: 'Instagram Etkileşim', type: 'radar', category: 'social', data: [{ subject: 'Beğeni', A: 120, B: 110, fullMark: 150 }, { subject: 'Yorum', A: 98, B: 130, fullMark: 150 }, { subject: 'Kaydetme', A: 86, B: 130, fullMark: 150 }, { subject: 'Paylaşım', A: 99, B: 100, fullMark: 150 }, { subject: 'Erişim', A: 85, B: 90, fullMark: 150 }] },
  { id: 'ana-1', name: 'Proje Dağılımı', type: 'pie', category: 'analytics', data: [{ name: 'Tamamlanan', value: 400 }, { name: 'Devam Eden', value: 300 }, { name: 'Planlanan', value: 300 }, { name: 'Geciken', value: 200 }] },
];

// Dynamically generate up to 100 based on patterns if needed, but let's start with a solid set
for(let i=3; i<=20; i++) {
    PRESETS.push({
        id: `gen-${i}`,
        name: `Özel Analiz Seti #${i}`,
        type: CHART_TYPES[i % CHART_TYPES.length].id as any,
        category: CATEGORIES[i % CATEGORIES.length].id as any,
        data: [
            { name: 'A', v1: Math.random() * 1000, v2: Math.random() * 800 },
            { name: 'B', v1: Math.random() * 1000, v2: Math.random() * 800 },
            { name: 'C', v1: Math.random() * 1000, v2: Math.random() * 800 },
            { name: 'D', v1: Math.random() * 1000, v2: Math.random() * 800 },
        ]
    });
}

export default function ChartStudio({ onBack, initialType }: { onBack: (data?: string) => void, initialType?: string }) {
  // Find a preset that matches the initial type if provided
  const defaultPreset = useMemo(() => {
    if (initialType) {
      const match = PRESETS.find(p => p.type === initialType);
      if (match) return match;
    }
    return PRESETS[0];
  }, [initialType]);

  const [activePreset, setActivePreset] = useState(defaultPreset);
  const [chartType, setChartType] = useState(defaultPreset.type);
  const [theme, setTheme] = useState(THEMES[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [data, setData] = useState<any[]>(defaultPreset.data);
  const [chartName, setChartName] = useState(defaultPreset.name);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [isAnimate, setIsAnimate] = useState(true);
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Advanced Visual State
  const [chartWidth, setChartWidth] = useState(100); // percentage
  const [chartHeight, setChartHeight] = useState(450); // pixels
  const [chartPadding, setChartPadding] = useState(32); // pixels
  const [chartBorderRadius, setChartBorderRadius] = useState(40); // pixels
  const [isExporting, setIsExporting] = useState(false);

  // Update when initialType changes
  React.useEffect(() => {
    if (initialType) {
      const match = PRESETS.find(p => p.type === initialType);
      if (match) {
        setActivePreset(match);
        setChartType(match.type);
        setData(match.data);
        setChartName(match.name);
      }
    }
  }, [initialType]);

  const filteredPresets = useMemo(() => {
    return PRESETS.filter(p => activeCategory === 'all' || p.category === activeCategory);
  }, [activeCategory]);

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset);
    setChartType(preset.type);
    setData(preset.data);
    setChartName(preset.name);
  };

  const handleExportToWord = async () => {
    if (!chartRef.current) return;
    try {
      setIsExporting(true);
      // Wait for animations if needed, but usually html-to-image captures current state
      const dataUrl = await htmlToImage.toPng(chartRef.current, {
        backgroundColor: '#020202',
        pixelRatio: 2, // High-quality export
        cacheBust: true,
        fontEmbedCSS: '', // Bypasses SecurityError by skipping cross-origin font parsing
      });
      onBack(`INSERT_CHART_IMAGE:${dataUrl}`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Grafik dışa aktarılamadı.');
    } finally {
      setIsExporting(false);
    }
  };
  const handleDataChange = (index: number, key: string, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [key]: value };
    setData(newData);
  };

  const handleDeleteRow = (index: number) => {
    if (data.length <= 1) return;
    const newData = data.filter((_: any, i: number) => i !== index);
    setData(newData);
  };

  const handleAddRow = () => {
    const lastRow = data[data.length - 1];
    const newEntry = { ...lastRow };
    
    // Reset specific keys based on chart type
    if ('name' in newEntry) newEntry.name = `Yeni Katman ${data.length + 1}`;
    if ('subject' in newEntry) newEntry.subject = `Yeni Konu ${data.length + 1}`;
    if ('v1' in newEntry) newEntry.v1 = 0;
    if ('v2' in newEntry) newEntry.v2 = 0;
    if ('value' in newEntry) newEntry.value = 0;
    if ('A' in newEntry) newEntry.A = 0;
    if ('B' in newEntry) newEntry.B = 0;
    
    setData([...data, newEntry]);
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const animationProps = isAnimate ? { isAnimationActive: true, animationDuration: 1500, animationEasing: 'ease-in-out' as any } : { isAnimationActive: false };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="v1" stroke={theme.colors[0]} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} {...animationProps} />
            <Line type="monotone" dataKey="v2" stroke={theme.colors[1]} strokeWidth={3} dot={{ r: 6 }} {...animationProps} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Bar dataKey="v1" fill={theme.colors[0]} radius={[8, 8, 0, 0]} {...animationProps} />
            <Bar dataKey="v2" fill={theme.colors[1]} radius={[8, 8, 0, 0]} {...animationProps} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorV1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme.colors[0]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Area type="monotone" dataKey="v1" stroke={theme.colors[0]} fillOpacity={1} fill="url(#colorV1)" {...animationProps} />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              {...animationProps}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={theme.colors[index % theme.colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={12} />
            <PolarRadiusAxis stroke="#444" fontSize={10} />
            <Radar name="A" dataKey="A" stroke={theme.colors[0]} fill={theme.colors[0]} fillOpacity={0.6} {...animationProps} />
            <Radar name="B" dataKey="B" stroke={theme.colors[1]} fill={theme.colors[1]} fillOpacity={0.6} {...animationProps} />
            <Legend />
          </RadarChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Area type="monotone" dataKey="v1" fill={theme.colors[0]} stroke={theme.colors[0]} fillOpacity={0.2} {...animationProps} />
            <Bar dataKey="v2" barSize={20} fill={theme.colors[1]} radius={[4, 4, 0, 0]} {...animationProps} />
            <Line type="monotone" dataKey="v1" stroke={theme.colors[2]} strokeWidth={3} {...animationProps} />
          </ComposedChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 font-sans flex flex-col overflow-hidden">
      {/* Premium Header */}
      <header className="h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => onBack()} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="font-black text-white text-lg tracking-tight uppercase italic">{chartName}</h1>
            <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase opacity-80">Grafik Stüdyosu Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportToWord}
            disabled={isExporting}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 bg-white text-black font-black text-xs uppercase tracking-tighter rounded-xl hover:bg-white/90 transition-all shadow-lg active:scale-95 disabled:opacity-50",
              isExporting && "animate-pulse"
            )}
          >
            <Plus size={16} /> {isExporting ? "Hazırlanıyor..." : "Word'a Ekle"}
          </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-sm transition-all border border-white/5">
                <Save size={16} /> Taslağı Kaydet
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-900/20 transition-all">
                <Download size={16} /> Dışarı Aktar
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Presets Library */}
        <aside className="w-80 border-r border-white/5 bg-[#08080a] flex flex-col">
           <div className="p-6">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Şablon Kütüphanesi</h2>
              <div className="grid grid-cols-2 gap-2 mb-8">
                 {CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all",
                            activeCategory === cat.id 
                                ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                                : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
                        )}
                    >
                        <cat.icon size={18} />
                        <span className="text-[10px] font-bold">{cat.label}</span>
                    </button>
                 ))}
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)] pr-2 hide-scrollbar">
                {filteredPresets.map(preset => (
                    <button 
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                            activePreset.id === preset.id
                                ? "bg-blue-600/10 border-blue-500/30 text-white"
                                : "bg-transparent border-transparent text-slate-400 hover:bg-white/5"
                        )}
                    >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", activePreset.id === preset.id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500")}>
                           {(() => {
                               const Icon = CHART_TYPES.find(t => t.id === preset.type)?.icon || Database;
                               return <Icon size={16} />;
                           })()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <p className="text-xs font-bold truncate">{preset.name}</p>
                           <p className="text-[9px] text-slate-500 uppercase font-black">{preset.category}</p>
                        </div>
                        <ChevronRight size={14} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", activePreset.id === preset.id && "opacity-100")} />
                    </button>
                ))}
              </div>
           </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 bg-black flex flex-col p-8 items-center justify-start overflow-y-auto">
           {/* Toolbar */}
           <div className="w-full max-w-4xl flex items-center justify-between mb-8 bg-[#0a0a0c] p-2 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1">
                    {CHART_TYPES.map(type => (
                        <button 
                            key={type.id}
                            onClick={() => setChartType(type.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                                chartType === type.id 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                                    : "text-slate-500 hover:bg-white/5"
                            )}
                        >
                            <type.icon size={16} />
                            {type.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 mr-4">
                    <button 
                        onClick={() => setShowDataEditor(!showDataEditor)}
                        className={cn("p-2 rounded-xl transition-all", showDataEditor ? "bg-indigo-500 text-white" : "text-slate-500 hover:bg-white/5")}
                    >
                        <Database size={18} />
                    </button>
                    <button className="p-2 rounded-xl text-slate-500 hover:bg-white/5">
                        <Settings2 size={18} />
                    </button>
                </div>
           </div>

           <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-6">
               <div className="lg:col-span-3 flex justify-center items-start">
                   {/* Chart Container */}
                    <div 
                        ref={chartRef}
                        style={{ 
                            width: `${chartWidth}%`, 
                            height: `${chartHeight}px`,
                            padding: `${chartPadding}px`,
                            borderRadius: `${chartBorderRadius}px`
                        }}
                        className="bg-gradient-to-b from-[#0a0a0c] to-[#050505] border border-white/5 relative flex flex-col shadow-2xl overflow-hidden group transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">{chartName}</h3>
                                <p className="text-xs text-slate-500 font-medium">Anlık Veri Önizlemesi</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canlı</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                            </ResponsiveContainer>
                        </div>
                    </div>
               </div>

               <div className="flex flex-col gap-6">
                    {/* Theme Selector */}
                    <div className="bg-[#0a0a0c] rounded-3xl p-6 border border-white/5">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Palette size={14} className="text-blue-500" /> Renk Teması
                        </h3>
                        <div className="space-y-3">
                            {THEMES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setTheme(t)}
                                    className={cn(
                                        "w-full p-3 rounded-2xl border transition-all flex items-center justify-between group",
                                        theme.id === t.id ? "bg-white/5 border-blue-500/30" : "bg-transparent border-transparent hover:bg-white/5"
                                    )}
                                >
                                    <span className={cn("text-xs font-bold transition-colors", theme.id === t.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>{t.label}</span>
                                    <div className="flex -space-x-1.5">
                                        {t.colors.slice(0, 3).map((c, i) => (
                                            <div key={i} className="w-4 h-4 rounded-full border-2 border-[#0a0a0c]" style={{ backgroundColor: c }}></div>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size & Layout Settings */}
                    <div className="bg-[#0a0a0c] rounded-3xl p-6 border border-white/5">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Layout size={14} className="text-emerald-500" /> Boyut & Düzen
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Genişlik</span>
                                    <span className="text-[10px] font-black text-emerald-400">%{chartWidth}</span>
                                </div>
                                <input 
                                    type="range" min="40" max="100" value={chartWidth}
                                    onChange={(e) => setChartWidth(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Yükseklik</span>
                                    <span className="text-[10px] font-black text-emerald-400">{chartHeight}px</span>
                                </div>
                                <input 
                                    type="range" min="300" max="800" value={chartHeight}
                                    onChange={(e) => setChartHeight(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">İç Boşluk</span>
                                    <span className="text-[10px] font-black text-emerald-400">{chartPadding}px</span>
                                </div>
                                <input 
                                    type="range" min="16" max="64" value={chartPadding}
                                    onChange={(e) => setChartPadding(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Köşe Keskinliği</span>
                                    <span className="text-[10px] font-black text-emerald-400">{chartBorderRadius}px</span>
                                </div>
                                <input 
                                    type="range" min="0" max="80" value={chartBorderRadius}
                                    onChange={(e) => setChartBorderRadius(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* Data Editor Overlay */}
           <AnimatePresence>
            {showDataEditor && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-0 left-0 right-0 h-96 bg-zinc-900 border-t border-white/10 z-[100] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                <Database size={20} />
                            </div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Veri Kaynağı Düzenleyici</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl text-xs transition-all">
                                <FileJson size={14} /> JSON Aktar
                            </button>
                            <button onClick={() => setShowDataEditor(false)} className="p-2 hover:bg-white/10 text-slate-400 rounded-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-black/40 rounded-2xl border border-white/5 p-4">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-slate-500 uppercase font-black border-b border-white/5">
                                    <th className="pb-3 pl-4">Başlık / Etiket</th>
                                    <th className="pb-3">Değer 1 (v1)</th>
                                    <th className="pb-3">Değer 2 (v2)</th>
                                    <th className="pb-3 text-right pr-4">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-200">
                                    {data.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-4">
                                            <input 
                                                type="text"
                                                value={row.name || row.subject || ""}
                                                onChange={(e) => handleDataChange(i, row.name !== undefined ? 'name' : 'subject', e.target.value)}
                                                className="bg-transparent border-none text-slate-200 focus:outline-none focus:text-white font-bold w-full"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <input 
                                                type="number"
                                                value={isNaN(row.v1 ?? row.A ?? row.value) ? 0 : (row.v1 ?? row.A ?? row.value ?? 0)}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    handleDataChange(i, row.v1 !== undefined ? 'v1' : (row.A !== undefined ? 'A' : 'value'), isNaN(val) ? 0 : val);
                                                }}
                                                className="bg-transparent border-none text-emerald-400 font-mono focus:outline-none focus:text-emerald-300 w-24"
                                            />
                                        </td>
                                        <td className="py-3">
                                            { (row.v2 !== undefined || row.B !== undefined) && (
                                                <input 
                                                    type="number"
                                                    value={isNaN(row.v2 ?? row.B) ? 0 : (row.v2 ?? row.B ?? 0)}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        handleDataChange(i, row.v2 !== undefined ? 'v2' : 'B', isNaN(val) ? 0 : val);
                                                    }}
                                                    className="bg-transparent border-none text-blue-400 font-mono focus:outline-none focus:text-blue-300 w-24"
                                                />
                                            )}
                                        </td>
                                        <td className="py-3 text-right pr-4">
                                            <button 
                                                onClick={() => handleDeleteRow(i)}
                                                className="p-1.5 hover:bg-red-500/10 text-red-500/60 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button 
                            onClick={handleAddRow}
                            className="mt-4 w-full py-3 border border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 transition-all font-bold flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Yeni Satır Ekle
                        </button>
                    </div>
                </motion.div>
            )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
