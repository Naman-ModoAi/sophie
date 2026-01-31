-- Check current state
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('tokens_used_this_month', 'total_tokens_used', 'last_token_reset_at')
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'token_usage' 
  AND column_name IN ('total_tokens', 'thoughts_tokens', 'web_search_queries')
ORDER BY column_name;
