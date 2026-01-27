"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useMembers() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshMembers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('anggota_pemulasaraan').select('*').order('no_anggota', { ascending: true });
        if (!error && data) {
            setMembers(data);
        } else if (error) {
            console.error("Error fetching members:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshMembers();
    }, []);

    const addMember = async (data: any) => {
        const { error } = await supabase.from('anggota_pemulasaraan').insert(data);
        if (error) throw error;
        await refreshMembers();
    };

    const updateMember = async (id: number, data: any) => {
        const { error } = await supabase.from('anggota_pemulasaraan').update(data).eq('id', id);
        if (error) throw error;
        await refreshMembers();
    };

    const deleteMember = async (id: number) => {
        const { error } = await supabase.from('anggota_pemulasaraan').delete().eq('id', id);
        if (error) throw error;
        await refreshMembers();
    };

    return {
        members,
        isLoading,
        refreshMembers,
        addMember,
        updateMember,
        deleteMember,
        mutate: refreshMembers
    };
}
