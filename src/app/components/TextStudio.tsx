"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Trash2, Volume2, SearchCode, Type, CheckCircle, RefreshCcw, Download, Sparkles, Languages, Zap, FileText, AlignLeft, Binary, Hash } from 'lucide-react';
import { cn } from "./editor/utils";

const TOOLS: Record<string, { title: string; desc: string; icon: any; process?: (t: string) => string }> = {
  'word-counter': { title: "Word Counter", desc: "Count words, chars and lines.", icon: AlignLeft },
  'case-converter': { title: "Case Converter", desc: "Change text letter cases.", icon: Type, process: t => t.toUpperCase() },
  'lorem-ipsum': { title: "Lorem Ipsum", desc: "Generate placeholder text.", icon: FileText },
  'text-diff': { title: "Text Diff", desc: "Compare two text versions.", icon: SearchCode },
  'fancy-text': { title: "Fancy Text", desc: "Stylish fonts for social media.", icon: Sparkles },
  'text-cleaner': { 
    title: "Text Cleaner", 
    desc: "Remove extra spaces & debris.", 
    icon: Trash2,
    process: t => t.replace(/\s+/g, ' ').trim() 
  },
  'invisible-text': { title: "Invisible Text", desc: "Zero-width space generator.", icon: EyeOff },
  'slug-generator': { 
    title: "Slug Generator", 
    desc: "URL-friendly slug creation.", 
    icon: Link,
    process: t => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') 
  },
  'binary-converter': { 
    title: "Binary Converter", 
    desc: "Convert text to Binary/ASCII.", 
    icon: Binary,
    process: t => t.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') 
  },
  'reverse-text': { 
    title: "Reverse Text", 
    desc: "Flip your text backwards.", 
    icon: RefreshCcw,
    process: t => t.split('').reverse().join('') 
  },
  'remove-duplicates': { 
    title: "Remove Duplicates", 
    desc: "Clear identical lines/words.", 
    icon: Trash2,
    process: t => Array.from(new Set(t.split('\n'))).join('\n') 
  },
  'text-repeater': { title: "Text Repeater", desc: "Multiply text thousands of times.", icon: Zap },
  'zalgo-text': { title: "Zalgo Text", desc: "Creepy/Glitchy text effect.", icon: Hash },
  'text-to-speech': { title: "Text to Speech", desc: "Read your text out loud.", icon: Volume2 },
  'translator': { title: "AI Translator", desc: "Translate into 100+ languages.", icon: Languages }
};

// Need to import EyeOff and Link for the icons
import { EyeOff, Link } from 'lucide-react';

