"use client";

// Q5 (Ramesh replay fix): every dashboard TAB answers the visible tab
// names + पीछे by voice. Home keeps its richer registry (status toggle,
// तैयारी hero); this covers the tab pages that only narrate — their
// Narrate registers no commands, so this is the screen's sole registry
// entry and VoiceActionListener's built-in पीछे → router.back() applies.

import { useRouter } from "next/navigation";
import { VoiceActionListener } from "./VoiceActionListener";

export function DashboardVoiceNav({ helpLine }: { helpLine?: string }) {
  const router = useRouter();
  return (
    <VoiceActionListener
      commands={[
        { keywords: ["होम", "घर", "home"], action: () => router.push("/home") },
        { keywords: ["बुकिंग", "booking"], action: () => router.push("/bookings") },
        { keywords: ["कमाई", "kamai", "earnings"], action: () => router.push("/earnings") },
        { keywords: ["कैलेंडर", "calendar"], action: () => router.push("/calendar") },
        { keywords: ["मेरी पूजाएँ", "पूजाएँ", "poojas"], action: () => router.push("/my-poojas") },
        { keywords: ["तैयारी", "taiyari"], action: () => router.push("/readiness") },
        { keywords: ["सेटिंग", "settings"], action: () => router.push("/settings") },
        { keywords: ["मदद", "madad"], action: () => router.push("/help") },
      ]}
      promptText={helpLine}
    />
  );
}

export default DashboardVoiceNav;
