"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UploadCloud, MonitorPlay, Film, Music, Download, CheckCircle, Loader2, Play, Settings, RefreshCw, X, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { cn } from "./editor/utils";

type ToolCategory = 'BASIC_CONVERT' | 'FORMAT_SELECT' | 'FILE_MERGE' | 'TRIM' | 'GIF' | 'THUMBNAIL' | 'COMPRESS';

const TOOL_MAP: Record<string, { title: string; category: ToolCategory; defaultOutExt: string; cmdGen: (inps: string[], out: string, p: any) => string[] }> = {
  'video-compressor': { title: "Video Compressor", category: 'COMPRESS', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], '-vcodec', 'libx264', '-crf', '28', out] },
  'trim-video': { title: "Trim Video", category: 'TRIM', defaultOutExt: "mp4", cmdGen: (inps, out, p) => ['-i', inps[0], '-ss', p.start || '00:00:00', '-to', p.end || '00:00:10', '-c', 'copy', out] },
  'trim-audio': { title: "Trim Audio", category: 'TRIM', defaultOutExt: "mp3", cmdGen: (inps, out, p) => ['-i', inps[0], '-ss', p.start || '00:00:00', '-to', p.end || '00:00:10', out] },
  'video-to-gif': { title: "Video to GIF", category: 'GIF', defaultOutExt: "gif", cmdGen: (inps, out) => ['-i', inps[0], '-vf', 'scale=320:-1', '-r', '10', out] },
  'gif-to-video': { title: "GIF to Video", category: 'GIF', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out] },
  'video-thumbnail': { title: "Video Thumbnail", category: 'THUMBNAIL', defaultOutExt: "png", cmdGen: (inps, out, p) => ['-ss', p.time || '00:00:01', '-i', inps[0], '-vframes', '1', out] },
  'mute-video': { title: "Mute Video", category: 'BASIC_CONVERT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], '-an', '-c:v', 'copy', out] },
  'video-to-mp3': { title: "Video to MP3", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], '-vn', '-c:a', 'libmp3lame', out] },
  'video-converter': { title: "Video Converter", category: 'FORMAT_SELECT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'audio-converter': { title: "Audio Converter", category: 'FORMAT_SELECT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'merge-videos': { title: "Merge Videos", category: 'FILE_MERGE', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', out] },
  'merge-audio': { title: "Merge Audio", category: 'FILE_MERGE', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', out] },
  'image-compressor': { title: "Image Compressor", category: 'COMPRESS', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], '-q:v', '2', out] },
  'image-resizer': { title: "Image Resizer", category: 'TRIM', defaultOutExt: "jpg", cmdGen: (inps, out, p) => ['-i', inps[0], '-vf', 'scale=-1:720', out] },
  'heic-to-jpg': { title: "HEIC to JPG", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'png-to-jpg': { title: "PNG to JPG", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'jpg-to-png': { title: "JPG to PNG", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] }
};

export default function MediaStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  const toolConfig = TOOL_MAP[initialToolId] || TOOL_MAP['video-converter'];
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [files, setFiles] = useState<File[]>([]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  
  const [targetFormat, setTargetFormat] = useState(toolConfig.defaultOutExt);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [thumbnailTime, setThumbnailTime] = useState("00:00:01");

  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        setLogs(prev => [...prev.slice(-3), message]);
      });
      
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      setIsLoaded(true);
    };

    load().catch(console.error);

    return () => {
      ffmpegRef.current.terminate();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (toolConfig.category === 'FILE_MERGE') {
        setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      } else {
        setFiles([e.target.files[0]]);
      }
      setOutputUrl(null);
      setProgress(0);
      setLogs([]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setLogs(["Initializing Core..."]);
    const ffmpeg = ffmpegRef.current;
    try {
      const inputNames: string[] = [];
      const outputExt = toolConfig.category === 'FORMAT_SELECT' ? targetFormat : toolConfig.defaultOutExt;
      const outputName = `output.${outputExt}`;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const safeName = `input_${i}.${ext}`;
        inputNames.push(safeName);
        await ffmpeg.writeFile(safeName, await fetchFile(file));
      }
      const params = { start: startTime, end: endTime, time: thumbnailTime };
      if (toolConfig.category === 'FILE_MERGE') {
        const listContent = inputNames.map(name => `file '${name}'`).join('\n');
        await ffmpeg.writeFile('list.txt', listContent);
      }
      const args = toolConfig.cmdGen(inputNames, outputName, params);
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      for (const name of inputNames) await ffmpeg.deleteFile(name);
      if (toolConfig.category === 'FILE_MERGE') await ffmpeg.deleteFile('list.txt');
      await ffmpeg.deleteFile(outputName);
      const blob = new Blob([data as any], { type: `video/${outputExt}` });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setLogs(prev => [...prev, "Processing Complete."]);
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, "Critical Failure."]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
            <ArrowLeft size={24} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            {toolConfig.category.includes('AUDIO') ? <Music size={24} /> : <Film size={24} />}
          </div>
          <div>
            <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">{toolConfig.title}</h1>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black tracking-widest uppercase flex items-center gap-2">
              <ShieldCheck size={12} /> Privacy First • WebAssembly Powered
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8 flex flex-col items-center">
        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
            <div className="relative">
              <Loader2 size={64} className="animate-spin text-indigo-600 dark:text-indigo-500" />
              <Zap size={24} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black mt-8 text-zinc-900 dark:text-white uppercase tracking-tight">Booting Engine</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Downloading WASM Runtime (~25MB)...</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-8 mt-6">
            {!outputUrl && (
              <label 
                className="group border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/[0.02] hover:bg-indigo-500/[0.05] transition-all rounded-[3rem] p-20 flex flex-col items-center justify-center cursor-pointer text-center"
              >
                <div className="w-24 h-24 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                  <UploadCloud size={48} />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">Drop Media File</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">100% Client-side processing. Your data never leaves this window.</p>
                <input ref={fileInputRef} type="file" className="hidden" multiple={toolConfig.category === 'FILE_MERGE'} onChange={handleFileChange} />
              </label>
            )}

            {files.length > 0 && !outputUrl && (
              <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-2xl">
                <div className="space-y-4 mb-10">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-50 dark:bg-black/40 p-5 rounded-2xl border border-zinc-200 dark:border-white/5">
                      <div className="flex items-center gap-4 truncate">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                           <MonitorPlay size={20} />
                        </div>
                        <div className="truncate">
                           <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate">{file.name}</p>
                           <p className="text-[10px] text-zinc-500 uppercase font-black">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(i)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all">
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-zinc-100 dark:border-white/5">
                   {toolConfig.category === 'FORMAT_SELECT' && (
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Target Format</label>
                        <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)} className="w-full bg-zinc-100 dark:bg-black/60 border-none rounded-2xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white">
                          {toolConfig.title.includes('Video') 
                             ? ['mp4', 'webm', 'mov', 'avi', 'mkv'].map(ext => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)
                             : ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'].map(ext => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)
                          }
                        </select>
                     </div>
                   )}
                   {toolConfig.category === 'TRIM' && (
                     <>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Start (HH:MM:SS)</label>
                           <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-zinc-100 dark:bg-black/60 border-none rounded-2xl p-4 text-sm font-mono outline-none" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">End (HH:MM:SS)</label>
                           <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-zinc-100 dark:bg-black/60 border-none rounded-2xl p-4 text-sm font-mono outline-none" />
                        </div>
                     </>
                   )}
                </div>

                <div className="pt-10 flex items-center">
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-5 px-10 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.01] transition-all"
                  >
                    {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
                    {isProcessing ? "PROCESSING..." : "PROCESS MEDIA NOW"}
                  </button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-12 border border-zinc-200 dark:border-white/5 shadow-2xl text-center space-y-8">
                <div className="w-full h-4 bg-zinc-100 dark:bg-black/60 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <span>Powering FFmpeg.wasm</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <div className="bg-zinc-50 dark:bg-black/40 rounded-2xl p-6 text-[10px] text-emerald-600 font-mono text-left h-32 overflow-hidden border border-zinc-100 dark:border-white/5 leading-relaxed">
                  {logs.map((log, i) => <div key={i} className="truncate opacity-80 select-none">{log}</div>)}
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-[3rem] p-16 border border-indigo-500/30 text-center space-y-8 shadow-2xl backdrop-blur-xl">
                <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40 scale-110">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">Render Success</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-xs">Localized file ready for deployment.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <button onClick={() => { setOutputUrl(null); setFiles([]); }} className="flex items-center justify-center gap-3 bg-white dark:bg-white/10 text-zinc-900 dark:text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl">
                    <RefreshCw size={20} /> New Task
                  </button>
                  <a href={outputUrl} download={`macrotar_media_${Date.now()}.${targetFormat}`} className="flex items-center justify-center gap-3 bg-indigo-600 text-white font-black py-4 px-12 rounded-2xl shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-all">
                    <Download size={20} /> Download Result
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 bg-zinc-100 dark:bg-white/5 p-6 rounded-3xl text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed max-w-3xl mx-auto mt-20 border border-zinc-200 dark:border-white/5">
              <AlertTriangle size={24} className="shrink-0 text-amber-500" />
              <p>Performance Notice: Client-side FFmpeg is limited by browser memory. Files larger than 500MB or extremely complex bitrates may cause instability. This tool is optimized for web formats and rapid social media conversions.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
