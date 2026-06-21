import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Supabase client for frontend — uses the public anon key.
 * Does NOT bypass RLS — all data access governed by policies.
 */
export const supabase = createClientComponentClient();
