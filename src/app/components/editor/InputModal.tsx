"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface InputModalProps {
    isOpen: boolean;
    title: string;
    fields: { label: string; placeholder?: string; key: string; type?: string }[];
    onConfirm: (values: Record<string, string>) => void;
    onClose: () => void;
    confirmText?: string;
}

export const InputModal = ({ isOpen, title, fields, onConfirm, onClose, confirmText = "Tamam" }: InputModalProps) => {
    const [values, setValues] = useState<Record<string, string>>({});
    const firstRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const init: Record<string, string> = {};
            fields.forEach(f => { init[f.key] = ""; });
            setValues(init);
            setTimeout(() => firstRef.current?.focus(), 50);
        }
    }, [isOpen, fields]);

    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            const hasEmpty = fields.some(f => !values[f.key]?.trim());
            if (!hasEmpty) onConfirm(values);
        }
        if (e.key === "Escape") onClose();
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" onKeyDown={handleKeyDown}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl border border-zinc-200 w-[340px] max-w-[90vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-gradient-to-r from-[#2b579a]/5 to-transparent">
                    <h3 className="text-[13px] font-black text-zinc-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {/* Body */}
                <div className="px-5 py-4 flex flex-col gap-3">
                    {fields.map((field, i) => (
                        <div key={field.key}>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">{field.label}</label>
                            <input
                                ref={i === 0 ? firstRef : undefined}
                                type={field.type || "text"}
                                placeholder={field.placeholder || ""}
                                value={values[field.key] || ""}
                                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full px-3 py-2 text-[12px] border border-zinc-200 rounded-lg focus:outline-none focus:border-[#2b579a] focus:ring-1 focus:ring-[#2b579a]/20 transition-all bg-zinc-50"
                            />
                        </div>
                    ))}
                </div>
                {/* Footer */}
                <div className="flex gap-2 px-5 pb-4 justify-end">
                    <button onClick={onClose}
                        className="px-4 py-2 text-[11px] font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                        İptal
                    </button>
                    <button
                        onClick={() => onConfirm(values)}
                        className="px-5 py-2 text-[11px] font-black text-white bg-[#2b579a] hover:bg-[#1a4788] rounded-lg transition-colors shadow-sm">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface InfoToastProps {
    message: string;
    onClose: () => void;
}

export const InfoToast = ({ message, onClose }: InfoToastProps) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-zinc-900 text-white text-[11px] font-bold px-5 py-3 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-pre-line text-center max-w-[400px]">
            {message}
        </div>
    );
};
