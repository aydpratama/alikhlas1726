"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useDues(year: number) {
    const [dues, setDues] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshDues = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('view_rekap_iuran_tahunan')
            .select('*')
            .eq('tahun', year);

        if (!error && data) {
            setDues(data);
        } else {
            console.error("Error loading dues", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshDues();
    }, [year]);

    const updatePayment = async (data: any) => {
        console.log("Update payment", data);
        await refreshDues();
    };

    return {
        dues,
        isLoading,
        refreshDues,
        updatePayment,
        mutate: refreshDues
    };
}
