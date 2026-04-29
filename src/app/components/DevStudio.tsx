"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Trash2, Code2, CheckCircle, Terminal, Braces, Binary, Hash, Fingerprint, SearchCode, FileCode, Monitor, Clock, Contrast, Link } from 'lucide-react';
import { cn } from "./editor/utils";

const DEV_TOOLS: Record<string, { title: string; desc: string; icon: any; color: string }> = {
  'json-formatter': { title: "JSON Formatter", desc: "Beautify or minify JSON code.", icon: Braces, color: "from-emerald-500 to-teal-600" },
  'base64': { title: "Base64 Converter", desc: "Encode or decode Base64 strings.", icon: Binary, color: "from-blue-500 to-indigo-600" },
  'hash-generator': { title: "Hash Generator", desc: "Generate MD5, SHA-256 hashes.", icon: Hash, color: "from-orange-500 to-red-600" },
  'uuid-generator': { title: "UUID Generator", desc: "Generate secure random V4 UUIDs.", icon: Fingerprint, color: "from-indigo-500 to-purple-600" },
  'regex-tester': { title: "Regex Tester", desc: "Test regular expressions instantly.", icon: SearchCode, color: "from-pink-500 to-rose-600" },
  'markdown-editor': { title: "Markdown Editor", desc: "Live preview for Markdown to HTML.", icon: FileCode, color: "from-sky-500 to-blue-600" },
  'code-formatter': { title: "Code Formatter", desc: "Clean up HTML, CSS, and JS code.", icon: Code2, color: "from-violet-500 to-purple-600" },
  'json-to-csv': { title: "JSON to CSV", desc: "Convert JSON arrays to CSV format.", icon: Terminal, color: "from-emerald-600 to-teal-700" },
  'meta-tag-generator': { title: "Meta Tag Generator", desc: "Create SEO tags for your website.", icon: Monitor, color: "from-blue-600 to-indigo-700" },
  'cron-expression': { title: "CRON Expression", desc: "Generate scheduled CRON syntax.", icon: Clock, color: "from-amber-500 to-orange-600" },
  'color-contrast': { title: "Color Contrast", desc: "Check accessibility and HEX/RGB.", icon: Contrast, color: "from-zinc-700 to-zinc-900" },
  'jwt-decoder': { title: "JWT Decoder", desc: "Decode JSON Web Tokens instantly.", icon: Fingerprint, color: "from-fuchsia-500 to-purple-700" },
  'html-entities': { title: "HTML Entities", desc: "Convert text to HTML entity codes.", icon: Code2, color: "from-rose-500 to-red-700" },
  'url-encoder': { title: "URL Encoder", desc: "Encode or decode URL parameters.", icon: Link, color: "from-blue-500 to-cyan-600" }
};

