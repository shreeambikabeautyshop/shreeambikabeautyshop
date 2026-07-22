-- Add unique constraint on session_id for visitor_analytics table
-- This is REQUIRED for upsert to work correctly in track/visit route

-- First, clean up any duplicate session_ids if they exist
DELETE FROM visitor_analytics a
USING visitor_analytics b
WHERE a.id > b.id 
  AND a.session_id = b.session_id;

-- Now add the unique constraint
ALTER TABLE visitor_analytics 
ADD CONSTRAINT visitor_analytics_session_id_key UNIQUE (session_id);

-- Verify the constraint is added
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE conname = 'visitor_analytics_session_id_key';
