'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchStudents } from '@/store/slices/adminSlice'

import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import { Badge } from '@/components/ui/badge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Filter, Download, Eye, Edit, UserPlus, User, Users, UserCheck, UserMinus, AlertCircle, ChevronRight, LayoutGrid } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'

export default function AdminStudents() {
  const dispatch = useDispatch()
  const { students, stats, loading } = useSelector((state: RootState) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchStudents() as any)
  }, [dispatch])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(200)
    }
  }, [loading])


  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Student Profile',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center space-x-4 py-1">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
            record.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
            record.paymentStatus === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
          }`}>
            {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 leading-tight tracking-tight">
              {record.firstName} {record.lastName}
            </span>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              {formatIndexNumber(record.indexNumber)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'programOfStudy',
      title: 'Program',
      sortable: true,
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-700">{value}</span>
          <span className="text-[10px] text-gray-400 font-bold mt-0.5">Level {record.yearOfStudy * 100}</span>
        </div>
      )
    },
    {
      key: 'accommodation',
      title: 'Housing Assignment',
      render: (value) => (
        value ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
               {value.hostel?.name}
            </div>
            <div className="text-[10px] text-gray-400 font-bold ml-3 mt-0.5 uppercase tracking-widest text-indigo-400">Rm {value.room?.roomNumber}</div>
          </div>
        ) : (
          <div className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-lg inline-flex border border-gray-100 italic">
            Awaiting Placement
          </div>
        )
      ),
    },
    {
      key: 'paymentStatus',
      title: 'Financial Status',
      render: (value) => {
        const variant = value === 'paid' ? 'success' : value === 'overdue' ? 'danger' : 'warning'
        return (
          <ModernBadge variant={variant} className="font-bold uppercase tracking-wider text-[10px]">
            {value || 'pending'}
          </ModernBadge>
        )
      },
    },
    {
      key: 'actions',
      title: '',
      render: (_, record) => (
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-none bg-gray-50 hover:bg-gray-100 group transition-colors">
            <Eye className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
          </Button>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0 border-none bg-gray-50 hover:bg-gray-100 group transition-colors">
            <Edit className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
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

  useEffect(() => {
    if (!loading && filteredStudents.length > 0) {
      // Small delay to ensure table is rendered
      setTimeout(() => {
        initPageAnimations(100)
      }, 50)
    }
  }, [filteredStudents.length, loading])

  const handleExport = () => {
    console.log('Exporting students data...')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
            <div className="flex items-center gap-4">
               <div className="p-3.5 bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-100 animate-pulse-subtle">
                  <Users className="w-7 h-7 text-white" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Registry</h1>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Manage and provision student institutional records
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExport} className="border-none bg-white shadow-sm hover:bg-gray-50 font-bold text-gray-600 px-6">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="shadow-lg shadow-blue-500/20 px-6 font-bold">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Intelligence Stat Matrix */}
          <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedStatCard
              icon={Users}
              label="Total Students"
              value={stats.total}
              iconColor="blue"
              subText="Active headcount"
            />

            <AnimatedStatCard
              icon={UserCheck}
              label="Allocated"
              value={stats.allocated}
              iconColor="emerald"
              subText="Bed space occupied"
            />

            <AnimatedStatCard
              icon={UserMinus}
              label="Unallocated"
              value={stats.unallocated}
              iconColor="amber"
              subText="Awaiting placement"
            />

            <AnimatedStatCard
              icon={AlertCircle}
              label="Overdue Payments"
              value={stats.overdue}
              iconColor="rose"
              subText="Requires attention"
            />
          </div>

          {/* Registry Control Matrix */}
          <div className="filters-section mb-6">
            <Card className="p-4 border-none shadow-sm bg-white/80 backdrop-blur-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors w-4.5 h-4.5" />
                    <Input
                      placeholder="Search name, index, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 w-full sm:w-80 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-indigo-100 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 p-1 bg-gray-50/50 rounded-xl border border-gray-100">
                    <button 
                      onClick={() => setSelectedFilter('all')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setSelectedFilter('allocated')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedFilter === 'allocated' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Allocated
                    </button>
                    <button 
                      onClick={() => setSelectedFilter('unallocated')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedFilter === 'unallocated' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Awaiting
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <LayoutGrid className="w-3 h-3 text-indigo-400" />
                    <span>{filteredStudents.length} Records found</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-[10px] uppercase">Smart Filter:</span>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="bg-transparent text-gray-900 font-bold text-xs focus:outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <option value="all">Any Status</option>
                      <option value="paid">Paid Only</option>
                      <option value="overdue">Overdue Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Students Table */}
          <div className="students-table pb-12">
            <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white/70 backdrop-blur-md">
              {filteredStudents.length > 0 ? (
                <div className="table-container">
                  <DataTable
                    columns={columns}
                    data={filteredStudents}
                    pagination={true}
                    pageSize={10}
                    searchable={false}
                    className="premium-table"
                  />
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No Students Found"
                  description="No students match your current filters. Try adjusting your search criteria or clear the filters."
                  actionLabel="Add Student"
                  onAction={() => console.log('Add student')}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
