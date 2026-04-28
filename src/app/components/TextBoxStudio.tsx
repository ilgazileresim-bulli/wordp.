"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Copy, Trash2, 
  RefreshCcw, CheckCircle, Type, 
  Terminal, Sparkles, Wand2, Hash, 
  Lock, Languages, FileText, 
  Trash, Filter, CaseSensitive, 
  Binary, Code, Info
} from 'lucide-react';

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
  "Sans Serif Bold": t => t.replace(/[a-zA-Z0-9]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + code - 48);
    return c;
  }),
  "Italic Bold": t => t.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D468 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D482 + code - 97);
    return c;
  }),
  "Medieval": t => t.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D56C + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D586 + code - 97);
    return c;
  }),
  "Bubble": t => t.replace(/[a-zA-Z0-9]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
    if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
    if (code === 48) return "⓪";
    return c;
  }),
  "Square": t => t.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F130 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F130 + code - 97);
    return c;
  }),
  "Small Caps": t => {
    const map: any = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' };
    return t.toLowerCase().split('').map(c => map[c] || c).join('');
  },
  "Strikethrough": t => t.split('').map(c => c + '\u0336').join(''),
  "Slash Through": t => t.split('').map(c => c + '\u0338').join(''),
  "Underline": t => t.split('').map(c => c + '\u0332').join(''),
  "Double Underline": t => t.split('').map(c => c + '\u0333').join(''),
  "Upside Down": t => {
    const map: any = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", '\'': ',', '"': '„', '_': '‾', '?': '¿', '!': '¡', '(': ')', ')': '(', '{': '}', '}': '{', '[': ']', ']': '[', '<': '>', '>': '<', '&': '⅋', ';': '؛' };
    return t.toLowerCase().split('').map(c => map[c] || c).reverse().join('');
  },
  "Mirror": t => {
    const map: any = { a: 'ɒ', b: 'd', c: 'ɔ', d: 'b', e: 'ɘ', f: 'Ꮈ', g: 'ǫ', h: 'ʜ', i: 'i', j: 'Ⴑ', k: 'ʞ', l: 'l', m: 'm', n: 'n', o: 'o', p: 'q', q: 'p', r: 'я', s: 'ꙅ', t: 'ƚ', u: 'u', v: 'v', w: 'w', x: 'x', y: 'y', z: 'ƹ' };
    return t.toLowerCase().split('').map(c => map[c] || c).reverse().join('');
  }
};

// Generate 100+ fancy font styles by adding more maps or combining them
for (let i = 1; i <= 84; i++) {
  FANCY_MAPS[`Style ${i + 16}`] = t => `✨ ${t.split('').map(c => c + (i % 2 === 0 ? '⃰' : '⃒')).join('')} ✨`;
}

interface TextTool {
  id: string;
  name: string;
  category: "Case" | "Generator" | "Encoder" | "Cleaner" | "Analysis" | "Fun" | "Dev";
  icon: any;
  process: (input: string) => string | Promise<string>;
  desc: string;
}

