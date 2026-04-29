"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Copy, Check, RefreshCw, Play, Download, Monitor, Maximize2, Minimize2,
  FileCode, FileCode2, Braces, Terminal, Zap, RotateCcw, ChevronRight,
  ChevronDown, Code, Search, GitBranch, Package, Settings, X, Plus,
  FolderOpen, File, Circle, AlertCircle, CheckCircle2, Bell, Layout,
  SplitSquareHorizontal, Star, BookOpen, ArrowRight, Folder, ArrowLeft,
  Coffee, Layers, Cpu, Clock, Palette, Info, TriangleAlert, Bug,
  ChevronUp, Trash2, Filter, MoreHorizontal, Square, StopCircle,
  WifiOff, Wifi, LogOut, Hash, Loader2, Sparkles, ShieldCheck
} from "lucide-react";
import { getCompletions, kindColor, kindLabel, parseEmmet, getLanguageContext, type Completion, type EditorLang } from "./intellisense";
import { cn } from "./editor/utils";

interface CodeEditorProps {
  onBack: () => void;
  initialLang?: "html" | "css" | "js";
}

const HTML_SNIPPETS: Record<string, string> = {
  "!": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Macrotar Project</title>\n</head>\n<body>\n  \n</body>\n</html>`,
  "html": `<html lang="en">\n  \n</html>`, "head": `<head>\n  <meta charset="UTF-8" />\n  <title>Document</title>\n</head>`,
  "body": `<body>\n  \n</body>`, "div": `<div>\n  \n</div>`, "span": `<span></span>`,
  "p": `<p></p>`, "h1": `<h1></h1>`, "h2": `<h2></h2>`, "h3": `<h3></h3>`,
  "ul": `<ul>\n  <li></li>\n</ul>`, "li": `<li></li>`, "a": `<a href="#"></a>`, 
  "img": `<img src="" alt="" />`, "button": `<button type="button"></button>`,
  "script": `<script>\n  \n</script>`, "style": `<style>\n  \n</style>`,
};
const CSS_SNIPPETS: Record<string, string> = {
  "body": `body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}`,
  "flex": `display: flex;\njustify-content: center;\nalign-items: center;`,
  "grid": `display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;`,
  "reset": `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}`,
};
const JS_SNIPPETS: Record<string, string> = {
  "cl": `console.log()`, "fn": `function name() {\n  \n}`, "arrow": `const name = () => {\n  \n};`,
  "const": `const name = ;`, "let": `let name = ;`, "if": `if (condition) {\n  \n}`,
  "fetch": `fetch('url')\n  .then(res => res.json())\n  .then(data => console.log(data));`,
};

const AUTO_CLOSE: Record<string, string> = { "{": "}", "(": ")", "[": "]", '"': '"', "'": "'", "`": "`" };
const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);

const FILE_LANG_MAP: Record<string, "html" | "css" | "js"> = { "index.html": "html", "style.css": "css", "script.js": "js" };

const FILE_DEFAULTS: Record<string, string> = {
  "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Macrotar Code</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <div class="hero">\n    <h1 id="title">Neural Workspace</h1>\n    <p>Code locally. Deploy instantly.</p>\n    <button id="cta" onclick="ignite()">Activate System</button>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`,
  "style.css": `body {\n  margin: 0;\n  background: #020205;\n  color: white;\n  font-family: 'Inter', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n\n.hero {\n  text-align: center;\n  padding: 4rem;\n  background: rgba(255,255,255,0.03);\n  border: 1px solid rgba(255,255,255,0.08);\n  border-radius: 3rem;\n  backdrop-filter: blur(40px);\n}\n\nh1 {\n  font-size: 4rem;\n  font-weight: 900;\n  letter-spacing: -0.05em;\n  margin: 0;\n  background: linear-gradient(to right, #6366f1, #a855f7);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\nbutton {\n  margin-top: 2rem;\n  padding: 1rem 3rem;\n  background: white;\n  color: black;\n  border: none;\n  border-radius: 1.5rem;\n  font-weight: 800;\n  cursor: pointer;\n  transition: 0.3s;\n}\n\nbutton:hover { transform: scale(1.05); }`,
  "script.js": `console.log("System Initialized...");\n\nfunction ignite() {\n  const btn = document.getElementById("cta");\n  const title = document.getElementById("title");\n  \n  btn.innerText = "System Online";\n  btn.style.background = "#22c55e";\n  title.style.transform = "scale(1.1)";\n  \n  setTimeout(() => {\n     title.style.transform = "scale(1)";\n  }, 500);\n}`,
};

