-- Enable Real-Time for beds table
-- This allows the frontend to listen for changes to bed availability
BEGIN;
  -- Add table to the publication
  -- Check if publication exists first to be safe, though Supabase has it by default
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'beds'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE beds;
    END IF;
  END
  $$;
COMMIT;
