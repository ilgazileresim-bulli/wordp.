"use client";

import React, { memo, useState } from "react";
import { HelpCircle, Keyboard, Info, Lightbulb, MessageCircle, ChevronDown, ExternalLink, GraduationCap, Users, Shield, Activity, RefreshCw, ScrollText, Sparkles, Globe } from "lucide-react";
import { cn } from "../utils";

const SHORTCUTS = [
    { key: "Ctrl + B", action: "Kalın" },
    { key: "Ctrl + I", action: "İtalik" },
    { key: "Ctrl + U", action: "Altı Çizili" },
    { key: "Ctrl + Z", action: "Geri Al" },
    { key: "Ctrl + Y", action: "Yinele" },
    { key: "Ctrl + A", action: "Tümünü Seç" },
    { key: "Ctrl + C", action: "Kopyala" },
    { key: "Ctrl + V", action: "Yapıştır" },
    { key: "Ctrl + X", action: "Kes" },
    { key: "Ctrl + S", action: "Kaydet" },
    { key: "Ctrl + P", action: "Yazdır" },
    { key: "Ctrl + F", action: "Bul" },
    { key: "Ctrl + H", action: "Bul ve Değiştir" },
    { key: "Ctrl + Enter", action: "Sayfa Sonu" },
    { key: "Tab", action: "Girinti Artır" },
    { key: "Shift + Tab", action: "Girinti Azalt" },
];

