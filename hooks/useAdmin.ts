"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAdminProfile, hasPermission, AdminProfile } from "@/lib/supabase/auth";

interface HookReturn {
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isMember: boolean;
    familyNo: string | null;
    isLoading: boolean;
    userEmail: string | null;
    canManageFinance: boolean;
    canManageDonors: boolean;
    canManageContent: boolean;
    canManageInfo: boolean;
    profile: AdminProfile | null;
    memberData: {
        id: number;
        nama: string;
        no_anggota: string;
        familyNo: string;
    } | null;
}

export function useAdmin(): HookReturn {
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [memberData, setMemberData] = useState<HookReturn['memberData']>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            try {
                // Check Supabase Session (Admin)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                
                if (session?.user) {
                    if (isMounted) setUserEmail(session.user.email || null);
                    const adminProfile = await getAdminProfile();
                    if (isMounted) setProfile(adminProfile);
                }

                // Check LocalStorage Session (Member)
                const savedMember = localStorage.getItem("member_session");
                if (savedMember && isMounted) {
                    setMemberData(JSON.parse(savedMember));
                }
            } catch (error) {
                console.error("Error loading admin profile hook:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserEmail(session.user.email || null);
                getAdminProfile().then(p => {
                    if (isMounted) setProfile(p);
                });
            } else {
                if (isMounted) {
                    setProfile(null);
                    setUserEmail(null);
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const isSuperAdmin = profile?.peran === 'super_admin';
    const canManageFinance = hasPermission(profile, 'bendahara');
    const canManageContent = hasPermission(profile, 'galeri');
    const canManageInfo = hasPermission(profile, 'info_struktur');
    const canManageDonors = hasPermission(profile, 'donatur');

    return { 
        isSuperAdmin, 
        isAdmin: !!profile,
        isMember: !!memberData, 
        familyNo: memberData?.familyNo || null, 
        isLoading, 
        userEmail, 
        canManageFinance,
        canManageDonors,
        canManageContent,
        canManageInfo,
        profile,
        memberData
    };
}
