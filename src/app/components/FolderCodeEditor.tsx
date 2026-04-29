"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft, FolderOpen, FileCode, FileCode2, Braces, File, Plus, X,
  Save, RefreshCw, Play, Monitor, Maximize2, Minimize2, ChevronDown,
  ChevronRight, GitBranch, Search, Package, Settings, Layers, Folder,
  AlertCircle, CheckCircle2, Terminal, Zap, Code, Upload, Trash2,
  Check, Copy, FileText, SplitSquareHorizontal, Clock, Palette
} from "lucide-react";
import { getCompletions, kindColor, kindLabel, parseEmmet, getLanguageContext, type Completion, type EditorLang } from "./intellisense";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "html" | "css" | "js" | "ts" | "json" | "txt" | "md" | "other";
interface EditorFile {
  name: string;
  handle: FileSystemFileHandle;
  content: string;
  saved: boolean;
  lang: Lang;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLang(name: string): Lang {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, Lang> = {
    html: "html", htm: "html",
    css: "css",
    js: "js", jsx: "js", mjs: "js", cjs: "js",
    ts: "ts", tsx: "ts",
    json: "json",
    txt: "txt",
    md: "md", mdx: "md",
  };
  return map[ext] || "other";
}

const LANG_ICON: Record<Lang, React.ReactNode> = {
  html:  <FileCode  size={13} className="text-orange-400 shrink-0" />,
  css:   <Braces    size={13} className="text-blue-400 shrink-0" />,
  js:    <FileCode2 size={13} className="text-yellow-300 shrink-0" />,
  ts:    <FileCode2 size={13} className="text-blue-300 shrink-0" />,
  json:  <FileText  size={13} className="text-yellow-500 shrink-0" />,
  txt:   <FileText  size={13} className="text-zinc-400 shrink-0" />,
  md:    <FileText  size={13} className="text-zinc-300 shrink-0" />,
  other: <File      size={13} className="text-zinc-500 shrink-0" />,
};

const LANG_COLOR: Record<Lang, string> = {
  html: "text-orange-400", css: "text-blue-400", js: "text-yellow-300",
  ts: "text-blue-300", json: "text-yellow-500", txt: "text-zinc-400",
  md: "text-zinc-300", other: "text-zinc-500",
};

function getLangLabel(l: Lang): string {
  return { html:"HTML", css:"CSS", js:"JavaScript", ts:"TypeScript", json:"JSON", txt:"Text", md:"Markdown", other:"Text" }[l];
}

function getCurrentIndent(code: string, pos: number) {
  const ls = code.lastIndexOf("\n", pos - 1) + 1;
  return (code.substring(ls, pos).match(/^(\s*)/) || ["",""])[1];
}

const AUTO_CLOSE: Record<string, string> = {"{":"}", "(":")", "[":"]", '"':'"', "'":"'", "`":"`"};
const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);

function autoCloseTag(before: string) {
  const m = before.match(/<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>$/);
  if (!m) return null;
  const tag = m[1].toLowerCase();
  return VOID_TAGS.has(tag) ? null : tag;
}

// ─── Emmet (minimal) ─────────────────────────────────────────────────────────
const HTML_S: Record<string,string> = {
  "!": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Title</title>\n</head>\n<body>\n  \n</body>\n</html>`,
  div:`<div>\n  \n</div>`, span:`<span></span>`, p:`<p></p>`,
  h1:`<h1></h1>`, h2:`<h2></h2>`, h3:`<h3></h3>`,
  ul:`<ul>\n  <li></li>\n</ul>`, ol:`<ol>\n  <li></li>\n</ol>`, li:`<li></li>`,
  a:`<a href="#"></a>`, img:`<img src="" alt="" />`, input:`<input type="text" placeholder="" />`,
  button:`<button type="button"></button>`,
  nav:`<nav>\n  \n</nav>`, header:`<header>\n  \n</header>`, main:`<main>\n  \n</main>`,
  footer:`<footer>\n  \n</footer>`, section:`<section>\n  \n</section>`,
  form:`<form>\n  \n</form>`, table:`<table>\n  <thead><tr><th></th></tr></thead>\n  <tbody><tr><td></td></tr></tbody>\n</table>`,
  script:`<script>\n  \n</script>`, style:`<style>\n  \n</style>`,
  link:`<link rel="stylesheet" href="style.css" />`, lorem:`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
};
const CSS_S: Record<string,string> = {
  body:`body {\n  margin: 0;\n  font-family: sans-serif;\n}`,
  flex:`display: flex;\njustify-content: center;\nalign-items: center;`,
  grid:`display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 16px;`,
  card:`.card {\n  background: #fff;\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 4px 24px rgba(0,0,0,0.1);\n}`,
  anim:`@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}`,
  media:`@media (max-width: 768px) {\n  \n}`,
  reset:`* { margin: 0; padding: 0; box-sizing: border-box; }`,
};
const JS_S: Record<string,string> = {
  cl:`console.log()`, fn:`function name() {\n  \n}`,
  arrow:`const name = () => {\n  \n};`, "if":`if (condition) {\n  \n}`,
  for:`for (let i = 0; i < arr.length; i++) {\n  \n}`,
  async:`async function name() {\n  try {\n    \n  } catch (err) {\n    console.error(err);\n  }\n}`,
  fetch:`fetch('url').then(r => r.json()).then(d => console.log(d));`,
  qs:`document.querySelector('')`, ae:`element.addEventListener('click', (e) => {\n  \n});`,
  class:`class Name {\n  constructor() {\n    \n  }\n}`, "try":`try {\n  \n} catch (err) {\n  console.error(err);\n}`,
};

