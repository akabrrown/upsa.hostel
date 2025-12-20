
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testNewAdmin() {
  const email = 'admin-fix@upsamail.edu.gh'
  const password = 'Option#4'
  
  console.log(`Testing creation for ${email}...`)

  const { data: roleData } = await supabaseAdmin.from('roles').select('id').eq('name', 'admin').single()
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  })

  if (error) {
    console.error('FAILED to create new admin:', error)
  } else {
    console.log('SUCCESS! Created:', data.user.id)
    
    // Sync
    await supabaseAdmin.from('users').insert({
      id: data.user.id,
      email,
      role_id: roleData.id
    })
    console.log('Synced to public.users')
  }
}

testNewAdmin()
