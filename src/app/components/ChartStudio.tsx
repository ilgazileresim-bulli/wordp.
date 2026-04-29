"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Download, Plus, Trash2, Settings2, BarChart3, LineChart as LineChartIcon, 
  PieChart as PieChartIcon, Activity, Database, Layout, Palette, 
  ChevronRight, Save, FileJson, TrendingUp, Layers, Target, Zap, Briefcase, Heart, Cpu, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis,  Radar, ComposedChart 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import { cn } from './editor/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Charts', icon: Layout },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'tech', label: 'Tech', icon: Cpu },
  { id: 'social', label: 'Social', icon: Zap },
];

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: LineChartIcon },
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'area', label: 'Area', icon: Activity },
  { id: 'pie', label: 'Pie', icon: PieChartIcon },
  { id: 'radar', label: 'Radar', icon: Target },
  { id: 'composed', label: 'Mixed', icon: Layers },
];

const THEMES = [
  { id: 'modern', label: 'Neon Blue', colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] },
  { id: 'emerald', label: 'Deep Forest', colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'] },
  { id: 'sunset', label: 'Sunset Drive', colors: ['#f43f5e', '#fb923c', '#facc15', '#fb7185', '#fda4af'] },
  { id: 'cyber', label: 'Night City', colors: ['#f0abfc', '#818cf8', '#2dd4bf', '#fb7185', '#fde047'] },
];

const PRESETS = [
  { id: 'fin-1', name: 'Revenue Streams', type: 'bar', category: 'business', data: [{ name: 'Jan', v1: 4000, v2: 2400 }, { name: 'Feb', v1: 3000, v2: 1398 }, { name: 'Mar', v1: 2000, v2: 9800 }, { name: 'Apr', v1: 2780, v2: 3908 }] },
  { id: 'fin-2', name: 'Equity Growth', type: 'line', category: 'business', data: [{ name: 'D1', v1: 120 }, { name: 'D2', v1: 132 }, { name: 'D3', v1: 101 }, { name: 'D4', v1: 134 }] },
  { id: 'health-1', name: 'Vital Metrics', type: 'area', category: 'health', data: [{ name: '08:00', v1: 72 }, { name: '09:00', v1: 85 }, { name: '10:00', v1: 110 }, { name: '11:00', v1: 78 }] },
];

