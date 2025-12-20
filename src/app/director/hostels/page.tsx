'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'
import { Edit, Save, X, Plus, Building, Users, DollarSign, Bed, Wifi, Car, Shield } from 'lucide-react'
import { RootState } from '@/store'

interface HostelData {
  id: string
  name: string
  capacity: number
  currentOccupancy: number
  gender: 'Male' | 'Female' | 'Mixed'
  pricePerSemester: number
  pricePerYear: number
  amenities: string[]
  description: string
  status: 'active' | 'maintenance' | 'inactive'
  warden: string
  contact: string
  rooms: Array<{
    number: string
    capacity: number
    currentOccupancy: number
    type: 'single' | 'double' | 'triple'
    price: number
  }>
}

export default function DirectorHostelsPage() {
  const [hostels, setHostels] = useState<HostelData[]>([])

  const [editingHostel, setEditingHostel] = useState<string | null>(null)
  const [showAddHostelForm, setShowAddHostelForm] = useState(false)
  const [newHostel, setNewHostel] = useState<Partial<HostelData>>({
    name: '',
    capacity: 0,
    gender: 'Male',
    pricePerSemester: 0,
    pricePerYear: 0,
    amenities: [],
    description: '',
    status: 'active',
    warden: '',
    contact: '',
    rooms: []
  })

  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'director') {
      router.push('/login')
    }
  }, [user, router])

  const handleEditHostel = (hostelId: string) => {
    setEditingHostel(editingHostel === hostelId ? null : hostelId)
  }

  const handleSaveHostel = (hostelId: string, updatedData: Partial<HostelData>) => {
    setHostels(prev => prev.map(hostel => 
      hostel.id === hostelId ? { ...hostel, ...updatedData } : hostel
    ))
    setEditingHostel(null)
  }

  const handleAddHostel = () => {
    if (newHostel.name && newHostel.capacity) {
      const hostel: HostelData = {
        id: Date.now().toString(),
        name: newHostel.name,
        capacity: newHostel.capacity || 0,
        currentOccupancy: 0,
        gender: newHostel.gender || 'Male',
        pricePerSemester: newHostel.pricePerSemester || 0,
        pricePerYear: newHostel.pricePerYear || 0,
        amenities: newHostel.amenities || [],
        description: newHostel.description || '',
        status: newHostel.status || 'active',
        warden: newHostel.warden || '',
        contact: newHostel.contact || '',
        rooms: []
      }
      setHostels(prev => [...prev, hostel])
      setShowAddHostelForm(false)
      setNewHostel({
        name: '',
        capacity: 0,
        gender: 'Male',
        pricePerSemester: 0,
        pricePerYear: 0,
        amenities: [],
        description: '',
        status: 'active',
        warden: '',
        contact: '',
        rooms: []
      })
    }
  }

  const handleDeleteHostel = (hostelId: string) => {
    setHostels(prev => prev.filter(hostel => hostel.id !== hostelId))
  }

  const getOccupancyRate = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100)
  }

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
                  <p className="text-gray-600 mt-2">Manage hostel information, pricing, and occupancy</p>
                </div>
                <Button 
                  onClick={() => setShowAddHostelForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Hostel
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Hostels</p>
                    <p className="text-2xl font-bold text-gray-900">{hostels.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hostels.reduce((sum, h) => sum + h.capacity, 0)}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Bed className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Occupied</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hostels.reduce((sum, h) => sum + h.currentOccupancy, 0)}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Avg. Price/Semester</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Math.round(hostels.reduce((sum, h) => sum + h.pricePerSemester, 0) / hostels.length)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Add Hostel Form */}
            {showAddHostelForm && (
              <Card className="p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Add New Hostel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Hostel Name"
                    value={newHostel.name || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Capacity"
                    value={newHostel.capacity || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={newHostel.gender}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' | 'Mixed' }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Price Per Semester"
                    value={newHostel.pricePerSemester || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, pricePerSemester: parseInt(e.target.value) || 0 }))}
                  />
                  <Input
                    type="number"
                    placeholder="Price Per Year"
                    value={newHostel.pricePerYear || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, pricePerYear: parseInt(e.target.value) || 0 }))}
                  />
                  <Input
                    placeholder="Warden Name"
                    value={newHostel.warden || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, warden: e.target.value }))}
                  />
                  <Input
                    placeholder="Contact Number"
                    value={newHostel.contact || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, contact: e.target.value }))}
                  />
                  <textarea
                    placeholder="Description"
                    className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
                    value={newHostel.description || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddHostel}>Add Hostel</Button>
                  <Button variant="outline" onClick={() => setShowAddHostelForm(false)}>Cancel</Button>
                </div>
              </Card>
            )}

            {/* Hostels List */}
            <div className="space-y-6">
              {hostels.map((hostel) => (
                <Card key={hostel.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {editingHostel === hostel.id ? (
                        <Input
                          value={hostel.name}
                          onChange={(e) => handleSaveHostel(hostel.id, { name: e.target.value })}
                          className="text-2xl font-bold mb-2"
                        />
                      ) : (
                        <h3 className="text-2xl font-bold text-gray-900">{hostel.name}</h3>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hostel.status === 'active' ? 'bg-green-100 text-green-800' :
                          hostel.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hostel.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {hostel.gender} Hostel
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {editingHostel === hostel.id ? (
                        <>
                          <Button size="sm" onClick={() => setEditingHostel(null)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingHostel(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditHostel(hostel.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteHostel(hostel.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Occupancy Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Occupancy</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Occupied:</span>
                          <span className={`font-medium ${getOccupancyColor(getOccupancyRate(hostel.currentOccupancy, hostel.capacity))}`}>
                            {hostel.currentOccupancy}/{hostel.capacity} ({getOccupancyRate(hostel.currentOccupancy, hostel.capacity)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getOccupancyRate(hostel.currentOccupancy, hostel.capacity) >= 90 ? 'bg-red-600' :
                              getOccupancyRate(hostel.currentOccupancy, hostel.capacity) >= 70 ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${getOccupancyRate(hostel.currentOccupancy, hostel.capacity)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Pricing</h4>
                      <div className="space-y-2">
                        {editingHostel === hostel.id ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Semester:</span>
                              <Input
                                type="number"
                                value={hostel.pricePerSemester}
                                onChange={(e) => handleSaveHostel(hostel.id, { pricePerSemester: parseInt(e.target.value) || 0 })}
                                className="w-24"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Year:</span>
                              <Input
                                type="number"
                                value={hostel.pricePerYear}
                                onChange={(e) => handleSaveHostel(hostel.id, { pricePerYear: parseInt(e.target.value) || 0 })}
                                className="w-24"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Semester:</span>
                              <span className="font-medium">${hostel.pricePerSemester}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Year:</span>
                              <span className="font-medium">${hostel.pricePerYear}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                      <div className="space-y-2">
                        {editingHostel === hostel.id ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Warden:</span>
                              <Input
                                value={hostel.warden}
                                onChange={(e) => handleSaveHostel(hostel.id, { warden: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Phone:</span>
                              <Input
                                value={hostel.contact}
                                onChange={(e) => handleSaveHostel(hostel.id, { contact: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Warden:</span>
                              <span className="font-medium">{hostel.warden}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Phone:</span>
                              <span className="font-medium">{hostel.contact}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {hostel.amenities.map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    {editingHostel === hostel.id ? (
                      <textarea
                        value={hostel.description}
                        onChange={(e) => handleSaveHostel(hostel.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-600">{hostel.description}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}
