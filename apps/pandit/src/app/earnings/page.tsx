"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface Transaction {
  id: string;
  bookingNumber: string;
  date: string;
  ceremony: string;
  amount: number;
  status: "PAID" | "PENDING" | "PROCESSING";
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    bookingNumber: "HPJ-003",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ceremony: "Vivah Puja",
    amount: 52750,
    status: "PAID",
  },
  {
    id: "t2",
    bookingNumber: "HPJ-004",
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    ceremony: "Namkaran Puja",
    amount: 8500,
    status: "PAID",
  },
  {
    id: "t3",
    bookingNumber: "HPJ-006",
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    ceremony: "Satyanarayan Puja",
    amount: 11000,
    status: "PROCESSING",
  },
  {
    id: "t4",
    bookingNumber: "HPJ-007",
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    ceremony: "Griha Pravesh",
    amount: 21000,
    status: "PAID",
  },
  {
    id: "t5",
    bookingNumber: "HPJ-008",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ceremony: "Maha Mrityunjay Jaap",
    amount: 15000,
    status: "PENDING",
  },
];

const MOCK_MONTHLY = {
  totalEarnings: 108250,
  pendingPayout: 15000,
  completedBookings: 5,
  avgPerBooking: 21650,
  change: 12,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

const statusStyle: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
};
const statusLabel: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PROCESSING: "Processing",
};

export default function EarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthly, setMonthly] = useState(MOCK_MONTHLY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/earnings`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.data?.transactions ?? MOCK_TRANSACTIONS);
          if (data.data?.monthly) setMonthly(data.data.monthly);
        } else {
          setTransactions(MOCK_TRANSACTIONS);
        }
      } catch {
        setTransactions(MOCK_TRANSACTIONS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="py-8 space-y-6">
      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[32px] font-bold text-slate-900 leading-tight">Earnings</h1>
        <p className="mt-1 text-base text-slate-500">Aapki kamai ka pura hisaab</p>
      </div>

      {/* ── Monthly Summary Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Earnings */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
            <span className="text-sm font-medium text-slate-500">Monthly Earnings</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{fmt(monthly.totalEarnings)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-green-600 text-base leading-none">
              trending_up
            </span>
            <span className="text-sm text-green-600 font-medium">
              +{monthly.change}% vs last month
            </span>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">
              account_balance_wallet
            </span>
            <span className="text-sm font-medium text-slate-500">Pending Payout</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{fmt(monthly.pendingPayout)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-slate-400 text-base leading-none">
              schedule
            </span>
            <span className="text-sm text-slate-500 font-medium">3–5 business days</span>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">task_alt</span>
            <span className="text-sm font-medium text-slate-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{monthly.completedBookings}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-primary text-base leading-none">
              auto_stories
            </span>
            <span className="text-sm text-slate-500 font-medium">Pujas this month</span>
          </div>
        </div>

        {/* Average Per Booking */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">
              calculate
            </span>
            <span className="text-sm font-medium text-slate-500">Avg / Booking</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{fmt(monthly.avgPerBooking)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span
              className="material-symbols-outlined text-green-600 text-base leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-sm text-green-600 font-medium">Top 10% pandits</span>
          </div>
        </div>
      </div>

      {/* ── Payment Transfer Notice ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
        <span className="material-symbols-outlined text-blue-500 text-[22px] flex-shrink-0">
          info
        </span>
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Payment Transfer:</span> Completed puja payments are
          processed within <span className="font-semibold">3–5 business days</span> to your
          registered bank account.
        </p>
      </div>

      {/* ── Transaction List ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Transaction History</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-slate-300 text-[64px]">
              receipt_long
            </span>
            <p className="text-base font-medium text-slate-500">Koi transaction nahi mila</p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_2fr_auto_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Date</span>
              <span>Booking #</span>
              <span>Ceremony</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Status</span>
            </div>

            <div className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_2fr_auto_auto] gap-1 sm:gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  {/* Date */}
                  <span className="text-sm text-slate-500">{formatDate(t.date)}</span>

                  {/* Booking number */}
                  <span className="text-xs font-mono text-slate-400 hidden sm:block">
                    #{t.bookingNumber}
                  </span>

                  {/* Ceremony */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <span className="text-sm font-semibold text-slate-900">{t.ceremony}</span>
                    <span className="text-xs font-mono text-slate-400 sm:hidden">
                      #{t.bookingNumber}
                    </span>
                  </div>

                  {/* Amount */}
                  <span className="text-base font-bold text-slate-900 sm:text-right">
                    ₹{fmt(t.amount)}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full w-fit sm:mx-auto ${statusStyle[t.status]}`}
                  >
                    {statusLabel[t.status]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
