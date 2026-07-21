import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import LocationPermissionScreen from "@/app/onboarding/screens/LocationPermissionScreen";

// ─────────────────────────────────────────────────────────────
// CONFORMANCE PINS — F04-03, F04-05, F05-02.
//
// These freeze what is TRUE TODAY. Both requirements pinned here are
// 🟡 partial in docs/pandit-pov-conformance-register.md, so each block
// has two halves:
//
//   · BUILT   — assertions on behaviour that exists. A future change that
//               silently removes it fails the build.
//   · GAP     — assertions that the missing half is STILL missing. These
//               document a gap, they are NOT desired properties. When
//               someone closes the gap these fail on purpose, which forces
//               them to update the register instead of letting it drift.
//
// F04-05 is NOT re-tested here. It is discharged by the existing
// security guard at services/api/src/lib/public-pandit-projection.test.ts
// (select allow-list on the public pandit projection); this file only
// asserts that guard still exists and still carries the ID, so the
// conformance link cannot be deleted without a red build. Duplicating
// its assertions would give two places to weaken instead of one.
// ─────────────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url)); // apps/pandit/src/lib
const REPO = join(HERE, "..", "..", "..", "..");
const API_LIB = join(REPO, "services", "api", "src", "lib");
const READINESS = join(
  REPO,
  "apps",
  "pandit",
  "src",
  "app",
  "(dashboard-group)",
  "readiness",
  "page.tsx",
);
const LOCATION_SCREEN = join(HERE, "..", "app", "onboarding", "screens", "LocationPermissionScreen.tsx");

/** Drive the geolocation grant path with a fixed reverse-geocode reply. */
function grantGeolocationWith(city: string, state: string) {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (ok: PositionCallback) =>
        ok({ coords: { latitude: 25.3176, longitude: 82.9739 } } as GeolocationPosition),
    },
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("nominatim")) {
        return {
          ok: true,
          json: async () => ({ address: { city, state } }),
        } as unknown as Response;
      }
      // any other call (TTS etc.) is not under test — answer emptily
      return { ok: true, json: async () => ({}) } as unknown as Response;
    }),
  );
}