export default function DevStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  const tool = DEV_TOOLS[initialToolId] || DEV_TOOLS['json-formatter'];
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    try {
      if (initialToolId === 'json-formatter') {
        if (!input1) setOutput("");
        else {
           const parsed = JSON.parse(input1);
           setOutput(mode === "encode" ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
        }
      } else if (initialToolId === 'base64') {
        if (!input1) setOutput("");
        else setOutput(mode === "encode" ? btoa(unescape(encodeURIComponent(input1))) : decodeURIComponent(escape(atob(input1))));
      } else if (initialToolId === 'uuid-generator') {
        const amount = Number(input1) || 5;
        let res = "";
        for(let i=0; i<Math.min(amount, 100); i++) res += crypto.randomUUID() + "\n";
        setOutput(res.trim());
      } else if (initialToolId === 'url-encoder') {
        if (!input1) setOutput("");
        else setOutput(mode === "encode" ? encodeURIComponent(input1) : decodeURIComponent(input1));
      } else if (initialToolId === 'html-entities') {
        if (!input1) setOutput("");
        else setOutput(mode === "encode" ? input1.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') 
                                          : input1.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
      } else if (initialToolId === 'jwt-decoder') {
        if (!input1) setOutput("");
        else {
          const parts = input1.split('.');
          if (parts.length >= 2) {
             const header = JSON.parse(atob(parts[0]));
             const payload = JSON.parse(atob(parts[1]));
             setOutput(`HEADER:\n${JSON.stringify(header, null, 2)}\n\nPAYLOAD:\n${JSON.stringify(payload, null, 2)}`);
          } else {
             setOutput("Invalid JWT format. Should be xxxxx.yyyyy.zzzzz");
          }
        }
      } else if (initialToolId === 'json-to-csv') {
        if (!input1) setOutput("");
        else {
           const arr = JSON.parse(input1);
           if (!Array.isArray(arr)) { setOutput("Please provide a JSON array: [{...}]"); return; }
           const keys = Object.keys(arr[0] || {});
           const header = keys.join(',');
           const rows = arr.map(obj => keys.map(k => {
              let val = obj[k];
              if (typeof val === 'object') val = JSON.stringify(val);
              return `"${String(val).replace(/"/g, '""')}"`;
           }).join(','));
           setOutput(header + '\n' + rows.join('\n'));
        }
      } else if (initialToolId === 'hash-generator') {
         if (!input1) setOutput("");
         else {
            const encodeStr = new TextEncoder().encode(input1);
            Promise.all([
               crypto.subtle.digest('SHA-1', encodeStr),
               crypto.subtle.digest('SHA-256', encodeStr),
               crypto.subtle.digest('SHA-512', encodeStr)
            ]).then(([sha1, sha256, sha512]) => {
               const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
               setOutput(`SHA-1:   ${toHex(sha1)}\nSHA-256: ${toHex(sha256)}\nSHA-512: ${toHex(sha512)}`);
            });
         }
      } else if (initialToolId === 'regex-tester') {
         if (!input1 || !input2) setOutput("");
         else {
            try {
               const regex = new RegExp(input2, 'g');
               const matches = [...input1.matchAll(regex)];
               if (matches.length > 0) {
                  setOutput(`Found ${matches.length} matches:\n\n${matches.map((m, i) => `Match ${i+1}: "${m[0]}" (Index: ${m.index})`).join('\n')}`);
               } else {
                  setOutput("No matches found.");
               }
            } catch(err: any) {
               setOutput(`Invalid Regex: ${err.message}`);
            }
         }
      } else if (initialToolId === 'code-formatter') {
         if (!input1) setOutput("");
         else {
            let formatted = input1.replace(/>\s*</g, '>\n<');
            let indentLevel = 0;
            const lines = formatted.split('\n');
            const res = lines.map(line => {
               const l = line.trim();
               if (l.startsWith('</') || l.match(/^[}\]]/)) indentLevel = Math.max(indentLevel - 1, 0);
               const out = '  '.repeat(indentLevel) + l;
               if ((l.match(/<[^/!][^>]*>$/) && !l.match(/<\//)) || l.match(/[{[]$/)) indentLevel++;
               return out;
            });
            setOutput(res.join('\n'));
         }
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  }, [input1, input2, mode, initialToolId]);

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
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">{tool.desc}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-slate-800 flex flex-col h-[75vh] shadow-xl">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xs uppercase font-black text-zinc-400 tracking-wider flex items-center gap-2">
                <Terminal size={14} /> Input Data
             </h2>
             <button onClick={() => setInput1("")} className="p-2 hover:bg-red-50 text-red-500 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                <Trash2 size={18} />
             </button>
          </div>

          {(initialToolId === 'base64' || initialToolId === 'url-encoder' || initialToolId === 'html-entities' || initialToolId === 'json-formatter') && (
            <div className="flex items-center gap-2 mb-6 bg-zinc-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-zinc-200 dark:border-slate-800">
               <button onClick={() => setMode("encode")} className={cn("flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", mode === 'encode' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/10')}>{initialToolId === 'json-formatter' ? 'Beautify' : 'Encode'}</button>
               <button onClick={() => setMode("decode")} className={cn("flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", mode === 'decode' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/10')}>{initialToolId === 'json-formatter' ? 'Minify' : 'Decode'}</button>
            </div>
          )}

          {initialToolId === 'regex-tester' ? (
             <div className="flex-1 flex flex-col gap-4">
                <input 
                  className="bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 text-emerald-600 dark:text-emerald-400 font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Regex Pattern... (e.g. \d+ or [a-z]+)"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                />
                <textarea 
                  className="flex-1 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 text-zinc-900 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                  placeholder="Paste text to test against..."
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                />
             </div>
          ) : (
            <textarea 
              className={cn(
                "flex-1 w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-3xl p-8 text-zinc-900 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm leading-relaxed",
                initialToolId.includes('json') && "text-blue-600 dark:text-blue-400"
              )}
              placeholder={initialToolId === 'uuid-generator' ? 'Count (e.g. 10)' : 'Paste code or JSON here...'}
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-slate-800 flex flex-col h-[75vh] shadow-xl">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xs uppercase font-black text-zinc-400 tracking-wider flex items-center gap-2">
                <Code2 size={14} /> Result
             </h2>
             <button onClick={handleCopy} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all", copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20')}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
             </button>
          </div>
          <div className="flex-1 w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-3xl p-8 text-emerald-600 dark:text-emerald-400 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {output || <span className="text-zinc-400 italic">Execution output...</span>}
          </div>
        </div>
      </main>
    </div>
  );
}
