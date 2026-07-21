"use client";

// ─────────────────────────────────────────────────────────────
// स्थान HARNESS — /design/harness/location (DEV ONLY; 404 in prod).
// Renders the real LocationPermissionScreen for the canon-frame-2
// comparison. ?state=confirm seeds the detected-city confirm state
// (वाराणसी / उत्तर प्रदेश, canon's own specimen); default is the
// permission-ask state. Never linked from the app.
// ─────────────────────────────────────────────────────────────

import React, { Suspense } from "react";
import { notFound, useSearchParams } from "next/navigation";
import LocationPermissionScreen from "../../../onboarding/screens/LocationPermissionScreen";

function Inner() {
  const params = useSearchParams();
  const confirm = params?.get("state") === "confirm";
  return (
    <LocationPermissionScreen
      language={"hi" as never}
      onLanguageChange={() => {}}
      onGranted={() => {}}
      onDenied={() => {}}
      showBack={false}
      initialDetected={confirm ? { city: "वाराणसी", state: "उत्तर प्रदेश" } : null}
    />
  );
}

export default function LocationHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
