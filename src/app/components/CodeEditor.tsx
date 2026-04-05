"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Copy, Check, RefreshCw, Play, Download, Monitor, Maximize2, Minimize2,
  FileCode, FileCode2, Braces, Terminal, Zap, RotateCcw, ChevronRight,
  ChevronDown, Code, Search, GitBranch, Package, Settings, X, Plus,
  FolderOpen, File, Circle, AlertCircle, CheckCircle2, Bell, Layout,
  SplitSquareHorizontal, Star, BookOpen, ArrowRight, Folder, ArrowLeft,
  Coffee, Layers, Cpu, Clock
} from "lucide-react";
import { getCompletions, kindColor, kindLabel, parseEmmet, type Completion, type EditorLang } from "./intellisense";

interface CodeEditorProps {
  onBack: () => void;
  initialLang?: "html" | "css" | "js";
}

// ─── Emmet / Snippet tablosu ─────────────────────────────────────────────────
const HTML_SNIPPETS: Record<string, string> = {
  "!": `<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Başlık</title>\n</head>\n<body>\n  \n</body>\n</html>`,
  "html": `<html lang="tr">\n  \n</html>`, "head": `<head>\n  <meta charset="UTF-8" />\n  <title>Başlık</title>\n</head>`,
  "body": `<body>\n  \n</body>`, "div": `<div>\n  \n</div>`, "span": `<span></span>`,
  "p": `<p></p>`, "h1": `<h1></h1>`, "h2": `<h2></h2>`, "h3": `<h3></h3>`,
  "h4": `<h4></h4>`, "ul": `<ul>\n  <li></li>\n  <li></li>\n</ul>`, "ol": `<ol>\n  <li></li>\n  <li></li>\n</ol>`,
  "li": `<li></li>`, "a": `<a href="#"></a>`, "img": `<img src="" alt="" />`,
  "input": `<input type="text" placeholder="" />`, "button": `<button type="button"></button>`,
  "form": `<form action="" method="post">\n  \n</form>`, "select": `<select>\n  <option value=""></option>\n</select>`,
  "textarea": `<textarea rows="4" cols="50"></textarea>`,
  "table": `<table>\n  <thead><tr><th></th></tr></thead>\n  <tbody><tr><td></td></tr></tbody>\n</table>`,
  "nav": `<nav>\n  \n</nav>`, "header": `<header>\n  \n</header>`, "main": `<main>\n  \n</main>`,
  "footer": `<footer>\n  \n</footer>`, "section": `<section>\n  \n</section>`,
  "article": `<article>\n  \n</article>`, "script": `<script>\n  \n</script>`,
  "style": `<style>\n  \n</style>`, "link": `<link rel="stylesheet" href="style.css" />`,
  "br": `<br />`, "hr": `<hr />`, "canvas": `<canvas id="canvas" width="500" height="400"></canvas>`,
  "lorem": `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
};
const CSS_SNIPPETS: Record<string, string> = {
  "body": `body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n  box-sizing: border-box;\n}`,
  "flex": `display: flex;\njustify-content: center;\nalign-items: center;`,
  "grid": `display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 16px;`,
  "reset": `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}`,
  "var": `:root {\n  --primary: #6366f1;\n  --bg: #0f172a;\n  --text: #f1f5f9;\n}`,
  "anim": `@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}`,
  "media": `@media (max-width: 768px) {\n  \n}`,
  "card": `.card {\n  background: #fff;\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 4px 24px rgba(0,0,0,0.1);\n}`,
  "btn": `.btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 20px;\n  background: #6366f1;\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  transition: opacity 0.2s;\n}\n.btn:hover { opacity: 0.85; }`,
  "glass": `background: rgba(255,255,255,0.1);\nbackdrop-filter: blur(20px);\nborder: 1px solid rgba(255,255,255,0.2);\nborder-radius: 16px;`,
  "gradient": `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`,
};
const JS_SNIPPETS: Record<string, string> = {
  "cl": `console.log()`, "log": `console.log()`,
  "fn": `function name() {\n  \n}`, "arrow": `const name = () => {\n  \n};`,
  "const": `const name = ;`, "let": `let name = ;`,
  "if": `if (condition) {\n  \n}`, "ife": `if (condition) {\n  \n} else {\n  \n}`,
  "for": `for (let i = 0; i < array.length; i++) {\n  \n}`,
  "forof": `for (const item of array) {\n  \n}`,
  "map": `array.map((item) => {\n  return item;\n});`,
  "filter": `array.filter((item) => item);`,
  "promise": `new Promise((resolve, reject) => {\n  \n});`,
  "async": `async function name() {\n  try {\n    const result = await ;\n  } catch (err) {\n    console.error(err);\n  }\n}`,
  "fetch": `fetch('url')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`,
  "qs": `document.querySelector('')`, "qsa": `document.querySelectorAll('')`,
  "ae": `element.addEventListener('click', (e) => {\n  \n});`,
  "class": `class Name {\n  constructor() {\n    \n  }\n  method() {\n    \n  }\n}`,
  "try": `try {\n  \n} catch (err) {\n  console.error(err);\n}`,
  "set": `setTimeout(() => {\n  \n}, 1000);`,
  "raf": `requestAnimationFrame(function loop() {\n  \n  requestAnimationFrame(loop);\n});`,
};

