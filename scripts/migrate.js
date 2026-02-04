#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const migrationsDir = path.join(__dirname, '../supabase/migrations')

// Get all SQL migration files sorted by numeric prefix
function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0', 10)
      const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0', 10)
      return numA - numB
    })
}

// Combine all migrations into a single SQL file
function combineMigrations() {
  const migrations = getMigrationFiles()
  let combined = `-- Combined migrations generated on ${new Date().toISOString()}\n`
  combined += `-- Total migrations: ${migrations.length}\n\n`

  for (const file of migrations) {
    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    combined += `-- ============================================\n`
    combined += `-- Migration: ${file}\n`
    combined += `-- ============================================\n\n`
    combined += content
    combined += `\n\n`
  }

  return { combined, migrations }
}

// Run using Supabase CLI
async function runWithSupabaseCLI() {
  console.log('🔗 Checking Supabase CLI link status...\n')

  try {
    // Check if project is linked
    execSync('supabase projects list', { stdio: 'pipe' })
  } catch (error) {
    console.error('❌ Supabase CLI not authenticated or linked.')
    console.error('')
    console.error('To set up:')
    console.error('  1. Run: supabase login')
    console.error('  2. Run: supabase link --project-ref <your-project-ref>')
    console.error('')
    console.error('Find your project ref in the Supabase dashboard URL:')
    console.error('  https://supabase.com/dashboard/project/<project-ref>')
    process.exit(1)
  }

  console.log('🚀 Pushing migrations to remote Supabase...\n')

  try {
    execSync('supabase db push', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    console.log('\n✅ Migrations pushed successfully!')
  } catch (error) {
    console.error('\n❌ Migration push failed')
    process.exit(1)
  }
}

// Generate combined SQL file for manual execution
function generateCombinedFile() {
  const { combined, migrations } = combineMigrations()
  const outputPath = path.join(__dirname, '../supabase/combined_migrations.sql')

  fs.writeFileSync(outputPath, combined)

  console.log(`✅ Generated combined migration file with ${migrations.length} migrations`)
  console.log(`📄 File: supabase/combined_migrations.sql`)
  console.log('')
  console.log('To apply:')
  console.log('  1. Open Supabase Dashboard → SQL Editor')
  console.log('  2. Paste the contents of combined_migrations.sql')
  console.log('  3. Click "Run"')
  console.log('')
  console.log('Included migrations:')
  migrations.forEach(m => console.log(`  - ${m}`))
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('📂 MeetReady Database Migration Tool')
  console.log('======================================\n')

  const migrations = getMigrationFiles()
  console.log(`Found ${migrations.length} migration files in supabase/migrations/\n`)

  if (command === 'push' || command === 'cli') {
    // Use Supabase CLI to push to remote
    await runWithSupabaseCLI()
  } else if (command === 'generate' || command === 'combine') {
    // Generate combined SQL file
    generateCombinedFile()
  } else if (command === 'list') {
    // Just list migrations
    console.log('Migration files (in order):')
    migrations.forEach((m, i) => console.log(`  ${i + 1}. ${m}`))
  } else {
    // Show help
    console.log('Usage: npm run migrate <command>\n')
    console.log('Commands:')
    console.log('  push      Push migrations to remote Supabase using CLI')
    console.log('  generate  Generate combined SQL file for manual execution')
    console.log('  list      List all migration files')
    console.log('')
    console.log('Examples:')
    console.log('  npm run migrate push      # Push to hosted Supabase')
    console.log('  npm run migrate generate  # Create combined SQL file')
    console.log('')
    console.log('Setup for "push" command:')
    console.log('  1. supabase login')
    console.log('  2. supabase link --project-ref <your-project-ref>')
    console.log('  3. npm run migrate push')
  }
}

main().catch(console.error)
