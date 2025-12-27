'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Plus, Edit, Trash2, Users, Building, Calendar, Clock, CheckCircle, Eye, X, ShieldCheck, UserMinus, ShieldAlert, Zap } from 'lucide-react'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'

interface Porter {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeId: string
  assignedHostel?: string
  assignedFloors?: number[]
  status: 'active' | 'inactive' | 'on-leave'
  isOnDuty: boolean
  lastCheckIn?: string
  lastCheckOut?: string
  totalCheckIns: number
  totalCheckOuts: number
  averageResponseTime: number
  hireDate: string
  department: string
  supervisor: string
  emergencyContact: string
  address: string
}

export default function AdminPorters() {
  const [porters, setPorters] = useState<Porter[]>([])
  const [loading, setLoading] = useState(true)
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

    const fetchPorters = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/porters')
        if (response.ok) {
          const data = await response.json()
          setPorters(data)
        } else {
          console.error('Failed to fetch porters')
        }
      } catch (error) {
        console.error('Error fetching porters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPorters()
  }, [user, router])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(150)
    }
  }, [loading])

  const filteredPorters = porters.filter(porter => {
    const matchesSearch = 
      porter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || porter.status === selectedStatus
    const matchesHostel = selectedHostel === 'all' || porter.assignedHostel === selectedHostel
    
    return matchesSearch && matchesStatus && matchesHostel
  })

  // Badge Logic
  const getStatusVariant = (status: string): 'success' | 'neutral' | 'warning' => {
    switch (status) {
      case 'active': return 'success'
      case 'on-leave': return 'warning'
      case 'inactive': return 'neutral'
      default: return 'neutral'
    }
  }

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Porter Identity',
      render: (value: any, row: Porter) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
            {row.firstName.charAt(0)}{row.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">{row.firstName} {row.lastName}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'assignment',
      title: 'Post Assignment',
      render: (value: any, row: Porter) => (
        <div className="space-y-1">
          <div className="text-sm font-bold text-gray-700">{row.assignedHostel || 'N/A'}</div>
          {row.assignedFloors && (
            <div className="text-[10px] font-bold text-gray-400 uppercase">Floors: {row.assignedFloors.join(', ')}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, row: Porter) => (
        <div className="flex flex-col gap-1.5">
           <ModernBadge variant={getStatusVariant(row.status)}>{row.status}</ModernBadge>
           <div className="flex items-center gap-1.5 ml-1">
              <div className={`w-1.5 h-1.5 rounded-full ${row.isOnDuty ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase">{row.isOnDuty ? 'Active Duty' : 'Off Clock'}</span>
           </div>
        </div>
      )
    },
    {
       key: 'id',
       title: 'Actions',
       render: (value: any, row: Porter) => (
         <div className="flex items-center gap-1 transition-all">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => { setSelectedPorter(row); }}><Eye className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => { setSelectedPorter(row); setShowCreateModal(true); }}><Edit className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-50" onClick={() => {}}><Trash2 className="w-3.5 h-3.5" /></Button>
         </div>
       )
    }
  ]

  const totalPorters = porters.length
  const activeCount = porters.filter(p => p.status === 'active').length
  const onDutyCount = porters.filter(p => p.isOnDuty).length

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
        <div className="page-header mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security & Porters</h1>
            <p className="text-gray-600 mt-1">Personnel management and shift coordination</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Recruit Porter
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedStatCard icon={Zap} label="Peak Activity" value="08:00 AM" iconColor="purple" />
           <AnimatedStatCard icon={ShieldCheck} label="Available" value={activeCount} iconColor="green" />
           <AnimatedStatCard icon={Clock} label="Currently On-Shift" value={onDutyCount} iconColor="blue" />
           <AnimatedStatCard icon={UserMinus} label="On Leave" value={porters.filter(p => p.status === 'on-leave').length} iconColor="yellow" />
        </div>

        {/* Search & Filter */}
        <div className="content-section mb-8">
           <Card className="p-4 border-none shadow-sm bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search porters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 w-64"
                      />
                    </div>
                    
                    <select value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)} className="h-10 px-4 border border-gray-100 rounded-xl text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium">
                       <option value="all">All Hostels</option>
                       <option value="Hostel A">Hostel A</option>
                       <option value="Hostel B">Hostel B</option>
                    </select>

                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="h-10 px-4 border border-gray-100 rounded-xl text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium">
                       <option value="all">All Status</option>
                       <option value="active">Active</option>
                       <option value="on-leave">On Leave</option>
                       <option value="inactive">Inactive</option>
                    </select>
                 </div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                    {filteredPorters.length} registered porters
                 </div>
              </div>
           </Card>
        </div>

        {/* Table Section */}
        <div className="porters-table">
          <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
             {filteredPorters.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={filteredPorters}
                  pagination={true}
                  pageSize={10}
                />
             ) : (
               <EmptyState
                 icon={ShieldAlert}
                 title="No Porters On Record"
                 description="The personnel registry is empty or no staff match your filters."
                 actionLabel="Register First Porter"
                 onAction={() => setShowCreateModal(true)}
               />
             )}
          </Card>
        </div>
      </main>

      {/* Recuitment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setSelectedPorter(null); }} />
           <Card className="w-full max-w-2xl relative z-10 p-0 overflow-hidden rounded-3xl border-none shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-8 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                          <Plus className="w-6 h-6 text-indigo-600" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedPorter ? 'Edit Personnel' : 'Recruit Personnel'}</h2>
                          <p className="text-sm text-gray-500 mt-0.5">Register staff and assign responsibilities</p>
                       </div>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); setSelectedPorter(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                          <Input value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                          <Input value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employee ID</label>
                          <Input value={formData.employeeId} onChange={(e) => setFormData(p => ({ ...p, employeeId: e.target.value }))} placeholder="P-XXXX" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Post</label>
                          <select value={formData.assignedHostel} onChange={(e) => setFormData(p => ({ ...p, assignedHostel: e.target.value }))} className="w-full px-4 h-11 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all">
                             <option value="">Unassigned</option>
                             <option value="Hostel A">Hostel A</option>
                             <option value="Hostel B">Hostel B</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Email</label>
                       <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Status</label>
                       <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-4 h-11 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all">
                          <option value="active">Active Service</option>
                          <option value="on-leave">On Leave</option>
                          <option value="inactive">Retired/Inactive</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-4 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => { setShowCreateModal(false); setSelectedPorter(null); }} className="font-bold text-gray-400">Discard</Button>
                    <Button onClick={() => setShowCreateModal(false)} className="px-10 shadow-xl shadow-indigo-600/20 bg-indigo-600">
                       {selectedPorter ? 'Update Service' : 'Confirm Recruitment'}
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  )
}
