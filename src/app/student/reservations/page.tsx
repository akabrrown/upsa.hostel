'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building, Users, CreditCard, Eye, Filter, Search } from 'lucide-react'

interface Reservation {
  id: string
  type: 'reservation' | 'booking'
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  createdAt: string
  academicYear: string
  semester: string
  details: {
    hostel?: string
    floor?: number
    room?: string
    roomType?: string
    price?: number
  }
  allocation?: {
    hostel: string
    roomNumber: string
    bedNumber: string
    allocatedAt: string
  }
}

export default function ReservationsHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    // Get reservations data from Redux store
    const reservationsData: Reservation[] = []

    setTimeout(() => {
      setReservations(reservationsData)
      setIsLoading(false)
    }, 1000)
  }, [user, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <div className="w-2 h-2 bg-green-600 rounded-full"></div>
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
      case 'rejected':
        return <div className="w-2 h-2 bg-red-600 rounded-full"></div>
      case 'completed':
        return <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.details.hostel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.details.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.academicYear.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = statusFilter === 'all' || reservation.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservations History</h1>
            <p className="text-gray-600">View and manage your room reservations and bookings</p>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by hostel, room, or academic year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Reservations List */}
          <div className="space-y-4">
            {filteredReservations.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'You haven\'t made any reservations yet'}
                </p>
                <Button onClick={() => router.push('/student/room-reservation')}>
                  Make a Reservation
                </Button>
              </Card>
            ) : (
              filteredReservations.map((reservation) => (
                <Card key={reservation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className={getStatusColor(reservation.status)}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(reservation.status)}
                            <span className="capitalize">{reservation.status}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {reservation.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(reservation.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Hostel</p>
                            <p className="font-medium">{reservation.details.hostel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Room Type</p>
                            <p className="font-medium">{reservation.details.roomType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-medium">GHS {reservation.details.price}/semester</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Academic Year:</span> {reservation.academicYear} | 
                        <span className="font-medium ml-2">Semester:</span> {reservation.semester}
                        {reservation.details.room && (
                          <>
                            <span className="font-medium ml-2">Room:</span> {reservation.details.room}
                          </>
                        )}
                        {reservation.details.floor && (
                          <>
                            <span className="font-medium ml-2">Floor:</span> {reservation.details.floor}
                          </>
                        )}
                      </div>

                      {reservation.allocation && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800 font-medium mb-1">Room Allocated!</p>
                          <div className="text-sm text-green-700">
                            <span className="font-medium">{reservation.allocation.hostel}</span> - 
                            Room {reservation.allocation.roomNumber}, {reservation.allocation.bedNumber}
                            <span className="text-xs ml-2">
                              (Allocated on {new Date(reservation.allocation.allocatedAt).toLocaleDateString()})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
              <div className="text-sm text-gray-600">Total Reservations</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reservations.filter(r => r.status === 'active' || r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Active/Approved</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {reservations.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {reservations.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
