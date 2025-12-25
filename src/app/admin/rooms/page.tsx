'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import Badge from '@/components/ui/badge'
import { Search, Filter, Plus, Edit, Eye, Bed, Users, MapPin, DoorOpen } from 'lucide-react'
import { TableColumn } from '@/types'
import apiClient from '@/lib/api'

interface Room {
  id: number
  roomNumber: string
  hostel: string
  floor: number
  type: string
  capacity: number
  occupied: number
  available: number
  status: string
  condition: string
  lastMaintenance: string
  nextMaintenance: string
  occupants: any[]
  amenities: string[]
  monthlyRent: number
}

export default function AdminRooms() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    roomNumber: '',
    hostel: '',
    floor: '',
    type: 'custom',
    capacity: '',
    monthlyRent: '',
    condition: 'good',
    amenities: ''
  })
  const [hostels, setHostels] = useState<any[]>([])
  const [selectedHostelPricing, setSelectedHostelPricing] = useState<any>(null)

  useEffect(() => {
    // Animate page elements
    gsap.from('.rooms-card', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1
    })

    loadRooms()
  }, [])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<Room[]>('/admin/rooms')
      setRooms(response)
    } catch (error) {
      console.error('Failed to load rooms:', error)
      setError('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostels')
      if (response.ok) {
        const result = await response.json()
        setHostels(result.hostels || [])
      }
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
      setHostels([]) // Set empty array instead of hardcoded data
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  // Update pricing when hostel is selected
  useEffect(() => {
    if (selectedHostelPricing && formData.capacity) {
      // Calculate price based on capacity and hostel pricing (semester-based)
      const capacity = parseInt(formData.capacity)
      let pricePerPerson = 0
      
      if (capacity === 1) {
        pricePerPerson = selectedHostelPricing.single || 0
      } else if (capacity === 2) {
        pricePerPerson = selectedHostelPricing.double || 0
      } else if (capacity >= 4) {
        pricePerPerson = selectedHostelPricing.quadruple || 0
      }
      
      // Total price per semester for the room
      const totalSemesterPrice = pricePerPerson * capacity
      setFormData(prev => ({ ...prev, monthlyRent: totalSemesterPrice.toString() }))
    }
  }, [formData.capacity, selectedHostelPricing])

  useEffect(() => {
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
    .fromTo('.room-table',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  const hostelOptions = hostels.length > 0 ? [
    { id: 'all', name: 'All Hostels' },
    ...hostels.map(hostel => ({ id: hostel.id, name: hostel.name }))
  ] : [
    { id: 'all', name: 'All Hostels' }
  ]

  const handleHostelChange = (hostelId: string) => {
    setFormData(prev => ({ ...prev, hostel: hostelId }))
    
    // Find selected hostel and set pricing
    const selectedHostel = hostels.find(h => h.id === hostelId)
    if (selectedHostel && selectedHostel.room_pricing) {
      setSelectedHostelPricing(selectedHostel.room_pricing)
    } else {
      setSelectedHostelPricing(null)
    }
  }

  const roomTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'Single', name: 'Single Room' },
    { id: 'Double', name: 'Double Room' },
    { id: 'Triple', name: 'Triple Room' }
  ]

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hostel.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesHostel = selectedHostel === 'all' || room.hostel === selectedHostel
    const matchesRoomType = selectedRoomType === 'all' || room.type === selectedRoomType
    
    return matchesSearch && matchesHostel && matchesRoomType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'text-red-600 bg-red-100'
      case 'available': return 'text-green-600 bg-green-100'
      case 'partially_occupied': return 'text-yellow-600 bg-yellow-100'
      case 'maintenance': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        room_number: formData.roomNumber,
        hostel_id: formData.hostel,
        floor_number: parseInt(formData.floor),
        type: formData.type.toLowerCase(),
        capacity: parseInt(formData.capacity),
        monthly_rent: parseFloat(formData.monthlyRent),
        condition: formData.condition,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a)
      }

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      })

      if (response.ok) {
        alert('Room created successfully!')
        setShowCreateModal(false)
        setFormData({
          roomNumber: '',
          hostel: '',
          floor: '',
          type: 'Single',
          capacity: '',
          monthlyRent: '',
          condition: 'good',
          amenities: ''
        })
        loadRooms()
      } else {
        const errorData = await response.json()
        alert(`Failed to create room: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    }
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      roomNumber: room.roomNumber,
      hostel: room.hostel,
      floor: room.floor.toString(),
      type: room.type,
      capacity: room.capacity.toString(),
      monthlyRent: room.monthlyRent.toString(),
      condition: room.condition,
      amenities: room.amenities.join(', ')
    })
    setShowCreateModal(true)
  }

  const handleUpdateRoom = async () => {
    // Similar to create but with PUT method
    console.log('Updating room:', editingRoom?.id, formData)
    setShowCreateModal(false)
    setEditingRoom(null)
  }

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
  const availableRooms = rooms.filter(r => r.status === 'available').length
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length

  const columns: TableColumn[] = [
    {
      key: 'roomNumber',
      title: 'Room',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <DoorOpen className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'hostel',
      title: 'Hostel',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'occupied',
      title: 'Occupancy',
      render: (value: number, row: any) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span>{value}/{row.capacity}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'condition',
      title: 'Condition',
      render: (value: string) => (
        <Badge className={getConditionColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'monthlyRent',
      title: 'Semester Price',
      render: (value: number) => (
        <span className="font-semibold">${value}/semester</span>
      )
    },
    {
      key: 'id',
      title: 'Actions',
      render: (value: number, row: any) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
              <p className="text-gray-600 mt-1">Manage hostel rooms and occupancy</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{totalRooms}</h3>
              <p className="text-gray-600">Total Rooms</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">{occupiedRooms}</h3>
              <p className="text-gray-600">Occupied</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DoorOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600">{availableRooms}</h3>
              <p className="text-gray-600">Available</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-600">{maintenanceRooms}</h3>
              <p className="text-gray-600">Maintenance</p>
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
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hostelOptions.map(hostel => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredRooms.length} of {totalRooms} rooms
              </div>
            </div>
          </Card>
        </div>

        {/* Room Table */}
        <div className="room-table">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Room List</h2>
            <DataTable
              columns={columns}
              data={filteredRooms}
              pagination={true}
              pageSize={10}
              searchable={true}
            />
          </Card>
        </div>
      </div>

      {/* Create/Edit Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRoom ? 'Edit Room' : 'Create New Room'}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingRoom(null)
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <Input
                      value={formData.roomNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="e.g., 101, A-101"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel
                    </label>
                    <select
                      value={formData.hostel}
                      onChange={(e) => handleHostelChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map(hostel => (
                        <option key={hostel.id} value={hostel.id}>
                          {hostel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor Number
                    </label>
                    <Input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                      placeholder="e.g., 1, 2, 3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Capacity (Number of Persons)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="e.g., 1, 2, 3, 4, 6"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of persons that can occupy this room</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="custom">Custom Room</option>
                      <option value="single">Single Room (1 Person)</option>
                      <option value="double">Double Room (2 Persons)</option>
                      <option value="triple">Triple Room (3 Persons)</option>
                      <option value="quadruple">Quadruple Room (4 Persons)</option>
                      <option value="suite">Suite Room</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester Price ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                      placeholder="Auto-calculated or enter custom price"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated based on capacity and hostel pricing (per semester)</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (comma separated)
                    </label>
                    <Input
                      value={formData.amenities}
                      onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                      placeholder="Wi-Fi, AC, Study Desk"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingRoom(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingRoom ? handleUpdateRoom : handleCreateRoom}>
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
