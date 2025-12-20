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
import { Search, Filter, Download, CreditCard, Calendar, User, TrendingUp, AlertCircle, CheckCircle, Clock, Eye, MoreVertical } from 'lucide-react'
import { TableColumn } from '@/types'

interface Payment {
  id: string
  studentId: string
  studentName: string
  indexNumber: string
  email: string
  program: string
  
  // Payment details
  type: string
  description: string
  amount: number
  currency: string
  
  // Dates and status
  dueDate: string
  paymentDate?: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  
  // Payment method and reference
  method?: string
  reference?: string
  transactionId?: string
  
  // Academic info
  academicYear: string
  semester: string
  
  // Additional info
  receiptUrl?: string
  notes?: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    // In real app, this would come from API
    const paymentsData: Payment[] = []

    setTimeout(() => {
      setPayments(paymentsData)
      
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
      .fromTo('.payments-table',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
    }, 1000)
  }, [user, router])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
    const matchesSemester = selectedSemester === 'all' || payment.semester === selectedSemester
    const matchesAcademicYear = selectedAcademicYear === 'all' || payment.academicYear === selectedAcademicYear
    
    const matchesDateRange = 
      (!dateRange.start || new Date(payment.dueDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(payment.dueDate) <= new Date(dateRange.end))
    
    return matchesSearch && matchesStatus && matchesSemester && matchesAcademicYear && matchesDateRange
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'pending': return Clock
      case 'overdue': return AlertCircle
      case 'partial': return TrendingUp
      default: return Clock
    }
  }

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting payments data...')
  }

  const handleViewReceipt = (receiptUrl: string) => {
    // Handle receipt viewing
    window.open(receiptUrl, '_blank')
  }

  const handleSendReminder = (paymentId: string) => {
    // Handle payment reminder
    console.log('Sending reminder for payment:', paymentId)
  }

  const columns: TableColumn[] = [
    {
      key: 'student',
      title: 'Student Information',
      render: (value: any, row: Payment) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.studentName}</div>
            <div className="text-sm text-gray-500">{row.indexNumber}</div>
            <div className="text-xs text-gray-400">{row.email}</div>
            <div className="text-xs text-gray-400">{row.program}</div>
          </div>
        </div>
      )
    },
    {
      key: 'payment',
      title: 'Payment Details',
      render: (value: any, row: Payment) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{row.type}</div>
          <div className="text-sm text-gray-600">{row.description}</div>
          <div className="text-lg font-semibold text-gray-900">
            {row.currency} {row.amount.toLocaleString()}
          </div>
          {row.reference && (
            <div className="text-xs text-gray-500">Ref: {row.reference}</div>
          )}
        </div>
      )
    },
    {
      key: 'dates',
      title: 'Dates',
      render: (value: any, row: Payment) => (
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">Due:</span> {new Date(row.dueDate).toLocaleDateString()}
          </div>
          {row.paymentDate && (
            <div>
              <span className="font-medium">Paid:</span> {new Date(row.paymentDate).toLocaleDateString()}
            </div>
          )}
          <div className="text-xs text-gray-500">
            {row.semester} - {row.academicYear}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string, row: Payment) => {
        const StatusIcon = getStatusIcon(value)
        return (
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-4 h-4" />
            <Badge className={getStatusColor(value)}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'method',
      title: 'Payment Method',
      render: (value: string, row: Payment) => (
        <div className="text-sm">
          {row.method || (
            <span className="text-gray-400">Not paid</span>
          )}
          {row.method && (
            <div className="text-xs text-gray-500">
              {row.transactionId && `ID: ${row.transactionId}`}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Payment) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          {row.receiptUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleViewReceipt(row.receiptUrl!)}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {(row.status === 'pending' || row.status === 'overdue') && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSendReminder(row.id)}
            >
              <AlertCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const totalPayments = payments.length
  const paidPayments = payments.filter(p => p.status === 'paid').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const overduePayments = payments.filter(p => p.status === 'overdue').length

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const pendingRevenue = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0)

  const academicYears = [
    { id: 'all', name: 'All Years' },
    { id: '2023/2024', name: '2023/2024' },
    { id: '2024/2025', name: '2024/2025' }
  ]

  const semesters = [
    { id: 'all', name: 'All Semesters' },
    { id: 'First Semester', name: 'First Semester' },
    { id: 'Second Semester', name: 'Second Semester' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'paid', name: 'Paid' },
    { id: 'pending', name: 'Pending' },
    { id: 'overdue', name: 'Overdue' },
    { id: 'partial', name: 'Partial' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                <p className="text-gray-600 mt-1">Manage and track all student payments</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{paidPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{overduePayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      GHS {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Revenue</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      GHS {pendingRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {semesters.map(semester => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name}
                      </option>
                    ))}
                  </select>

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

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Date Range:</label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-40"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-40"
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing {filteredPayments.length} of {totalPayments} payments
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payments Table */}
          <div className="payments-table">
            <Card className="overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredPayments}
                pagination={true}
                pageSize={15}
                searchable={true}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