export default function ChartStudio({ onBack, initialType }: { onBack: (data?: string) => void, initialType?: string }) {
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
  const [isExporting, setIsExporting] = useState(false);

  const [chartWidth, setChartWidth] = useState(100);
  const [chartHeight, setChartHeight] = useState(500);
  const [chartPadding, setChartPadding] = useState(40);
  const [chartBorderRadius, setChartBorderRadius] = useState(48);

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
      const dataUrl = await htmlToImage.toPng(chartRef.current, {
        backgroundColor: '#000000',
        pixelRatio: 2,
        cacheBust: true,
      });
      onBack(`INSERT_CHART_IMAGE:${dataUrl}`);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderChart = () => {
    const commonProps = { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 } };
    const animationProps = isAnimate ? { isAnimationActive: true, animationDuration: 1500 } : { isAnimationActive: false };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" stroke="#555" fontSize={10} />
            <YAxis stroke="#555" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
            <Legend />
            <Line type="monotone" dataKey="v1" stroke={theme.colors[0]} strokeWidth={4} dot={{ r: 6, fill: theme.colors[0] }} {...animationProps} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" stroke="#555" fontSize={10} />
            <YAxis stroke="#555" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
            <Bar dataKey="v1" fill={theme.colors[0]} radius={[10, 10, 0, 0]} {...animationProps} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorV1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.colors[0]} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={theme.colors[0]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" stroke="#555" fontSize={10} />
            <YAxis stroke="#555" fontSize={10} />
            <Area type="monotone" dataKey="v1" stroke={theme.colors[0]} strokeWidth={3} fillOpacity={1} fill="url(#colorV1)" {...animationProps} />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value" {...animationProps}>
              {data.map((_, i) => <Cell key={i} fill={theme.colors[i % theme.colors.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" stroke="#555" fontSize={10} />
            <Radar name="Value" dataKey="A" stroke={theme.colors[0]} fill={theme.colors[0]} fillOpacity={0.3} {...animationProps} />
          </RadarChart>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => onBack()} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">{chartName}</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase">Data Visualizer Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportToWord}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-50 dark:hover:bg-white/20 transition-all shadow-sm"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Attach to Document
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all">
            <Download size={16} /> Export Image
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a1a] flex flex-col p-6 space-y-8">
           <div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Presets Engine</h2>
              <div className="grid grid-cols-2 gap-2 mb-8">
                 {CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95",
                            activeCategory === cat.id 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-transparent" 
                                : "bg-zinc-50 dark:bg-white/5 border-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        )}
                    >
                        <cat.icon size={18} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{cat.label}</span>
                    </button>
                 ))}
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 no-scrollbar">
                {filteredPresets.map(preset => (
                    <button 
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all group",
                            activePreset.id === preset.id
                                ? "bg-zinc-100 dark:bg-white/10 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                                : "bg-transparent border-transparent text-zinc-400"
                        )}
                    >
                        <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-white/5 flex items-center justify-center shrink-0">
                           {(() => {
                               const Icon = CHART_TYPES.find(t => t.id === preset.type)?.icon || Database;
                               return <Icon size={14} />;
                           })()}
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight truncate">{preset.name}</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                    </button>
                ))}
              </div>
           </div>
        </aside>

        <main className="flex-1 bg-zinc-50 dark:bg-black/20 flex flex-col items-center p-12 overflow-y-auto">
            <div className="w-full max-w-5xl flex flex-col items-center gap-10">
                <div className="w-full bg-white dark:bg-[#0a0a1a] p-2 rounded-3xl border border-zinc-200 dark:border-white/5 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-1">
                        {CHART_TYPES.map(type => (
                            <button 
                                key={type.id}
                                onClick={() => setChartType(type.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    chartType === type.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                                )}
                            >
                                <type.icon size={16} /> {type.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowDataEditor(!showDataEditor)} className={cn("p-4 rounded-2xl transition-all mr-2", showDataEditor ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5")}>
                        <Database size={20} />
                    </button>
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-3">
                        <div 
                            ref={chartRef}
                            style={{ 
                                width: `${chartWidth}%`, height: `${chartHeight}px`, padding: `${chartPadding}px`, borderRadius: `${chartBorderRadius}px`
                            }}
                            className="bg-white dark:bg-[#0d0d1a] border border-zinc-200 dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[120px] -z-10 group-hover:bg-indigo-600/10 transition-colors" />
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{chartName}</h3>
                                    <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase mt-1">Real-time Visualization</p>
                                </div>
                                <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    {renderChart()}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a1a] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Palette size={14} className="text-indigo-500" /> Color Signature
                            </label>
                            <div className="space-y-3">
                                {THEMES.map(t => (
                                    <button 
                                        key={t.id} onClick={() => setTheme(t)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border transition-all flex items-center justify-between",
                                            theme.id === t.id ? "bg-zinc-100 dark:bg-white/5 border-indigo-500/30" : "bg-transparent border-transparent"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-tight">{t.label}</span>
                                        <div className="flex -space-x-1">
                                            {t.colors.slice(0, 3).map((c, i) => <div key={i} className="w-4 h-4 rounded-full border-2 border-white dark:border-[#0a0a1a]" style={{ backgroundColor: c }} />)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0a0a1a] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Layout size={14} className="text-indigo-500" /> Canvas Settings
                            </label>
                            <div className="space-y-6">
                                {[
                                    { label: 'Width', val: chartWidth, set: setChartWidth, min: 50, max: 100 },
                                    { label: 'Height', val: chartHeight, set: setChartHeight, min: 300, max: 700 },
                                    { label: 'Radius', val: chartBorderRadius, set: setChartBorderRadius, min: 0, max: 64 }
                                ].map(s => (
                                    <div key={s.label}>
                                        <div className="flex justify-between mb-3">
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</span>
                                            <span className="text-[10px] font-black text-indigo-600">{s.val}</span>
                                        </div>
                                        <input type="range" min={s.min} max={s.max} value={s.val} onChange={(e) => s.set(parseInt(e.target.value))} className="w-full h-1 bg-zinc-100 dark:bg-white/5 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showDataEditor && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-x-0 bottom-0 h-[400px] bg-white dark:bg-[#0a0a1a] border-t border-zinc-200 dark:border-white/10 z-[100] p-10 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.3)]">
                        <div className="max-w-6xl mx-auto h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Database size={20} /></div>
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Source Compilation</h2>
                                </div>
                                <button onClick={() => setShowDataEditor(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-2xl transition-all"><Trash2 size={24} className="text-zinc-400" /></button>
                            </div>
                            <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-black/40 rounded-3xl border border-zinc-200 dark:border-white/5 p-6 shadow-inner">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-white/5">
                                            <th className="pb-4 pl-4">Identifier</th>
                                            <th className="pb-4">Primary Value</th>
                                            <th className="pb-4">Secondary Value</th>
                                            <th className="pb-4 text-right pr-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-bold">
                                        {data.map((row, i) => (
                                            <tr key={i} className="border-b border-zinc-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-4"><input value={row.name || row.subject || ""} onChange={(e) => { const newData = [...data]; newData[i] = { ...newData[i], [row.name !== undefined ? 'name' : 'subject']: e.target.value }; setData(newData); }} className="bg-transparent border-none text-zinc-900 dark:text-white outline-none w-full" /></td>
                                                <td className="py-4 text-indigo-600"><input type="number" value={row.v1 ?? row.A ?? row.value ?? 0} onChange={(e) => { const newData = [...data]; const val = parseFloat(e.target.value); newData[i] = { ...newData[i], [row.v1 !== undefined ? 'v1' : (row.A !== undefined ? 'A' : 'value')]: val }; setData(newData); }} className="bg-transparent border-none outline-none w-24" /></td>
                                                <td className="py-4 text-blue-500"><input type="number" value={row.v2 ?? row.B ?? 0} onChange={(e) => { const newData = [...data]; const val = parseFloat(e.target.value); newData[i] = { ...newData[i], [row.v2 !== undefined ? 'v2' : 'B']: val }; setData(newData); }} className="bg-transparent border-none outline-none w-24" /></td>
                                                <td className="py-4 text-right pr-4"><button onClick={() => setData(data.filter((_, idx) => idx !== i))} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={14} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={() => setData([...data, { name: 'New Item', v1: 0, v2: 0 }])} className="w-full py-4 mt-4 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-indigo-600 hover:border-indigo-600/30 transition-all">Append Entry</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
