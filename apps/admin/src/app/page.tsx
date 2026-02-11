const stats = [
  {
    icon: "groups",
    value: "0",
    label: "Total Pandits",
    sub: "0 pending verification",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: "people",
    value: "0",
    label: "Total Customers",
    sub: "0 new this week",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: "event_note",
    value: "0",
    label: "Total Bookings",
    sub: "0 active today",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: "currency_rupee",
    value: "₹0",
    label: "Total Revenue",
    sub: "₹0 this month",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const pendingPandits = [
  { name: "Ramesh Sharma", phone: "+91 98765 43210", city: "Delhi", exp: "12 yrs" },
  { name: "Suresh Mishra", phone: "+91 87654 32109", city: "Noida", exp: "8 yrs" },
  { name: "Dinesh Tiwari", phone: "+91 76543 21098", city: "Gurgaon", exp: "20 yrs" },
];

export default function AdminDashboard() {
  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            HmarePanditJi platform overview — Delhi-NCR Phase 1
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          <span className="material-symbols-outlined text-base">add</span>
          Add Pandit
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>
            <div className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">
              {stat.label}
            </div>
            <div className="mt-1 text-xs text-slate-400">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Pending Pandit Approvals
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pendingPandits.length}
            </span>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </a>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {pendingPandits.map((pandit) => (
            <div
              key={pandit.phone}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {pandit.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {pandit.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {pandit.phone} · {pandit.city} · {pandit.exp} exp.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                  Approve
                </button>
                <button className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings placeholder */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent Bookings
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined mb-3 text-5xl text-slate-200 dark:text-slate-700">
            event_note
          </span>
          <p className="font-medium text-slate-500">No bookings yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Bookings will appear here once customers start booking
          </p>
        </div>
      </div>
    </div>
  );
}
