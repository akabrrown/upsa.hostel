'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState, store } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import Badge from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Building, MapPin, Users, Bed, Eye, MoreVertical } from 'lucide-react'
import { TableColumn } from '@/types'

// Suppress hydration warnings from browser extensions
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  
  console.error = (...args) => {
    const message = String(args[0]) || ''
    const stack = args[0]?.stack || ''
    
    // Suppress all browser extension related hydration warnings
    if (
      message.includes('Extra attributes from the server') ||
      message.includes('webcrx') ||
      message.includes('data-new-gr-c-s-check-loaded') ||
      message.includes('data-gr-ext-installed') ||
      message.includes('data-gr-') ||
      message.includes('data-new-') ||
      (args[0] && typeof args[0] === 'object' && args[0].message?.includes?.('Extra attributes')) ||
      message.includes('hydration') ||
      message.includes('installHook.js') ||
      stack.includes('installHook.js') ||
      (args[0] && typeof args[0] === 'object' && args[0].stack?.includes?.('installHook.js'))
    ) {
      return // Suppress browser extension hydration warnings
    }
    originalConsoleError.apply(console, args)
  }
  
  console.warn = (...args) => {
    const message = String(args[0]) || ''
    if (message.includes('hydration') || message.includes('Extra attributes')) {
      return // Suppress hydration warnings
    }
    originalConsoleWarn.apply(console, args)
  }
}

interface Hostel {
  id: string
  name: string
  code: string
  address: string
  totalFloors: number
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  warden: string
  contact: string
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: string
  // Pricing information
  pricePerSemester: number
  pricePerYear: number
  gender: 'Male' | 'Female' | 'Mixed'
  amenities: string[]
  description: string
}

