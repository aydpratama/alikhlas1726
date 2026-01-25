import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("⚠️ Supabase credentials missing in createClient. Check your .env.local or Vercel Environment Variables.");
    }

    return createSupabaseClient(
        supabaseUrl || 'https://placeholder-url.supabase.co', 
        supabaseAnonKey || 'placeholder-key'
    );
}
