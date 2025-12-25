'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon, X } from 'lucide-react'
import Image from 'next/image'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  navigation: NavItem[]
  title?: string
  userRole?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ navigation, title = 'Hostel Management', userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
         <div 
           className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
           onClick={onClose}
         ></div>
      )}

      {/* Sidebar component */}
      <div className={`
        fixed inset-y-0 z-50 flex w-72 flex-col bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
             <Image 
                src="https://educareguide.com/wp-content/uploads/2021/01/UPSA-Students-Portal-Login-300x115.jpg" 
                alt="UPSA Logo" 
                width={80}
                height={30}
                className="object-contain"
              />
          </div>
          <button 
            type="button" 
            className="lg:hidden -m-2.5 p-2.5 text-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 sm:px-6 pb-4">
          {userRole && (
            <div className="mt-6 mb-2">
              <span className="text-responsive-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider">
                {userRole} Portal
              </span>
            </div>
          )}
          
          <nav className="flex-1 space-y-1 mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex gap-x-3 rounded-md p-2 text-responsive-sm leading-6 font-semibold
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
