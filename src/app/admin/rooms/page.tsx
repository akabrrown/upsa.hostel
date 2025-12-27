'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Filter, Plus, Edit, Eye, Bed, Users, MapPin, DoorOpen, Trash2, X } from 'lucide-react'
import { TableColumn } from '@/types'
import apiClient from '@/lib/api'
import { initPageAnimations } from '@/lib/animations'

interface Room {
  id: string
  roomNumber: string
  hostel: string
  hostelId: string
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
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bulkData, setBulkData] = useState({
    hostel: '',
    floor: '',
    prefix: '',
    startNumber: '',
    endNumber: '',
    type: 'Double',
    capacity: '2',
    pricePerSemester: '',
    condition: 'good',
    amenities: ''
  })

  useEffect(() => {
    loadRooms()
    fetchHostels()
  }, [])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(200)
    }
  }, [loading])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<any>('/admin/admin-rooms')
      setRooms(response.rooms || [])
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
      setHostels([])
    }
  }

  // Update pricing when hostel is selected or capacity changes
  useEffect(() => {
    if (selectedHostelPricing && formData.capacity) {
      const capacity = parseInt(formData.capacity)
      let pricePerPerson = 0
      
      if (capacity === 1) {
        pricePerPerson = selectedHostelPricing.single || 0
      } else if (capacity === 2) {
        pricePerPerson = selectedHostelPricing.double || 0
      } else if (capacity === 4) {
        pricePerPerson = selectedHostelPricing.quadruple || 0
      } else {
        pricePerPerson = selectedHostelPricing.double || 0
      }
      
      const totalSemesterPrice = pricePerPerson * capacity
      setFormData(prev => ({ ...prev, monthlyRent: totalSemesterPrice.toString() }))
    }
  }, [formData.capacity, selectedHostelPricing])

  const handleTypeChange = (type: string, isBulk: boolean = false) => {
    const capacityMap: Record<string, string> = {
      'Single': '1',
      'Double': '2',
      'Triple': '3',
      'Quad': '4'
    }

    if (isBulk) {
      setBulkData(prev => ({
        ...prev,
        type,
        capacity: capacityMap[type] || prev.capacity
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        type,
        capacity: capacityMap[type] || prev.capacity
      }))
    }
  }

  const handleCapacityChange = (capacity: string, isBulk: boolean = false) => {
    const typeMap: Record<string, string> = {
      '1': 'Single',
      '2': 'Double',
      '3': 'Triple',
      '4': 'Quad'
    }

    if (isBulk) {
      setBulkData(prev => ({
        ...prev,
        capacity,
        type: typeMap[capacity] || 'custom'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        capacity,
        type: typeMap[capacity] || 'custom'
      }))
    }
  }

  const hostelOptions = hostels.length > 0 ? [
    { id: 'all', name: 'All Hostels' },
    ...hostels.map(hostel => ({ id: hostel.id, name: hostel.name }))
  ] : [
    { id: 'all', name: 'All Hostels' }
  ]

  const handleHostelChange = (hostelId: string) => {
    setFormData(prev => ({ ...prev, hostel: hostelId }))
    const selectedHostelData = hostels.find(h => h.id === hostelId)
    if (selectedHostelData && selectedHostelData.room_pricing) {
      setSelectedHostelPricing(selectedHostelData.room_pricing)
    } else {
      setSelectedHostelPricing(null)
    }
  }

  const roomTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'Single', name: 'Single Room' },
    { id: 'Double', name: 'Double Room' },
    { id: 'Triple', name: 'Triple Room' },
    { id: 'Quad', name: 'Quad Room' }
  ]

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hostel.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesHostel = selectedHostel === 'all' || room.hostelId === selectedHostel
    const matchesRoomType = selectedRoomType === 'all' || room.type === selectedRoomType
    
    return matchesSearch && matchesHostel && matchesRoomType
  })

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'available': return 'success'
      case 'partially_occupied': return 'warning'
      case 'occupied': return 'danger'
      case 'maintenance': return 'neutral'
      default: return 'neutral'
    }
  }

  const getConditionBadgeVariant = (condition: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' => {
    switch (condition) {
      case 'excellent': return 'success'
      case 'good': return 'info'
      case 'fair': return 'warning'
      case 'poor': return 'danger'
      default: return 'neutral'
    }
  }

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        roomNumber: formData.roomNumber,
        hostelId: formData.hostel,
        floorNumber: formData.floor,
        roomType: formData.type,
        capacity: formData.capacity,
        pricePerSemester: formData.monthlyRent,
        condition: formData.condition,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a)
      }

      const response = await fetch('/api/admin/admin-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      })

      if (response.ok) {
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
      hostel: room.hostelId,
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
    if (!editingRoom) return
    setIsSubmitting(true)
    try {
      const roomData = {
        roomNumber: formData.roomNumber,
        hostelId: formData.hostel,
        floorNumber: formData.floor,
        roomType: formData.type,
        capacity: formData.capacity,
        pricePerSemester: formData.monthlyRent,
        condition: formData.condition,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        isMaintenance: formData.condition === 'poor',
        isActive: true,
        gender: 'mixed'
      }

      const response = await fetch(`/api/admin/admin-rooms?id=${editingRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setEditingRoom(null)
        loadRooms()
      } else {
        const error = await response.json()
        alert(`Failed to update room: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating room:', error)
      alert('Failed to update room')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete room ${room.roomNumber}?`)) return
    try {
      const response = await fetch(`/api/admin/admin-rooms?id=${room.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        loadRooms()
      } else {
        const error = await response.json()
        alert(`Failed to delete room: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Failed to delete room')
    }
  }

  const handleBulkCreate = async () => {
    if (!bulkData.hostel || !bulkData.floor || !bulkData.startNumber || !bulkData.endNumber) {
      alert('Please fill out all required bulk fields')
      return
    }

    setIsSubmitting(true)
    try {
      const start = parseInt(bulkData.startNumber)
      const end = parseInt(bulkData.endNumber)
      if (isNaN(start) || isNaN(end) || start > end) {
        alert('Invalid room number range')
        setIsSubmitting(false)
        return
      }

      const roomsToCreate = []
      for (let i = start; i <= end; i++) {
        roomsToCreate.push({
          roomNumber: `${bulkData.prefix}${i}`,
          hostelId: bulkData.hostel,
          floorNumber: bulkData.floor,
          roomType: bulkData.type,
          capacity: bulkData.capacity,
          pricePerSemester: bulkData.pricePerSemester,
          condition: bulkData.condition,
          amenities: bulkData.amenities.split(',').map(a => a.trim()).filter(a => a)
        })
      }

      const response = await fetch('/api/admin/admin-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomsToCreate),
      })

      if (response.ok) {
        setShowBulkModal(false)
        setBulkData({
          hostel: '', floor: '', prefix: '', startNumber: '', endNumber: '',
          type: 'Double', capacity: '2', pricePerSemester: '', condition: 'good', amenities: ''
        })
        loadRooms()
      } else {
        const errorData = await response.json()
        alert(`Failed to create rooms: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error in bulk creation:', error)
      alert('Failed to process bulk creation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.occupied === r.capacity).length
  const availableRooms = rooms.filter(r => r.occupied < r.capacity && r.status !== 'maintenance').length
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length

  const columns: TableColumn[] = [
    {
      key: 'roomNumber',
      title: 'Room',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <DoorOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">Floor {row.floor}</div>
          </div>
        </div>
      )
    },
    {
      key: 'hostel',
      title: 'Hostel',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <ModernBadge variant="neutral">
          {value}
        </ModernBadge>
      )
    },
    {
      key: 'occupied',
      title: 'Occupancy',
      render: (value: number, row: any) => (
        <div className="flex items-center space-x-2">
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${value === row.capacity ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(value / row.capacity) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 font-medium">{value}/{row.capacity}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <ModernBadge variant={getStatusBadgeVariant(value)}>
          {value.replace('_', ' ')}
        </ModernBadge>
      )
    },
    {
      key: 'condition',
      title: 'Condition',
      render: (value: string) => (
        <ModernBadge variant={getConditionBadgeVariant(value)}>
          {value}
        </ModernBadge>
      )
    },
    {
      key: 'monthlyRent',
      title: 'Price',
      render: (value: number) => (
        <span className="font-semibold text-gray-900">${value}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: string, row: Room) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedRoom(row)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEditRoom(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100" 
            onClick={() => handleDeleteRoom(row)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="p-6">
        {/* Page Header */}
        <div className="page-header mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-1">Configure and monitor all hostel rooms</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowBulkModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Bulk Add
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedStatCard
            icon={Bed}
            label="Total Rooms"
            value={totalRooms}
            iconColor="blue"
          />
          <AnimatedStatCard
            icon={Users}
            label="Fully Occupied"
            value={occupiedRooms}
            iconColor="red"
          />
          <AnimatedStatCard
            icon={DoorOpen}
            label="Available Rooms"
            value={availableRooms}
            iconColor="green"
          />
          <AnimatedStatCard
            icon={Filter}
            label="Under Maintenance"
            value={maintenanceRooms}
            iconColor="orange"
          />
        </div>

        {/* Search and Filters */}
        <div className="content-section mb-6">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {hostelOptions.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>

                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {roomTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="text-sm font-medium text-gray-500">
                Found {filteredRooms.length} rooms
              </div>
            </div>
          </Card>
        </div>

        {/* Table Section */}
        <div className="content-section">
          <Card className="overflow-hidden border-none shadow-sm">
            {filteredRooms.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredRooms}
                pagination={true}
                pageSize={10}
              />
            ) : (
              <EmptyState
                icon={Bed}
                title="No Rooms Found"
                description="Try adjusting your search or filters to find what you're looking for."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearchTerm('')
                  setSelectedHostel('all')
                  setSelectedRoomType('all')
                }}
              />
            )}
          </Card>
        </div>
      </main>

      {/* Modals... (Modals preserved but styled with design tokens) */}
      {(showCreateModal || showBulkModal || selectedRoom) && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-none">
            {/* Modal content based on state */}
            {showCreateModal && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRoom ? 'Update Room' : 'Add New Room'}
                  </h2>
                  <button onClick={() => { setShowCreateModal(false); setEditingRoom(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                      <Input value={formData.roomNumber} onChange={(e) => setFormData(p => ({ ...p, roomNumber: e.target.value }))} placeholder="e.g. 302" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hostel</label>
                      <select value={formData.hostel} onChange={(e) => handleHostelChange(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Select Hostel</option>
                        {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Floor Number</label>
                      <Input type="number" value={formData.floor} onChange={(e) => setFormData(p => ({ ...p, floor: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Room Capacity</label>
                      <Input type="number" value={formData.capacity} onChange={(e) => handleCapacityChange(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                      <select value={formData.type} onChange={(e) => handleTypeChange(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="custom">Custom</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Triple">Triple</option>
                        <option value="Quad">Quad</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Semester ($)</label>
                      <Input type="number" value={formData.monthlyRent} onChange={(e) => setFormData(p => ({ ...p, monthlyRent: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                    <select value={formData.condition} onChange={(e) => setFormData(p => ({ ...p, condition: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities (comma separated)</label>
                    <textarea value={formData.amenities} onChange={(e) => setFormData(p => ({ ...p, amenities: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-20" placeholder="Wi-Fi, AC, Study Desk" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingRoom(null); }}>Cancel</Button>
                  <Button onClick={editingRoom ? handleUpdateRoom : handleCreateRoom} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : editingRoom ? 'Update Room' : 'Create Room'}
                  </Button>
                </div>
              </div>
            )}

            {showBulkModal && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Bulk Create Rooms</h2>
                  <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hostel *</label>
                      <select value={bulkData.hostel} onChange={(e) => setBulkData(p => ({ ...p, hostel: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Select Hostel</option>
                        {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Floor Number *</label>
                      <Input type="number" value={bulkData.floor} onChange={(e) => setBulkData(p => ({ ...p, floor: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Prefix</label>
                      <Input value={bulkData.prefix} onChange={(e) => setBulkData(p => ({ ...p, prefix: e.target.value }))} placeholder="e.g. A-" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start *</label>
                      <Input type="number" value={bulkData.startNumber} onChange={(e) => setBulkData(p => ({ ...p, startNumber: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End *</label>
                      <Input type="number" value={bulkData.endNumber} onChange={(e) => setBulkData(p => ({ ...p, endNumber: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                      <select value={bulkData.type} onChange={(e) => handleTypeChange(e.target.value, true)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Triple">Triple</option>
                        <option value="Quad">Quad</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                      <Input type="number" value={bulkData.capacity} onChange={(e) => handleCapacityChange(e.target.value, true)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Semester Price ($)</label>
                    <Input type="number" value={bulkData.pricePerSemester} onChange={(e) => setBulkData(p => ({ ...p, pricePerSemester: e.target.value }))} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <Button variant="outline" onClick={() => setShowBulkModal(false)}>Cancel</Button>
                  <Button onClick={handleBulkCreate} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Rooms'}
                  </Button>
                </div>
              </div>
            )}

            {selectedRoom && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <DoorOpen className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Room {selectedRoom.roomNumber}</h2>
                      <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedRoom.hostel} • Floor {selectedRoom.floor}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Details</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <ModernBadge variant={getStatusBadgeVariant(selectedRoom.status)}>{selectedRoom.status.replace('_', ' ')}</ModernBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Condition</span>
                          <ModernBadge variant={getConditionBadgeVariant(selectedRoom.condition)}>{selectedRoom.condition}</ModernBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Price</span>
                          <span className="text-sm font-bold text-blue-600">${selectedRoom.monthlyRent} / sem</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Occupancy</span>
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">{selectedRoom.occupied} / {selectedRoom.capacity}</span>
                             <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${(selectedRoom.occupied / selectedRoom.capacity) * 100}%` }} />
                             </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.amenities.map((a, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{a}</span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Maintenance</h3>
                      <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-3">
                         <div className="flex justify-between text-xs">
                           <span className="text-orange-600">Last Check</span>
                           <span className="font-bold text-orange-900">{new Date(selectedRoom.lastMaintenance).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-orange-600">Next Due</span>
                           <span className="font-bold text-orange-900">{new Date(selectedRoom.nextMaintenance).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Current Occupants</h3>
                      <div className="space-y-2">
                        {selectedRoom.occupants.length > 0 ? (
                           selectedRoom.occupants.map((o: any, i: number) => (
                             <div key={i} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between">
                               <span className="text-sm font-medium">{o.name}</span>
                               <span className="text-xs text-gray-500">{o.indexNumber}</span>
                             </div>
                           ))
                        ) : (
                          <div className="flex flex-col items-center py-6 text-gray-400">
                             <Users className="w-8 h-8 opacity-20 mb-2" />
                             <span className="text-xs font-medium">No active occupants</span>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                  <Button variant="outline" onClick={() => setSelectedRoom(null)}>Close</Button>
                  <Button onClick={() => { handleEditRoom(selectedRoom); setSelectedRoom(null); }}>Edit Room Details</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
