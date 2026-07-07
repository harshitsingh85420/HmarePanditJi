"use client";

// The (registration) flow was a parallel, voiceless duplicate of the
// canonical /login + /onboarding flow. Kept only as a redirect so old
// links and resume states still land somewhere sensible.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);
  return null;
}