export default function AdminHostels() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    totalFloors: '',
    warden: '',
    contact: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    // Room type pricing
    singleRoomPrice: '',
    doubleRoomPrice: '',
    quadrupleRoomPrice: '',
    gender: 'Male' as 'Male' | 'Female' | 'Mixed',
    amenities: '',
    description: ''
  })
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    fetchHostels()

    // In real app, this would come from API
    setTimeout(() => {
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
      .fromTo('.hostels-table',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
    }, 1000)
  }, [user, router])

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostels')
      if (response.ok) {
        const result = await response.json()
        // Use real API data without mock transformations
        const transformedHostels = result.hostels.map((hostel: any) => ({
          id: hostel.id,
          name: hostel.name,
          code: hostel.name.substring(0, 3).toUpperCase(),
          address: hostel.address,
          totalFloors: hostel.total_floors || 1,
          totalRooms: hostel.total_rooms || 0,
          totalBeds: hostel.total_beds || 0,
          occupiedBeds: hostel.occupied_beds || 0,
          availableBeds: hostel.available_beds || 0,
          warden: hostel.warden_name || 'Not assigned',
          contact: hostel.warden_phone || 'Not assigned',
          status: hostel.is_active ? 'active' : 'inactive',
          createdAt: hostel.created_at,
          pricePerSemester: hostel.room_pricing?.single * 4 || 0,
          pricePerYear: hostel.room_pricing?.single * 12 || 0,
          gender: hostel.gender?.charAt(0).toUpperCase() + hostel.gender?.slice(1) || 'Mixed',
          amenities: hostel.amenities || [],
          description: hostel.description || ''
        }))
        setHostels(transformedHostels)
      }
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
      setHostels([]) // Set empty array instead of keeping mock data
    }
  }

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = 
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.warden.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || hostel.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'maintenance': return 'warning'
      default: return 'default'
    }
  }

  const handleCreateHostel = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.warden || !formData.contact) {
        alert('Please fill in all required fields')
        return
      }

      // Validate pricing fields
      const singlePrice = parseFloat(formData.singleRoomPrice) || 0
      const doublePrice = parseFloat(formData.doubleRoomPrice) || 0
      const quadruplePrice = parseFloat(formData.quadrupleRoomPrice) || 0

      if (singlePrice <= 0 || doublePrice <= 0 || quadruplePrice <= 0) {
        alert('Please set prices for all room types')
        return
      }

      // Prepare data for API with room type pricing
      const hostelData = {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        gender: formData.gender.toLowerCase(),
        totalFloors: parseInt(formData.totalFloors) || 1,
        wardenName: formData.warden,
        wardenEmail: formData.contact.includes('@') ? formData.contact : `${formData.warden.toLowerCase().replace(/\s+/g, '.')}@upsa.edu.gh`,
        wardenPhone: formData.contact,
        isActive: formData.status === 'active',
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        roomPricing: {
          single: singlePrice,
          double: doublePrice,
          quadruple: quadruplePrice
        }
      }

      console.log('Sending hostel data:', hostelData)

      const response = await fetch('/api/hostels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hostelData),
      })

      if (response.ok) {
        const result = await response.json()
        alert('Hostel created successfully!')
        setShowCreateModal(false)
        // Reset form
        setFormData({
          name: '',
          code: '',
          address: '',
          totalFloors: '',
          warden: '',
          contact: '',
          status: 'active',
          singleRoomPrice: '',
          doubleRoomPrice: '',
          quadrupleRoomPrice: '',
          gender: 'Male',
          amenities: '',
          description: ''
        })
        // Refresh hostels list
        fetchHostels()
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Failed to create hostel: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating hostel:', error)
      alert('Failed to create hostel. Please try again.')
    }
  }

  const handleEditHostel = (hostel: Hostel) => {
    setEditingHostel(hostel)
    setFormData({
      name: hostel.name,
      code: hostel.code,
      address: hostel.address,
      totalFloors: hostel.totalFloors.toString(),
      warden: hostel.warden,
      contact: hostel.contact,
      status: hostel.status,
      singleRoomPrice: hostel.pricePerSemester ? (hostel.pricePerSemester / 4).toString() : '',
      doubleRoomPrice: hostel.pricePerSemester ? (hostel.pricePerSemester / 6).toString() : '',
      quadrupleRoomPrice: hostel.pricePerSemester ? (hostel.pricePerSemester / 8).toString() : '',
      gender: hostel.gender,
      amenities: hostel.amenities.join(', '),
      description: hostel.description
    })
    setShowCreateModal(true)
  }

  const handleUpdateHostel = () => {
    // Handle hostel update
    console.log('Updating hostel:', editingHostel?.id, formData)
    setShowCreateModal(false)
    setEditingHostel(null)
    setFormData({
      name: '',
      code: '',
      address: '',
      totalFloors: '',
      warden: '',
      contact: '',
      status: 'active',
      singleRoomPrice: '',
      doubleRoomPrice: '',
      quadrupleRoomPrice: '',
      gender: 'Male',
      amenities: '',
      description: ''
    })
  }

  const handleDeleteHostel = (id: string) => {
    // Handle hostel deletion
    console.log('Deleting hostel:', id)
  }

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Hostel Information',
      render: (value: string, row: Hostel) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">Code: {row.code}</div>
            <div className="text-xs text-gray-400 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {row.address}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      title: 'Capacity',
      render: (value: any, row: Hostel) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Building className="w-4 h-4 mr-1 text-gray-400" />
            {row.totalFloors} floors
          </div>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1 text-gray-400" />
            {row.totalRooms} rooms
          </div>
          <div className="flex items-center text-sm">
            <Bed className="w-4 h-4 mr-1 text-gray-400" />
            {row.totalBeds} beds
          </div>
        </div>
      )
    },
    {
      key: 'occupancy',
      title: 'Occupancy',
      render: (value: any, row: Hostel) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Occupied:</span>
            <span className="font-medium">{row.occupiedBeds}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Available:</span>
            <span className="font-medium text-green-600">{row.availableBeds}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(row.occupiedBeds / row.totalBeds) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            {((row.occupiedBeds / row.totalBeds) * 100).toFixed(1)}% occupied
          </div>
        </div>
      )
    },
    {
      key: 'warden',
      title: 'Warden',
      render: (value: string, row: Hostel) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.contact}</div>
        </div>
      )
    },
    {
      key: 'pricing',
      title: 'Room Pricing',
      render: (value: any, row: Hostel) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>1-Person:</span>
            <span className="font-medium">${row.pricePerSemester}/semester</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>2-Person:</span>
            <span className="font-medium">${(row.pricePerSemester * 0.67).toFixed(0)}/semester</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>4-Person:</span>
            <span className="font-medium">${(row.pricePerSemester * 0.5).toFixed(0)}/semester</span>
          </div>
          <div className="text-xs text-gray-500">
            {row.gender}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Hostel) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditHostel(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDeleteHostel(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  const totalHostels = hostels.length
  const activeHostels = hostels.filter(h => h.status === 'active').length
  const totalCapacity = hostels.reduce((sum, h) => sum + h.totalBeds, 0)
  const totalOccupied = hostels.reduce((sum, h) => sum + h.occupiedBeds, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
                <p className="text-gray-600 mt-1">Manage hostel properties and occupancy</p>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Hostel
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hostels</p>
                    <p className="text-2xl font-bold text-gray-900">{totalHostels}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activeHostels}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bed className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Occupied</p>
                    <p className="text-2xl font-bold text-blue-600">{totalOccupied}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
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
                      placeholder="Search hostels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  Showing {filteredHostels.length} of {totalHostels} hostels
                </div>
              </div>
            </Card>
          </div>

          {/* Hostels Table */}
          <div className="hostels-table">
            <Card className="overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredHostels}
                pagination={true}
                pageSize={10}
                searchable={true}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Create/Edit Hostel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingHostel ? 'Edit Hostel' : 'Create New Hostel'}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingHostel(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter hostel name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel Code
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Enter hostel code"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter hostel address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Floors
                    </label>
                    <Input
                      type="number"
                      value={formData.totalFloors}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalFloors: e.target.value }))}
                      placeholder="Enter number of floors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warden Name
                    </label>
                    <Input
                      value={formData.warden}
                      onChange={(e) => setFormData(prev => ({ ...prev, warden: e.target.value }))}
                      placeholder="Enter warden name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1-Person Room Price (Per Semester)
                    </label>
                    <Input
                      type="number"
                      value={formData.singleRoomPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, singleRoomPrice: e.target.value }))}
                      placeholder="e.g., 1200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2-Person Room Price (Per Semester)
                    </label>
                    <Input
                      type="number"
                      value={formData.doubleRoomPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, doubleRoomPrice: e.target.value }))}
                      placeholder="e.g., 800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4-Person Room Price (Per Semester)
                    </label>
                    <Input
                      type="number"
                      value={formData.quadrupleRoomPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, quadrupleRoomPrice: e.target.value }))}
                      placeholder="e.g., 600"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Type
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (comma separated)
                    </label>
                    <Input
                      value={formData.amenities}
                      onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                      placeholder="Wi-Fi, Parking, Security"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter hostel description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingHostel(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingHostel ? handleUpdateHostel : handleCreateHostel}>
                  {editingHostel ? 'Update Hostel' : 'Create Hostel'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