const AUTO_CLOSE: Record<string, string> = { "{": "}", "(": ")", "[": "]", '"': '"', "'": "'", "`": "`" };
const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);

function getAutoCloseTag(beforeCursor: string): string | null {
  const match = beforeCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>$/);
  if (!match) return null;
  const tag = match[1].toLowerCase();
  if (VOID_TAGS.has(tag)) return null;
  return tag;
}
function getCurrentIndent(code: string, cursorPos: number): string {
  const lineStart = code.lastIndexOf("\n", cursorPos - 1) + 1;
  const line = code.substring(lineStart, cursorPos);
  const match = line.match(/^(\s*)/);
  return match ? match[1] : "";
}

const FILE_LANG_MAP: Record<string, "html" | "css" | "js"> = {
  "index.html": "html", "style.css": "css", "script.js": "js",
};

const FILE_DEFAULTS: Record<string, string> = {
  "index.html": `<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Word P. Projesi</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <div class="container">\n    <h1>Merhaba Word P. Code! 👋</h1>\n    <p>Kodlamaya başlamak için bu dosyayı düzenleyin.</p>\n    <button class="btn" onclick="onClick()">Tıkla</button>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`,
  "style.css": `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Segoe UI', sans-serif;\n  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);\n  min-height: 100vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  color: white;\n}\n\n.container {\n  text-align: center;\n  padding: 60px;\n  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(20px);\n  border-radius: 24px;\n  border: 1px solid rgba(255,255,255,0.1);\n  box-shadow: 0 30px 60px rgba(0,0,0,0.3);\n}\n\nh1 {\n  font-size: 2.5rem;\n  margin-bottom: 16px;\n  background: linear-gradient(90deg, #a78bfa, #60a5fa);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\np {\n  color: rgba(255,255,255,0.6);\n  margin-bottom: 32px;\n  font-size: 1.1rem;\n}\n\n.btn {\n  padding: 12px 32px;\n  background: linear-gradient(135deg, #6366f1, #8b5cf6);\n  color: white;\n  border: none;\n  border-radius: 12px;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n\n.btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 30px rgba(99,102,241,0.5);\n}`,
  "script.js": `// Word P. Code - JavaScript\nconsole.log('Merhaba Word P. Code! 🚀');\n\nfunction onClick() {\n  const btn = document.querySelector('.btn');\n  btn.textContent = 'Tıklandı! ✅';\n  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';\n  \n  setTimeout(() => {\n    btn.textContent = 'Tıkla';\n    btn.style.background = '';\n  }, 2000);\n}\n\n// Sayfa yüklendiğinde\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('Sayfa hazır!');\n  animateTitle();\n});\n\nfunction animateTitle() {\n  const h1 = document.querySelector('h1');\n  if (!h1) return;\n  h1.style.transition = 'all 0.5s ease';\n  h1.style.opacity = '0';\n  h1.style.transform = 'translateY(-20px)';\n  setTimeout(() => {\n    h1.style.opacity = '1';\n    h1.style.transform = 'translateY(0)';\n  }, 100);\n}`,
};

type ActivePanel = "explorer" | "search" | "git" | "extensions" | null;

function buildPreviewHTML(files: Record<string, string>) {
  const html = files["index.html"] || "";
  const css = files["style.css"] || "";
  const js = files["script.js"] || "";
  return html
    .replace("</head>", `<style>${css}</style></head>`)
    .replace("</body>", `<script>${js}<\/script></body>`);
}

