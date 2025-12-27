'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3, 
  LogOut,
  Menu,
  Bell,
  LineChart,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { initPageAnimations } from '@/lib/animations'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

const directorNavigation = [
  { name: 'Analytics Hub', href: '/director/dashboard', icon: LayoutDashboard },
  { name: 'Hostel Matrix', href: '/director/hostels', icon: Building2 },
  { name: 'Intelligence Reports', href: '/director/reports', icon: BarChart3 },
]

export default function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    initPageAnimations()
  }, [])

  // Enable session timeout
  useSessionTimeout()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#FDFDFE]">
      <Sidebar 
        navigation={directorNavigation} 
        userRole="Director"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Premium Executive Header */}
        <header className="flex h-16 items-center gap-x-4 border-b border-indigo-100/50 bg-white/70 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 z-30">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-indigo-50 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">System Intelligence Active</span>
               </div>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Executive Actions */}
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                 <Bell className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                 <LineChart className="h-5 w-5" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />
              
              <div className="flex items-center gap-x-4 p-1">
                 <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-black text-slate-900 leading-none">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
                      Executive Director
                    </span>
                 </div>
                 
                 <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <User className="w-5 h-5" />
                 </div>

                 <button 
                   onClick={handleLogout}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   title="Logout"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#FDFDFE]">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
