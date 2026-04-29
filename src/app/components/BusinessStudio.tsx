"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Trash2, LineChart, CheckCircle, Wallet, Calculator, Percent, TrendingUp, TrendingDown, Home, Coins, Briefcase, Landmark, Receipt, CreditCard, BarChart3, PieChart, Banknote } from 'lucide-react';
import { cn } from "./editor/utils";

const BIZ_TOOLS: Record<string, { title: string; desc: string; icon: any; color: string }> = {
  'biz-compound': { title: "Compound Interest", desc: "Calculate growth with monthly contributions.", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  'biz-loan': { title: "Loan Calculator", desc: "See monthly payments and total interest.", icon: Briefcase, color: "from-blue-500 to-indigo-600" },
  'biz-tip': { title: "Tip Calculator", desc: "Split bills and tips per person.", icon: Banknote, color: "from-yellow-400 to-orange-500" },
  'biz-percentage': { title: "Percentage Calc", desc: "What is X percent of Y?", icon: Percent, color: "from-indigo-500 to-blue-600" },
  'biz-discount': { title: "Discount Calc", desc: "See the final price after discounts.", icon: Receipt, color: "from-rose-500 to-pink-600" },
  'biz-margin': { title: "Profit Margin", desc: "Calculate margins based on cost.", icon: BarChart3, color: "from-cyan-500 to-blue-600" },
  'biz-roi': { title: "ROI Calculator", desc: "Return on Investment calculations.", icon: PieChart, color: "from-violet-500 to-purple-600" },
  'biz-salary': { title: "Salary Calculator", desc: "Gross, net, and hourly earnings.", icon: Wallet, color: "from-emerald-600 to-green-700" },
  'biz-savings': { title: "Savings Goal", desc: "How much to save to reach your target.", icon: Coins, color: "from-amber-400 to-yellow-600" },
  'biz-inflation': { title: "Inflation Calc", desc: "Purchasing power over time.", icon: TrendingDown, color: "from-red-500 to-rose-600" },
  'biz-mortgage': { title: "Mortgage Calc", icon: Home, desc: "Plan home loan payments.", color: "from-blue-600 to-indigo-700" },
  'biz-currency': { title: "Currency Converter", desc: "Instant exchange rates and converter.", icon: Coins, color: "from-teal-500 to-emerald-600" },
  'biz-paycheck': { title: "Paycheck Calc", desc: "Net pay after tax deductions.", icon: Receipt, color: "from-blue-500 to-blue-700" },
  'biz-emi': { title: "EMI Calculator", desc: "Equated Monthly Installment.", icon: Landmark, color: "from-indigo-600 to-blue-800" },
  'biz-sip': { title: "SIP Calculator", desc: "Systematic Investment Plan.", icon: TrendingUp, color: "from-green-500 to-emerald-700" },
  'biz-debt': { title: "Debt Payoff", desc: "Debt repayment schedule.", icon: CreditCard, color: "from-rose-600 to-red-800" },
  'biz-budget': { title: "Budget Planner", desc: "Income to expense ratios.", icon: Calculator, color: "from-sky-500 to-blue-600" },
  'biz-networth': { title: "Net Worth Calc", desc: "Assets minus liabilities.", icon: Wallet, color: "from-zinc-700 to-zinc-900" },
  'biz-retirement': { title: "Retirement Plan", desc: "Early retirement goal planning.", icon: Landmark, color: "from-amber-600 to-orange-800" },
  'biz-crypto': { title: "Crypto Profit", desc: "Transaction-based crypto gains.", icon: Coins, color: "from-yellow-500 to-orange-500" },
  'biz-vat': { title: "VAT Calculator", desc: "VAT inclusive / exclusive calc.", icon: Receipt, color: "from-blue-600 to-cyan-700" }
};

export default function BusinessStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  const tool = BIZ_TOOLS[initialToolId] || BIZ_TOOLS['biz-compound'];
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    try {
      const v1 = parseFloat(val1);
      const v2 = parseFloat(val2);
      const v3 = parseFloat(val3);

      if (initialToolId === 'biz-percentage') {
         if (val1 && val2) setOutput(`${v2}% of ${v1} = ${(v1 * v2 / 100).toFixed(2)}\nChange: ${(((v2 - v1)/v1)*100).toFixed(2)}%`);
         else setOutput("");
      } else if (initialToolId === 'biz-discount') {
         if (val1 && val2) setOutput(`Original: ${v1}\nDiscount: ${v2}%\nSavings: ${(v1 * (v2/100)).toFixed(2)}\n\nFinal Price: ${(v1 - (v1 * (v2/100))).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-vat') {
         if (val1 && val2) setOutput(`Incl. VAT: ${(v1 * (1 + v2/100)).toFixed(2)}\nExcl. VAT: ${(v1 / (1 + v2/100)).toFixed(2)}\n(Rate: ${v2}%)`);
         else setOutput("");
      } else if (initialToolId === 'biz-margin') {
         if (val1 && val2) setOutput(`Cost: ${v1}\nSale: ${v2}\n\nGross Profit: ${(v2 - v1).toFixed(2)}\nMargin: ${(((v2 - v1) / v2) * 100).toFixed(2)}%\nMarkup: ${(((v2 - v1) / v1) * 100).toFixed(2)}%`);
         else setOutput("");
      } else if (initialToolId === 'biz-roi') {
         if (val1 && val2) setOutput(`Current Value: ${v1}\nCost: ${v2}\n\nNet Profit: ${(v1 - v2).toFixed(2)}\nROI: ${(((v1 - v2) / v2) * 100).toFixed(2)}%`);
         else setOutput("");
      } else if (initialToolId === 'biz-compound') {
         if (val1 && val2 && val3) {
            const P = v1;
            const r = v2 / 100;
            const t = v3;
            const A = P * Math.pow(1 + (r / 12), 12 * t);
            setOutput(`Principal: ${P}\nAnnual Rate: ${v2}%\nYears: ${t}\n\nTotal Value: ${A.toFixed(2)}\nInterest Earned: ${(A - P).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-loan') {
         if (val1 && val2 && val3) {
            const P = v1;
            const r = (v2 / 100) / 12;
            const n = v3;
            if (r === 0) setOutput(`Monthly: ${(P/n).toFixed(2)}\nTotal: ${P}`);
            else {
               const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
               setOutput(`Monthly Payment: ${M.toFixed(2)}\nTotal Repayment: ${(M * n).toFixed(2)}\nTotal Interest: ${(M * n - P).toFixed(2)}`);
            }
         } else setOutput("");
      } else if (initialToolId === 'biz-tip') {
         if (val1 && val2 && val3) {
            const tip = v1 * (v2 / 100);
            const total = v1 + tip;
            setOutput(`Bill: ${v1}\nTotal Tip: ${tip.toFixed(2)}\nGrand Total: ${total.toFixed(2)}\n\nPer Person: ${(total / v3).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-salary') {
         if (val1) {
            const y = v1;
            const a = y / 12;
            const h = y / (52 * 40);
            setOutput(`Annual Gross: ${y.toFixed(2)}\nMonthly Gross: ${a.toFixed(2)}\nHourly (40h/wk): ${h.toFixed(2)}\n\nEst. Monthly Net: ${(a * 0.8).toFixed(2)}`);
         } else setOutput("");
      }
    } catch (e: any) {
      setOutput(`Error: Please enter valid numbers.`);
    }
  }, [val1, val2, val3, initialToolId]);

  const getLabels = () => {
     switch (initialToolId) {
        case 'biz-compound': return ['Principal Amount', 'Annual Rate (%)', 'Time (Years)'];
        case 'biz-loan': return ['Loan Amount', 'Annual Interest (%)', 'Term (Months)'];
        case 'biz-tip': return ['Bill Amount', 'Tip Percentage (%)', 'Number of People'];
        case 'biz-percentage': return ['Main Amount', 'Percentage (%)', null];
        case 'biz-discount': return ['Original Price', 'Discount (%)', null];
        case 'biz-margin': return ['Cost Price', 'Sale Price', null];
        case 'biz-roi': return ['Final Value', 'Investment Cost', null];
        case 'biz-salary': return ['Annual Gross Salary', null, null];
        case 'biz-savings': return ['Goal Amount', 'Current Savings', 'Monthly Contribution'];
        case 'biz-vat': return ['Base Amount', 'VAT Rate (%)', null];
        default: return ['Value 1', 'Value 2', 'Value 3'];
     }
  };

  const labels = getLabels();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950 flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 border-b border-zinc-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br", tool.color)}>
            <tool.icon size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">{tool.title}</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">{tool.desc}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-start mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-50 dark:border-slate-800">
             <h2 className="text-xs uppercase font-black text-zinc-400 tracking-widest flex items-center gap-2">
                <Calculator size={14} /> Parameters
             </h2>
             <button onClick={() => { setVal1(""); setVal2(""); setVal3(""); }} className="p-2 hover:bg-red-50 text-red-500 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                <Trash2 size={20} />
             </button>
          </div>

          <div className="flex flex-col gap-8">
             <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">{labels[0]}</label>
                <input type="number" 
                  className="bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-5 text-zinc-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-xl"
                  placeholder="0.00" value={val1} onChange={e => setVal1(e.target.value)} />
             </div>
             {labels[1] && (
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">{labels[1]}</label>
                  <input type="number" 
                    className="bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-5 text-zinc-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-xl"
                    placeholder="0.00" value={val2} onChange={e => setVal2(e.target.value)} />
               </div>
             )}
             {labels[2] && (
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">{labels[2]}</label>
                  <input type="number" 
                    className="bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-5 text-zinc-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-xl"
                    placeholder="0.00" value={val3} onChange={e => setVal3(e.target.value)} />
               </div>
             )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-slate-800 shadow-2xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-50 dark:border-slate-800">
             <h2 className="text-xs uppercase font-black text-zinc-400 tracking-widest flex items-center gap-2">
                <BarChart3 size={14} /> Result Analysis
             </h2>
             <button onClick={handleCopy} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-500/30">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
             </button>
          </div>
          <div className="flex-1 w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-3xl p-8 text-blue-600 dark:text-blue-400 font-mono text-xl overflow-auto whitespace-pre-wrap leading-relaxed flex items-center justify-center text-center shadow-inner">
            {output ? (
              <div className="w-full text-left font-black text-3xl tracking-tight leading-snug">{output}</div>
            ) : (
              <span className="text-zinc-400 italic text-base font-medium">Calculation results will appear here instantly.</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
