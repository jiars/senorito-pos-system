import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn('VITE_SUPABASE_SERVICE_ROLE_KEY is not defined in your .env file.');
}

// Create a supabase client with the service role key
// This bypasses RLS and allows admin actions (like creating a user silently)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