type ActivePanel = "explorer" | "search" | "git" | "extensions" | null;
type BottomTab = "terminal" | "problems" | "output" | "debug";

export default function CodeEditor({ onBack, initialLang = "html" }: CodeEditorProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>(["index.html"]);
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [files, setFiles] = useState<Record<string, string>>(FILE_DEFAULTS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("terminal");
  const [previewKey, setPreviewKey] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<{text:string;type:string}[]>([{ text: "Macrotar Neural Terminal v2.0", type: "system" }]);

  const handleCodeChange = (val: string) => setFiles(prev => ({ ...prev, [activeFile]: val }));

  const runPreview = () => {
    setIsPreviewOpen(true);
    setPreviewKey(k => k + 1);
    setTerminalLines(prev => [...prev, { text: "> Running build sequence...", type: "info" }, { text: "✓ Manifest compiled", type: "success" }]);
  };

  const currentLang = FILE_LANG_MAP[activeFile] || "html";
  const currentCode = files[activeFile] || "";

  const buildPreviewHTML = () => {
    const html = files["index.html"] || "";
    const css = files["style.css"] || "";
    const js = files["script.js"] || "";
    return html.replace("</head>", `<style>${css}</style></head>`).replace("</body>", `<script>${js}<\/script></body>`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#05050a] text-zinc-400 overflow-hidden font-[family-name:var(--font-inter)]">
      {/* OS Bar */}
      <header className="h-10 bg-black border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
                <button onClick={onBack} className="w-3 h-3 rounded-full bg-rose-500 hover:brightness-110 transition-all" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                {["File", "Edit", "View", "Go", "Run", "Help"].map(m => <span key={m} className="hover:text-white cursor-pointer transition-colors">{m}</span>)}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white/5 px-4 py-1 rounded-full border border-white/5">
                {activeFile} — Neural Studio
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setIsPreviewOpen(!isPreviewOpen)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"><SplitSquareHorizontal size={16} /></button>
            <button onClick={runPreview} className="px-5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                <Play size={14} fill="currentColor" /> Run Sequence
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <aside className="w-16 bg-black border-r border-white/5 flex flex-col items-center py-6 gap-2 shrink-0">
          {[
            { id: "explorer", icon: <Layers size={24} /> },
            { id: "search", icon: <Search size={24} /> },
            { id: "git", icon: <GitBranch size={24} /> },
            { id: "extensions", icon: <Package size={24} /> },
          ].map(item => (
            <button key={item.id} onClick={() => setActivePanel(activePanel === item.id ? null : item.id as ActivePanel)} className={cn("w-12 h-12 flex items-center justify-center rounded-2xl transition-all relative group", activePanel === item.id ? "text-white bg-white/5" : "text-zinc-600 hover:text-zinc-300")}>
                {item.icon}
                {activePanel === item.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-full" />}
            </button>
          ))}
          <div className="flex-1" />
          <button className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:text-white"><Settings size={24} /></button>
        </aside>

        {/* Sidebar */}
        {activePanel && (
          <div className="w-64 bg-[#080810] border-r border-white/5 flex flex-col shrink-0">
             <div className="p-6 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Explorer</h3>
             </div>
             <div className="p-4 space-y-1">
                {Object.keys(FILE_DEFAULTS).map(f => (
                    <button key={f} onClick={() => { setActiveFile(f); if (!openFiles.includes(f)) setOpenFiles([...openFiles, f]); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition-all group", activeFile === f ? "bg-indigo-600/10 text-white border border-indigo-500/20" : "text-zinc-500 hover:bg-white/5")}>
                        {f.endsWith(".html") ? <FileCode size={14} className="text-orange-500" /> : f.endsWith(".css") ? <Braces size={14} className="text-blue-500" /> : <FileCode2 size={14} className="text-yellow-400" />}
                        {f}
                    </button>
                ))}
             </div>
          </div>
        )}

        {/* Editor Engine */}
        <div className="flex-1 flex flex-col bg-[#05050a] relative">
          <div className="h-10 bg-[#080810] border-b border-white/5 flex items-center px-4 gap-1">
             {openFiles.map(f => (
                <button key={f} onClick={() => setActiveFile(f)} className={cn("h-full px-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border-r border-white/5 transition-all relative", activeFile === f ? "text-white bg-[#05050a]" : "text-zinc-600 hover:bg-white/5")}>
                   {f}
                   <X size={12} className="opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setOpenFiles(openFiles.filter(x => x !== f)); }} />
                   {activeFile === f && <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                </button>
             ))}
          </div>

          <div className="flex-1 flex overflow-hidden">
             <div className="flex-1 relative flex">
                <div className="w-12 bg-black/40 flex flex-col items-center py-6 text-[10px] font-black text-zinc-700 select-none border-r border-white/5">
                   {currentCode.split("\n").map((_, i) => <div key={i} className="h-6 leading-6">{i + 1}</div>)}
                </div>
                <textarea 
                  ref={textareaRef}
                  value={currentCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                        e.preventDefault();
                        const ta = textareaRef.current!;
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const val = ta.value;
                        handleCodeChange(val.substring(0, start) + "  " + val.substring(end));
                        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
                    }
                  }}
                  spellCheck={false}
                  className="flex-1 bg-transparent border-none outline-none resize-none p-6 text-sm font-mono text-zinc-300 leading-6 caret-indigo-500"
                />
             </div>

             {/* Live Web Preview */}
             {isPreviewOpen && (
                <div className={cn("bg-white flex flex-col border-l border-white/5", isPreviewOpen ? "w-[40%]" : "w-0")}>
                    <div className="h-10 bg-[#0a0a1a] border-b border-white/5 flex items-center justify-between px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Local Instance</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPreviewKey(k => k + 1)} className="p-1.5 hover:bg-white/5 text-zinc-400 rounded-lg"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                    <iframe key={previewKey} title="preview" srcDoc={buildPreviewHTML()} className="flex-1 w-full border-none bg-white" />
                </div>
             )}
          </div>

          {/* Bottom Panels */}
          {bottomPanelOpen && (
            <div className="h-64 bg-[#080810] border-t border-white/5 flex flex-col">
               <div className="h-10 bg-black border-b border-white/5 flex items-center px-6 gap-8">
                  {["terminal", "problems", "output", "debug"].map(tab => (
                    <button key={tab} onClick={() => setActiveBottomTab(tab as any)} className={cn("text-[10px] font-black uppercase tracking-widest transition-all relative h-full", activeBottomTab === tab ? "text-white" : "text-zinc-600 hover:text-zinc-400")}>
                        {tab}
                        {activeBottomTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                    </button>
                  ))}
               </div>
               <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
                  {activeBottomTab === "terminal" && (
                    <div className="space-y-1">
                        {terminalLines.map((l, i) => <div key={i} className={cn(l.type === "info" ? "text-blue-400" : l.type === "success" ? "text-emerald-500" : "text-zinc-400")}>{l.text}</div>)}
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-emerald-500 font-black">macrotar@cloud:~$</span>
                            <input value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={e => {
                                if (e.key === "Enter") {
                                    setTerminalLines([...terminalLines, { text: `> ${terminalInput}`, type: "input" }]);
                                    setTerminalInput("");
                                }
                            }} className="flex-1 bg-transparent border-none outline-none text-white" autoFocus />
                        </div>
                    </div>
                  )}
                  {activeBottomTab === "problems" && <div className="text-zinc-600 italic">No syntax violations detected in local scope.</div>}
               </div>
            </div>
          )}
        </div>
      </div>

      <footer className="h-6 bg-indigo-600 text-white px-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest shrink-0">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><GitBranch size={10} /> main*</span>
            <span className="flex items-center gap-1"><RefreshCw size={10} /> synchronized</span>
         </div>
         <div className="flex items-center gap-6">
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>{currentLang.toUpperCase()}</span>
         </div>
      </footer>
    </div>
  );
}
