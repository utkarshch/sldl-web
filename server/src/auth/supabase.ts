import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('CRITICAL WARNING: Missing Supabase URL or Service Role Key. Auth will fail.');
  // Do not exit, allow server to start for debugging
}

console.log(`[Supabase] Initializing with URL: ${supabaseUrl}`);

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
