'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchTodayCheckins, performCheckin } from '@/store/slices/porterSlice'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Clock, CheckCircle, XCircle, LogIn, User, MapPin, AlertCircle } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import apiClient from '@/lib/api'

interface SearchResult {
  id: string
  firstName: string
  lastName: string
  indexNumber: string
  room?: {
    roomNumber: string
  }
}

export default function PorterCheckin() {
  const dispatch = useDispatch()
  const { todayCheckins, loading } = useSelector((state: RootState) => state.porter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null)

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
    .fromTo('.checkin-list',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [dispatch])

  const handleSearch = async () => {
    // Search student by index number or room number
    try {
      const response = await fetch(`/api/porter/search-student?query=${searchTerm}`)
      const data = await response.json()
      
      if (response.ok && data.data) {
        setSelectedStudent(data.data)
      } else {
        setSelectedStudent(null)
      }
    } catch (error) {
      console.error('Error searching student:', error)
      setSelectedStudent(null)
    }
  }

  const handleCheckin = async (studentId: string) => {
    try {
      await dispatch(performCheckin(studentId) as any)
      setSelectedStudent(null)
      setSearchTerm('')
      dispatch(fetchTodayCheckins() as any)
    } catch (error) {
      console.error('Error performing check-in:', error)
    }
  }

  const filteredCheckins = todayCheckins?.filter((checkin: any) =>
    checkin.student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.indexNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Check-In</h1>
              <p className="text-gray-600 mt-1">Manage student check-ins and check-outs</p>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Student</h2>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Enter index number, room number, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                Search
              </Button>
            </div>

            {/* Search Results */}
            {selectedStudent && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                        {formatIndexNumber(selectedStudent.indexNumber)} - Room {selectedStudent.room?.roomNumber || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleCheckin(selectedStudent.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Today's Check-ins */}
        <div className="checkin-list">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Check-ins</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredCheckins.length > 0 ? (
              <div className="space-y-4">
                {filteredCheckins.map((checkin: any) => (
                  <div key={checkin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {checkin.student.firstName} {checkin.student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatIndexNumber(checkin.student.indexNumber)} - Room {checkin.room?.roomNumber || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Checked In</Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(checkin.checkInTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No check-ins found for today</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{todayCheckins?.length || 0}</h3>
            <p className="text-gray-600">Total Check-ins Today</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600">
              {todayCheckins?.filter((c: any) => c.status === 'active').length || 0}
            </h3>
            <p className="text-gray-600">Currently Checked In</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-600">
              {todayCheckins?.filter((c: any) => c.status === 'checked_out').length || 0}
            </h3>
            <p className="text-gray-600">Checked Out Today</p>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
