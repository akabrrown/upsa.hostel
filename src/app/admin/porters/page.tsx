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
import { Search, Plus, Edit, Trash2, Users, Building, Calendar, Clock, CheckCircle, Eye, MoreVertical } from 'lucide-react'
import { TableColumn } from '@/types'

interface Porter {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeId: string
  
  // Assignment
  assignedHostel?: string
  assignedFloors?: number[]
  
  // Status and availability
  status: 'active' | 'inactive' | 'on-leave'
  isOnDuty: boolean
  lastCheckIn?: string
  lastCheckOut?: string
  
  // Performance metrics
  totalCheckIns: number
  totalCheckOuts: number
  averageResponseTime: number // in minutes
  
  // Employment details
  hireDate: string
  department: string
  supervisor: string
  
  // Contact info
  emergencyContact: string
  address: string
}

interface CheckInRecord {
  id: string
  porterId: string
  porterName: string
  checkInTime: string
  checkOutTime?: string
  duration?: number // in hours
  location: string
  notes?: string
}

export default function AdminPorters() {
  const [porters, setPorters] = useState<Porter[]>([])
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPorter, setSelectedPorter] = useState<Porter | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    assignedHostel: '',
    department: '',
    supervisor: '',
    emergencyContact: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'on-leave'
  })
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    // In real app, this would come from API
    const portersData: Porter[] = []
    const checkInData: CheckInRecord[] = []

    setTimeout(() => {
      setPorters(portersData)
      setCheckInHistory(checkInData)
      
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
      .fromTo('.porters-table',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
    }, 1000)
  }, [user, router])

  const filteredPorters = porters.filter(porter => {
    const matchesSearch = 
      porter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || porter.status === selectedStatus
    const matchesHostel = selectedHostel === 'all' || porter.assignedHostel === selectedHostel
    
    return matchesSearch && matchesStatus && matchesHostel
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'on-leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreatePorter = () => {
    // Handle porter creation
    console.log('Creating porter:', formData)
    setShowCreateModal(false)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      assignedHostel: '',
      department: '',
      supervisor: '',
      emergencyContact: '',
      address: '',
      status: 'active'
    })
  }

  const handleEditPorter = (porter: Porter) => {
    setSelectedPorter(porter)
    setFormData({
      firstName: porter.firstName,
      lastName: porter.lastName,
      email: porter.email,
      phone: porter.phone,
      employeeId: porter.employeeId,
      assignedHostel: porter.assignedHostel || '',
      department: porter.department,
      supervisor: porter.supervisor,
      emergencyContact: porter.emergencyContact,
      address: porter.address,
      status: porter.status
    })
    setShowCreateModal(true)
  }

  const handleUpdatePorter = () => {
    // Handle porter update
    console.log('Updating porter:', selectedPorter?.id, formData)
    setShowCreateModal(false)
    setSelectedPorter(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      assignedHostel: '',
      department: '',
      supervisor: '',
      emergencyContact: '',
      address: '',
      status: 'active'
    })
  }

  const handleDeletePorter = (id: string) => {
    // Handle porter deletion
    console.log('Deleting porter:', id)
  }

  const handleViewDetails = (porter: Porter) => {
    setSelectedPorter(porter)
  }

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Porter Information',
      render: (value: any, row: Porter) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
            <div className="text-xs text-gray-400">ID: {row.employeeId}</div>
            <div className="text-xs text-gray-400">{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'assignment',
      title: 'Assignment',
      render: (value: any, row: Porter) => (
        <div>
          {row.assignedHostel ? (
            <div className="space-y-1">
              <div className="font-medium text-gray-900">{row.assignedHostel}</div>
              <div className="text-sm text-gray-500">
                Floors: {row.assignedFloors?.join(', ')}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Not assigned</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, row: Porter) => (
        <div className="space-y-2">
          <Badge className={getStatusColor(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1).replace('-', ' ')}
          </Badge>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              row.isOnDuty ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {row.isOnDuty ? 'On Duty' : 'Off Duty'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'performance',
      title: 'Performance',
      render: (value: any, row: Porter) => (
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">Check-ins:</span> {row.totalCheckIns}
          </div>
          <div>
            <span className="font-medium">Check-outs:</span> {row.totalCheckOuts}
          </div>
          <div>
            <span className="font-medium">Avg Response:</span> {row.averageResponseTime}min
          </div>
        </div>
      )
    },
    {
      key: 'lastActivity',
      title: 'Last Activity',
      render: (value: any, row: Porter) => (
        <div className="space-y-1 text-sm">
          {row.lastCheckIn && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>In: {new Date(row.lastCheckIn).toLocaleDateString()}</span>
            </div>
          )}
          {row.lastCheckOut && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>Out: {new Date(row.lastCheckOut).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Porter) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditPorter(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDeletePorter(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  const totalPorters = porters.length
  const activePorters = porters.filter(p => p.status === 'active').length
  const onDutyPorters = porters.filter(p => p.isOnDuty).length
  const onLeavePorters = porters.filter(p => p.status === 'on-leave').length

  const hostels = [
    { id: 'all', name: 'All Hostels' },
    { id: 'Hostel A', name: 'Hostel A' },
    { id: 'Hostel B', name: 'Hostel B' },
    { id: 'Hostel C', name: 'Hostel C' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'on-leave', name: 'On Leave' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Porter Management</h1>
                <p className="text-gray-600 mt-1">Manage hostel porters and their assignments</p>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Porter
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Porters</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPorters}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activePorters}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On Duty</p>
                    <p className="text-2xl font-bold text-blue-600">{onDutyPorters}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On Leave</p>
                    <p className="text-2xl font-bold text-yellow-600">{onLeavePorters}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
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
                      placeholder="Search porters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
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
                  Showing {filteredPorters.length} of {totalPorters} porters
                </div>
              </div>
            </Card>
          </div>

          {/* Porters Table */}
          <div className="porters-table">
            <Card className="overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredPorters}
                pagination={true}
                pageSize={10}
                searchable={true}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Create/Edit Porter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPorter ? 'Edit Porter' : 'Add New Porter'}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedPorter(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <Input
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      placeholder="Enter employee ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Hostel
                    </label>
                    <select
                      value={formData.assignedHostel}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedHostel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Hostel</option>
                      <option value="Hostel A">Hostel A</option>
                      <option value="Hostel B">Hostel B</option>
                      <option value="Hostel C">Hostel C</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supervisor
                    </label>
                    <Input
                      value={formData.supervisor}
                      onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                      placeholder="Enter supervisor name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Enter emergency contact"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedPorter(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={selectedPorter ? handleUpdatePorter : handleCreatePorter}>
                  {selectedPorter ? 'Update Porter' : 'Add Porter'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
