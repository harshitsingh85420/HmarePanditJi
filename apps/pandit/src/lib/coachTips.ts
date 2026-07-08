"use client";

// First-use contextual tips (Spec 3): each shows once per tipId,
// dismissed by [समझा], remembered in localStorage 'tip_seen_<id>'.

export interface CoachTip {
  tipId: string;
  screen: string;
  title: string;
  line: string;
}

export const COACH_TIPS: Record<string, CoachTip> = {
  homeGoOnline: {
    tipId: "homeGoOnline",
    screen: "/home",
    title: "बुकिंग चालू-बंद",
    line: "यह बटन दबाकर आप बुकिंग लेना शुरू या बंद कर सकते हैं। हरा मतलब आप ऑनलाइन हैं।",
  },
  bookingsTabs: {
    tipId: "bookingsTabs",
    screen: "/bookings",
    title: "तीन खाने",
    line: "नई बुकिंग, आने वाली और पूरी हुई — तीनों यहाँ अलग-अलग खानों में हैं।",
  },
  detailRoute: {
    tipId: "detailRoute",
    screen: "/bookings/[id]",
    title: "रास्ता एक छुअन पर",
    line: "यह बटन दबाते ही नक्शा खुल जाएगा — यजमान के घर का रास्ता।",
  },
  earningsPending: {
    tipId: "earningsPending",
    screen: "/earnings",
    title: "आने वाली राशि",
    line: "पूजा संपन्न होते ही राशि यहाँ दिखती है, और चौबीस घंटे में खाते में पहुँचती है।",
  },
  calendarBlock: {
    tipId: "calendarBlock",
    screen: "/calendar",
    title: "तारीख़ बंद करें",
    line: "जिस दिन उपलब्ध नहीं हैं, उस तारीख़ को छूकर बंद कर दीजिए — उस दिन बुकिंग नहीं आएगी।",
  },
  samagriAdd: {
    tipId: "samagriAdd",
    screen: "/samagri",
    title: "अपनी सामग्री, अपना दाम",
    line: "यहाँ से नई सामग्री जोड़िए और उसका फिक्स दाम तय कीजिए।",
  },
  myPoojasAdd: {
    tipId: "myPoojasAdd",
    screen: "/my-poojas",
    title: "नई पूजा जोड़ें",
    line: "नई पूजा जोड़कर दक्षिणा तय कीजिए — सत्यापन के बाद वह भी बुक होने लगेगी।",
  },
};

export function isTipSeen(tipId: string): boolean {
  try {
    return localStorage.getItem(`tip_seen_${tipId}`) === "true";
  } catch {
    return true;
  }
}

export function markTipSeen(tipId: string): void {
  try {
    localStorage.setItem(`tip_seen_${tipId}`, "true");
  } catch {
    /* noop */
  }
}
