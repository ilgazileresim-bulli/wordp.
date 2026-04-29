"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Gamepad2, MonitorPlay, Circle, Square, Save, Download,
  Trash2, Clock, AlertTriangle, CheckCircle2, Zap,
  Shield, ChevronRight, Mic, MicOff, Film, Sparkles, Camera, CameraOff, Scissors, X, Play, Type, Wand2, Music, Layers, Volume2, Plus, SlidersHorizontal, MousePointer2, Image as ImageIcon, LayoutTemplate, Pause,
  Undo, Redo, Settings, Maximize, Hand, PenTool, Hash, Activity,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Search, Focus, Droplet, Sun, Moon, Cloud, Contrast,
  FastForward, Rewind, SkipBack, SkipForward, VolumeX, List, Grid, Filter, Command, Palette, Video,
  Crosshair, Box, Crop, Copy, Menu, Eye, Lock, Move, ClipboardPaste
} from "lucide-react";

const GAMES = [
  { id: "valorant",   name: "Valorant",         color: "from-red-600 to-red-800",       icon: "🎯", genre: "FPS" },
  { id: "fortnite",  name: "Fortnite",          color: "from-blue-500 to-indigo-700",   icon: "⚡", genre: "Battle Royale" },
  { id: "minecraft", name: "Minecraft",         color: "from-green-600 to-emerald-800", icon: "⛏️", genre: "Sandbox" },
  { id: "csgo",      name: "CS2",               color: "from-orange-500 to-yellow-700", icon: "💣", genre: "FPS" },
  { id: "lol",       name: "League of Legends", color: "from-blue-700 to-cyan-700",     icon: "⚔️", genre: "MOBA" },
  { id: "apex",      name: "Apex Legends",      color: "from-red-500 to-orange-600",    icon: "🔫", genre: "Battle Royale" },
  { id: "roblox",    name: "Roblox",            color: "from-red-600 to-red-700",       icon: "🧱", genre: "Platform" },
  { id: "gta",       name: "GTA V",             color: "from-zinc-700 to-zinc-900",     icon: "🏎️", genre: "Open World" },
  { id: "overwatch", name: "Overwatch 2",       color: "from-orange-400 to-orange-600", icon: "🦸", genre: "FPS" },
  { id: "pubg",      name: "PUBG",              color: "from-yellow-600 to-amber-700",  icon: "🪖", genre: "Battle Royale" },
  { id: "dota2",     name: "Dota 2",            color: "from-red-800 to-red-900",       icon: "🐉", genre: "MOBA" },
  { id: "warzone",   name: "Warzone",           color: "from-zinc-600 to-zinc-800",     icon: "💀", genre: "Battle Royale" },
  { id: "other",     name: "Other Game",        color: "from-purple-600 to-violet-800", icon: "🎮", genre: "Custom" },
];

type Phase    = "select" | "recorder";
type RecState = "idle" | "recording";

interface SavedClip {
  id: string; name: string; url: string; duration: number; size: number;
}

const BUFFER_SECS = 60;
const CHUNK_MS    = 1000;