// ═════════════════════════════════════════════════════════════
// F04-03 — "क्या आप अभी इसी पते पर हैं?" city-confirm
// Register status: 🟡 (city-confirm built).
// BUILT: the confirm step itself — a reverse-geocoded city is SHOWN and
//        must be accepted by the pandit before it is committed.
// GAP:   the map blue-dot on हाँ, and the draggable pin dropped from the
//        saved address on नहीं. Neither exists.
// ═════════════════════════════════════════════════════════════
describe("F04-03 — detected-city confirm before commit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("F04-03 BUILT: a reverse-geocoded city is shown for confirmation and is NOT auto-committed", async () => {
    grantGeolocationWith("Varanasi", "Uttar Pradesh");
    const onGranted = vi.fn();
    const onDenied = vi.fn();

    render(
      React.createElement(LocationPermissionScreen, {
        language: "hi" as never,
        onLanguageChange: () => {},
        onGranted,
        onDenied,
      }),
    );

    fireEvent.click(screen.getByText("अनुमति दें"));

    // the confirm card appears with the detected place spelled out
    await waitFor(() => expect(screen.getByText("Varanasi")).toBeTruthy());
    expect(screen.getByText("Uttar Pradesh")).toBeTruthy();

    // THE POINT of the confirm step: nothing is committed yet.
    expect(onGranted).not.toHaveBeenCalled();
    expect(onDenied).not.toHaveBeenCalled();
  });

  it('F04-03 BUILT: "यही सही है" commits exactly the detected city and state', async () => {
    grantGeolocationWith("Varanasi", "Uttar Pradesh");
    const onGranted = vi.fn();
    const onDenied = vi.fn();

    render(
      React.createElement(LocationPermissionScreen, {
        language: "hi" as never,
        onLanguageChange: () => {},
        onGranted,
        onDenied,
      }),
    );
    fireEvent.click(screen.getByText("अनुमति दें"));
    await waitFor(() => expect(screen.getByText("Varanasi")).toBeTruthy());

    // canon frame 2 CTA carries a material check_circle glyph, not a "✓" char
    fireEvent.click(screen.getByText("यही सही है"));

    expect(onGranted).toHaveBeenCalledTimes(1);
    expect(onGranted).toHaveBeenCalledWith("Varanasi", "Uttar Pradesh");
    expect(onDenied).not.toHaveBeenCalled();
  });

  it('F04-03 BUILT: "जगह बदलें" rejects the detection and commits nothing', async () => {
    grantGeolocationWith("Varanasi", "Uttar Pradesh");
    const onGranted = vi.fn();
    const onDenied = vi.fn();

    render(
      React.createElement(LocationPermissionScreen, {
        language: "hi" as never,
        onLanguageChange: () => {},
        onGranted,
        onDenied,
      }),
    );
    fireEvent.click(screen.getByText("अनुमति दें"));
    await waitFor(() => expect(screen.getByText("Varanasi")).toBeTruthy());

    fireEvent.click(screen.getByText("जगह बदलें"));

    expect(onDenied).toHaveBeenCalledTimes(1);
    expect(onGranted).not.toHaveBeenCalled();
  });

  it("F04-03 BUILT: a reverse-geocode failure never invents a city — it falls through to the manual picker", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: PositionCallback) =>
          ok({ coords: { latitude: 1, longitude: 1 } } as GeolocationPosition),
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({}) }) as unknown as Response),
    );
    const onGranted = vi.fn();
    const onDenied = vi.fn();

    render(
      React.createElement(LocationPermissionScreen, {
        language: "hi" as never,
        onLanguageChange: () => {},
        onGranted,
        onDenied,
      }),
    );
    fireEvent.click(screen.getByText("अनुमति दें"));

    // the fall-through is deliberately delayed (the error copy is read out
    // first), so allow the screen's own 1.5s recovery window
    await waitFor(() => expect(onDenied).toHaveBeenCalled(), { timeout: 4000 });
    expect(onGranted).not.toHaveBeenCalled();
    // TRUTHFUL-STATE: no confirm card claiming a place we do not have
    expect(screen.queryByText("✓ यही सही है")).toBeNull();
  });

  it("F04-03 GAP (documents a gap, NOT a desired property): no map, no blue-dot, no draggable pin exists", () => {
    // The register asks for: हाँ → GPS capture WITH MAP BLUE-DOT;
    // नहीं → a PIN DROPPED from the saved address, DRAGGABLE.
    // None of that is built — the confirm step is text-only and the
    // नहीं branch is the plain manual city picker (onDenied).
    // When someone builds the map, THIS TEST FAILS — go update
    // docs/pandit-pov-conformance-register.md (F04-03 🟡 → ✅) and delete it.
    const src = readFileSync(LOCATION_SCREEN, "utf-8");
    for (const marker of ["leaflet", "mapbox", "google.maps", "maplibre", "draggable", "blue-dot", "<Map"]) {
      expect(
        src.toLowerCase().includes(marker.toLowerCase()),
        `F04-03 map half appears to have landed ("${marker}") — update the register`,
      ).toBe(false);
    }
  });
});

