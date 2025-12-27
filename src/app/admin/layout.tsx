'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  FileText,
  UserCircle,
  Edit
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

const adminNavigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Hostels', href: '/admin/hostels', icon: Building2 },
  { name: 'Hostel Settings', href: '/admin/hostel-settings', icon: Edit },
  { name: 'Rooms', href: '/admin/rooms', icon: Building2 },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Announcements', href: '/admin/announcements', icon: Bell },
  { name: 'Reservations', href: '/admin/reservations', icon: FileText },
  { name: 'Porters', href: '/admin/porters', icon: UserCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)

  // Enable session timeout
  useSessionTimeout()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        navigation={adminNavigation} 
        userRole="Admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header for mobile menu and user profile */}
        <header className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              
              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4 p-1">
                 <span className="hidden lg:flex lg:items-center">
                    <span className="text-responsive-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {user?.firstName} {user?.lastName}
                    </span>
                 </span>
                 <button 
                   onClick={handleLogout}
                   className="text-gray-500 hover:text-gray-700"
                   title="Logout"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
