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
  /** Pass &quot;rzp_test_mock&quot; to skip real Razorpay modal in dev mode */
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

type CheckoutState = &quot;loading&quot; | &quot;processing&quot; | &quot;dismissed&quot; | &quot;error&quot;;

// ── Helper ────────────────────────────────────────────────────────────────────

function rupees(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString(&quot;en-IN&quot;)}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Loads the Razorpay checkout.js script, opens the payment modal, and verifies
 * the payment on the backend. In dev mode (key === &quot;rzp_test_mock&quot;) it skips
 * the modal and simulates a successful payment directly.
 *
 * The component auto-opens the modal on mount.
 * On dismiss / failure it renders a Retry button.
 */
export default function RazorpayCheckout({
  orderId,
  amount,
  currency = &quot;INR&quot;,
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
  const [state, setState] = useState<CheckoutState>(&quot;loading&quot;);
  const [errorMsg, setErrorMsg] = useState(&quot;&quot;);
  // Track mount to avoid double-open in strict mode
  const openedRef = useRef(false);

  // ── Verify payment with backend ──────────────────────────────────────────

  const verify = useCallback(
    async (paymentId: string, rzpOrderId: string, signature: string) => {
      setState(&quot;processing&quot;);
      try {
        const res = await fetch(`${API_BASE}/payments/verify`, {
          method: &quot;POST&quot;,
          headers: {
            &quot;Content-Type&quot;: &quot;application/json&quot;,
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
          throw new Error((j as { message?: string }).message ?? &quot;Payment verification failed&quot;);
        }

        const j = await res.json() as { data?: { booking?: unknown } };
        onSuccess(j.data?.booking);
      } catch (err) {
        const msg = err instanceof Error ? err.message : &quot;Verification failed. Please contact support.&quot;;
        setErrorMsg(msg);
        setState(&quot;error&quot;);
        onFailure?.(msg);
      }
    },
    [accessToken, bookingId, onSuccess, onFailure],
  );

  // ── Load checkout.js script ──────────────────────────────────────────────

  const loadScript = useCallback((): Promise<void> => {
    if (typeof window !== &quot;undefined&quot; && window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement(&quot;script&quot;);
      script.src = &quot;https://checkout.razorpay.com/v1/checkout.js&quot;;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(&quot;Failed to load Razorpay checkout&quot;));
      document.head.appendChild(script);
    });
  }, []);

  // ── Open Razorpay modal (or simulate in dev mode) ────────────────────────

  const openModal = useCallback(async () => {
    setState(&quot;loading&quot;);
    setErrorMsg(&quot;&quot;);

    // Dev mode: simulate payment without real Razorpay
    if (razorpayKey === &quot;rzp_test_mock&quot;) {
      // Small delay for UX realism
      await new Promise((r) => setTimeout(r, 600));
      await verify(`pay_mock_${Date.now()}`, orderId, &quot;mock_signature_dev&quot;);
      return;
    }

    // Load Razorpay script
    try {
      await loadScript();
    } catch (err) {
      const msg = err instanceof Error ? err.message : &quot;Failed to load payment module&quot;;
      setErrorMsg(msg);
      setState(&quot;error&quot;);
      return;
    }

    // Open modal
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount,
      currency,
      name: &quot;HmarePanditJi&quot;,
      description: `Booking #${bookingNumber}`,
      image: &quot;/logo.png&quot;,
      order_id: orderId,
      prefill: {
        name: customerName,
        ...(customerEmail ? { email: customerEmail } : {}),
        ...(customerPhone ? { contact: customerPhone } : {}),
      },
      theme: { color: &quot;#FF6B00&quot; },
      handler: (response) => {
        void verify(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature,
        );
      },
      modal: {
        ondismiss: () => {
          setState(&quot;dismissed&quot;);
          onDismiss?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    // After open() the modal is visible; state will be updated via handler / ondismiss
    // We don&apos;t set a specific &quot;open&quot; state since the modal overlays the page
  }, [razorpayKey, orderId, amount, currency, bookingNumber, customerName, customerEmail, customerPhone, verify, loadScript, onDismiss]);

  // Auto-open on mount
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    void openModal();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────

  if (state === &quot;loading&quot;) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg text-slate-500">
          {razorpayKey === &quot;rzp_test_mock&quot; ? &quot;Simulating payment…&quot; : &quot;Opening payment window…&quot;}
        </p>
      </div>
    );
  }

  if (state === &quot;processing&quot;) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg text-slate-500">Verifying payment…</p>
        <p className="text-base text-slate-400">Please don&apos;t close this page.</p>
      </div>
    );
  }

  if (state === &quot;error&quot;) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
          <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0 mt-0.5">error</span>
          <div>
            <p className="text-lg font-semibold text-red-700 dark:text-red-400">Payment failed</p>
            <p className="text-base text-red-600 dark:text-red-300 mt-0.5">{errorMsg}</p>
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

  // state === &quot;dismissed&quot;
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
        <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5">info</span>
        <div>
          <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">Payment cancelled</p>
          <p className="text-base text-amber-600 dark:text-amber-300 mt-0.5">
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
