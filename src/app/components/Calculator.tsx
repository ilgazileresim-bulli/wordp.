"use client";

import React, { useState, useCallback } from "react";
import { ArrowLeft, Calculator as CalculatorIcon, Delete, Equal, Minus, Plus, X, Divide, Percent, RotateCcw } from "lucide-react";
import { cn } from "./editor/utils";

export default function Calculator({ onBack }: { onBack: () => void }) {
    const [display, setDisplay] = useState("0");
    const [equation, setEquation] = useState("");
    const [isFinished, setIsFinished] = useState(false);

    const handleNumber = useCallback((num: string) => {
        if (display === "0" || isFinished) {
            setDisplay(num);
            setIsFinished(false);
        } else {
            setDisplay(display + num);
        }
    }, [display, isFinished]);

    const handleOperator = useCallback((op: string) => {
        let currentEq = equation;
        if (isFinished) {
            currentEq = display;
            setIsFinished(false);
        } else {
            currentEq += display;
        }
        
        setEquation(currentEq + " " + op + " ");
        setDisplay("0");
    }, [display, equation, isFinished]);

    const handleClear = useCallback(() => {
        setDisplay("0");
        setEquation("");
        setIsFinished(false);
    }, []);

    const handleBackspace = useCallback(() => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay("0");
        }
    }, [display]);

    const calculate = useCallback(() => {
        try {
            const finalEquation = equation + display;
            const sanitized = finalEquation.replace(/[^-()\d/*+.]/g, '');
            // eslint-disable-next-line no-eval
            const result = eval(sanitized);
            setDisplay(String(Number(result.toFixed(8))));
            setEquation("");
            setIsFinished(true);
        } catch (error) {
            setDisplay("Error");
            setEquation("");
            setIsFinished(true);
        }
    }, [display, equation]);

    const handlePercent = useCallback(() => {
        setDisplay(String(parseFloat(display) / 100));
    }, [display]);

    const handleDecimal = useCallback(() => {
        if (!display.includes(".")) {
            setDisplay(display + ".");
        }
    }, [display]);

    const buttons = [
        { label: "AC", action: handleClear, type: "danger", icon: RotateCcw },
        { label: "DEL", action: handleBackspace, type: "secondary", icon: Delete },
        { label: "%", action: handlePercent, type: "secondary", icon: Percent },
        { label: "÷", action: () => handleOperator("/"), type: "operator", icon: Divide },
        { label: "7", action: () => handleNumber("7"), type: "number" },
        { label: "8", action: () => handleNumber("8"), type: "number" },
        { label: "9", action: () => handleNumber("9"), type: "number" },
        { label: "×", action: () => handleOperator("*"), type: "operator", icon: X },
        { label: "4", action: () => handleNumber("4"), type: "number" },
        { label: "5", action: () => handleNumber("5"), type: "number" },
        { label: "6", action: () => handleNumber("6"), type: "number" },
        { label: "-", action: () => handleOperator("-"), type: "operator", icon: Minus },
        { label: "1", action: () => handleNumber("1"), type: "number" },
        { label: "2", action: () => handleNumber("2"), type: "number" },
        { label: "3", action: () => handleNumber("3"), type: "number" },
        { label: "+", action: () => handleOperator("+"), type: "operator", icon: Plus },
        { label: "0", action: () => handleNumber("0"), type: "number", span: 2 },
        { label: ".", action: handleDecimal, type: "number" },
        { label: "=", action: calculate, type: "equal", icon: Equal },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] flex flex-col font-[family-name:var(--font-inter)]">
            <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <CalculatorIcon size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Quick Math</h1>
                        <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black tracking-widest uppercase">Precision Calculation Tool</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="bg-white dark:bg-[#12122b]/80 backdrop-blur-3xl border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                        <div className="mb-8 p-8 bg-zinc-50 dark:bg-black/40 rounded-3xl border border-zinc-100 dark:border-white/5 text-right min-h-[140px] flex flex-col justify-end shadow-inner">
                            <div className="text-zinc-400 dark:text-zinc-500 text-sm font-black tracking-widest mb-2 h-6 overflow-hidden uppercase">
                                {equation || <span className="opacity-0">.</span>}
                            </div>
                            <div className="text-5xl font-black text-zinc-900 dark:text-white truncate tracking-tighter">
                                {display}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {buttons.map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={btn.action}
                                    className={cn(
                                        "h-16 rounded-2xl flex items-center justify-center text-lg font-black transition-all active:scale-95 shadow-sm",
                                        btn.span === 2 ? "col-span-2" : "col-span-1",
                                        btn.type === "number" && "bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/10",
                                        btn.type === "operator" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20",
                                        btn.type === "secondary" && "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200",
                                        btn.type === "danger" && "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20",
                                        btn.type === "equal" && "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30"
                                    )}
                                >
                                    {btn.icon ? <btn.icon size={24} /> : btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
