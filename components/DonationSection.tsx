"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CreditCard,
  QrCode,
  HandCoins,
  Copy,
  CheckCircle,
  Info,
  ShieldCheck,
} from "lucide-react";

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
  color: string;
}

interface DonationMethod {
  id: string;
  title?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  content: React.ReactNode;
}

interface DonationSectionProps {
  className?: string;
}

export function DonationSection({ className = "" }: DonationSectionProps) {
  const [activeMethod, setActiveMethod] = useState("transfer");
  const [copiedAccount, setCopiedAccount] = useState("");

  // Bank accounts data
  const bankAccounts: BankAccount[] = [
    {
      bank: "Bank BRI",
      accountNumber: "162301000279569",
      accountName: "Masjid Al Ikhlas 1726",
      color: "blue",
    },
  ];

  // Copy to clipboard function
  const copyToClipboard = (text: string, account: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(account);
    setTimeout(() => setCopiedAccount(""), 2000);
  };

  // Donation methods data
  const donationMethods: DonationMethod[] = [
    {
      id: "transfer",
      icon: CreditCard,
      color: "emerald",
      content: (
        <div className="space-y-4">
          {bankAccounts.map((account, index) => (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {account.bank}
                  </h4>
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
                      {account.accountNumber}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          account.accountNumber,
                          `${account.bank}-number`,
                        )
                      }
                      className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all border border-slate-200"
                    >
                      {copiedAccount === `${account.bank}-number` ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1.5 ml-1 uppercase">
                    Nama Rekening
                  </p>
                  <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <span className="font-bold text-slate-900 text-sm">
                      {account.accountName}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          account.accountName,
                          `${account.bank}-name`,
                        )
                      }
                      className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all border border-slate-200"
                    >
                      {copiedAccount === `${account.bank}-name` ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex gap-3">
            <Info className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              <strong>Konfirmasi:</strong> Setelah transfer, mohon konfirmasi
              melalui WhatsApp dengan mengirimkan bukti transfer beserta nama
              dan nominal donasi.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "qris",
      title: "QRIS",
      icon: QrCode,
      color: "emerald",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-emerald-100 text-center shadow-inner">
            <div className="relative w-48 h-48 mx-auto bg-slate-50 rounded-xl flex items-center justify-center mb-6 overflow-hidden border border-slate-200">
              {/* QR Code Placeholder or Real Image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                <QrCode className="w-20 h-20 text-slate-200 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  QRIS MASJID AL IKHLAS
                </p>
              </div>
              <Image
                src="/QRIS_Alikhlas.jpg"
                alt="QR Code Donasi"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">
              Scan QRIS untuk Berdonasi
            </p>
            <p className="text-[9px] font-medium text-slate-400 uppercase">
              Dapat discan dengan E-Wallet & M-Banking
            </p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              <strong>Praktis & Aman:</strong> Donasi langsung masuk ke rekening
              resmi masjid tanpa perlu input nomor rekening secara manual.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "cash",
      title: "Tunai",
      icon: HandCoins,
      color: "emerald",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <HandCoins className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-3 text-sm">
                Kotak Amal
              </h4>
              <ul className="text-xs text-slate-600 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Tersedia di area utama masjid
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Buka 24 jam setiap hari
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Aman dan terpercaya
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Pelaporan berkala mingguan
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <HandCoins className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-3 text-sm">
                Kepada Pengurus
              </h4>
              <ul className="text-xs text-slate-600 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Kunjungi kantor Takmir
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Melalui bendahara masjid
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Dapatkan kwitansi resmi
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Pencatatan otomatis ke sistem
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="donasi" className={`py-12 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] font-black tracking-[0.3em] text-emerald-600 mb-2">
            Infaq & Sedekah
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
            Pintu Kebaikan{" "}
            <span className="text-emerald-600 text-shadow-sm">Donasi</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Dukung operasional dan pemeliharaan masjid dengan memberikan infaq
            terbaik Anda melaui saluran resmi berikut.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-md mx-auto mb-8">
          {donationMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveMethod(method.id)}
              className={`flex-1 flex items-center justify-center gap-2 h-11 sm:h-10 rounded-lg text-xs font-bold transition-all ${activeMethod === method.id
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              <method.icon
                className={`w-4 h-4 ${activeMethod === method.id ? "text-emerald-600" : "text-slate-400"}`}
              />
              <span className="whitespace-nowrap">{method.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {donationMethods.find((m) => m.id === activeMethod)?.title}
              </h3>
            </div>

            <motion.div
              key={activeMethod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto"
            >
              {donationMethods.find((m) => m.id === activeMethod)?.content}
            </motion.div>
          </div>
        </div>

        {/* Footer Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-white rounded-md p-8 border border-slate-200 shadow-xl shadow-slate-200/30 text-center relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600 opacity-20" />

          <h3 className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-700 tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Transparansi & Amanah
          </h3>
          <p className="text-sm text-slate-600 font-medium mb-8 max-w-xl mx-auto leading-relaxed">
            Setiap donasi yang masuk dipertanggungjawabkan secara transparan
            melalui laporan keuangan mingguan dan bulanan yang dapat diakses
            publik.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-400 tracking-wider">
            <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-md border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Rekening Resmi</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-md border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Audit Terbuka</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-md border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Penggunaan Tepat</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
