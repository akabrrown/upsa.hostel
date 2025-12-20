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

  const hostels = [
    { id: 'all', name: 'All Hostels' },
    { id: 'Block A', name: 'Block A' },
    { id: 'Block B', name: 'Block B' },
    { id: 'Block C', name: 'Block C' }
  ]

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
      title: 'Monthly Rent',
      render: (value: number) => (
        <span className="font-semibold">${value}</span>
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
            <Button>
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
                  {hostels.map(hostel => (
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
    </div>
  )
}
