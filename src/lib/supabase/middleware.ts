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

export const createMiddlewareSupabaseClient = (
  requestCookies: CookieStoreLike,
  responseCookies: CookieStoreLike,
) =>
  createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return requestCookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          requestCookies.set(name, value, options);
          responseCookies.set(name, value, options);
        });
      },
    },
  });
