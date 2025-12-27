'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchTodayCheckins, performCheckout } from '@/store/slices/porterSlice'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Search, 
  Clock, 
  User, 
  LogOut, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  MapPin,
  Activity,
  UserX,
  History,
  ArrowRight,
  ShieldAlert,
  Zap,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { initPageAnimations } from '@/lib/animations'

export default function PorterCheckout() {
  const dispatch = useDispatch()
  const { todayCheckins, loading } = useSelector((state: RootState) => state.porter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchTodayCheckins() as any)
    initPageAnimations(150)
  }, [dispatch])

  const activeCheckins = todayCheckins.filter(checkin => checkin.status === 'active' || checkin.status === 'checked_in')
  const checkedOutToday = todayCheckins.filter(checkin => 
    checkin.checkOutTime && new Date(checkin.checkOutTime).toDateString() === new Date().toDateString()
  )

  const filteredCheckinsActive = activeCheckins.filter(checkin =>
    checkin.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCheckout = async (studentId: string) => {
    try {
      await dispatch(performCheckout(studentId) as any)
      setSelectedStudent(null)
      setSearchTerm('')
      dispatch(fetchTodayCheckins() as any)
    } catch (error) {
      console.error('Error performing check-out:', error)
    }
  }

  const getDurationHours = (checkInTime: string) => {
    const start = new Date(checkInTime)
    const end = new Date()
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  }

  const getFinalDuration = (start: string, end: string) => {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60))
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Registry Header */}
      <div className="page-header bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-out <span className="text-rose-600">Protocol</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Digital Personnel Access Control</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
             <Calendar className="w-5 h-5 text-rose-500" />
             <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Global Logs</div>
                <div className="text-xs font-black text-slate-700 mt-1">{new Date().toLocaleDateString('en-GB')}</div>
             </div>
           </div>
        </div>
      </div>

      {/* Registry Intelligence Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Control Panel */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Active Search & Primary Control */}
           <Card className="control-panel border-none shadow-sm rounded-[2.5rem] bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">Departure Verification</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Initialize exit for resident</p>
                 </div>
                 <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                    <UserX className="w-5 h-5" />
                 </div>
              </div>

              <div className="relative group mb-8">
                 <div className="absolute inset-0 bg-rose-500/5 rounded-2xl blur-xl group-focus-within:bg-rose-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                       type="text"
                       placeholder="Find student currently on-site..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
                    />
                 </div>
              </div>

              {/* Active Residents List (Filtered) */}
              <div className="space-y-4">
                 <div className="flex items-center gap-4 px-2 mb-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">Resident Identifier</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Protocol</div>
                 </div>

                 {loading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
                    </div>
                 ) : filteredCheckinsActive.length > 0 ? (
                    filteredCheckinsActive.map((checkin) => (
                       <div key={checkin.id} className="group p-5 bg-white border border-slate-50 hover:border-rose-100 rounded-[2rem] hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-lg font-black group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                   {checkin.student.firstName[0]}{checkin.student.lastName[0]}
                                </div>
                                <div>
                                   <h3 className="font-black text-slate-900 group-hover:text-rose-600 transition-colors">{checkin.student.firstName} {checkin.student.lastName}</h3>
                                   <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatIndexNumber(checkin.student.indexNumber)}</span>
                                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className="text-[10px] font-black text-slate-600">UNIT {checkin.room?.roomNumber || 'PENDING'}</span>
                                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className="text-[10px] font-bold text-rose-500 uppercase">Duration: {getDurationHours(checkin.checkInTime)}h</span>
                                   </div>
                                </div>
                             </div>
                             
                             <Button onClick={() => handleCheckout(checkin.student.id)} className="w-full md:w-auto h-11 px-8 rounded-xl bg-slate-900 hover:bg-rose-600 text-white shadow-lg shadow-slate-900/10 font-black text-[10px] uppercase tracking-[0.15em] transition-all">
                                <LogOut className="w-4 h-4 mr-2" /> De-authorize
                             </Button>
                          </div>
                       </div>
                    ))
                 ) : searchTerm ? (
                    <div className="py-12 px-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                       <UserX className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active resident matching &quot;{searchTerm}&quot;</p>
                    </div>
                 ) : (
                    <div className="py-20">
                       <EmptyState
                          icon={CheckCircle2}
                          title="Site Area Clear"
                          description="All registered residents have successfully processed their departure or no entry recorded."
                          actionLabel="Sync Registry"
                          onAction={() => dispatch(fetchTodayCheckins() as any)}
                       />
                    </div>
                 )}
              </div>
           </Card>

           {/* Finalized Exit Archive */}
           <Card className="archive-panel border-none shadow-sm rounded-[2.5rem] bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">Exit Log Archive</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified Shift Departures</p>
                 </div>
                 <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <History className="w-5 h-5" />
                 </div>
              </div>

              <div className="space-y-4">
                 {checkedOutToday.length > 0 ? (
                    checkedOutToday.map((checkin) => (
                       <div key={checkin.id} className="p-5 bg-slate-50/50 border border-slate-100 hover:bg-white rounded-[2rem] transition-all duration-300">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                   <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                   <h3 className="font-black text-slate-900 leading-none">{checkin.student.firstName} {checkin.student.lastName}</h3>
                                   <div className="flex items-center gap-3 mt-2">
                                      <span className="text-[10px] font-black text-slate-400 tracking-tighter capitalize">Final Unit: {checkin.room?.roomNumber || 'N/A'}</span>
                                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Exit Verified</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Visit Duration</div>
                                   <div className="text-sm font-black text-slate-900 mt-0.5">{getFinalDuration(checkin.checkInTime, checkin.checkOutTime!)}h</div>
                                </div>
                                <div className="text-sm font-black text-slate-400 border-l border-slate-200 pl-4 py-1">
                                   {new Date(checkin.checkOutTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                             </div>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="py-12 text-center opacity-40">
                       <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No departures archived today</p>
                    </div>
                 )}
              </div>
           </Card>
        </div>

        {/* Audit Sidebar */}
        <div className="space-y-8">
           {/* Shift Intelligence */}
           <div className="space-y-4">
              <AnimatedStatCard icon={Activity} label="Occupied Units" value={activeCheckins.length} iconColor="blue" subText="Residents On-site" />
              <AnimatedStatCard icon={LogOut} label="Exits Finalized" value={checkedOutToday.length} iconColor="rose" subText="Departure Logs" />
              <AnimatedStatCard icon={Clock} label="Avg Residency" value={`${activeCheckins.length > 0 ? Math.round(activeCheckins.reduce((acc, c) => acc + getDurationHours(c.checkInTime), 0) / activeCheckins.length) : 0}h`} iconColor="amber" subText="Current Avg Hold" />
           </div>

           {/* Security Warning / Protocol */}
           <Card className="alert-card border-none shadow-xl shadow-rose-500/10 rounded-[2.5rem] bg-rose-600 p-8 text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 opacity-10">
                 <ShieldAlert className="h-40 w-40" />
              </div>
              <div className="relative z-10 space-y-6">
                 <div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                       <Zap className="w-6 h-6 text-rose-100" />
                    </div>
                    <h3 className="text-xl font-black">Exit Protocol</h3>
                    <p className="text-rose-100 text-[10px] font-bold mt-2 uppercase tracking-widest leading-loose">Verify all student belongings and key returns during de-authorization.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-90 transition-all hover:opacity-100 cursor-pointer group">
                       <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><ChevronRight className="w-3 h-3" /></div>
                       <span>Verify Key Return</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-90 transition-all hover:opacity-100 cursor-pointer group">
                       <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><ChevronRight className="w-3 h-3" /></div>
                       <span>Inspect Asset State</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-90 transition-all hover:opacity-100 cursor-pointer group">
                       <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><ChevronRight className="w-3 h-3" /></div>
                       <span>Update Shift Log</span>
                    </div>
                 </div>

                 <Button className="w-full bg-slate-900 text-white hover:bg-black border-none font-black rounded-2xl h-12 text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-950/40">
                    Emergency Lock-down
                 </Button>
              </div>
           </Card>
           
           {/* Shift Summary Metadata */}
           <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Audit Context</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Target Hub</span>
                    <span className="text-slate-900">University Main</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Log Integrity</span>
                    <span className="text-emerald-500">VERIFIED</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
