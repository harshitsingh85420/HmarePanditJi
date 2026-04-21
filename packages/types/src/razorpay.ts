// Type definitions for Razorpay payment gateway
// https://razorpay.com/docs/payments/payments/payment-gateway/web-integration/

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  receipt?: string;
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  prefill?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  rotation?: {
    duration?: number;
  };
  customer_id?: string;
  subscription_id?: string;
  callback_url?: string;
  redirect?: boolean;
  image?: string;
  remember_customer?: boolean;
  send_sms_hash?: boolean;
  autoset_first_upi_intent?: boolean;
  timeout?: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
}

interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    payment_id: string;
    order_id: string;
  };
}

interface RazorpayInstance {
  on(event: 'payment.failed', callback: (response: { error: RazorpayError }) => void): void;
  on(event: 'payment.success', callback: (response: any) => void): void;
  open(): void;
  close(): void;
}

interface RazorpayStatic {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayStatic;
  }
}

export type {
  RazorpayOptions,
  RazorpayResponse,
  RazorpayError,
  RazorpayInstance,
  RazorpayStatic,
};
