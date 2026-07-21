"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "saffron" | "gold" | "leaf";
  onClick?: () => void;
  clickable?: boolean;
}

export function Card({
  children,
  className,
  accent,
  onClick,
  clickable = false,
}: CardProps) {
  // Accent = 5px left rail with square left corners (right stays rounded).
  // Right radius follows the surface radius (22px) so an accented card and a
  // plain one read as the same object with a rail added.
  const accentClasses = {
    saffron: "border-l-[5px] border-l-saffron-500 rounded-l-none rounded-r-surface",
    gold: "border-l-[5px] border-l-gold rounded-l-none rounded-r-surface",
    leaf: "border-l-[5px] border-l-leaf-500 rounded-l-none rounded-r-surface",
  };

  // H1: anything tappable IS a button — an onClick without `clickable`
  // used to render a <div>, which the barge-in tap listener (VoiceRoot's
  // 'button, a, [role=button]' selector) and keyboards never saw.
  const Element = clickable || onClick ? "button" : "div";

  const interactive = clickable || !!onClick;

  return (
    <Element
      onClick={onClick}
      type={interactive ? "button" : undefined}
      className={cn(
        // CANON CARD, verbatim from the artboards:
        //   background: linear-gradient(140deg,#FFFDF8,#FFF0DC)
        //   border: 2px solid #F0DFC4
        //   border-radius: 22px
        //   padding: 18px
        //   box-shadow: 0 6px 16px rgba(90,46,32,.1)
        // The app had a FLAT #FFFDF8 fill, a 1px #E8D9BC hairline, 20px, and
        // the 2px/8px icon-button shadow. Four small misses that compounded:
        // with no gradient there is no light direction, and with the tighter
        // shadow the card never lifted — so every card in the app read as a
        // printed rectangle where canon has a lit, laid-on surface.
        // bg-cardsurface keeps `bg-card` (the flat colour) available for any
        // screen that deliberately wants the un-lit variant.
        "bg-cardsurface border-2 border-sand rounded-surface shadow-surface p-[18px] text-left block w-full",
        accent && accentClasses[accent],
        interactive && "cursor-pointer active:scale-[0.98] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none",
        className
      )}
    >
      {children}
    </Element>
  );
}
