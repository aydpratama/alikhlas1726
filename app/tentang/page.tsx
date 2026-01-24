"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MapPin, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MosqueIcon } from "@/components/MosqueIcon";

export default function TentangPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/alikhlas2.jpg"
            alt="Masjid Al-Ikhlas"
            className="w-full h-full object-cover object-bottom"
            loading="eager"
          />
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/20 to-slate-50/20"></div>
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="mosque-pattern-about"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <MosqueIcon className="w-3 h-3 text-slate-100/20" />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#mosque-pattern-about)"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-800 mb-3">
              <span className="bg-emerald-600 bg-clip-text text-transparent">
                Tentang
              </span>{" "}
              <span className="text-gray-800">Masjid Al-Ikhlas</span>
            </h2>
          </motion.div>

          {/* About Content */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Mosque Images - 3 Images Grid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              <div className="space-y-6 md:space-y-8">
                {/* Image 1 */}
                <div className="relative group">
                  <div className="aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                    <img
                      src="/alikhlas1.jpg"
                      alt="Masjid Al-Ikhlas Eksterior"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent"></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Eksterior Masjid
                  </p>
                </div>

                {/* Image 2 */}
                <div className="relative group">
                  <div className="aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                    <img
                      src="/alikhlas2.jpg"
                      alt="Masjid Al-Ikhlas Interior"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent"></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Interior Masjid
                  </p>
                </div>

                {/* Image 3 */}
                <div className="relative group">
                  <div className="aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                    <img
                      src="/alikhlas3.jpg"
                      alt="Masjid Al-Ikhlas Community"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent"></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Kegiatan Jamaah
                  </p>
                </div>
              </div>
            </motion.div>

            {/* About Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 md:order-2 space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Sejarah Masjid Al-Ikhlas
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Masjid Al-Ikhlas 17/26 didirikan pada tahun 1992 di
                  Kayuringinjaya, Bekasi Selatan. Sebagai pusat kegiatan
                  keagamaan dan sosial masyarakat, masjid ini telah menjadi
                  landmark penting bagi perkembangan Islam di wilayah tersebut.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Didirikan:</p>
                      <p className="text-gray-600">15 Maret 1992</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Lokasi:</p>
                      <p className="text-gray-600">
                        Jl. Utama Raya RT.002/RW.026, Kayuringinjaya, Bekasi
                        Selatan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Visi & Misi
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Visi</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Menjadi masjid yang modern dan inklusif, menjadi pusat
                      pendidikan Al-Quran, serta pelayanan sosial yang
                      berkualitas bagi masyarakat.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Misi</h4>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Menyelenggarakan shalat lima waktu berjamaah</li>
                      <li>• Menyediakan program pendidikan TPQ dan TPA</li>
                      <li>• Mengadakan kajian rutin dan kegiatan keagamaan</li>
                      <li>• Menjadi pusat informasi dan pelayanan sosial</li>
                      <li>• Membangun jamaah yang solid dan harmonis</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Fasilitas Masjid
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Fasilitas Utama
                    </h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Ruang shalat utama</li>
                      <li>• Ruang wudhu</li>
                      <li>• Tempat parkir</li>
                      <li>• Sound system</li>
                      <li>• AC & Pencahayaan</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Fasilitas Pemulasaraan
                    </h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Memandikan</li>
                      <li>• Mengkafankan</li>
                      <li>• Menshalatkan</li>
                      <li>• Mengkuburkan</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Fasilitas Pendidikan
                    </h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Ruang TPQ</li>
                      <li>• Ruang TPA</li>
                      <li>• Perpustakaan Islam</li>
                      <li>• Multimedia pembelajaran</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white transition-all duration-300 hover:shadow-lg"
                  onClick={() => scrollToSection("kontak")}
                >
                  Hubungi Kami
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-800 mb-3">
              Hubungi <span className="text-emerald-600">Kami</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Silakan hubungi kami untuk informasi lebih lanjut tentang kegiatan
              masjid
            </p>
          </motion.div>

          <div className="flex justify-center gap-8">
            <div className="space-y-6 items-center">
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex">
                  <Phone className="w-5 h-5 mr-2 text-emerald-600" />
                  Kontak Utama
                </h3>
                <div className="space-y-3 justify-center">
                  <p className="text-gray-600">
                    <strong>Telepon:</strong> -
                  </p>
                  <p className="text-gray-600">
                    <strong>WhatsApp:</strong> 0813-8937-0881
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> masjid.alikhlas1726@gmail.com
                  </p>
                </div>
                <p className="text-gray-500 text-sm mt-3">
                  Senin - Jumat: 08:00 - 17:00
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 hover:shadow-lg"
              onClick={() =>
                window.open(
                  "https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20info%20lebih%20lanjut%20Masjid%20Al-Ikhlas",
                )
              }
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10-10S17.52 2 12 2zm3.52 5.71L12 11l-3.48 6.29 3.48 6.29 3.52-5.71L12 11l3.48-6.29z" />
                <path d="M12 4v1h4v1H8V4h-4z" />
                <path d="M16 13l-4 4 4 4 4-4-4z" />
                <path d="M16 13l-4 4 4 4 4-4-4z" />
                <path d="M16 13l-4 4 4 4 4-4-4z" />
              </svg>
              WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer currentPath="/tentang" />
    </div>
  );
}
