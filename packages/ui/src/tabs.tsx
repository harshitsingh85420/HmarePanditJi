"use client";
import React from "react";

export interface TabItem {
  key: string;
  label: string;
  icon?: string; // material symbol name
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = &quot;&quot; }: TabsProps) {
  return (
    <div className={`flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              &quot;flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors&quot;,
              isActive
                ? &quot;border-amber-500 text-amber-600 dark:text-amber-400&quot;
                : &quot;border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600&quot;,
            ].join(&quot; &quot;)}
          >
            {tab.icon && (
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
