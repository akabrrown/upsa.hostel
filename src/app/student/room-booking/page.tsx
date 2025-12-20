'use client'

import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'

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
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      hostelId: '',
      floorId: '',
      roomId: '',
      bedId: '',
      academicYear: '2023/2024',
      semester: 'First Semester',
    },
    validationSchema: BookingSchema,
    onSubmit: async (values) => {
      setIsBooking(true)
      
      try {
        // Mock API call - in real app, this would submit to Supabase
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setBookingSuccess(true)
      } catch (error) {
        console.error('Booking failed:', error)
      } finally {
        setIsBooking(false)
      }
    },
  })

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    // In real app, this would come from API
    const hostelsData: Hostel[] = []
    const floorsData: Floor[] = []
    const roomsData: Room[] = []
    const bedsData: Bed[] = []

    setHostels(hostelsData)
    setFloors(floorsData)
    setRooms(roomsData)
    setBeds(bedsData)
  }, [user, router])

  useEffect(() => {
    if (formik.values.hostelId) {
      const filteredFloors = floors.filter(f => f.hostelId === formik.values.hostelId)
      // Reset dependent selections
      formik.setFieldValue('floorId', '')
      formik.setFieldValue('roomId', '')
      formik.setFieldValue('bedId', '')
      setSelectedRoom(null)
    }
  }, [formik, formik.values.hostelId, floors])

  useEffect(() => {
    if (formik.values.floorId) {
      const filteredRooms = rooms.filter(r => r.floorId === formik.values.floorId)
      // Reset dependent selections
      formik.setFieldValue('roomId', '')
      formik.setFieldValue('bedId', '')
      setSelectedRoom(null)
    }
  }, [formik, formik.values.floorId, rooms])

  useEffect(() => {
    if (formik.values.roomId) {
      const room = rooms.find(r => r.id === formik.values.roomId)
      setSelectedRoom(room || null)
      // Reset bed selection
      formik.setFieldValue('bedId', '')
    }
  }, [formik, formik.values.roomId, rooms])

  const handleBedSelect = (bedId: string) => {
    formik.setFieldValue('bedId', bedId)
  }

  const selectedHostel = hostels.find(h => h.id === formik.values.hostelId)
  const selectedFloor = floors.find(f => f.id === formik.values.floorId)
  const availableBeds = selectedRoom ? beds.filter(b => b.roomId === selectedRoom.id) : []

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your room has been booked successfully. You can now check in at the hostel.
            </p>
            <Button onClick={() => router.push('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Room Booking</h1>
          
          <form onSubmit={formik.handleSubmit}>
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Hostel Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hostel
                </label>
                <select
                  {...formik.getFieldProps('hostelId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name} ({hostel.code})
                    </option>
                  ))}
                </select>
                {formik.touched.hostelId && formik.errors.hostelId && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.hostelId}</div>
                )}
              </div>

              {/* Floor Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Floor
                </label>
                <select
                  {...formik.getFieldProps('floorId')}
                  disabled={!formik.values.hostelId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Choose a floor</option>
                  {floors
                    .filter(f => f.hostelId === formik.values.hostelId)
                    .map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        Floor {floor.floorNumber}
                      </option>
                    ))}
                </select>
                {formik.touched.floorId && formik.errors.floorId && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.floorId}</div>
                )}
              </div>

              {/* Room Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Room
                </label>
                <select
                  {...formik.getFieldProps('roomId')}
                  disabled={!formik.values.floorId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Choose a room</option>
                  {rooms
                    .filter(r => r.floorId === formik.values.floorId)
                    .map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} ({room.roomType}, {room.capacity} beds)
                      </option>
                    ))}
                </select>
                {formik.touched.roomId && formik.errors.roomId && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.roomId}</div>
                )}
              </div>

              {/* Bed Selection */}
              {selectedRoom && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bed
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableBeds.map((bed) => (
                      <div
                        key={bed.id}
                        onClick={() => !bed.isOccupied && handleBedSelect(bed.id)}
                        className={`
                          p-4 border rounded-lg cursor-pointer text-center transition-colors
                          ${bed.isOccupied 
                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                            : formik.values.bedId === bed.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="font-medium">{bed.bedNumber}</div>
                        {bed.isOccupied ? (
                          <div className="text-xs text-red-500 mt-1">Occupied</div>
                        ) : (
                          <div className="text-xs text-green-500 mt-1">Available</div>
                        )}
                        {bed.studentName && (
                          <div className="text-xs text-gray-500 mt-1">{bed.studentName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {formik.touched.bedId && formik.errors.bedId && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.bedId}</div>
                  )}
                </div>
              )}

              {/* Academic Year and Semester */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    {...formik.getFieldProps('academicYear')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2023/2024">2023/2024</option>
                    <option value="2024/2025">2024/2025</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    {...formik.getFieldProps('semester')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                  </select>
                </div>
              </div>

              {/* Booking Summary */}
              {selectedHostel && selectedFloor && selectedRoom && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Hostel:</strong> {selectedHostel.name}</p>
                    <p><strong>Floor:</strong> Floor {selectedFloor.floorNumber}</p>
                    <p><strong>Room:</strong> Room {selectedRoom.roomNumber}</p>
                    <p><strong>Room Type:</strong> {selectedRoom.roomType}</p>
                    <p><strong>Academic Year:</strong> {formik.values.academicYear}</p>
                    <p><strong>Semester:</strong> {formik.values.semester}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isBooking || !formik.values.bedId}
                className="w-full"
              >
                {isBooking ? 'Booking...' : 'Book Room'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
