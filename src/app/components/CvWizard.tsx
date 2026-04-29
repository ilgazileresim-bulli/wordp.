"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, User, Briefcase, GraduationCap, Download, FileText, CheckCircle2, Sparkles, Plus, Trash2, ShieldCheck, Zap } from "lucide-react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { cn } from "./editor/utils";

interface CvWizardProps {
  onBack: () => void;
}

export default function CvWizard({ onBack }: CvWizardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    experience: [{ company: "", role: "", duration: "", desc: "" }],
    education: [{ school: "", degree: "", year: "" }],
    skills: ""
  });

  const updateField = (field: string, value: string) => setFormData({ ...formData, [field]: value });
  
  const handleExpChange = (index: number, field: string, value: string) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData({ ...formData, experience: newExp });
  };

  const handleEduChange = (index: number, field: string, value: string) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData({ ...formData, education: newEdu });
  };

  const generatePDF = async () => {
    if (!cvPreviewRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await htmlToImage.toCanvas(cvPreviewRef.current, { pixelRatio: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.name || "Resume"}-CV.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#080810] text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-inter)] overflow-hidden">
      {/* Left Sidebar: Form Control */}
      <div className="w-[480px] bg-white dark:bg-[#0a0a1a] border-r border-zinc-200 dark:border-white/5 flex flex-col h-full shadow-2xl z-20">
        <header className="h-24 px-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-500">
                <ArrowLeft size={24} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <User size={24} />
            </div>
            <div>
                <h1 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight uppercase">Resume Architect</h1>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-widest uppercase flex items-center gap-2">
                    <ShieldCheck size={12} /> Local-First Rendering
                </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          {/* Identity */}
          <section className="space-y-6">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Sparkles size={14} className="text-indigo-500" /> Identity Matrix
            </label>
            <div className="grid grid-cols-1 gap-5">
              <input type="text" value={formData.name} onChange={e => updateField("name", e.target.value)} className="w-full px-5 py-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Full Name (e.g. John Doe)" />
              <input type="text" value={formData.title} onChange={e => updateField("title", e.target.value)} className="w-full px-5 py-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Professional Title (e.g. Senior Developer)" />
              <div className="grid grid-cols-2 gap-4">
                <input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} className="w-full px-5 py-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Email Address" />
                <input type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-5 py-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Phone" />
              </div>
              <textarea value={formData.summary} onChange={e => updateField("summary", e.target.value)} className="w-full px-5 py-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[120px] resize-none" placeholder="Professional Summary..." />
            </div>
          </section>

          {/* Professional Experience */}
          <section className="space-y-6">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Briefcase size={14} className="text-emerald-500" /> Deployment History
            </label>
            <div className="space-y-6">
              {formData.experience.map((exp, i) => (
                <div key={i} className="p-6 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-3xl space-y-4">
                  <input type="text" value={exp.company} onChange={e => handleExpChange(i, "company", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-tight" placeholder="Organization" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={exp.role} onChange={e => handleExpChange(i, "role", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold" placeholder="Designation" />
                    <input type="text" value={exp.duration} onChange={e => handleExpChange(i, "duration", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold" placeholder="2022 - Present" />
                  </div>
                  <textarea value={exp.desc} onChange={e => handleExpChange(i, "desc", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-medium min-h-[80px] resize-none" placeholder="Impact description..." />
                </div>
              ))}
              <button onClick={() => setFormData({...formData, experience: [...formData.experience, { company: "", role: "", duration: "", desc: "" }]})} className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-600/30 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Append Milestone
              </button>
            </div>
          </section>

          {/* Academic Intel */}
          <section className="space-y-6">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <GraduationCap size={14} className="text-amber-500" /> Academic Foundation
            </label>
            <div className="space-y-6">
              {formData.education.map((edu, i) => (
                <div key={i} className="p-6 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-3xl space-y-4">
                  <input type="text" value={edu.school} onChange={e => handleEduChange(i, "school", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-black" placeholder="Institution" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={edu.degree} onChange={e => handleEduChange(i, "degree", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold" placeholder="Qualification" />
                    <input type="text" value={edu.year} onChange={e => handleEduChange(i, "year", e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold" placeholder="Year" />
                  </div>
                </div>
              ))}
              <button onClick={() => setFormData({...formData, education: [...formData.education, { school: "", degree: "", year: "" }]})} className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-amber-600 hover:border-amber-600/30 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Append Education
              </button>
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a1a]">
          <button onClick={generatePDF} disabled={isGenerating} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-4 active:scale-95">
            <Download size={20} />
            {isGenerating ? "Compiling..." : "Export PDF Portfolio"}
          </button>
        </div>
      </div>

      {/* Right: Live A4 Canvas */}
      <div className="flex-1 bg-zinc-100 dark:bg-black/40 p-12 overflow-y-auto flex justify-center custom-scrollbar">
        <div ref={cvPreviewRef} className="bg-white text-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,0.2)]" style={{ width: "210mm", minHeight: "297mm", padding: "25mm", boxSizing: "border-box" }}>
          {/* Visual ID */}
          <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-10 mb-12">
            <div className="max-w-[70%]">
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] text-zinc-900 mb-4">{formData.name || "UNNAMED ENTITY"}</h1>
              <p className="text-xl font-bold text-indigo-600 uppercase tracking-widest">{formData.title || "SPECIFICATION"}</p>
            </div>
            <div className="text-right text-[11px] font-black uppercase tracking-widest text-zinc-500 space-y-2">
              <p className="flex items-center justify-end gap-2">{formData.email || "EMAIL_PENDING"} <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full" /></p>
              <p className="flex items-center justify-end gap-2">{formData.phone || "PHONE_PENDING"} <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full" /></p>
              <p className="flex items-center justify-end gap-2">{formData.address || "LOCATION_PENDING"} <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full" /></p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-16">
            {/* Left: Metadata */}
            <div className="space-y-12">
              {formData.summary && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 border-b-2 border-zinc-100 pb-2 flex items-center gap-2">
                    <Zap size={12} className="text-indigo-500" /> Core
                  </h3>
                  <p className="text-[13px] leading-relaxed font-bold text-zinc-700">{formData.summary}</p>
                </div>
              )}

              {formData.skills && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 border-b-2 border-zinc-100 pb-2 flex items-center gap-2">
                    <Zap size={12} className="text-indigo-500" /> Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.split(",").map((s, i) => (
                      <span key={i} className="text-[10px] font-black uppercase tracking-tighter bg-zinc-900 text-white px-3 py-1.5 rounded-md">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {formData.education.some(e => e.school) && (
                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 border-b-2 border-zinc-100 pb-2">Academic</h3>
                   <div className="space-y-6">
                      {formData.education.filter(e => e.school).map((edu, i) => (
                        <div key={i} className="space-y-1">
                          <h4 className="text-[13px] font-black uppercase">{edu.school}</h4>
                          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">{edu.degree}</p>
                          <p className="text-[10px] font-black text-zinc-400">{edu.year}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Right: History */}
            <div className="space-y-12">
               {formData.experience.some(e => e.company) && (
                 <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 border-b-2 border-zinc-100 pb-2 flex items-center gap-2">
                        <Zap size={12} className="text-indigo-500" /> Deployment
                    </h3>
                    <div className="space-y-10">
                      {formData.experience.filter(e => e.company).map((exp, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-baseline">
                              <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900">{exp.role}</h4>
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{exp.duration}</span>
                           </div>
                           <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{exp.company}</h5>
                           <p className="text-[13px] leading-relaxed font-bold text-zinc-600 whitespace-pre-wrap">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
