'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchTodayCheckins, performCheckout } from '@/store/slices/porterSlice'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { Search, Clock, User, LogOut, AlertCircle, CheckCircle, Calendar, MapPin } from 'lucide-react'
import apiClient from '@/lib/api'

interface Checkin {
  id: number
  student: {
    id: string
    firstName: string
    lastName: string
    indexNumber: string
    room: {
      roomNumber: string
    }
  }
  room: {
    roomNumber: string
  }
  checkInTime: string
  checkOutTime: string | null
  status: string
}

export default function PorterCheckout() {
  const dispatch = useDispatch()
  const { todayCheckins, loading } = useSelector((state: RootState) => state.porter)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [checkinsLoading, setCheckinsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchTodayCheckins() as any)
    loadCheckins()

    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
  }, [dispatch])

  const loadCheckins = async () => {
    setCheckinsLoading(true)
    try {
      const response = await apiClient.get<Checkin[]>('/porter/checkins')
      setCheckins(response)
    } catch (error) {
      console.error('Failed to load checkins:', error)
      setError('Failed to load checkins')
    } finally {
      setCheckinsLoading(false)
    }
  }

  useEffect(() => {
    dispatch(fetchTodayCheckins() as any)

    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.search-section',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.checkout-list',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [dispatch])

  const filteredCheckins = checkins.filter(checkin => {
    const matchesSearch = 
      checkin.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const activeCheckins = checkins.filter(checkin => checkin.status === 'active')
  const checkedOutToday = checkins.filter(checkin => 
    checkin.checkOutTime && new Date(checkin.checkOutTime).toDateString() === new Date().toDateString()
  )

  const filteredCheckinsActive = activeCheckins.filter(checkin =>
    checkin.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCheckout = async (studentId: string) => {
    try {
      await dispatch(performCheckout(studentId) as any)
      setSelectedStudent(null)
      setSearchTerm('')
      dispatch(fetchTodayCheckins() as any)
    } catch (error) {
      console.error('Error performing check-out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Check-out Management</h1>
              <p className="text-gray-600 mt-1">Process student check-outs and track departures</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{activeCheckins.length}</h3>
            <p className="text-gray-600">Currently Checked In</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600">{checkedOutToday.length}</h3>
            <p className="text-gray-600">Checked Out Today</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-600">
              {activeCheckins.length > 0 ? 
                Math.round(activeCheckins.reduce((acc, checkin) => {
                  const checkInTime = new Date(checkin.checkInTime)
                  const currentTime = new Date()
                  const hoursDiff = (currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
                  return acc + hoursDiff
                }, 0) / activeCheckins.length) : 0
              }h
            </h3>
            <p className="text-gray-600">Avg. Duration</p>
          </Card>
        </div>

        {/* Search Section */}
        <div className="search-section mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Student to Check Out</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or index number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            {searchTerm && filteredCheckins.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results:</h3>
                <div className="space-y-2">
                  {filteredCheckins.map(checkin => (
                    <div 
                      key={checkin.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedStudent(checkin.student)
                        setSearchTerm('')
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {checkin.student.firstName} {checkin.student.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {checkin.student.indexNumber} - Room {checkin.room?.roomNumber || 'Not assigned'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Checked in: {new Date(checkin.checkInTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <Button size="sm">
                          <LogOut className="w-4 h-4 mr-2" />
                          Check Out
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Selected Student */}
        {selectedStudent && (
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.indexNumber} - Room {selectedStudent.room?.roomNumber || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleCheckout(selectedStudent.id)}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Today's Check-outs */}
        <div className="checkout-list">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Check-outs</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : checkedOutToday.length > 0 ? (
              <div className="space-y-4">
                {checkedOutToday.map((checkin, index) => (
                  <div key={checkin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {checkin.student.firstName} {checkin.student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {checkin.student.indexNumber} - Room {checkin.room?.roomNumber || 'Not assigned'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Check-in: {new Date(checkin.checkInTime).toLocaleTimeString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <LogOut className="w-3 h-3" />
                            <span>Check-out: {checkin.checkOutTime ? new Date(checkin.checkOutTime).toLocaleTimeString() : 'Not checked out'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Duration: {checkin.checkOutTime ? Math.round(
                              (new Date(checkin.checkOutTime).getTime() - new Date(checkin.checkInTime).getTime()) / (1000 * 60 * 60)
                            ) : 'N/A'}h</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Checked Out</Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {checkin.checkOutTime ? new Date(checkin.checkOutTime).toLocaleTimeString() : 'Not checked out'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <LogOut className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No check-outs today</h3>
                <p className="text-gray-600">Students who check out will appear here</p>
              </div>
            )}
          </Card>
        </div>

        {/* Currently Checked In */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Currently Checked In</h2>
            
            {activeCheckins.length > 0 ? (
              <div className="space-y-4">
                {activeCheckins.map((checkin, index) => (
                  <div key={checkin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {checkin.student.firstName} {checkin.student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {checkin.student.indexNumber} - Room {checkin.room?.roomNumber || 'Not assigned'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Checked in: {new Date(checkin.checkInTime).toLocaleTimeString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Duration: {Math.round(
                              (new Date().getTime() - new Date(checkin.checkInTime).getTime()) / (1000 * 60 * 60)
                            )}h</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Active</Badge>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleCheckout(checkin.student.id)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Check Out
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students currently checked in</h3>
                <p className="text-gray-600">All students have checked out or no check-ins today</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  </div>
)
}
