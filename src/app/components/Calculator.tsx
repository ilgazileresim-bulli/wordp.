"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calculator as CalculatorIcon, Delete, Equal, Minus, Plus, X, Divide, Percent, RotateCcw } from "lucide-react";
import { cn } from "./editor/utils";

export default function Calculator() {
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
            // Basic cleanup to avoid eval issues, though safe for this use case
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
        <section className="py-20 relative overflow-hidden" id="calculator">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <CalculatorIcon size={20} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Quick Math</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium -mt-1">Perform calculations here while preparing your documents.</p>
                    </div>
                </div>

                <div className="relative group max-w-sm mx-auto">
                    {/* Background Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                    
                    {/* Calculator Body */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-white/70 dark:bg-[#12122b]/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-[32px] p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Display Surface */}
                        <div className="mb-6 p-6 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-slate-800/50 text-right min-h-[120px] flex flex-col justify-end">
                            <div className="text-zinc-400 dark:text-slate-500 text-sm font-medium mb-1 h-6 overflow-hidden">
                                {equation}
                            </div>
                            <div className="text-4xl font-black text-zinc-800 dark:text-white truncate">
                                {display}
                            </div>
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {buttons.map((btn, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={btn.action}
                                    className={cn(
                                        "h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all shadow-sm",
                                        btn.span === 2 ? "col-span-2" : "col-span-1",
                                        btn.type === "number" && "bg-white/50 dark:bg-slate-800/40 text-zinc-700 dark:text-zinc-200 border border-zinc-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700",
                                        btn.type === "operator" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100",
                                        btn.type === "secondary" && "bg-zinc-100 dark:bg-slate-800/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200",
                                        btn.type === "danger" && "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100",
                                        btn.type === "equal" && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                                    )}
                                >
                                    {btn.icon ? <btn.icon size={20} /> : btn.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        </section>
    );
}
