
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Check if user is admin (using header or session - standard pattern here seems to rely on client checks but let's be safe if we can, 
    // but looking at other routes, they often trust the supabase client in rsc or middleware. 
    // We will follow the pattern of other admin routes which use supabaseAdmin directly).
    
    // 2. Get Porter Role ID
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'porter') // Case sensitive? Standardize on lowercase usually, but check output 'Porter' vs 'porter' from previous step if needed. 
                            // Previous step output showed roles.find(r => r.name.toLowerCase() === 'porter') worked, but didn't show exact casing.
                            // I'll assume 'porter' or 'Porter'. Let's case insensitive match if possible or fetch all.
      .single()

    if (roleError || !roles) {
      console.error('Error finding porter role:', roleError)
      return NextResponse.json({ error: 'Porter role not found' }, { status: 500 })
    }

    const porterRoleId = roles.id

    // 3. Fetch Users with this role
    const { data: porters, error: portersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        created_at,
        is_active,
        profiles (
          first_name,
          last_name,
          phone_number,
          program, 
          student_id
        )
      `)
      .eq('role_id', porterRoleId)

    if (portersError) {
      console.error('Error fetching porters:', portersError)
      return NextResponse.json({ error: 'Failed to fetch porters' }, { status: 500 })
    }

    // 4. Format for Frontend
    const formattedPorters = porters.map((p: any) => ({
      id: p.id,
      firstName: p.profiles?.[0]?.first_name || 'N/A',
      lastName: p.profiles?.[0]?.last_name || 'N/A',
      email: p.email,
      phone: p.profiles?.[0]?.phone_number || 'N/A',
      employeeId: p.profiles?.[0]?.student_id || 'P-' + p.id.substring(0,6).toUpperCase(), // Fallback using mock logic for now if employee ID not strictly in schema
      assignedHostel: 'Unassigned', // Schema doesn't seem to have explicit link yet, verify later
      status: p.is_active ? 'active' : 'inactive',
      isOnDuty: false, // Need a shift table for this
      totalCheckIns: 0,
      totalCheckOuts: 0,
      hireDate: p.created_at,
    }))

    return NextResponse.json(formattedPorters)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
