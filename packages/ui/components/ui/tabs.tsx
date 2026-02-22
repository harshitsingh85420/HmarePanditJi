"use client";
import React, { useState } from "react";

function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface TabsContextValue {
    value: string;
    onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({ value: "", onValueChange: () => { } });

export function Tabs({ value, onValueChange, defaultValue, children, className, ...props }: {
    value?: string; onValueChange?: (v: string) => void; defaultValue?: string; children: React.ReactNode; className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const currentValue = value !== undefined ? value : internalValue;
    const handleChange = onValueChange || setInternalValue;
    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
            <div className={cn("", className)} {...props}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}
            {...props}
        />
    );
}

export function TabsTrigger({ value, className, ...props }: { value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const ctx = React.useContext(TabsContext);
    const isActive = ctx.value === value;
    return (
        <button
            type="button"
            onClick={() => ctx.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
                className
            )}
            {...props}
        />
    );
}

export function TabsContent({ value, className, ...props }: { value: string } & React.HTMLAttributes<HTMLDivElement>) {
    const ctx = React.useContext(TabsContext);
    if (ctx.value !== value) return null;
    return <div className={cn("mt-2", className)} {...props} />;
}
