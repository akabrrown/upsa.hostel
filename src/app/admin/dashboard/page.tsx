'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { fetchProfile } from '@/store/slices/authSlice'
import { formatIndexNumber } from '@/lib/formatters'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Users, Bed, CreditCard, Calendar, TrendingUp, AlertCircle, CheckCircle, Eye, Edit, Trash2, Plus } from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'

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

  const dispatch = useDispatch()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch latest profile data
        await dispatch(fetchProfile() as any)

        // Fetch stats
        const statsRes = await fetch('/api/admin/stats')
        const statsData = await statsRes.json()
        
        if (statsRes.ok) {
          setStats(statsData)
        }

        // Fetch recent students
        const studentsRes = await fetch('/api/admin/students?limit=5')
        const studentsData = await studentsRes.json()
        
        if (studentsRes.ok) {
          setRecentStudents(studentsData.students)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, dispatch])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(200)
    }
  }, [isLoading])

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

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'allocated':
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'overdue':
        return 'danger'
      default:
        return 'neutral'
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
        {/* Page Header */}
        <div className="page-header mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedStatCard
            icon={Users}
            label="Total Students"
            value={stats?.totalStudents || 0}
            iconColor="blue"
          />

          <AnimatedStatCard
            icon={Bed}
            label="Occupancy Rate"
            value={`${stats?.occupancyRate || 0}%`}
            iconColor="green"
          />

          <AnimatedStatCard
            icon={CreditCard}
            label="Pending Payments"
            value={stats?.pendingPayments || 0}
            iconColor="yellow"
          />

          <AnimatedStatCard
            icon={Calendar}
            label="Pending Applications"
            value={stats?.pendingApplications || 0}
            iconColor="purple"
          />
        </div>

        {/* Recent Activities & Students */}
        <div className="content-section grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-2">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={AlertCircle}
                  title="No Recent Activities"
                  description="Activity will appear here as actions are taken in the system."
                />
              )}
            </div>
          </Card>

          {/* Recent Students */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Students</h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Student
              </Button>
            </div>
            <div className="space-y-4">
              {recentStudents && recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{formatIndexNumber(student.indexNumber)}</p>
                      <p className="text-xs text-gray-400 truncate">{student.email}</p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <ModernBadge variant={getStatusBadgeVariant(student.accommodationStatus)}>
                        {student.accommodationStatus}
                      </ModernBadge>
                      {student.room && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {student.room.hostel} - {student.room.roomNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Users}
                  title="No Students Yet"
                  description="Students will appear here once they are added to the system."
                  actionLabel="Add Student"
                  onAction={() => router.push('/admin/students')}
                />
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
