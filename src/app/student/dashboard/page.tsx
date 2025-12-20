'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import { Bed, CreditCard, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'

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
  paymentStatus: 'paid' | 'pending' | 'overdue'
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
  
  const { user } = useSelector((state: RootState) => state.auth)
  const { student } = useSelector((state: RootState) => state.student)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    // Get student data from Redux store
    const studentData: StudentData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      indexNumber: student?.indexNumber || '',
      email: user.email || '',
      phone: student?.phone || '',
      accommodationStatus: (student?.accommodationStatus as 'pending' | 'allocated' | 'none') || 'pending',
      room: student?.room || undefined,
      paymentStatus: (student?.paymentStatus as 'pending' | 'paid' | 'overdue') || 'pending',
    }

    // Get bookings data from Redux store
    const bookingsData: Booking[] = student?.bookings || []

    setTimeout(() => {
      setStudentData(studentData)
      setBookings(bookingsData)
      setIsLoading(false)
    }, 1000)
  }, [user, router, student?.accommodationStatus, student?.bookings, student?.indexNumber, student?.paymentStatus, student?.phone, student?.room])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'none':
      case 'rejected':
        return 'bg-gray-100 text-gray-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'active':
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'none':
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
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
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {studentData?.firstName || 'Student'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here&apos;s an overview of your accommodation status
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Student ID</p>
                  <p className="text-lg font-bold text-gray-900">{studentData.indexNumber}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bed className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accommodation</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{studentData.accommodationStatus}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Payment Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{studentData.paymentStatus}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-lg font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Room Information */}
          {studentData.room && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Hostel</p>
                  <p className="font-medium text-gray-900">{studentData.room.hostel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-medium text-gray-900">{studentData.room.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bed Number</p>
                  <p className="font-medium text-gray-900">{studentData.room.bedNumber}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings & Reservations</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 capitalize">{booking.type}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.details.hostel && `${booking.details.hostel}`}
                      {booking.details.room && ` - Room ${booking.details.room}`}
                      {booking.details.roomType && ` - ${booking.details.roomType}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-4">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Book a Room</h3>
              <p className="text-sm text-gray-600 mb-4">Select and book an available room</p>
              <Button onClick={() => router.push('/student/room-booking')}>
                Book Room
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Make Reservation</h3>
              <p className="text-sm text-gray-600 mb-4">Reserve a room for next semester</p>
              <Button onClick={() => router.push('/student/room-reservation')}>
                Reserve Room
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-yellow-100 rounded-lg inline-block mb-4">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Make Payment</h3>
              <p className="text-sm text-gray-600 mb-4">Pay for your accommodation</p>
              <Button onClick={() => router.push('/student/payments')}>
                Make Payment
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
