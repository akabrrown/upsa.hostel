'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import apiClient from '@/lib/api'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building, Users, CreditCard, Eye, Search, Filter, History, Clock, CheckCircle2, XCircle } from 'lucide-react'
import gsap from 'gsap'

interface Reservation {
  id: string
  type: 'reservation' | 'booking'
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  createdAt: string
  academicYear: string
  semester: string
  details: {
    hostel?: string
    floor?: number
    room?: string
    roomType?: string
    price?: number
  }
  allocation?: {
    hostel: string
    roomNumber: string
    bedNumber: string
    allocatedAt: string
  }
}

export default function ReservationsHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    const fetchReservations = async () => {
      try {
        const response = await apiClient.get<Reservation[]>('/student/reservations')
        setReservations(response || [])
      } catch (error) {
        console.error('Failed to load reservations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [user, router])

  // GSAP Animations
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.page-header',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.stats-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        )
        gsap.fromTo('.reservation-card',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [isLoading])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 }
      case 'pending':
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock }
      case 'rejected':
        return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: History }
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.details.hostel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.details.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.academicYear.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = statusFilter === 'all' || reservation.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-12 px-6 page-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-indigo-50 rounded-lg">
               <History className="w-6 h-6 text-indigo-600" />
             </div>
             <span className="text-indigo-600 font-semibold uppercase tracking-wider text-sm">History</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservations History</h1>
          <p className="text-gray-500 max-w-2xl">
            Track your room booking application status and history.
          </p>

           {/* Stats Overview */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="stats-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{reservations.length}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</div>
            </div>
            <div className="stats-card bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="text-2xl font-bold text-emerald-700 mb-1">
                {reservations.filter(r => r.status === 'active' || r.status === 'approved').length}
              </div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</div>
            </div>
            <div className="stats-card bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
              <div className="text-2xl font-bold text-amber-700 mb-1">
                {reservations.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</div>
            </div>
            <div className="stats-card bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
              <div className="text-2xl font-bold text-rose-700 mb-1">
                {reservations.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">rejected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 page-header relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm reservation-card">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No History Found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'We couldn\'t find any records matching your search filters.' 
                  : 'You haven\'t made any room reservations yet. Start by making a reservation request.'}
              </p>
              <Button onClick={() => router.push('/student/room-reservation')} className="px-8">
                Make a Reservation
              </Button>
            </div>
          ) : (
            filteredReservations.map((reservation) => {
              const statusConfig = getStatusConfig(reservation.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <div key={reservation.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 reservation-card group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {reservation.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
                          {reservation.type}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(reservation.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                             <Building className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hostel</p>
                            <p className="text-sm font-semibold text-gray-900">{reservation.details.hostel || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                             <Users className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Room Type</p>
                            <p className="text-sm font-semibold text-gray-900">{reservation.details.roomType || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                             <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</p>
                            <p className="text-sm font-semibold text-gray-900">
                               {reservation.details.price ? `GHS ${reservation.details.price}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                        <span><span className="font-semibold text-gray-700">Year:</span> {reservation.academicYear}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span><span className="font-semibold text-gray-700">Sem:</span> {reservation.semester}</span>
                        
                        {(reservation.details.room || reservation.details.floor) && (
                          <>
                            <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full" />
                            {reservation.details.floor && <span><span className="font-semibold text-gray-700">Floor:</span> {reservation.details.floor}</span>}
                            {reservation.details.room && <span className="ml-2"><span className="font-semibold text-gray-700">Room:</span> {reservation.details.room}</span>}
                          </>
                        )}
                      </div>

                      {reservation.allocation && (
                        <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-emerald-800 mb-1">Allocation Confirmed</p>
                            <div className="text-sm text-emerald-700">
                              Assigned to <span className="font-semibold">{reservation.allocation.hostel}</span>, Room {reservation.allocation.roomNumber} ({reservation.allocation.bedNumber})
                            </div>
                            <div className="text-xs text-emerald-600 mt-1 opacity-80">
                               Confirmed on {new Date(reservation.allocation.allocatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <Button variant="outline" size="sm" className="w-full md:w-auto hover:bg-gray-50">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
