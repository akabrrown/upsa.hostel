'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, AlertCircle, CheckCircle2, Clock, Wallet, History, Search, Filter, ArrowUpRight, Download } from 'lucide-react'
import apiClient from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Payment {
  id: number
  type: string
  description: string
  amount: number
  dueDate: string
  status: string
  paymentDate?: string
  method?: string
  reference?: string
  semester: string
  academicYear: string
}

export default function StudentPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { user } = useSelector((state: RootState) => state.auth)

  const loadPayments = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<Payment[]>('/student/payments')
      setPayments(response)
    } catch (error) {
      console.error('Failed to load payments:', error)
      setError('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.page-header',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.stat-card',
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        )
        gsap.fromTo('.payment-card',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 }
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock }
      case 'overdue': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle }
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: History }
    }
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)

  const handlePayment = (paymentId: number) => {
    toast.success('Redirecting to payment gateway...')
    // Implement actual payment gateway integration here
  }

  if (loading) {
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-indigo-50 rounded-lg">
                   <Wallet className="w-6 h-6 text-indigo-600" />
                 </div>
                 <span className="text-indigo-600 font-semibold uppercase tracking-wider text-sm">Finances</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Center</h1>
              <p className="text-gray-500 max-w-xl">
                Manage your payments, view history, and download receipts securely.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                <CreditCard className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="stat-card bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Paid</span>
              </div>
              <div className="text-3xl font-bold mb-1">GHS {totalPaid.toLocaleString()}</div>
              <div className="text-emerald-100 text-sm opacity-90">Fully settled payments</div>
            </div>

            <div className="stat-card bg-white rounded-2xl p-6 border border-amber-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-amber-600 text-xs font-bold uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-full">Pending</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 relative z-10">GHS {totalPending.toLocaleString()}</div>
              <div className="text-gray-500 text-sm relative z-10">Outstanding balance</div>
            </div>

            <div className="stat-card bg-white rounded-2xl p-6 border border-rose-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <span className="text-rose-600 text-xs font-bold uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-full">Overdue</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 relative z-10">GHS {totalOverdue.toLocaleString()}</div>
              <div className="text-gray-500 text-sm relative z-10">Requires immediate attention</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Search and List */}
        <div className="bg-white p-4 rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 page-header relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search payments by description or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-4">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => {
               const statusConfig = getStatusConfig(payment.status)
               const StatusIcon = statusConfig.icon
               return (
                  <div key={payment.id} className="group payment-card bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{payment.type}</h3>
                          <p className="text-sm text-gray-500 mb-2">{payment.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </span>
                            {payment.paymentDate && (
                              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                              </span>
                            )}
                            {payment.reference && (
                              <span className="font-mono bg-gray-50 px-2 py-1 rounded-md">REF: {payment.reference}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 min-w-[150px]">
                        <div className="text-2xl font-bold text-gray-900">GHS {payment.amount.toLocaleString()}</div>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} capitalize shadow-none`}>
                           {payment.status}
                        </Badge>
                        
                        <div className="flex gap-2 mt-2 w-full md:w-auto">
                           {payment.status === 'paid' ? (
                             <Button variant="outline" size="sm" className="w-full text-xs h-8">
                               <Download className="w-3.5 h-3.5 mr-1.5" /> Receipt
                             </Button>
                           ) : (
                             <Button size="sm" onClick={() => handlePayment(payment.id)} className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
                               Pay Now <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                             </Button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
               )
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm payment-card">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Payments Found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                 We couldn&apos;t find any payment records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
