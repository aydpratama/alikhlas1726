"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Sunrise, Sun, SunMedium, Sunset, Moon } from "lucide-react";

interface PrayerTimes {
    Subuh: string;
    Dzuhur: string;
    Ashar: string;
    Maghrib: string;
    Isya: string;
}

const PrayerTimesStrip: React.FC = () => {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [hijriDate, setHijriDate] = useState<{ day: string; month: string; year: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPrayerName, setCurrentPrayerName] = useState<string>("");
    const [nextPrayerName, setNextPrayerName] = useState<string>("");
    const [countdown, setCountdown] = useState<number>(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Bekasi&country=Indonesia&method=2');
                const data = await res.json();
                if (data.status === 'OK') {
                    const t = data.data.timings;
                    setPrayerTimes({
                        Subuh: t.Fajr,
                        Dzuhur: t.Dhuhr,
                        Ashar: t.Asr,
                        Maghrib: t.Maghrib,
                        Isya: t.Isha,
                    });
                    const h = data.data.date.hijri;
                    setHijriDate({ day: h.day, month: h.month.en, year: h.year });
                }
                setLoading(false);
            } catch (e) { console.error(e); setLoading(false); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!prayerTimes) return;
        const now = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
        const pArr = [
            { name: "Subuh", t: prayerTimes.Subuh },
            { name: "Dzuhur", t: prayerTimes.Dzuhur },
            { name: "Ashar", t: prayerTimes.Ashar },
            { name: "Maghrib", t: prayerTimes.Maghrib },
            { name: "Isya", t: prayerTimes.Isya },
        ].map(p => {
            const [h, m] = p.t.split(':').map(Number);
            return { ...p, s: h * 3600 + m * 60 };
        });

        let next = null;
        let curr = "";
        for (let i = 0; i < pArr.length; i++) {
            if (now < pArr[i].s) {
                next = pArr[i];
                curr = i === 0 ? "Isya" : pArr[i - 1].name;
                break;
            }
        }
        if (!next) {
            next = { ...pArr[0], s: pArr[0].s + 86400 };
            curr = "Isya";
        }

        setCurrentPrayerName(curr);
        setNextPrayerName(next.name);
        const diff = next.s - now;
        setCountdown(diff > 0 ? diff : diff + 86400);
    }, [prayerTimes, currentTime]);

    const formatCountdown = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}j ${m}m`;
        if (m > 0) return `${m}m ${s}d`;
        return `${s}d`;
    };

    const getIcon = (name: string) => {
        const iconClass = "w-4 h-4 md:w-5 md:h-5";
        switch (name) {
            case 'Subuh': return <Sunrise className={`${iconClass} text-amber-500`} />;
            case 'Dzuhur': return <Sun className={`${iconClass} text-orange-400`} />;
            case 'Ashar': return <SunMedium className={`${iconClass} text-amber-600`} />;
            case 'Maghrib': return <Sunset className={`${iconClass} text-orange-600`} />;
            case 'Isya': return <Moon className={`${iconClass} text-blue-400`} />;
            default: return <Clock className={iconClass} />;
        }
    };

    return (
        <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-md p-3 md:p-6 shadow-sm">
            <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6">
                {/* Prayer List */}
                <div className="flex-1 grid grid-cols-5 gap-1 md:gap-3 w-full">
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 md:h-24 bg-slate-100 animate-pulse rounded-md" />
                        ))
                    ) : (
                        prayerTimes && Object.entries(prayerTimes).map(([name, time]) => {
                            const isCurrent = currentPrayerName === name;
                            const isNext = nextPrayerName === name;

                            return (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-2 md:p-4 text-center flex flex-col justify-center rounded-md transition-all duration-300 ${isCurrent
                                        ? 'bg-emerald-50 border-2 border-emerald-200 shadow-sm'
                                        : isNext
                                            ? 'bg-slate-50 border border-slate-200'
                                            : 'bg-transparent'
                                        }`}
                                >
                                    {/* Prayer Name with Icon */}
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 mb-1 md:mb-2">
                                        {getIcon(name)}
                                        <span className={`capitalize font-medium text-[9px] md:text-sm leading-tight ${isCurrent ? 'text-emerald-700' : 'text-slate-600'
                                            }`}>
                                            {name}
                                        </span>
                                    </div>

                                    {/* Time */}
                                    <div className={`font-mono text-xs md:text-2xl font-bold leading-tight tabular-nums ${isCurrent ? 'text-emerald-900' : 'text-slate-900'
                                        }`}>
                                        {time}
                                    </div>

                                    {/* Current Prayer Info */}
                                    {isCurrent && (
                                        <div className="text-[8px] md:text-xs text-emerald-600 mt-1 md:mt-2 font-semibold leading-tight">
                                            Sekarang
                                        </div>
                                    )}

                                    {/* Next Prayer Info */}
                                    {isNext && countdown > 0 && (
                                        <div className="text-[8px] md:text-xs text-amber-600 mt-1 md:mt-2 font-semibold leading-tight">
                                            {formatCountdown(countdown)}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Date Box */}
                <div className="shrink-0 w-full md:w-auto px-4 md:px-6 py-3 md:py-4 bg-emerald-50 border border-emerald-100 rounded-md text-center min-w-[180px]">
                    {loading ? (
                        <div className="h-8 w-24 bg-emerald-100 animate-pulse mx-auto rounded" />
                    ) : (
                        <>
                            <p className="text-[10px] md:text-xs font-bold text-emerald-700 uppercase tracking-wide mb-0.5">
                                {hijriDate ? `${hijriDate.day} ${hijriDate.month.slice(0, 3)} ${hijriDate.year}H` : "---"}
                            </p>
                            <p className="text-xs md:text-sm font-medium text-slate-700">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const HeroBanner: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-[550px] sm:h-[650px] lg:h-[800px] rounded-md overflow-hidden shadow-xl"
    >
        <Image src="/alikhlas-malam.png" alt="Hero" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/20 to-transparent flex items-center p-8 md:p-16">
            <div className="max-w-2xl text-white space-y-6">
                <h1 className="text-3xl sm:text-6xl font-bold !text-white leading-[1.1] tracking-tight">
                    Kedamaian Hati di <br />
                    <span className="text-emerald-400">Masjid Al-Ikhlas</span>
                </h1>
                <p className="text-data !text-white font-medium max-w-lg leading-relaxed">
                    Wujudkan keshalehan sosial dan spiritual melalui berbagai program dakwah dan pemberdayaan umat yang inklusif.
                </p>
                <div className="flex gap-3 pt-2">
                    <button className="bg-emerald-600 px-6 py-2.5 rounded-full text-label !text-white shadow-xl hover:shadow-md active:scale-95 transition-all">Tentang Kami</button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-label !text-white hover:shadow-md active:scale-95 transition-all">Jadwal Kajian</button>
                </div>
            </div>
        </div>
    </motion.div>
);

export function Hero() {
    return (
        <div className="px-3 sm:px-6 space-y-8">
            <HeroBanner />
            <PrayerTimesStrip />
        </div>
    );
}
