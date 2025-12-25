'use client'

import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import { 
  Users,
  Bed, 
  LogIn, 
  LogOut, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  UserCheck,
  Building,
  History,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react'
import { gsap } from 'gsap'

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
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || user.role !== 'porter') {
      router.push('/login')
      return
    }

    // Simulate fetching data
    setTimeout(() => {
      setStudents([])
      setCheckInHistory([])
      setIsLoading(false)
    }, 800)
  }, [user, router])

  useEffect(() => {
    if (!isLoading && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.header-section', {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        })
        
        gsap.from('.stats-card', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2
        })

        gsap.from('.dashboard-content', {
          opacity: 0,
          duration: 1,
          delay: 0.4
        })
      }, pageRef)
      return () => ctx.revert()
    }
  }, [isLoading])

  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.indexNumber.includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
        return 'text-green-700 bg-green-50 border-green-100'
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-100'
      case 'none':
        return 'text-slate-600 bg-slate-50 border-slate-100'
      default:
        return 'text-slate-600 bg-slate-50'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'checkin':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100'
      case 'checkout':
        return 'text-rose-700 bg-rose-50 border-rose-100'
      default:
        return 'text-slate-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="header-section flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Porter <span className="text-blue-600 text-gradient bg-clip-text">Dashboard</span>
          </h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-base md:text-lg">
            Manage student check-ins and room access.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="shadow-lg shadow-blue-500/20 px-6 w-full sm:w-auto"
            onClick={() => router.push('/porter/checkin')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Check In Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Occupancy', value: '450', sub: 'Total Students', icon: Users, color: 'blue' },
          { label: 'Checked In', value: '382', sub: 'Active Residents', icon: UserCheck, color: 'emerald' },
          { label: 'Available Beds', value: '68', sub: 'Ready for allocation', icon: Bed, color: 'amber' },
          { label: 'Today\'s Activity', value: '12', sub: 'Pending Check-outs', icon: History, color: 'indigo' },
        ].map((stat, i) => (
          <Card key={i} className="stats-card group hover:shadow-xl transition-all duration-300 border-none bg-white p-5 md:p-6 relative overflow-hidden ring-1 ring-slate-200">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500`} />
            <div className="relative z-10">
              <div className={`p-2.5 bg-${stat.color}-100 rounded-xl w-fit mb-3 md:mb-4 group-hover:bg-${stat.color}-200 transition-colors`}>
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 text-${stat.color}-600`} />
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                <span className="text-[10px] md:text-xs font-medium text-slate-400">{stat.sub}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Search & List Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none ring-1 ring-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Quick Search
              </h2>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Index or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Room Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{student.firstName} {student.lastName}</div>
                              <div className="text-xs text-slate-500 font-medium">{formatIndexNumber(student.indexNumber)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.room ? (
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-slate-900">{student.room.hostel}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Room {student.room.roomNumber} ({student.room.bedNumber})
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap flex-shrink-0 ${getStatusColor(student.accommodationStatus)}`}>
                            {student.accommodationStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50 font-bold"
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Search className="h-8 w-8 opacity-20" />
                          <p className="text-sm font-medium">No students found matching &quot;{searchTerm}&quot;</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div key={student.id} className="p-5 active:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-slate-500 font-medium">{formatIndexNumber(student.indexNumber)}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap flex-shrink-0 ${getStatusColor(student.accommodationStatus)}`}>
                        {student.accommodationStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          <Building className="h-3.5 w-3.5 text-blue-500" />
                          {student.room ? `${student.room.hostel} - ${student.room.roomNumber}` : 'Room Unassigned'}
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                            <Phone className="h-3 w-3" />
                            {student.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                       </div>
                    </div>

                    <Button variant="outline" className="w-full text-blue-600 border-blue-100 hover:bg-blue-50 font-bold text-xs py-2">
                      View Student Profile
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Search className="h-8 w-8 text-slate-300 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-slate-400">No students found matching &quot;{searchTerm}&quot;</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Side Panel Activities */}
        <div className="space-y-6 md:space-y-8">
          <Card className="border-none ring-1 ring-slate-200 shadow-sm bg-white p-5 md:p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              Recent Logs
            </h3>
            <div className="space-y-4">
              {checkInHistory.length > 0 ? (
                checkInHistory.slice(0, 5).map((record) => (
                  <div key={record.id} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:pb-0">
                    <div className={`absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                      record.action === 'checkin' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{record.studentName}</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className={`px-1.5 py-0.5 rounded uppercase whitespace-nowrap flex-shrink-0 ${getActionColor(record.action)}`}>
                          {record.action}
                        </span>
                        <span>•</span>
                        <span>Room {record.room}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest px-4">No activity logged for today</p>
                </div>
              )}
            </div>
            {checkInHistory.length > 0 && (
              <Button variant="ghost" className="w-full mt-6 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center gap-2 text-sm">
                View All Activity
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </Card>

          <Card className="border-none ring-1 ring-slate-200 shadow-sm bg-blue-600 p-5 md:p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building className="h-20 w-20 md:h-24 md:w-24" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Key Management</h3>
            <p className="text-blue-100 text-sm mb-4 relative z-10">
              Ensure all keys are signed out before student entry.
            </p>
            <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold relative z-10 text-xs">
              Open Log Book
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
