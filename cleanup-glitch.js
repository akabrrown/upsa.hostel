
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cleanupUser() {
  const email = 'akayetb@upsamail.edu.gh'
  console.log(`Searching for ${email} in public.users...`)
  
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !userData) {
    console.error('User not found in public.users:', userError)
    // If not in public, we might be stuck since listUsers() fails.
    // Try to blindly delete the email if possible? (not available in SDK by email)
    return
  }

  const userId = userData.id
  console.log(`Found ID: ${userId}. Attempting to delete from Auth...`)

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (deleteError) {
    console.error('Auth deletion failed:', deleteError)
  } else {
    console.log('Auth user deleted.')
  }

  console.log('Deleting from public samples...')
  await supabaseAdmin.from('users').delete().eq('id', userId)
  console.log('Done cleanup.')
}

cleanupUser()
