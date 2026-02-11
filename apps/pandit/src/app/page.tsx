export default function PanditDashboard() {
  const stats = [
    {
      icon: "calendar_today",
      value: "0",
      label: "Today's Bookings",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: "currency_rupee",
      value: "₹0",
      label: "This Month Earnings",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: "star",
      value: "—",
      label: "Your Rating",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Namaste, Pandit Ji
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s an overview of your activity today.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Upcoming Bookings
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined mb-3 text-5xl text-slate-200 dark:text-slate-700">
            event_available
          </span>
          <p className="font-medium text-slate-500">No upcoming bookings yet</p>
          <p className="mt-1 text-sm text-slate-400">
            New booking requests will appear here
          </p>
        </div>
      </div>

      {/* Profile CTA */}
      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-2xl text-primary">
            info
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Complete your profile to get bookings
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your photo, specializations, and bank details to appear in
              search results.
            </p>
            <button className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
