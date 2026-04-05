import React, { useState, useRef } from "react";
import { ArrowLeft, User, Briefcase, GraduationCap, Download, FileText, CheckCircle2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

interface CvWizardProps {
  onBack: () => void;
}

export default function CvWizard({ onBack }: CvWizardProps) {
  const [activeStep, setActiveStep] = useState(1);
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

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleExpChange = (index: number, field: string, value: string) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData({ ...formData, experience: newExp });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: "", role: "", duration: "", desc: "" }]
    });
  };

  const handleEduChange = (index: number, field: string, value: string) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData({ ...formData, education: newEdu });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { school: "", degree: "", year: "" }]
    });
  };

  const generatePDF = async () => {
    if (!cvPreviewRef.current) return;
    setIsGenerating(true);
    try {
      // Create PDF
      const canvas = await htmlToImage.toCanvas(cvPreviewRef.current, { pixelRatio: 2, style: { transform: "none", transformOrigin: "top left" } });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.name || "Isimsiz"}-CV.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF oluşturulurken hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Left Sidebar - Form */}
      <div className="w-[450px] bg-white dark:bg-slate-800 border-r border-zinc-200 dark:border-slate-700 flex flex-col h-full z-10 shadow-lg">
        <header className="p-4 border-b border-zinc-200 dark:border-slate-700 flex items-center gap-3 bg-zinc-50/50 dark:bg-slate-900/50">
          <button onClick={onBack} className="p-2 hover:bg-zinc-200 dark:hover:bg-slate-700 rounded-lg text-zinc-600 dark:text-zinc-400">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <User className="text-blue-500" size={20} />
            <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Özgeçmiş Sihirbazı</h1>
          </div>
        </header>

        <div className="flex flex-1 overflow-y-auto p-6 flex-col gap-8 custom-scrollbar relative">
          
          {/* Kişisel Bilgiler */}
          <section>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} /> Kişisel Bilgiler
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Ad Soyad</label>
                <input type="text" value={formData.name} onChange={e => updateField("name", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="Ahmet Yılmaz" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Meslek / Unvan</label>
                <input type="text" value={formData.title} onChange={e => updateField("title", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="Yazılım Geliştirici" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">E-Posta</label>
                  <input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="mail@ornek.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Telefon</label>
                  <input type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="0555..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Özet</label>
                <textarea rows={3} value={formData.summary} onChange={e => updateField("summary", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none" placeholder="Kendinizden kısaca bahsedin..." />
              </div>
            </div>
          </section>

          {/* Deneyim */}
          <section>
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase size={16} /> Deneyimler
            </h2>
            <div className="space-y-6">
              {formData.experience.map((exp, i) => (
                <div key={i} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 relative">
                  <div className="space-y-3">
                    <input type="text" value={exp.company} onChange={e => handleExpChange(i, "company", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Şirket Adı" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={exp.role} onChange={e => handleExpChange(i, "role", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm" placeholder="Pozisyon" />
                      <input type="text" value={exp.duration} onChange={e => handleExpChange(i, "duration", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm" placeholder="2020 - Devam" />
                    </div>
                    <textarea rows={2} value={exp.desc} onChange={e => handleExpChange(i, "desc", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm resize-none" placeholder="Açıklama" />
                  </div>
                </div>
              ))}
              <button onClick={addExperience} className="text-sm font-bold text-emerald-600 w-full p-2 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50">+ Deneyim Ekle</button>
            </div>
          </section>

          {/* Eğitim */}
          <section>
            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap size={16} /> Eğitim
            </h2>
            <div className="space-y-4">
              {formData.education.map((edu, i) => (
                <div key={i} className="p-3 border border-zinc-200 rounded-xl bg-zinc-50 space-y-2">
                  <input type="text" value={edu.school} onChange={e => handleEduChange(i, "school", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Okul / Üniversite" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={edu.degree} onChange={e => handleEduChange(i, "degree", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm" placeholder="Bölüm" />
                    <input type="text" value={edu.year} onChange={e => handleEduChange(i, "year", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm" placeholder="Yıl" />
                  </div>
                </div>
              ))}
              <button onClick={addEducation} className="text-sm font-bold text-amber-600 w-full p-2 border border-dashed border-amber-300 rounded-lg hover:bg-amber-50">+ Eğitim Ekle</button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> Yetenekler
            </h2>
             <textarea rows={3} value={formData.skills} onChange={e => updateField("skills", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none" placeholder="Örn: React, Node.js, Tasarım (Virgülle ayırın)" />
          </section>

        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50/80">
          <button onClick={generatePDF} disabled={isGenerating} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <Download size={18} />
            {isGenerating ? "Hazırlanıyor..." : "PDF Olarak İndir"}
          </button>
        </div>
      </div>

      {/* Right Side - A4 Preview */}
      <div className="flex-1 bg-zinc-100 dark:bg-[#0a0a1a] p-8 overflow-y-auto flex justify-center">
        
        {/* A4 Kağıdı (210mm x 297mm orantısı) */}
        <div 
          ref={cvPreviewRef}
          className="bg-white text-black shadow-2xl" 
          style={{ width: "210mm", minHeight: "297mm", padding: "20mm", boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="border-b-2 border-zinc-800 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold uppercase tracking-tight text-zinc-900">{formData.name || "İSİM SOYİSİM"}</h1>
              <p className="text-xl text-blue-600 mt-1 font-semibold">{formData.title || "Meslek / Unvan"}</p>
            </div>
            <div className="text-right text-sm text-zinc-600 space-y-1">
              <p>{formData.email || "E-Posta"}</p>
              <p>{formData.phone || "Telefon"}</p>
              <p>{formData.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-10">
            {/* Sol Kolon */}
            <div>
              {formData.education.some(e => e.school) && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">Eğitim</h3>
                  <div className="space-y-4">
                    {formData.education.filter(e => e.school).map((edu, i) => (
                      <div key={i}>
                        <h4 className="font-bold text-zinc-800">{edu.school}</h4>
                        <p className="text-sm text-blue-600">{edu.degree}</p>
                        <p className="text-xs text-zinc-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.skills && (
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">Yetenekler</h3>
                  <div className="flex flex-col gap-1">
                    {formData.skills.split(",").map((skill, i) => (
                      <span key={i} className="text-sm text-zinc-700 bg-zinc-100 px-2 py-1 rounded inline-block w-fit">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Kolon */}
            <div>
              {formData.summary && (
                <div className="mb-8">
                   <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">Profil Özeti</h3>
                   <p className="text-zinc-700 leading-relaxed text-sm">{formData.summary}</p>
                </div>
              )}

              {formData.experience.some(e => e.company) && (
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">Deneyimler</h3>
                  <div className="space-y-6">
                    {formData.experience.filter(e => e.company).map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-zinc-800 text-lg">{exp.role}</h4>
                          <span className="text-sm font-semibold text-blue-600">{exp.duration}</span>
                        </div>
                        <h5 className="text-zinc-600 font-medium mb-2">{exp.company}</h5>
                        <p className="text-sm text-zinc-700 leading-relaxed">{exp.desc}</p>
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
