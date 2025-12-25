'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import styles from './Navbar.module.css'

interface NavbarProps {
  title?: string
  showUserMenu?: boolean
  onMenuClick?: () => void
}

export function Navbar({ title = 'UPSA Hostel Management', showUserMenu = true, onMenuClick }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    const rolePaths = {
      student: '/student/dashboard',
      admin: '/admin/dashboard',
      porter: '/porter/dashboard',
      director: '/director/dashboard',
    }
    return rolePaths[user.role as keyof typeof rolePaths] || '/login'
  }

  return (
    <nav className="bg-white text-gray-900 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div className="ml-3">
              <Image 
                src="https://educareguide.com/wp-content/uploads/2021/01/UPSA-Students-Portal-Login-300x115.jpg" 
                alt="UPSA Logo" 
                width={120}
                height={32}
                className="object-contain"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Login button */}
            {showUserMenu && !isAuthenticated && (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            )}
            
            {/* User menu */}
            {showUserMenu && isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2 text-sm font-medium">{user.firstName || user.email?.split('@')[0] || 'User'}</span>
                </button>

                {/* User dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        router.push(getDashboardPath())
                        setIsUserMenuOpen(false)
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        router.push('/about-hostel')
                        setIsUserMenuOpen(false)
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Hostels
                    </button>
                    <button
                      onClick={() => {
                        router.push('/profile')
                        setIsUserMenuOpen(false)
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Settings className="inline h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
