import { createServerClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  '';

type CookieStoreLike = {
  getAll: () => Array<{ name: string; value: string }>;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
};

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export const createServerSupabaseClient = (cookieStore: CookieStoreLike) =>
  createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
