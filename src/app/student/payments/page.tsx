'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Input from '@/components/ui/input'
import { Calendar, CreditCard, AlertCircle, CheckCircle, Clock, DollarSign, FileText, Download, Search, Filter } from 'lucide-react'
import apiClient from '@/lib/api'

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
  const [selectedPayment, setSelectedPayment] = useState(null)

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
    // Animate page elements
    gsap.from('.payments-card', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1
    })

    loadPayments()

    // Animate summary and list
    const tl = gsap.timeline()
    tl.fromTo('.payment-summary',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.payment-list',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'pending': return Clock
      case 'overdue': return AlertCircle
      default: return Clock
    }
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)

  const handlePayment = (paymentId: number) => {
    // Handle payment logic
    console.log('Processing payment for:', paymentId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600 mt-1">View and manage your hostel payments</p>
            </div>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Make Payment
            </Button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="payment-summary mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">${totalPaid.toLocaleString()}</h3>
              <p className="text-gray-600">Total Paid</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</h3>
              <p className="text-gray-600">Pending</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</h3>
              <p className="text-gray-600">Overdue</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'paid').length}
              </h3>
              <p className="text-gray-600">Payments Made</p>
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
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredPayments.length} payments
              </div>
            </div>
          </Card>
        </div>

        {/* Payment List */}
        <div className="payment-list">
          {filteredPayments.length > 0 ? (
            <div className="space-y-4">
              {filteredPayments.map((payment, index) => {
                const StatusIcon = getStatusIcon(payment.status)
                return (
                  <Card key={payment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          payment.status === 'paid' ? 'bg-green-100' : 
                          payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${
                            payment.status === 'paid' ? 'text-green-600' : 
                            payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{payment.type}</h3>
                          <p className="text-sm text-gray-600">{payment.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                            </span>
                            {payment.paymentDate && (
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Paid: {new Date(payment.paymentDate).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">${payment.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        {payment.reference && (
                          <div className="text-sm text-gray-500 mt-1">
                            Ref: {payment.reference}
                          </div>
                        )}
                        {payment.status !== 'paid' && (
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handlePayment(payment.id)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
