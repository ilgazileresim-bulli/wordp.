"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Save,
    Printer,
    FileDown,
    FileText,
    Share2,
    X,
    Info,
    Settings,
    FolderOpen,
    Trash2,
    Download
} from "lucide-react";
import { cn } from "./utils";

interface FileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    onPrint: () => void;
    onExportPdf: () => void;
    onExportDocx: () => void;
    onExportJson: () => void;
    stats: {
        words: number;
        chars: number;
        paragraphs: number;
        readingTime: number;
    };
}

const FileMenu = ({
    isOpen,
    onClose,
    onSave,
    onPrint,
    onExportPdf,
    onExportDocx,
    onExportJson,
    stats
}: FileMenuProps) => {
    const [activeTab, setActiveTab] = React.useState<'info' | 'save-as' | 'share' | 'export'>('info');
    const [showSaveToast, setShowSaveToast] = React.useState(false);

    const handleQuickSave = () => {
        onSave();
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                    className="fixed inset-0 bg-[#2b579a] dark:bg-[#0a0a18] z-[10000] flex flex-col md:flex-row overflow-hidden no-print"
                >
                    {/* Left Sidebar */}
                    <div className="w-full md:w-[200px] bg-[#1a478a] dark:bg-[#06060f] flex flex-row md:flex-col pt-2 md:pt-8 shrink-0 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-3 px-6 py-4 hover:bg-[#3b67aa] text-white/80 hover:text-white transition-colors group mb-4"
                        >
                            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white transition-colors">
                                <ArrowLeft size={18} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Geri</span>
                        </button>

                        <div className="flex flex-row md:flex-col items-center md:items-stretch">
                            <MenuButton icon={Info} label="Bilgi" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                            <MenuButton icon={Save} label="Kaydet" onClick={handleQuickSave} />
                            <MenuButton icon={Download} label="Kaydet (Farklı)" active={activeTab === 'save-as'} onClick={() => setActiveTab('save-as')} />
                            <MenuButton icon={Printer} label="Yazdır" onClick={onPrint} />
                            <MenuButton icon={Share2} label="Paylaş" active={activeTab === 'share'} onClick={() => setActiveTab('share')} />
                            <MenuButton icon={FileDown} label="Dışarı Aktar" active={activeTab === 'export'} onClick={() => setActiveTab('export')} />
                            <MenuButton icon={X} label="Kapat" onClick={onClose} />
                        </div>

                        <div className="md:mt-auto md:pb-8 flex items-center pr-4 md:pr-0">
                            <MenuButton icon={Settings} label="Seçenekler" />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white dark:bg-[#12121f] flex flex-col relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 md:p-12 max-w-5xl w-full mx-auto overflow-y-auto"
                            >
                                {activeTab === 'info' && (
                                    <div className="animate-in fade-in duration-500">
                                        <header className="mb-12">
                                            <h1 className="text-4xl font-light text-[#2b579a] dark:text-blue-400 mb-2 font-serif">Belge Bilgileri</h1>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Belgenizin özellikleri ve ayrıntıları.</p>
                                        </header>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                            <StatCard label="Sözcük" value={stats.words.toLocaleString('tr-TR')} />
                                            <StatCard label="Karakter" value={stats.chars.toLocaleString('tr-TR')} />
                                            <StatCard label="Paragraf" value={stats.paragraphs.toLocaleString('tr-TR')} />
                                            <StatCard label="Düzenleme Süresi" value={`${stats.readingTime} dk`} />
                                        </div>

                                        <div className="space-y-6">
                                            <InfoRow label="Oluşturulma" value={new Date().toLocaleDateString('tr-TR')} />
                                            <InfoRow label="Son Değişiklik" value="Şimdi" />
                                            <InfoRow label="Yazar" value="Kullanıcı" />
                                            <InfoRow label="Dosya Boyutu" value={`${(stats.chars * 1.5 / 1024).toFixed(1)} KB`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'save-as' && (
                                    <div className="animate-in fade-in duration-500">
                                        <header className="mb-12">
                                            <h1 className="text-4xl font-light text-[#2b579a] dark:text-blue-400 mb-2 font-serif">Kopyasını Kaydet</h1>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Belgenizi farklı bir konuma veya biçime kaydedin.</p>
                                        </header>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ExportCard
                                                icon={Download}
                                                title="Word Belgesi (.docx)"
                                                description="Microsoft Word formatında kaydet. En yaygın kullanılan düzenlenebilir format."
                                                buttonLabel="DOCX Olarak Kaydet"
                                                onClick={onExportDocx}
                                                accentColor="#2b579a"
                                            />
                                            <ExportCard
                                                icon={FileCode}
                                                title="JSON Verisi (.json)"
                                                description="Ham belge verisini JSON formatında yedekleyin. Teknik analiz için uygundur."
                                                buttonLabel="JSON Olarak Kaydet"
                                                onClick={onExportJson}
                                                accentColor="#10b981"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'share' && (
                                    <div className="animate-in fade-in duration-500 text-center py-12">
                                        <div className="w-20 h-20 bg-blue-50 text-[#2b579a] rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Share2 size={40} />
                                        </div>
                                        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-4">Başkalarıyla Paylaş</h1>
                                        <p className="text-zinc-500 max-w-md mx-auto mb-8">
                                            Belgenizi iş arkadaşlarınızla paylaşın. Salt okunur bir bağlantı oluşturarak erişimi kolaylaştırın.
                                        </p>
                                        <div className="max-w-md mx-auto p-4 bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl flex items-center justify-between mb-8">
                                            <code className="text-xs text-zinc-600 truncate mr-4">https://wordp.app/doc/822f12ae...</code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText("https://wordp.app/doc/share-link");
                                                    alert("Bağlantı kopyalandı!");
                                                }}
                                                className="px-4 py-2 bg-[#2b579a] text-white text-[10px] font-black rounded-lg uppercase tracking-wider whitespace-nowrap"
                                            >
                                                Kopyala
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'export' && (
                                    <div className="animate-in fade-in duration-500">
                                        <header className="mb-12">
                                            <h1 className="text-4xl font-light text-[#2b579a] dark:text-blue-400 mb-2 font-serif">Dışarı Aktar</h1>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Belgenizi paylaşılabilir formatlara dönüştürün.</p>
                                        </header>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ExportCard
                                                icon={FileText}
                                                title="PDF Belgesi"
                                                description="Belgeyi bir PDF dosyasına dönüştürün. Yazı tiplerini ve içeriği her ortamda korur."
                                                buttonLabel="PDF İndir"
                                                onClick={onExportPdf}
                                                accentColor="#e11d48"
                                            />
                                            <ExportCard
                                                icon={Download}
                                                title="Word Belgesi (.docx)"
                                                description="Belgeyi düzenlenebilir bir Word dosyası olarak aktarın."
                                                buttonLabel="Word Belgesi İndir"
                                                onClick={onExportDocx}
                                                accentColor="#2b579a"
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {showSaveToast && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-[10001]"
                            >
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <X size={12} className="rotate-45" />
                                </div>
                                <span className="text-sm font-bold">Belge başarıyla kaydedildi!</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-zinc-50 dark:bg-slate-800 border border-zinc-100 dark:border-slate-700 p-6 rounded-2xl">
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="text-2xl font-serif text-[#2b579a] dark:text-blue-400">{value}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-zinc-50 dark:border-slate-700">
        <span className="text-sm font-bold text-zinc-500">{label}</span>
        <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
);

const MenuButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex justify-center md:justify-start items-center gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 w-auto md:w-full shrink-0 transition-all text-left",
            active ? "bg-white dark:bg-[#16162a] text-[#2b579a] dark:text-blue-400 rounded-lg md:rounded-none" : "text-white/70 hover:bg-[#3b67aa] dark:hover:bg-white/10 hover:text-white"
        )}
    >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className={cn("text-xs md:text-sm transition-all whitespace-nowrap", active ? "font-black" : "font-medium")}>{label}</span>
        {active && <div className="hidden md:block ml-auto w-1 h-4 bg-[#2b579a] rounded-full" />}
    </button>
);

const ExportCard = ({ icon: Icon, title, description, buttonLabel, onClick, accentColor }: {
    icon: any, title: string, description: string, buttonLabel: string, onClick: () => void, accentColor: string
}) => (
    <div className="bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
            <Icon size={28} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">{title}</h2>
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed flex-1">{description}</p>
        <button
            onClick={onClick}
            style={{ backgroundColor: accentColor }}
            className="w-full py-3.5 px-6 text-white rounded-lg font-black text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-zinc-200"
        >
            {buttonLabel}
        </button>
    </div>
);

// New icons for the Save As sections
const FileCode = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 13-2 2 2 2" />
        <path d="m15 13 2 2-2 2" />
    </svg>
);

export default memo(FileMenu);
