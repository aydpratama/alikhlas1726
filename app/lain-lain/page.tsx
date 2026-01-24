"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import LeaveManagementClient from "@/components/cuti/LeaveManagementClient";
import { Calendar, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function OthersPage() {
    const [activeTab, setActiveTab] = useState("cuti");

    const tabs = [
        { id: "cuti", label: "Cuti Karyawan", icon: Calendar },
        // Future tabs can be added here
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "cuti":
                return <LeaveManagementClient />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <MoreHorizontal className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">Konten belum tersedia</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lain-lain</h1>
                    <p className="text-sm text-slate-500 mt-1">Kumpulan fitur dan informasi tambahan</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit mb-8">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all relative ${
                                    isActive ? "text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-tab-others"
                                        className="absolute inset-0 bg-white rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <tab.icon className={`w-4 h-4 relative z-10 ${isActive ? "text-emerald-600" : ""}`} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="min-h-[400px]">
                    {renderContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
