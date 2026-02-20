"use client";

import { useMemo } from "react";

interface SamagriManagerProps {
  panditId: string;
}

export default function SamagriManager({ panditId }: SamagriManagerProps) {
  const shortId = useMemo(() => panditId.slice(0, 8).toUpperCase(), [panditId]);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Samagri Management</h3>
          <p className="mt-1 text-sm text-slate-600">
            Package management is enabled for this pandit profile.
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          ID: {shortId}
        </span>
      </div>
    </section>
  );
}
