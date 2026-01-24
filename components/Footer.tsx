"use client";

import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Facebook,
    Instagram,
    Youtube,
} from "lucide-react";
import Link from "next/link";

interface FooterProps {
    currentPath?: string;
}

export function Footer({ currentPath = "/" }: FooterProps) {
    const socialLinks = [
        {
            name: "Facebook",
            url: "https://facebook.com",
            icon: Facebook,
            color: "hover:text-blue-400",
        },
        {
            name: "Instagram",
            url: "https://instagram.com",
            icon: Instagram,
            color: "hover:text-pink-400",
        },
        {
            name: "YouTube",
            url: "https://youtube.com",
            icon: Youtube,
            color: "hover:text-red-400",
        },
    ];

    const quickLinks = [
        { name: "Beranda", url: "/" },
        { name: "Jadwal Shalat", url: "#jadwal-shalat" },
        { name: "Pengumuman", url: "#pengumuman" },
        { name: "Donasi", url: "#donasi" },
        { name: "Kontak", url: "#kontak" },
        { name: "Portal Staf (Cuti)", url: "/admin/cuti" },
    ];

    const handleScrollToSection = (sectionId: string) => {
        if (currentPath === "/") {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            window.location.href = `/${sectionId}`;
        }
    };

    return (
        <footer className="bg-gray-900 text-white py-8 md:py-12">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* About */}
                    <motion.div
                        className="sm:col-span-2 lg:col-span-1 space-y-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            <span className="text-3xl">🕌</span>
                            Masjid Al-Ikhlas
                        </div>
                        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                            Masjid Al-Ikhlas adalah rumah Allah yang terbuka untuk semua umat Muslim. Kami berkomitmen menyediakan tempat ibadah yang nyaman dan program-program yang bermanfaat untuk masyarakat Kayuringinjaya dan sekitarnya.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.url}
                                    className={`text-slate-400 ${social.color} transition-colors p-2 bg-slate-800 rounded-full hover:bg-slate-700`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h3 className="text-xl font-semibold text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">
                            Link Cepat
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    {link.url.startsWith("#") ? (
                                        <button
                                            onClick={() => handleScrollToSection(link.url)}
                                            className="text-slate-300 hover:text-emerald-400 transition-colors text-left hover:translate-x-1 transform duration-200 text-sm md:text-base"
                                        >
                                            {link.name}
                                        </button>
                                    ) : (
                                        <Link
                                            href={link.url}
                                            className="text-slate-300 hover:text-emerald-400 transition-colors text-left hover:translate-x-1 transform duration-200 text-sm md:text-base"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h3 className="text-xl font-semibold text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">
                            Kontak Kami
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 group">
                                <MapPin className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <p className="text-slate-300 text-sm md:text-base whitespace-pre-line">
                                    Jl. Utama Raya RT.002/RW.026, Kayuringinjaya, Bekasi Selatan, Kota Bekasi, Jawa Barat 17144
                                </p>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                                <a href="tel:081389370881" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm md:text-base">
                                    0813-8937-0881
                                </a>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <a href="mailto:masjid.alikhlas1726@gmail.com" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm md:text-base">
                                    masjid.alikhlas1726@gmail.com
                                </a>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <Clock className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                                <div className="text-slate-300 text-sm">
                                    <p className="font-medium text-emerald-200 uppercase text-xs mb-1">Operasional</p>
                                    <p>Buka 24 Jam (Ibadah)</p>
                                    <p className="text-slate-400 italic">Administrasi: 08:00 - 17:00</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs md:text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Masjid Al-Ikhlas. Semua hak dilindungi.
                    </p>
                    <div className="flex flex-wrap justify-center items-center space-x-6 text-slate-500 text-xs uppercase tracking-widest font-bold">
                        <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-emerald-400 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}