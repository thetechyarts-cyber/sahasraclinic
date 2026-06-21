-- Migration 007: Auto Archive Cron Job
-- Uses pg_cron to archive patients with no activity in the last 4 months.

-- Note: pg_cron extension must be enabled in your database.
-- In Supabase, you can enable it via Database -> Extensions.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to archive inactive patients
CREATE OR REPLACE FUNCTION archive_inactive_patients()
RETURNS void AS $$
BEGIN
  -- Update patients where the last updated_at is older than 4 months
  -- and status is currently 'active'
  UPDATE patient_profiles
  SET 
    status = 'archived',
    archived_at = now()
  WHERE 
    status = 'active'
    AND updated_at < now() - INTERVAL '4 months';
END;
$$ LANGUAGE plpgsql;

-- Schedule the job to run every night at 2:00 AM
SELECT cron.schedule(
  'archive-inactive-patients-nightly',
  '0 2 * * *',
  'SELECT archive_inactive_patients();'
);