export default function CodeEditor({ onBack, initialLang = "html" }: CodeEditorProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>(["index.html"]);
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [files, setFiles] = useState<Record<string, string>>(FILE_DEFAULTS);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Word P. Code Terminal v1.0.0",
    "Hazır. Kodunuzu yazın ve Ctrl+Enter ile çalıştırın.",
  ]);
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [snippetHint, setSnippetHint] = useState<{key:string;preview:string}|null>(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [autoRun, setAutoRun] = useState(false);
  // IntelliSense
  const [acList, setAcList] = useState<Completion[]>([]);
  const [acIndex, setAcIndex] = useState(0);
  const [acWord, setAcWord] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acRef = useRef<HTMLDivElement>(null);

  const currentLang: "html" | "css" | "js" = FILE_LANG_MAP[activeFile] || "html";
  const currentCode = files[activeFile] || "";
  const snippets = currentLang === "html" ? HTML_SNIPPETS : currentLang === "css" ? CSS_SNIPPETS : JS_SNIPPETS;

  const LANG_COLORS: Record<string, string> = { html: "text-orange-400", css: "text-blue-400", js: "text-yellow-400" };
  const LANG_DOTS: Record<string, string> = { html: "bg-orange-400", css: "bg-blue-400", js: "bg-yellow-400" };
  const FILE_ICONS: Record<string, React.ReactNode> = {
    "index.html": <FileCode size={13} className="text-orange-400" />,
    "style.css": <Braces size={13} className="text-blue-400" />,
    "script.js": <FileCode2 size={13} className="text-yellow-300" />,
  };

  const handleCodeChange = (val: string) => {
    setFiles(prev => ({ ...prev, [activeFile]: val }));
  };

  const openFile = (name: string) => {
    if (!openFiles.includes(name)) setOpenFiles(prev => [...prev, name]);
    setActiveFile(name);
    setShowWelcome(false);
  };

  const closeFile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openFiles.filter(f => f !== name);
    setOpenFiles(next);
    if (activeFile === name) {
      setActiveFile(next[next.length - 1] || "");
      setShowWelcome(next.length === 0);
    }
  };

  const runPreview = useCallback(() => {
    setIsPreviewOpen(true);
    setPreviewKey(k => k + 1);
    const now = new Date().toLocaleTimeString("tr-TR");
    setTerminalLines(prev => [...prev, `[${now}] Proje derlendi ve önizleme başlatıldı ✓`]);
  }, []);

  useEffect(() => {
    if (autoRun) {
      const t = setTimeout(() => setPreviewKey(k => k + 1), 700);
      return () => clearTimeout(t);
    }
  }, [files, autoRun]);

  // ── IntelliSense güncelle ────────────────────────────────────────────────
  const updateAC = (val: string, cursor: number) => {
    const before = val.substring(0, cursor);
    const wm = before.match(/[\w!][\w.#-]*$/);
    if (!wm || wm[0].length < 1) { setAcList([]); setAcWord(""); return; }
    const word = wm[0];
    // Emmet: div.class, span#id vb.
    if (currentLang === "html" && (word.includes(".") || word.includes("#"))) {
      const emmet = parseEmmet(word);
      if (emmet) {
        setAcList([{ label: word, insert: emmet, kind: "snippet", detail: "Emmet → Enter/Tab" }]);
        setAcWord(word); setAcIndex(0); return;
      }
    }
    const lang: EditorLang = currentLang === "html" ? "html" : currentLang === "css" ? "css" : "js";
    const completions = getCompletions(lang, word);
    setAcList(completions);
    setAcWord(word);
    setAcIndex(0);
  };

  // ── Snippet hint (eski uyumluluk) ────────────────────────────────────────
  const updateSnippetHint = (val: string, cursor: number) => {
    const before = val.substring(0, cursor);
    const wordMatch = before.match(/[\w!]+$/);
    if (!wordMatch) { setSnippetHint(null); return; }
    const word = wordMatch[0];
    const match = snippets[word];
    if (match) setSnippetHint({ key: word, preview: match.substring(0, 50) });
    else setSnippetHint(null);
  };

  // ── AC seçim uygula ──────────────────────────────────────────────────────
  const applyCompletion = (comp: Completion) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const code = ta.value;
    const cursor = ta.selectionStart;
    const before = code.substring(0, cursor);
    const wm = before.match(/[\w!-]+$/);
    const wordLen = wm ? wm[0].length : 0;
    const wordStart = cursor - wordLen;
    const indent = before.lastIndexOf("\n") === -1 ? "" : before.match(/\n(\s*)(?=[^\n]*$)/)?.[1] || "";
    const indented = comp.insert.split("\n").map((l, i) => i === 0 ? l : indent + l).join("\n");
    const newCode = code.substring(0, wordStart) + indented + code.substring(cursor);
    handleCodeChange(newCode);
    // cursor: find first empty placeholder or end
    const emptyIdx = indented.indexOf("\n  \n");
    const newCursor = emptyIdx !== -1 ? wordStart + emptyIdx + 3 : wordStart + indented.length;
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = newCursor;
      ta.focus();
    }, 0);
    setAcList([]);
    setAcWord("");
    setSnippetHint(null);
  };

  const expandSnippet = (ta: HTMLTextAreaElement, code: string, cursor: number): boolean => {
    const before = code.substring(0, cursor);
    const wordMatch = before.match(/[\w!][\w.#-]*$/);
    if (!wordMatch) return false;
    const word = wordMatch[0];
    // Emmet genişletme (HTML)
    if (currentLang === "html" && (word.includes(".") || word.includes("#"))) {
      const emmet = parseEmmet(word);
      if (emmet) {
        const wordStart = cursor - word.length;
        const indent = getCurrentIndent(code, wordStart);
        const indented = emmet.split("\n").map((l, i) => i === 0 ? l : indent + l).join("\n");
        const newCode = code.substring(0, wordStart) + indented + code.substring(cursor);
        handleCodeChange(newCode);
        const ei = indented.indexOf("\n  \n");
        const nc = ei !== -1 ? wordStart + ei + 3 : wordStart + indented.length;
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = nc; ta.focus(); }, 0);
        setAcList([]); setSnippetHint(null);
        return true;
      }
    }
    const expansion = snippets[word];
    if (!expansion) return false;
    const wordStart = cursor - word.length;
    const indent = getCurrentIndent(code, wordStart);
    const indented = expansion.split("\n").map((l, i) => i === 0 ? l : indent + l).join("\n");
    const newCode = code.substring(0, wordStart) + indented + code.substring(cursor);
    handleCodeChange(newCode);
    const emptyIdx = indented.indexOf("\n  \n");
    const newCursor = emptyIdx !== -1 ? wordStart + emptyIdx + 3 : wordStart + indented.length;
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = newCursor; ta.focus(); }, 0);
    setSnippetHint(null);
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // ── AC klavye navigasyonu ─────────────────────────────────────────────────
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

    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      const ls = code.lastIndexOf("\n", start - 1) + 1;
      const le = code.indexOf("\n", start);
      const line = code.substring(ls, le === -1 ? code.length : le);
      const ip = le === -1 ? code.length : le;
      const newCode = code.substring(0, ip) + "\n" + line + code.substring(ip);
      handleCodeChange(newCode);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = ip + 1 + (start - ls); }, 0);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      const ls = code.lastIndexOf("\n", start - 1) + 1;
      const le = code.indexOf("\n", start);
      const line = code.substring(ls, le === -1 ? code.length : le);
      let newLine: string; let offset: number;
      if (currentLang === "html") {
        if (line.trimStart().startsWith("<!--")) { newLine = line.replace(/^(\s*)<!--\s?/, "$1").replace(/\s?-->$/, ""); offset = newLine.length - line.length; }
        else { newLine = line.replace(/^(\s*)/, "$1<!-- ") + " -->"; offset = 5; }
      } else {
        if (line.trimStart().startsWith("//")) { newLine = line.replace(/^(\s*)\/\/\s?/, "$1"); offset = newLine.length - line.length; }
        else { newLine = line.replace(/^(\s*)/, "$1// "); offset = 3; }
      }
      const e2 = le === -1 ? code.length : le;
      handleCodeChange(code.substring(0, ls) + newLine + code.substring(e2));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + offset; }, 0);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault(); runPreview(); return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (expandSnippet(ta, code, start)) return;
      if (start !== end) {
        const selected = code.substring(start, end);
        const indented = selected.split("\n").map(l => "  " + l).join("\n");
        handleCodeChange(code.substring(0, start) + indented + code.substring(end));
        setTimeout(() => { ta.selectionStart = start; ta.selectionEnd = start + indented.length; }, 0);
      } else {
        handleCodeChange(code.substring(0, start) + "  " + code.substring(end));
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (expandSnippet(ta, code, start)) return;
      const before = code.substring(0, start);
      const after = code.substring(end);
      const indent = getCurrentIndent(code, start);
      const prevChar = before.slice(-1);
      const nextChar = after[0];
      if ((prevChar === "{" && nextChar === "}") || (prevChar === "[" && nextChar === "]") || (prevChar === "(" && nextChar === ")")) {
        const newCode = before + "\n" + indent + "  " + "\n" + indent + after;
        handleCodeChange(newCode);
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1 + indent.length + 2; }, 0);
        return;
      }
      const extra = prevChar === "{" || prevChar === "[" || prevChar === "(" ? "  " : "";
      handleCodeChange(before + "\n" + indent + extra + after);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1 + indent.length + extra.length; }, 0);
      return;
    }
    if (AUTO_CLOSE[e.key] && !e.ctrlKey && !e.metaKey) {
      const close = AUTO_CLOSE[e.key];
      if ((e.key === '"' || e.key === "'" || e.key === "`") && code[start] === e.key) {
        e.preventDefault(); setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1; }, 0); return;
      }
      if (start === end) {
        e.preventDefault();
        handleCodeChange(code.substring(0, start) + e.key + close + code.substring(end));
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1; }, 0); return;
      }
    }
    if ((e.key === ")" || e.key === "]" || e.key === "}") && code[start] === e.key) {
      e.preventDefault(); setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1; }, 0); return;
    }
    if (e.key === "Backspace" && start === end) {
      const prev = code[start - 1]; const next = code[start];
      if (prev && next && AUTO_CLOSE[prev] === next) {
        e.preventDefault();
        handleCodeChange(code.substring(0, start - 1) + code.substring(start + 1));
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start - 1; }, 0); return;
      }
    }
    if (e.key === ">" && currentLang === "html" && !e.ctrlKey) {
      const before2 = code.substring(0, start) + ">";
      const tag = getAutoCloseTag(before2);
      if (tag) {
        e.preventDefault();
        handleCodeChange(code.substring(0, start) + `></${tag}>` + code.substring(end));
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1; }, 0); return;
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = activeFile; a.click();
    URL.revokeObjectURL(url);
  };

  const lines = currentCode.split("\n");
  const previewSrc = buildPreviewHTML(files);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Title Bar ── */}
      <div className="flex items-center bg-[#323233] px-2 py-1 text-[12px] text-[#cccccc] shrink-0 gap-2">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-2">
          <button onClick={onBack} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all flex items-center justify-center group" title="Geri">
            <X size={7} className="opacity-0 group-hover:opacity-100 text-red-900" />
          </button>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c940]" />
        </div>

        {/* Menu bar */}
        {["Dosya", "Düzen", "Seçim", "Görünüm", "Git", "Çalıştır", "Terminal", "Yardım"].map(m => (
          <span key={m} className="px-1.5 py-0.5 hover:bg-white/10 rounded cursor-pointer transition-all">{m}</span>
        ))}

        {/* Title center */}
        <div className="flex-1 text-center text-[#cccccc]/70 text-[11px] pointer-events-none">
          {activeFile ? `${activeFile} — Word P. Code` : "Word P. Code"}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPreviewOpen(v => !v)} className="p-1 hover:bg-white/10 rounded transition-all" title="Önizleme">
            <SplitSquareHorizontal size={14} />
          </button>
          <button onClick={runPreview} className="p-1 hover:bg-white/10 rounded transition-all" title="Çalıştır (Ctrl+Enter)">
            <Play size={14} className="text-emerald-400" />
          </button>
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Activity Bar ── */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-1 shrink-0 border-r border-[#252526]">
          {[
            { id: "explorer", icon: <Layers size={22} />, label: "Gezgin" },
            { id: "search", icon: <Search size={22} />, label: "Arama" },
            { id: "git", icon: <GitBranch size={22} />, label: "Kaynak Kontrol" },
            { id: "extensions", icon: <Package size={22} />, label: "Uzantılar" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActivePanel(prev => prev === item.id ? null : item.id as ActivePanel)}
              title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded transition-all relative group ${
                activePanel === item.id
                  ? "text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-400"
                  : "text-[#858585] hover:text-[#cccccc]"
              }`}
            >
              {item.icon}
            </button>
          ))}
          <div className="flex-1" />
          <button className="w-10 h-10 flex items-center justify-center text-[#858585] hover:text-[#cccccc] transition-all" title="Ayarlar">
            <Settings size={22} />
          </button>
        </div>

        {/* ── Side Panel ── */}
        {activePanel && (
          <div className="w-56 bg-[#252526] flex flex-col shrink-0 border-r border-[#1e1e1e]">
            {activePanel === "explorer" && (
              <>
                <div className="px-4 py-2 text-[11px] font-bold text-[#bbbbbb] uppercase tracking-widest border-b border-[#1e1e1e]">
                  WORD P. CODE
                </div>
                <button
                  onClick={() => setExplorerOpen(v => !v)}
                  className="flex items-center gap-1 px-2 py-1.5 text-[12px] font-bold text-[#cccccc] hover:bg-[#2a2d2e] w-full transition-all"
                >
                  {explorerOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Folder size={14} className="text-yellow-400" />
                  <span>PROJE</span>
                </button>
                {explorerOpen && (
                  <div className="pl-4">
                    {Object.keys(files).map(name => (
                      <button
                        key={name}
                        onClick={() => openFile(name)}
                        className={`w-full flex items-center gap-2 px-2 py-1 text-[12px] rounded transition-all ${
                          activeFile === name && !showWelcome
                            ? "bg-[#37373d] text-white"
                            : "hover:bg-[#2a2d2e] text-[#cccccc]"
                        }`}
                      >
                        {FILE_ICONS[name]}
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {activePanel === "search" && (
              <div className="p-3 flex flex-col gap-2">
                <div className="text-[11px] font-bold text-[#bbbbbb] uppercase">Ara</div>
                <input
                  placeholder="Dosyalarda ara..."
                  className="bg-[#3c3c3c] text-[12px] text-[#cccccc] px-2 py-1.5 rounded border border-[#555] focus:outline-none focus:border-blue-500 placeholder:text-[#858585]"
                />
              </div>
            )}
            {activePanel === "git" && (
              <div className="p-3">
                <div className="text-[11px] font-bold text-[#bbbbbb] uppercase mb-2">Kaynak Kontrol</div>
                <div className="text-[12px] text-[#858585] flex items-center gap-1">
                  <GitBranch size={12} /> main
                </div>
                <div className="text-[11px] text-[#858585] mt-4">Değişiklik yok.</div>
              </div>
            )}
            {activePanel === "extensions" && (
              <div className="p-3">
                <div className="text-[11px] font-bold text-[#bbbbbb] uppercase mb-2">Uzantılar</div>
                {["HTML Snippets", "CSS IntelliSense", "JS Helper", "Live Preview"].map(ext => (
                  <div key={ext} className="text-[12px] text-[#cccccc] py-1.5 border-b border-[#333] flex items-center justify-between">
                    <span>{ext}</span>
                    <span className="text-[10px] text-emerald-400">✓ Aktif</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Editor Area ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto shrink-0">
            {showWelcome && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] text-[12px] text-[#cccccc] border-r border-[#1e1e1e] cursor-pointer min-w-max">
                <Star size={12} className="text-yellow-400" />
                <span>Hoş Geldiniz</span>
                <button
                  onClick={() => { setShowWelcome(false); if (openFiles.length === 0) { openFile("index.html"); } }}
                  className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            {openFiles.map(name => (
              <div
                key={name}
                onClick={() => { setActiveFile(name); setShowWelcome(false); }}
                className={`flex items-center gap-2 px-4 py-2 text-[12px] border-r border-[#1e1e1e] cursor-pointer min-w-max transition-all ${
                  activeFile === name && !showWelcome
                    ? "bg-[#1e1e1e] text-white border-t-2 border-t-blue-400"
                    : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]"
                }`}
              >
                {FILE_ICONS[name]}
                <span>{name}</span>
                <button
                  onClick={(e) => closeFile(name, e)}
                  className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button
              onClick={() => openFile("index.html")}
              className="px-3 py-2 text-[#858585] hover:text-[#cccccc] hover:bg-white/5 transition-all"
              title="Dosya Aç"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Editor / Welcome */}
          <div className="flex flex-1 overflow-hidden">
            {showWelcome ? (
              /* ── Welcome Screen ── */
              <div className="flex-1 bg-[#1e1e1e] overflow-y-auto">
                <div className="max-w-2xl mx-auto px-12 py-16">
                  {/* Logo & Title */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                      <Code size={28} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-[28px] font-light text-white leading-tight">Word P. Code</h1>
                      <p className="text-[13px] text-[#858585]">Kodlamayı Kolaylaştırıyoruz</p>
                    </div>
                  </div>

                  <div className="h-px bg-[#333] my-8" />

                  <div className="grid grid-cols-2 gap-12">
                    {/* Start */}
                    <div>
                      <h2 className="text-[13px] font-semibold text-[#cccccc] mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-blue-400" /> Başlat
                      </h2>
                      <div className="space-y-2">
                        {[
                          { label: "Yeni Dosya...", icon: <File size={14} />, action: () => openFile("index.html") },
                          { label: "index.html Aç", icon: <FileCode size={14} className="text-orange-400" />, action: () => openFile("index.html") },
                          { label: "style.css Aç", icon: <Braces size={14} className="text-blue-400" />, action: () => openFile("style.css") },
                          { label: "script.js Aç", icon: <FileCode2 size={14} className="text-yellow-400" />, action: () => openFile("script.js") },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="flex items-center gap-2 text-[13px] text-[#3794ff] hover:text-blue-300 hover:underline transition-all w-full text-left"
                          >
                            {item.icon} {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent */}
                    <div>
                      <h2 className="text-[13px] font-semibold text-[#cccccc] mb-4 flex items-center gap-2">
                        <Clock size={14} className="text-violet-400" /> Son Kullanılan
                      </h2>
                      <div className="space-y-2">
                        {["index.html", "style.css", "script.js"].map(f => (
                          <button
                            key={f}
                            onClick={() => openFile(f)}
                            className="flex items-center gap-2 text-[13px] text-[#3794ff] hover:text-blue-300 hover:underline transition-all w-full text-left"
                          >
                            {FILE_ICONS[f]} {f}
                            <span className="text-[#858585] text-[11px] ml-auto">~/proje</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[#333] my-8" />

                  {/* Walkthroughs */}
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#cccccc] mb-4 flex items-center gap-2">
                      <BookOpen size={14} className="text-emerald-400" /> İpuçları
                    </h2>
                    <div className="space-y-3">
                      {[
                        { title: "Emmet Kısayolları", desc: "! yazıp Enter/Tab'a bas → HTML şablonu", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                        { title: "Akıllı Tamamlama", desc: "div, p, h1, ul, class, fn gibi kısayolları dene", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                        { title: "Canlı Önizleme", desc: "Ctrl+Enter ile anlık önizleme başlat", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                        { title: "Çoklu Dosya", desc: "HTML, CSS ve JS dosyalarını birlikte düzenle", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
                      ].map(item => (
                        <div key={item.title} className={`flex items-start gap-3 p-3 rounded-lg border ${item.bg}`}>
                          <ArrowRight size={14} className={`${item.color} mt-0.5 shrink-0`} />
                          <div>
                            <div className={`text-[12px] font-semibold ${item.color}`}>{item.title}</div>
                            <div className="text-[11px] text-[#858585] mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-[#333] my-8" />
                  <div className="text-[11px] text-[#858585] text-center">
                    Word P. Code — Tarayıcıda Çalışan IDE
                  </div>
                </div>
              </div>
            ) : (
              /* ── Code Editor ── */
              <div className="flex flex-1 overflow-hidden">
                {/* Editor */}
                <div className={`flex flex-col ${isPreviewOpen && !isFullPreview ? "w-1/2" : isFullPreview ? "hidden" : "w-full"} overflow-hidden relative`}>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1 px-4 py-1 bg-[#1e1e1e] border-b border-[#252526] text-[11px] text-[#858585]">
                    <span className="text-yellow-400">📁</span>
                    <span>proje</span>
                    <ChevronRight size={10} />
                    <span className={LANG_COLORS[currentLang]}>{activeFile}</span>
                  </div>

                  {/* ── IntelliSense Dropdown ── */}
                  {acList.length > 0 && (
                    <div ref={acRef} className="absolute top-8 left-16 z-50 w-80 max-h-56 overflow-y-auto bg-[#252526] border border-[#454545] rounded-lg shadow-2xl text-[12px]" style={{scrollbarWidth:"thin"}}>
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
                        <span>↑↓ Gezin</span><span>↵ Tab Seç</span><span>Esc Kapat</span>
                      </div>
                    </div>
                  )}

                  {/* Line Numbers + Textarea */}
                  <div className="flex flex-1 overflow-hidden bg-[#1e1e1e]">
                    <div
                      className="text-right text-[12px] leading-[1.4rem] font-mono py-3 pr-4 pl-3 bg-[#1e1e1e] select-none min-w-[3.5rem] text-[#495162]"
                      aria-hidden
                    >
                      {lines.map((_, i) => <div key={i} className="h-[1.4rem]">{i + 1}</div>)}
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={currentCode}
                      onChange={(e) => {
                        handleCodeChange(e.target.value);
                        updateAC(e.target.value, e.target.selectionStart);
                        updateSnippetHint(e.target.value, e.target.selectionStart);
                      }}
                      onKeyDown={handleKeyDown}
                      onClick={() => {
                        const ta = textareaRef.current;
                        if (!ta) return;
                        const before = ta.value.substring(0, ta.selectionStart).split("\n");
                        setCursorInfo({ line: before.length, col: before[before.length - 1].length + 1 });
                      }}
                      onKeyUp={() => {
                        const ta = textareaRef.current;
                        if (!ta) return;
                        const before = ta.value.substring(0, ta.selectionStart).split("\n");
                        setCursorInfo({ line: before.length, col: before[before.length - 1].length + 1 });
                      }}
                      spellCheck={false}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      className="flex-1 resize-none bg-[#1e1e1e] text-[#d4d4d4] text-[13px] leading-[1.4rem] px-4 py-3 focus:outline-none overflow-auto caret-white"
                      style={{ fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace", tabSize: 2 }}
                    />
                  </div>
                </div>

                {/* Preview */}
                {isPreviewOpen && (
                  <div className={`flex flex-col ${isFullPreview ? "w-full" : "w-1/2"} border-l border-[#252526]`}>
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#1e1e1e] text-[11px] text-[#cccccc]">
                      <div className="flex items-center gap-2">
                        <Monitor size={12} className="text-emerald-400" />
                        <span>Canlı Önizleme — proje</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={runPreview} className="p-1 hover:bg-white/10 rounded" title="Yenile">
                          <RefreshCw size={11} />
                        </button>
                        <button onClick={() => setIsFullPreview(v => !v)} className="p-1 hover:bg-white/10 rounded">
                          {isFullPreview ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                        </button>
                        <button onClick={() => setIsPreviewOpen(false)} className="p-1 hover:bg-white/10 rounded">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                    <iframe
                      key={previewKey}
                      srcDoc={previewSrc}
                      sandbox="allow-scripts allow-same-origin"
                      className="flex-1 bg-white"
                      title="Önizleme"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Terminal Panel ── */}
          {isTerminalOpen && (
            <div className="h-40 bg-[#1e1e1e] border-t border-[#252526] flex flex-col shrink-0">
              <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#1e1e1e]">
                <div className="flex items-center gap-2 text-[11px] text-[#cccccc]">
                  <Terminal size={12} /> <span className="text-white font-semibold">TERMINAL</span>
                </div>
                <button onClick={() => setIsTerminalOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={11} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] text-[#cccccc]" style={{ fontFamily: "'Cascadia Code','Fira Code',monospace" }}>
                {terminalLines.map((line, i) => (
                  <div key={i} className={i === 0 ? "text-[#569cd6] font-bold" : "text-[#cccccc]"}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between bg-[#007acc] text-white text-[11px] px-3 py-0.5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded transition-all"
          >
            <ArrowLeft size={11} /> Geri
          </button>
          <span className="flex items-center gap-1">
            <GitBranch size={11} /> main
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle size={11} /> 0
            <CheckCircle2 size={11} className="ml-1" /> 0
          </span>
        </div>
        <div className="flex items-center gap-3">
          {activeFile && !showWelcome && (
            <>
              <span>Satır {cursorInfo.line}, Sütun {cursorInfo.col}</span>
              <span>Boşluklar: 2</span>
              <span>UTF-8</span>
              <span className={LANG_COLORS[currentLang] + " font-semibold capitalize"}>
                {currentLang === "js" ? "JavaScript" : currentLang.toUpperCase()}
              </span>
            </>
          )}
          <button
            onClick={() => setIsTerminalOpen(v => !v)}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"
          >
            <Terminal size={11} /> Terminal
          </button>
          <button
            onClick={runPreview}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"
          >
            <Play size={11} /> Önizle
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        </div>
      </div>
    </div>
  );
}
