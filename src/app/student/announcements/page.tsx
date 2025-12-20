'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { Search, Bell, Calendar, User, Filter, AlertCircle, Info, CheckCircle } from 'lucide-react'
import apiClient from '@/lib/api'

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  category: string
  priority: string
  date: string
  read: boolean
  icon: any
}

export default function StudentAnnouncements() {
  const dispatch = useDispatch()
  const { notifications, loading } = useSelector((state: RootState) => state.notifications)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchNotifications() as any)
    loadAnnouncements()

    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
  }, [])

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true)
    try {
      const response = await apiClient.get<Announcement[]>('/student/announcements')
      setAnnouncements(response)
    } catch (error) {
      console.error('Failed to load announcements:', error)
      setError('Failed to load announcements')
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  useEffect(() => {
    dispatch(fetchNotifications() as any)
    loadAnnouncements()

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
    .fromTo('.announcements-list',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [dispatch])

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'academic', name: 'Academic', color: 'blue' },
    { id: 'payment', name: 'Payment', color: 'green' },
    { id: 'maintenance', name: 'Maintenance', color: 'yellow' },
    { id: 'social', name: 'Social', color: 'purple' },
    { id: 'emergency', name: 'Emergency', color: 'red' }
  ]

  const priorities = [
    { id: 'all', name: 'All Priorities' },
    { id: 'low', name: 'Low', color: 'gray' },
    { id: 'medium', name: 'Medium', color: 'yellow' },
    { id: 'high', name: 'High', color: 'red' },
    { id: 'emergency', name: 'Emergency', color: 'red' }
  ]

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : 'gray'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-600 mt-1">Stay updated with the latest hostel news and notices</p>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {announcements.filter(a => !a.read).length} unread
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-section mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredAnnouncements.length} announcements
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="announcements-list">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading announcements...</p>
            </Card>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement, index) => {
                const Icon = announcement.icon
                return (
                  <Card 
                    key={announcement.id}
                    className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      !announcement.read ? 'border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedAnnouncement(announcement)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 bg-${getCategoryColor(announcement.category)}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${getCategoryColor(announcement.category)}-600`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!announcement.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {announcement.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{announcement.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(announcement.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {announcement.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