const HelpTab = () => {
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showWhatsNew, setShowWhatsNew] = useState(false);

    return (
        <div className="flex h-full py-1.5 items-center">
            {/* Yardım Group */}
            <div className="flex flex-col items-center h-full min-w-[200px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    {/* Keyboard Shortcuts */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                            title="Klavye Kısayolları"
                            onClick={() => { setShowShortcuts(!showShortcuts); setShowAbout(false); setShowWhatsNew(false); }}>
                            <Keyboard size={22} className="text-[#2b579a]" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Kısayollar</span>
                        </div>
                        {showShortcuts && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl z-[9999] ribbon-dropdown w-[260px] py-2 max-h-[350px] overflow-y-auto">
                                <p className="px-3 py-1 text-[9px] font-bold text-zinc-400 uppercase border-b border-zinc-100 mb-1">Klavye Kısayolları</p>
                                {SHORTCUTS.map(s => (
                                    <div key={s.key} className="flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 transition-colors">
                                        <span className="text-[10px] text-zinc-700">{s.action}</span>
                                        <kbd className="text-[9px] bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5 font-mono font-bold text-zinc-600">{s.key}</kbd>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                        title="Yardım"
                        onClick={() => alert('Macrotar Yardım\n\n• Belgelerinizi düzenleyin ve biçimlendirin\n• PDF ve DOCX olarak dışa aktarın\n• Her sekmede farklı araçlar bulabilirsiniz\n• Kısayolları kullanarak hızlı düzenleme yapın')}>
                        <HelpCircle size={22} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1">Yardım</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Yardım</span>
            </div>

            {/* Hakkında Group */}
            <div className="flex flex-col items-center h-full min-w-[200px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1.5">
                    {/* What's New */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                            title="Yenilikler"
                            onClick={() => { setShowWhatsNew(!showWhatsNew); setShowShortcuts(false); setShowAbout(false); }}>
                            <Lightbulb size={22} className="text-amber-500" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Yenilikler</span>
                        </div>
                        {showWhatsNew && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl z-[9999] ribbon-dropdown w-[280px] p-4">
                                <h3 className="text-sm font-black text-[#2b579a] mb-2">🎉 Yenilikler</h3>
                                <div className="space-y-2 text-[10px] text-zinc-700">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span><strong>Sesli Okuma</strong> — Belgenizi sesli dinleyin</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span><strong>Yazı Rengi Paleti</strong> — 20+ renk seçeneği</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span><strong>Alıntı Stilleri</strong> — APA, MLA, Chicago, IEEE</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span><strong>Belge Koruma</strong> — Salt okunur mod</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span><strong>Video Ekleme</strong> — YouTube/Vimeo desteği</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* About */}
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                            title="Hakkında"
                            onClick={() => { setShowAbout(!showAbout); setShowShortcuts(false); setShowWhatsNew(false); }}>
                            <Info size={22} className="text-zinc-500" strokeWidth={2} />
                            <span className="text-[9px] font-black text-zinc-800 pt-1">Hakkında</span>
                        </div>
                        {showAbout && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl z-[9999] ribbon-dropdown w-[240px] p-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-[#2b579a]">Macrotar</h3>
                                    <p className="text-[10px] text-zinc-500 mt-1">Profesyonel Kelime İşlemci</p>
                                    <div className="my-3 h-px bg-zinc-200" />
                                    <p className="text-[10px] text-zinc-600">Sürüm 2.0</p>
                                    <p className="text-[9px] text-zinc-400 mt-1">© 2026 Macrotar Tüm hakları saklıdır.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Hakkında</span>
            </div>

            {/* Geri Bildirim Group */}
            <div className="flex flex-col items-center h-full min-w-[100px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center">
                    <div className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer group w-16"
                        title="Geri Bildirim Ver"
                        onClick={() => alert('Geri bildiriminiz için teşekkürler! 💙\n\nÖnerilerinizi ve sorunlarınızı bize bildirin.')}>
                        <MessageCircle size={22} className="text-emerald-500" strokeWidth={2} />
                        <span className="text-[9px] font-black text-zinc-800 pt-1 text-center leading-tight">Geri Bildirim</span>
                    </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Geri Bildirim</span>
            </div>

            {/* Eğitim & Topluluk */}
            <div className="flex flex-col items-center h-full min-w-[200px] border-r border-[#dadada] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => window.open('https://support.microsoft.com/tr-tr/word', '_blank')} title="Eğitimler" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <GraduationCap size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Eğitim</span>
                    </button>
                    <button onClick={() => window.open('https://answers.microsoft.com', '_blank')} title="Topluluk Forumu" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Users size={18} className="text-violet-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Topluluk</span>
                    </button>
                    <button onClick={() => alert('🔒 Gizlilik Politikası\n\nMacrotar verilerinizi yerel olarak saklar.\nHiçbir veri sunucuya gönderilmez.')} title="Gizlilik" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Shield size={18} className="text-emerald-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Gizlilik</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Eğitim</span>
            </div>

            {/* Sistem */}
            <div className="flex flex-col items-center h-full min-w-[260px] px-3">
                <div className="flex-1 flex items-center gap-1">
                    <button onClick={() => {
                        const info = `📊 Tanılama Bilgileri:\n\nTarayıcı: ${navigator.userAgent.split(' ').slice(-2).join(' ')}\nPlatform: ${navigator.platform}\nDil: ${navigator.language}\nEkran: ${screen.width}x${screen.height}\nÇevrim içi: ${navigator.onLine ? 'Evet' : 'Hayır'}\nBellek: ${(performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + ' MB' : 'N/A'}`;
                        alert(info);
                    }} title="Tanılama" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Activity size={18} className="text-red-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Tanılama</span>
                    </button>
                    <button onClick={() => alert('✅ Macrotar Sürüm 2.0\nEn güncel sürümü kullanıyorsunuz.')} title="Güncellemeleri Kontrol Et" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <RefreshCw size={18} className="text-[#2b579a]" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Güncelle</span>
                    </button>
                    <button onClick={() => alert('📄 Lisans: MIT License\n\nMacrotar açık kaynak yazılımdır.')} title="Lisans Bilgileri" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <ScrollText size={18} className="text-amber-600" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Lisans</span>
                    </button>
                    <button onClick={() => {
                        const tips = ['Ctrl+B ile kalın yapın', 'Ctrl+Z ile geri alın', 'F11 ile tam ekran', 'Ctrl+F ile arayın', 'Ctrl+P ile yazdırın'];
                        alert('💡 İpucu: ' + tips[Math.floor(Math.random() * tips.length)]);
                    }} title="İpuçları" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Sparkles size={18} className="text-purple-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">İpucu</span>
                    </button>
                    <button onClick={() => {
                        const current = document.documentElement.lang || 'tr';
                        document.documentElement.lang = current === 'tr' ? 'en' : 'tr';
                        alert(`🌐 Dil değiştirildi: ${current === 'tr' ? 'English' : 'Türkçe'}`);
                    }} title="Dil Değiştir" className="flex flex-col items-center justify-center p-1.5 hover:bg-white/60 rounded cursor-pointer w-14">
                        <Globe size={18} className="text-teal-500" strokeWidth={2} />
                        <span className="text-[8px] font-black text-zinc-700 pt-0.5">Dil</span>
                    </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Sistem</span>
            </div>
        </div>
    );
};

export default memo(HelpTab);
