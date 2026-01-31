-- Check RLS policies on meetings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'meetings'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'meetings' AND schemaname = 'public';

-- Check meetings for multiple users
SELECT user_id, COUNT(*) as meeting_count
FROM meetings
GROUP BY user_id;
