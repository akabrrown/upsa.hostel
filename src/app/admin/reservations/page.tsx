'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import Badge from '@/components/ui/badge'
import { formatIndexNumber } from '@/lib/formatters'
import { Search, Filter, Calendar, User, Building, CheckCircle, Clock, AlertCircle, Eye, Check, X, MoreVertical } from 'lucide-react'
import { TableColumn } from '@/types'

interface Reservation {
  id: string
  studentId: string
  studentName: string
  indexNumber: string
  email: string
  phone: string
  program: string
  yearOfStudy: string
  
  // Preferences
  preferredHostel: string
  preferredFloor: number
  preferredRoomType: string
  
  // Allocation result
  allocatedHostel?: string
  allocatedFloor?: number
  allocatedRoom?: string
  allocatedBed?: string
  
  // Status and dates
  status: 'pending' | 'allocated' | 'rejected' | 'cancelled'
  submissionDate: string
  allocationDate?: string
  academicYear: string
  semester: string
  
  // Additional info
  specialRequests?: string
  notes?: string
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [allocationNotes, setAllocationNotes] = useState('')
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    // Get reservations data from Redux store
    const reservationsData: Reservation[] = []

    setTimeout(() => {
      setReservations(reservationsData)
      
      // Animate page content
      const tl = gsap.timeline()
      
      tl.fromTo('.page-header',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.stats-cards',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.reservations-table',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
    }, 1000)
  }, [user, router])

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.preferredHostel.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || reservation.status === selectedStatus
    const matchesSemester = selectedSemester === 'all' || reservation.semester === selectedSemester
    
    return matchesSearch && matchesStatus && matchesSemester
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allocated': return CheckCircle
      case 'pending': return Clock
      case 'rejected': return X
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  const handleAllocateRoom = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowAllocationModal(true)
  }

  const handleConfirmAllocation = () => {
    // Handle room allocation logic
    console.log('Allocating room for reservation:', selectedReservation?.id)
    console.log('Allocation notes:', allocationNotes)
    
    // In real app, this would call the allocation algorithm
    setShowAllocationModal(false)
    setSelectedReservation(null)
    setAllocationNotes('')
  }

  const handleRejectReservation = (id: string) => {
    // Handle reservation rejection
    console.log('Rejecting reservation:', id)
  }

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
  }

  const columns: TableColumn[] = [
    {
      key: 'student',
      title: 'Student Information',
      render: (value: any, row: Reservation) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.studentName}</div>
            <div className="text-sm text-gray-500">{formatIndexNumber(row.indexNumber)}</div>
            <div className="text-xs text-gray-400">{row.email}</div>
            <div className="text-xs text-gray-400">{row.program} - {row.yearOfStudy}</div>
          </div>
        </div>
      )
    },
    {
      key: 'preferences',
      title: 'Preferences',
      render: (value: any, row: Reservation) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">Hostel:</span> {row.preferredHostel}
          </div>
          <div className="text-sm">
            <span className="font-medium">Floor:</span> {row.preferredFloor}
          </div>
          <div className="text-sm">
            <span className="font-medium">Room:</span> {row.preferredRoomType}
          </div>
          {row.specialRequests && (
            <div className="text-xs text-gray-500 italic">
              &ldquo;{row.specialRequests}&rdquo;
            </div>
          )}
        </div>
      )
    },
    {
      key: 'allocation',
      title: 'Allocation',
      render: (value: any, row: Reservation) => (
        <div>
          {row.allocatedHostel ? (
            <div className="space-y-1">
              <div className="text-sm font-medium text-green-600">
                {row.allocatedHostel}
              </div>
              <div className="text-xs text-gray-500">
                Floor {row.allocatedFloor}, Room {row.allocatedRoom}
              </div>
              <div className="text-xs text-gray-500">
                {row.allocatedBed}
              </div>
              <div className="text-xs text-gray-400">
                {row.allocationDate && new Date(row.allocationDate).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Not allocated</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string, row: Reservation) => {
        const StatusIcon = getStatusIcon(value)
        return (
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-4 h-4" />
            <Badge className={getStatusColor(value)}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'submissionDate',
      title: 'Submitted',
      render: (value: string) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Reservation) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAllocateRoom(row)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleRejectReservation(row.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  const totalReservations = reservations.length
  const pendingReservations = reservations.filter(r => r.status === 'pending').length
  const allocatedReservations = reservations.filter(r => r.status === 'allocated').length
  const rejectedReservations = reservations.filter(r => r.status === 'rejected').length

  const semesters = [
    { id: 'all', name: 'All Semesters' },
    { id: 'First Semester', name: 'First Semester' },
    { id: 'Second Semester', name: 'Second Semester' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'pending', name: 'Pending' },
    { id: 'allocated', name: 'Allocated' },
    { id: 'rejected', name: 'Rejected' },
    { id: 'cancelled', name: 'Cancelled' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Room Reservations</h1>
                <p className="text-gray-600 mt-1">Manage student room reservation requests and allocations</p>
              </div>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Run Allocation
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reservations</p>
                    <p className="text-2xl font-bold text-gray-900">{totalReservations}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingReservations}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Allocated</p>
                    <p className="text-2xl font-bold text-green-600">{allocatedReservations}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedReservations}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reservations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  Showing {filteredReservations.length} of {totalReservations} reservations
                </div>
              </div>
            </Card>
          </div>

          {/* Reservations Table */}
          <div className="reservations-table">
            <Card className="overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredReservations}
                pagination={true}
                pageSize={10}
                searchable={true}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Allocation Modal */}
      {showAllocationModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Allocate Room - {selectedReservation.studentName}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllocationModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedReservation.studentName}
                    </div>
                    <div>
                      <span className="font-medium">Index:</span> {formatIndexNumber(selectedReservation.indexNumber)}
                    </div>
                    <div>
                      <span className="font-medium">Program:</span> {selectedReservation.program}
                    </div>
                    <div>
                      <span className="font-medium">Year:</span> {selectedReservation.yearOfStudy}
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Student Preferences</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Hostel:</span> {selectedReservation.preferredHostel}
                    </div>
                    <div>
                      <span className="font-medium">Floor:</span> {selectedReservation.preferredFloor}
                    </div>
                    <div>
                      <span className="font-medium">Room Type:</span> {selectedReservation.preferredRoomType}
                    </div>
                    {selectedReservation.specialRequests && (
                      <div>
                        <span className="font-medium">Special Requests:</span> {selectedReservation.specialRequests}
                      </div>
                    )}
                  </div>
                </div>

                {/* Allocation Form */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Room Allocation</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Hostel
                      </label>
                      <select
                        defaultValue={selectedReservation.preferredHostel}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hostel A">Hostel A</option>
                        <option value="Hostel B">Hostel B</option>
                        <option value="Hostel C">Hostel C</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Floor
                      </label>
                      <select
                        defaultValue={selectedReservation.preferredFloor.toString()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">Floor 1</option>
                        <option value="2">Floor 2</option>
                        <option value="3">Floor 3</option>
                        <option value="4">Floor 4</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Room
                      </label>
                      <Input
                        placeholder="Enter room number"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Bed
                      </label>
                      <Input
                        placeholder="Enter bed number"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allocation Notes
                    </label>
                    <textarea
                      value={allocationNotes}
                      onChange={(e) => setAllocationNotes(e.target.value)}
                      placeholder="Enter allocation notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowAllocationModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmAllocation}>
                  Confirm Allocation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