export default function PlayersStudio({ onBack }: { onBack: () => void }) {
  const [phase, setPhase]             = useState<Phase>("select");
  const [selectedGame, setSelectedGame] = useState<typeof GAMES[0] | null>(null);
  const [customGame, setCustomGame]   = useState("");

  const [recState, setRecState]   = useState<RecState>("idle");
  const [elapsed, setElapsed]     = useState(0);
  const [bufferLen, setBufferLen] = useState(0);
  const [clips, setClips]         = useState<SavedClip[]>([]);
  const [error, setError]         = useState("");
  const [micOn, setMicOn]         = useState(false);
  const [facecamOn, setFacecamOn] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [copiedId, setCopiedId]   = useState<string | null>(null); // which clip was just copied
  const [editingClip, setEditingClip] = useState<SavedClip | null>(null);

  // Editor states
  const [activeTool, setActiveTool] = useState("Selection");
  const [activeRightPanel, setActiveRightPanel] = useState("Color");
  const [activeSubPanel, setActiveSubPanel] = useState("Basic");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [eqValues, setEqValues] = useState(Array(10).fill(50));
  const [colorValues, setColorValues] = useState(Array(10).fill(50));
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false, underline: false, align: "left" });
  const [textContent, setTextContent] = useState("");
  const [activeTrack, setActiveTrack] = useState("V1");
  
  // Transform States
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 });
  // Filter States
  const [filters, setFilters] = useState({ blur: 0, sepia: 0, invert: 0 });
  const [hiddenTracks, setHiddenTracks] = useState<string[]>([]);
  const [mutedTracks, setMutedTracks] = useState<string[]>([]);

  const editorVideoRef = useRef<HTMLVideoElement>(null);

  const mediaRecRef  = useRef<MediaRecorder | null>(null);
  const chunkRingRef = useRef<Blob[]>([]);
  const streamRef    = useRef<MediaStream | null>(null);
  const sourceStreamsRef = useRef<MediaStream[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const compositeVideoElementsRef = useRef<{ screen: HTMLVideoElement; face: HTMLVideoElement } | null>(null);
  const previewRef   = useRef<HTMLVideoElement>(null);
  const facecamPreviewRef = useRef<HTMLVideoElement>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupStreams = () => {
    timerRef.current && clearInterval(timerRef.current);
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (compositeVideoElementsRef.current) {
      compositeVideoElementsRef.current.screen.pause();
      compositeVideoElementsRef.current.face.pause();
      compositeVideoElementsRef.current.screen.srcObject = null;
      compositeVideoElementsRef.current.face.srcObject = null;
      compositeVideoElementsRef.current = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    sourceStreamsRef.current.forEach(s => s.getTracks().forEach(t => t.stop()));
    sourceStreamsRef.current = [];
  };

  const stopEverything = () => {
    mediaRecRef.current?.state === "recording" && mediaRecRef.current.stop();
    cleanupStreams();
  };

  const stopRecording = useCallback(() => {
    if (mediaRecRef.current?.state === "recording") mediaRecRef.current.stop();
    cleanupStreams();
    if (previewRef.current) previewRef.current.srcObject = null;
    setRecState("idle"); setElapsed(0); setBufferLen(0); chunkRingRef.current = [];
  }, []);

  const saveClip = useCallback(() => {
    const chunks = [...chunkRingRef.current];
    if (!chunks.length) { setError("Buffer empty — wait a few seconds first."); return; }
    setIsSaving(true);
    const mime = mediaRecRef.current?.mimeType || "video/webm";
    const blob = new Blob(chunks, { type: mime });
    const url  = URL.createObjectURL(blob);
    const num  = Date.now();
    const clip: SavedClip = {
      id: crypto.randomUUID(),
      name: `${selectedGame?.name || "Game"} — Clip #${String(num).slice(-4)}`,
      url, duration: chunks.length, size: blob.size,
    };
    setClips(prev => [clip, ...prev]);
    setIsSaving(false); setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [selectedGame]);

  const copyClipUrl = useCallback((clip: SavedClip) => {
    navigator.clipboard.writeText(clip.url).then(() => {
      setCopiedId(clip.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const inp = document.createElement("input");
      inp.value = clip.url;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
      setCopiedId(clip.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const startRecording = useCallback(async () => {
    setError("");
    cleanupStreams(); // ensure clean state
    try {
      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 60, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });
      sourceStreamsRef.current.push(displayStream);

      let facecamStream: MediaStream | null = null;
      if (facecamOn) {
        try {
          facecamStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
          sourceStreamsRef.current.push(facecamStream);
          if (facecamPreviewRef.current) {
            facecamPreviewRef.current.srcObject = facecamStream;
            facecamPreviewRef.current.play().catch(console.warn);
          }
        } catch (err: any) { 
          setError("Kamera izni alınamadı veya kamera bulunamadı.");
        }
      }

      let finalVideoStream = displayStream;

      if (facecamStream && facecamStream.getVideoTracks().length > 0) {
        const canvas = document.createElement("canvas");
        // default 1080p canvas for composition
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d", { alpha: false });

        const screenVideo = document.createElement("video");
        screenVideo.srcObject = displayStream;
        screenVideo.muted = true;
        screenVideo.playsInline = true;
        screenVideo.autoplay = true;
        screenVideo.onloadedmetadata = () => screenVideo.play().catch(e => console.warn("screen play error:", e));

        const faceVideo = document.createElement("video");
        faceVideo.srcObject = facecamStream;
        faceVideo.muted = true;
        faceVideo.playsInline = true;
        faceVideo.autoplay = true;
        faceVideo.onloadedmetadata = () => faceVideo.play().catch(e => console.warn("face play error:", e));

        compositeVideoElementsRef.current = { screen: screenVideo, face: faceVideo };

        const drawFrame = () => {
          if (!ctx) return;
          try {
            // Fill black background first
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // draw screen
            if (screenVideo.readyState >= 2) {
              ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
            }
            
            // draw facecam
            if (faceVideo.readyState >= 2) {
              const fw = 320;
              const fh = 180;
              const pad = 30;

              // optional subtle shadow
              ctx.shadowColor = "rgba(0,0,0,0.8)";
              ctx.shadowBlur = 10;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
              
              ctx.drawImage(faceVideo, pad, pad, fw, fh);
              
              ctx.shadowColor = "transparent"; // reset shadow
              // border for facecam
              ctx.strokeStyle = "rgba(255,255,255,0.2)";
              ctx.lineWidth = 2;
              ctx.strokeRect(pad, pad, fw, fh);
            }
          } catch (err) {
            console.warn("Canvas drawing error:", err);
          }
          animFrameRef.current = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        finalVideoStream = canvas.captureStream(60);
      }

      let allAudioTracks: MediaStreamTrack[] = [...displayStream.getAudioTracks()];

      if (micOn) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          sourceStreamsRef.current.push(micStream);
          allAudioTracks.push(...micStream.getAudioTracks());
        } catch { /* mic denied */ }
      }

      let finalStream: MediaStream;
      if (allAudioTracks.length > 0) {
        const ac = new AudioContext();
        if (ac.state === "suspended") await ac.resume();
        const dest = ac.createMediaStreamDestination();
        allAudioTracks.forEach(track => {
          const dummyStream = new MediaStream([track]);
          const source = ac.createMediaStreamSource(dummyStream);
          source.connect(dest);
        });
        finalStream = new MediaStream([...finalVideoStream.getVideoTracks(), ...dest.stream.getTracks()]);
      } else {
        finalStream = new MediaStream([...finalVideoStream.getVideoTracks()]);
      }

      streamRef.current = finalStream;
      if (previewRef.current) {
        previewRef.current.srcObject = finalStream;
        previewRef.current.muted = true;
        previewRef.current.play().catch(() => {});
      }

      const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find(m => MediaRecorder.isTypeSupported(m)) || "video/webm";

      chunkRingRef.current = [];
      const mr = new MediaRecorder(finalStream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });

      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) {
          chunkRingRef.current.push(e.data);
          if (chunkRingRef.current.length > BUFFER_SECS) chunkRingRef.current.shift();
          setBufferLen(Math.min(chunkRingRef.current.length, BUFFER_SECS));
        }
      };
      mr.onstop = () => { setRecState("idle"); timerRef.current && clearInterval(timerRef.current); };
      mr.start(CHUNK_MS);
      mediaRecRef.current = mr;

      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
      displayStream.getVideoTracks()[0].onended = stopRecording; // watch the screen track
      setRecState("recording");
    } catch (err: any) {
      if (err?.name !== "NotAllowedError")
        setError("Screen share failed: " + (err?.message || "Unknown error"));
    }
  }, [micOn, facecamOn, stopRecording]);

  useEffect(() => () => stopEverything(), []);

  // F9 → save clip (defined AFTER saveClip to avoid TDZ)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F9") { e.preventDefault(); saveClip(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveClip]);

  const fmt   = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const fmtMB = (b: number) => (b / 1048576).toFixed(1) + " MB";
  const game  = selectedGame || { name: "Game", color: "from-zinc-600 to-zinc-800", icon: "🎮", genre: "" };

  // ── PHASE: SELECT ──────────────────────────────────────────────────────────
  if (phase === "select") return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-16 flex items-center px-6 gap-4 border-b border-white/5 bg-black/40 sticky top-0 z-50 backdrop-blur-xl">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all text-zinc-400"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center shadow-lg shadow-purple-600/30"><Gamepad2 size={18} /></div>
          <div>
            <h1 className="font-black text-white text-base leading-none">Players Studio</h1>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Instant Replay Recorder</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-zinc-500"><Shield size={12} className="text-emerald-500" />100% Local · No Upload</div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Zap size={12} fill="currentColor" /> Instant Replay · 60 Second Buffer
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Select Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400">Game</span>
          </h2>
          <p className="text-zinc-500 text-base">
            Choose a game, then we'll guide you to capture <strong className="text-white">only that window</strong>.
            Press <kbd className="bg-white/10 px-2 py-0.5 rounded text-white text-xs">Save Clip</kbd> to keep the last 60 s.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {GAMES.map(g => (
            <motion.button key={g.id} whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGame(g)}
              className={`relative group p-5 rounded-3xl border-2 transition-all text-center flex flex-col items-center gap-3 ${
                selectedGame?.id === g.id
                  ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                  : "border-white/5 bg-white/5 hover:border-white/20"
              }`}>
              <span className="text-4xl">{g.icon}</span>
              <div>
                <p className="font-black text-white text-[12px] leading-tight">{g.name}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{g.genre}</p>
              </div>
              {selectedGame?.id === g.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {selectedGame?.id === "other" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-sm mx-auto">
            <input type="text" placeholder="Enter game name..." value={customGame}
              onChange={e => setCustomGame(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm font-bold placeholder:text-zinc-600 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all" />
          </motion.div>
        )}

        <div className="flex justify-center">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={!selectedGame}
            onClick={() => {
              if (selectedGame?.id === "other" && customGame.trim()) setSelectedGame({ ...selectedGame, name: customGame.trim() });
              setPhase("recorder");
            }}
            className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-2xl shadow-purple-600/30 transition-all text-base">
            <Gamepad2 size={20} /> Enter Studio <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Hileler & Modlar Section */}
        <div className="mt-16 pt-8 border-t border-white/10 w-full max-w-5xl mx-auto">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <Sparkles className="text-purple-500" /> Hileler & Modlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <Box size={20} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">Meteor Client</p>
                  <p className="text-xs text-zinc-500 mt-0.5">meteor-client-26.1.2-2.jar</p>
                </div>
              </div>
              <a href="/meteor-client-26.1.2-2.jar" download="meteor-client-26.1.2-2.jar"
                 className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-xs">
                <Download size={14} /> İndir
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // ── PHASE: RECORDER ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="h-16 flex items-center px-6 gap-4 border-b border-white/5 bg-black/60 sticky top-0 z-50 backdrop-blur-xl">
        <button onClick={() => { stopRecording(); setPhase("select"); }} className="p-2 hover:bg-white/10 rounded-xl transition-all text-zinc-400">
          <ArrowLeft size={20} />
        </button>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${game.color} shadow-lg`}>
          <span className="text-lg">{game.icon}</span>
          <span className="font-black text-sm">{game.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button onClick={() => setFacecamOn(v => !v)} title={facecamOn ? "Disable facecam" : "Enable facecam"}
            className={`p-2 rounded-xl transition-all ${facecamOn ? "bg-purple-600/20 text-purple-400" : "bg-white/5 text-zinc-500 hover:bg-white/10"}`}>
            {facecamOn ? <Camera size={18} /> : <CameraOff size={18} />}
          </button>
          <button onClick={() => setMicOn(v => !v)} title={micOn ? "Disable mic" : "Enable mic"}
            className={`p-2 rounded-xl transition-all ${micOn ? "bg-emerald-600/20 text-emerald-400" : "bg-white/5 text-zinc-500 hover:bg-white/10"}`}>
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          {recState === "recording" ? (
            <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-black text-sm">REC {fmt(elapsed)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-600 text-sm font-bold">
              <Square size={14} /> STANDBY
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-4rem)]">
        {/* Left: Preview + Controls */}
        <div className="lg:col-span-2 flex flex-col p-6 gap-6">
          {/* Preview */}
          <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl min-h-[300px]">
            <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-contain" />
            
            {/* Direct Facecam Overlay */}
            {facecamOn && recState === "recording" && (
              <div className="absolute top-6 left-6 w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
                <video ref={facecamPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
            )}

            {recState !== "recording" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MonitorPlay size={40} className="text-zinc-600" />
                </div>
                <p className="text-zinc-600 text-sm font-bold">Press Start Recording to begin</p>
              </div>
            )}
            {recState === "recording" && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-[10px] font-black mb-1.5 text-white/60">
                  <span className="flex items-center gap-1"><Clock size={10} /> BUFFER</span>
                  <span className="text-purple-400">{bufferLen}s / {BUFFER_SECS}s</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full"
                    animate={{ width: `${(bufferLen / BUFFER_SECS) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            )}
          </div>

          {/* Tip banner — shown only when idle */}
          {recState === "idle" && (
            <div className="flex items-start gap-3 bg-purple-600/10 border border-purple-500/25 rounded-2xl px-4 py-3">
              <span className="text-xl mt-0.5">💡</span>
              <div>
                <p className="text-purple-300 font-black text-xs mb-0.5">Oyununu yakalamak için:</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Açılan diyalogda <span className="text-white font-black">«Tüm Ekran»</span> sekmesini seç
                  — bu şekilde oyununun çalıştığı tüm masaüstü yakalanır.{" "}
                  <span className="text-zinc-500">«Pencere» sekmesi sadece açık tarayıcı pencerelerini gösterir.</span>
                </p>
              </div>
            </div>
          )}

          {/* F9 shortcut hint — visible while recording */}
          {recState === "recording" && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-400">
              <kbd className="bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-black text-[11px]">F9</kbd>
              <span>tuşuna bas → anında klip kaydet</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            {recState === "idle" ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => startRecording()}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-2xl shadow-red-600/30 transition-all text-base">
                <Circle size={20} className="fill-white" /> Start Recording — Select Screen
              </motion.button>
            ) : (
              <>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={saveClip} disabled={isSaving || bufferLen === 0}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all shadow-2xl disabled:opacity-40 ${
                    justSaved ? "bg-emerald-600 shadow-emerald-600/30"
                              : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-purple-600/30"
                  }`}>
                  {justSaved ? <><CheckCircle2 size={20} /> Clip Saved!</>
                    : isSaving ? <><Film size={20} className="animate-spin" /> Saving...</>
                    : <><Save size={20} /> Save Last {bufferLen > 0 ? `${bufferLen}s` : "60s"} Clip</>}
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={stopRecording}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black rounded-2xl transition-all">
                  <Square size={20} />
                </motion.button>
              </>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-sm font-medium">
                <AlertTriangle size={16} /> {error}
                <button onClick={() => setError("")} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Clips panel */}
        <div className="border-l border-white/5 bg-black/30 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Film size={12} className="text-purple-400" /> Saved Clips ({clips.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {clips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
                  <Sparkles size={32} className="text-zinc-700" />
                  <p className="text-zinc-600 text-xs font-bold">No clips yet.<br />Start recording and save highlights!</p>
                </div>
              ) : clips.map(clip => (
                <motion.div key={clip.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="group bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 rounded-2xl p-4 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate">{clip.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-zinc-500 text-[10px] font-bold">
                        <Clock size={10} /><span>{fmt(clip.duration)}</span><span>•</span><span>{fmtMB(clip.size)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditingClip(clip)} title="Edit Clip"
                        className="p-1.5 hover:bg-blue-500/20 text-zinc-600 hover:text-blue-400 rounded-lg transition-all">
                        <Scissors size={13} />
                      </button>
                      <button onClick={() => { URL.revokeObjectURL(clip.url); setClips(prev => prev.filter(c => c.id !== clip.id)); }} title="Delete"
                        className="p-1.5 hover:bg-red-500/20 text-zinc-600 hover:text-red-400 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <video src={clip.url} controls className="w-full rounded-xl bg-black aspect-video object-contain" />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyClipUrl(clip)}
                      className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[11px] font-black transition-all border ${
                        copiedId === clip.id
                          ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                      }`}>
                      {copiedId === clip.id ? <CheckCircle2 size={12} /> : <span>📋</span>}
                      {copiedId === clip.id ? "Kopyalandı!" : "URL Kopyala"}
                    </button>
                    <a href={clip.url} download={`${clip.name}.webm`}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-[11px] font-black transition-all">
                      <Download size={13} /> İndir
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="px-5 py-4 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold">
              <Shield size={10} className="text-emerald-500" /> All clips stored locally in your browser
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold">
              <Clock size={10} className="text-purple-500" /> Buffer keeps last {BUFFER_SECS} seconds
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal (Davinci Resolve / Premiere Style) */}
      <AnimatePresence>
        {editingClip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col font-[family-name:var(--font-inter)] h-screen w-screen overflow-hidden">
            
            {/* Top Menu Bar */}
            <div className="h-8 border-b border-white/5 bg-[#0a0a0f] flex items-center px-4 text-[11px] font-bold text-zinc-400 shrink-0 gap-6">
              <div className="flex items-center gap-2 text-white">
                <Menu size={12} /> <span className="text-blue-400">Macrotar Pro</span>
              </div>
              {["File", "Edit", "Trim", "Timeline", "Clip", "Sequence", "Markers", "Graphics", "View", "Window", "Help"].map((m, i) => (
                <button key={i} className="hover:text-white transition-colors">{m}</button>
              ))}
            </div>

            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0e0e14] flex-shrink-0">
              <div className="flex items-center gap-6">
                <button onClick={() => { setEditingClip(null); setIsPlaying(false); }} className="text-zinc-400 hover:text-white transition-all"><X size={20} /></button>
                <div className="flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <button className="text-zinc-400 hover:text-white transition-all"><Undo size={14} /></button>
                  <button className="text-zinc-400 hover:text-white transition-all"><Redo size={14} /></button>
                  <div className="w-px h-4 bg-white/10" />
                  <button className="text-zinc-400 hover:text-white transition-all"><Settings size={14} /></button>
                  <button className="text-zinc-400 hover:text-white transition-all"><Maximize size={14} /></button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-[#1a1a24] rounded-lg p-1 border border-white/5">
                 {["Media", "Cut", "Edit", "Fusion", "Color", "Fairlight", "Deliver"].map(t => (
                   <button key={t} onClick={() => setActiveRightPanel(t === "Color" ? "Color" : t === "Fairlight" ? "Audio" : t === "Edit" ? "Video Settings" : "Transitions")}
                     className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors ${activeRightPanel === t || (t==="Color" && activeRightPanel==="Color") || (t==="Fairlight" && activeRightPanel==="Audio") || (t==="Edit" && activeRightPanel==="Video Settings") ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}>
                     {t}
                   </button>
                 ))}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setIsExporting(true);
                    setTimeout(() => {
                      setIsExporting(false);
                      const a = document.createElement("a");
                      a.href = editingClip.url;
                      a.download = `Master_${editingClip.name}.webm`;
                      a.click();
                    }, 2000);
                  }} 
                  disabled={isExporting}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-black text-xs hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-600/20">
                  {isExporting ? <span className="animate-pulse">Rendering...</span> : "Quick Export"}
                </button>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Vertical Toolbar */}
              <div className="w-12 border-r border-white/5 bg-[#0a0a0f] flex flex-col items-center py-4 gap-4 overflow-y-auto hidden md:flex shrink-0">
                {[
                  { icon: MousePointer2, label: "Selection" },
                  { icon: Scissors, label: "Razor" },
                  { icon: Hash, label: "Ripple" },
                  { icon: Move, label: "Slip" },
                  { icon: Crop, label: "Slide" },
                  { icon: PenTool, label: "Pen" },
                  { icon: Hand, label: "Hand" },
                  { icon: Search, label: "Zoom" },
                  { icon: Crosshair, label: "Tracker" },
                  { icon: Type, label: "Text" },
                  { icon: Box, label: "Shapes" },
                  { icon: Wand2, label: "Magic" }
                ].map((tool, i) => {
                  const isActive = activeTool === tool.label;
                  return (
                    <button key={i} title={tool.label}
                      onClick={() => setActiveTool(tool.label)}
                      className={`p-2 rounded-lg transition-colors ${isActive ? "bg-blue-500/20 text-blue-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}>
                      <tool.icon size={16} />
                    </button>
                  );
                })}
              </div>

              {/* Center Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Preview Area */}
                <div className="flex-1 bg-black relative flex items-center justify-center p-4 overflow-hidden">
                  <div className="relative" style={{ 
                    transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg)`,
                    opacity: transform.opacity
                  }}>
                    <video 
                      ref={editorVideoRef}
                      src={editingClip.url} 
                      onTimeUpdate={() => setCurrentTime(editorVideoRef.current?.currentTime || 0)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10" 
                      style={{
                        filter: `
                          brightness(${colorValues[2] * 2}%) 
                          contrast(${colorValues[3] * 2}%) 
                          saturate(${colorValues[8] * 2}%) 
                          blur(${filters.blur}px) 
                          sepia(${filters.sepia}%) 
                          invert(${filters.invert}%)
                        `
                      }}
                      onClick={() => {
                        if (editorVideoRef.current) {
                          editorVideoRef.current.paused ? editorVideoRef.current.play() : editorVideoRef.current.pause();
                        }
                      }}
                    />
                    {/* Text Overlay */}
                    {textContent && (
                      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${hiddenTracks.includes("V2") ? "hidden" : ""}`}>
                        <span className="text-white text-4xl drop-shadow-xl" style={{
                          fontWeight: textStyle.bold ? "bold" : "normal",
                          fontStyle: textStyle.italic ? "italic" : "normal",
                          textDecoration: textStyle.underline ? "underline" : "none",
                          textAlign: textStyle.align as any
                        }}>{textContent}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Transport Controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-lg">
                     {/* Scrubber */}
                     <div className="w-full h-1 bg-white/10 rounded-full cursor-pointer relative group"
                          onClick={(e) => {
                            if (!editorVideoRef.current) return;
                            const r = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - r.left) / r.width;
                            editorVideoRef.current.currentTime = pct * editingClip.duration;
                          }}>
                        <div className="absolute top-0 left-0 bottom-0 bg-blue-500 rounded-full pointer-events-none" style={{ width: `${(currentTime/editingClip.duration)*100}%` }}></div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow" style={{ left: `calc(${(currentTime/editingClip.duration)*100}% - 6px)` }}></div>
                     </div>
                     
                     {/* Buttons */}
                     <div className="flex items-center gap-6 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                        <button className="text-zinc-400 hover:text-white"><SkipBack size={16} fill="currentColor" /></button>
                        <button className="text-zinc-400 hover:text-white"><Rewind size={16} fill="currentColor" /></button>
                        <button 
                          onClick={() => {
                            if (editorVideoRef.current) {
                              editorVideoRef.current.paused ? editorVideoRef.current.play() : editorVideoRef.current.pause();
                            }
                          }}
                          className="text-white hover:text-blue-400 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full transition-colors">
                          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                        </button>
                        <button className="text-zinc-400 hover:text-white"><FastForward size={16} fill="currentColor" /></button>
                        <button className="text-zinc-400 hover:text-white"><SkipForward size={16} fill="currentColor" /></button>
                        
                        <div className="w-px h-4 bg-white/10 mx-2" />
                        <span className="text-zinc-300 font-mono text-xs w-32 text-center">
                          {fmt(Math.floor(currentTime))} : {(currentTime % 1).toFixed(2).slice(2)} <span className="text-zinc-600">/</span> {fmt(editingClip.duration)}
                        </span>
                     </div>
                  </div>
                </div>

                {/* Timeline Area */}
                <div className="h-72 border-t border-white/5 bg-[#0e0e14] flex flex-col">
                  {/* Timeline Toolbar */}
                  <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto shrink-0 bg-[#12121a]">
                    <div className="flex gap-1 border-r border-white/10 pr-4 mr-2">
                       <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white" title="Snapping"><Zap size={14} /></button>
                       <button className="p-1.5 rounded bg-blue-500/20 text-blue-400" title="Linked Selection"><Command size={14} /></button>
                       <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white" title="Markers"><Droplet size={14} /></button>
                    </div>

                    {[
                       { i: Scissors, l: "Split", p: "Video Settings" },
                       { i: Copy, l: "Copy", p: "Video Settings" },
                       { i: ClipboardPaste, l: "Paste", p: "Video Settings" },
                       { i: Trash2, l: "Delete", p: "Video Settings" },
                       { i: Activity, l: "Retime", p: "Video Settings" },
                       { i: Focus, l: "Stabilize", p: "Video Settings" },
                       { i: Palette, l: "Color Match", p: "Color" },
                       { i: Volume2, l: "Normalize", p: "Audio" },
                       { i: ImageIcon, l: "Add Mask", p: "Effects" },
                       { i: Wand2, l: "Auto Enhance", p: "Color" }
                    ].map((b, idx) => (
                      <button key={idx} onClick={() => setActiveRightPanel(b.p)} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white text-[10px] font-bold transition-colors whitespace-nowrap">
                         <b.i size={12} /> {b.l}
                      </button>
                    ))}
                    
                    <div className="ml-auto flex items-center gap-2">
                       <span className="text-[10px] font-bold text-zinc-600">Zoom</span>
                       <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                          <div className="w-1/2 h-full bg-zinc-500 rounded-full"></div>
                       </div>
                    </div>
                  </div>

                  {/* Tracks */}
                  <div className="flex-1 overflow-auto relative p-0 select-none bg-[#0a0a0f]">
                    {/* Time Ruler */}
                    <div className="h-6 flex items-end border-b border-white/10 pb-0.5 sticky top-0 bg-[#0e0e14] z-20">
                      <div className="w-24 shrink-0 bg-[#0e0e14] border-r border-white/10 h-full"></div>
                      <div className="flex-1 flex">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="flex-1 border-l border-zinc-700/50 pl-1 text-[8px] font-mono text-zinc-500">
                            00:{String(i * 5).padStart(2, '0')}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* V3 Track */}
                    <div className={`flex items-stretch border-b border-white/5 h-12 transition-colors ${activeTrack === "V3" ? "bg-white/[0.02]" : ""}`} onClick={() => setActiveTrack("V3")}>
                      <div className="w-24 shrink-0 bg-[#12121a] border-r border-white/10 flex flex-col justify-center px-2">
                         <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                            <span className="text-zinc-300">V3</span>
                            <div className="flex gap-1">
                               <button className="hover:text-white"><Eye size={10} /></button>
                               <button className="hover:text-white"><Lock size={10} /></button>
                            </div>
                         </div>
                      </div>
                      <div className="flex-1 relative p-1"></div>
                    </div>

                    {/* V2 Track (Text) */}
                    <div className={`flex items-stretch border-b border-white/5 h-12 transition-colors ${activeTrack === "V2" ? "bg-white/[0.02]" : ""}`} onClick={() => setActiveTrack("V2")}>
                      <div className="w-24 shrink-0 bg-[#12121a] border-r border-white/10 flex flex-col justify-center px-2">
                         <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                            <span className="text-zinc-300">V2</span>
                            <div className="flex gap-1">
                               <button onClick={() => setHiddenTracks(prev => prev.includes("V2") ? prev.filter(t => t !== "V2") : [...prev, "V2"])} className={hiddenTracks.includes("V2") ? "text-zinc-600" : "text-blue-400"}><Eye size={10} /></button>
                               <button className="hover:text-white"><Lock size={10} /></button>
                            </div>
                         </div>
                      </div>
                      <div className="flex-1 relative p-1">
                         {textContent && (
                           <div className="absolute left-[10%] w-[80%] h-[calc(100%-8px)] bg-amber-600/30 rounded border border-amber-500/50 flex items-center px-2">
                              <Type size={10} className="text-amber-400 mr-1"/> <span className="text-[9px] text-white font-bold truncate">{textContent}</span>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* V1 Track */}
                    <div className={`flex items-stretch border-b border-zinc-700 h-16 transition-colors ${activeTrack === "V1" ? "bg-white/[0.02]" : ""}`} onClick={() => setActiveTrack("V1")}>
                      <div className="w-24 shrink-0 bg-[#12121a] border-r border-white/10 flex flex-col justify-center px-2">
                         <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                            <span className="text-white font-black">V1</span>
                            <div className="flex gap-1">
                               <button onClick={() => setHiddenTracks(prev => prev.includes("V1") ? prev.filter(t => t !== "V1") : [...prev, "V1"])} className={hiddenTracks.includes("V1") ? "text-zinc-600" : "text-blue-400"}><Eye size={10} /></button>
                               <button className="hover:text-white"><Lock size={10} /></button>
                            </div>
                         </div>
                      </div>
                      <div className={`flex-1 relative p-1 ${hiddenTracks.includes("V1") ? "opacity-30" : ""}`}>
                         <div className="absolute left-[5%] right-[20%] h-[calc(100%-8px)] bg-blue-600/30 rounded border border-blue-500/50 overflow-hidden flex items-center px-2 shadow-inner">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)' }}></div>
                            <img src="/api/placeholder/400/320" className="absolute top-0 bottom-0 left-0 h-full opacity-30 object-cover w-full mix-blend-overlay" />
                            <span className="text-[10px] text-white font-bold relative z-10 truncate shadow-black drop-shadow-md">{editingClip.name}</span>
                         </div>
                      </div>
                    </div>

                    {/* A1 Track */}
                    <div className={`flex items-stretch border-b border-white/5 h-16 transition-colors ${activeTrack === "A1" ? "bg-white/[0.02]" : ""}`} onClick={() => setActiveTrack("A1")}>
                      <div className="w-24 shrink-0 bg-[#12121a] border-r border-white/10 flex flex-col justify-center px-2">
                         <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                            <span className="text-emerald-400 font-black">A1</span>
                            <div className="flex gap-1">
                               <button onClick={() => { 
                                 setMutedTracks(prev => prev.includes("A1") ? prev.filter(t => t !== "A1") : [...prev, "A1"]);
                                 if (editorVideoRef.current) editorVideoRef.current.muted = !mutedTracks.includes("A1");
                               }} className={mutedTracks.includes("A1") ? "text-red-400" : "hover:text-white"}>M</button>
                               <button className="hover:text-white">S</button>
                            </div>
                         </div>
                         <div className="h-1 bg-black rounded-full mt-2 overflow-hidden"><div className="w-3/4 h-full bg-emerald-500" /></div>
                      </div>
                      <div className={`flex-1 relative p-1 ${mutedTracks.includes("A1") ? "opacity-30 grayscale" : ""}`}>
                         <div className="absolute left-[5%] right-[20%] h-[calc(100%-8px)] bg-emerald-600/20 rounded border border-emerald-500/30 overflow-hidden">
                           <svg className="w-full h-full text-emerald-500/60" preserveAspectRatio="none" viewBox="0 0 200 20">
                             {[...Array(50)].map((_, i) => (
                               <path key={i} d={`M${i*4},10 L${i*4 + 2},${Math.random() * 20} L${i*4 + 4},10`} fill="none" stroke="currentColor" strokeWidth="0.5" />
                             ))}
                           </svg>
                         </div>
                      </div>
                    </div>

                    {/* A2 Track */}
                    <div className={`flex items-stretch border-b border-white/5 h-12 transition-colors ${activeTrack === "A2" ? "bg-white/[0.02]" : ""}`} onClick={() => setActiveTrack("A2")}>
                      <div className="w-24 shrink-0 bg-[#12121a] border-r border-white/10 flex flex-col justify-center px-2">
                         <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                            <span className="text-zinc-300">A2</span>
                            <div className="flex gap-1">
                               <button className="hover:text-white">M</button>
                               <button className="hover:text-white">S</button>
                            </div>
                         </div>
                      </div>
                      <div className="flex-1 relative p-1">
                         <div className="absolute left-[20%] right-[50%] h-[calc(100%-8px)] bg-emerald-600/10 rounded border border-emerald-500/20 overflow-hidden">
                           <svg className="w-full h-full text-emerald-500/30" preserveAspectRatio="none" viewBox="0 0 100 20">
                             {[...Array(20)].map((_, i) => (
                               <path key={i} d={`M${i*4},10 L${i*4 + 2},${Math.random() * 10 + 5} L${i*4 + 4},10`} fill="none" stroke="currentColor" strokeWidth="0.5" />
                             ))}
                           </svg>
                         </div>
                      </div>
                    </div>

                    {/* Playhead */}
                    <div 
                      className="absolute top-0 bottom-0 w-[1px] bg-red-500 pointer-events-none z-30 transition-all duration-75"
                      style={{ left: `calc(96px + ${(currentTime / editingClip.duration) * 100}% - ${(currentTime / editingClip.duration) * 96}px)` }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-5 bg-red-500 rounded-b shadow-[0_0_10px_rgba(239,68,68,0.8)] flex items-center justify-center">
                         <div className="w-0.5 h-2 bg-black/30 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Settings Panel */}
              <div className="w-80 border-l border-white/5 bg-[#0e0e14] hidden xl:flex flex-col">
                {/* Panel Tabs */}
                <div className="flex items-center overflow-x-auto border-b border-white/5 shrink-0 px-2 py-2 gap-1 bg-[#0a0a0f]">
                  {["Video Settings", "Color", "Audio", "Text", "Effects", "Transitions"].map(tab => (
                    <button key={tab} onClick={() => setActiveRightPanel(tab)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-colors ${activeRightPanel === tab ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {/* VIDEO SETTINGS PANEL */}
                  {activeRightPanel === "Video Settings" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-white font-bold text-xs">Transform</h4>
                        <button className="text-zinc-500 hover:text-white"><Settings size={12}/></button>
                      </div>
                      
                      {/* Transform Controls linked to state */}
                      <div className="group mb-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1"><span>Scale X/Y</span><span className="font-mono">{transform.scale.toFixed(2)}</span></div>
                        <input type="range" min="0.1" max="3" step="0.1" value={transform.scale} onChange={e => setTransform(t => ({...t, scale: parseFloat(e.target.value)}))} className="w-full h-1" />
                      </div>
                      <div className="group mb-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1"><span>Rotation</span><span className="font-mono">{transform.rotate}°</span></div>
                        <input type="range" min="-180" max="180" step="1" value={transform.rotate} onChange={e => setTransform(t => ({...t, rotate: parseInt(e.target.value)}))} className="w-full h-1" />
                      </div>
                      <div className="group mb-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1"><span>Position X</span><span className="font-mono">{transform.x}</span></div>
                        <input type="range" min="-500" max="500" step="1" value={transform.x} onChange={e => setTransform(t => ({...t, x: parseInt(e.target.value)}))} className="w-full h-1" />
                      </div>
                      <div className="group mb-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1"><span>Position Y</span><span className="font-mono">{transform.y}</span></div>
                        <input type="range" min="-500" max="500" step="1" value={transform.y} onChange={e => setTransform(t => ({...t, y: parseInt(e.target.value)}))} className="w-full h-1" />
                      </div>
                      <div className="group mb-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1"><span>Opacity</span><span className="font-mono">{(transform.opacity * 100).toFixed(0)}%</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={transform.opacity} onChange={e => setTransform(t => ({...t, opacity: parseFloat(e.target.value)}))} className="w-full h-1" />
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mt-8">
                        <h4 className="text-white font-bold text-xs">Cropping</h4>
                        <div className="w-6 h-3 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
                      </div>
                      {[
                        { label: "Crop Left", val: "0.00" },
                        { label: "Crop Right", val: "0.00" },
                        { label: "Crop Top", val: "0.00" },
                        { label: "Crop Bottom", val: "0.00" },
                        { label: "Softness", val: "0.00" }
                      ].map((prop, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between text-[10px] text-zinc-400 mb-1 group-hover:text-white">
                             <span>{prop.label}</span>
                             <span className="bg-black border border-white/10 px-2 py-0.5 rounded font-mono text-white min-w-[50px] text-right">{prop.val}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="w-[0%] h-full bg-blue-500/50 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COLOR PANEL */}
                  {activeRightPanel === "Color" && (
                    <div className="space-y-6">
                      <div className="flex bg-black p-1 rounded-lg border border-white/5 mb-4">
                        {["Basic", "Curves", "Wheels", "HSL"].map(p => (
                          <button key={p} onClick={() => setActiveSubPanel(p)} className={`flex-1 py-1 text-[9px] font-bold rounded ${activeSubPanel === p ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>{p}</button>
                        ))}
                      </div>

                      {activeSubPanel === "Basic" && (
                         <>
                           {[
                              { label: "Temperature", color: "bg-gradient-to-r from-blue-500 to-orange-500" },
                              { label: "Tint", color: "bg-gradient-to-r from-green-500 to-fuchsia-500" },
                              { label: "Exposure", color: "bg-gradient-to-r from-black to-white" },
                              { label: "Contrast", color: "bg-gradient-to-r from-zinc-500 to-zinc-200" },
                              { label: "Highlights", color: "bg-gradient-to-r from-zinc-600 to-white" },
                              { label: "Shadows", color: "bg-gradient-to-r from-black to-zinc-400" },
                              { label: "Whites", color: "bg-gradient-to-r from-zinc-400 to-white" },
                              { label: "Blacks", color: "bg-gradient-to-r from-black to-zinc-600" },
                              { label: "Saturation", color: "bg-gradient-to-r from-zinc-500 to-red-500" },
                              { label: "Vibrance", color: "bg-gradient-to-r from-zinc-500 to-blue-500" },
                           ].map((prop, i) => (
                             <div key={i} className="group mb-4">
                               <div className="flex justify-between text-[10px] text-zinc-400 mb-1.5 group-hover:text-white">
                                  <span>{prop.label}</span>
                                  <span className="font-mono">{colorValues[i]}</span>
                               </div>
                               <input type="range" min="0" max="100" value={colorValues[i]} onChange={e => { const nv = [...colorValues]; nv[i] = parseInt(e.target.value); setColorValues(nv); }}
                                 className="w-full h-1.5 rounded-full appearance-none bg-white/5 cursor-ew-resize" style={{ backgroundImage: `var(--${prop.label})` }}/>
                               <div className="h-1.5 rounded-full w-full mt-1 opacity-50" style={{ background: prop.color ? '' : 'transparent' }}>
                                  {prop.color && <div className={`w-full h-full rounded-full ${prop.color}`} />}
                               </div>
                             </div>
                           ))}
                         </>
                      )}

                      {activeSubPanel === "Wheels" && (
                         <div className="grid grid-cols-2 gap-4">
                            {["Shadows", "Midtones", "Highlights", "Offset"].map(w => (
                               <div key={w} className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                                 <span className="text-[10px] font-bold text-zinc-400">{w}</span>
                                 <div className="w-16 h-16 rounded-full border-2 border-white/10 relative bg-gradient-to-br from-red-500/20 via-green-500/20 to-blue-500/20 shadow-inner">
                                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                                 </div>
                                 <input type="range" className="w-full h-1 mt-2" />
                               </div>
                            ))}
                         </div>
                      )}
                    </div>
                  )}

                  {/* AUDIO PANEL */}
                  {activeRightPanel === "Audio" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-white font-bold text-xs">Audio Equalizer (EQ)</h4>
                        <div className="w-6 h-3 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
                      </div>
                      
                      <div className="flex justify-between items-end h-32 bg-black/50 p-4 rounded-xl border border-white/5">
                         {[32, 64, 125, 250, 500, "1k", "2k", "4k", "8k", "16k"].map((freq, i) => (
                           <div key={i} className="flex flex-col items-center gap-2 h-full">
                              <input type="range" min="0" max="100" value={eqValues[i]} onChange={e => { const nv = [...eqValues]; nv[i] = parseInt(e.target.value); setEqValues(nv); }}
                                className="h-full w-1.5 appearance-none bg-white/10 rounded-full writing-vertical-lr [transform:rotateX(180deg)] cursor-ns-resize" />
                              <span className="text-[8px] font-mono text-zinc-500">{freq}</span>
                           </div>
                         ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                         <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] font-bold text-zinc-400 block mb-2">Noise Reduction</span>
                            <div className="flex items-center gap-2"><div className="w-6 h-3 bg-white/10 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-2 h-2 bg-zinc-500 rounded-full"></div></div><span className="text-[9px] text-zinc-500">Off</span></div>
                         </div>
                         <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] font-bold text-zinc-400 block mb-2">Vocal Isolation</span>
                            <div className="flex items-center gap-2"><div className="w-6 h-3 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div><span className="text-[9px] text-blue-400">On</span></div>
                         </div>
                      </div>
                    </div>
                  )}
                  
                  {/* TEXT PANEL */}
                  {activeRightPanel === "Text" && (
                    <div className="space-y-4">
                       <textarea value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="Enter video text overlay here..." className="w-full h-20 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white resize-none" />
                       
                       <div className="bg-black/30 p-1 border border-white/5 rounded-lg flex">
                         <button className="flex-1 py-1.5 text-xs font-bold text-white bg-white/10 rounded border border-white/5">Font</button>
                         <button className="flex-1 py-1.5 text-xs font-bold text-zinc-500 hover:text-white">Style</button>
                         <button className="flex-1 py-1.5 text-xs font-bold text-zinc-500 hover:text-white">Animation</button>
                       </div>

                       <div>
                         <span className="text-[10px] text-zinc-500 font-bold block mb-1">Font Family</span>
                         <select className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
                           <option>Inter</option><option>Roboto</option><option>Bebas Neue</option><option>Montserrat</option>
                         </select>
                       </div>

                       <div className="flex items-center gap-2 bg-[#1a1a24] p-1 rounded-lg border border-white/10">
                         <button onClick={() => setTextStyle(s => ({...s, bold: !s.bold}))} className={`p-2 rounded ${textStyle.bold ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}><Bold size={14}/></button>
                         <button onClick={() => setTextStyle(s => ({...s, italic: !s.italic}))} className={`p-2 rounded ${textStyle.italic ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}><Italic size={14}/></button>
                         <button onClick={() => setTextStyle(s => ({...s, underline: !s.underline}))} className={`p-2 rounded ${textStyle.underline ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}><Underline size={14}/></button>
                         <div className="w-px h-4 bg-white/10 mx-1" />
                         <button onClick={() => setTextStyle(s => ({...s, align: "left"}))} className={`p-2 rounded ${textStyle.align === "left" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}><AlignLeft size={14}/></button>
                         <button onClick={() => setTextStyle(s => ({...s, align: "center"}))} className={`p-2 rounded ${textStyle.align === "center" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}><AlignCenter size={14}/></button>
                         <button onClick={() => setTextStyle(s => ({...s, align: "right"}))} className={`p-2 rounded ${textStyle.align === "right" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}><AlignRight size={14}/></button>
                       </div>

                       <div className="space-y-4 pt-4 border-t border-white/5">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Color</span>
                            <div className="w-16 h-6 rounded bg-white border border-white/20"></div>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Stroke</span>
                            <div className="w-16 h-6 rounded bg-black border border-white/20"></div>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Shadow</span>
                            <div className="w-6 h-3 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
                         </div>
                       </div>
                    </div>
                  )}

                  {/* TRANSITIONS PANEL */}
                  {activeRightPanel === "Transitions" && (
                    <div className="grid grid-cols-2 gap-3">
                      {["Cross Dissolve", "Dip to Black", "Dip to White", "Film Burn", "Glitch", "Zoom In", "Wipe Right", "Iris Box", "Push Up", "Spin Blur"].map((t, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="aspect-video bg-[#1a1a24] hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center transition-colors relative overflow-hidden mb-1">
                            <LayoutTemplate size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                            {i === 0 && <div className="absolute inset-0 border border-blue-500 rounded-lg pointer-events-none"></div>}
                          </div>
                          <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 block text-center truncate px-1">{t}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* EFFECTS PANEL */}
                  {activeRightPanel === "Effects" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-white font-bold text-xs mb-3">Video Filters</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: "Blur", action: () => setFilters(f => ({...f, blur: 5})) },
                            { name: "Sepia", action: () => setFilters(f => ({...f, sepia: 100})) },
                            { name: "Invert", action: () => setFilters(f => ({...f, invert: 100})) },
                            { name: "Normal", action: () => setFilters({ blur: 0, sepia: 0, invert: 0 }) }
                          ].map(e => (
                             <div key={e.name} onClick={e.action} className="aspect-square bg-[#1a1a24] border border-white/5 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors cursor-pointer group">
                                <Wand2 size={12} className="text-zinc-500 group-hover:text-blue-400" />
                                <span className="text-[8px] font-bold text-zinc-400 group-hover:text-white text-center leading-tight">{e.name}</span>
                             </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs mb-3">Green Screen (Keying)</h4>
                        <div className="bg-[#1a1a24] border border-white/5 rounded-lg p-3">
                           <div className="flex justify-between items-center text-xs mb-3">
                              <span className="text-zinc-400">Chroma Key</span>
                              <div className="w-6 h-3 bg-zinc-700 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-2 h-2 bg-zinc-500 rounded-full"></div></div>
                           </div>
                           <button className="w-full py-1.5 border border-dashed border-white/20 text-zinc-500 rounded text-[10px] font-bold hover:text-white hover:border-white/50 transition-colors">
                              Select Color
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
