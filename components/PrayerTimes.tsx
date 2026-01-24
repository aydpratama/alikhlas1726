export default function PrayerTimes() {
  const schedule = [
    { name: "Subuh", time: "04:35" },
    { name: "Syuruq", time: "05:52" },
    { name: "Dzuhur", time: "12:08" },
    { name: "Ashar", time: "15:32" },
    { name: "Maghrib", time: "18:18" },
    { name: "Isya", time: "19:30" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-md shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-primary px-8 py-6 text-center text-white">
            <h2 className="text-3xl font-bold">Jadwal Shalat</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Wilayah Bekasi & Sekitarnya •{" "}
              {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {schedule.map((slot) => (
              <div
                key={slot.name}
                className="p-6 text-center hover:bg-emerald-50/50 transition-colors group"
              >
                <span className="block text-gray-500 text-xs font-semibold tracking-wider mb-2 group-hover:text-primary">
                  {slot.name}
                </span>
                <span className="block text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
                  {slot.time}
                </span>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-slate-200 text-center">
            <p className="text-xs text-gray-500 italic">
              *Jadwal dapat berubah sewaktu-waktu sesuai ketetapan Kemenag RI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
