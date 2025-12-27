'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Plus, Edit, Trash2, Building, MapPin, Users, Bed, Eye, Settings, X, Info } from 'lucide-react'
import { TableColumn } from '@/types'
import FloorGenderConfig from '@/components/admin/FloorGenderConfig'
import { initPageAnimations } from '@/lib/animations'

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
  pricePerSemester: number
  pricePerYear: number
  gender: 'Male' | 'Female' | 'Mixed'
  amenities: string[]
  description: string
  roomPricing?: {
    single: number
    double: number
    quadruple: number
  }
}

export default function AdminHostels() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const [showFloorConfigModal, setShowFloorConfigModal] = useState(false)
  const [configuringHostel, setConfiguringHostel] = useState<Hostel | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    totalFloors: '',
    warden: '',
    contact: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
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
  }, [user, router])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(200)
    }
  }, [loading])

  const fetchHostels = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hostels', { cache: 'no-store' })
      if (response.ok) {
        const result = await response.json()
        const transformedHostels = result.hostels.map((hostel: any) => ({
          id: hostel.id,
          name: hostel.name,
          code: hostel.code || hostel.name.substring(0, 3).toUpperCase(),
          address: hostel.address,
          totalFloors: hostel.totalFloors || 1,
          totalRooms: hostel.totalRooms || 0,
          totalBeds: hostel.totalBeds || 0,
          occupiedBeds: hostel.occupiedBeds || 0,
          availableBeds: hostel.availableBeds || 0,
          warden: hostel.warden || 'Not assigned',
          contact: hostel.contact || 'Not assigned',
          status: hostel.status || 'inactive',
          createdAt: hostel.createdAt,
          pricePerSemester: hostel.pricePerSemester || 0,
          pricePerYear: hostel.pricePerYear || 0,
          gender: hostel.gender || 'Mixed',
          amenities: hostel.amenities || [],
          description: hostel.description || '',
          roomPricing: hostel.roomPricing
        }))
        setHostels(transformedHostels)
      }
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
      setHostels([])
    } finally {
      setLoading(false)
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

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'active': return 'success'
      case 'maintenance': return 'warning'
      case 'inactive': return 'neutral'
      default: return 'neutral'
    }
  }

  const handleCreateHostel = async () => {
    try {
      if (!formData.name || !formData.address || !formData.warden || !formData.contact) {
        alert('Please fill in all required fields')
        return
      }

      const singlePrice = parseFloat(formData.singleRoomPrice) || 0
      const doublePrice = parseFloat(formData.doubleRoomPrice) || 0
      const quadruplePrice = parseFloat(formData.quadrupleRoomPrice) || 0

      const hostelData = {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        gender: formData.gender.toLowerCase(),
        totalFloors: parseInt(formData.totalFloors) || 1,
        wardenName: formData.warden,
        wardenEmail: formData.contact.includes('@') ? formData.contact : `${formData.warden.toLowerCase().replace(/\s+/g, '.')}@upsamail.edu.gh`,
        wardenPhone: formData.contact,
        isActive: formData.status === 'active',
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        roomPricing: {
          single: singlePrice,
          double: doublePrice,
          quadruple: quadruplePrice
        }
      }

      const response = await fetch('/api/hostels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostelData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '', code: '', address: '', totalFloors: '', warden: '', contact: '',
          status: 'active', singleRoomPrice: '', doubleRoomPrice: '', quadrupleRoomPrice: '',
          gender: 'Male', amenities: '', description: ''
        })
        fetchHostels()
      } else {
        const errorData = await response.json()
        alert(`Failed to create hostel: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating hostel:', error)
      alert('Failed to create hostel')
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
      singleRoomPrice: hostel.roomPricing?.single?.toString() || '',
      doubleRoomPrice: hostel.roomPricing?.double?.toString() || '',
      quadrupleRoomPrice: hostel.roomPricing?.quadruple?.toString() || '',
      gender: hostel.gender,
      amenities: hostel.amenities.join(', '),
      description: hostel.description
    })
    setShowCreateModal(true)
  }

  const handleDeleteHostel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hostel? All associated rooms will also be affected.')) return
    try {
      const response = await fetch(`/api/hostels?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchHostels()
      } else {
        alert('Failed to delete hostel')
      }
    } catch (error) {
      console.error('Error deleting hostel:', error)
    }
  }

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Hostel Info',
      render: (value: string, row: Hostel) => (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{value}</div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{row.code}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {row.address}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      title: 'Capacity & Occupancy',
      render: (value: any, row: Hostel) => (
        <div className="space-y-3 py-2 min-w-[180px]">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Beds Occupied</span>
            <span className="text-sm font-bold text-gray-900">{row.occupiedBeds} / {row.totalBeds}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${row.occupiedBeds / row.totalBeds > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${(row.occupiedBeds / (row.totalBeds || 1)) * 100}%` }}
            />
          </div>
          <div className="flex gap-4">
             <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase">
                <Users className="w-3 h-3 mr-1" /> {row.totalRooms} Rooms
             </div>
             <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase">
                <Bed className="w-3 h-3 mr-1 text-green-500" /> {row.availableBeds} Free
             </div>
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      title: 'Pricing Preview',
      render: (value: any, row: Hostel) => (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-900">
             <span className="text-gray-400">Single:</span> ${row.roomPricing?.single || row.pricePerSemester}
          </div>
          <div className="text-xs font-medium text-gray-900">
             <span className="text-gray-400">Double:</span> ${row.roomPricing?.double || 0}
          </div>
          <div className="text-xs font-medium text-gray-900">
             <span className="text-gray-400">Quad:</span> ${row.roomPricing?.quadruple || 0}
          </div>
          <ModernBadge variant="neutral" className="mt-2">{row.gender}</ModernBadge>
        </div>
      )
    },
    {
      key: 'warden',
      title: 'Management',
      render: (value: string, row: Hostel) => (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{value}</div>
          <div className="text-xs text-gray-500 mt-1">{row.contact}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <ModernBadge variant={getStatusBadgeVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </ModernBadge>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Hostel) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => { setConfiguringHostel(row); setShowFloorConfigModal(true); }}
            title="Configure Floors"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEditHostel(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
            onClick={() => handleDeleteHostel(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  const totalCapacity = hostels.reduce((sum, h) => sum + h.totalBeds, 0)
  const totalOccupied = hostels.reduce((sum, h) => sum + h.occupiedBeds, 0)

  if (loading) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
       </div>
     )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="p-6">
        {/* Page Header */}
        <div className="page-header mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
            <p className="text-gray-600 mt-1">Property configuration and portfolio oversight</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Hostel
          </Button>
        </div>

        {/* Stats Section */}
        <div className="stats-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <AnimatedStatCard
             icon={Building}
             label="Total Hostels"
             value={hostels.length}
             iconColor="blue"
           />
           <AnimatedStatCard
             icon={Users}
             label="Total Capacity"
             value={totalCapacity}
             iconColor="purple"
           />
           <AnimatedStatCard
             icon={Bed}
             label="Global Occupancy"
             value={`${totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0}%`}
             iconColor="green"
           />
           <AnimatedStatCard
             icon={Settings}
             label="Active Units"
             value={hostels.filter(h => h.status === 'active').length}
             iconColor="orange"
           />
        </div>

        {/* Search & Filters */}
        <div className="content-section mb-6">
           <Card className="p-4">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                     <Input
                       placeholder="Search name, code, or address..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 w-full md:w-80"
                     />
                   </div>
                   <select
                     value={selectedStatus}
                     onChange={(e) => setSelectedStatus(e.target.value)}
                     className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                   >
                     <option value="all">All Status</option>
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                     <option value="maintenance">Maintenance</option>
                   </select>
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                   {filteredHostels.length} Properties Found
                </div>
             </div>
           </Card>
        </div>

        {/* Hostels Table */}
        <div className="content-section">
           <Card className="overflow-hidden border-none shadow-sm">
              {filteredHostels.length > 0 ? (
                 <DataTable
                   columns={columns}
                   data={filteredHostels}
                   pagination={true}
                   pageSize={10}
                 />
              ) : (
                <EmptyState
                  icon={Building}
                  title="No Hostels Defined"
                  description="Start by adding your first hostel property to the system."
                  actionLabel="Create Hostel"
                  onAction={() => setShowCreateModal(true)}
                />
              )}
           </Card>
        </div>
      </main>

      {/* Floor Configuration Modal */}
      {showFloorConfigModal && configuringHostel && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900">Floor Configuration</h2>
                   <p className="text-sm text-gray-500 mt-1">{configuringHostel.name} • Setup floor-level gender rules</p>
                 </div>
                 <button onClick={() => setShowFloorConfigModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                 </button>
              </div>
              <FloorGenderConfig hostelId={configuringHostel.id} totalFloors={configuringHostel.totalFloors} />
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                 <Button onClick={() => setShowFloorConfigModal(false)}>Close Configurator</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create/Edit Hostel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHostel ? 'Update Property' : 'Deploy New Hostel'}
                </h2>
                <button onClick={() => { setShowCreateModal(false); setEditingHostel(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-8">
                <section>
                   <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hostel Name *</label>
                        <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Diamond Jubilee Hall" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Internal Code</label>
                        <Input value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="e.g. DJH" />
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Pricing Structure (Per Semester)</h3>
                   <div className="bg-gray-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Single Room</label>
                        <Input type="number" value={formData.singleRoomPrice} onChange={(e) => setFormData(p => ({ ...p, singleRoomPrice: e.target.value }))} placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Double Room</label>
                        <Input type="number" value={formData.doubleRoomPrice} onChange={(e) => setFormData(p => ({ ...p, doubleRoomPrice: e.target.value }))} placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quad/Other</label>
                        <Input type="number" value={formData.quadrupleRoomPrice} onChange={(e) => setFormData(p => ({ ...p, quadrupleRoomPrice: e.target.value }))} placeholder="0.00" />
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Location & Logistics</h3>
                   <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Physical Address *</label>
                        <Input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="GPS Coordinate or Local Address" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Floors</label>
                          <Input type="number" value={formData.totalFloors} onChange={(e) => setFormData(p => ({ ...p, totalFloors: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Gender</label>
                          <select value={formData.gender} onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value as any }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20">
                            <option value="Male">Male Only</option>
                            <option value="Female">Female Only</option>
                            <option value="Mixed">Mixed Housing</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Op Status</label>
                          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20">
                            <option value="active">Active/Open</option>
                            <option value="inactive">Inactive/Closed</option>
                            <option value="maintenance">Under Maintenance</option>
                          </select>
                        </div>
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Staffing & Amenities</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Warden Name</label>
                        <Input value={formData.warden} onChange={(e) => setFormData(p => ({ ...p, warden: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Link (Email/Phone)</label>
                        <Input value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))} />
                      </div>
                   </div>
                   <div className="mt-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities (Comma separated)</label>
                      <Input value={formData.amenities} onChange={(e) => setFormData(p => ({ ...p, amenities: e.target.value }))} placeholder="AC, Wi-Fi, Gym, Laundry..." />
                   </div>
                </section>
              </div>
              
              <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingHostel(null); }}>Discard Changes</Button>
                <Button onClick={editingHostel ? () => {} : handleCreateHostel}>
                  {editingHostel ? 'Submit Updates' : 'Launch Hostel'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
