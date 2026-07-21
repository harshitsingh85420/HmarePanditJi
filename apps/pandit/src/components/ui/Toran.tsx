import React from "react";

// TORAN — canon's full hanging marigold garland, ported verbatim from
// design/canon/Toran.dc.html: a 58px-tall dark cord with `count` drawn
// marigold blooms (top-lit radial shading), every 3rd strand longer with a
// second bloom + a leaf, each strand swaying from its own top.
//
// The old 14px bead-strip variant is DEAD (Isj's proof pair, 2026-07-21 —
// it appeared in zero of the 41 canon artboards). The `variant` prop is
// kept for call-site compatibility but every value renders the garland.
export interface ToranProps {
  tone?: "onSindoor" | "onCream";
  /** compat only — the garland is the only Toran now. */
  variant?: "strip" | "garland";
  /** number of marigold strands (canon default 11). */
  count?: number;
  className?: string;
}

// Bloom stops per tone. onSindoor keeps a bright genda core so the garland
// separates from the sindoor band behind it; onCream drops to pital brass.
const BLOOM = {
  onSindoor: "#FFDF9A 0%, #F2A02C 46%, #B23A1A 100%",
  onCream: "#FFE9B8 0%, #E7B54A 50%, #B8860B 100%",
} as const;

export function Toran({ tone = "onSindoor", count = 11, className }: ToranProps) {
  {
    // Canon: strands.push({ delay: -(i*0.32)s, long: i % 3 === 1 }).
    const strands = Array.from({ length: count }, (_, i) => ({
      delay: `${(-(i * 0.32)).toFixed(2)}s`,
      long: i % 3 === 1,
    }));
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{ position: "relative", width: "100%", height: 58, overflow: "visible" }}
      >
        {/* the cord the blooms hang from — a shallow drooping arc */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: -4,
            right: -4,
            height: 8,
            background: "linear-gradient(#9a4a1e,#5e1c0a)",
            borderRadius: "0 0 50% 50% / 0 0 34px 34px",
            boxShadow: "0 2px 4px rgba(0,0,0,.15)",
          }}
        />
        {/* the row of hanging marigold strands */}
        <div
          style={{
            position: "absolute",
            top: 9,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-start",
            padding: "0 4px",
          }}
        >
          {strands.map((s, i) => (
            <div
              key={i}
              className="pa-toran-strand"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, animationDelay: s.delay }}
            >
              {/* green stem */}
              <div style={{ width: 3, height: 7, background: "#5f8a2a" }} />
              {/* the marigold bloom, top-lit */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 50% 38%, ${BLOOM[tone]})`,
                  boxShadow: "inset 0 0 0 3px rgba(178,58,26,.28), 0 2px 3px rgba(0,0,0,.18)",
                }}
              />
              {/* every 3rd strand hangs longer: a second bloom + a leaf */}
              {s.long && (
                <>
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 50% 38%, #FFE9B8 0%, #F2A02C 50%, #B23A1A 100%)",
                      boxShadow: "inset 0 0 0 2px rgba(178,58,26,.28), 0 2px 3px rgba(0,0,0,.15)",
                    }}
                  />
                  <div
                    style={{ width: 11, height: 8, background: "#4f7d22", borderRadius: "0 80% 0 80%", transform: "rotate(8deg)" }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Toran;
