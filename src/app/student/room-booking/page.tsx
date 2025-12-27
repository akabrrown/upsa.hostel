'use client'

import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import { hostelApi, roomApi, handleApiError } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Building, 
  Layers, 
  DoorOpen, 
  Bed as BedIcon, 
  Calendar, 
  Check, 
  Info, 
  AlertCircle,
  ChevronRight,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CreditCard
} from 'lucide-react'
import gsap from 'gsap'

interface Hostel {
  id: string
  name: string
  code: string
  totalFloors: number
}

interface Floor {
  id: string
  floorNumber: number
  hostelId: string
}

interface Room {
  id: string
  roomNumber: string
  floorId: string
  roomType: string
  capacity: number
}

interface Bed {
  id: string
  bedNumber: string
  roomId: string
  isOccupied: boolean
  studentName?: string
}

const BookingSchema = Yup.object().shape({
  hostelId: Yup.string().required('Hostel selection is required'),
  floorId: Yup.string().required('Floor selection is required'),
  roomId: Yup.string().required('Room selection is required'),
  bedId: Yup.string().required('Bed selection is required'),
  academicYear: Yup.string().required('Academic year is required'),
  semester: Yup.string().required('Semester is required'),
})

export default function RoomBooking() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [beds, setBeds] = useState<Bed[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('2024/2025')
  const [currentSemester, setCurrentSemester] = useState('First Semester')
  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [hasRoom, setHasRoom] = useState(false)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      hostelId: '',
      floorId: '',
      roomId: '',
      bedId: '',
      academicYear: currentAcademicYear,
      semester: currentSemester,
    },
    validationSchema: BookingSchema,
    onSubmit: async (values) => {
      setIsBooking(true)
      
      try {
        await roomApi.book({
          hostelId: values.hostelId,
          floorId: values.floorId,
          roomId: values.roomId,
          bedId: values.bedId,
          academicYear: values.academicYear,
          semester: values.semester,
        })
        
        toast.success('Room booked successfully!')
        setBookingSuccess(true)
      } catch (error) {
        const message = handleApiError(error, 'Booking failed')
        toast.error(message)
        console.error('Booking failed:', error)
      } finally {
        setIsBooking(false)
      }
    },
  })

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
      return
    }

    const fetchInitialData = async () => {
      try {
        // Fetch system settings
        const settingsResponse = await fetch('/api/settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.data) {
            const academicYear = settingsData.data.current_academic_year
            const semester = settingsData.data.current_semester
            const enabled = settingsData.data.booking_enabled === true
            
            setBookingEnabled(enabled)
            
            if (academicYear) {
              setCurrentAcademicYear(academicYear)
              formik.setFieldValue('academicYear', academicYear)
            }
            if (semester) {
              setCurrentSemester(semester)
              formik.setFieldValue('semester', semester)
            }
          }
        }

        // Check if user already has a room or pending booking
        if (user) {
          const hasActiveAcc = user.accommodationStatus === 'allocated' || user.accommodationStatus === 'pending'
          const hasPendingBooking = (user.bookings || []).some((b: any) => b.status === 'Pending' || b.status === 'Approved')
          const hasPendingRes = (user.reservations || []).some((r: any) => r.status === 'Pending' || r.status === 'Approved')
          
          if (hasActiveAcc || hasPendingBooking || hasPendingRes) {
            setHasRoom(true)
          }
        }

        // Fetch hostels
        const response: any = await hostelApi.getAll()
        setHostels(response.hostels || [])
      } catch (error) {
        toast.error('Failed to load initial data')
        console.error('Error fetching initial data:', error)
      }
    }

    fetchInitialData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchFloors = async () => {
      if (formik.values.hostelId) {
        try {
          const response: any = await hostelApi.getFloors(formik.values.hostelId)
          setFloors(response.floors || [])
          formik.setFieldValue('floorId', '')
          formik.setFieldValue('roomId', '')
          formik.setFieldValue('bedId', '')
          setSelectedRoom(null)
        } catch (error) {
          toast.error('Failed to load floors')
        }
      } else {
        setFloors([])
      }
    }
    fetchFloors()
  }, [formik.values.hostelId])

  useEffect(() => {
    const fetchRooms = async () => {
      if (formik.values.floorId && formik.values.hostelId) {
        try {
          const response: any = await hostelApi.getFloorRooms(formik.values.hostelId, formik.values.floorId)
          setRooms(response.rooms || [])
          formik.setFieldValue('roomId', '')
          formik.setFieldValue('bedId', '')
          setSelectedRoom(null)
        } catch (error) {
          toast.error('Failed to load rooms')
        }
      } else {
        setRooms([])
      }
    }
    fetchRooms()
  }, [formik.values.floorId, formik.values.hostelId])

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (formik.values.roomId && formik.values.hostelId && formik.values.floorId) {
        try {
          const response: any = await hostelApi.getRoomDetails(
            formik.values.hostelId,
            formik.values.floorId,
            formik.values.roomId
          )
          const roomData = response.room
          setSelectedRoom(roomData || null)
          setBeds(roomData?.beds || [])
          formik.setFieldValue('bedId', '')
        } catch (error) {
          toast.error('Failed to load room details')
        }
      } else {
        setSelectedRoom(null)
        setBeds([])
      }
    }
    fetchRoomDetails()
  }, [formik.values.roomId, formik.values.hostelId, formik.values.floorId])

  // Real-time bed updates
  useEffect(() => {
    if (!selectedRoom) return

    const channel = supabase
      .channel('room-booking-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'beds',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        (payload: any) => {
          // Update bed state immediately
          setBeds((currentBeds) => 
            currentBeds.map((bed) => {
              if (bed.id === payload.new.id) {
                return {
                  ...bed,
                  isOccupied: !payload.new.is_available,
                }
              }
              return bed
            })
          )
          
          // If the selected bed just got taken by someone else
          if (payload.new.id === formik.values.bedId && !payload.new.is_available) {
             toast.error('This bed was just booked by another student.')
             formik.setFieldValue('bedId', '')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom, formik.values.bedId])

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.booking-hero', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      gsap.fromTo('.step-card',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      )
      gsap.fromTo('.summary-card',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      )
    })
    return () => ctx.revert()
  }, [])

  const handleBedSelect = (bedId: string) => {
    formik.setFieldValue('bedId', bedId)
  }

  const selectedHostel = hostels.find(h => h.id === formik.values.hostelId)
  const selectedFloor = floors.find(f => f.id === formik.values.floorId)
  const availableBeds = selectedRoom ? beds.filter(b => b.roomId === selectedRoom.id) : []

  if (hasRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center booking-hero">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Room Already Assigned</h2>
          <p className="text-gray-600 mb-8">
            You already have an active room allocation or a pending booking/reservation. You cannot book another room at this time.
          </p>
          <Button 
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-6 text-lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!bookingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center booking-hero">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">System Closed</h2>
          <p className="text-gray-600 mb-8">
            The room booking system is currently closed. Please contact administration for more information.
          </p>
          <Button 
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-6"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center booking-hero">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Your room has been successfully booked. You can now proceed with check-in formalities.
          </p>
          <Button 
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-6 text-lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8 px-6 mb-8 booking-hero">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-semibold uppercase tracking-wider text-sm">Room Booking</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Secure Your Space
          </h1>
          <p className="text-gray-500 max-w-2xl flex items-center gap-2">
            Academic Year: <span className="font-semibold text-gray-700">{formik.values.academicYear}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            Semester: <span className="font-semibold text-gray-700">{formik.values.semester}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Panel: Booking Flow */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={formik.handleSubmit}>
              
              {/* Step 1: Hostel Selection */}
              <div className="step-card relative pl-8 pb-8 border-l-2 border-indigo-100 last:border-0">
                <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.hostelId ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}>
                  {formik.values.hostelId ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">1</span>}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Select Hostel</h3>
                  </div>
                  <div className="p-6">
                    {hostels.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">Loading hostels...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {hostels.map((hostel) => (
                          <div
                            key={hostel.id}
                            onClick={() => formik.setFieldValue('hostelId', hostel.id)}
                            className={`
                              group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                              ${formik.values.hostelId === hostel.id
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2.5 rounded-xl ${formik.values.hostelId === hostel.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                                <Building className="w-6 h-6" />
                              </div>
                              {formik.values.hostelId === hostel.id && (
                                <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white px-2 py-1 rounded-full shadow-sm">
                                  Selected
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{hostel.name}</h4>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Code: {hostel.code}</span>
                              <span>{hostel.totalFloors} Floors</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Floor Selection */}
              <div className={`step-card relative pl-8 pb-8 border-l-2 border-indigo-100 last:border-0 ${!formik.values.hostelId ? 'opacity-50 grayscale' : ''}`}>
                <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.floorId ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}>
                  {formik.values.floorId ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">2</span>}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Select Floor</h3>
                  </div>
                  <div className="p-6">
                    {!formik.values.hostelId ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        Please select a hostel first to view floors
                      </div>
                    ) : floors.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">Loading floors...</div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {floors
                          .filter(f => f.hostelId === formik.values.hostelId)
                          .map((floor) => (
                            <button
                              key={floor.id}
                              type="button"
                              onClick={() => formik.setFieldValue('floorId', floor.id)}
                              className={`
                                flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all duration-200
                                ${formik.values.floorId === floor.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 transform scale-105'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <Layers className="w-4 h-4" />
                              Floor {floor.floorNumber}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Room Selection */}
              <div className={`step-card relative pl-8 pb-8 border-l-2 border-indigo-100 last:border-0 ${!formik.values.floorId ? 'opacity-50 grayscale' : ''}`}>
                 <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.roomId ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}>
                  {formik.values.roomId ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">3</span>}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Select Room</h3>
                  </div>
                  <div className="p-6">
                    {!formik.values.floorId ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        Please select a floor first to view rooms
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">Loading rooms...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {rooms
                          .filter(r => r.floorId === formik.values.floorId)
                          .map((room) => (
                            <div
                              key={room.id}
                              onClick={() => formik.setFieldValue('roomId', room.id)}
                              className={`
                                group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden
                                ${formik.values.roomId === room.id
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-gray-900">Room {room.roomNumber}</span>
                                <DoorOpen className={`w-5 h-5 ${formik.values.roomId === room.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                {room.roomType}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                {room.capacity} Person Capacity
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 4: Bed Selection */}
              <div className={`step-card relative pl-8 pb-8 border-l-2 border-indigo-100 last:border-0 ${!formik.values.roomId ? 'opacity-50 grayscale' : ''}`}>
                 <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.bedId ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}>
                  {formik.values.bedId ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">4</span>}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Select Bed</h3>
                  </div>
                  <div className="p-6">
                    {!formik.values.roomId ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                         Select a room to see available beds
                      </div>
                    ) : beds.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No beds information available</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {availableBeds.map((bed) => (
                          <div
                            key={bed.id}
                            onClick={() => !bed.isOccupied && handleBedSelect(bed.id)}
                            className={`
                              relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3
                              ${bed.isOccupied 
                                ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' 
                                : formik.values.bedId === bed.id
                                ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-105 z-10'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-1 cursor-pointer'
                              }
                            `}
                          >
                            <div className={`p-3 rounded-full ${
                               bed.isOccupied ? 'bg-gray-100 text-gray-400' : 
                               formik.values.bedId === bed.id ? 'bg-indigo-100 text-indigo-600' : 'bg-green-50 text-green-600'
                            }`}>
                              <BedIcon className="w-6 h-6" />
                            </div>
                            
                            <div className="text-center">
                              <div className="font-bold text-gray-900 text-lg">{bed.bedNumber}</div>
                              {bed.isOccupied ? (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded-full">
                                  Occupied
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                  formik.values.bedId === bed.id ? 'text-indigo-600 bg-white shadow-sm' : 'text-green-600 bg-green-100'
                                }`}>
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Right Panel: Summary & Action */}
          <div className="lg:col-span-4 mt-8 lg:mt-0 summary-card">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-900 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Booking Summary
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Review your selection</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Selection Summary */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Building className={`w-5 h-5 mt-0.5 ${selectedHostel ? 'text-indigo-600' : 'text-gray-300'}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Hostel</p>
                        <p className="text-sm font-bold text-gray-900">{selectedHostel?.name || 'Not Selected'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Layers className={`w-5 h-5 mt-0.5 ${selectedFloor ? 'text-indigo-600' : 'text-gray-300'}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Floor</p>
                        <p className="text-sm font-bold text-gray-900">{selectedFloor ? `Floor ${selectedFloor.floorNumber}` : 'Not Selected'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <DoorOpen className={`w-5 h-5 mt-0.5 ${selectedRoom ? 'text-indigo-600' : 'text-gray-300'}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Room</p>
                        <p className="text-sm font-bold text-gray-900">{selectedRoom ? `Room ${selectedRoom.roomNumber}` : 'Not Selected'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <BedIcon className={`w-5 h-5 mt-0.5 ${formik.values.bedId ? 'text-indigo-600' : 'text-gray-300'}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Bed</p>
                        <p className="text-sm font-bold text-gray-900">
                           {formik.values.bedId 
                             ? `Bed ${availableBeds.find(b => b.id === formik.values.bedId)?.bedNumber}` 
                             : 'Not Selected'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <Button
                    onClick={() => formik.handleSubmit()}
                    disabled={isBooking || !formik.values.bedId}
                    className="w-full py-4 text-base font-bold shadow-lg shadow-indigo-200/50 hover:shadow-indigo-200 transition-all hover:-translate-y-0.5 rounded-xl"
                  >
                    {isBooking ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                  {!formik.values.bedId && (
                    <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                      <Info className="w-3 h-3" /> Complete all steps to enable booking
                    </p>
                  )}
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm mb-1">
                    Secure Booking
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your booking is secured immediately upon confirmation. Room fees will be correctly calculated and added to your bill for the {currentAcademicYear} academic year.
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
