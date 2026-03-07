"use client";

import React, { memo, Suspense } from "react";
import { cn } from "./utils";

import HomeTab from "./ribbon/HomeTab";
// Lazy load other tabs to improve performance
const InsertTab = React.lazy(() => import("./ribbon/InsertTab"));
const DesignTab = React.lazy(() => import("./ribbon/DesignTab"));
const LayoutTab = React.lazy(() => import("./ribbon/LayoutTab"));
const ReferencesTab = React.lazy(() => import("./ribbon/ReferencesTab"));
const ReviewTab = React.lazy(() => import("./ribbon/ReviewTab"));
const ViewTab = React.lazy(() => import("./ribbon/ViewTab"));
const HelpTab = React.lazy(() => import("./ribbon/HelpTab"));
const DrawTab = React.lazy(() => import("./ribbon/DrawTab"));
const ConvertTab = React.lazy(() => import("./ribbon/ConvertTab"));

interface EditorRibbonProps {
    activeTab: 'home' | 'insert' | 'draw' | 'design' | 'layout' | 'references' | 'review' | 'view' | 'help' | 'convert';
    setActiveTab: (tab: any) => void;
    editor: any;
    handleCopy: () => void;
    changeCase: (type: 'upper' | 'lower' | 'capitalize') => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    insertPageBreak: () => void;
    imageInputRef: React.RefObject<HTMLInputElement | null>;
    videoInputRef: React.RefObject<HTMLInputElement | null>;
    insertShape: (type: string) => void;
    insertDate: () => void;
    insertSymbol: (symbol: string) => void;
    watermark: string | null;
    toggleWatermark: (text: string) => void;
    pageColor: string;
    setPageColor: (color: string) => void;
    margins: number;
    setMargins: (margins: number) => void;
    orientation: "portrait" | "landscape";
    setOrientation: (orientation: "portrait" | "landscape") => void;
    isSplit: boolean;
    setIsSplit: (split: boolean) => void;
    viewMode: 'print' | 'read' | 'web';
    setViewMode: (mode: 'print' | 'read' | 'web') => void;
    setIsFocusMode: (focus: boolean) => void;
    showRuler: boolean;
    setShowRuler: (show: boolean) => void;
    showGridlines: boolean;
    setShowGridlines: (show: boolean) => void;
    showNavPane: boolean;
    setShowNavPane: (show: boolean) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    onFileClick: () => void;
}

const EditorRibbon = (props: EditorRibbonProps) => {
    const { activeTab, setActiveTab, onFileClick } = props;

    // Prefetch tabs on hover could be added here for better UX

    return (
        <div className="bg-[#f3f2f1] dark:bg-[#16162a] border-b border-[#dadada] dark:border-[#2a2a40] shrink-0 no-print relative" style={{ zIndex: 50 }}>
            <div className="flex items-center px-0 bg-[#2b579a] dark:bg-[#0d0d1a] h-8">
                <button
                    onClick={onFileClick}
                    className="h-full px-5 text-white text-[11px] font-bold uppercase transition-colors hover:bg-[#1a478a] dark:hover:bg-white/10 border-r border-[#1a478a] dark:border-[#1e1e30]"
                >
                    Dosya
                </button>
                {["home", "insert", "draw", "design", "layout", "references", "review", "view", "help", "convert"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                            "px-4 h-full text-[11px] font-black transition-colors hover:bg-[#3b67aa] dark:hover:bg-white/10",
                            activeTab === tab ? "bg-[#f3f2f1] dark:bg-[#16162a] text-[#2b579a] dark:text-blue-400 rounded-t-sm" : "text-white"
                        )}
                    >
                        {tab === "home" ? "Giriş" :
                            tab === "insert" ? "Ekle" :
                                tab === "draw" ? "Çizim" :
                                    tab === "design" ? "Tasarım" :
                                        tab === "layout" ? "Düzen" :
                                            tab === "references" ? "Başvurular" :
                                                tab === "review" ? "Gözden Geçir" :
                                                    tab === "view" ? "Görünüm" :
                                                        tab === "help" ? "Yardım" :
                                                            tab === "convert" ? "Dönüştür" : tab}
                    </button>
                ))}
            </div>

            <div className="h-24 bg-[#f3f2f1] dark:bg-[#16162a] flex items-center px-4 gap-0" style={{ overflow: 'visible', position: 'relative', zIndex: 40 }}>
                <Suspense fallback={<div className="flex items-center justify-center p-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider animate-pulse">Menü Yükleniyor...</div>}>
                    {activeTab === "home" && <HomeTab {...props} />}
                    {activeTab === "insert" && <InsertTab {...props} />}
                    {activeTab === "design" && <DesignTab {...props} />}
                    {activeTab === "layout" && <LayoutTab {...props} />}
                    {activeTab === "references" && <ReferencesTab {...props} />}
                    {activeTab === "review" && <ReviewTab {...props} />}
                    {activeTab === "view" && <ViewTab {...props} />}
                    {activeTab === "help" && <HelpTab />}
                    {activeTab === "draw" && <DrawTab />}
                    {activeTab === "convert" && <ConvertTab editor={props.editor} />}
                </Suspense>

                {!["home", "insert", "draw", "design", "layout", "references", "review", "view", "help", "convert"].includes(activeTab) && (
                    <div className="flex-1 flex items-center justify-center text-zinc-400 font-black text-[11px] uppercase tracking-[0.2em] animate-pulse">
                        &lt; Daha Fazla Sekmesi Araçları Hazırlanıyor... &gt;
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(EditorRibbon);
