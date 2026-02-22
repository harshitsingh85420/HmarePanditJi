"use client";
import React, { useState, useRef, useEffect } from "react";

function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface SelectContextValue {
    value: string;
    onValueChange: (val: string) => void;
    open: boolean;
    setOpen: (o: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({ value: "", onValueChange: () => { }, open: false, setOpen: () => { } });

export function Select({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <SelectContext.Provider value={{ value: value || "", onValueChange: onValueChange || (() => { }), open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
                className
            )}
            {...props}
        >
            {children}
            <span className="ml-2 text-gray-400">▾</span>
        </button>
    );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const { value } = React.useContext(SelectContext);
    return <span className={value ? "" : "text-gray-400"}>{value || placeholder || "Select..."}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const { open, setOpen } = React.useContext(SelectContext);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open, setOpen]);

    if (!open) return null;
    return (
        <div ref={ref} className={cn("absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-white py-1 shadow-lg max-h-60 overflow-auto", className)}>
            {children}
        </div>
    );
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    const ctx = React.useContext(SelectContext);
    return (
        <div
            onClick={() => { ctx.onValueChange(value); ctx.setOpen(false); }}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm hover:bg-gray-100",
                ctx.value === value && "bg-indigo-50 text-indigo-700 font-medium",
                className
            )}
        >
            {children}
        </div>
    );
}
