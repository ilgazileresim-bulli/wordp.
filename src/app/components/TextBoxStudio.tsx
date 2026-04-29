"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Copy, Trash2, 
  CheckCircle, Type, 
  Sparkles, Wand2, Hash, 
  Lock, Binary, CaseSensitive, 
  Code, Info, Layers, Zap, Loader2
} from 'lucide-react';
import { cn } from "./editor/utils";

// --- Fancy Font Maps ---
const FANCY_MAPS: Record<string, (t: string) => string> = {
  "Fullwidth": t => t.split('').map(c => {
    const code = c.charCodeAt(0);
    return (code >= 33 && code <= 126) ? String.fromCharCode(code + 65248) : c;
  }).join(''),
  "Monospace": t => t.replace(/[a-zA-Z0-9]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + code - 48);
    return c;
  }),
  "Double Struck": t => t.replace(/[a-zA-Z0-9]/g, c => {
    const code = c.charCodeAt(0);
    if (code === 67) return "ℂ"; if (code === 72) return "ℍ"; if (code === 78) return "ℕ"; if (code === 80) return "ℙ"; if (code === 81) return "ℚ"; if (code === 82) return "ℝ"; if (code === 90) return "ℤ";
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D538 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D552 + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7D8 + code - 48);
    return c;
  }),
  "Script Bold": t => t.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D4D0 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D4EA + code - 97);
    return c;
  }),
  "Fraktur": t => t.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D504 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D51E + code - 97);
    return c;
  }),
  "Upside Down": t => {
    const map: any = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", '\'': ',', '"': '„', '_': '‾', '?': '¿', '!': '¡', '(': ')', ')': '(', '{': '}', '}': '{', '[': ']', ']': '[', '<': '>', '>': '<', '&': '⅋', ';': '؛' };
    return t.toLowerCase().split('').map(c => map[c] || c).reverse().join('');
  },
  "Small Caps": t => {
    const map: any = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' };
    return t.toLowerCase().split('').map(c => map[c] || c).join('');
  }
};

interface TextTool {
  id: string;
  name: string;
  category: "Case" | "Generator" | "Encoder" | "Cleaner" | "Analysis" | "Fun";
  icon: any;
  process: (input: string) => string | Promise<string>;
  desc: string;
}

