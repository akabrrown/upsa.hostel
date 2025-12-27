'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Edit, 
  Save, 
  X, 
  Plus, 
  Building, 
  Users, 
  DollarSign, 
  Bed, 
  Building2,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Zap,
  Trash2,
  Layout,
  FileSpreadsheet
} from 'lucide-react'
import { RootState } from '@/store'
import { initPageAnimations } from '@/lib/animations'

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
  const [isLoading, setIsLoading] = useState(true)

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
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800)
  }, [user, router])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

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
      setNewHostel({ name: '', capacity: 0, gender: 'Male', pricePerSemester: 0, pricePerYear: 0, amenities: [], description: '', status: 'active', warden: '', contact: '', rooms: [] })
    }
  }

  const handleDeleteHostel = (hostelId: string) => {
    setHostels(prev => prev.filter(hostel => hostel.id !== hostelId))
  }

  const getOccupancyRate = (current: number, capacity: number) => {
    return capacity === 0 ? 0 : Math.round((current / capacity) * 100)
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'active': return 'success'
      case 'maintenance': return 'warning'
      default: return 'danger'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Executive Header */}
      <div className="page-header bg-white p-8 rounded-[2.5rem] shadow-sm border border-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hostel <span className="text-indigo-600">Matrix</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Asset Configuration & Pricing</p>
        </div>
        <Button onClick={() => setShowAddHostelForm(true)} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-6 shadow-xl shadow-indigo-600/20 font-black text-xs uppercase tracking-widest">
          <Plus className="w-5 h-5 mr-2" /> Provision New Hostel
        </Button>
      </div>

      {/* Intelligence Stats */}
      <div className="stats-cards grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedStatCard icon={Building} label="Active Assets" value={hostels.length} iconColor="blue" subText="Managed Hostels" />
        <AnimatedStatCard icon={Users} label="Global Capacity" value={hostels.reduce((sum, h) => sum + h.capacity, 0)} iconColor="purple" subText="Total Beds Available" />
        <AnimatedStatCard icon={Bed} label="Current Occupants" value={hostels.reduce((sum, h) => sum + h.currentOccupancy, 0)} iconColor="emerald" subText="Verified Residents" />
        <AnimatedStatCard icon={DollarSign} label="Avg Yield" value={`GH₵${hostels.length ? Math.round(hostels.reduce((sum, h) => sum + h.pricePerSemester, 0) / hostels.length) : 0}`} iconColor="purple" subText="Per Semester Base" />
      </div>

      {/* Add Hostel Intelligent Form */}
      {showAddHostelForm && (
        <Card className="add-form border-none shadow-2xl rounded-[2.5rem] bg-white p-8 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h2 className="text-xl font-black text-slate-900 leading-none">New Asset Integration</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Provisioning System Protocol</p>
              </div>
              <button onClick={() => setShowAddHostelForm(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hostel Identifier</label>
                 <Input
                    placeholder="e.g. Blue Lagoon Hall"
                    value={newHostel.name || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, name: e.target.value }))}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Max Capacity</label>
                 <Input
                    type="number"
                    placeholder="Total Beds"
                    value={newHostel.capacity || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Gender Protocol</label>
                 <select
                    className="w-full px-4 h-12 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    value={newHostel.gender}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, gender: e.target.value as any }))}
                 >
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                    <option value="Mixed">Mixed Housing</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Yield (Sem)</label>
                 <Input
                    type="number"
                    placeholder="Price in GHS"
                    value={newHostel.pricePerSemester || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, pricePerSemester: parseInt(e.target.value) || 0 }))}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Asset Custodian</label>
                 <Input
                    placeholder="Warden Name"
                    value={newHostel.warden || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, warden: e.target.value }))}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Emergency Contact</label>
                 <Input
                    placeholder="+233..."
                    value={newHostel.contact || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, contact: e.target.value }))}
                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                 />
              </div>
              <div className="md:col-span-3 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Asset Description</label>
                 <textarea
                    placeholder="Vision and specifications..."
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all min-h-[100px]"
                    value={newHostel.description || ''}
                    onChange={(e) => setNewHostel(prev => ({ ...prev, description: e.target.value }))}
                 />
              </div>
           </div>
           
           <div className="flex gap-4 mt-8">
              <Button onClick={handleAddHostel} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-10 shadow-xl shadow-indigo-600/20 font-black text-xs uppercase tracking-widest">Deploy Asset</Button>
              <Button variant="outline" onClick={() => setShowAddHostelForm(false)} className="rounded-2xl border-slate-200 h-12 px-8 text-slate-600 font-black text-xs uppercase tracking-widest">Abort</Button>
           </div>
        </Card>
      )}

      {/* Asset Repository */}
      <div className="hostel-cards space-y-6">
        {hostels.length > 0 ? (
          hostels.map((hostel) => (
            <Card key={hostel.id} className="hostel-item border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-0 group">
               <div className="flex flex-col lg:flex-row">
                  {/* Left branding/status sidebar */}
                  <div className={`lg:w-16 flex items-center justify-center p-4 lg:p-0 ${
                    hostel.status === 'active' ? 'bg-indigo-600' : 
                    hostel.status === 'maintenance' ? 'bg-amber-500' : 'bg-slate-800'
                  } transition-colors duration-500`}>
                     <div className="lg:-rotate-90 flex items-center gap-3 whitespace-nowrap">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{hostel.status} Asset</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{hostel.gender}</span>
                     </div>
                  </div>

                  <div className="flex-1 p-8">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {editingHostel === hostel.id ? (
                                 <Input
                                    value={hostel.name}
                                    onChange={(e) => handleSaveHostel(hostel.id, { name: e.target.value })}
                                    className="text-2xl font-black bg-transparent border-none p-0 focus:ring-0 max-w-sm"
                                 />
                              ) : hostel.name}
                           </h3>
                           <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                              <MapPin className="w-3.5 h-3.5" /> University Central Campus
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           {editingHostel === hostel.id ? (
                              <Button size="sm" onClick={() => setEditingHostel(null)} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase h-9 px-4">
                                 <Save className="w-3.5 h-3.5 mr-2" /> Sync Changes
                              </Button>
                           ) : (
                              <Button variant="outline" size="sm" onClick={() => handleEditHostel(hostel.id)} className="rounded-xl border-slate-100 hover:bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase h-9 px-4 shadow-sm">
                                 <Edit className="w-3.5 h-3.5 mr-2" /> Modify Config
                              </Button>
                           )}
                           <button onClick={() => handleDeleteHostel(hostel.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Occupancy Intelligence */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                 <Users className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Density Analysis</h4>
                           </div>
                           
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Occupants</div>
                                 <div className="text-sm font-black text-slate-900">{hostel.currentOccupancy} <span className="text-slate-300 text-xs">/ {hostel.capacity}</span></div>
                              </div>
                              
                              <div className="relative h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                 <div 
                                    className={`absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                       getOccupancyRate(hostel.currentOccupancy, hostel.capacity) >= 90 ? 'bg-rose-500' :
                                       getOccupancyRate(hostel.currentOccupancy, hostel.capacity) >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${getOccupancyRate(hostel.currentOccupancy, hostel.capacity)}%` }}
                                 />
                              </div>

                              <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Availability Status</span>
                                 <ModernBadge variant={getOccupancyRate(hostel.currentOccupancy, hostel.capacity) >= 95 ? 'danger' : 'neutral'}>
                                    {hostel.capacity - hostel.currentOccupancy} VACANT
                                 </ModernBadge>
                              </div>
                           </div>
                        </div>

                        {/* Yield & Pricing */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                 <DollarSign className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Financial Yield</h4>
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                                 <div className="text-[10px] font-bold text-indigo-400 uppercase">Per Semester</div>
                                 {editingHostel === hostel.id ? (
                                    <Input
                                       type="number"
                                       value={hostel.pricePerSemester}
                                       onChange={(e) => handleSaveHostel(hostel.id, { pricePerSemester: parseInt(e.target.value) || 0 })}
                                       className="w-20 h-8 text-xs font-black bg-white border-indigo-100 text-indigo-600 rounded-lg py-0"
                                    />
                                 ) : (
                                    <div className="text-sm font-black text-indigo-700">GH₵{hostel.pricePerSemester.toLocaleString()}</div>
                                 )}
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                                 <div className="text-[10px] font-bold text-slate-400 uppercase">Annual Base</div>
                                 {editingHostel === hostel.id ? (
                                    <Input
                                       type="number"
                                       value={hostel.pricePerYear}
                                       onChange={(e) => handleSaveHostel(hostel.id, { pricePerYear: parseInt(e.target.value) || 0 })}
                                       className="w-20 h-8 text-xs font-black bg-white border-slate-200 rounded-lg py-0"
                                    />
                                 ) : (
                                    <div className="text-sm font-black text-slate-900">GH₵{hostel.pricePerYear.toLocaleString()}</div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* Custodian & Maintenance */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                 <ShieldCheck className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Asset Custodian</h4>
                           </div>

                           <div className="space-y-4">
                              <div className="group/item flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                                    {hostel.warden[0]}
                                 </div>
                                 <div className="flex-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Senior Warden</div>
                                    <div className="text-xs font-black text-slate-900 mt-1">
                                       {editingHostel === hostel.id ? (
                                          <Input
                                             value={hostel.warden}
                                             onChange={(e) => handleSaveHostel(hostel.id, { warden: e.target.value })}
                                             className="h-8 text-xs font-black p-0 border-none focus:ring-0"
                                          />
                                       ) : hostel.warden}
                                    </div>
                                 </div>
                              </div>

                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <Phone className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Security Contact</div>
                                    <div className="text-xs font-black text-slate-900 mt-1">
                                       {editingHostel === hostel.id ? (
                                          <Input
                                             value={hostel.contact}
                                             onChange={(e) => handleSaveHostel(hostel.id, { contact: e.target.value })}
                                             className="h-8 text-xs font-black p-0 border-none focus:ring-0"
                                          />
                                       ) : hostel.contact}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Amenities Intelligent Tags */}
                     <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between gap-6 overflow-hidden">
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                           <div className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0">Specs:</div>
                           {hostel.amenities.map((amenity, index) => (
                             <span key={index} className="px-3 py-1.5 bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 flex items-center gap-1.5">
                                <Zap className="w-3 h-3" /> {amenity}
                             </span>
                           ))}
                        </div>
                        <Button variant="ghost" className="hidden md:flex text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] shrink-0">
                           Extended Specs <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>
          ))
        ) : (
          <div className="py-20 px-8">
             <EmptyState
                icon={Building2}
                title="Asset Matrix Empty"
                description="No hostels have been provisioned in the current intelligence environment."
                actionLabel="Initialize First Asset"
                onAction={() => setShowAddHostelForm(true)}
             />
          </div>
        )}
      </div>
    </div>
  )
}
