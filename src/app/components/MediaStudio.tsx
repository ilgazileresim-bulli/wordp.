"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UploadCloud, MonitorPlay, Film, Music, Download, CheckCircle, Loader2, Play, Settings, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type ToolCategory = 'BASIC_CONVERT' | 'FORMAT_SELECT' | 'FILE_MERGE' | 'TRIM' | 'GIF' | 'THUMBNAIL' | 'COMPRESS';

const TOOL_MAP: Record<string, { title: string; category: ToolCategory; defaultOutExt: string; cmdGen: (inps: string[], out: string, p: any) => string[] }> = {
  'video-compressor': { title: "Video Sıkıştırıcı", category: 'COMPRESS', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], '-vcodec', 'libx264', '-crf', '28', out] },
  'trim-video': { title: "Videoyu Kısalt", category: 'TRIM', defaultOutExt: "mp4", cmdGen: (inps, out, p) => ['-i', inps[0], '-ss', p.start || '00:00:00', '-to', p.end || '00:00:10', '-c', 'copy', out] },
  'trim-audio': { title: "Ses Kesici", category: 'TRIM', defaultOutExt: "mp3", cmdGen: (inps, out, p) => ['-i', inps[0], '-ss', p.start || '00:00:00', '-to', p.end || '00:00:10', out] },
  'video-to-gif': { title: "Videodan GIF'e", category: 'GIF', defaultOutExt: "gif", cmdGen: (inps, out) => ['-i', inps[0], '-vf', 'scale=320:-1', '-r', '10', out] },
  'gif-to-video': { title: "GIF'den Videoya", category: 'GIF', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out] },
  'video-thumbnail': { title: "Video Küçük Resmi", category: 'THUMBNAIL', defaultOutExt: "png", cmdGen: (inps, out, p) => ['-ss', p.time || '00:00:01', '-i', inps[0], '-vframes', '1', out] },
  'mute-video': { title: "Videoyu Sessize Al", category: 'BASIC_CONVERT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], '-an', '-c:v', 'copy', out] },
  'video-to-mp3': { title: "Videodan MP3'e", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], '-vn', '-c:a', 'libmp3lame', out] },
  'mp3-to-wav': { title: "MP3'ten WAV'a", category: 'BASIC_CONVERT', defaultOutExt: "wav", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'wav-to-mp3': { title: "WAV'dan MP3'e", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'm4a-to-mp3': { title: "M4A'dan MP3'e", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'flac-to-mp3': { title: "FLAC'tan MP3'e", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'ogg-to-mp3': { title: "OGG'dan MP3'e", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'aac-to-mp3': { title: "AAC'dan MP3'e", category: 'BASIC_CONVERT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'mov-to-mp4': { title: "MOV'dan MP4'e", category: 'BASIC_CONVERT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'avi-to-mp4': { title: "AVI'den MP4'e", category: 'BASIC_CONVERT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'webm-to-mp4': { title: "WebM'den MP4'e", category: 'BASIC_CONVERT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'mkv-to-mp4': { title: "MKV'dan MP4'e", category: 'BASIC_CONVERT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'video-converter': { title: "Video Dönüştürücü", category: 'FORMAT_SELECT', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'audio-converter': { title: "Ses Dönüştürücü", category: 'FORMAT_SELECT', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'merge-videos': { title: "Videoları Birleştir", category: 'FILE_MERGE', defaultOutExt: "mp4", cmdGen: (inps, out) => ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', out] },
  'merge-audio': { title: "Ses Birleştirici", category: 'FILE_MERGE', defaultOutExt: "mp3", cmdGen: (inps, out) => ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', out] },
  'image-compressor': { title: "Görüntü Sıkıştır", category: 'COMPRESS', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], '-q:v', '2', out] },
  'image-resizer': { title: "Görüntü Boyutlandır", category: 'TRIM', defaultOutExt: "jpg", cmdGen: (inps, out, p) => ['-i', inps[0], '-vf', 'scale=-1:720', out] },
  'image-converter': { title: "Görüntü Dönüştür", category: 'FORMAT_SELECT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'heic-to-jpg': { title: "HEIC'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'heic-to-png': { title: "HEIC'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'heic-to-webp': { title: "HEIC'den WebP'ye", category: 'BASIC_CONVERT', defaultOutExt: "webp", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'heic-to-gif': { title: "HEIC'den GIF'e", category: 'BASIC_CONVERT', defaultOutExt: "gif", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'heif-to-jpg': { title: "HEIF'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'png-to-jpg': { title: "PNG'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'jpg-to-png': { title: "JPG'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'webp-to-png': { title: "WebP'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'webp-to-jpg': { title: "WebP'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'png-to-webp': { title: "PNG'den WebP'ye", category: 'BASIC_CONVERT', defaultOutExt: "webp", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'jpg-to-webp': { title: "JPG'den WebP'ye", category: 'BASIC_CONVERT', defaultOutExt: "webp", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'svg-to-png': { title: "SVG'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'gif-to-png': { title: "GIF'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'bmp-to-jpg': { title: "BMP'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'tiff-to-jpg': { title: "TIFF'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'tiff-to-png': { title: "TIFF'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'jpg-to-bmp': { title: "JPG'den BMP'ye", category: 'BASIC_CONVERT', defaultOutExt: "bmp", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'png-to-bmp': { title: "PNG'den BMP'ye", category: 'BASIC_CONVERT', defaultOutExt: "bmp", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'avif-to-jpg': { title: "AVIF'den JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'avif-to-png': { title: "AVIF'den PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'ico-to-png': { title: "ICO'dan PNG'ye", category: 'BASIC_CONVERT', defaultOutExt: "png", cmdGen: (inps, out) => ['-i', inps[0], out] },
  'gif-to-jpg': { title: "GIF'ten JPG'ye", category: 'BASIC_CONVERT', defaultOutExt: "jpg", cmdGen: (inps, out) => ['-i', inps[0], out] }
};

interface MediaStudioProps {
  onBack: () => void;
  initialToolId: string;
}

export default function MediaStudio({ onBack, initialToolId }: MediaStudioProps) {
  const toolConfig = TOOL_MAP[initialToolId] || TOOL_MAP['video-converter'];
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [files, setFiles] = useState<File[]>([]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  
  // Tool specific params
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
      // terminate when unmounting so it does not leak memory
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
    setLogs(["Preparing environment..."]);
    
    const ffmpeg = ffmpegRef.current;
    
    try {
      const inputNames: string[] = [];
      const outputExt = toolConfig.category === 'FORMAT_SELECT' ? targetFormat : toolConfig.defaultOutExt;
      const outputName = `output.${outputExt}`;

      // Write files to FFmpeg memory
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const safeName = `input_${i}.${ext}`;
        inputNames.push(safeName);
        await ffmpeg.writeFile(safeName, await fetchFile(file));
      }

      // Generate parameters
      const params = {
        start: startTime,
        end: endTime,
        time: thumbnailTime
      };

      // Create list.txt for FILE_MERGE
      if (toolConfig.category === 'FILE_MERGE') {
        const listContent = inputNames.map(name => `file '${name}'`).join('\n');
        await ffmpeg.writeFile('list.txt', listContent);
      }

      const args = toolConfig.cmdGen(inputNames, outputName, params);
      
      setLogs(prev => [...prev, `Executing FFmpeg...`]);
      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile(outputName);
      
      // Free mem
      for (const name of inputNames) {
        await ffmpeg.deleteFile(name);
      }
      if (toolConfig.category === 'FILE_MERGE') {
        await ffmpeg.deleteFile('list.txt');
      }
      await ffmpeg.deleteFile(outputName);

      const blob = new Blob([data as any], { type: `video/${outputExt}` });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setLogs(prev => [...prev, "Process completed entirely locally!"]);

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, "Error occurred during processing."]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#12122b]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            {toolConfig.category.includes('AUDIO') ? <Music size={16} /> : <Film size={16} />}
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">{toolConfig.title}</h1>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Local Processing Powered by FFmpeg</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8 flex flex-col items-center">
        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 mt-20">
            <Loader2 size={48} className="animate-spin text-indigo-500 mb-6" />
            <h2 className="text-xl font-bold mb-2">Loading Studio Engine...</h2>
            <p className="text-sm text-slate-400">Downloading WebAssembly Core. Needs to download only once (~25MB).</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl space-y-8 mt-10">
            
            {/* Upload Area */}
            {!outputUrl && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer text-center group"
              >
                <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all duration-500">
                  <UploadCloud size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Select your media file</h3>
                <p className="text-slate-400">Files process natively in your browser. Total privacy.</p>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  className="hidden" 
                  multiple={toolConfig.category === 'FILE_MERGE'} 
                  onChange={handleFileChange} 
                />
              </div>
            )}

            {/* Selected Files List & Settings */}
            {files.length > 0 && !outputUrl && (
              <div className="bg-[#1a1a3a] rounded-2xl p-6 border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {files.length} File(s) Ready
                </div>

                <div className="space-y-3">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MonitorPlay size={18} className="text-indigo-400 shrink-0" />
                        <span className="truncate text-sm text-slate-200">{file.name}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Dynamic Controls based on Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  {toolConfig.category === 'FORMAT_SELECT' && (
                    <div className="space-y-2">
                       <label className="text-xs uppercase font-bold text-slate-400">Target Format</label>
                       <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white">
                         {toolConfig.title.includes('Video') 
                            ? ['mp4', 'webm', 'mov', 'avi', 'mkv'].map(ext => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)
                            : toolConfig.title.includes('Ses') || toolConfig.title.includes('Audio')
                               ? ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'].map(ext => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)
                               : ['jpg', 'png', 'webp', 'bmp', 'avif', 'tiff', 'gif'].map(ext => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)
                         }
                       </select>
                    </div>
                  )}
                  {toolConfig.category === 'TRIM' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-400">Start Time (HH:MM:SS)</label>
                        <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white" placeholder="00:00:00" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-400">End Time (HH:MM:SS)</label>
                        <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white" placeholder="00:00:10" />
                      </div>
                    </>
                  )}
                  {toolConfig.category === 'THUMBNAIL' && (
                     <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-400">Snapshot Time (HH:MM:SS)</label>
                        <input type="text" value={thumbnailTime} onChange={e => setThumbnailTime(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none text-white" placeholder="00:00:01" />
                     </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {toolConfig.category === 'FILE_MERGE' && (
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                      + Add More Files
                    </button>
                  )}
                  
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="ml-auto flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/40 transition-all sm:w-auto w-full justify-center"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                    {isProcessing ? "Processing..." : "Start Process"}
                  </button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="bg-[#1a1a3a] rounded-2xl p-8 border border-white/5 space-y-6 text-center">
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Converting Data Natively</span>
                  <span className="text-indigo-400">{progress}%</span>
                </div>
                <div className="bg-black/40 rounded-xl p-4 text-[10px] text-emerald-400 font-mono text-left h-24 overflow-hidden border border-white/5">
                  {logs.map((log, i) => (
                    <div key={i} className="truncate select-none">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Success State */}
            {outputUrl && (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gradient-to-br from-emerald-900/20 to-[#1a1a3a] rounded-3xl p-10 border border-emerald-500/20 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-900/20">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">Success!</h3>
                  <p className="text-emerald-400/80 font-medium tracking-wide">File is fully ready on your browser.</p>
                </div>
                
                <div className="flex gap-4 justify-center pt-6">
                  <button onClick={() => { setOutputUrl(null); setFiles([]); }} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/5">
                    <RefreshCw size={18} /> Process Another
                  </button>
                  <a 
                    href={outputUrl} 
                    download={`output_${toolConfig.title.replace(/\s+/g,'_').toLowerCase()}.${toolConfig.category === 'FORMAT_SELECT' ? targetFormat : toolConfig.defaultOutExt}`}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-900/40 transition-all"
                  >
                    <Download size={18} /> Download Result
                  </a>
                </div>
              </motion.div>
            )}

            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-200/80 text-xs leading-relaxed max-w-2xl mx-auto mt-12">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
              <p>Due to local WebAssembly constraints, heavily compressed and large video files (4GB+) might exceed browser memory limits. This tool is optimal for quick social media adjustments, standard formats, and audio edits.</p>
            </div>
            
          </motion.div>
        )}
      </main>
    </div>
  );
}
