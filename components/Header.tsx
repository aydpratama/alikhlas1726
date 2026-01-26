"use client";

import { useState } from "react";
import {
    Menu,
    X,
    Home,
    Info,
    Image as ImageIcon,
    Heart,
    BookOpen,
    LogIn,
    MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MosqueIcon } from "@/components/MosqueIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navigationItems = [
        { label: "Beranda", icon: Home, href: "/" },
        { label: "Tentang", icon: Info, href: "/tentang" },
        { label: "Galeri", icon: ImageIcon, href: "/galeri" },
        { label: "Pemulasaraan", icon: Heart, href: "/pemulasaraan" },
        { label: "Info", icon: BookOpen, href: "/info" },
        { label: "Lain-lain", icon: MoreHorizontal, href: "/lain-lain" },
    ];

    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") return true;
        if (href !== "/" && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <header
            className="sticky top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-slate-200 shadow-sm"
            role="banner"
        >
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <Link
                    href="/"
                    className="flex items-center gap-3 group"
                    aria-label="Beranda Masjid Al-Ikhlas"
                >
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 hover:bg-emerald-700 transition-colors shadow-sm">
                        <MosqueIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none uppercase">Masjid Al-Ikhlas</h1>
                        <p className="text-label !text-emerald-700 mt-0.5">Kayuringin</p>
                    </div>
                </Link>

                {/* Desktop Navigation - Animated Pill */}
                <nav
                    className="hidden md:flex items-center gap-1"
                    role="navigation"
                >
                    {navigationItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 text-sm font-medium transition-colors rounded-full relative ${active ? "text-emerald-700" : "text-slate-600 hover:text-slate-900 hover:shadow-md"
                                    }`}
                            >
                                <span className="relative z-10">{item.label}</span>
                                {active && (
                                    <motion.div
                                        layoutId="header-active-pill"
                                        className="absolute inset-0 bg-emerald-100 rounded-md"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/login"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white hover:text-slate-900 transition-colors border border-slate-200 rounded-full bg-emerald-600 hover:bg-slate-50 hover:shadow-md active:scale-95"
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                    </Link>

                    {/* Mobile Menu Toggle - Morphing Icon */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-md rounded-full transition-all relative overflow-hidden active:scale-95"
                        aria-expanded={mobileMenuOpen}
                    >
                        <AnimatePresence mode="wait">
                            {mobileMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="w-5 h-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className="w-5 h-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Staggered Expansion */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden shadow-lg"
                    >
                        <div className="p-4 space-y-1">
                            {navigationItems.map((item, index) => {
                                const active = isActive(item.href);
                                return (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-medium transition-colors ${active
                                                ? "text-emerald-700 bg-emerald-50"
                                                : "text-slate-600 hover:bg-slate-50 hover:shadow-md"
                                                }`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <item.icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: navigationItems.length * 0.05 }}
                                className="pt-2 mt-2 border-t border-slate-200"
                            >
                                <Link
                                    href="/admin/login"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 hover:text-white"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LogIn className="w-4 h-4 text-white" />
                                    <span>Sign In</span>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}