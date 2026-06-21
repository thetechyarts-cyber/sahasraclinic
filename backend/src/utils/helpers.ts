import { supabase } from '../config/supabase';

/**
 * Resolves a given ID to a patient_profiles.id.
 * If the provided ID is a user_id from the users table, it queries and returns the associated patient_profiles.id.
 * If the provided ID is already a patient_profiles.id (or not found as a user_id), it returns the original ID.
 */
export const resolvePatientId = async (id: string): Promise<string> => {
  const { data: profile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', id)
    .maybeSingle();

  return profile ? profile.id : id;
};
