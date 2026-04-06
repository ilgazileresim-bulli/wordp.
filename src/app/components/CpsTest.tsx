"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MousePointer2, RotateCcw, Zap, Target, Trophy } from "lucide-react";

interface CpsTestProps {
  onBack: () => void;
}

type TestDuration = 1 | 10 | 60;

export default function CpsTest({ onBack }: CpsTestProps) {
  const [duration, setDuration] = useState<TestDuration>(10);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [bestCps, setBestCps] = useState<Record<TestDuration, number>>({
    1: 0,
    10: 0,
    60: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load best scores from localStorage
    const saved = localStorage.getItem("wordp_cps_best");
    if (saved) {
      try {
        setBestCps(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse best CPS scores");
      }
    }
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            handleFinish();
            return 0;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
        localStorage.setItem("wordp_cps_best", JSON.stringify(newBest));
      }
    }
  }, [isFinished]);

  const handleClick = () => {
    if (isFinished) return;
    if (!isActive) {
      handleStart();
    } else {
      setClicks((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsFinished(false);
    setClicks(0);
    setTimeLeft(0);
  };

  const currentCps = isActive ? (clicks / (duration - timeLeft + 0.1)).toFixed(1) : (clicks / duration).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-zinc-100 p-6 flex flex-col">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span>Geri Dön</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-black">CPS Testi</h1>
        </div>
        <div className="w-24"></div> {/* Spacer for symmetry */}
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
        {/* Settings */}
        <div className="flex gap-4 mb-12">
          {([1, 10, 60] as TestDuration[]).map((d) => (
            <button
              key={d}
              disabled={isActive}
              onClick={() => {
                setDuration(d);
                handleReset();
              }}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                duration === d
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105"
                  : "bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
              }`}
            >
              {d === 60 ? "1 Dakika" : `${d} Saniye`}
            </button>
          ))}
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Stats Left */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="text-zinc-500 text-sm font-bold mb-1 uppercase tracking-wider">Kalan Süre</div>
              <div className="text-4xl font-black text-blue-400">{isActive ? timeLeft.toFixed(1) : duration.toFixed(1)}s</div>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="text-zinc-500 text-sm font-bold mb-1 uppercase tracking-wider">Toplam Tıklama</div>
              <div className="text-4xl font-black text-white">{clicks}</div>
            </div>
          </div>

          {/* Click Area */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center gap-4 relative group cursor-pointer border-4 ${
                isActive 
                  ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400/50 shadow-2xl shadow-blue-500/40"
                  : isFinished
                  ? "bg-white/5 border-zinc-700 shadow-none"
                  : "bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 shadow-xl"
              } transition-all duration-300`}
            >
              {/* Pulse effect */}
              {isActive && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-blue-500 -z-10"
                />
              )}

              <MousePointer2 className={`${isActive ? "text-white" : "text-zinc-500"} group-hover:scale-110 transition-transform`} size={64} strokeWidth={1.5} />
              <div className="text-center">
                <div className={`text-xl font-bold uppercase tracking-widest ${isActive ? "text-blue-100" : "text-zinc-400"}`}>
                  {isActive ? "TIKLA!" : isFinished ? "BİTTİ" : "BAŞLAMAK İÇİN TIKLA"}
                </div>
                {isFinished && (
                  <div className="text-zinc-500 text-sm mt-1">Sıfırlamak için aşağı basın</div>
                )}
              </div>
            </motion.button>
          </div>

          {/* Stats Right */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="text-zinc-500 text-sm font-bold mb-1 uppercase tracking-wider">Anlık CPS</div>
              <div className="text-4xl font-black text-orange-400">{currentCps}</div>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-zinc-500 text-sm font-bold mb-1 uppercase tracking-wider">En İyi Skor ({duration}s)</div>
                <div className="text-3xl font-black text-yellow-400">{bestCps[duration].toFixed(1)}</div>
              </div>
              <Trophy size={32} className="text-yellow-500/50" />
            </div>
          </div>
        </div>

        {/* Results Modal / Overlay */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 w-full max-w-xl bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[32px] p-8 border border-white/10 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
              
              <div className="text-center relative z-10">
                <h2 className="text-3xl font-black text-white mb-2">Test Tamamlandı!</h2>
                <div className="text-zinc-400 font-medium mb-8">Performansın harikaydı, işte sonuçlar:</div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-black/20 rounded-2xl p-4">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Hız (CPS)</div>
                    <div className="text-4xl font-black text-blue-400">{(clicks / duration).toFixed(1)}</div>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Toplam Tıklama</div>
                    <div className="text-4xl font-black text-purple-400">{clicks}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-white text-black hover:bg-zinc-200 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={18} />
                    TEKRAR DENE
                  </button>
                  <button
                    onClick={onBack}
                    className="px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-colors"
                  >
                    ANASAYFA
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12 bg-white/5 p-8 rounded-[40px] border border-white/10">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Target size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">CPS Nedir?</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">Clicks Per Second (Saniye Başına Tıklama), tıklama hızınızı ölçen bir ölçüdür. Profesyonel oyuncular genellikle 8-12 CPS arası hıza sahiptir.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">İpucu</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">Daha yüksek skorlar için "Jitter Click" veya "Butterfly Click" tekniklerini kullanabilirsiniz. Bilekten değil, parmaklardan güç alın.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-zinc-600 text-sm">
        Word P. CPS Tool &copy; 2026 - Tıklama Hızınızı Geliştirin
      </footer>
    </div>
  );
}
