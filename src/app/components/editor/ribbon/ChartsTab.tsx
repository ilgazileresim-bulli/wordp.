"use client";

import React from "react";
import { 
  BarChart3, LineChart, PieChart, AreaChart, Activity, 
  Settings2, PlusCircle, LayoutGrid, TrendingUp, Presentation
} from "lucide-react";
import { cn } from "../utils";

interface ChartsTabProps {
    onOpenStudio?: (type: string) => void;
}

const ChartsTab = ({ onOpenStudio }: ChartsTabProps) => {
    const groups = [
        {
            label: "Hızlı Ekle",
            tools: [
                { id: "bar", icon: BarChart3, label: "Sütun", desc: "Veri sütunları" },
                { id: "line", icon: LineChart, label: "Çizgi", desc: "Zaman serisi" },
                { id: "pie", icon: PieChart, label: "Pasta", desc: "Yüzdelik dağılım" },
                { id: "area", icon: AreaChart, label: "Alan", desc: "Hacimsel veri" },
            ]
        },
        {
            label: "Özel Grafikler",
            tools: [
                { id: "radar", icon: Activity, label: "Radar", desc: "Kıyaslama" },
                { id: "composed", icon: TrendingUp, label: "Bileşik", desc: "Karma görünüm" },
                { id: "scatter", icon: LayoutGrid, label: "Dağılım", desc: "Nokta kümesi" },
            ]
        }
    ];

    return (
        <div className="flex h-full items-center">
            {groups.map((group, idx) => (
                <div key={idx} className={cn(
                    "flex flex-col h-full px-4 border-r border-[#dadada] dark:border-[#2a2a40] justify-center gap-1",
                    idx === groups.length - 1 && "border-r-0"
                )}>
                    <div className="flex items-center gap-2 mb-1">
                        {group.tools.map((tool, tIdx) => (
                            <button
                                key={tIdx}
                                onClick={() => onOpenStudio?.(tool.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg transition-all group hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400"
                                )}
                            >
                                <tool.icon size={22} className={cn("mb-1 transition-transform group-hover:scale-110")} />
                                <span className="text-[10px] font-bold whitespace-nowrap">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest text-center">{group.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ChartsTab;
