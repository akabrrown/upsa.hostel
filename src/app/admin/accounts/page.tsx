'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import apiClient from '@/lib/api'
import styles from './accounts.module.css'
import { Search, Filter, Plus, Edit, Eye, Trash2, User, Mail, Shield, Calendar, MoreVertical, Lock, Unlock, X } from 'lucide-react'
import { TableColumn } from '@/types'
import { useCallback } from 'react'

interface Account {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  indexNumber: string
  hostel: string
  room: string
  phone: string
  emergencyContact: string
  status: string
  lastLogin: string
  createdAt: string
  isLocked: boolean
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    indexNumber: '',
    hostel: '',
    room: '',
    phone: '',
    emergencyContact: ''
  })

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { adminUserApi } = await import('@/lib/api')
      const response = await adminUserApi.getAll({
        role: selectedRole,
        status: selectedStatus,
        search: searchTerm
      })
      setAccounts(response as Account[])
    } catch (error: any) {
      console.error('Failed to load accounts:', error)
      setError(error.message || 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [selectedRole, selectedStatus, searchTerm])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  useEffect(() => {
    // Initial animations
    gsap.from('.accounts-card', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1
    })

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
    .fromTo('.accounts-table',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'student', name: 'Student' },
    { id: 'admin', name: 'Admin' },
    { id: 'porter', name: 'Porter' },
    { id: 'director', name: 'Director' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'suspended', name: 'Suspended' }
  ]

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.indexNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || account.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'text-blue-600 bg-blue-100'
      case 'admin': return 'text-purple-600 bg-purple-100'
      case 'porter': return 'text-green-600 bg-green-100'
      case 'director': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter(a => a.status === 'active').length
  const inactiveAccounts = accounts.filter(a => a.status === 'inactive').length
  const suspendedAccounts = accounts.filter(a => a.status === 'suspended').length

  const handleCreateAccount = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const { adminUserApi } = await import('@/lib/api')
      await adminUserApi.create(formData)
      setShowCreateModal(false)
      loadAccounts()
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        indexNumber: '',
        hostel: '',
        room: '',
        phone: '',
        emergencyContact: ''
      })
    } catch (error: any) {
      console.error('Failed to create account:', error)
      setError(error.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    
    try {
      const { adminUserApi } = await import('@/lib/api')
      await adminUserApi.delete(id.toString())
      loadAccounts()
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const handleToggleLock = async (id: number | string) => {
    try {
      const { adminUserApi } = await import('@/lib/api')
      // Toggle logic would go here, for now using update as a placeholder if needed
      // or a specific lock endpoint if implemented later
      console.log('Toggling lock for account:', id)
    } catch (error) {
      console.error('Failed to toggle lock:', error)
    }
  }

  const handleResetPassword = (id: number) => {
    // Handle password reset
    console.log('Resetting password for account:', id)
  }

  const columns: TableColumn[] = [
    {
      key: 'firstName',
      title: 'User',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {value} {row.lastName}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value: string) => (
        <Badge className={`capitalize ${getRoleColor(value)}`}>
          {value}
        </Badge>
      )
    },
    {
      key: 'indexNumber',
      title: 'Index Number',
      render: (value: string) => (
        <span className="text-sm text-gray-600 font-mono">{value || '-'}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <Badge className={`capitalize ${getStatusColor(value)}`}>
            {value}
          </Badge>
          {row.isLocked && (
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          )}
        </div>
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value: string) => (
        <div className="text-sm text-gray-500 flex items-center">
          <Calendar className="w-3 h-3 mr-1.5" />
          {value === 'Never' ? 'Never' : new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'id',
      title: 'Actions',
      render: (value: string | number, row: any) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="p-2 h-8 w-8"
            onClick={() => setSelectedAccount(row)}
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`p-2 h-8 w-8 ${row.isLocked ? 'text-amber-600 bg-amber-50' : ''}`}
            onClick={() => handleToggleLock(value)}
            title={row.isLocked ? "Unlock User" : "Lock User"}
          >
            {row.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="p-2 h-8 w-8 text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteAccount(value)}
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
              <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Account
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{totalAccounts}</h3>
              <p className="text-gray-600">Total Accounts</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">{activeAccounts}</h3>
              <p className="text-gray-600">Active</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600">{inactiveAccounts}</h3>
              <p className="text-gray-600">Inactive</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">{suspendedAccounts}</h3>
              <p className="text-gray-600">Suspended</p>
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
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
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

              <div className="text-sm text-gray-600">
                Showing {filteredAccounts.length} of {totalAccounts} accounts
              </div>
            </div>
          </Card>
        </div>

        {/* Accounts Table */}
        <div className="accounts-table">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Accounts</h2>
            <DataTable
              columns={columns}
              data={filteredAccounts}
              pagination={true}
              pageSize={10}
              searchable={true}
            />
          </Card>
        </div>

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Account</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="p-1 hover:bg-gray-100"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <Plus className="w-5 h-5 transform rotate-45" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.filter(r => r.id !== 'all').map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.role === 'student' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Index Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.indexNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, indexNumber: e.target.value }))}
                          placeholder="Enter index number"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone {formData.role === 'student' ? '' : '(Optional)'}
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAccount} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
