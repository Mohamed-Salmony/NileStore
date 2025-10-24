import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Client for end-user context using anon key. Used with a bearer token per request.
export function createUserSupabaseClient(accessToken?: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

// Server admin client using service role key.
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
