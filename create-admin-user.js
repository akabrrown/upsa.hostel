
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

async function createAdminUser() {
  const email = 'akayetb@upsamail.edu.gh'
  const password = 'Option#4'

  console.log(`Starting creation process for ${email}...`)

  // 1. Get Role ID
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'admin')
    .single()

  if (roleError) {
    console.error('Role lookup failed:', roleError)
    return
  }
  console.log('Role found:', roleData)

  // 2. Create Auth User
  // Instead of listing, we just try to create. 
  // If it fails because user exists, we'll try to update the password.
  let userId;
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  })

  if (authError) {
    if (authError.message.includes('already registered') || authError.status === 422) {
      console.log('User already exists in Auth. Listing users to find ID...')
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) {
        console.error('List users failed:', listError)
        return
      }
      const user = listData.users.find(u => u.email === email)
      if (!user) {
        console.error('User not found in list despite error')
        return
      }
      userId = user.id
      console.log('Found existing user ID:', userId)
      
      console.log('Updating password for existing user...')
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
      if (updateError) {
        console.error('Password update failed:', updateError)
        return
      }
    } else {
      console.error('Auth user creation failed:', authError)
      return
    }
  } else {
    userId = authData.user.id
    console.log('New auth user created:', userId)
  }

  // 3. Sync with public tables
  console.log('Syncing with public.users...')
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Upsert into public.users
  const { error: userSyncError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      email,
      password_hash: hashedPassword,
      role_id: roleData.id,
      is_active: true
    }, { onConflict: 'email' })

  if (userSyncError) {
    console.error('Public user sync failed:', userSyncError)
    return
  }
  console.log('Public user synced.')

  // 4. Create/Update Profile
  console.log('Syncing profile...')
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      user_id: userId,
      first_name: 'Admin',
      last_name: 'User',
      student_id: 'ADM-AKAYETB'
    }, { onConflict: 'user_id' })

  if (profileError) {
    console.error('Profile sync failed:', profileError)
    return
  }
  console.log('Profile synced.')

  console.log('--- DONE ---')
}

createAdminUser()
