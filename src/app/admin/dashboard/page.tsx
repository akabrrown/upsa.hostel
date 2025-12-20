'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Users, Bed, CreditCard, Calendar, TrendingUp, AlertCircle, CheckCircle, Eye, Edit, Trash2, Plus } from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  occupancyRate: number
  pendingPayments: number
  pendingApplications: number
  recentActivities: Activity[]
}

interface Activity {
  id: string
  type: 'student_added' | 'payment_received' | 'room_allocated' | 'announcement_posted'
  description: string
  timestamp: string
  user?: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  indexNumber: string
  email: string
  phone: string
  accommodationStatus: 'allocated' | 'pending' | 'none'
  room?: {
    hostel: string
    roomNumber: string
  }
  paymentStatus: 'paid' | 'pending' | 'overdue'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentStudents, setRecentStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    // In real app, this would come from API
    const studentsData: Student[] = []

    setTimeout(() => {
      setStats({
        totalStudents: 0,
        occupancyRate: 0,
        pendingPayments: 0,
        pendingApplications: 0,
        recentActivities: []
      })
      setRecentStudents(studentsData)
      setIsLoading(false)
    }, 1000)
  }, [user, router])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_added':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'payment_received':
        return <CreditCard className="h-5 w-5 text-green-600" />
      case 'room_allocated':
        return <Bed className="h-5 w-5 text-purple-600" />
      case 'announcement_posted':
        return <Calendar className="h-5 w-5 text-orange-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'none':
        return 'bg-gray-100 text-gray-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
        
      <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bed className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.occupancyRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingPayments}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingApplications}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activities & Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {stats?.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Students</h2>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Student
                </Button>
              </div>
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{student.indexNumber}</p>
                      <p className="text-xs text-gray-400">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.accommodationStatus)}`}>
                        {student.accommodationStatus}
                      </span>
                      {student.room && (
                        <p className="text-xs text-gray-500 mt-1">
                          {student.room.hostel} - {student.room.roomNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
    </div>
  )
}