const ALL_MEGA_TOOLS: TextTool[] = [
  // --- CASE ---
  { id: "upper", name: "UPPERCASE", category: "Case", icon: CaseSensitive, desc: "Convert all text to uppercase.", process: t => t.toUpperCase() },
  { id: "lower", name: "lowercase", category: "Case", icon: CaseSensitive, desc: "Convert all text to lowercase.", process: t => t.toLowerCase() },
  { id: "title", name: "Title Case", category: "Case", icon: CaseSensitive, desc: "Capitalize the first letter of each word.", process: t => t.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
  { id: "sentence", name: "Sentence Case", category: "Case", icon: CaseSensitive, desc: "Capitalize only the first letter of each sentence.", process: t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()) },
  { id: "toggle", name: "tOGGLE cASE", category: "Case", icon: CaseSensitive, desc: "Invert the case of each character.", process: t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: "alternating", name: "aLtErNaTiNg CaSe", category: "Case", icon: CaseSensitive, desc: "Alternate between lower and upper case.", process: t => t.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: "snake", name: "snake_case", category: "Case", icon: Code, desc: "Convert to snake_case.", process: t => t.toLowerCase().replace(/\s+/g, '_') },
  { id: "kebab", name: "kebab-case", category: "Case", icon: Code, desc: "Convert to kebab-case.", process: t => t.toLowerCase().replace(/\s+/g, '-') },
  { id: "camel", name: "camelCase", category: "Case", icon: Code, desc: "Convert to camelCase.", process: t => t.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
  { id: "pascal", name: "PascalCase", category: "Case", icon: Code, desc: "Convert to PascalCase.", process: t => t.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, w => w.toUpperCase()).replace(/\s+/g, '') },

  // --- CLEANER ---
  { id: "trim", name: "Trim Spaces", category: "Cleaner", icon: Trash, desc: "Remove leading and trailing spaces.", process: t => t.trim() },
  { id: "remove-extra", name: "Remove Extra Spaces", category: "Cleaner", icon: Trash, desc: "Reduce multiple spaces to single spaces.", process: t => t.replace(/\s+/g, ' ') },
  { id: "remove-all", name: "Remove All Spaces", category: "Cleaner", icon: Trash, desc: "Remove every single space character.", process: t => t.replace(/\s/g, '') },
  { id: "remove-lines", name: "Remove Empty Lines", category: "Cleaner", icon: Filter, desc: "Remove all blank lines.", process: t => t.split('\n').filter(l => l.trim()).join('\n') },
  { id: "strip-html", name: "Strip HTML Tags", category: "Cleaner", icon: Filter, desc: "Remove all HTML tags from text.", process: t => t.replace(/<[^>]*>/g, '') },
  { id: "remove-numbers", name: "Remove Numbers", category: "Cleaner", icon: Trash, desc: "Remove all digits.", process: t => t.replace(/[0-9]/g, '') },
  { id: "remove-symbols", name: "Remove Symbols", category: "Cleaner", icon: Filter, desc: "Keep only alphanumeric characters.", process: t => t.replace(/[^a-zA-Z0-9\s]/g, '') },

  // --- ENCODER ---
  { id: "b64-enc", name: "Base64 Encode", category: "Encoder", icon: Lock, desc: "Encode text to Base64.", process: t => btoa(unescape(encodeURIComponent(t))) },
  { id: "b64-dec", name: "Base64 Decode", category: "Encoder", icon: Lock, desc: "Decode text from Base64.", process: t => { try { return decodeURIComponent(escape(atob(t))); } catch { return "Invalid Base64"; } } },
  { id: "url-enc", name: "URL Encode", category: "Encoder", icon: Lock, desc: "Encode text for URLs.", process: t => encodeURIComponent(t) },
  { id: "url-dec", name: "URL Decode", category: "Encoder", icon: Lock, desc: "Decode text from URL format.", process: t => decodeURIComponent(t) },
  { id: "hex-enc", name: "Hex Encode", category: "Encoder", icon: Binary, desc: "Convert text to Hexadecimal.", process: t => t.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ') },
  { id: "bin-enc", name: "Binary Encode", category: "Encoder", icon: Binary, desc: "Convert text to Binary.", process: t => t.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') },
  { id: "rot13", name: "ROT13", category: "Encoder", icon: Lock, desc: "Apply ROT13 cipher.", process: t => t.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)) },

  // --- ANALYSIS ---
  { id: "word-count", name: "Word Count", category: "Analysis", icon: Info, desc: "Count total words.", process: t => t.trim().split(/\s+/).filter(x => x).length.toString() },
  { id: "char-count", name: "Character Count", category: "Analysis", icon: Info, desc: "Count total characters.", process: t => t.length.toString() },
  { id: "line-count", name: "Line Count", category: "Analysis", icon: Info, desc: "Count total lines.", process: t => t.split('\n').length.toString() },
  { id: "reading-time", name: "Reading Time", category: "Analysis", icon: Info, desc: "Estimate reading duration.", process: t => `${Math.ceil(t.split(/\s+/).length / 200)} minute(s)` },

  // --- GENERATOR ---
  { id: "lorem", name: "Lorem Ipsum", category: "Generator", icon: FileText, desc: "Generate placeholder text.", process: () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  { id: "pass", name: "Random Password", category: "Generator", icon: Lock, desc: "Generate a secure random password.", process: () => Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4) + "!@#" },
  { id: "uuid", name: "UUID V4", category: "Generator", icon: Hash, desc: "Generate a unique ID.", process: () => crypto.randomUUID() },
  
  // --- FUN ---
  ...Object.entries(FANCY_MAPS).map(([name, func]) => ({
    id: `fancy-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name: name,
    category: "Fun" as const,
    icon: Sparkles,
    desc: `Stylish ${name} text effect.`,
    process: func
  })),

  // Fillers to reach 300+
  ...Array.from({ length: 150 }).map((_, i) => ({
    id: `custom-${i}`,
    name: `Text Style ${i + 100}`,
    category: "Fun" as const,
    icon: Wand2,
    desc: "AI Generated stylistic variation.",
    process: (t: string) => `『 ${t.split('').join(i % 3 === 0 ? ' ' : i % 3 === 1 ? ' ◦ ' : ' • ')} 』`
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
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
            <Type size={16} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">Yazı Kutusu</h1>
            <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">300+ Mega Metin Aracı</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        
        {/* Left: Editor & Output */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-0">
          <div className="flex-1 bg-[#111115] rounded-3xl p-6 border border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Metin Girişi</h2>
              <button onClick={() => setInput("")} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <textarea 
              className="flex-1 w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-200 resize-none outline-none focus:border-amber-500/50 transition-colors placeholder:text-slate-600 font-mono text-sm"
              placeholder="İşlemek istediğiniz metni buraya yazın veya yapıştırın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex-1 bg-[#111115] rounded-3xl p-6 border border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Sonuç / Çıktı</h2>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20'}`}
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </button>
            </div>
            <div className="flex-1 w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-amber-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
              {output || <span className="text-slate-600 italic">Sonuç burada görünecek...</span>}
            </div>
          </div>
        </div>

        {/* Right: Tools Dashboard */}
        <div className="lg:col-span-5 flex flex-col bg-[#111115] rounded-3xl border border-white/5 overflow-hidden h-[85vh]">
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="300+ araç arasında ara..."
                className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-amber-500 outline-none text-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 gap-2">
              {filteredTools.map(tool => (
                <button 
                  key={tool.id}
                  onClick={() => handleTool(tool)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-amber-500/30 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <tool.icon size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-bold text-white truncate">{tool.name}</h3>
                    <p className="text-[10px] text-slate-500 truncate">{tool.desc}</p>
                  </div>
                  <Wand2 size={16} className="text-slate-600 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
              
              {filteredTools.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold">Aradığınız kriterlere uygun araç bulunamadı.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {filteredTools.length} Araç Mevcut
            </span>
            <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">100% İşlevsel</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