function getSnippets(lang: Lang): Record<string,string> {
  if (lang === "html") return HTML_S;
  if (lang === "css")  return CSS_S;
  if (lang === "js" || lang === "ts") return JS_S;
  return {};
}

function expandSnippet(code: string, cursor: number, lang: Lang): {newCode:string; newCursor:number} | null {
  const before = code.substring(0, cursor);
  const wm = before.match(/[\w!]+$/);
  if (!wm) return null;
  const word = wm[0];
  const expansion = getSnippets(lang)[word];
  if (!expansion) return null;
  const ws = cursor - word.length;
  const indent = getCurrentIndent(code, ws);
  const indented = expansion.split("\n").map((l,i) => i===0 ? l : indent+l).join("\n");
  const newCode = code.substring(0,ws) + indented + code.substring(cursor);
  const ei = indented.indexOf("\n  \n");
  const newCursor = ei !== -1 ? ws + ei + 3 : ws + indented.length;
  return { newCode, newCursor };
}

// ─── Supported file extensions ────────────────────────────────────────────────
const SUPPORTED_EXT = [".html",".htm",".css",".js",".jsx",".mjs",".ts",".tsx",".json",".txt",".md",".mdx"];

function isSupportedFile(name: string) {
  return SUPPORTED_EXT.some(e => name.toLowerCase().endsWith(e));
}

// ─── Build preview HTML ───────────────────────────────────────────────────────
function buildPreview(openFiles: EditorFile[]): string {
  const htmlFile = openFiles.find(f => f.lang === "html");
  const cssFile  = openFiles.find(f => f.lang === "css");
  const jsFile   = openFiles.find(f => f.lang === "js");
  if (!htmlFile) {
    const css = cssFile?.content || "";
    const js  = jsFile?.content  || "";
    return `<!DOCTYPE html><html><head><style>${css}</style></head><body><script>${js}<\/script></body></html>`;
  }
  let html = htmlFile.content;
  if (cssFile) html = html.replace("</head>", `<style>${cssFile.content}</style></head>`);
  if (jsFile)  html = html.replace("</body>", `<script>${jsFile.content}<\/script></body>`);
  return html;
}

type ActivePanel = "explorer" | "search" | "extensions" | "git";

