"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MousePointer2, RotateCcw, Zap, Target, Trophy, ShieldCheck, Loader2, Sparkles, Timer } from "lucide-react";
import { cn } from "./editor/utils";

interface CpsTestProps {
  onBack: () => void;
}

type TestDuration = 1 | 5 | 10 | 60;

export default function CpsTest({ onBack }: CpsTestProps) {
  const [duration, setDuration] = useState<TestDuration>(10);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [bestCps, setBestCps] = useState<Record<TestDuration, number>>({
    1: 0,
    5: 0,
    10: 0,
    60: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("macrotar_cps_best_v2");
    if (saved) {
      try { setBestCps(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) { handleFinish(); return 0; }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setClicks(1);
    setTimeLeft(duration);
    setIsActive(true);
    setIsFinished(false);
  };

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isFinished) {
      const currentCps = clicks / duration;
      if (currentCps > bestCps[duration]) {
        const newBest = { ...bestCps, [duration]: currentCps };
        setBestCps(newBest);
        localStorage.setItem("macrotar_cps_best_v2", JSON.stringify(newBest));
      }
    }
  }, [isFinished]);

  const handleClick = () => {
    if (isFinished) return;
    if (!isActive) handleStart();
    else setClicks((prev) => prev + 1);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsFinished(false);
    setClicks(0);
    setTimeLeft(0);
  };

  const currentCps = isActive ? (clicks / (duration - timeLeft + 0.1)).toFixed(1) : (clicks / duration).toFixed(1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
            <Zap size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">CPS Performance</h1>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black tracking-widest uppercase flex items-center gap-2">
                <ShieldCheck size={12} /> Reflex Measurement • Precision 0.1s
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Settings Engine */}
        <div className="flex items-center gap-2 mb-16 bg-white dark:bg-[#0a0a1a] p-2 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-xl">
          {([1, 5, 10, 60] as TestDuration[]).map((d) => (
            <button
              key={d}
              disabled={isActive}
              onClick={() => { setDuration(d); handleReset(); }}
              className={cn(
                "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                duration === d ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {d === 60 ? "1 Minute" : `${d} Seconds`}
            </button>
          ))}
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          {/* Metrics: Left */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-2xl">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Timer size={14} className="text-blue-500" /> Time Remaining
               </label>
               <div className="text-5xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">
                  {isActive ? timeLeft.toFixed(1) : duration.toFixed(1)}<span className="text-xl text-zinc-400 ml-1">s</span>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-2xl">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <MousePointer2 size={14} className="text-emerald-500" /> Interaction Count
               </label>
               <div className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  {clicks}
               </div>
            </div>
          </div>

          {/* Core: Click Buffer */}
          <div className="flex justify-center relative">
            <motion.button 
                whileTap={{ scale: 0.92 }}
                onClick={handleClick}
                className={cn(
                    "w-72 h-72 rounded-full border-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 relative group",
                    isActive ? "bg-orange-600 border-orange-400/30 shadow-[0_0_50px_rgba(234,88,12,0.4)] text-white scale-110" : "bg-white dark:bg-slate-900/40 border-zinc-200 dark:border-white/5 text-zinc-400"
                )}
            >
                <AnimatePresence>
                    {isActive && (
                        <motion.div initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute inset-0 bg-orange-600 rounded-full -z-10" />
                    )}
                </AnimatePresence>
                <MousePointer2 size={64} className={cn("group-hover:scale-110 transition-transform", isActive ? "text-white" : "text-zinc-500")} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {isActive ? "Slam It!" : isFinished ? "Result Ready" : "Start Measurement"}
                </span>
            </motion.button>
          </div>

          {/* Metrics: Right */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-2xl">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-orange-500" /> Real-time Velocity
               </label>
               <div className="text-5xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">
                  {currentCps}<span className="text-xl text-zinc-400 ml-1">CPS</span>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-2xl flex items-center justify-between">
               <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Trophy size={14} className="text-yellow-500" /> Personal Record
                </label>
                <div className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">
                    {bestCps[duration].toFixed(1)}
                </div>
               </div>
               <Trophy size={32} className="text-yellow-500/20" />
            </div>
          </div>
        </div>

        {/* Post-Processing Results */}
        <AnimatePresence>
            {isFinished && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mt-16 w-full max-w-xl bg-white dark:bg-[#0a0a1a] rounded-[3rem] border border-zinc-200 dark:border-white/5 p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-3xl" />
                    <div className="text-center relative z-10">
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Test Finished</h2>
                        <p className="text-zinc-500 text-sm font-medium mb-10">Performance metrics synthesized successfully.</p>
                        
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-zinc-50 dark:bg-black/40 p-6 rounded-3xl border border-zinc-100 dark:border-white/5">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Velocity</span>
                                <div className="text-4xl font-black text-orange-600">{(clicks / duration).toFixed(1)}</div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-black/40 p-6 rounded-3xl border border-zinc-100 dark:border-white/5">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Iterations</span>
                                <div className="text-4xl font-black text-indigo-600">{clicks}</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleReset} className="flex-1 py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                                <RotateCcw size={18} /> Restart Test
                            </button>
                            <button onClick={onBack} className="px-10 py-5 bg-zinc-100 dark:bg-white/5 text-zinc-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:text-zinc-900 dark:hover:text-white transition-all">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {!isFinished && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl mt-20">
                <div className="flex gap-6">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0"><Target size={28} /></div>
                    <div>
                        <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Protocol</h4>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">CPS (Clicks Per Second) measures motor response velocity. Professional tier performance typically averages 8-14 CPS.</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center shrink-0"><Sparkles size={28} /></div>
                    <div>
                        <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Optimization</h4>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">Deploy "Jitter" or "Butterfly" techniques to maximize oscillation frequency. Power should originate from the fingertips.</p>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
