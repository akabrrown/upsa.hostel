'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, User, Send, X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function AdminAnnouncements() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: 'all',
    scheduledDate: '',
    scheduledTime: ''
  })

  useEffect(() => {
    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.stats-cards',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.announcements-list',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  const mockAnnouncements = [
    {
      id: 1,
      title: 'Hostel Fee Payment Reminder',
      content: 'Please be reminded that hostel fees for the second semester are due by the end of this month. Late payments will incur additional charges.',
      author: 'Bursary Department',
      category: 'payment',
      priority: 'high',
      status: 'published',
      targetAudience: 'all',
      createdAt: '2024-12-15',
      publishedAt: '2024-12-15',
      views: 245,
      readCount: 189,
      scheduledDate: null
    },
    {
      id: 2,
      title: 'Water Supply Interruption Notice',
      content: 'There will be a temporary water supply interruption on Block A from 9 AM to 12 PM tomorrow for maintenance work.',
      author: 'Facilities Management',
      category: 'maintenance',
      priority: 'medium',
      status: 'published',
      targetAudience: 'block_a',
      createdAt: '2024-12-14',
      publishedAt: '2024-12-14',
      views: 156,
      readCount: 134,
      scheduledDate: null
    },
    {
      id: 3,
      title: 'End of Semester Examination Schedule',
      content: 'The examination schedule for the end of semester has been released. Please check your student portal for details.',
      author: 'Academic Affairs',
      category: 'academic',
      priority: 'medium',
      status: 'draft',
      targetAudience: 'students',
      createdAt: '2024-12-13',
      publishedAt: null,
      views: 0,
      readCount: 0,
      scheduledDate: '2024-12-20'
    },
    {
      id: 4,
      title: 'Holiday Hostel Closure Notice',
      content: 'The hostel will be closed for the holidays from December 20th to January 5th. Please make alternative arrangements.',
      author: 'Hostel Management',
      category: 'general',
      priority: 'low',
      status: 'scheduled',
      targetAudience: 'all',
      createdAt: '2024-12-12',
      publishedAt: null,
      views: 0,
      readCount: 0,
      scheduledDate: '2024-12-18'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Categories', color: 'gray' },
    { id: 'general', name: 'General', color: 'blue' },
    { id: 'academic', name: 'Academic', color: 'green' },
    { id: 'payment', name: 'Payment', color: 'yellow' },
    { id: 'maintenance', name: 'Maintenance', color: 'orange' },
    { id: 'emergency', name: 'Emergency', color: 'red' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'draft', name: 'Draft' },
    { id: 'published', name: 'Published' },
    { id: 'scheduled', name: 'Scheduled' },
    { id: 'archived', name: 'Archived' }
  ]

  const targetAudiences = [
    { id: 'all', name: 'All Users' },
    { id: 'students', name: 'Students Only' },
    { id: 'admin', name: 'Admin Only' },
    { id: 'porter', name: 'Porters Only' },
    { id: 'director', name: 'Directors Only' },
    { id: 'block_a', name: 'Block A Residents' },
    { id: 'block_b', name: 'Block B Residents' },
    { id: 'block_c', name: 'Block C Residents' }
  ]

  const filteredAnnouncements = mockAnnouncements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || announcement.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'archived': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : 'gray'
  }

  const totalAnnouncements = mockAnnouncements.length
  const publishedCount = mockAnnouncements.filter(a => a.status === 'published').length
  const draftCount = mockAnnouncements.filter(a => a.status === 'draft').length
  const scheduledCount = mockAnnouncements.filter(a => a.status === 'scheduled').length

  const handleCreateAnnouncement = () => {
    // Handle announcement creation
    console.log('Creating announcement:', formData)
    setShowCreateModal(false)
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      targetAudience: 'all',
      scheduledDate: '',
      scheduledTime: ''
    })
  }

  const handleDeleteAnnouncement = (id: number) => {
    // Handle announcement deletion
    console.log('Deleting announcement:', id)
  }

  const handlePublishAnnouncement = (id: number) => {
    // Handle announcement publishing
    console.log('Publishing announcement:', id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Announcements Management</h1>
              <p className="text-gray-600 mt-1">Create and manage hostel announcements</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{totalAnnouncements}</h3>
              <p className="text-gray-600">Total Announcements</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">{publishedCount}</h3>
              <p className="text-gray-600">Published</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Edit className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600">{draftCount}</h3>
              <p className="text-gray-600">Drafts</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600">{scheduledCount}</h3>
              <p className="text-gray-600">Scheduled</p>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
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

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredAnnouncements.length} announcements
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="announcements-list">
          {filteredAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement, index) => (
                <Card key={announcement.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        <Badge className={getStatusColor(announcement.status)}>
                          {announcement.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {announcement.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{announcement.author}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                          </span>
                          {announcement.publishedAt && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Published: {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                            </span>
                          )}
                          {announcement.scheduledDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Scheduled: {new Date(announcement.scheduledDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>Views: {announcement.views}</span>
                          <span>Read: {announcement.readCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {announcement.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublishAnnouncement(announcement.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </Card>
          )}
        </div>

        {/* Create Announcement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Announcement</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter announcement title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter announcement content"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.filter(c => c.id !== 'all').map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {targetAudiences.map(audience => (
                        <option key={audience.id} value={audience.id}>
                          {audience.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Time (Optional)
                      </label>
                      <Input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAnnouncement}>
                    Create Announcement
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
