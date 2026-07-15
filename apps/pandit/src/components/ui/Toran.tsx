import React from "react";

// TORAN — a marigold-garland strip, pure CSS (repeating scallops).
// tone='onSindoor' uses genda orange (reads as marigold on the sindoor header);
// tone='onCream' uses pital brass for light backgrounds.
export interface ToranProps {
  tone?: "onSindoor" | "onCream";
  className?: string;
}

export function Toran({ tone = "onSindoor", className }: ToranProps) {
  const color = tone === "onSindoor" ? "#F2A02C" : "#E7B54A";
  return (
    <div
      aria-hidden="true"
      className={`pa-toran-sway ${className ?? ""}`}
      style={{
        height: "14px",
        background: `radial-gradient(circle at 50% 0, ${color} 55%, transparent 56%)`,
        backgroundSize: "24px 14px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

export default Toran;
