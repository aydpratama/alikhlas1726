"use client";

import { useState } from "react";

interface HookReturn {
    isSuperAdmin: boolean;
    isMember: boolean;
    familyNo: string | null;
    isLoading: boolean;
    userEmail: string | null;
    canManageFinance: boolean;
    canManageContent: boolean;
}

export function useAdmin(): HookReturn {
    // Mock or minimal implementation
    // Ideally this checks session in supabase

    const [isSuperAdmin, setIsSuperAdmin] = useState(true); 
    const [isMember, setIsMember] = useState(false);
    const [familyNo, setFamilyNo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [canManageFinance, setCanManageFinance] = useState(true);
    const [canManageContent, setCanManageContent] = useState(true);

    // TODO: Connect to real Supabase auth

    return { 
        isSuperAdmin, 
        isMember, 
        familyNo, 
        isLoading, 
        userEmail, 
        canManageFinance,
        canManageContent 
    };
}
