"use client";

import { useEffect, useRef, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const POLL_INTERVAL = 30_000; // 30 seconds

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

interface PendingRequest {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  venueCity: string;
  createdAt: string;
  estimatedEarning?: number;
}

interface UseBookingPollingOptions {
  onNewRequests: (requests: PendingRequest[]) => void;
  enabled?: boolean;
}

export function useBookingPolling({ onNewRequests, enabled = true }: UseBookingPollingOptions) {
  const prevCountRef = useRef<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAlert = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/booking-alert.mp3");
        audioRef.current.volume = 0.7;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // User hasn't interacted yet — silently fail
      });
    } catch {
      // Audio not supported
    }
  }, []);

  const showNotification = useCallback((request: PendingRequest) => {
    if (typeof window === "undefined") return;
    if (Notification.permission === "granted") {
      new Notification("Nayi Booking Aayi Hai! 🙏", {
        body: `${request.eventType} — ${request.venueCity}`,
        icon: "/icons/logo-192.png",
        tag: "new-booking",
      });
    }
  }, []);

  const poll = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/pandits/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const requests: PendingRequest[] =
        data?.data?.requests ?? data?.data ?? data?.requests ?? [];

      const count = requests.length;

      if (prevCountRef.current !== -1 && count > prevCountRef.current) {
        // New requests arrived
        playAlert();
        const newest = requests[0];
        if (newest) showNotification(newest);
      }

      prevCountRef.current = count;
      if (count > 0) {
        onNewRequests(requests);
      }
    } catch {
      // Network error — silently ignore
    }
  }, [onNewRequests, playAlert, showNotification]);

  useEffect(() => {
    if (!enabled) return;

    // Request notification permission on first load
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => { });
    }

    // Initial poll
    void poll();

    const interval = setInterval(() => void poll(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, poll]);
}
