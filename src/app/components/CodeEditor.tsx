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
  WifiOff, Wifi, LogOut, Hash
} from "lucide-react";
import { getCompletions, kindColor, kindLabel, parseEmmet, getLanguageContext, type Completion, type EditorLang } from "./intellisense";

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
  "index.html": `<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Macrotar Projesi</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <div class="container">\n    <h1>Merhaba Macrotar Code! 👋</h1>\n    <p>Kodlamaya başlamak için bu dosyayı düzenleyin.</p>\n    <button class="btn" onclick="onClick()">Tıkla</button>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`,
  "style.css": `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Segoe UI', sans-serif;\n  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);\n  min-height: 100vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  color: white;\n}\n\n.container {\n  text-align: center;\n  padding: 60px;\n  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(20px);\n  border-radius: 24px;\n  border: 1px solid rgba(255,255,255,0.1);\n  box-shadow: 0 30px 60px rgba(0,0,0,0.3);\n}\n\nh1 {\n  font-size: 2.5rem;\n  margin-bottom: 16px;\n  background: linear-gradient(90deg, #a78bfa, #60a5fa);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\np {\n  color: rgba(255,255,255,0.6);\n  margin-bottom: 32px;\n  font-size: 1.1rem;\n}\n\n.btn {\n  padding: 12px 32px;\n  background: linear-gradient(135deg, #6366f1, #8b5cf6);\n  color: white;\n  border: none;\n  border-radius: 12px;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n\n.btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 30px rgba(99,102,241,0.5);\n}`,
  "script.js": `// Macrotar Code - JavaScript\nconsole.log('Merhaba Macrotar Code! 🚀');\n\nfunction onClick() {\n  const btn = document.querySelector('.btn');\n  btn.textContent = 'Tıklandı! ✅';\n  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';\n  \n  setTimeout(() => {\n    btn.textContent = 'Tıkla';\n    btn.style.background = '';\n  }, 2000);\n}\n\n// Sayfa yüklendiğinde\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('Sayfa hazır!');\n  animateTitle();\n});\n\nfunction animateTitle() {\n  const h1 = document.querySelector('h1');\n  if (!h1) return;\n  h1.style.transition = 'all 0.5s ease';\n  h1.style.opacity = '0';\n  h1.style.transform = 'translateY(-20px)';\n  setTimeout(() => {\n    h1.style.opacity = '1';\n    h1.style.transform = 'translateY(0)';\n  }, 100);\n}`,
};

type ActivePanel = "explorer" | "search" | "git" | "extensions" | null;
type BottomTab = "terminal" | "problems" | "output" | "debug";

interface Problem {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  file: string;
  line: number;
  col: number;
  source: string;
}

interface TerminalLine {
  text: string;
  type: "system" | "input" | "output" | "error" | "success" | "info";
  timestamp?: string;
}

interface OutputLine {
  text: string;
  type: "info" | "warn" | "error" | "success" | "dim";
  timestamp: string;
}

interface DebugLine {
  text: string;
  type: "log" | "warn" | "error" | "info" | "result";
  timestamp: string;
  source?: string;
}

function buildPreviewHTML(files: Record<string, string>) {
  const html = files["index.html"] || "";
  const css = files["style.css"] || "";
  const js = files["script.js"] || "";
  return html
    .replace("</head>", `<style>${css}</style></head>`)
    .replace("</body>", `<script>${js}<\/script></body>`);
}

// ─── Code analysis for Problems panel ─────────────────────────────────────────
function analyzeProblems(files: Record<string, string>): Problem[] {
  const problems: Problem[] = [];
  let idCounter = 0;

  // HTML analysis
  const html = files["index.html"] || "";
  const htmlLines = html.split("\n");
  htmlLines.forEach((line, i) => {
    if (line.includes("<img") && !line.includes("alt=")) {
      problems.push({ id: `p${idCounter++}`, severity: "warning", message: "`<img>` element must have an `alt` attribute.", file: "index.html", line: i + 1, col: line.indexOf("<img") + 1, source: "html-lint" });
    }
    if (/<[a-z]+\s+[^>]*style\s*=/i.test(line)) {
      problems.push({ id: `p${idCounter++}`, severity: "info", message: "Inline styles detected. Consider using a CSS class instead.", file: "index.html", line: i + 1, col: 1, source: "html-lint" });
    }
  });

  // CSS analysis
  const css = files["style.css"] || "";
  const cssLines = css.split("\n");
  let openBraces = 0; let closeBraces = 0;
  cssLines.forEach((line) => {
    openBraces += (line.match(/{/g) || []).length;
    closeBraces += (line.match(/}/g) || []).length;
  });
  if (openBraces !== closeBraces) {
    problems.push({ id: `p${idCounter++}`, severity: "error", message: `CSS: Mismatched braces. Found ${openBraces} opening and ${closeBraces} closing braces.`, file: "style.css", line: 1, col: 1, source: "css-lint" });
  }
  cssLines.forEach((line, i) => {
    if (line.includes("color:") && !line.includes("/*") && !line.includes("background") && !line.includes("border") && !line.includes("outline")) {
      // valid
    }
    if (/^\s+[a-z-]+:[^;]+$/.test(line) && !line.trim().endsWith("{") && !line.trim().endsWith("}") && !line.trim().endsWith(",") && !line.trim().startsWith("//") && !line.trim().startsWith("/*") && !line.trim().startsWith("*")) {
      if (line.trim().length > 0 && !line.includes(";")) {
        problems.push({ id: `p${idCounter++}`, severity: "warning", message: `CSS property may be missing semicolon: "${line.trim()}"`, file: "style.css", line: i + 1, col: 1, source: "css-lint" });
      }
    }
  });

  // JS analysis
  const js = files["script.js"] || "";
  const jsLines = js.split("\n");
  jsLines.forEach((line, i) => {
    if (/var\s+/.test(line)) {
      problems.push({ id: `p${idCounter++}`, severity: "warning", message: "Unexpected `var`. Use `const` or `let` instead.", file: "script.js", line: i + 1, col: line.indexOf("var") + 1, source: "eslint" });
    }
    if (/==\s/.test(line) && !/!==|===/.test(line) && !/\/\//.test(line.substring(0, line.indexOf("==")))) {
      problems.push({ id: `p${idCounter++}`, severity: "warning", message: "Unexpected `==`. Use `===` instead.", file: "script.js", line: i + 1, col: line.indexOf("==") + 1, source: "eslint" });
    }
    if (/console\.log/.test(line) && !line.includes("//")) {
      problems.push({ id: `p${idCounter++}`, severity: "info", message: "Unexpected console statement.", file: "script.js", line: i + 1, col: line.indexOf("console.log") + 1, source: "eslint" });
    }
  });

  return problems;
}