const ALL_MEGA_TOOLS: TextTool[] = [
  { id: "upper", name: "UPPERCASE", category: "Case", icon: CaseSensitive, desc: "Convert all text to uppercase.", process: t => t.toUpperCase() },
  { id: "lower", name: "lowercase", category: "Case", icon: CaseSensitive, desc: "Convert all text to lowercase.", process: t => t.toLowerCase() },
  { id: "title", name: "Title Case", category: "Case", icon: CaseSensitive, desc: "Capitalize the first letter of each word.", process: t => t.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
  { id: "sentence", name: "Sentence Case", category: "Case", icon: CaseSensitive, desc: "Capitalize only the first letter of each sentence.", process: t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()) },
  { id: "toggle", name: "tOGGLE cASE", category: "Case", icon: CaseSensitive, desc: "Invert the case of each character.", process: t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: "snake", name: "snake_case", category: "Case", icon: Code, desc: "Convert to snake_case.", process: t => t.toLowerCase().replace(/\s+/g, '_') },
  { id: "kebab", name: "kebab-case", category: "Case", icon: Code, desc: "Convert to kebab-case.", process: t => t.toLowerCase().replace(/\s+/g, '-') },
  { id: "camel", name: "camelCase", category: "Case", icon: Code, desc: "Convert to camelCase.", process: t => t.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },

  { id: "trim", name: "Trim Spaces", category: "Cleaner", icon: Trash2, desc: "Remove leading and trailing spaces.", process: t => t.trim() },
  { id: "remove-extra", name: "Remove Extra Spaces", category: "Cleaner", icon: Trash2, desc: "Reduce multiple spaces to single spaces.", process: t => t.replace(/\s+/g, ' ') },
  { id: "strip-html", name: "Strip HTML Tags", category: "Cleaner", icon: Code, desc: "Remove all HTML tags from text.", process: t => t.replace(/<[^>]*>/g, '') },

  { id: "b64-enc", name: "Base64 Encode", category: "Encoder", icon: Lock, desc: "Encode text to Base64.", process: t => btoa(unescape(encodeURIComponent(t))) },
  { id: "b64-dec", name: "Base64 Decode", category: "Encoder", icon: Lock, desc: "Decode text from Base64.", process: t => { try { return decodeURIComponent(escape(atob(t))); } catch { return "Invalid Base64"; } } },
  { id: "url-enc", name: "URL Encode", category: "Encoder", icon: Lock, desc: "Encode text for URLs.", process: t => encodeURIComponent(t) },
  { id: "url-dec", name: "URL Decode", category: "Encoder", icon: Lock, desc: "Decode text from URL format.", process: t => decodeURIComponent(t) },

  { id: "word-count", name: "Word Count", category: "Analysis", icon: Info, desc: "Count total words.", process: t => t.trim().split(/\s+/).filter(x => x).length.toString() },
  { id: "char-count", name: "Character Count", category: "Analysis", icon: Info, desc: "Count total characters.", process: t => t.length.toString() },
  { id: "line-count", name: "Line Count", category: "Analysis", icon: Info, desc: "Count total lines.", process: t => t.split('\n').length.toString() },

  { id: "lorem", name: "Lorem Ipsum", category: "Generator", icon: Layers, desc: "Generate placeholder text.", process: () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
  { id: "pass", name: "Random Password", category: "Generator", icon: Lock, desc: "Generate a secure random password.", process: () => Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4) + "!@#" },
  { id: "uuid", name: "UUID V4", category: "Generator", icon: Hash, desc: "Generate a unique ID.", process: () => crypto.randomUUID() },
  
  ...Object.entries(FANCY_MAPS).map(([name, func]) => ({
    id: `fancy-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name: name,
    category: "Fun" as const,
    icon: Sparkles,
    desc: `Stylish ${name} text effect.`,
    process: func
  }))
];

export default function TextBoxStudio({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredTools = useMemo(() => {
    return ALL_MEGA_TOOLS.filter(tool => 
      (activeCategory === "All" || tool.category === activeCategory) &&
      (tool.name.toLowerCase().includes(search.toLowerCase()) || tool.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, activeCategory]);

  const handleTool = async (tool: TextTool) => {
    const result = await tool.process(input);
    setOutput(result);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ["All", "Case", "Cleaner", "Encoder", "Analysis", "Generator", "Fun"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
            <Type size={24} />
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Text Box Studio</h1>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black tracking-widest uppercase">Multi-purpose Text Processor</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
        
        <div className="lg:col-span-7 flex flex-col gap-8 h-full min-h-0">
          <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={14} /> Text Input
              </h2>
              <button onClick={() => setInput("")} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
            <textarea 
              className="flex-1 w-full bg-zinc-50 dark:bg-black/40 border-none rounded-3xl p-6 text-zinc-900 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-mono text-sm leading-relaxed shadow-inner"
              placeholder="Paste your text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} /> Output Buffer
              </h2>
              <button 
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                  copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-amber-600 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                )}
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 w-full bg-zinc-50 dark:bg-black/40 border-none rounded-3xl p-6 text-amber-600 dark:text-amber-400 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {output || <span className="text-zinc-400 italic font-medium">Result will appear here...</span>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 overflow-hidden h-[80vh] shadow-2xl">
          <div className="p-8 border-b border-zinc-100 dark:border-white/5 space-y-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search tools..."
                className="w-full bg-zinc-50 dark:bg-black/60 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20 text-zinc-900 dark:text-white transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeCategory === cat ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 gap-3">
              {filteredTools.map(tool => (
                <button 
                  key={tool.id}
                  onClick={() => handleTool(tool)}
                  className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-50 dark:bg-black/40 border border-transparent hover:border-amber-500/30 hover:bg-white dark:hover:bg-white/5 transition-all text-left group shadow-sm active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-amber-500 shadow-lg group-hover:scale-110 transition-transform">
                    <tool.icon size={24} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{tool.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium truncate">{tool.desc}</p>
                  </div>
                  <Wand2 size={18} className="text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-12" />
                </button>
              ))}
              
              {filteredTools.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                  <Search size={64} className="mb-6 opacity-10" />
                  <p className="text-sm font-black uppercase tracking-widest">No tools found</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between px-8">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {filteredTools.length} Processors Loaded
            </span>
            <div className="flex items-center gap-2">
               <Loader2 size={14} className="text-emerald-500 animate-spin" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Ready</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
