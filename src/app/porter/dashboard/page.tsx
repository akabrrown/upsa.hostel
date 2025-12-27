'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import { formatIndexNumber } from '@/lib/formatters'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Users,
  Bed, 
  LogIn, 
  LogOut, 
  Search, 
  Clock,
  ArrowRight,
  UserCheck,
  Building,
  History,
  Phone,
  Mail,
  CheckCircle,
  ChevronRight,
  MapPin,
  Activity,
  CalendarDays
} from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'

interface Student {
  id: string
  firstName: string
  lastName: string
  indexNumber: string
  email: string
  phone: string
  accommodationStatus: 'allocated' | 'pending' | 'none'
  room?: {
    hostel: string
    roomNumber: string
    bedNumber: string
  }
}

interface CheckInRecord {
  id: string
  studentId: string
  studentName: string
  indexNumber: string
  room: string
  bed: string
  action: 'checkin' | 'checkout'
  timestamp: string
  notes?: string
  porterName: string
}

export default function PorterDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const [porterStats, setPorterStats] = useState({
    occupancy: 0,
    totalCapacity: 0,
    checkedIn: 0,
    availableBeds: 0,
    todayActivity: 0
  })

  useEffect(() => {
    if (!user || user.role !== 'porter') {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        await dispatch(fetchProfile() as any)

        const [statsRes, historyRes] = await Promise.all([
          fetch('/api/porter/stats'),
          fetch('/api/porter/today-checkins')
        ])

        if (statsRes.ok) setPorterStats(await statsRes.json())
        if (historyRes.ok) {
          const historyData = await historyRes.json()
          setCheckInHistory(historyData.data || [])
        }
      } catch (error) {
        console.error('Failed to load porter dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, dispatch])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

  // Handle Search
  useEffect(() => {
    if (searchTerm.length < 3) {
      if (searchTerm.length === 0) setStudents([])
      return
    }

    const searchTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/porter/search-student?query=${searchTerm}`)
        if (res.ok) {
          const data = await res.json()
          setStudents(data.data ? [data.data] : [])
        }
      } catch (error) {
        console.error('Search error:', error)
      }
    }, 500)

    return () => clearTimeout(searchTimer)
  }, [searchTerm])

  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.indexNumber.includes(searchTerm)
  )

  const getStatusVariant = (status: string): 'success' | 'warning' | 'neutral' => {
    switch (status) {
      case 'allocated': return 'success'
      case 'pending': return 'warning'
      default: return 'neutral'
    }
  }

  const getActionVariant = (action: string): 'success' | 'danger' => {
    return action === 'checkin' ? 'success' : 'danger'
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome Section */}
      <div className="page-header relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 to-indigo-800 p-8 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="h-48 w-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Access Management</h1>
            <p className="text-blue-100/80 font-medium max-w-md text-sm md:text-base">
              Welcome back, Porter {user?.lastName}. Securely handle student entry/exit and room audits.
            </p>
          </div>
          <div className="flex gap-4">
             <Button onClick={() => router.push('/porter/checkin')} className="bg-white text-blue-700 hover:bg-blue-50 border-none shadow-xl px-8 h-12 font-bold rounded-2xl">
               <LogIn className="w-5 h-5 mr-2" />
               New Check-in
             </Button>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <AnimatedStatCard icon={Users} label="Total Bed Occupancy" value={porterStats.occupancy} iconColor="blue" subText={`of ${porterStats.totalCapacity} capacity`} />
         <AnimatedStatCard icon={UserCheck} label="Residents On-Site" value={porterStats.checkedIn} iconColor="green" subText="Currently present" />
         <AnimatedStatCard icon={Bed} label="Clean Vacancies" value={porterStats.availableBeds} iconColor="amber" subText="Ready for students" />
         <AnimatedStatCard icon={CheckCircle} label="Checked In" value={checkInHistory.filter(l => l.action === 'checkin').length} iconColor="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registry Search Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="registry-card border-none shadow-sm rounded-[2rem] bg-white overflow-hidden p-0">
             <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h2 className="text-xl font-black text-slate-900 leading-none">Security Registry</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Locate student for verification</p>
                </div>
                <div className="relative w-full md:w-80 group">
                   <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within:bg-blue-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search Index or Full Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                      />
                   </div>
                </div>
             </div>

             <div className="px-2">
                {searchTerm.length > 0 && searchTerm.length < 3 ? (
                   <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-tight">Keep typing to search registry...</div>
                ) : filteredStudents.length > 0 ? (
                   <div className="p-4 space-y-4">
                      {filteredStudents.map(student => (
                         <div key={student.id} className="group p-5 bg-white border border-slate-100 hover:border-blue-100 rounded-3xl hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                               <div className="flex items-center gap-5">
                                  <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-black shadow-inner">
                                     {student.firstName[0]}{student.lastName[0]}
                                  </div>
                                  <div>
                                     <div className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{student.firstName} {student.lastName}</div>
                                     <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{formatIndexNumber(student.indexNumber)}</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                           <Phone className="w-3.5 h-3.5" /> {student.phone || 'No Phone'}
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                  <div className="flex items-center gap-3">
                                     {student.room ? (
                                        <div className="text-right">
                                           <div className="text-xs font-black text-slate-900">{student.room.hostel}</div>
                                           <div className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Room {student.room.roomNumber} • Bed {student.room.bedNumber}</div>
                                        </div>
                                     ) : (
                                        <div className="text-right text-[10px] font-bold text-slate-400 uppercase">No Room Allocated</div>
                                     )}
                                     <ModernBadge variant={getStatusVariant(student.accommodationStatus)}>{student.accommodationStatus}</ModernBadge>
                                  </div>
                                  <Button variant="outline" size="sm" className="w-full md:w-auto rounded-xl font-bold text-xs uppercase tracking-widest border-slate-100 hover:bg-blue-600 hover:text-white transition-all h-9">
                                     Action Center <ChevronRight className="w-3 h-3 ml-2" />
                                  </Button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : searchTerm.length >= 3 ? (
                   <div className="py-20 px-8">
                      <EmptyState
                         icon={Search}
                         title="No Records Located"
                         description={`Registry search for "${searchTerm}" returned zero results. Please verify the Index Serial.`}
                         actionLabel="Clear Search"
                         onAction={() => setSearchTerm('')}
                      />
                   </div>
                ) : (
                   <div className="p-12 text-center opacity-40">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                         <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search the registry to begin verification</p>
                   </div>
                )}
             </div>
          </Card>
        </div>

        {/* Intelligence Panel */}
        <div className="space-y-8">
          {/* Recent Security Logs */}
          <Card className="logs-card border-none shadow-sm rounded-[2rem] bg-white p-8">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900 leading-none">Security Logs</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Recent Site Activity</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                   <Clock className="w-5 h-5" />
                </div>
             </div>

             <div className="space-y-6">
                {checkInHistory.length > 0 ? (
                  checkInHistory.slice(0, 5).map((record) => (
                    <div key={record.id} className="relative pl-10 group cursor-default">
                       <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 group-hover:bg-blue-100 transition-all rounded-full" />
                       <div className={`absolute top-0 -left-[5px] h-3 w-3 rounded-full border-[3px] border-white ring-1 ring-slate-100 transition-all group-hover:scale-125 ${
                         record.action === 'checkin' ? 'bg-emerald-500 ring-emerald-100' : 'bg-rose-500 ring-rose-100'
                       }`} />
                       
                       <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                             <div className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{record.studentName}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tighter">
                                <span className={`mr-2 font-black ${record.action === 'checkin' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {record.action.toUpperCase()}
                                </span>
                                • {record.room} • {record.bed}
                             </div>
                          </div>
                          <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                             {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center px-6">
                     <History className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No logs recorded for the current shift</p>
                  </div>
                )}
             </div>

             {checkInHistory.length > 0 && (
               <Button variant="ghost" className="w-full mt-8 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 rounded-2xl py-6 border border-slate-50">
                  Full Audit Log <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             )}
          </Card>

          {/* Quick Tasks / Guidelines */}
          <Card className="guidelines-card border-none shadow-xl shadow-blue-500/10 rounded-[2rem] bg-indigo-600 p-8 text-white relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 opacity-10">
                <Building className="h-40 w-40" />
             </div>
             <div className="relative z-10 space-y-6">
                <div>
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                      <Bed className="w-6 h-6 text-indigo-100" />
                   </div>
                   <h3 className="text-xl font-black">Audit Protocol</h3>
                   <p className="text-indigo-100 text-xs font-medium leading-relaxed mt-2 uppercase tracking-tight">Standard Procedure for Residents</p>
                </div>
                
                <ul className="space-y-3">
                   {[
                     'Verify valid institutional ID',
                     'Confirm room booking status',
                     'Issue sanitized key bundle',
                     'Update digital check-in log'
                   ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/90">
                         <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <ChevronRight className="w-3 h-3" />
                         </div>
                         {item}
                      </li>
                   ))}
                </ul>

                <Button className="w-full bg-white text-indigo-700 hover:bg-blue-50 border-none font-bold rounded-2xl h-11 text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40">
                   Open Manual
                </Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
