'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { formatIndexNumber } from '@/lib/formatters'
import { Search, Filter, Calendar, User, CheckCircle, Clock, AlertCircle, Eye, Check, X } from 'lucide-react'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'

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
  preferredHostelId: string
  preferredFloor: number
  preferredFloorId: string
  preferredRoomType: string
  preferredRoomTypeId: string
  
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
  const [isLoading, setIsLoading] = useState(true)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [hostels, setHostels] = useState<any[]>([])
  const [allocationForm, setAllocationForm] = useState({
    hostelId: '',
    floorNumber: '',
    roomNumber: '',
    bedNumber: ''
  })
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [resResponse, hostelsResponse] = await Promise.all([
          fetch('/api/admin/allocator'),
          fetch('/api/hostels')
        ])

        if (resResponse.ok) {
          const data = await resResponse.json()
          setReservations(data || [])
        }

        if (hostelsResponse.ok) {
          const data = await hostelsResponse.json()
          setHostels(data.hostels || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(200)
    }
  }, [isLoading])

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

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'allocated': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'danger'
      case 'cancelled': return 'neutral'
      default: return 'neutral'
    }
  }

  // Fetch available rooms when hostel or floor changes
  useEffect(() => {
    if (allocationForm.hostelId && allocationForm.floorNumber && showAllocationModal) {
      const fetchRooms = async () => {
        try {
          const res = await fetch(`/api/rooms/available?hostelId=${allocationForm.hostelId}&floorNumber=${allocationForm.floorNumber}`)
          if (res.ok) {
            const data = await res.json()
            setAvailableRooms(data.rooms || [])
          }
        } catch (error) {
          console.error('Error fetching rooms:', error)
          setAvailableRooms([])
        }
      }
      fetchRooms()
    } else {
      setAvailableRooms([])
    }
  }, [allocationForm.hostelId, allocationForm.floorNumber, showAllocationModal])

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
    setAllocationForm({
      hostelId: reservation.preferredHostelId || '',
      floorNumber: reservation.preferredFloorId || '',
      roomNumber: '',
      bedNumber: ''
    })
    setShowAllocationModal(true)
  }

  const handleConfirmAllocation = async () => {
    if (!selectedReservation || !allocationForm.hostelId || !allocationForm.roomNumber) {
      alert('Please select a hostel and room')
      return
    }

    try {
      console.log('Posting to /api/admin/allocator with:', allocationForm)
      const response = await fetch('/api/admin/allocator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: selectedReservation.id,
          studentId: selectedReservation.studentId,
          ...allocationForm,
          notes: allocationNotes
        })
      })
      console.log('Response status:', response.status)

      if (response.ok) {
        setShowAllocationModal(false)
        setSelectedReservation(null)
        setAllocationNotes('')
        // Refresh reservations
        const res = await fetch('/api/admin/allocator')
        if (res.ok) {
          const data = await res.json()
          setReservations(data)
        }
      } else {
        alert('Failed to allocate room')
      }
    } catch (error) {
      console.error('Error allocating room:', error)
      alert('Error allocating room')
    }
  }

  const handleRejectReservation = (id: string) => {
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
          <ModernBadge variant={getStatusBadgeVariant(value)} icon={StatusIcon}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </ModernBadge>
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
              <AnimatedStatCard
                icon={Calendar}
                label="Total Reservations"
                value={totalReservations}
                iconColor="blue"
              />

              <AnimatedStatCard
                icon={Clock}
                label="Pending"
                value={pendingReservations}
                iconColor="yellow"
              />

              <AnimatedStatCard
                icon={CheckCircle}
                label="Allocated"
                value={allocatedReservations}
                iconColor="green"
              />

              <AnimatedStatCard
                icon={X}
                label="Rejected"
                value={rejectedReservations}
                iconColor="red"
              />
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
              {filteredReservations.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={filteredReservations}
                  pagination={true}
                  pageSize={10}
                  searchable={true}
                />
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No Reservations Found"
                  description="No reservations match your current filters. Try adjusting your search criteria."
                />
              )}
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
                        value={allocationForm.hostelId}
                        onChange={(e) => setAllocationForm(p => ({ ...p, hostelId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Hostel</option>
                        {hostels.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Floor
                      </label>
                      <select
                        value={allocationForm.floorNumber}
                        onChange={(e) => setAllocationForm(p => ({ ...p, floorNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Floor</option>
                        {[1, 2, 3, 4, 5, 6].map(f => (
                          <option key={f} value={f}>Floor {f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Room
                      </label>
                      <select
                        value={allocationForm.roomNumber}
                        onChange={(e) => setAllocationForm(p => ({ ...p, roomNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!availableRooms.length}
                      >
                        <option value="">Select Room</option>
                        {availableRooms.map(room => (
                          <option key={room.id} value={room.room_number}>
                             {room.room_number} ({room.room_type}) - {room.capacity - room.current_occupancy} slots left
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Bed
                      </label>
                      <Input
                        placeholder="Enter bed number"
                        className="w-full"
                        value={allocationForm.bedNumber}
                        onChange={(e) => setAllocationForm(p => ({ ...p, bedNumber: e.target.value }))}
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
