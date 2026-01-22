import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Read the migration file
  const migrationPath = path.join(__dirname, '001_init_schema.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log('Running database migration...')

  try {
    // Execute the migration
    const { error } = await supabase.rpc('exec', {
      sql_string: sql,
    })

    if (error) {
      throw error
    }

    console.log('✅ Migration completed successfully!')
    console.log('')
    console.log('Created tables:')
    console.log('  - users')
    console.log('  - oauth_tokens')
    console.log('  - meetings')
    console.log('  - attendees')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Run: npm run dev')
    console.log('  2. Visit: http://localhost:3000')
    console.log('  3. Sign in with Google')
    console.log('  4. Click "Sync Calendar" on dashboard')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