// ─── Terminal command simulator ────────────────────────────────────────────────
function simulateCommand(cmd: string, files: Record<string, string>): TerminalLine[] {
  const now = () => new Date().toLocaleTimeString("tr-TR");
  const trimmed = cmd.trim().toLowerCase();

  if (!trimmed) return [];

  if (trimmed === "help" || trimmed === "--help") {
    return [
      { text: "Macrotar Code Terminal - Available Commands:", type: "system" },
      { text: "  run          — Run the project in preview", type: "output" },
      { text: "  ls / dir     — List project files", type: "output" },
      { text: "  clear        — Clear terminal", type: "output" },
      { text: "  node <expr>  — Evaluate JavaScript", type: "output" },
      { text: "  lint         — Run code linter", type: "output" },
      { text: "  build        — Build the project", type: "output" },
      { text: "  npm install  — Install dependencies (simulated)", type: "output" },
      { text: "  git status   — Show git status", type: "output" },
      { text: "  whoami       — Show current user", type: "output" },
      { text: "  version      — Show terminal version", type: "output" },
    ];
  }
  if (trimmed === "clear" || trimmed === "cls") {
    return [{ text: "__CLEAR__", type: "system" }];
  }
  if (trimmed === "ls" || trimmed === "dir") {
    return [
      { text: "📁 PROJE/", type: "system" },
      ...Object.entries(files).map(([name, content]) => ({
        text: `  ${name.endsWith(".html") ? "🟠" : name.endsWith(".css") ? "🔵" : "🟡"} ${name}   ${content.length} bytes`,
        type: "output" as const,
      })),
    ];
  }
  if (trimmed === "run" || trimmed === "npm start") {
    return [
      { text: `[${now()}] > macrotar-code@1.0.0 start`, type: "info" },
      { text: `[${now()}] Starting development server...`, type: "info" },
      { text: `[${now()}] ✓ Compiled successfully in 412ms`, type: "success" },
      { text: `[${now()}] Preview server running at: localhost:3000`, type: "success" },
    ];
  }
  if (trimmed === "build" || trimmed === "npm run build") {
    return [
      { text: `[${now()}] > macrotar-code@1.0.0 build`, type: "info" },
      { text: `[${now()}] Building project...`, type: "info" },
      { text: `[${now()}] ✓ index.html  ${files["index.html"]?.length || 0} bytes`, type: "success" },
      { text: `[${now()}] ✓ style.css   ${files["style.css"]?.length || 0} bytes`, type: "success" },
      { text: `[${now()}] ✓ script.js   ${files["script.js"]?.length || 0} bytes`, type: "success" },
      { text: `[${now()}] Build completed in 638ms — 3 files processed`, type: "success" },
    ];
  }
  if (trimmed === "lint") {
    const problems = analyzeProblems(files);
    const errors = problems.filter(p => p.severity === "error").length;
    const warnings = problems.filter(p => p.severity === "warning").length;
    return [
      { text: `[${now()}] Running linter...`, type: "info" },
      ...problems.map(p => ({
        text: `  ${p.file}:${p.line}:${p.col}  ${p.severity.toUpperCase()}  ${p.message}`,
        type: (p.severity === "error" ? "error" : "output") as TerminalLine["type"],
      })),
      { text: `[${now()}] ✓ Lint complete — ${errors} error(s), ${warnings} warning(s)`, type: errors > 0 ? "error" : "success" },
    ];
  }
  if (trimmed.startsWith("node ") || trimmed.startsWith("eval ")) {
    const expr = cmd.replace(/^(node|eval)\s+/i, "").trim();
    try {
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      return [
        { text: `> ${expr}`, type: "input" },
        { text: String(result), type: "success" },
      ];
    } catch (err: any) {
      return [
        { text: `> ${expr}`, type: "input" },
        { text: `Error: ${err.message}`, type: "error" },
      ];
    }
  }
  if (trimmed === "npm install" || trimmed === "npm i") {
    return [
      { text: `[${now()}] npm install`, type: "info" },
      { text: `[${now()}] Resolving packages...`, type: "output" },
      { text: `[${now()}] ✓ Packages up to date.`, type: "success" },
    ];
  }
  if (trimmed === "git status") {
    return [
      { text: "On branch main", type: "output" },
      { text: "Your branch is up to date with 'origin/main'.", type: "output" },
      { text: "", type: "output" },
      { text: "Changes not staged for commit:", type: "output" },
      ...Object.keys(files).map(f => ({ text: `  modified:   ${f}`, type: "error" as const })),
    ];
  }
  if (trimmed === "git log") {
    return [
      { text: "commit a1b2c3d (HEAD -> main, origin/main)", type: "success" },
      { text: "Author: Developer <dev@macrotar.com>", type: "output" },
      { text: "Date:   " + new Date().toDateString(), type: "output" },
      { text: "    Initial commit", type: "output" },
    ];
  }
  if (trimmed === "whoami") {
    return [{ text: "macrotar-developer", type: "success" }];
  }
  if (trimmed === "version" || trimmed === "--version") {
    return [{ text: "Macrotar Code Terminal v2.0.0 (Node.js 20.x compatible)", type: "system" }];
  }
  if (trimmed === "pwd") {
    return [{ text: "/workspace/macrotar-project", type: "output" }];
  }
  if (trimmed.startsWith("echo ")) {
    return [{ text: cmd.replace(/^echo\s+/i, ""), type: "output" }];
  }

  return [{ text: `bash: ${cmd.split(" ")[0]}: command not found. Type 'help' to see available commands.`, type: "error" }];
}