// ─── Component ───────────────────────────────────────────────────────────────
export default function FolderCodeEditor({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"pick" | "editor">("pick");
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [dirName, setDirName] = useState("");
  const [allFiles, setAllFiles] = useState<EditorFile[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [activePanel, setActivePanel] = useState<ActivePanel>("explorer");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>(["Macrotar Code Terminal v1.0", "Folder loaded. Ready."]);
  const [previewKey, setPreviewKey] = useState(0);
  const [snippetHint, setSnippetHint] = useState<{key:string}|null>(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [cursorInfo, setCursorInfo] = useState({line:1,col:1});
  const [saveStatus, setSaveStatus] = useState<"saved"|"saving"|"unsaved">("saved");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileError, setNewFileError] = useState("");
  const [copied, setCopied] = useState(false);
  // IntelliSense
  const [acList, setAcList] = useState<Completion[]>([]);
  const [acIndex, setAcIndex] = useState(0);
  const [acWord, setAcWord] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  // Active file
  const activeFile = allFiles.find(f => f.name === activeTab) || null;
  const currentCode = activeFile?.content || "";
  const currentLang = activeFile?.lang || "other";

  // ─── Pick folder ──────────────────────────────────────────────────────────
  const pickFolder = async () => {
    try {
      const dir = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      await loadDirectory(dir);
    } catch (e: any) {
      if (e?.name !== "AbortError") alert("Could not open folder: " + e?.message);
    }
  };

  const loadDirectory = async (dir: FileSystemDirectoryHandle) => {
    setDirHandle(dir);
    setDirName(dir.name);
    const loaded: EditorFile[] = [];
    for await (const [name, handle] of (dir as any).entries()) {
      if (handle.kind === "file" && isSupportedFile(name)) {
        try {
          const file = await (handle as FileSystemFileHandle).getFile();
          const content = await file.text();
          loaded.push({ name, handle: handle as FileSystemFileHandle, content, saved: true, lang: getLang(name) });
        } catch {}
      }
    }
    loaded.sort((a,b) => a.name.localeCompare(b.name));
    setAllFiles(loaded);
    // Auto-open index.html or first file
    const def = loaded.find(f => f.name === "index.html") || loaded[0];
    if (def) { setOpenTabs([def.name]); setActiveTab(def.name); }
    else      { setOpenTabs([]); setActiveTab(""); }
    setPhase("editor");
    const now = new Date().toLocaleTimeString("tr-TR");
    setTerminalLines(prev => [...prev, `[${now}] ${dir.name} folder opened — ${loaded.length} files loaded.`]);
  };

  // ─── Code change ─────────────────────────────────────────────────────────
  const handleCodeChange = (val: string) => {
    setAllFiles(prev => prev.map(f => f.name === activeTab ? { ...f, content: val, saved: false } : f));
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(activeTab, val), 1500);
  };

  const insertColor = (color: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const code = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newCode = code.substring(0, start) + color + code.substring(end);
    handleCodeChange(newCode);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + color.length;
      ta.focus();
    }, 0);
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const saveFile = useCallback(async (name: string, content: string) => {
    const f = allFiles.find(f => f.name === name);
    if (!f) return;
    try {
      setSaveStatus("saving");
      const writable = await f.handle.createWritable();
      await writable.write(content);
      await writable.close();
      setAllFiles(prev => prev.map(x => x.name === name ? {...x, saved: true} : x));
      setSaveStatus("saved");
      const now = new Date().toLocaleTimeString("tr-TR");
      setTerminalLines(prev => [...prev, `[${now}] ${name} saved ✓`]);
    } catch (e: any) {
      setSaveStatus("unsaved");
      alert("Save error: " + e?.message);
    }
  }, [allFiles]);

  const autoSave = (name: string, content: string) => saveFile(name, content);

  // Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeFile) saveFile(activeFile.name, activeFile.content);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeFile, saveFile]);

  // ─── New file ─────────────────────────────────────────────────────────────
  const createNewFile = async () => {
    setNewFileError("");
    const name = newFileName.trim();
    if (!name) { setNewFileError("File name cannot be empty."); return; }
    if (!SUPPORTED_EXT.some(e => name.endsWith(e))) {
      setNewFileError("Supported extensions: " + SUPPORTED_EXT.join(", "));
      return;
    }
    if (allFiles.find(f => f.name === name)) { setNewFileError("A file with this name already exists."); return; }
    if (!dirHandle) return;
    try {
      const newHandle = await (dirHandle as any).getFileHandle(name, { create: true });
      const writable = await newHandle.createWritable();
      await writable.write("");
      await writable.close();
      const newFile: EditorFile = { name, handle: newHandle, content: "", saved: true, lang: getLang(name) };
      setAllFiles(prev => [...prev, newFile].sort((a,b) => a.name.localeCompare(b.name)));
      setOpenTabs(prev => [...prev, name]);
      setActiveTab(name);
      setShowNewFileDialog(false);
      setNewFileName("");
      const now = new Date().toLocaleTimeString("tr-TR");
      setTerminalLines(prev => [...prev, `[${now}] ${name} created ✓`]);
    } catch (e: any) {
      setNewFileError("Could not create file: " + e?.message);
    }
  };

  // ─── Delete file ──────────────────────────────────────────────────────────
  const deleteFile = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    if (!dirHandle) return;
    try {
      await (dirHandle as any).removeEntry(name);
      setAllFiles(prev => prev.filter(f => f.name !== name));
      setOpenTabs(prev => {
        const next = prev.filter(t => t !== name);
        if (activeTab === name) setActiveTab(next[next.length-1] || "");
        return next;
      });
    } catch (e: any) { alert("Could not delete: " + e?.message); }
  };

  // ─── Open/close tabs ──────────────────────────────────────────────────────
  const openFile = (name: string) => {
    if (!openTabs.includes(name)) setOpenTabs(prev => [...prev, name]);
    setActiveTab(name);
  };
  const closeTab = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openTabs.filter(t => t !== name);
    setOpenTabs(next);
    if (activeTab === name) setActiveTab(next[next.length-1] || "");
  };

  // ─── Run preview ─────────────────────────────────────────────────────────
  const runPreview = () => {
    setIsPreviewOpen(true);
    setPreviewKey(k => k+1);
    const now = new Date().toLocaleTimeString("tr-TR");
    setTerminalLines(prev => [...prev, `[${now}] Project compiled, preview started ✓`]);
  };

  // ── IntelliSense ──────────────────────────────────────────────────────────────
  const updateAC = (val: string, cursor: number) => {
    const before = val.substring(0, cursor);
    const wm = before.match(/[\w!][\w.#-]*$/);
    if (!wm || wm[0].length < 1) { setAcList([]); setAcWord(""); return; }
    const word = wm[0];
    // Emmet: div.container, span#id vb.
    if (currentLang === "html" && (word.includes(".") || word.includes("#"))) {
      const emmet = parseEmmet(word);
      if (emmet) {
        setAcList([{ label: word, insert: emmet, kind: "snippet", detail: "Emmet → Enter/Tab" }]);
        setAcWord(word); setAcIndex(0); return;
      }
    }
    const lang = getLanguageContext(val, cursor, currentLang as EditorLang);
    const completions = getCompletions(lang, word);
    setAcList(completions);
    setAcWord(word);
    setAcIndex(0);
  };

  const applyCompletion = (comp: Completion) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const code = ta.value;
    const cursor = ta.selectionStart;
    const before = code.substring(0, cursor);
    const wm = before.match(/[\w!][\w.#-]*$/);
    const wordLen = wm ? wm[0].length : 0;
    const wordStart = cursor - wordLen;
    const indent = before.match(/\n(\s*)(?=[^\n]*$)/)?.[1] || "";
    const indented = comp.insert.split("\n").map((l, i) => i === 0 ? l : indent + l).join("\n");
    const newCode = code.substring(0, wordStart) + indented + code.substring(cursor);
    handleCodeChange(newCode);
    const emptyIdx = indented.indexOf("\n  \n");
    const newCursor = emptyIdx !== -1 ? wordStart + emptyIdx + 3 : wordStart + indented.length;
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = newCursor; ta.focus(); }, 0);
    setAcList([]); setAcWord(""); setSnippetHint(null);
  };

  // ── Keyboard handler ────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // AC nav
    if (acList.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setAcIndex(i => (i + 1) % acList.length); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setAcIndex(i => (i - 1 + acList.length) % acList.length); return; }
      if (e.key === "Escape")    { e.preventDefault(); setAcList([]); setAcWord(""); return; }
      if (e.key === "Tab" || e.key === "Enter") { e.preventDefault(); applyCompletion(acList[acIndex]); return; }
    }
    const ta = textareaRef.current!;
    const code = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    // Ctrl+Enter: run
    if ((e.ctrlKey||e.metaKey) && e.key === "Enter") { e.preventDefault(); runPreview(); return; }
    // Ctrl+S: save
    if ((e.ctrlKey||e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (activeFile) saveFile(activeFile.name, activeFile.content);
      return;
    }
    // Ctrl+D: duplicate line
    if ((e.ctrlKey||e.metaKey) && e.key === "d") {
      e.preventDefault();
      const ls = code.lastIndexOf("\n", start-1)+1;
      const le = code.indexOf("\n", start);
      const line = code.substring(ls, le===-1?code.length:le);
      const ip = le===-1?code.length:le;
      const nc = code.substring(0,ip)+"\n"+line+code.substring(ip);
      handleCodeChange(nc);
      setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=ip+1+(start-ls); },0);
      return;
    }
    // Ctrl+/: comment
    if ((e.ctrlKey||e.metaKey) && e.key === "/") {
      e.preventDefault();
      const ls = code.lastIndexOf("\n",start-1)+1;
      const le = code.indexOf("\n",start);
      const line = code.substring(ls, le===-1?code.length:le);
      let nl: string; let off: number;
      if (currentLang==="html") {
        if (line.trimStart().startsWith("<!--")) { nl=line.replace(/^(\s*)<!--\s?/,"$1").replace(/\s?-->$/,""); off=nl.length-line.length; }
        else { nl=line.replace(/^(\s*)/,"$1<!-- ")+" -->"; off=5; }
      } else {
        if (line.trimStart().startsWith("//")) { nl=line.replace(/^(\s*)\/\/\s?/,"$1"); off=nl.length-line.length; }
        else { nl=line.replace(/^(\s*)/,"$1// "); off=3; }
      }
      const e2=le===-1?code.length:le;
      handleCodeChange(code.substring(0,ls)+nl+code.substring(e2));
      setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+off; },0);
      return;
    }
    // Tab
    if (e.key==="Tab") {
      e.preventDefault();
      const res = expandSnippet(code, start, currentLang);
      if (res) { handleCodeChange(res.newCode); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=res.newCursor; ta.focus(); },0); setSnippetHint(null); return; }
      if (start!==end) {
        const sel=code.substring(start,end);
        const ind=sel.split("\n").map(l=>"  "+l).join("\n");
        handleCodeChange(code.substring(0,start)+ind+code.substring(end));
        setTimeout(()=>{ ta.selectionStart=start; ta.selectionEnd=start+ind.length; },0);
      } else {
        handleCodeChange(code.substring(0,start)+"  "+code.substring(end));
        setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+2; },0);
      }
      return;
    }
    // Enter: snippet + smart indent
    if (e.key==="Enter") {
      e.preventDefault();
      const res = expandSnippet(code, start, currentLang);
      if (res) { handleCodeChange(res.newCode); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=res.newCursor; ta.focus(); },0); setSnippetHint(null); return; }
      const before=code.substring(0,start); const after=code.substring(end);
      const indent=getCurrentIndent(code,start);
      const pc=before.slice(-1); const nc2=after[0];
      if ((pc==="{"&&nc2==="}")||(pc==="["&&nc2==="]")||(pc==="("&&nc2===")")) {
        handleCodeChange(before+"\n"+indent+"  "+"\n"+indent+after);
        setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+1+indent.length+2; },0); return;
      }
      const ex=pc==="{"||pc==="["||pc==="("?"  ":"";
      handleCodeChange(before+"\n"+indent+ex+after);
      setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+1+indent.length+ex.length; },0);
      return;
    }
    // Auto close pairs
    if (AUTO_CLOSE[e.key] && !e.ctrlKey && !e.metaKey) {
      const cl=AUTO_CLOSE[e.key];
      if ((e.key==='"'||e.key==="'"||e.key==="`")&&code[start]===e.key) { e.preventDefault(); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+1; },0); return; }
      if (start===end) { e.preventDefault(); handleCodeChange(code.substring(0,start)+e.key+cl+code.substring(end)); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+1; },0); return; }
    }
    if ((e.key===")"||e.key==="]"||e.key==="}")&&code[start]===e.key) { e.preventDefault(); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+1; },0); return; }
    if (e.key==="Backspace"&&start===end) {
      const pv=code[start-1]; const nx=code[start];
      if (pv&&nx&&AUTO_CLOSE[pv]===nx) { e.preventDefault(); handleCodeChange(code.substring(0,start-1)+code.substring(start+1)); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start-1; },0); return; }
    }
    if (e.key===">"&&currentLang==="html"&&!e.ctrlKey) {
      const bef2=code.substring(0,start)+">";
      const tag=autoCloseTag(bef2);
      if (tag) { e.preventDefault(); handleCodeChange(code.substring(0,start)+`></${tag}>`+code.substring(end)); setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=start+1; },0); return; }
    }
  };

  const updateCursor = () => {
    const ta=textareaRef.current; if (!ta) return;
    const b=ta.value.substring(0,ta.selectionStart).split("\n");
    setCursorInfo({line:b.length, col:b[b.length-1].length+1});
    // snippet hint
    const code=ta.value; const cursor=ta.selectionStart;
    const bef=code.substring(0,cursor);
    const wm=bef.match(/[\w!]+$/);
    if (wm&&getSnippets(currentLang)[wm[0]]) setSnippetHint({key:wm[0]});
    else setSnippetHint(null);
  };

  const lines = currentCode.split("\n");
  const previewSrc = buildPreview(allFiles);
  const unsavedFiles = allFiles.filter(f => !f.saved);

  // Filter files by search
  const filteredFiles = searchQuery
    ? allFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allFiles;

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: pick folder
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "pick") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-white"
        style={{fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <div className="text-center max-w-md px-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Code size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-light text-white mb-2">Macrotar Code</h1>
          <p className="text-[#858585] mb-10 text-sm">Work on real files. Save. Develop.</p>

          {/* Pick folder button */}
          <button
            onClick={pickFolder}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-2xl font-semibold text-base transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FolderOpen size={20} />
            Select Folder
          </button>

          <p className="text-[#555] text-xs mt-4">
            You can read and edit .html, .css, .js, .ts, .json and more files in the folder.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-3 text-left">
            {[
              {icon:<FileCode size={16} className="text-orange-400"/>, text:"HTML files"},
              {icon:<Braces size={16} className="text-blue-400"/>,    text:"CSS files"},
              {icon:<FileCode2 size={16} className="text-yellow-400"/>,text:"JS / TS files"},
              {icon:<FileText size={16} className="text-zinc-400"/>,  text:"JSON, MD, TXT"},
            ].map(item=>(
              <div key={item.text} className="flex items-center gap-2 px-3 py-2 bg-[#252526] rounded-xl text-[#858585] text-sm">
                {item.icon} {item.text}
              </div>
            ))}
          </div>

          <button onClick={onBack} className="mt-8 text-[#555] hover:text-[#858585] text-sm flex items-center gap-1 mx-auto transition-colors">
            <ArrowLeft size={14}/> Go back
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: editor
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden"
      style={{fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* ── Title Bar ── */}
      <div className="flex items-center bg-[#323233] px-2 py-1 text-[12px] text-[#cccccc] shrink-0 gap-2 select-none">
        <div className="flex items-center gap-1.5 mr-2">
          <button onClick={() => setPhase("pick")} title="Open different folder" className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 transition-all flex items-center justify-center group">
            <FolderOpen size={6} className="opacity-0 group-hover:opacity-100 text-yellow-900" />
          </button>
          <div className="w-3 h-3 rounded-full bg-[#28c940]" />
        </div>
        {["File","Edit","Selection","View","Go","Run","Terminal","Help"].map(m=>(
          <span key={m} className="px-1.5 py-0.5 hover:bg-white/10 rounded cursor-pointer transition-all">{m}</span>
        ))}
        <div className="flex-1 text-center text-[#cccccc]/60 text-[11px] pointer-events-none truncate">
          {activeTab ? `${activeTab} — ${dirName} — Macrotar Code` : `${dirName} — Macrotar Code`}
        </div>
        <div className="flex items-center gap-1">
          {saveStatus === "saving"  && <span className="text-yellow-400 text-[10px]">● Saving…</span>}
          {saveStatus === "unsaved" && <span className="text-orange-400 text-[10px]">● Unsaved</span>}
          {saveStatus === "saved"   && <span className="text-emerald-400 text-[10px]">✓ Saved</span>}
          <button onClick={() => colorInputRef.current?.click()} className="p-1 hover:bg-white/10 rounded transition-all text-violet-400" title="Add Color">
            <Palette size={14} />
          </button>
          <input
            type="color"
            ref={colorInputRef}
            className="hidden"
            onChange={(e) => insertColor(e.target.value)}
          />
          <button onClick={()=>setIsPreviewOpen(v=>!v)} className="p-1 hover:bg-white/10 rounded transition-all" title="Preview"><SplitSquareHorizontal size={14}/></button>
          <button onClick={runPreview} className="p-1 hover:bg-white/10 rounded transition-all" title="Run"><Play size={14} className="text-emerald-400"/></button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-1 shrink-0 border-r border-[#252526] select-none">
          {([
            {id:"explorer", icon:<Layers size={22}/>, label:"Explorer"},
            {id:"search",   icon:<Search size={22}/>,  label:"Search"},
            {id:"git",      icon:<GitBranch size={22}/>,label:"Source Control"},
            {id:"extensions",icon:<Package size={22}/>, label:"Extensions"},
          ] as {id:ActivePanel;icon:React.ReactNode;label:string}[]).map(item=>(
            <button key={item.id}
              onClick={()=>setActivePanel(prev=>prev===item.id?prev:item.id)}
              title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded transition-all relative ${
                activePanel===item.id?"text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-400":"text-[#858585] hover:text-[#cccccc]"
              }`}
            >{item.icon}</button>
          ))}
          <div className="flex-1"/>
          <button className="w-10 h-10 flex items-center justify-center text-[#858585] hover:text-[#cccccc]" title="Settings"><Settings size={22}/></button>
        </div>

        {/* Side Panel */}
        <div className="w-56 bg-[#252526] flex flex-col shrink-0 border-r border-[#1e1e1e] overflow-hidden">
          {activePanel === "explorer" && (
            <>
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e1e1e] shrink-0">
                <span className="text-[11px] font-bold text-[#bbbbbb] uppercase tracking-widest">MACROTAR CODE</span>
                <div className="flex items-center gap-1">
                  <button onClick={()=>setShowNewFileDialog(true)} title="New File" className="p-1 hover:bg-white/10 rounded text-[#cccccc]"><Plus size={13}/></button>
                  <button onClick={()=>setPhase("pick")} title="Open Different Folder" className="p-1 hover:bg-white/10 rounded text-[#cccccc]"><FolderOpen size={13}/></button>
                </div>
              </div>
              <button onClick={()=>setExplorerOpen(v=>!v)}
                className="flex items-center gap-1 px-2 py-1 text-[12px] font-bold text-[#cccccc] hover:bg-[#2a2d2e] w-full transition-all shrink-0">
                {explorerOpen?<ChevronDown size={14}/>:<ChevronRight size={14}/>}
                <Folder size={14} className="text-yellow-400"/>
                <span className="truncate uppercase text-[11px]">{dirName}</span>
              </button>
              <div className="flex-1 overflow-y-auto">
                {explorerOpen && (
                  <div className="pl-3">
                    {filteredFiles.length === 0 && (
                      <p className="text-[11px] text-[#555] px-2 py-2">No files.</p>
                    )}
                    {filteredFiles.map(file=>(
                      <div key={file.name} onClick={()=>openFile(file.name)} role="button" tabIndex={0}
                        onKeyDown={e=>{ if(e.key==="Enter"||e.key===" ") openFile(file.name); }}
                        className={`w-full flex items-center gap-1.5 px-2 py-1 text-[12px] rounded transition-all group cursor-pointer ${
                          activeTab===file.name?"bg-[#37373d] text-white":"hover:bg-[#2a2d2e] text-[#cccccc]"
                        }`}
                      >
                        {LANG_ICON[file.lang]}
                        <span className="truncate flex-1 text-left">{file.name}</span>
                        {!file.saved && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"/>}
                        <button onClick={(e)=>deleteFile(file.name,e)} title="Delete" className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-red-400 transition-all shrink-0">
                          <Trash2 size={10}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* New file dialog inline */}
                {showNewFileDialog && (
                  <div className="mx-2 mt-1 p-2 bg-[#1e1e1e] border border-[#454545] rounded-lg">
                    <p className="text-[10px] text-[#858585] mb-1">New file name:</p>
                    <input
                      autoFocus
                      value={newFileName}
                      onChange={e=>{ setNewFileName(e.target.value); setNewFileError(""); }}
                      onKeyDown={e=>{ if(e.key==="Enter") createNewFile(); if(e.key==="Escape"){setShowNewFileDialog(false);setNewFileName("");} }}
                      placeholder="e.g. index.html"
                      className="w-full bg-[#3c3c3c] text-[#cccccc] text-[11px] px-2 py-1 rounded border border-[#555] focus:outline-none focus:border-blue-500 placeholder-[#555]"
                    />
                    {newFileError && <p className="text-[10px] text-red-400 mt-1">{newFileError}</p>}
                    <div className="flex gap-1 mt-1.5">
                      <button onClick={createNewFile} className="flex-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-1 transition-all">Create</button>
                      <button onClick={()=>{setShowNewFileDialog(false);setNewFileName("");setNewFileError("");}} className="flex-1 text-[10px] bg-[#3c3c3c] hover:bg-[#484848] text-[#cccccc] rounded px-2 py-1 transition-all">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activePanel === "search" && (
            <div className="p-3 flex flex-col gap-2">
              <div className="text-[11px] font-bold text-[#bbbbbb] uppercase">Search in Files</div>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Search file name…"
                className="bg-[#3c3c3c] text-[12px] text-[#cccccc] px-2 py-1.5 rounded border border-[#555] focus:outline-none focus:border-blue-500 placeholder:text-[#555]"
              />
              <div className="text-[11px] text-[#555]">{filteredFiles.length} files found.</div>
              <div className="space-y-0.5">
                {filteredFiles.map(f=>(
                  <button key={f.name} onClick={()=>openFile(f.name)}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[#2a2d2e] text-[12px] text-[#cccccc]">
                    {LANG_ICON[f.lang]} {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "git" && (
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="text-[11px] font-bold text-[#bbbbbb] uppercase mb-2">Source Control</div>
              <div className="text-[12px] text-[#858585] flex items-center gap-1 mb-3"><GitBranch size={12}/> main</div>
              {unsavedFiles.length > 0 ? (
                <>
                  <div className="text-[11px] text-[#cccccc] mb-1">Changes ({unsavedFiles.length})</div>
                  {unsavedFiles.map(f=>(
                    <div key={f.name} className="flex items-center gap-2 px-2 py-1 text-[11px] text-orange-400">
                      <span className="w-1 h-1 rounded-full bg-orange-400"/>
                      {f.name} <span className="text-[#555]">M</span>
                    </div>
                  ))}
                </>
              ) : <div className="text-[11px] text-[#555]">No changes.</div>}
            </div>
          )}

          {activePanel === "extensions" && (
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="text-[11px] font-bold text-[#bbbbbb] uppercase mb-2">Extensions</div>
              {["HTML Snippets","CSS IntelliSense","JS Helper","Live Preview","Auto Save"].map(ext=>(
                <div key={ext} className="text-[12px] text-[#cccccc] py-1.5 border-b border-[#333] flex items-center justify-between">
                  <span>{ext}</span><span className="text-[10px] text-emerald-400">✓ Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Tabs */}
          <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto shrink-0 select-none">
            {openTabs.map(name=>{
              const f=allFiles.find(x=>x.name===name);
              return (
                <div key={name} onClick={()=>setActiveTab(name)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] border-r border-[#1e1e1e] cursor-pointer min-w-max transition-all ${
                    activeTab===name?"bg-[#1e1e1e] text-white border-t-2 border-t-blue-400":"bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]"
                  }`}
                >
                  {LANG_ICON[f?.lang||"other"]}
                  <span>{name}</span>
                  {f&&!f.saved&&<span className="w-1.5 h-1.5 rounded-full bg-orange-400"/>}
                  <button onClick={(e)=>closeTab(name,e)} className="w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded ml-1">
                    <X size={10}/>
                  </button>
                </div>
              );
            })}
            <button onClick={()=>setShowNewFileDialog(true)} className="px-3 py-2 text-[#858585] hover:text-[#cccccc] hover:bg-white/5 transition-all" title="New File"><Plus size={14}/></button>
          </div>

          {/* Editor + Preview */}
          <div className="flex flex-1 overflow-hidden">

            {/* Code Panel */}
            {activeTab ? (
              <div className={`flex flex-col ${isPreviewOpen&&!isFullPreview?"w-1/2":"w-full"} overflow-hidden relative`}>
                {/* Breadcrumb */}
                <div className="flex items-center justify-between px-4 py-0.5 bg-[#1e1e1e] border-b border-[#252526] text-[11px] text-[#858585] select-none">
                  <div className="flex items-center gap-1">
                    <Folder size={11} className="text-yellow-400"/>
                    <span>{dirName}</span>
                    <ChevronRight size={10}/>
                    <span className={LANG_COLOR[currentLang]}>{activeTab}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {snippetHint && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-400">
                        <Zap size={9}/> Enter/Tab → <code className="font-mono">{snippetHint.key}</code>
                      </span>
                    )}
                    <button onClick={()=>activeFile&&saveFile(activeFile.name,activeFile.content)}
                      className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-[10px] text-[#858585] hover:text-[#cccccc] transition-all" title="Save (Ctrl+S)">
                      <Save size={11}/> Save
                    </button>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex flex-1 overflow-hidden bg-[#1e1e1e] relative">
                  {/* IntelliSense Dropdown */}
                  {acList.length > 0 && (
                    <div className="absolute top-2 left-16 z-50 w-80 max-h-56 overflow-y-auto bg-[#252526] border border-[#454545] rounded-lg shadow-2xl text-[12px]" style={{scrollbarWidth:"thin"}}>
                      {acList.map((comp, idx) => (
                        <div
                          key={comp.label}
                          onMouseDown={e => { e.preventDefault(); applyCompletion(comp); }}
                          className={`flex items-start gap-2 px-3 py-1.5 cursor-pointer transition-all ${
                            idx === acIndex ? "bg-[#094771] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                          }`}
                        >
                          <span className={`text-[10px] font-bold font-mono w-8 shrink-0 mt-0.5 ${kindColor(comp.kind)}`}>{kindLabel(comp.kind)}</span>
                          <span className="flex-1 font-mono font-semibold truncate">{comp.label}</span>
                          <span className="text-[10px] text-[#858585] shrink-0 max-w-[100px] truncate">{comp.detail}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 px-3 py-1 border-t border-[#333] text-[10px] text-[#555]">
                        <span>↑↓ Navigate</span><span>↵ Tab Select</span><span>Esc Close</span>
                      </div>
                    </div>
                  )}
                  {/* Line numbers */}
                  <div className="text-right text-[12px] leading-[1.4rem] font-mono py-3 pr-4 pl-3 bg-[#1e1e1e] select-none min-w-[3.5rem] text-[#495162]" aria-hidden>
                    {lines.map((_,i)=><div key={i} className="h-[1.4rem]">{i+1}</div>)}
                  </div>
                  <textarea
                    ref={textareaRef}
                    key={activeTab}
                    value={currentCode}
                    onChange={e=>{ handleCodeChange(e.target.value); updateAC(e.target.value, e.target.selectionStart); }}
                    onKeyDown={handleKeyDown}
                    onClick={updateCursor}
                    onKeyUp={updateCursor}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="flex-1 resize-none bg-[#1e1e1e] text-[#d4d4d4] text-[13px] leading-[1.4rem] px-4 py-3 focus:outline-none overflow-auto caret-white w-full"
                    style={{fontFamily:"'Fira Code','Cascadia Code','Consolas',monospace", tabSize:2}}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-[#555] flex-col gap-3">
                <Code size={48} className="text-[#333]"/>
                <p className="text-[13px]">Select a file from the left to edit.</p>
                <button onClick={()=>setShowNewFileDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#252526] hover:bg-[#2a2d2e] rounded-lg text-[#cccccc] text-sm transition-all">
                  <Plus size={14}/> Create New File
                </button>
              </div>
            )}

            {/* Preview Panel */}
            {isPreviewOpen && (
              <div className={`flex flex-col ${isFullPreview?"w-full":"w-1/2"} border-l border-[#252526]`}>
                <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#1e1e1e] text-[11px] text-[#cccccc] select-none">
                  <div className="flex items-center gap-2"><Monitor size={12} className="text-emerald-400"/><span>Live Preview</span></div>
                  <div className="flex items-center gap-1">
                    <button onClick={runPreview} className="p-1 hover:bg-white/10 rounded" title="Refresh"><RefreshCw size={11}/></button>
                    <button onClick={()=>setIsFullPreview(v=>!v)} className="p-1 hover:bg-white/10 rounded">{isFullPreview?<Minimize2 size={11}/>:<Maximize2 size={11}/>}</button>
                    <button onClick={()=>setIsPreviewOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={11}/></button>
                  </div>
                </div>
                <iframe key={previewKey} srcDoc={previewSrc} sandbox="allow-scripts allow-same-origin" className="flex-1 bg-white" title="Preview"/>
              </div>
            )}
          </div>

          {/* Terminal */}
          {isTerminalOpen && (
            <div className="h-36 bg-[#1e1e1e] border-t border-[#252526] flex flex-col shrink-0">
              <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#1e1e1e] select-none">
                <div className="flex items-center gap-2 text-[11px] text-[#cccccc]"><Terminal size={12}/><span className="font-semibold text-white">TERMINAL</span></div>
                <button onClick={()=>setIsTerminalOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={11}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 text-[11px]" style={{fontFamily:"'Cascadia Code','Fira Code',monospace"}}>
                {terminalLines.map((l,i)=>(
                  <div key={i} className={i===0?"text-[#569cd6] font-bold":l.includes("✓")?"text-emerald-400":"text-[#cccccc]"}>{`> ${l}`}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-[#007acc] text-white text-[11px] px-3 py-0.5 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded transition-all"><ArrowLeft size={11}/> Back</button>
          <button onClick={()=>setPhase("pick")} className="flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded transition-all"><FolderOpen size={11}/> {dirName}</button>
          <span className="flex items-center gap-1"><GitBranch size={11}/> main</span>
          <span className="flex items-center gap-1"><AlertCircle size={11}/> 0 <CheckCircle2 size={11} className="ml-1"/> 0</span>
        </div>
        <div className="flex items-center gap-3">
          {activeTab && (
            <>
              <span>Ln {cursorInfo.line}, Col {cursorInfo.col}</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span className={`font-semibold ${LANG_COLOR[currentLang]}`}>{getLangLabel(currentLang)}</span>
            </>
          )}
          <button onClick={()=>setIsTerminalOpen(v=>!v)} className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"><Terminal size={11}/> Terminal</button>
          <button onClick={runPreview} className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"><Play size={11}/> Preview</button>
          {activeFile&&!activeFile.saved&&(
            <button onClick={()=>saveFile(activeFile.name,activeFile.content)} className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"><Save size={11}/> Save</button>
          )}
        </div>
      </div>
    </div>
  );
}
