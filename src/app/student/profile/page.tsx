'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, BookOpen, MapPin, Edit } from 'lucide-react'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function StudentProfile() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile() as any)
    }
  }, [dispatch, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const studentProfile = user.profile

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="profile-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
            </div>
            <Button className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">
                    {studentProfile?.firstName || 'Not Available'} {studentProfile?.lastName || 'Not Available'}
                  </h2>
                  <p className="text-blue-100">Index Number: {studentProfile?.indexNumber || 'Not Available'}</p>
                  <Badge variant="secondary" className="mt-2">
                    Student
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Full Name</span>
                      <span className="font-medium">
                        {studentProfile?.firstName || 'Not Available'} {studentProfile?.lastName || 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Index Number</span>
                      <span className="font-medium">{studentProfile?.indexNumber || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Date of Birth</span>
                      <span className="font-medium">{studentProfile?.dateOfBirth || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-medium capitalize">
                        {studentProfile?.gender || 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="profile-section">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{user.email || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{studentProfile?.phoneNumber || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Emergency Contact</span>
                      <span className="font-medium">
                        {studentProfile?.emergencyContact?.name || 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="profile-section">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Academic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Program</span>
                      <span className="font-medium">{studentProfile?.programOfStudy || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Year of Study</span>
                      <span className="font-medium">{studentProfile?.yearOfStudy ? `Year ${studentProfile.yearOfStudy}` : 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Student ID</span>
                      <span className="font-medium">{studentProfile?.indexNumber || 'Not Available'}</span>
                    </div>
                  </div>
                </div>

                {/* Accommodation Information */}
                <div className="profile-section">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Accommodation
                  </h3>
                  <div className="space-y-3">
                    {user.accommodation ? (
                      <>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Hostel</span>
                          <span className="font-medium">{user.accommodation.hostel?.name || 'Not Available'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Room</span>
                          <span className="font-medium">{user.accommodation.room?.roomNumber || 'Not Available'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Bed</span>
                          <span className="font-medium">{user.accommodation.bed?.bedNumber || 'Not Available'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Status</span>
                          <Badge variant="success" className="text-xs">
                            Allocated
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No accommodation assigned yet</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => router.push('/student/room-booking')}
                        >
                          Apply for Room
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Payment History</h3>
            <p className="text-gray-600 text-sm mb-4">View your payment records and receipts</p>
            <Button variant="outline" className="w-full">
              View History
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Room Booking</h3>
            <p className="text-gray-600 text-sm mb-4">Book or manage your room allocation</p>
            <Button variant="outline" className="w-full">
              Manage Room
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <User className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm mb-4">Manage your account settings and preferences</p>
            <Button variant="outline" className="w-full">
              Settings
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
