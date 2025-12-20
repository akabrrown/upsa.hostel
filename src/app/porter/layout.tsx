'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut as LogOutIcon, // Rename to avoid conflict
  Menu,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store'

const porterNavigation = [
  { name: 'Dashboard', href: '/porter/dashboard', icon: LayoutDashboard },
  { name: 'Check-in', href: '/porter/checkin', icon: LogIn },
  { name: 'Check-out', href: '/porter/checkout', icon: LogOutIcon },
]

export default function PorterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        navigation={porterNavigation} 
        userRole="Porter"
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
                      {user?.firstName} {user?.lastName} (Porter)
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
