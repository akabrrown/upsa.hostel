'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  LayoutDashboard, 
  CreditCard, 
  Bell, 
  User, 
  Home,
  Users,
  CalendarCheck,
  LogOut,
  Menu,
  BedDouble,
  Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

const studentNavigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/student/profile', icon: User },
  { name: 'Room Booking', href: '/student/room-booking', icon:  BedDouble},
  { name: 'My Reservations', href: '/student/reservations', icon: CalendarCheck },
  { name: 'Roommates', href: '/student/roommates', icon: Users },
  { name: 'Payments', href: '/student/payments', icon: CreditCard },
  { name: 'Announcements', href: '/student/announcements', icon: Bell },
  { name: 'Settings', href: '/student/settings', icon: Settings },
]

export default function StudentLayout({
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
        navigation={studentNavigation} 
        userRole="Student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
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
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
              <div className="flex items-center gap-x-4 p-1">
                 <span className="hidden lg:flex lg:items-center">
                    <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {user?.firstName} {user?.lastName} (Student)
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

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
