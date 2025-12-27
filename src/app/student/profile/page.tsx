'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import Button from '@/components/ui/button'
import { User, Mail, Phone, MapPin, BookOpen, Calendar, Shield, CreditCard, Bed, AlertCircle } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import gsap from 'gsap'

export default function StudentProfile() {
  const router = useRouter()
  const { user, loading, profileFetched } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    if (!profileFetched) {
      dispatch(fetchProfile() as any)
    }
  }, [dispatch, profileFetched])

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
    }
  }, [user, profileFetched, router])

  // GSAP Entry Animation
  useEffect(() => {
    if (!loading && user) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.profile-header-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.profile-section-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, delay: 0.2, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading, user])

  if (loading || (!profileFetched)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const studentProfile = {
    firstName: user.firstName || 'Not Available',
    lastName: user.lastName || 'Not Available',
    student_id: user.indexNumber || 'Not Available',
    gender: user.gender || 'Not Available',
    phoneNumber: user.phoneNumber || 'Not Available',
    email: user.email || 'Not Available',
    emergencyContact: {
      name: user.emergencyContact?.name || 'Not Available',
      phone: user.emergencyContact?.phone || 'Not Available',
      relationship: user.emergencyContact?.relationship || 'Not Available'
    },
    programOfStudy: user.programOfStudy || 'Not Available',
    yearOfStudy: user.yearOfStudy || null,
    academicYear: user.academicYear || 'Not Available',
    accommodation: user.accommodation
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Background */}
      <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32">
        {/* Profile Header Card */}
        <div className="profile-header-card bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-inner border-4 border-white">
                {studentProfile.firstName.charAt(0)}{studentProfile.lastName.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {studentProfile.firstName} {studentProfile.lastName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                  Student
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200 uppercase tracking-wider">
                  {formatIndexNumber(studentProfile.student_id)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {studentProfile.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {studentProfile.phoneNumber}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
               <Button 
                onClick={() => router.push('/student/settings')}
                variant="outline"
                className="w-full justify-center"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity / Quick Stats Column */}
          <div className="space-y-6">
             {/* Quick Actions Card */}
             <div className="profile-section-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/student/payments')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group text-left"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <CreditCard className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Payment History</h3>
                    <p className="text-xs text-gray-500">View transactions</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/student/room-booking')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group text-left"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Bed className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Room Booking</h3>
                    <p className="text-xs text-gray-500">Manage allocation</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/student/settings')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group text-left"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Shield className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Security</h3>
                    <p className="text-xs text-gray-500">Password & privacy</p>
                  </div>
                </button>
              </div>
            </div>


          </div>

          {/* Detailed Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Accommodation Summary */}
            <div className="profile-section-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Bed className="w-5 h-5" />
                </div>
                <h2 className="font-bold">Accommodation</h2>
              </div>
              
              {studentProfile.accommodation ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-gray-400 text-sm">Hostel</span>
                    <span className="font-medium">{studentProfile.accommodation.room?.hostel?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-gray-400 text-sm">Room</span>
                    <span className="font-medium">Room {studentProfile.accommodation.room?.room_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Bed</span>
                    <span className="font-medium text-emerald-400">Bed {studentProfile.accommodation.bed_number || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-4">No accommodation assigned yet.</p>
                  <Button 
                    onClick={() => router.push('/student/room-booking')}
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 border-none"
                  >
                    Apply Now
                  </Button>
                </div>
              )}
            </div>

            {/* Academic Info */}
            <div className="profile-section-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Academic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Program of Study</p>
                  <p className="font-medium text-gray-900">{studentProfile.programOfStudy}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Level</p>
                  <p className="font-medium text-gray-900">Year {studentProfile.yearOfStudy || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Academic Year</p>
                  <p className="font-medium text-gray-900">{studentProfile.academicYear}</p>
                </div>

              </div>
            </div>

            {/* Emergency Contact */}
            <div className="profile-section-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Emergency Contact</h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 p-6 border border-gray-100 rounded-xl">
                 <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contact Name</p>
                    <p className="font-bold text-lg text-gray-900">{studentProfile.emergencyContact.name}</p>
                 </div>
                 <div className="border-l border-gray-100 hidden md:block" />
                 <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Everything OK?</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Phone className="w-4 h-4 text-gray-400" />
                       <a href={`tel:${studentProfile.emergencyContact.phone}`} className="font-medium text-blue-600 hover:underline">
                         {studentProfile.emergencyContact.phone}
                       </a>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{studentProfile.emergencyContact.relationship}</p>
                 </div>
              </div>

               <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                 <div className="mt-0.5">
                   <Shield className="w-4 h-4 text-blue-600" />
                 </div>
                 <div>
                   <h4 className="font-bold text-blue-900 text-sm mb-1">Need to update vital info?</h4>
                   <p className="text-xs text-blue-700 leading-relaxed">
                     For security reasons, sensitive information like your name, index number, and emergency contacts can only be updated at the Admission Office. Please visit the Main Campus with your student ID.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
