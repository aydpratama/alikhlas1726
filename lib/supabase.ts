import { createClient } from '@supabase/supabase-js';

// Singleton pattern to avoid multiple instances of GoTrueClient
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase credentials missing. Check your .env.local or Vercel Environment Variables.");
  }

  supabaseInstance = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co', 
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  return supabaseInstance;
};

export const supabase = getSupabase();
