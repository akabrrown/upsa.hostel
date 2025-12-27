'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import Button from '@/components/ui/button'
import { Bed, CreditCard, Calendar, User, CheckCircle, Clock, AlertCircle, ArrowRight, Activity, Wallet } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import gsap from 'gsap'

interface StudentData {
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
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'none'
}

interface Booking {
  id: string
  type: 'reservation' | 'booking'
  status: 'pending' | 'approved' | 'rejected' | 'active'
  createdAt: string
  details: {
    hostel?: string
    room?: string
    roomType?: string
  }
}

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    bookingEnabled: true,
    reservationEnabled: true
  })
  const [hasActiveRequest, setHasActiveRequest] = useState(false)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Only fetch profile if not already fetched or to ensure freshness without looping
        if (!profileFetched) {
           await dispatch(fetchProfile() as any)
        }

        // Fetch system settings
        const settingsResponse = await fetch('/api/settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.data) {
            setSettings({
              bookingEnabled: settingsData.data.booking_enabled === true,
              reservationEnabled: settingsData.data.reservation_enabled === true
            })
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, dispatch, profileFetched, user])

  useEffect(() => {
    if (user && user.role === 'student') {
      const mappedStudentData: StudentData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        indexNumber: user.indexNumber || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        accommodationStatus: user.accommodationStatus as 'pending' | 'allocated' | 'none' || 'none',
        room: user.accommodation?.room ? {
          hostel: user.accommodation.room.hostel?.name || '',
          roomNumber: user.accommodation.room.room_number || '',
          bedNumber: user.accommodation.bed_number || ''
        } : undefined,
        paymentStatus: user.paymentStatus as 'paid' | 'pending' | 'overdue' | 'none' || 'none',
      }

      setStudentData(mappedStudentData)
      
      const allHistory: Booking[] = [
        ...(user.bookings || []).map((b: any) => ({
          id: b.id,
          type: 'booking' as const,
          status: b.status as any,
          createdAt: b.created_at || b.booked_at,
          details: {
            hostel: b.room?.hostel?.name,
            room: b.room?.room_number,
          }
        })),
        ...(user.reservations || []).map((r: any) => ({
          id: r.id,
          type: 'reservation' as const,
          status: r.status as any,
          createdAt: r.created_at,
          details: {
            hostel: r.room?.hostel?.name || 'Not assigned',
          }
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setBookings(allHistory)

      const hasRequest = 
        user.accommodationStatus === 'allocated' || 
        user.accommodationStatus === 'pending' ||
        allHistory.some(b => b.status === 'pending' || b.status === 'approved' || b.status === 'active')
      
      setHasActiveRequest(hasRequest)
    }
  }, [user])

  // GSAP Entry Animation
  useEffect(() => {
    if (!isLoading && studentData) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.dashboard-hero', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.stat-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        )
        gsap.fromTo('.dashboard-section',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [isLoading, studentData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'active':
      case 'approved':
      case 'paid':
        return 'bg-emerald-100 text-emerald-700'
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'none':
      case 'rejected':
        return 'bg-gray-100 text-gray-700'
      case 'overdue':
        return 'bg-rose-100 text-rose-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'active':
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-3.5 w-3.5" />
      case 'pending':
        return <Clock className="h-3.5 w-3.5" />
      case 'none':
      case 'rejected':
        return <AlertCircle className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load student data</h2>
          <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto dashboard-hero">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{studentData?.firstName}</span>
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Here&apos;s what&apos;s happening with your accommodation status today. Manage your bookings and payments all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Profile</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Index Number</p>
              <p className="text-xl font-bold text-gray-900">{formatIndexNumber(studentData.indexNumber)}</p>
            </div>
          </div>

          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${studentData.accommodationStatus === 'allocated' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <Bed className={`h-6 w-6 ${studentData.accommodationStatus === 'allocated' ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Accommodation</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{studentData.accommodationStatus}</p>
            </div>
          </div>

          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${studentData.paymentStatus === 'paid' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <Wallet className={`h-6 w-6 ${studentData.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Finance</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Payment Status</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{studentData.paymentStatus}</p>
            </div>
          </div>

          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Bookings</p>
              <p className="text-xl font-bold text-gray-900">
                {(studentData.accommodationStatus === 'allocated' ? 1 : 0) + bookings.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Information */}
            {studentData.room && (
              <div className="dashboard-section bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    Current Allocation
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hostel</p>
                    <p className="font-bold text-gray-900">{studentData.room.hostel}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Room No.</p>
                    <p className="font-bold text-gray-900">{studentData.room.roomNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bed No.</p>
                    <p className="font-bold text-gray-900">{studentData.room.bedNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="dashboard-section">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                     onClick={() => {
                       if (settings.bookingEnabled && !hasActiveRequest) {
                         router.push('/student/room-booking')
                       }
                     }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Bed className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Book a Room</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {!settings.bookingEnabled 
                        ? 'System is currently closed' 
                        : hasActiveRequest 
                        ? 'You already have an active room' 
                        : 'Select and book an available room'}
                    </p>
                    <div className={`text-sm font-medium flex items-center ${
                      (!settings.bookingEnabled || hasActiveRequest) ? 'text-gray-400' : 'text-blue-600 group-hover:gap-2 transition-all'
                    }`}>
                      {!settings.bookingEnabled ? 'Closed' : hasActiveRequest ? 'Allocated' : 'Start Booking'} 
                      {settings.bookingEnabled && !hasActiveRequest && <ArrowRight className="w-4 h-4 ml-1" />}
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                     onClick={() => {
                        if (settings.reservationEnabled && !hasActiveRequest) {
                          router.push('/student/room-reservation')
                        }
                     }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Make Reservation</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {!settings.reservationEnabled 
                        ? 'System is currently closed' 
                        : hasActiveRequest 
                        ? 'You already have an active room' 
                        : 'Reserve a spot for next semester'}
                    </p>
                    <div className={`text-sm font-medium flex items-center ${
                      (!settings.reservationEnabled || hasActiveRequest) ? 'text-gray-400' : 'text-emerald-600 group-hover:gap-2 transition-all'
                    }`}>
                      {!settings.reservationEnabled ? 'Closed' : hasActiveRequest ? 'Allocated' : 'Start Reservation'}
                      {settings.reservationEnabled && !hasActiveRequest && <ArrowRight className="w-4 h-4 ml-1" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Payment Quick Action */}
            <div className="dashboard-section bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Secure</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Make Payment</h3>
              <p className="text-gray-300 text-sm mb-6">Process your hostel fees securely online.</p>
              <Button onClick={() => router.push('/student/payments')} className="w-full bg-white text-gray-900 hover:bg-gray-100 border-none">
                Proceed to Pay
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View All</span>
              </div>
              
              <div className="space-y-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-50 rounded-full inline-block mb-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No recent activity found</p>
                  </div>
                ) : (
                  bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                        booking.type === 'booking' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {booking.type === 'booking' ? <Bed className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold text-gray-900 capitalize">{booking.type}</p>
                          {/* Status Badge */}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {booking.details.hostel || 'Hostel Request'}
                          {booking.details.room && ` • Room ${booking.details.room}`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
