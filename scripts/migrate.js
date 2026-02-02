#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

// Load .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Make sure .env.local is properly configured.')
  process.exit(1)
}

// Migration files in order (from supabase/migrations)
const migrations = [
  '01_users_and_oauth.sql',
  '02_meetings_and_attendees.sql',
  '03_subscription_and_credits.sql',
  '04_rls_policies.sql',
  '20260131_enable_rls.sql',
  '20260202_fix_oauth_callback.sql',
]

async function runMigration(migrationFile) {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, '../supabase/migrations', migrationFile)

    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Skipping ${migrationFile} (file not found)`)
      resolve()
      return
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log(`🔄 Running: ${migrationFile}`)

    // Use Supabase SQL API endpoint
    const url = new URL(supabaseUrl)
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${migrationFile} failed (Status: ${res.statusCode}): ${data}`))
        } else {
          console.log(`✅ ${migrationFile} completed`)
          resolve()
        }
      })
    })

    req.on('error', reject)

    const body = JSON.stringify({ query: sql })
    req.write(body)
    req.end()
  })
}

async function runAllMigrations() {
  console.log('🚀 Running PrepFor.app database migrations...')
  console.log('')

  try {
    for (const migration of migrations) {
      await runMigration(migration)
    }

    console.log('')
    console.log('✅ All migrations completed successfully!')
    console.log('')
    console.log('Created tables:')
    console.log('  - users')
    console.log('  - oauth_tokens')
    console.log('  - meetings')
    console.log('  - attendees')
    console.log('')
    console.log('Applied:')
    console.log('  - RLS policies for data isolation')
    console.log('  - Table permissions for authenticated role')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Run: npm run dev')
    console.log('  2. Visit: http://localhost:3000')
    console.log('  3. Sign in with Google')
    console.log('  4. Click "Sync Calendar" on dashboard')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runAllMigrations()
