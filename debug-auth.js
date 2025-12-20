
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('Missing env vars')
  process.exit(1)
}

// Admin client (for signup)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Public client (for login)
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

async function debugAuth() {
  const email = `auth_debug_${Date.now()}@example.com`
  const password = 'TestPassword123' // Simple known password

  console.log(`Testing full flow for: ${email}`)

  // 1. Create User via Admin
  console.log('1. Creating User...')
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (createError) {
    console.error('CRITICAL: Create failed:', createError)
    return
  }
  
  const userId = userData.user.id
  console.log(`   User created. ID: ${userId}`)
  console.log(`   Confirmed At: ${userData.user.email_confirmed_at}`)

  // 2. Try Login via Public Client
  console.log('2. Attempting Login...')
  const { data: loginData, error: loginError } = await supabasePublic.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) {
    console.error('CRITICAL: Login failed:', loginError)
    console.error('Details:', JSON.stringify(loginError, null, 2))
  } else {
    console.log('   SUCCESS: Login successful!')
    console.log('   Session received:', !!loginData.session)
  }

  // 3. Cleanup
  console.log('3. Cleanup...')
  await supabaseAdmin.auth.admin.deleteUser(userId)
  console.log('   Done.')
}

debugAuth()
