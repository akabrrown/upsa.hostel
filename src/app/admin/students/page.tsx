'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchStudents } from '@/store/slices/adminSlice'
import { gsap } from 'gsap'

import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, Eye, Edit, UserPlus, User } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { TableColumn } from '@/types'

export default function AdminStudents() {
  const dispatch = useDispatch()
  const { students, loading } = useSelector((state: RootState) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchStudents() as any)

    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.filters-section',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.students-table',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [dispatch])

  const columns: TableColumn[] = [
    {
      key: 'indexNumber',
      title: 'Index Number',
      sortable: true,
      render: (value) => formatIndexNumber(value),
    },
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'programOfStudy',
      title: 'Program',
      sortable: true,
    },
    {
      key: 'yearOfStudy',
      title: 'Year',
      sortable: true,
      render: (value) => `Year ${value}`,
    },
    {
      key: 'accommodation',
      title: 'Accommodation',
      render: (value) => (
        value ? (
          <div>
            <div className="text-sm font-medium">{value.hostel?.name}</div>
            <div className="text-xs text-gray-500">Room {value.room?.roomNumber}</div>
          </div>
        ) : (
          <Badge variant="secondary">Not Allocated</Badge>
        )
      ),
    },
    {
      key: 'paymentStatus',
      title: 'Payment Status',
      render: (value) => (
        <Badge 
          variant={value === 'paid' ? 'success' : value === 'overdue' ? 'destructive' : 'warning'}
        >
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.indexNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'allocated' && student.accommodation) ||
      (selectedFilter === 'unallocated' && !student.accommodation) ||
      (selectedFilter === 'paid' && student.paymentStatus === 'paid') ||
      (selectedFilter === 'overdue' && student.paymentStatus === 'overdue')

    return matchesSearch && matchesFilter
  }) || []

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting students data...')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              <p className="text-gray-600 mt-1">Manage and view all student records</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Allocated</p>
                <p className="text-2xl font-bold text-green-600">
                  {students?.filter(s => s.accommodation).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unallocated</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {students?.filter(s => !s.accommodation).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {students?.filter(s => s.paymentStatus === 'overdue').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="filters-section mb-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Students</option>
                    <option value="allocated">Allocated</option>
                    <option value="unallocated">Unallocated</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students?.length || 0} students
              </div>
            </div>
          </Card>
        </div>

        {/* Students Table */}
        <div className="students-table">
          <Card className="overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredStudents}
              pagination={true}
              pageSize={10}
              searchable={true}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
