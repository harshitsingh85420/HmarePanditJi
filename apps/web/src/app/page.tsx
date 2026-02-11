export default function HomePage() {
  return (
    <div className="py-16">
      {/* Hero */}
      <section className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <span className="material-symbols-outlined text-base">verified</span>
          Delhi-NCR&apos;s Most Trusted Pandit Booking Platform
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Book Verified Pandits
          <br />
          <span className="text-primary">for Every Sacred Occasion</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          From Griha Pravesh to Satyanarayan Puja — find experienced, verified
          Hindu priests for all your religious ceremonies across Delhi-NCR with
          seamless travel logistics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:opacity-90">
            <span className="material-symbols-outlined text-xl">
              calendar_month
            </span>
            Book a Pandit
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <span className="material-symbols-outlined text-xl">
              play_circle
            </span>
            How It Works
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: "groups", value: "500+", label: "Verified Pandits" },
          { icon: "auto_stories", value: "50+", label: "Puja Services" },
          { icon: "star", value: "4.9", label: "Average Rating" },
          { icon: "location_city", value: "Delhi-NCR", label: "Service Area" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="material-symbols-outlined mb-2 block text-3xl text-primary">
              {stat.icon}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section id="services" className="mt-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Our Puja Services
          </h2>
          <p className="mt-2 text-slate-500">
            Authentic rituals performed by experienced pandits
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { icon: "home", name: "Griha Pravesh", price: "From ₹8,000" },
            { icon: "favorite", name: "Satyanarayan Puja", price: "From ₹5,100" },
            { icon: "celebration", name: "Wedding Ceremony", price: "From ₹21,000" },
            { icon: "child_care", name: "Namkaran", price: "From ₹4,100" },
            { icon: "local_fire_department", name: "Havan", price: "From ₹6,100" },
            { icon: "self_improvement", name: "Vastu Shanti", price: "From ₹7,500" },
            { icon: "menu_book", name: "Sundarkand", price: "From ₹5,500" },
            { icon: "more_horiz", name: "Many More", price: "50+ rituals" },
          ].map((service) => (
            <div
              key={service.name}
              className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="material-symbols-outlined mb-3 block text-3xl text-primary">
                {service.icon}
              </span>
              <div className="font-semibold text-slate-900 dark:text-white">
                {service.name}
              </div>
              <div className="mt-1 text-sm text-primary">{service.price}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
