import { createClient as createBrowserClient } from './supabase/client';

export const supabase = createBrowserClient();
export { createClient } from './supabase/client';
export { createServerSupabaseClient } from './supabase/server';
export { createMiddlewareSupabaseClient } from './supabase/middleware';