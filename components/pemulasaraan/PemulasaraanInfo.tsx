"use client";

import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Flower2,
  Copy,
  MapPin,
  Heart,
  HandHelping,
  Shield,
  Star,
  Info,
  CheckCircle2,
  QrCode,
  HandCoins,
  Ambulance,
  Map,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function InfoView({ onRegister }: { onRegister: () => void }) {
  const [copied, setCopied] = useState("");
  const [activeTab, setActiveTab] = useState("transfer");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const paymentMethods = [
    {
      id: "transfer",
      title: "Transfer",
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Bank BRI</h4>
              </div>
              <div className="relative h-4 w-12">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg"
                  alt="BRI"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1.5 ml-1 uppercase">
                  Nomor Rekening
                </p>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                  <span className="font-mono font-bold text-base text-slate-900">
                    725401029653531
                  </span>
                  <button
                    onClick={() => handleCopy("725401029653531", "acc-num")}
                    className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all border border-slate-100"
                  >
                    {copied === "acc-num" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1.5 ml-1 uppercase">
                  Atas Nama
                </p>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                  <span className="font-bold text-slate-900 text-sm">
                    PEMULASARAAN AL IKHLAS
                  </span>
                  <button
                    onClick={() =>
                      handleCopy("PEMULASARAAN AL IKHLAS", "acc-name")
                    }
                    className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all border border-slate-100"
                  >
                    {copied === "acc-name" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "qris",
      title: "QRIS",
      icon: QrCode,
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-emerald-100 text-center shadow-inner">
            <div className="relative w-48 h-48 mx-auto bg-slate-50 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-slate-100">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                <QrCode className="w-20 h-20 text-slate-200 mb-2" />
                <p className="text-[10px] font-bold text-slate-400">
                  QRIS PEMULASARAAN
                </p>
              </div>
              <Image
                src="/QRIS_Pemulasaraan.jpg"
                alt="QR Code Pemulasaraan"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-wider uppercase">
              Dapat discan dengan E-Wallet & M-Banking
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["GoPay", "OVO", "DANA", "LinkAja", "BCA"].map((app) => (
                <span
                  key={app}
                  className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full text-[9px] font-bold border border-slate-100"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cash",
      title: "Tunai",
      icon: HandCoins,
      content: (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <HandCoins className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm">
              Pembayaran Langsung
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Serahkan tunai kepada pengurus pemulasaraan (Pak Imam Mahmudi
                dan Pak Sudiat)
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-10 pb-20 px-4"
    >
      {/* Hero / Definition Section */}
      <motion.div variants={itemVariants} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[1.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white rounded-[2.2rem] p-8 sm:p-12 shadow-xl border border-emerald-50 overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Flower2 size={240} className="text-emerald-900" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-widest border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
              Syariat Islam
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              Pemulasaraan Jenazah <br />
              <span className="text-emerald-600">Al-Ikhlas</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              Penyelenggaraan pengurusan Jenazah sesuai syariat Islam, yang
              meliputi:
            </p>

            {/* Manfaat Utama - 4 Pilar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-2">
              {[
                { icon: Heart, label: "Memandikan", color: "rose" },
                { icon: HandHelping, label: "Mengkafankan", color: "blue" },
                { icon: Shield, label: "Mensholatkan", color: "emerald" },
                { icon: MapPin, label: "Memakamkan", color: "violet" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-emerald-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100/50 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-colors"
                >
                  <div
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-500 mb-2 sm:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-5 h-5 sm:w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-[10px] sm:text-sm">
                    {item.label}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Syarat Menjadi Anggota */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Syarat Menjadi Anggota
          </h2>
        </div>
        <div className="grid gap-3">
          {[
            "Warga harus beragama Islam",
            "Berdomisili di RW 17 dan 26 Kayuringinjaya",
            "Mendaftar menjadi anggota dan memenuhi kewajiban yang telah ditetapkan",
            "Membayar iuran yang telah ditetapkan",
          ].map((text, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl border border-slate-200/50 group hover:border-emerald-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dua Jenis Keanggotaan */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Pilihan Keanggotaan
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Informasi iuran dan pendaftaran anggota Al-Ikhlas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 px-1">
          {/* Anggota Tetap */}
          <div className="bg-white rounded-[2rem] p-8 text-gray-900 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Star size={100} fill="currentColor" />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-black uppercase tracking-widest text-black">
                Anggota Tetap
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Kepala Keluarga:
                  </p>
                  <p className="text-3xl font-black text-emerald-600">
                    Rp. 1.000.000
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Anggota Keluarga:
                  </p>
                  <p className="text-2xl font-black">
                    Rp. 800.000{" "}
                    <span className="text-xs text-gray-500">per kepala</span>
                  </p>
                </div>
                <p className="text-[10px] font-black italic text-gray-500 bg-white/10 px-3 py-2 rounded-xl inline-block mt-4 uppercase tracking-tighter">
                  (dibayar hanya 1 kali seumur hidup)
                </p>
              </div>
            </div>
          </div>

          {/* Anggota Umum */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-600 transition-colors">
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest text-emerald-600">
                Anggota Umum
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Pendaftaran:
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    Rp. 30.000{" "}
                    <span className="text-xs text-gray-500 font-bold">
                      per kepala
                    </span>
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Bulanan:
                  </p>
                  <p className="text-3xl font-black text-emerald-600">
                    Rp. 5.000
                  </p>
                </div>
                <p className="text-[10px] font-black italic text-gray-500 bg-gray-50 px-3 py-2 rounded-xl inline-block mt-4 uppercase tracking-tighter">
                  (dibayar setiap bulan seumur hidup)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4 shadow-sm mx-1">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Sanksi
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed font-bold italic opacity-90">
              Dianggap mengundurkan diri apabila enam (6) bulan berturut-turut
              tidak membayar iuran. Uang sebagai infaq dan tidak dikembalikan
              sesuai dengan keputusan rapat anggota.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hak Menjadi Anggota - Style Matched to Syarat */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Hak Menjadi Anggota
          </h2>
        </div>

        <div className="grid gap-3">
          {[
            "Mendapatkan pemulasaraan yang meliputi kain kafan, kapas, sabun, minyak, tikar dan papan.",
            "Mendapatkan layanan seperti Memandikan, Mengkafankan, Mensholatkan and Menguburkan hingga doa terakhir.",
            "Mendapatkan layanan kebersihan pasca memandikan jenazah.",
            "Mendapatkan layanan mobil ambulance dalam kota Bekasi secara gratis.",
          ].map((text, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl border border-slate-200/50 group hover:border-emerald-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Info Biaya Non-Anggota & Footnote inside same box for cleanliness */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 space-y-2">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Ketentuan Non-Anggota
              </p>
            </div>
            <p className="text-[13px] text-rose-900 font-bold leading-relaxed italic opacity-90">
              Apabila bukan anggota pemulasaraan dan meminta bantuan Al Ikhlas,
              maka dikenakan biaya Rp 2.000.000 (pengganti Rp 1.700.000 and
              infaq Rp 300.000)
            </p>
          </div>

          <div className="flex items-center gap-3 px-2">
            <Info className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-[11px] text-gray-500 font-bold leading-tight">
              Note: Yang perlu dipersiapkan oleh yang berduka yaitu : bunga
              untuk di makam dan urusan pemakaman (ijin dan gali makam).
            </p>
          </div>
        </div>
      </motion.div>

      {/* Manfaat Tambahan Ambulance */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Ambulance className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Manfaat Tambahan Ambulance
          </h2>
        </div>

        <div className="grid gap-3">
          {[
            {
              title: "Berobat Dalam Kota Bekasi",
              desc: "Hanya membayar Rp 200.000 (bensin and Sopir)",
            },
            {
              title: "Luar Kota",
              desc: "Berobat atau mengantar Jenazah Luar Kota, membayar Rp 6.000 per KM (1.500 untuk Sopir)",
            },
            {
              title: "Bukan Anggota",
              desc: "Penggunaan Ambulance oleh BUKAN Anggota dengan TARIF Rp 8.000 per KM",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 group hover:border-emerald-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  {item.title}
                </p>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cara Mendaftar Step by Step */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Cara Mendaftar
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">
              1
            </div>
            <h4 className="font-bold text-gray-900">Mandiri</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Klik tombol "Daftar" di bawah ini.
            </p>
            <div className="pt-4">
              <button
                onClick={onRegister}
                className="w-full sm:w-auto h-11 sm:h-10 bg-emerald-600 text-white px-5 rounded-lg font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-all shadow-sm active:scale-95 group/btn text-[11px] sm:text-xs"
              >
                Daftar Sekarang
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">
              2
            </div>
            <h4 className="font-bold text-gray-900">Melalui RT Setempat</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Mengisi formulir yang telah disediakan, kemudian membayar melalui
              RT atau transfer ke rekening.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">
              3
            </div>
            <h4 className="font-bold text-gray-900">Langsung ke Pengurus</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Mengisi formulir melalui pengurus pemulasaraan masjid, kemudian
              membayar tunai atau transfer.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Rekening Pembayaran & Pendaftaran Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Metode Pembayaran
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Pilih metode pembayaran yang paling memudahkan Anda
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-md mx-auto">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActiveTab(method.id)}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 sm:h-10 rounded-lg text-xs font-bold transition-all ${
                    activeTab === method.id
                      ? "bg-white text-emerald-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <method.icon
                    className={`w-4 h-4 ${activeTab === method.id ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <span>{method.title}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto"
            >
              {paymentMethods.find((m) => m.id === activeTab)?.content}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Struktur Organisasi - Simple & Clean */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="text-center px-4">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Struktur Pemulasaraan
          </h2>
          <div className="h-1 w-12 bg-emerald-600 rounded-full mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
          {[
            { name: "Kamiso", role: "Koordinator" },
            { name: "Imam Mahmudi", role: "Bidang", phone: "0813-1656-0269" },
            { name: "Edi Prawoto", role: "Sekertaris" },
            { name: "Sudiat", role: "Bendahara", phone: "0852-8958-6578" },
          ].map((person, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-0.5 hover:border-emerald-200 transition-colors shadow-sm"
            >
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                {person.role}
              </p>
              <p className="text-[13px] font-black text-gray-900 leading-tight">
                {person.name}
              </p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <a href="https://wa.me/{person.phone}" target="_blank">
                  {person.phone}
                </a>
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Final Call to Action */}
      <motion.div variants={itemVariants} className="pt-10 pb-6">
        <div className="bg-emerald-50 rounded-[1.5rem] p-8 sm:p-12 text-center border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <Map size={300} className="absolute -top-20 -left-20 rotate-12" />
            <CheckCircle2
              size={300}
              className="absolute -bottom-20 -right-20 -rotate-12"
            />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Siap Menjadi Anggota?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
                Bergabunglah bersama ratusan warga lainnya dalam program gotong
                royong pemulasaraan Al-Ikhlas.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Tagline */}
      <motion.div
        variants={itemVariants}
        className="text-center pt-6 opacity-30"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">
          Amanah • Syar'i • Khidmat
        </p>
      </motion.div>
    </motion.div>
  );
}
