import React from "react";

// TORAN — a marigold-garland strip, pure CSS.
//
// CANON FIDELITY (design/canon/Toran.dc.html): the canon garland is not a
// flat scallop — each bloom is a shaded marigold, lit from above:
//   radial-gradient(circle at 50% 38%, #FFDF9A 0%, #F2A02C 46%, #B23A1A 100%)
// hung from a dark cord. The old strip drew one flat colour at a 24px pitch,
// which read as chunky half-discs rather than flowers.
//
// This keeps the canon's bloom shading and drops the pitch to 16px (finer,
// per canon's 11 strands across a 360dp frame), while staying a SINGLE
// element at the same height — every Header renders one of these, so the
// height contract must not move or all screens shift.
export interface ToranProps {
  tone?: "onSindoor" | "onCream";
  className?: string;
}

// Bloom stops per tone. onSindoor keeps a bright genda core so the garland
// separates from the sindoor band behind it; onCream drops to pital brass.
const BLOOM = {
  onSindoor: "#FFDF9A 0%, #F2A02C 46%, #B23A1A 100%",
  onCream: "#FFE9B8 0%, #E7B54A 50%, #B8860B 100%",
} as const;

// The cord the blooms hang from (canon: linear-gradient(#9a4a1e,#5e1c0a)).
const CORD = {
  onSindoor: "#7A250E",
  onCream: "#B8860B",
} as const;

export function Toran({ tone = "onSindoor", className }: ToranProps) {
  return (
    <div
      aria-hidden="true"
      className={`pa-toran-sway ${className ?? ""}`}
      style={{
        height: "14px",
        backgroundImage: [
          // blooms — finer 16px pitch, canon's top-lit shading
          `radial-gradient(circle at 50% 30%, ${BLOOM[tone]} 62%, transparent 63%)`,
          // the cord they hang from, 2px along the top edge
          `linear-gradient(${CORD[tone]}, ${CORD[tone]})`,
        ].join(","),
        backgroundSize: "16px 14px, 100% 2px",
        backgroundRepeat: "repeat-x, repeat-x",
        backgroundPosition: "0 0, 0 0",
      }}
    />
  );
}

export default Toran;
