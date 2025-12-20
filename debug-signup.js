
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testSignup() {
  console.log('Testing Supabase Admin Client...')

  // 1. Get Role
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'student')
    .single()

  if (roleError) {
    console.error('Role lookup failed:', roleError)
    return
  }
  console.log('Role found:', roleData)

  // 2. Create User
  const email = `test_${Date.now()}@example.com`
  const indexNumber = `IDX${Date.now()}`.substring(0, 8)
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log('Attempting insert with:', { email, indexNumber, roleId: roleData.id })

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      password_hash: hashedPassword,
      index_number: indexNumber,
      role_id: roleData.id,
    })
    .select()
    .single()

  if (error) {
    console.error('User creation failed:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('User created successfully:', data)
    
    // Cleanup
    await supabaseAdmin.from('users').delete().eq('id', data.id)
    console.log('Cleanup done')
  }
}

testSignup()
