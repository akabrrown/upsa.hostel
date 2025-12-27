'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { formatIndexNumber } from '@/lib/formatters'
import { Users, MessageCircle, Phone, Mail } from 'lucide-react'
import ChatDrawer from '@/components/chat/ChatDrawer'

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
  isAvailable: boolean
  isMe?: boolean
  unreadCount?: number
}

export default function RoommateDetails() {
  const [roommates, setRoommates] = useState<Roommate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roomInfo, setRoomInfo] = useState<{ roomNumber: string, hostelName: string } | null>(null)
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    const fetchRoommates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/roommates')
        const data = await response.json()
        
        if (response.ok) {
          setRoommates(data.roommates || [])
          setRoomInfo(data.roomInfo)
        }
      } catch (error) {
        console.error('Failed to fetch roommates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoommates()
  }, [user, router])

  useEffect(() => {
    if (isLoading) return

    const ctx = gsap.context(() => {
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
    })

    return () => ctx.revert()
  }, [isLoading])

  const handleSendMessage = (roommate: Roommate) => {
    setSelectedRoommate(roommate)
    setIsChatOpen(true)
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
                  {roomInfo ? `View information about your roommates in ${roomInfo.hostelName}, Room ${roomInfo.roomNumber}` : 'View information about your roommates'}
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
              <div 
                key={roommate.id} 
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 group-hover:bg-blue-100/50" />
                
                {/* Header Section */}
                <div className="relative flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white text-xl font-bold">
                        {roommate.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {roommate.name}
                        {roommate.isMe && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            YOU
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">{roommate.program}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{roommate.indexNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="relative grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50/30 transition-colors">
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Bed No.</p>
                    <p className="font-bold text-gray-900">{roommate.bedNumber}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50/30 transition-colors">
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Level</p>
                    <p className="font-bold text-gray-900">{roommate.yearOfStudy}</p>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="relative space-y-3">
                  {!roommate.isMe ? (
                    <>
                      <Button 
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/10 group-hover:shadow-gray-900/20 transition-all rounded-xl"
                        onClick={() => handleSendMessage(roommate)}
                        disabled={!roommate.isAvailable}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {roommate.isAvailable ? 'Send Message' : 'Currently Away'}
                        {roommate.unreadCount ? (
                          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 border-2 border-white text-xs font-bold text-white flex items-center justify-center shadow-sm">
                            {roommate.unreadCount > 9 ? '9+' : roommate.unreadCount}
                          </span>
                        ) : null}
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleCall(roommate.phone)}
                          className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-medium"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </button>
                        <button 
                          onClick={() => handleEmail(roommate.email)}
                          className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-medium"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-sm font-medium text-gray-500">
                        This is your card
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        recipient={selectedRoommate ? {
          id: selectedRoommate.id,
          name: selectedRoommate.name,
          status: selectedRoommate.isAvailable ? 'online' : 'offline'
        } : null} 
      />
    </div>
  )
}
