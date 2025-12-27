'use client'

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { usePathname } from 'next/navigation'

export function SessionInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const { profileFetched, loading } = useSelector((state: RootState) => state.auth)
  const pathname = usePathname()
  const hasFetched = useRef(false)

  useEffect(() => {
    // Public routes that don't need auth check (can be expanded)
    const publicRoutes = ['/login', '/signup', '/', '/reset-password']
    const isPublicRoute = publicRoutes.some(route => 
      route === '/' ? pathname === '/' : pathname?.startsWith(route)
    )

    // If it's not a public route and we haven't fetched the profile yet, fetch it
    // We also check if a token might exists in cookies (though we can't easily check httpOnly cookies from JS)
    // Most users will have a session if they were previously logged in.
    if (!profileFetched && !loading && !hasFetched.current && !isPublicRoute) {
      hasFetched.current = true
      console.log('SessionInitializer: Fetching profile for protected route', pathname)
      dispatch(fetchProfile() as any)
    }
  }, [dispatch, profileFetched, loading, pathname])

  return <>{children}</>
}
