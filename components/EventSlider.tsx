export default function EventSlider() {
  const events = [
    {
      id: 1,
      title: "Kajian Rutin Ahad Pagi",
      date: "Minggu, 05:30 WIB",
      description: "Pembahasan Kitab Riyadhus Shalihin bersama Ust. Abdullah.",
      color: "bg-teal-50",
      border: "border-teal-100",
    },
    {
      id: 2,
      title: "Jumat Berkah",
      date: "Jumat, 11:30 WIB",
      description: "Makan siang gratis untuk jamaah shalat Jumat.",
      color: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      id: 3,
      title: "Santunan Yatim",
      date: "25 Januari 2026",
      description:
        "Pemberian santunan bulanan untuk anak yatim di lingkungan sekitar.",
      color: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      id: 4,
      title: "Tahsin Al-Quran",
      date: "Selasa & Kamis",
      description: "Program perbaikan bacaan Al-Quran untuk dewasa.",
      color: "bg-indigo-50",
      border: "border-indigo-100",
    },
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Agenda & <span className="text-primary">Kegiatan</span>
          </h2>
        </div>
        <div className="flex justify-center gap-2 mb-8">
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-gray-50 text-gray-600">
            ←
          </button>
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-gray-50 text-gray-600">
            →
          </button>
        </div>

        {/* Scrollable Container with Scroll Snap */}
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-6 snap-x snap-mandatory scrollbar-hide">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex-none w-80 md:w-96 snap-start rounded-md border ${event.border} ${event.color} p-6 transition-transform hover:-translate-y-1`}
            >
              <div className="flex flex-col h-full bg-white/60 rounded-md p-4 backdrop-blur-sm">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary w-fit mb-3">
                  Kegiatan
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  📅 {event.date}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                  {event.description}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <a
                    href="#"
                    className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
                  >
                    Selengkapnya <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
