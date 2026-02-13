"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { API_BASE } from "../context/auth-context";

// ── Razorpay global types ─────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RazorpayCheckoutProps {
  /** Razorpay order ID from backend */
  orderId: string;
  /** Amount in paisa (INR × 100) */
  amount: number;
  currency?: string;
  /** Pass "rzp_test_mock" to skip real Razorpay modal in dev mode */
  razorpayKey: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  accessToken: string;
  onSuccess: (confirmedBooking: unknown) => void;
  onFailure?: (error: string) => void;
  onDismiss?: () => void;
}

type CheckoutState = "loading" | "processing" | "dismissed" | "error";

// ── Helper ────────────────────────────────────────────────────────────────────

function rupees(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Loads the Razorpay checkout.js script, opens the payment modal, and verifies
 * the payment on the backend. In dev mode (key === "rzp_test_mock") it skips
 * the modal and simulates a successful payment directly.
 *
 * The component auto-opens the modal on mount.
 * On dismiss / failure it renders a Retry button.
 */
export default function RazorpayCheckout({
  orderId,
  amount,
  currency = "INR",
  razorpayKey,
  bookingId,
  bookingNumber,
  customerName,
  customerEmail,
  customerPhone,
  accessToken,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutProps) {
  const [state, setState] = useState<CheckoutState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  // Track mount to avoid double-open in strict mode
  const openedRef = useRef(false);

  // ── Verify payment with backend ──────────────────────────────────────────

  const verify = useCallback(
    async (paymentId: string, rzpOrderId: string, signature: string) => {
      setState("processing");
      try {
        const res = await fetch(`${API_BASE}/payments/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            bookingId,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { message?: string }).message ?? "Payment verification failed");
        }

        const j = await res.json() as { data?: { booking?: unknown } };
        onSuccess(j.data?.booking);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Verification failed. Please contact support.";
        setErrorMsg(msg);
        setState("error");
        onFailure?.(msg);
      }
    },
    [accessToken, bookingId, onSuccess, onFailure],
  );

  // ── Load checkout.js script ──────────────────────────────────────────────

  const loadScript = useCallback((): Promise<void> => {
    if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
      document.head.appendChild(script);
    });
  }, []);

  // ── Open Razorpay modal (or simulate in dev mode) ────────────────────────

  const openModal = useCallback(async () => {
    setState("loading");
    setErrorMsg("");

    // Dev mode: simulate payment without real Razorpay
    if (razorpayKey === "rzp_test_mock") {
      // Small delay for UX realism
      await new Promise((r) => setTimeout(r, 600));
      await verify(`pay_mock_${Date.now()}`, orderId, "mock_signature_dev");
      return;
    }

    // Load Razorpay script
    try {
      await loadScript();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load payment module";
      setErrorMsg(msg);
      setState("error");
      return;
    }

    // Open modal
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount,
      currency,
      name: "HmarePanditJi",
      description: `Booking #${bookingNumber}`,
      image: "/logo.png",
      order_id: orderId,
      prefill: {
        name: customerName,
        ...(customerEmail ? { email: customerEmail } : {}),
        ...(customerPhone ? { contact: customerPhone } : {}),
      },
      theme: { color: "#FF6B00" },
      handler: (response) => {
        void verify(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature,
        );
      },
      modal: {
        ondismiss: () => {
          setState("dismissed");
          onDismiss?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    // After open() the modal is visible; state will be updated via handler / ondismiss
    // We don't set a specific "open" state since the modal overlays the page
  }, [razorpayKey, orderId, amount, currency, bookingNumber, customerName, customerEmail, customerPhone, verify, loadScript, onDismiss]);

  // Auto-open on mount
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    void openModal();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">
          {razorpayKey === "rzp_test_mock" ? "Simulating payment…" : "Opening payment window…"}
        </p>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Verifying payment…</p>
        <p className="text-xs text-slate-400">Please don&apos;t close this page.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
          <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0 mt-0.5">error</span>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Payment failed</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{errorMsg}</p>
          </div>
        </div>
        <button
          onClick={() => void openModal()}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Retry Payment
        </button>
      </div>
    );
  }

  // state === "dismissed"
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
        <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5">info</span>
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Payment cancelled</p>
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
            Your booking is saved. Complete the payment to confirm your slot.
          </p>
        </div>
      </div>
      <button
        onClick={() => void openModal()}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
        Complete Payment · {rupees(amount)}
      </button>
    </div>
  );
}
