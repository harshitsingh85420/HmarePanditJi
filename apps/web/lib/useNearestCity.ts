"use client";

// ─────────────────────────────────────────────────────────────
// THE GEOLOCATION SOFT-ASK — the honesty-ladder's missing source (ruled
// 2026-08-03, after "In your city" rendered to a founder who was not in that
// city on the strength of a URL param he never chose).
//
// ONE ask, remembered either way, no nagging. The browser's own permission
// dialog only appears AFTER the customer says yes to OUR question — the
// double-consent shape, so the scary system prompt is never a surprise.
//
// What is stored: EITHER {declined:true} OR {cityKey} — never coordinates.
// The coordinates live for one function call and resolve to the nearest
// SERVED city (a 15-entry public-centroid pass); beyond ~60 km of everything
// we serve, the answer is honestly "nowhere useful" and nothing is stored,
// so a traveller is re-asked another day rather than pinned to a stale city.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { nearestServedCity } from "@hmarepanditji/types";

const KEY = "hpj_geo_city_choice";

type Choice = { declined: true } | { cityEn: string } | null;

function readChoice(): Choice {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Choice) : null;
  } catch {
    return null;
  }
}

export function useNearestCity() {
  const [choice, setChoice] = useState<Choice>(null);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setAsked(c !== null);
  }, []);

  const accept = useCallback(() => {
    setAsked(true);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // no API → treated as a decline, remembered, no error theatre
      localStorage.setItem(KEY, JSON.stringify({ declined: true }));
      setChoice({ declined: true });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = nearestServedCity(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          const c = { cityEn: city.en };
          localStorage.setItem(KEY, JSON.stringify(c));
          setChoice(c);
        }
        // too far from every served city: store NOTHING — a traveller gets
        // asked again another day instead of being pinned to a wrong city
      },
      () => {
        // the browser prompt was denied — that is a decline, remembered
        localStorage.setItem(KEY, JSON.stringify({ declined: true }));
        setChoice({ declined: true });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  }, []);

  const decline = useCallback(() => {
    setAsked(true);
    localStorage.setItem(KEY, JSON.stringify({ declined: true }));
    setChoice({ declined: true });
  }, []);

  return {
    /** the customer's nearest served city (Roman form), when she said yes */
    geoCity: choice && "cityEn" in choice ? choice.cityEn : null,
    /** true when the soft-ask should render (never asked, nothing stored) */
    shouldAsk: !asked,
    accept,
    decline,
  };
}
