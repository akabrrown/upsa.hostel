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
  availableRooms: number
}

interface Floor {
  id: string
  floorNumber: number
  totalRooms: number
  availableRooms: number
}

interface RoomType {
  id: string
  name: string
  capacity: number
  pricePerSemester: number
  description: string
}

const ReservationSchema = Yup.object().shape({
  hostelId: Yup.string().required('Hostel selection is required'),
  floorId: Yup.string().required('Floor selection is required'),
  roomTypeId: Yup.string().required('Room type selection is required'),
  academicYear: Yup.string().required('Academic year is required'),
  semester: Yup.string().required('Semester is required'),
  specialRequests: Yup.string().optional(),
})

export default function RoomReservation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      hostelId: '',
      floorId: '',
      roomTypeId: '',
      academicYear: '2023/2024',
      semester: 'First Semester',
      specialRequests: '',
    },
    validationSchema: ReservationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      
      try {
        // Mock API call - in real app, this would submit to Supabase
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setReservationSuccess(true)
      } catch (error) {
        console.error('Reservation failed:', error)
      } finally {
        setIsSubmitting(false)
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
    const roomTypesData: RoomType[] = []

    setHostels(hostelsData)
    setFloors(floorsData)
    setRoomTypes(roomTypesData)
    setIsLoading(false)
  }, [user, router])

  const handleHostelChange = (hostelId: string) => {
    formik.setFieldValue('hostelId', hostelId)
    formik.setFieldValue('floorId', '')
    if (currentStep === 1) {
      setCurrentStep(2)
    }
  }

  const handleFloorChange = (floorId: string) => {
    formik.setFieldValue('floorId', floorId)
    if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleRoomTypeChange = (roomTypeId: string) => {
    formik.setFieldValue('roomTypeId', roomTypeId)
    if (currentStep === 3) {
      setCurrentStep(4)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formik.values.hostelId !== ''
      case 2:
        return formik.values.floorId !== ''
      case 3:
        return formik.values.roomTypeId !== ''
      default:
        return false
    }
  }

  const selectedHostel = hostels.find(h => h.id === formik.values.hostelId)
  const selectedFloor = floors.find(f => f.id === formik.values.floorId)
  const selectedRoomType = roomTypes.find(rt => rt.id === formik.values.roomTypeId)

  if (reservationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your room reservation has been submitted successfully. You will be notified once it&apos;s approved.
            </p>
            <Button onClick={() => router.push('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Room Reservation</h1>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-full h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-600">Select Hostel</span>
              <span className="text-xs text-gray-600">Select Floor</span>
              <span className="text-xs text-gray-600">Room Type</span>
              <span className="text-xs text-gray-600">Review</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Hostel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostels.map((hostel) => (
                    <div
                      key={hostel.id}
                      onClick={() => handleHostelChange(hostel.id)}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-colors
                        ${formik.values.hostelId === hostel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <h3 className="font-medium">{hostel.name}</h3>
                      <p className="text-sm text-gray-600">{hostel.code}</p>
                      <p className="text-sm text-gray-500">{hostel.availableRooms} rooms available</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Floor</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {floors.map((floor) => (
                    <div
                      key={floor.id}
                      onClick={() => handleFloorChange(floor.id)}
                      className={`
                        p-4 border rounded-lg cursor-pointer text-center transition-colors
                        ${formik.values.floorId === floor.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <div className="text-2xl font-bold">{floor.floorNumber}</div>
                      <div className="text-sm text-gray-600">Floor</div>
                      <div className="text-xs text-gray-500">{floor.availableRooms} available</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Room Type</h2>
                <div className="space-y-4">
                  {roomTypes.map((roomType) => (
                    <div
                      key={roomType.id}
                      onClick={() => handleRoomTypeChange(roomType.id)}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-colors
                        ${formik.values.roomTypeId === roomType.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{roomType.name}</h3>
                          <p className="text-sm text-gray-600">{roomType.description}</p>
                          <p className="text-sm text-gray-500">Capacity: {roomType.capacity} students</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">GHS {roomType.pricePerSemester}</p>
                          <p className="text-xs text-gray-500">per semester</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Review Your Selection</h2>
                <form onSubmit={formik.handleSubmit}>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Selected Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Hostel:</strong> {selectedHostel?.name}</p>
                        <p><strong>Floor:</strong> Floor {selectedFloor?.floorNumber}</p>
                        <p><strong>Room Type:</strong> {selectedRoomType?.name}</p>
                        <p><strong>Price:</strong> GHS {selectedRoomType?.pricePerSemester} per semester</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        {...formik.getFieldProps('specialRequests')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any special requirements or preferences..."
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Reservation'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceedToNext()}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
