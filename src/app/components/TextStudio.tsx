"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Trash2, Volume2, SearchCode, Type, CheckCircle, RefreshCcw, Download } from 'lucide-react';

const TOOLS: Record<string, { title: string; desc: string; process?: (t: string) => string }> = {
  'word-counter': { title: "Kelime Sayacı", desc: "Metninizdeki kelime ve karakterleri sayın." },
  'case-converter': { title: "Büyük/Küçük Harf Dönüştürücü", desc: "Metnin harf büyüklüğünü değiştirin.", process: t => t.toUpperCase() },
  'lorem-ipsum': { title: "Lorem İpsum", desc: "Zaman kazanmak için sahte metin oluşturun." },
  'text-diff': { title: "Metin Farkı", desc: "İki metin varyasyonu arasındaki farkı bulun." },
  'fancy-text': { title: "Şık Metin", desc: "Harfleri sosyal medya için şık fontlara dönüştürün." },
  'text-cleaner': { 
    title: "Metin Temizleyici", 
    desc: "Ekstra boşlukları ve gereksiz karakterleri temizleyin.", 
    process: t => t.replace(/\\s+/g, ' ').trim() 
  },
  'invisible-text': { title: "Görünmez Metin", desc: "Kopyalanabilir sıfır genişlikli boşluklar." },
  'slug-generator': { 
    title: "Slug Üretici", 
    desc: "Başlıkları URL dostu slug formatına çevirin.", 
    process: t => t.toLowerCase().trim().replace(/[^\\w\\s-]/g, '').replace(/[\\s_-]+/g, '-').replace(/^-+|-+$/g, '') 
  },
  'binary-converter': { 
    title: "İkili Dönüştürücü", 
    desc: "Metni Binary'ye çevirin.", 
    process: t => t.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') 
  },
  'reverse-text': { 
    title: "Metni Ters Çevir", 
    desc: "Tüm metni tersten yazdırın.", 
    process: t => t.split('').reverse().join('') 
  },
  'remove-duplicates': { 
    title: "Yinelenenleri Kaldır", 
    desc: "Aynı satırları/kelimeleri silin.", 
    process: t => Array.from(new Set(t.split('\\n'))).join('\\n') 
  },
  'text-repeater': { title: "Metin Tekrarlayıcı", desc: "Aynı metni binlerce kez çoğaltın." },
  'zalgo-text': { title: "Zalgo Metni", desc: "Korkunç/Lanetli görünümlü metin efekti." },
  'sort-lines': { 
    title: "Satırları Sırala", 
    desc: "Tüm satırları alfabetik sıraya dizin.", 
    process: t => t.split('\\n').sort().join('\\n') 
  },
  'character-counter': { title: "Karakter Sayacı", desc: "Sadece karakter odaklı sayım." },
  'random-string': { title: "Rastgele Dize", desc: "Rastgele şifre veya metin dizeleri üretin." },
  'text-to-speech': { title: "Metinden Sese", desc: "Yazdıklarınızı sesli okutun." },
  'translator': { title: "AI Çevirmen", desc: "Metni 100+ dile anında çevirin." }
};


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

  // Auto processing for basic tools
  useEffect(() => {
    if (tool.process && initialToolId !== 'text-diff' && initialToolId !== 'text-repeater' && initialToolId !== 'fancy-text' && initialToolId !== 'zalgo-text' && initialToolId !== 'case-converter') {
      setOutput(tool.process(input1));
    }
  }, [input1, tool, initialToolId]);

  // Special processing logic
  useEffect(() => {
    if (initialToolId === 'word-counter' || initialToolId === 'character-counter') {
       setOutput(`Words: ${input1.trim().split(/\\s+/).filter(x => x).length}\\nCharacters: ${input1.length}\\nLines: ${input1.split('\\n').length}`);
    } else if (initialToolId === 'case-converter') {
       if (conversionType === "upper") setOutput(input1.toUpperCase());
       if (conversionType === "lower") setOutput(input1.toLowerCase());
       if (conversionType === "title") setOutput(input1.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
       if (conversionType === "sentence") setOutput(input1.toLowerCase().replace(/(^\\s*\\w|[\\.?!]\\s*\\w)/g, c => c.toUpperCase()));
       if (conversionType === "alternating") setOutput(input1.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''));
    } else if (initialToolId === 'text-diff') {
       // Simple diff mechanism
       const p1 = input1.split('\\n');
       const p2 = input2.split('\\n');
       let res = '';
       const maxLen = Math.max(p1.length, p2.length);
       for(let i=0; i<maxLen; i++) {
          const l1 = p1[i] || '';
          const l2 = p2[i] || '';
          if (l1 === l2) res += `  = ${l1}\\n`;
          else {
             if (l1) res += `  - ${l1}\\n`;
             if (l2) res += `  + ${l2}\\n`;
          }
       }
       setOutput(res);
    } else if (initialToolId === 'lorem-ipsum') {
       const lor = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";
       setOutput(lor.repeat(repeatCount));
    } else if (initialToolId === 'text-repeater') {
       if (input1) setOutput((input1 + '\\n').repeat(repeatCount));
       else setOutput('');
    } else if (initialToolId === 'fancy-text') {
       const f1 = input1.split('').map(c => String.fromCharCode(c.charCodeAt(0) + (c >= 'a' && c <= 'z' ? 119919 : c >= 'A' && c <= 'Z' ? 119951 : 0))).join('');
       const f2 = input1.split('').map(c => String.fromCharCode(c.charCodeAt(0) + (c >= 'a' && c <= 'z' ? 120489 : c >= 'A' && c <= 'Z' ? 120521 : 0))).join('');
       setOutput(input1 ? `${f1}\\n\\n${f2}` : '');
    } else if (initialToolId === 'zalgo-text') {
       const zalgoChars = ['\\u030d', '\\u030e', '\\u0304', '\\u0305', '\\u033f', '\\u0311', '\\u0306', '\\u0310', '\\u0352', '\\u0357', '\\u0351', '\\u0301', '\\u0340', '\\u0300', '\\u0341', '\\u030f', '\\u0312', '\\u0313', '\\u034a', '\\u033c', '\\u034b', '\\u034c', '\\u0330', '\\u0318', '\\u0319', '\\u0320', '\\u0324', '\\u032a'];
       const res = input1.split('').map(c => {
         let r = c;
         for(let i=0; i<3; i++) Object.keys(zalgoChars).length; r += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
         return r;
       }).join('');
       setOutput(res);
    } else if (initialToolId === 'random-string') {
       const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
       let res = '';
       for(let i=0; i<Math.min(repeatCount * 10, 5000); i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
       setOutput(res);
    } else if (initialToolId === 'invisible-text') {
       setOutput(input1 + '\u200B\u200C\u200D\uFEFF');
    }
  }, [input1, input2, initialToolId, repeatCount]);

  const handleTranslate = async () => {
    if (!input1.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(input1)}&langpair=${sourceLang}|${targetLang}`);
      const data = await res.json();
      if (data.responseData.translatedText) {
        setOutput(data.responseData.translatedText);
      } else {
        setOutput("Çeviri hatası oluştu.");
      }
    } catch (err) {
      setOutput("Bağlantı hatası: Çeviri yapılamadı.");
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
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
            <Type size={16} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">{tool.title}</h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">{tool.desc}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        
        {/* Left Side: Input */}
        <div className="bg-[#111115] rounded-3xl p-6 border border-white/5 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Input</h2>
             <button onClick={() => setInput1("")} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Clear">
                <Trash2 size={16} />
             </button>
          </div>
          {initialToolId === 'text-diff' ? (
             <div className="flex-1 flex flex-col gap-4">
                <textarea 
                  className="flex-1 min-h-[100px] bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-200 resize-none outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                  placeholder="Original text..."
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                />
                <textarea 
                  className="flex-1 min-h-[100px] bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-200 resize-none outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
                  placeholder="Modified text to compare..."
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                />
             </div>
          ) : (
            <textarea 
              className="flex-1 w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-200 resize-none outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
              placeholder="Type or paste your text here..."
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          )}

          {/* Controls specifically for case converter */}
          {initialToolId === 'case-converter' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
               {(["upper", "lower", "title", "sentence", "alternating"] as const).map(type => (
                 <button 
                   key={type} 
                   onClick={() => setConversionType(type)}
                   className={`flex-1 min-w-[80px] text-xs font-bold py-2 rounded-lg border transition-all ${conversionType === type ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/40 text-slate-400 border-white/5 hover:bg-white/5'}`}
                 >
                   {type === 'upper' ? 'UPPERCASE' : type === 'lower' ? 'lowercase' : type === 'title' ? 'Title Case' : type === 'sentence' ? 'Sentence case' : 'aLtErNaTiNg'}
                 </button>
               ))}
            </div>
          )}

          {/* Controls specifically for repetitions or amounts */}
          {(initialToolId === 'lorem-ipsum' || initialToolId === 'text-repeater' || initialToolId === 'random-string') && (
            <div className="mt-4 flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
               <label className="text-xs font-bold text-slate-400">Amount / Repeat:</label>
               <input type="range" min="1" max="100" value={repeatCount} onChange={(e) => setRepeatCount(parseInt(e.target.value))} className="flex-1 accent-blue-500" />
               <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md">{repeatCount}</span>
            </div>
          )}

          {initialToolId === 'text-to-speech' && (
            <button 
              onClick={handleSpeak}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg ${isSpeaking ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 shadow-red-900/40' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 shadow-blue-900/40'}`}
            >
              {isSpeaking ? <RefreshCcw size={18} className="animate-spin" /> : <Volume2 size={18} />}
              {isSpeaking ? "Stop Playing" : "Read Text Aloud"}
            </button>
          )}

          {initialToolId === 'translator' && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <select 
                  value={sourceLang} 
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-slate-300 outline-none"
                >
                  <option value="auto">Otomatik Algıla</option>
                  <option value="tr">Türkçe</option>
                  <option value="en">İngilizce</option>
                  <option value="de">Almanca</option>
                  <option value="fr">Fransızca</option>
                  <option value="es">İspanyolca</option>
                  <option value="it">İtalyanca</option>
                  <option value="ru">Rusça</option>
                  <option value="ar">Arapça</option>
                  <option value="zh">Çince</option>
                  <option value="ja">Japonca</option>
                </select>
                <div className="text-slate-500">→</div>
                <select 
                  value={targetLang} 
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-slate-300 outline-none"
                >
                  <option value="en">İngilizce</option>
                  <option value="tr">Türkçe</option>
                  <option value="de">Almanca</option>
                  <option value="fr">Fransızca</option>
                  <option value="es">İspanyolca</option>
                  <option value="it">İtalyanca</option>
                  <option value="ru">Rusça</option>
                  <option value="ar">Arapça</option>
                  <option value="zh">Çince</option>
                  <option value="ja">Japonca</option>
                </select>
              </div>
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-indigo-900/40 ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTranslating ? <RefreshCcw size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                {isTranslating ? "Çeviriliyor..." : "Metni Çevir"}
              </button>
            </div>
          )}


        </div>

        {/* Right Side: Output */}
        <div className="bg-[#111115] rounded-3xl p-6 border border-white/5 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Output / Details</h2>
             <button onClick={handleCopy} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Result'}
             </button>
          </div>
          <div className="flex-1 w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-emerald-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
            {output || <span className="text-slate-600 italic">Result will appear here...</span>}
          </div>
        </div>

      </main>
    </div>
  );
}
