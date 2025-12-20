
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function listAllUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    console.error('Error listing users:', error)
    return
  }
  console.log('--- Auth Users ---')
  data.users.forEach(u => {
    console.log(`ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at}`)
  })
}

listAllUsers()
