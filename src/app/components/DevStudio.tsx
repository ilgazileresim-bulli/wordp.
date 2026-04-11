"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Trash2, Code2, CheckCircle } from 'lucide-react';

const DEV_TOOLS: Record<string, { title: string; desc: string }> = {
  'json-formatter': { title: "JSON Biçimlendirici", desc: "Sıkıştırılmış JSON kodunu okunaklı hale getirin veya sıkıştırın." },
  'json-graph': { title: "JSON Grafiği", desc: "Görsel JSON ağaç yapısı ve önizlemesi." },
  'base64': { title: "Base64", desc: "Metni Base64 formatında şifreleyin veya çözün." },
  'hash-generator': { title: "Hash Üretici", desc: "MD5, SHA-1, SHA-256 kriptografik özetler üretin." },
  'uuid-generator': { title: "UUID Üretici", desc: "Rastgele güvenli V4 UUID standart kimlikleri oluşturun." },
  'regex-tester': { title: "Regex Test Aracı", desc: "Kurallı ifadeleri test edin ve vurgulu metne bakın." },
  'markdown-editor': { title: "Markdown Editörü", desc: "Markdown kodunuzun HTML olarak canlı önizlemesini görün." },
  'code-formatter': { title: "Kod Biçimlendirici", desc: "HTML, JS ve CSS kodlarını düzenli formata sokun." },
  'json-to-csv': { title: "JSON'dan CSV'ye", desc: "JSON nesne dizilerini Excel CSV formatına çevirin." },
  'meta-tag-generator': { title: "Meta Etiket Üretici", desc: "Web siteniz için SEO meta etiketleri oluşturun." },
  'og-preview': { title: "OG Önizleme", desc: "Sosyal medya Açık Grafik paylaşımlarını analiz edin." },
  'cron-expression': { title: "CRON İfadesi", desc: "Zamanlanmış CRON tabanlı komut sözdizimleri üretin." },
  'color-contrast': { title: "Renk Kontrastı", desc: "Erişilebilirlik oranı ve HEX / RGB karşılaştırması." },
  'json-schema': { title: "JSON Şeması", desc: "JSON verilerinizin tip iskeletini ve modelini çıkarın." },
  'jwt-decoder': { title: "JWT Çözücü", desc: "JSON Web Tokens payload'ını anında okuyun." },
  'html-entities': { title: "HTML Varlığı", desc: "Güvenli metinleri HTML entity kodlarına (< &gt;) dönüştürün." },
  'url-encoder': { title: "URL Kodlayıcı", desc: "URI parametre kodlaması ve kod çözme." }
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
        for(let i=0; i<Math.min(amount, 1000); i++) res += crypto.randomUUID() + "\\n";
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
             setOutput(`HEADER:\\n${JSON.stringify(header, null, 2)}\\n\\nPAYLOAD:\\n${JSON.stringify(payload, null, 2)}`);
          } else {
             setOutput("Geçersiz JWT formatı. xxxxx.yyyyy.zzzzz şeklinde olmalı.");
          }
        }
      } else if (initialToolId === 'json-to-csv') {
        if (!input1) setOutput("");
        else {
           const arr = JSON.parse(input1);
           if (!Array.isArray(arr)) { setOutput("Lütfen JSON dizisi (array) formatında bir veri girin: [{...}]"); return; }
           const keys = Object.keys(arr[0] || {});
           const header = keys.join(',');
           const rows = arr.map(obj => keys.map(k => {
              let val = obj[k];
              if (typeof val === 'object') val = JSON.stringify(val);
              return `"${String(val).replace(/"/g, '""')}"`;
           }).join(','));
           setOutput(header + '\\n' + rows.join('\\n'));
        }
      } else if (initialToolId === 'hash-generator') {
         if (!input1) setOutput("");
         else {
            const encodeStr = new TextEncoder().encode(input1);
            Promise.all([
               crypto.subtle.digest('SHA-1', encodeStr),
               crypto.subtle.digest('SHA-256', encodeStr),
               crypto.subtle.digest('SHA-384', encodeStr),
               crypto.subtle.digest('SHA-512', encodeStr)
            ]).then(([sha1, sha256, sha384, sha512]) => {
               const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
               setOutput(`SHA-1:   ${toHex(sha1)}\\nSHA-256: ${toHex(sha256)}\\nSHA-384: ${toHex(sha384)}\\nSHA-512: ${toHex(sha512)}`);
            });
         }
      } else if (initialToolId === 'json-schema') {
         if (!input1) setOutput("");
         else {
            const obj = JSON.parse(input1);
            const generateSchema = (data: any): any => {
               if (Array.isArray(data)) return { type: "array", items: data.length ? generateSchema(data[0]) : {} };
               if (data !== null && typeof data === 'object') {
                  const props: any = {};
                  for (const k in data) props[k] = generateSchema(data[k]);
                  return { type: "object", properties: props };
               }
               return { type: typeof data };
            };
            setOutput(JSON.stringify({ $schema: "http://json-schema.org/draft-07/schema#", ...generateSchema(obj) }, null, 2));
         }
      } else if (initialToolId === 'color-contrast') {
         // Generic color contrast display
         setOutput(`Sırasıyla Arkaplan ve Yazı HEX rengini '#' ile alt alta girin. (Örn:\\n#ffffff\\n#000000)\\n\\n(Not: Gelecek sürümde tam interaktif renk alanı sağlanacaktır.)`);
      } else if (initialToolId === 'regex-tester') {
         if (!input1 || !input2) setOutput("");
         else {
            try {
               const regex = new RegExp(input2, 'g');
               const matches = [...input1.matchAll(regex)];
               if (matches.length > 0) {
                  setOutput(`Bulunan Eşleşme Sayısı: ${matches.length}\\n\\n${matches.map((m, i) => `Eşleşme ${i+1}: "${m[0]}" (İndeks: ${m.index})`).join('\\n')}`);
               } else {
                  setOutput("Eşleşme bulunamadı.");
               }
            } catch(err: any) {
               setOutput(`Geçersiz Regex Hatası: ${err.message}`);
            }
         }
      } else if (initialToolId === 'meta-tag-generator') {
         // Simplified version
         const lines = input1.split('\\n');
         const title = lines[0] || "A Sayfa Başlığı";
         const desc = lines[1] || "Açıklama";
         setOutput(`<!-- Basic -->\\n<title>${title}</title>\\n<meta name="description" content="${desc}">\\n\\n<!-- Open Graph -->\\n<meta property="og:title" content="${title}">\\n<meta property="og:description" content="${desc}">\\n<meta property="og:type" content="website">\\n\\n<!-- Twitter -->\\n<meta name="twitter:card" content="summary_large_image">\\n<meta name="twitter:title" content="${title}">\\n<meta name="twitter:description" content="${desc}">`);
      } else if (initialToolId === 'json-graph') {
         if (!input1) setOutput("");
         else {
            const obj = JSON.parse(input1);
            const buildTree = (data: any, prefix = ''): string => {
               if (Array.isArray(data)) return data.map((v, i) => `${prefix}├── [${i}]\\n${buildTree(v, prefix + '│   ')}`).join('');
               if (data !== null && typeof data === 'object') {
                  const keys = Object.keys(data);
                  return keys.map((k, i) => {
                     const isLast = i === keys.length - 1;
                     const branch = isLast ? '└── ' : '├── ';
                     const nextPrefix = prefix + (isLast ? '    ' : '│   ');
                     return `${prefix}${branch}${k}\\n${buildTree(data[k], nextPrefix)}`;
                  }).join('');
               }
               return `${prefix}└── ${data}\\n`;
            };
            setOutput(buildTree(obj));
         }
      } else if (initialToolId === 'markdown-editor') {
         // Fallback to plain markdown display formatting if marked is not parsed
         if (!input1) setOutput("");
         else {
            let md = input1
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
              .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
              .replace(/\\~\\~(.*?)\\~\\~/gim, '<del>$1</del>')
              .replace(/\\[(.*?)\\]\\((.*?)\\)/gim, "<a href='$2'>$1</a>")
              .replace(/`(.*?)`/gim, '<code>$1</code>')
              .replace(/\\n/gim, '<br>');
            setOutput(md);
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
            setOutput(res.join('\\n'));
         }
      } else if (initialToolId === 'og-preview') {
         if (!input1) setOutput("");
         else {
            const getTag = (name: string) => {
               const match = input1.match(new RegExp(`<meta\\s+property=["']${name}["']\\s+content=["'](.*?)["']\\s*\\/?>`, 'i'));
               return match ? match[1] : '';
            };
            const title = getTag('og:title') || "Başlık Bulunamadı";
            const desc = getTag('og:description') || "Açıklama Bulunamadı...";
            const img = getTag('og:image') || "📷 Resim Yok";
            setOutput(`--- OPEN GRAPH PREVIEW ---\\n\\n[GÖRSEL]: ${img}\\n\\n[BAŞLIK]: ${title}\\n\\n[AÇIKLAMA]: ${desc}\\n\\n------------------------`);
         }
      } else if (initialToolId === 'cron-expression') {
         if (!input1) setOutput("");
         else {
            const parts = input1.trim().split(' ');
            if (parts.length < 5) {
               setOutput("Geçersiz CRON. Doğru format: * * * * * (Dakika, Saat, Gün, Ay, Haftanın Günü)");
            } else {
               setOutput(`Zamanlanan CRON Analizi:\\n- Dakika: ${parts[0]}\\n- Saat: ${parts[1]}\\n- Ayın Günü: ${parts[2]}\\n- Ay: ${parts[3]}\\n- Haftanın Günü: ${parts[4]}`);
            }
         }
      } else {
         setOutput("Bu aracın önizlemesi şu anda hazırlanıyor...");
      }
    } catch (e: any) {
      setOutput(`Hata: ${e.message}`);
    }
  }, [input1, input2, mode, initialToolId]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex flex-col">
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
            <Code2 size={16} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">{tool.title}</h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">{tool.desc}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="bg-[#111115] rounded-3xl p-6 border border-emerald-500/10 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Input / Veri</h2>
             <button onClick={() => setInput1("")} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <Trash2 size={16} />
             </button>
          </div>

          {(initialToolId === 'base64' || initialToolId === 'url-encoder' || initialToolId === 'html-entities' || initialToolId === 'json-formatter') && (
            <div className="flex items-center gap-2 mb-4 bg-black/40 p-1.5 rounded-xl border border-white/5">
               <button onClick={() => setMode("encode")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === 'encode' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-white/5'}`}>{initialToolId === 'json-formatter' ? 'Beautify' : 'Encode / Şifrele'}</button>
               <button onClick={() => setMode("decode")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === 'decode' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-white/5'}`}>{initialToolId === 'json-formatter' ? 'Minify' : 'Decode / Çöz'}</button>
            </div>
          )}

          {initialToolId === 'regex-tester' ? (
             <div className="flex-1 flex flex-col gap-4">
                <input 
                  className="bg-black/60 border border-white/5 rounded-xl p-4 text-emerald-300 font-mono resize-none outline-none focus:border-emerald-500/50"
                  placeholder="Regex Kuralı... (Örn: \d+ veya [a-z]+)"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                />
                <textarea 
                  className="flex-1 min-h-[100px] bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-200 resize-none outline-none focus:border-blue-500/50"
                  placeholder="Test edilecek metni yapıştırın..."
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                />
             </div>
          ) : (
            <textarea 
              className={`flex-1 w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-200 resize-none outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600 ${initialToolId.includes('json') ? 'font-mono text-sm text-sky-300' : ''}`}
              placeholder={initialToolId === 'uuid-generator' ? 'Kaç adet UUID üretilsin (Örn: 10)' : initialToolId === 'meta-tag-generator' ? '1. Satır Başlık, 2. Satır Açıklama...' : 'Metin, JSON veya Kod yapıştırın...'}
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          )}
        </div>

        <div className="bg-[#111115] rounded-3xl p-6 border border-emerald-500/10 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Output / Sonuç</h2>
             <button onClick={handleCopy} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? 'Kopyalandı' : 'Kopyala'}
             </button>
          </div>
          <div className="flex-1 w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-emerald-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
            {initialToolId === 'markdown-editor' && output ? (
               <div className="prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: output }}></div>
            ) : (
               output || <span className="text-slate-600 italic">Sonuç burada görünecek...</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
