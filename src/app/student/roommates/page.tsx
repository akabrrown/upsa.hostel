'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatIndexNumber } from '@/lib/formatters'
import { User, Users, MessageSquare, MessageCircle, Phone, MapPin, Calendar, Book, Mail } from 'lucide-react'

interface Roommate {
  id: string
  name: string
  indexNumber: string
  program: string
  yearOfStudy: string
  email: string
  phone: string
  profileImage?: string
  bedNumber: string
  checkInDate: string
  hometown: string
  hobbies: string[]
  isAvailable: boolean
}

export default function RoommateDetails() {
  const [roommates, setRoommates] = useState<Roommate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    // Get roommates data from Redux store
    const roommatesData: Roommate[] = []

    setTimeout(() => {
      setRoommates(roommatesData)
      setIsLoading(false)
      
      // Animate page content
      const tl = gsap.timeline()
      
      tl.fromTo('.page-header',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.roommate-cards',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
    }, 1000)
  }, [user, router])

  const handleSendMessage = (roommateId: string) => {
    // Handle message functionality
    console.log('Send message to roommate:', roommateId)
  }

  const handleCall = (phoneNumber: string) => {
    // Handle call functionality
    window.open(`tel:${phoneNumber}`)
  }

  const handleEmail = (email: string) => {
    // Handle email functionality
    window.open(`mailto:${email}`)
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Roommate Details</h1>
                <p className="text-gray-600">
                  View information about your roommates in Hostel A, Room 201
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">{roommates.length} Roommates</span>
              </div>
            </div>
          </div>

          {/* Roommate Cards */}
          <div className="roommate-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roommates.map((roommate) => (
              <Card key={roommate.id} className="overflow-hidden">
                {/* Roommate Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold text-lg">{roommate.name}</h3>
                      <p className="text-blue-100 text-sm">{roommate.bedNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Roommate Info */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Academic Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Academic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Book className="w-4 h-4 text-gray-400" />
                          <span>{roommate.program}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{roommate.yearOfStudy}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{formatIndexNumber(roommate.indexNumber)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-blue-600 hover:underline cursor-pointer" 
                                onClick={() => handleEmail(roommate.email)}>
                            {roommate.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-blue-600 hover:underline cursor-pointer"
                                onClick={() => handleCall(roommate.phone)}>
                            {roommate.phone}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{roommate.hometown}</span>
                        </div>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Check-in Date: </span>
                          <span>{new Date(roommate.checkInDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hobbies: </span>
                          <span>{roommate.hobbies.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Status: </span>
                          <Badge className={roommate.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {roommate.isAvailable ? 'Available' : 'Away'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <Button 
                      className="w-full"
                      onClick={() => handleSendMessage(roommate.id)}
                      disabled={!roommate.isAvailable}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {roommate.isAvailable ? 'Send Message' : 'Currently Away'}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCall(roommate.phone)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEmail(roommate.email)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {roommates.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Roommates Found</h3>
              <p className="text-gray-600">
                You don&apos;t have any roommates assigned yet, or you haven&apos;t been allocated to a room.
              </p>
              <Button className="mt-4" onClick={() => router.push('/student/room-booking')}>
                Book a Room
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
