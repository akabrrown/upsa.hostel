'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, BookOpen, Edit, Calendar } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import Image from 'next/image'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function StudentProfile() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // If we have a user from login but no profile details (like firstName), fetch the full profile
    if (user && !user.firstName) {
      dispatch(fetchProfile() as any)
    }
  }, [dispatch, user])

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login')
    }
  }, [user, loading, router])

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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Use data from profiles table (now directly in user object and normalized)
  const studentProfile = {
    firstName: user.firstName || 'Not Available',
    lastName: user.lastName || 'Not Available',
    student_id: user.indexNumber || 'Not Available',
    dateOfBirth: user.dateOfBirth && user.dateOfBirth !== '' 
      ? new Date(user.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
      : 'Not Available',
    gender: user.gender || 'Not Available',
    phoneNumber: user.phoneNumber || 'Not Available',
    emergencyContact: {
      name: user.emergencyContact?.name || 'Not Available',
      phone: user.emergencyContact?.phone || 'Not Available',
      relationship: user.emergencyContact?.relationship || 'Not Available'
    },
    programOfStudy: user.programOfStudy || 'Not Available',
    yearOfStudy: user.yearOfStudy || null,
    academicYear: user.academicYear || 'Not Available',
    profileImageUrl: user.profileImageUrl || null,
    user: {
      id: user.id,
      email: user.email || 'Not Available',
      index_number: user.indexNumber || 'Not Available'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="profile-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">View your personal information and contact details</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xs">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Need to Update Your Profile?</h3>
                <p className="text-xs text-blue-700 mb-3">
                  For security and verification purposes, all profile changes must be made in person at the Admission Office.
                </p>
                <div className="flex items-center text-xs text-blue-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>Admission Office, Main Campus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {studentProfile?.profileImageUrl ? (
                    <Image 
                      src={studentProfile.profileImageUrl} 
                      alt="Profile" 
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-responsive-2xl font-bold">
                    <span className="text-container-wrap">{studentProfile?.firstName || 'Not Available'}</span> <span className="text-container-wrap">{studentProfile?.lastName || 'Not Available'}</span>
                  </h2>
                  <p className="text-responsive text-blue-100">Index Number: <span className="id-text text-container-wrap">{formatIndexNumber(studentProfile?.student_id || studentProfile?.user?.index_number || '') || 'Not Available'}</span></p>
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
                  <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Full Name</span>
                      <span className="text-responsive font-medium text-container-wrap">
                        <span className="text-container-wrap">{studentProfile?.firstName || 'Not Available'}</span> <span className="text-container-wrap">{studentProfile?.lastName || 'Not Available'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Index Number</span>
                      <span className="text-responsive font-medium id-text text-container-wrap">{formatIndexNumber(studentProfile?.student_id || studentProfile?.user?.index_number || '') || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Date of Birth</span>
                      <span className="text-responsive font-medium text-container-wrap">{studentProfile?.dateOfBirth || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-responsive text-gray-600">Gender</span>
                      <span className="text-responsive font-medium capitalize text-container-wrap">
                        {studentProfile?.gender || 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="profile-section">
                  <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Email</span>
                      <span className="text-responsive font-medium email-text text-container-wrap">{user.email || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Phone</span>
                      <span className="text-responsive font-medium text-container-wrap">{studentProfile?.phoneNumber || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-responsive text-gray-600">Emergency Contact</span>
                      <div className="text-responsive font-medium text-container-wrap text-right">
                        <div>{studentProfile?.emergencyContact?.name || 'Not Available'}</div>
                        {studentProfile?.emergencyContact?.phone !== 'Not Available' && (
                          <div className="text-sm text-gray-500">{studentProfile?.emergencyContact?.phone}</div>
                        )}
                        {studentProfile?.emergencyContact?.relationship !== 'Not Available' && (
                          <div className="text-sm text-gray-500">{studentProfile?.emergencyContact?.relationship}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="profile-section">
                  <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Academic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Program</span>
                      <span className="text-responsive font-medium text-container-wrap">{studentProfile?.programOfStudy || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Year of Study</span>
                      <span className="text-responsive font-medium text-container-wrap">{studentProfile?.yearOfStudy ? `Year ${studentProfile.yearOfStudy}` : 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-responsive text-gray-600">Academic Year</span>
                      <span className="text-responsive font-medium text-container-wrap">{studentProfile?.academicYear || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-responsive text-gray-600">Student ID</span>
                      <span className="text-responsive font-medium id-text text-container-wrap">{formatIndexNumber(studentProfile?.student_id || studentProfile?.user?.index_number || '') || 'Not Available'}</span>
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