export default function CodeEditor({ onBack, initialLang = "html" }: CodeEditorProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>(["index.html"]);
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [files, setFiles] = useState<Record<string, string>>(FILE_DEFAULTS);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [snippetHint, setSnippetHint] = useState<{key:string;preview:string}|null>(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [autoRun, setAutoRun] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // IntelliSense
  const [acList, setAcList] = useState<Completion[]>([]);
  const [acIndex, setAcIndex] = useState(0);
  const [acWord, setAcWord] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acRef = useRef<HTMLDivElement>(null);

  // ── Bottom Panel State ────────────────────────────────────────────────────
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("terminal");
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const isResizingPanel = useRef(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // Terminal
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { text: "Macrotar Code Terminal v2.0.0", type: "system" },
    { text: "Type 'help' to see available commands.", type: "output" },
    { text: "", type: "output" },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Problems
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemFilter, setProblemFilter] = useState<"all" | "error" | "warning" | "info">("all");

  // Output
  const [outputLines, setOutputLines] = useState<OutputLine[]>([
    { text: "[System] Macrotar Code output channel initialized.", type: "dim", timestamp: new Date().toLocaleTimeString("tr-TR") },
  ]);

  // Debug Console
  const [debugLines, setDebugLines] = useState<DebugLine[]>([
    { text: "Debug console ready. Run your project to see logs.", type: "info", timestamp: new Date().toLocaleTimeString("tr-TR") },
  ]);
  const [debugInput, setDebugInput] = useState("");

  const currentLang: "html" | "css" | "js" = FILE_LANG_MAP[activeFile] || "html";
  const currentCode = files[activeFile] || "";
  const snippets = currentLang === "html" ? HTML_SNIPPETS : currentLang === "css" ? CSS_SNIPPETS : JS_SNIPPETS;

  const LANG_COLORS: Record<string, string> = { html: "text-orange-400", css: "text-blue-400", js: "text-yellow-400" };
  const FILE_ICONS: Record<string, React.ReactNode> = {
    "index.html": <FileCode size={13} className="text-orange-400" />,
    "style.css": <Braces size={13} className="text-blue-400" />,
    "script.js": <FileCode2 size={13} className="text-yellow-300" />,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-analyze problems when files change
  useEffect(() => {
    const p = analyzeProblems(files);
    setProblems(p);
  }, [files]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines, activeBottomTab]);

  // ── Panel resize ─────────────────────────────────────────────────────────
  const handlePanelResizeStart = (e: React.MouseEvent) => {
    isResizingPanel.current = true;
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = bottomPanelHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizingPanel.current) return;
      const delta = resizeStartY.current - e.clientY;
      const newH = Math.max(120, Math.min(500, resizeStartHeight.current + delta));
      setBottomPanelHeight(newH);
    };
    const onUp = () => { isResizingPanel.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleCodeChange = (val: string) => {
    setFiles(prev => ({ ...prev, [activeFile]: val }));
  };

  const insertColor = (color: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const code = ta.value; const start = ta.selectionStart; const end = ta.selectionEnd;
    const newCode = code.substring(0, start) + color + code.substring(end);
    handleCodeChange(newCode);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + color.length; ta.focus(); }, 0);
  };

  const openFile = (name: string) => {
    if (!openFiles.includes(name)) setOpenFiles(prev => [...prev, name]);
    setActiveFile(name); setShowWelcome(false);
  };

  const closeFile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openFiles.filter(f => f !== name);
    setOpenFiles(next);
    if (activeFile === name) { setActiveFile(next[next.length - 1] || ""); setShowWelcome(next.length === 0); }
  };

  const now = () => new Date().toLocaleTimeString("tr-TR");

  const runPreview = useCallback(() => {
    setIsPreviewOpen(true);
    setPreviewKey(k => k + 1);
    const ts = now();
    setTerminalLines(prev => [...prev,
      { text: `[${ts}] > macrotar-code run`, type: "input" },
      { text: `[${ts}] ✓ Project compiled successfully`, type: "success" },
      { text: `[${ts}] Preview launched`, type: "info" },
    ]);
    setOutputLines(prev => [...prev,
      { text: `[${ts}] Build started...`, type: "info", timestamp: ts },
      { text: `[${ts}] ✓ index.html processed`, type: "success", timestamp: ts },
      { text: `[${ts}] ✓ style.css processed`, type: "success", timestamp: ts },
      { text: `[${ts}] ✓ script.js processed`, type: "success", timestamp: ts },
      { text: `[${ts}] Build complete — 0 errors, 0 warnings`, type: "success", timestamp: ts },
    ]);
    // Open bottom panel on run
    setBottomPanelOpen(true);
    setActiveBottomTab("output");
  }, []);

  useEffect(() => {
    if (autoRun) {
      const t = setTimeout(() => setPreviewKey(k => k + 1), 700);
      return () => clearTimeout(t);
    }
  }, [files, autoRun]);

  // ── IntelliSense ──────────────────────────────────────────────────────────
  const updateAC = (val: string, cursor: number) => {
    const before = val.substring(0, cursor);
    const wm = before.match(/[\w!][\w.#-]*$/);
    if (!wm || wm[0].length < 1) { setAcList([]); setAcWord(""); return; }
    const word = wm[0];
    if (currentLang === "html" && (word.includes(".") || word.includes("#"))) {
      const emmet = parseEmmet(word);
      if (emmet) { setAcList([{ label: word, insert: emmet, kind: "snippet", detail: "Emmet → Enter/Tab" }]); setAcWord(word); setAcIndex(0); return; }
    }
    const lang = getLanguageContext(val, cursor, currentLang);
    const completions = getCompletions(lang, word);
    setAcList(completions); setAcWord(word); setAcIndex(0);
  };

  const updateSnippetHint = (val: string, cursor: number) => {
    const before = val.substring(0, cursor);
    const wordMatch = before.match(/[\w!]+$/);
    if (!wordMatch) { setSnippetHint(null); return; }
    const word = wordMatch[0];
    const match = snippets[word];
    if (match) setSnippetHint({ key: word, preview: match.substring(0, 50) });
    else setSnippetHint(null);
  };

  const applyCompletion = (comp: Completion) => {
    const ta = textareaRef.current; if (!ta) return;
    const code = ta.value; const cursor = ta.selectionStart;
    const before = code.substring(0, cursor);
    const wm = before.match(/[\w!-]+$/);
    const wordLen = wm ? wm[0].length : 0;
    const wordStart = cursor - wordLen;
    const indent = before.lastIndexOf("\n") === -1 ? "" : before.match(/\n(\s*)(?=[^\n]*$)/)?.[1] || "";
    const indented = comp.insert.split("\n").map((l, i) => i === 0 ? l : indent + l).join("\n");
    const newCode = code.substring(0, wordStart) + indented + code.substring(cursor);
    handleCodeChange(newCode);
    const emptyIdx = indented.indexOf("\n  \n");
    const newCursor = emptyIdx !== -1 ? wordStart + emptyIdx + 3 : wordStart + indented.length;
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = newCursor; ta.focus(); }, 0);
    setAcList([]); setAcWord(""); setSnippetHint(null);
  };

  const expandSnippet = (ta: HTMLTextAreaElement, code: string, cursor: number): boolean => {
    const before = code.substring(0, cursor);
    const wordMatch = before.match(/[\w!][\w.#-]*$/);
    if (!wordMatch) return false;
    const word = wordMatch[0];
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
        setAcList([]); setSnippetHint(null); return true;
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
    setSnippetHint(null); return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (acList.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setAcIndex(i => (i + 1) % acList.length); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setAcIndex(i => (i - 1 + acList.length) % acList.length); return; }
      if (e.key === "Escape")    { e.preventDefault(); setAcList([]); setAcWord(""); return; }
      if (e.key === "Tab" || e.key === "Enter") { e.preventDefault(); applyCompletion(acList[acIndex]); return; }
    }
    const ta = textareaRef.current!;
    const code = ta.value; const start = ta.selectionStart; const end = ta.selectionEnd;

    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      const ls = code.lastIndexOf("\n", start - 1) + 1;
      const le = code.indexOf("\n", start);
      const line = code.substring(ls, le === -1 ? code.length : le);
      const ip = le === -1 ? code.length : le;
      handleCodeChange(code.substring(0, ip) + "\n" + line + code.substring(ip));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = ip + 1 + (start - ls); }, 0); return;
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
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + offset; }, 0); return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runPreview(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === "`") { e.preventDefault(); setBottomPanelOpen(v => !v); return; }

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
      const before = code.substring(0, start); const after = code.substring(end);
      const indent = getCurrentIndent(code, start);
      const prevChar = before.slice(-1); const nextChar = after[0];
      if ((prevChar === "{" && nextChar === "}") || (prevChar === "[" && nextChar === "]") || (prevChar === "(" && nextChar === ")")) {
        handleCodeChange(before + "\n" + indent + "  " + "\n" + indent + after);
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1 + indent.length + 2; }, 0); return;
      }
      const extra = prevChar === "{" || prevChar === "[" || prevChar === "(" ? "  " : "";
      handleCodeChange(before + "\n" + indent + extra + after);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1 + indent.length + extra.length; }, 0); return;
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

  // ── Terminal ──────────────────────────────────────────────────────────────
  const handleTerminalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); const idx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1); setCmdHistoryIdx(idx); if (cmdHistory[idx]) setTerminalInput(cmdHistory[idx]); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); const idx = Math.max(cmdHistoryIdx - 1, -1); setCmdHistoryIdx(idx); setTerminalInput(idx === -1 ? "" : (cmdHistory[idx] || "")); return; }
    if (e.key !== "Enter") return;
    const cmd = terminalInput.trim();
    if (!cmd) return;
    setCmdHistory(prev => [cmd, ...prev]);
    setCmdHistoryIdx(-1);
    const result = simulateCommand(cmd, files);
    if (result.length === 1 && result[0].text === "__CLEAR__") {
      setTerminalLines([{ text: "Macrotar Code Terminal v2.0.0 — cleared", type: "system" }]);
    } else {
      setTerminalLines(prev => [
        ...prev,
        { text: `macrotar@code:~$ ${cmd}`, type: "input" },
        ...result,
      ]);
    }
    setTerminalInput("");
  };

  // ── Debug console ─────────────────────────────────────────────────────────
  const handleDebugSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const expr = debugInput.trim();
    if (!expr) return;
    const ts = now();
    try {
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      setDebugLines(prev => [...prev,
        { text: `> ${expr}`, type: "log", timestamp: ts, source: "console" },
        { text: String(result), type: "result", timestamp: ts, source: "console" },
      ]);
    } catch (err: any) {
      setDebugLines(prev => [...prev,
        { text: `> ${expr}`, type: "log", timestamp: ts, source: "console" },
        { text: `Uncaught Error: ${err.message}`, type: "error", timestamp: ts, source: "console" },
      ]);
    }
    setDebugInput("");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = activeFile; a.click();
    URL.revokeObjectURL(url);
  };

  const lines = currentCode.split("\n");
  const previewSrc = buildPreviewHTML(files);
  const errorCount = problems.filter(p => p.severity === "error").length;
  const warningCount = problems.filter(p => p.severity === "warning").length;
  const filteredProblems = problems.filter(p => problemFilter === "all" ? true : p.severity === problemFilter);

  // ─── Bottom Tabs config ───────────────────────────────────────────────────
  const bottomTabs: { id: BottomTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "terminal", label: "TERMINAL", icon: <Terminal size={12} /> },
    { id: "problems", label: "PROBLEMS", icon: <AlertCircle size={12} />, badge: errorCount + warningCount },
    { id: "output", label: "OUTPUT", icon: <Layers size={12} /> },
    { id: "debug", label: "DEBUG CONSOLE", icon: <Bug size={12} /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Title Bar ── */}
      <div className="flex items-center bg-[#323233] px-2 py-1 text-[12px] text-[#cccccc] shrink-0 gap-2">
        <div className="flex items-center gap-1.5 mr-2">
          <button onClick={onBack} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all flex items-center justify-center group" title="Geri">
            <X size={7} className="opacity-0 group-hover:opacity-100 text-red-900" />
          </button>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c940]" />
        </div>
        {["Dosya", "Düzen", "Seçim", "Görünüm", "Git", "Çalıştır", "Terminal", "Yardım"].map(m => (
          <span key={m} className="px-1.5 py-0.5 hover:bg-white/10 rounded cursor-pointer transition-all">{m}</span>
        ))}
        <div className="flex-1 text-center text-[#cccccc]/70 text-[11px] pointer-events-none">
          {activeFile ? `${activeFile} — Macrotar Code` : "Macrotar Code"}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => colorInputRef.current?.click()} className="p-1 hover:bg-white/10 rounded transition-all text-violet-400" title="Renk Ekle">
            <Palette size={14} />
          </button>
          <input type="color" ref={colorInputRef} className="hidden" onChange={(e) => insertColor(e.target.value)} />
          <button onClick={() => setIsPreviewOpen(v => !v)} className="p-1 hover:bg-white/10 rounded transition-all" title="Önizleme (Split)">
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
                  MACROTAR CODE
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
                <div className="text-[11px] text-[#858585] mt-4">
                  {Object.keys(files).map(f => (
                    <div key={f} className="flex items-center gap-1 py-0.5 text-yellow-400">
                      <Hash size={10} /> {f}
                      <span className="text-[#858585] ml-auto">M</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activePanel === "extensions" && (
              <div className="p-3">
                <div className="text-[11px] font-bold text-[#bbbbbb] uppercase mb-2">Uzantılar</div>
                {["HTML Snippets", "CSS IntelliSense", "JS Helper", "Live Preview", "ESLint", "Prettier"].map(ext => (
                  <div key={ext} className="text-[12px] text-[#cccccc] py-1.5 border-b border-[#333] flex items-center justify-between">
                    <span>{ext}</span>
                    <span className="text-[10px] text-emerald-400">✓ Aktif</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Editor + Bottom Panel Column ── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Tab Bar */}
          <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto shrink-0">
            {showWelcome && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] text-[12px] text-[#cccccc] border-r border-[#1e1e1e] cursor-pointer min-w-max">
                <Star size={12} className="text-yellow-400" />
                <span>Hoş Geldiniz</span>
                <button onClick={() => { setShowWelcome(false); if (openFiles.length === 0) { openFile("index.html"); } }} className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded">
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
                <button onClick={(e) => closeFile(name, e)} className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 hover:opacity-100">
                  <X size={10} />
                </button>
              </div>
            ))}
            <button onClick={() => openFile("index.html")} className="px-3 py-2 text-[#858585] hover:text-[#cccccc] hover:bg-white/5 transition-all" title="Dosya Aç">
              <Plus size={14} />
            </button>
          </div>

          {/* Editor + Preview area — flex-1 but allows bottom panel */}
          <div className="flex flex-1 overflow-hidden flex-col">
            <div className="flex flex-1 overflow-hidden">
              {showWelcome ? (
                /* ── Welcome Screen ── */
                <div className="flex-1 bg-[#1e1e1e] overflow-y-auto">
                  <div className="max-w-2xl mx-auto px-12 py-16">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                        <Code size={28} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-[28px] font-light text-white leading-tight">Macrotar Code</h1>
                        <p className="text-[13px] text-[#858585]">Kodlamayı Kolaylaştırıyoruz</p>
                      </div>
                    </div>
                    <div className="h-px bg-[#333] my-8" />
                    <div className="grid grid-cols-2 gap-12">
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
                            <button key={item.label} onClick={item.action} className="flex items-center gap-2 text-[13px] text-[#3794ff] hover:text-blue-300 hover:underline transition-all w-full text-left">
                              {item.icon} {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-[13px] font-semibold text-[#cccccc] mb-4 flex items-center gap-2">
                          <Clock size={14} className="text-violet-400" /> Son Kullanılan
                        </h2>
                        <div className="space-y-2">
                          {["index.html", "style.css", "script.js"].map(f => (
                            <button key={f} onClick={() => openFile(f)} className="flex items-center gap-2 text-[13px] text-[#3794ff] hover:text-blue-300 hover:underline transition-all w-full text-left">
                              {FILE_ICONS[f]} {f}
                              <span className="text-[#858585] text-[11px] ml-auto">~/proje</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-[#333] my-8" />
                    <div>
                      <h2 className="text-[13px] font-semibold text-[#cccccc] mb-4 flex items-center gap-2">
                        <BookOpen size={14} className="text-emerald-400" /> İpuçları
                      </h2>
                      <div className="space-y-3">
                        {[
                          { title: "Emmet Kısayolları", desc: "! yazıp Enter/Tab'a bas → HTML şablonu", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                          { title: "Akıllı Tamamlama", desc: "div, p, h1, ul, class, fn gibi kısayolları dene", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                          { title: "Canlı Önizleme", desc: "Ctrl+Enter ile anlık önizleme başlat", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                          { title: "Terminal & Paneller", desc: "Ctrl+` ile terminal aç, Problems/Output/Debug panellerini kullan", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
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
                      Macrotar Code — Tarayıcıda Çalışan IDE
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Code Editor Area ── */
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

                    {/* IntelliSense Dropdown */}
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
                          const ta = textareaRef.current; if (!ta) return;
                          const before = ta.value.substring(0, ta.selectionStart).split("\n");
                          setCursorInfo({ line: before.length, col: before[before.length - 1].length + 1 });
                        }}
                        onKeyUp={() => {
                          const ta = textareaRef.current; if (!ta) return;
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
                          <button onClick={runPreview} className="p-1 hover:bg-white/10 rounded" title="Yenile"><RefreshCw size={11} /></button>
                          <button onClick={() => setIsFullPreview(v => !v)} className="p-1 hover:bg-white/10 rounded">
                            {isFullPreview ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                          </button>
                          <button onClick={() => setIsPreviewOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={11} /></button>
                        </div>
                      </div>
                      <iframe key={previewKey} srcDoc={previewSrc} sandbox="allow-scripts allow-same-origin" className="flex-1 bg-white" title="Önizleme" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                ── BOTTOM PANEL (Terminal / Problems / Output / Debug) ──
                ══════════════════════════════════════════════════════════════ */}
            {bottomPanelOpen && (
              <div style={{ height: bottomPanelHeight }} className="flex flex-col shrink-0 border-t border-[#252526] bg-[#1e1e1e]">

                {/* Resize handle */}
                <div
                  className="h-1 bg-transparent hover:bg-blue-500/40 cursor-row-resize shrink-0 transition-colors"
                  onMouseDown={handlePanelResizeStart}
                />

                {/* Panel Tab Bar */}
                <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] shrink-0">
                  {bottomTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBottomTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium tracking-wide transition-all relative ${
                        activeBottomTab === tab.id
                          ? "text-white border-b-2 border-blue-400 bg-[#1e1e1e]"
                          : "text-[#969696] hover:text-[#cccccc] hover:bg-white/5"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          tab.id === "problems" && errorCount > 0 ? "bg-red-500 text-white" : "bg-yellow-500/80 text-black"
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="flex-1" />
                  {/* Panel actions */}
                  <div className="flex items-center gap-0.5 pr-2">
                    {activeBottomTab === "terminal" && (
                      <>
                        <button onClick={() => setTerminalLines([{ text: "Macrotar Code Terminal v2.0.0 — cleared", type: "system" }])} className="p-1 hover:bg-white/10 rounded text-[#858585] hover:text-[#cccccc]" title="Terminali Temizle">
                          <Trash2 size={13} />
                        </button>
                        <button onClick={() => {
                          const ts = now();
                          setTerminalLines(prev => [...prev, { text: `macrotar@code:~$ npm run dev`, type: "input" }, { text: `[${ts}] > macrotar-code@1.0.0 dev`, type: "info" }, { text: `[${ts}] ✓ Server started — http://localhost:3000`, type: "success" }]);
                        }} className="p-1 hover:bg-white/10 rounded text-[#858585] hover:text-emerald-400" title="Yeni Terminal">
                          <Plus size={13} />
                        </button>
                      </>
                    )}
                    {activeBottomTab === "problems" && (
                      <button onClick={() => setProblems(analyzeProblems(files))} className="p-1 hover:bg-white/10 rounded text-[#858585] hover:text-[#cccccc]" title="Yenile">
                        <RefreshCw size={13} />
                      </button>
                    )}
                    {activeBottomTab === "output" && (
                      <button onClick={() => setOutputLines([{ text: "[System] Output cleared.", type: "dim", timestamp: now() }])} className="p-1 hover:bg-white/10 rounded text-[#858585] hover:text-[#cccccc]" title="Çıktıyı Temizle">
                        <Trash2 size={13} />
                      </button>
                    )}
                    {activeBottomTab === "debug" && (
                      <button onClick={() => setDebugLines([{ text: "Debug console cleared.", type: "info", timestamp: now() }])} className="p-1 hover:bg-white/10 rounded text-[#858585] hover:text-[#cccccc]" title="Temizle">
                        <Trash2 size={13} />
                      </button>
                    )}
                    <button onClick={() => setBottomPanelOpen(false)} className="p-1 hover:bg-white/10 rounded text-[#858585] hover:text-[#cccccc]" title="Paneli Kapat">
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* ── TERMINAL TAB ── */}
                {activeBottomTab === "terminal" && (
                  <div className="flex flex-col flex-1 overflow-hidden" onClick={() => terminalInputRef.current?.focus()}>
                    <div className="flex-1 overflow-y-auto px-3 pt-2 pb-1 font-mono text-[12px]" style={{ fontFamily: "'Cascadia Code','Fira Code',monospace", scrollbarWidth: "thin" }}>
                      {terminalLines.map((line, i) => (
                        <div key={i} className={
                          line.type === "system" ? "text-[#569cd6] font-bold" :
                          line.type === "input" ? "text-[#cccccc]" :
                          line.type === "success" ? "text-[#4ec9b0]" :
                          line.type === "error" ? "text-[#f44747]" :
                          line.type === "info" ? "text-[#9cdcfe]" :
                          "text-[#cccccc]"
                        }>
                          {line.text}
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>
                    {/* Terminal input */}
                    <div className="flex items-center gap-2 px-3 py-1.5 border-t border-[#252526] shrink-0">
                      <span className="text-[#4ec9b0] text-[12px] font-mono font-bold shrink-0">macrotar@code:~$</span>
                      <input
                        ref={terminalInputRef}
                        value={terminalInput}
                        onChange={e => setTerminalInput(e.target.value)}
                        onKeyDown={handleTerminalSubmit}
                        placeholder="komut girin..."
                        className="flex-1 bg-transparent text-[#cccccc] text-[12px] font-mono focus:outline-none placeholder:text-[#555] caret-[#cccccc]"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}

                {/* ── PROBLEMS TAB ── */}
                {activeBottomTab === "problems" && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Filter bar */}
                    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#252526] shrink-0">
                      {(["all", "error", "warning", "info"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setProblemFilter(f)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all ${
                            problemFilter === f ? "bg-[#37373d] text-white" : "text-[#858585] hover:text-[#cccccc]"
                          }`}
                        >
                          {f === "error" && <AlertCircle size={11} className="text-red-400" />}
                          {f === "warning" && <TriangleAlert size={11} className="text-yellow-400" />}
                          {f === "info" && <Info size={11} className="text-blue-400" />}
                          {f === "all" ? `Tümü (${problems.length})` : f === "error" ? `Hata (${errorCount})` : f === "warning" ? `Uyarı (${warningCount})` : `Bilgi (${problems.filter(p=>p.severity==="info").length})`}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                      {filteredProblems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-[#858585]">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          <span className="text-[12px]">
                            {problemFilter === "all" ? "Hiç sorun yok! Temiz kod. ✓" : `${problemFilter} tipi sorun yok.`}
                          </span>
                        </div>
                      ) : (
                        filteredProblems.map(p => (
                          <div
                            key={p.id}
                            onClick={() => openFile(p.file)}
                            className="flex items-start gap-2 px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer border-b border-[#252526] transition-all group"
                          >
                            {p.severity === "error" && <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
                            {p.severity === "warning" && <TriangleAlert size={14} className="text-yellow-400 shrink-0 mt-0.5" />}
                            {p.severity === "info" && <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />}
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] text-[#cccccc] leading-snug truncate">{p.message}</div>
                              <div className="text-[10px] text-[#858585] mt-0.5">
                                {p.file} · Satır {p.line}, Sütun {p.col} · {p.source}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ── OUTPUT TAB ── */}
                {activeBottomTab === "output" && (
                  <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px]" style={{ fontFamily: "'Cascadia Code','Fira Code',monospace", scrollbarWidth: "thin" }}>
                    {outputLines.map((line, i) => (
                      <div key={i} className="flex items-start gap-3 py-0.5 group hover:bg-white/3 rounded px-1">
                        <span className="text-[10px] text-[#555] shrink-0 mt-0.5 tabular-nums">{line.timestamp}</span>
                        <span className={
                          line.type === "success" ? "text-[#4ec9b0]" :
                          line.type === "warn" ? "text-yellow-400" :
                          line.type === "error" ? "text-[#f44747]" :
                          line.type === "info" ? "text-[#9cdcfe]" :
                          "text-[#858585]"
                        }>
                          {line.text}
                        </span>
                      </div>
                    ))}
                    {outputLines.length === 1 && (
                      <div className="text-[#555] text-[12px] mt-4 text-center">
                        Çalıştır (Ctrl+Enter) veya Build yaparak output görmek için projeyi başlatın.
                      </div>
                    )}
                  </div>
                )}

                {/* ── DEBUG CONSOLE TAB ── */}
                {activeBottomTab === "debug" && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px]" style={{ fontFamily: "'Cascadia Code','Fira Code',monospace", scrollbarWidth: "thin" }}>
                      {debugLines.map((line, i) => (
                        <div key={i} className={`flex items-start gap-3 py-0.5 hover:bg-white/3 rounded px-1 ${
                          line.type === "result" ? "border-l-2 border-[#555] pl-3 ml-2" : ""
                        }`}>
                          <span className="text-[10px] text-[#555] shrink-0 mt-0.5 tabular-nums">{line.timestamp}</span>
                          <span className={
                            line.type === "error" ? "text-[#f44747]" :
                            line.type === "warn" ? "text-yellow-400" :
                            line.type === "result" ? "text-[#9cdcfe] font-semibold" :
                            line.type === "info" ? "text-[#858585] italic" :
                            "text-[#cccccc]"
                          }>
                            {line.type === "result" ? `← ${line.text}` : line.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Debug input */}
                    <div className="flex items-center gap-2 px-3 py-1.5 border-t border-[#252526] shrink-0">
                      <span className="text-[#858585] text-[12px] font-mono shrink-0">›</span>
                      <input
                        value={debugInput}
                        onChange={e => setDebugInput(e.target.value)}
                        onKeyDown={handleDebugSubmit}
                        placeholder="JavaScript ifadesi girin..."
                        className="flex-1 bg-transparent text-[#cccccc] text-[12px] font-mono focus:outline-none placeholder:text-[#555] caret-[#cccccc]"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between bg-[#007acc] text-white text-[11px] px-3 py-0.5 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded transition-all">
            <ArrowLeft size={11} /> Geri
          </button>
          <span className="flex items-center gap-1">
            <GitBranch size={11} /> main
          </span>
          <button
            onClick={() => { setActiveBottomTab("problems"); setBottomPanelOpen(true); }}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"
          >
            <AlertCircle size={11} />
            <span className={errorCount > 0 ? "text-red-200" : ""}>{errorCount}</span>
            <TriangleAlert size={11} className="ml-1" />
            <span className={warningCount > 0 ? "text-yellow-200" : ""}>{warningCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {activeFile && !showWelcome && (
            <>
              <span>Satır {cursorInfo.line}, Sütun {cursorInfo.col}</span>
              <span>Boşluklar: 2</span>
              <span>UTF-8</span>
              <span className={LANG_COLORS[currentLang] + " font-semibold capitalize bg-white/10 px-2 py-0.5 rounded"}>
                {currentLang === "js" ? "JavaScript" : currentLang.toUpperCase()}
              </span>
            </>
          )}
          <button
            onClick={() => { setBottomPanelOpen(v => !v); if (!bottomPanelOpen) setActiveBottomTab("terminal"); }}
            className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all"
            title="Ctrl+`"
          >
            <Terminal size={11} /> Terminal
          </button>
          <button onClick={runPreview} className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all">
            <Play size={11} /> Önizle
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all">
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-all" title="İndir">
            <Download size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