export default function TextStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  const tool = TOOLS[initialToolId] || TOOLS['word-counter'];
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [repeatCount, setRepeatCount] = useState(5);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [conversionType, setConversionType] = useState<"upper" | "lower" | "title" | "sentence" | "alternating">("upper");

  useEffect(() => {
    if (tool.process && initialToolId !== 'text-diff' && initialToolId !== 'text-repeater' && initialToolId !== 'fancy-text' && initialToolId !== 'zalgo-text' && initialToolId !== 'case-converter') {
      setOutput(tool.process(input1));
    }
  }, [input1, tool, initialToolId]);

  useEffect(() => {
    if (initialToolId === 'word-counter') {
       setOutput(`Words: ${input1.trim().split(/\s+/).filter(x => x).length}\nCharacters: ${input1.length}\nLines: ${input1.split('\n').length}`);
    } else if (initialToolId === 'case-converter') {
       if (conversionType === "upper") setOutput(input1.toUpperCase());
       if (conversionType === "lower") setOutput(input1.toLowerCase());
       if (conversionType === "title") setOutput(input1.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
       if (conversionType === "sentence") setOutput(input1.toLowerCase().replace(/(^\s*\w|[.?!]\s*\w)/g, c => c.toUpperCase()));
       if (conversionType === "alternating") setOutput(input1.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''));
    } else if (initialToolId === 'text-diff') {
       const p1 = input1.split('\n');
       const p2 = input2.split('\n');
       let res = '';
       const maxLen = Math.max(p1.length, p2.length);
       for(let i=0; i<maxLen; i++) {
          const l1 = p1[i] || '';
          const l2 = p2[i] || '';
          if (l1 === l2) res += `  = ${l1}\n`;
          else {
             if (l1) res += `  - ${l1}\n`;
             if (l2) res += `  + ${l2}\n`;
          }
       }
       setOutput(res);
    } else if (initialToolId === 'lorem-ipsum') {
       const lor = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ";
       setOutput(lor.repeat(repeatCount));
    } else if (initialToolId === 'text-repeater') {
       if (input1) setOutput((input1 + '\n').repeat(repeatCount));
       else setOutput('');
    } else if (initialToolId === 'fancy-text') {
       const f1 = input1.split('').map(c => String.fromCharCode(c.charCodeAt(0) + (c >= 'a' && c <= 'z' ? 119919 : c >= 'A' && c <= 'Z' ? 119951 : 0))).join('');
       const f2 = input1.split('').map(c => String.fromCharCode(c.charCodeAt(0) + (c >= 'a' && c <= 'z' ? 120489 : c >= 'A' && c <= 'Z' ? 120521 : 0))).join('');
       setOutput(input1 ? `${f1}\n\n${f2}` : '');
    } else if (initialToolId === 'zalgo-text') {
       const zalgoChars = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0301', '\u0340', '\u0300', '\u0341', '\u030f', '\u0312', '\u0313', '\u034a', '\u033c', '\u034b', '\u034c', '\u0330', '\u0318', '\u0319', '\u0320', '\u0324', '\u032a'];
       const res = input1.split('').map(c => {
         let r = c;
         for(let i=0; i<3; i++) r += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
         return r;
       }).join('');
       setOutput(res);
    } else if (initialToolId === 'invisible-text') {
       setOutput(input1 + '\u200B\u200C\u200D\uFEFF');
    }
  }, [input1, input2, initialToolId, repeatCount, conversionType]);

  const handleTranslate = async () => {
    if (!input1.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(input1)}&langpair=${sourceLang}|${targetLang}`);
      const data = await res.json();
      if (data.responseData.translatedText) {
        setOutput(data.responseData.translatedText);
      } else {
        setOutput("Translation error occurred.");
      }
    } catch (err) {
      setOutput("Connection error: Could not translate.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(input1);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950 flex flex-col font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="h-20 border-b border-zinc-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600")}>
            <tool.icon size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight">{tool.title}</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">{tool.desc}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* Left Side: Input */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-slate-800 flex flex-col h-[75vh] shadow-xl">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xs uppercase font-black text-zinc-400 tracking-wider flex items-center gap-2">
                <AlignLeft size={14} /> Input
             </h2>
             <button onClick={() => setInput1("")} className="p-2 hover:bg-red-50 text-red-500 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Clear">
                <Trash2 size={18} />
             </button>
          </div>
          
          {initialToolId === 'text-diff' ? (
             <div className="flex-1 flex flex-col gap-4">
                <textarea 
                  className="flex-1 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 text-zinc-900 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400"
                  placeholder="Original text..."
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                />
                <textarea 
                  className="flex-1 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 text-zinc-900 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400"
                  placeholder="Modified text to compare..."
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                />
             </div>
          ) : (
            <textarea 
              className="flex-1 w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 text-zinc-900 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400 text-lg font-medium"
              placeholder="Type or paste your text here..."
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          )}

          {/* Special Controls */}
          <div className="mt-6 space-y-4">
            {initialToolId === 'case-converter' && (
              <div className="flex flex-wrap gap-2">
                {(["upper", "lower", "title", "sentence", "alternating"] as const).map(type => (
                  <button 
                    key={type} 
                    onClick={() => setConversionType(type)}
                    className={cn(
                      "flex-1 min-w-[100px] text-[10px] font-black py-3 rounded-xl border transition-all uppercase tracking-wider",
                      conversionType === type 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' 
                        : 'bg-zinc-100 dark:bg-slate-800 text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {(initialToolId === 'lorem-ipsum' || initialToolId === 'text-repeater' || initialToolId === 'random-string') && (
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-slate-950 p-4 rounded-2xl border border-zinc-200 dark:border-slate-800">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount:</label>
                 <input type="range" min="1" max="100" value={repeatCount} onChange={(e) => setRepeatCount(parseInt(e.target.value))} className="flex-1 accent-blue-600" />
                 <span className="text-xs font-black bg-blue-600 text-white px-3 py-1 rounded-lg">{repeatCount}</span>
              </div>
            )}

            {initialToolId === 'translator' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="flex-1 bg-zinc-100 dark:bg-slate-800 border-none rounded-xl p-4 text-xs font-black text-zinc-600 dark:text-zinc-300 outline-none">
                    <option value="auto">Detect Language</option>
                    <option value="tr">Turkish</option>
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                  <ArrowLeft className="text-zinc-400 rotate-180" size={16} />
                  <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="flex-1 bg-zinc-100 dark:bg-slate-800 border-none rounded-xl p-4 text-xs font-black text-zinc-600 dark:text-zinc-300 outline-none">
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <button 
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isTranslating ? <RefreshCcw size={18} className="animate-spin" /> : <Languages size={18} />}
                  {isTranslating ? "Translating..." : "Translate Text Now"}
                </button>
              </div>
            )}

            {initialToolId === 'text-to-speech' && (
              <button 
                onClick={handleSpeak}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all shadow-xl",
                  isSpeaking 
                    ? 'bg-red-500 text-white shadow-red-500/30' 
                    : 'bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white shadow-zinc-900/30'
                )}
              >
                {isSpeaking ? <RefreshCcw size={18} className="animate-spin" /> : <Volume2 size={18} />}
                {isSpeaking ? "Stop Playback" : "Read Text Aloud"}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-slate-800 flex flex-col h-[75vh] shadow-xl">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xs uppercase font-black text-zinc-400 tracking-wider flex items-center gap-2">
                <Zap size={14} /> Output
             </h2>
             <button onClick={handleCopy} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all", copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30')}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Result'}
             </button>
          </div>
          <div className="flex-1 w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-3xl p-8 text-blue-600 dark:text-blue-400 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed">
            {output || <span className="text-zinc-400 italic">Magic happens here...</span>}
          </div>
        </div>

      </main>
    </div>
  );
}
