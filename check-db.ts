import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCounts() {
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { data: roles } = await supabase.from('roles').select('*')
  const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: roomCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true })
  const { count: accCount } = await supabase.from('accommodations').select('*', { count: 'exact', head: true })
  const { count: paymentCount } = await supabase.from('payments').select('*', { count: 'exact', head: true })

  console.log('--- Database Counts ---')
  console.log('Users:', userCount)
  console.log('Roles:', JSON.stringify(roles, null, 2))
  console.log('Profiles:', profileCount)
  console.log('Rooms:', roomCount)
  console.log('Accommodations:', accCount)
  console.log('Payments:', paymentCount)
}

checkCounts()
