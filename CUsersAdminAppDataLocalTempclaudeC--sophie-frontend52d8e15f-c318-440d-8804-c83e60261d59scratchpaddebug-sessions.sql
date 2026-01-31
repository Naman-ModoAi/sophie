-- Check how many users exist
SELECT COUNT(DISTINCT id) as total_users, COUNT(DISTINCT email) as unique_emails 
FROM users;

-- Check OAuth tokens - are multiple users sharing the same token?
SELECT 
  user_id,
  provider,
  LEFT(access_token, 20) as token_preview,
  expires_at,
  created_at
FROM oauth_tokens
ORDER BY created_at DESC;

-- Check if multiple users have the same email
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Check meetings - which users have meetings?
SELECT 
  u.email,
  u.id as user_id,
  COUNT(m.id) as meeting_count
FROM users u
LEFT JOIN meetings m ON m.user_id = u.id
GROUP BY u.id, u.email
ORDER BY meeting_count DESC;
