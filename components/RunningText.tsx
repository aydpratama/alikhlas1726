"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function RunningText() {
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await (supabase
                .from('running_text') as any)
                .select('konten')
                .eq('aktif', true);

            if (data && (data as any[]).length > 0) {
                setMessages((data as any[]).map(m => m.konten));
            }
            setLoading(false);
        };
        fetchMessages();
    }, []);

    if (loading || messages.length === 0) return null;

    // Gabungkan teks agar menjadi satu string panjang untuk duplikasi
    const content = (
        <div className="flex gap-12 items-center px-6">
            {messages.map((text, i) => (
                <span key={i} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full shrink-0"></span>
                    {text}
                </span>
            ))}
        </div>
    );

    return (
        <div className="sticky top-16 z-40 bg-emerald-600 text-white overflow-hidden py-1.5">
            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex whitespace-nowrap text-xs font-bold items-center"
                    // Gunakan animate untuk looping dari 0 ke -50%
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        ease: "linear",
                        duration: 30, // Sesuaikan kecepatan di sini
                        repeat: Infinity,
                    }}
                >
                    {/* Render konten dua kali untuk efek loop tanpa putus */}
                    {content}
                    {content}
                </motion.div>
            </div>
        </div>
    );
}