import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('CRITICAL WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Set these env vars in Railway. Auth and DB will not work.');
}

let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl ?? 'https://placeholder.supabase.co', supabaseServiceKey ?? 'placeholder');
  console.log(`[Supabase] Initialized with URL: ${supabaseUrl ?? 'PLACEHOLDER - NOT CONFIGURED'}`);
} catch (err) {
  console.error('[Supabase] Failed to initialize client:', err);
  // Create a dummy client so imports don't crash the server
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
}
export { supabase };

/**
 * Extract the user from the authorization header (JWT)
 */
export async function getUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}