// ═════════════════════════════════════════════════════════════
// F04-05 — privacy: full address + lat/long never customer-facing.
// FIXED by the select allow-list on the public pandit projection.
// The guard lives in services/api and runs under the API guard runner;
// this only pins that the guard file and its ID link survive.
// ═════════════════════════════════════════════════════════════
describe("F04-05 — public pandit projection guard is present and linked", () => {
  it("F04-05: the select-allow-list guard exists and still names its requirement", () => {
    const guard = join(API_LIB, "public-pandit-projection.test.ts");
    expect(existsSync(guard), `${guard} is the ONLY guard for F04-05 — it was deleted`).toBe(true);
    const src = readFileSync(guard, "utf-8");
    expect(src.includes("F04-05")).toBe(true);
    // it must still be an allow-list guard, not a renamed stub
    expect(src.includes("select")).toBe(true);
    expect(src.includes("bankAccountNumber")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════
// F05-02 — Aadhaar photo: auto-capture with manual fallback.
// Register status: 🟡 upload built.
// BUILT: the manual-fallback half — front + back photo upload, and the
//        DPDP consent that must accompany the submit.
// GAP:   auto-capture. There is no camera auto-shutter, no edge/OCR
//        detection; the inputs are plain file pickers.
// ═════════════════════════════════════════════════════════════
describe("F05-02 — Aadhaar photo upload (manual fallback half)", () => {
  const src = readFileSync(READINESS, "utf-8");

  it("F05-02 BUILT: both Aadhaar faces have their own upload input wired to the upload handler", () => {
    expect(src.includes('props.onFileUpload(e, "aadhaar-front")')).toBe(true);
    expect(src.includes('props.onFileUpload(e, "aadhaar-back")')).toBe(true);
    // image-only pickers, one per face
    const imageInputs = src.match(/type="file"[^>]*accept="image\/\*"/g) || [];
    expect(imageInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("F05-02 BUILT: the upload handler POSTs the file to /upload with its kind and stores the returned key", () => {
    const handler = src.slice(src.indexOf("const handleFileUpload"));
    expect(handler.includes("`${API_BASE}/upload?kind=${kind}`")).toBe(true);
    expect(handler.includes('method: "POST"')).toBe(true);
    expect(handler.includes("FormData")).toBe(true);
    // the resulting key/url is what gets persisted — not the raw file
    expect(handler.includes("setUrl(json.data.key || json.data.url)")).toBe(true);
  });

  it("F05-02 BUILT: the submit refuses to persist Aadhaar without consent, and sends the consent with it", () => {
    const save = src.slice(src.indexOf("const saveR5"), src.indexOf("const handleFileUpload"));
    // every one of these gates must return BEFORE patchStep(5, …) is reached
    const patchAt = save.indexOf("patchStep(5");
    expect(patchAt).toBeGreaterThan(0);
    for (const gate of ["if (!aadhaarUrl)", "if (!aadhaarBackUrl)", "if (!aadhaarConsent)"]) {
      const at = save.indexOf(gate);
      expect(at, `missing Aadhaar gate: ${gate}`).toBeGreaterThan(-1);
      expect(at, `${gate} must run before the submit`).toBeLessThan(patchAt);
    }
    // consent is RECORDED, not merely gated (DPDP)
    expect(save.slice(patchAt).includes("aadhaarConsent,")).toBe(true);
  });

  it("F05-02 BUILT: the server-side DPDP consent-before-capture guard exists and is not duplicated here", () => {
    // Pandit-side pins the UI; services/api/src/lib/aadhaar-consent.test.ts
    // pins that the SERVER refuses the capture without a recorded consent.
    // Referenced, deliberately not re-implemented.
    const guard = join(API_LIB, "aadhaar-consent.test.ts");
    expect(existsSync(guard), `${guard} is the server half of F05-02 — it was deleted`).toBe(true);
    const g = readFileSync(guard, "utf-8");
    expect(g.includes("aadhaarConsentAt")).toBe(true);
    expect(g.includes("aadhaarEncrypted")).toBe(true);
  });

  it("F05-02 BUILT: the Aadhaar number is never echoed back on resume", () => {
    // security behaviour that rides along with the upload path
    expect(src.includes("setAadhaarUrl(snap.aadhaarUrl")).toBe(true);
    expect(/aadhaarNumber is never echoed back/.test(src)).toBe(true);
    const restore = src.slice(src.indexOf("setAadhaarUrl(snap.aadhaarUrl"));
    const block = restore.slice(0, 400);
    expect(/setAadhaarNumber\(snap\./.test(block)).toBe(false);
  });

  it("F05-02 GAP (documents a gap, NOT a desired property): there is no auto-capture — the pickers are manual only", () => {
    // The register asks for AUTO-CAPTURE with manual fallback. Only the
    // fallback exists. The inputs carry no `capture` attribute (so not even
    // a forced camera), and there is no shutter/edge-detect/OCR anywhere.
    // When auto-capture lands, THIS TEST FAILS — go update
    // docs/pandit-pov-conformance-register.md (F05-02 🟡 → ✅) and delete it.
    expect(/type="file"[^>]*\scapture/.test(src)).toBe(false);
    for (const marker of ["autoCapture", "auto-capture", "getUserMedia", "ImageCapture", "OCR", "edgeDetect"]) {
      expect(
        src.includes(marker),
        `F05-02 auto-capture appears to have landed ("${marker}") — update the register`,
      ).toBe(false);
    }
  });
});
