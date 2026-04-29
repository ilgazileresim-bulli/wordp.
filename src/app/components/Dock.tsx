"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, FileSearch, Image, Code, Video, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "./editor/utils";

interface DockItemProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
}

function DockItem({ icon: Icon, label, onClick, active }: DockItemProps) {
    return (
        <motion.button
            whileHover={{ y: -10, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={cn(
                "relative group flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
                active 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50" 
                    : "bg-white/10 hover:bg-white/20 text-zinc-600 dark:text-zinc-300 backdrop-blur-md border border-white/20"
            )}
        >
            <Icon size={24} strokeWidth={2} />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {label}
            </span>
            {active && (
                <motion.div 
                    layoutId="dock-active-dot"
                    className="absolute -bottom-1.5 w-1 h-1 bg-blue-500 rounded-full"
                />
            )}
        </motion.button>
    );
}

interface DockProps {
    activeGroup: string | null;
    onGroupSelect: (group: string | null) => void;
    onAiClick: () => void;
}

export default function Dock({ activeGroup, onGroupSelect, onAiClick }: DockProps) {
    const groups = [
        { id: "office", label: "Office", icon: FileText },
        { id: "pdf", label: "PDF Studio", icon: FileSearch },
        { id: "photo", label: "Design", icon: Image },
        { id: "code", label: "Develop", icon: Code },
        { id: "video-audio", label: "Media", icon: Video },
        { id: "all", label: "All Tools", icon: LayoutGrid },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4">
            <div className="flex items-center gap-3 p-3 bg-white/95 dark:bg-slate-900/95 rounded-[2.5rem] border border-zinc-200 dark:border-slate-800 shadow-2xl">
                {groups.map((group) => (
                    <DockItem 
                        key={group.id}
                        icon={group.icon}
                        label={group.label}
                        active={activeGroup === group.id || (group.id === "all" && activeGroup === null)}
                        onClick={() => onGroupSelect(group.id === "all" ? null : group.id)}
                    />
                ))}
                
                <div className="w-px h-8 bg-zinc-200 dark:bg-slate-700 mx-1" />

                <motion.button
                    whileHover={{ y: -10, scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onAiClick}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                    <Sparkles size={24} fill="currentColor" />
                </motion.button>
            </div>
        </div>
    );
}
