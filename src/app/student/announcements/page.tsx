'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { gsap } from 'gsap'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Bell, Calendar, User, Filter, AlertCircle, Info, CheckCircle2, Megaphone, Check } from 'lucide-react'
import apiClient from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  category: string
  priority: string
  date: string
  read: boolean
}

export default function StudentAnnouncements() {
  const dispatch = useDispatch()
  const { notifications, loading: notifLoading } = useSelector((state: RootState) => state.notifications)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<any>('/announcements')
      setAnnouncements(response.data || [])
    } catch (error) {
      console.error('Failed to load announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    dispatch(fetchNotifications() as any)
    loadAnnouncements()
  }, [dispatch])

  // GSAP Animations
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.page-header',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.announcement-card',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, delay: 0.2, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading])

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'academic': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Info }
      case 'payment': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 }
      case 'maintenance': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle }
      case 'emergency': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle }
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: Megaphone }
    }
  }

  const markAsRead = (id: number) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    toast.success('Marked as read')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-12 px-6 page-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-indigo-50 rounded-lg">
                   <Megaphone className="w-6 h-6 text-indigo-600" />
                 </div>
                 <span className="text-indigo-600 font-semibold uppercase tracking-wider text-sm">Notice Board</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
              <p className="text-gray-500 max-w-2xl">
                Stay updated with the latest news, events, and important notices from the administration.
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
               <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium text-sm">
                 <Bell className="w-4 h-4" />
                 {announcements.filter(a => !a.read).length} Unread
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 page-header relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="md:w-56 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="payment">Payment</option>
              <option value="maintenance">Maintenance</option>
              <option value="social">Social</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => {
              const config = getCategoryConfig(announcement.category)
              const Icon = config.icon
              
              return (
                <div 
                  key={announcement.id} 
                  className={`group announcement-card bg-white rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden ${announcement.read ? 'border-gray-100 opacity-90' : 'border-l-4 border-l-blue-500 border-gray-100'}`}
                >
                  <div className="flex items-start gap-4 z-10 relative">
                     <div className={`p-3 rounded-xl ${config.bg} flex-shrink-0`}>
                       <Icon className={`w-6 h-6 ${config.color}`} />
                     </div>
                     
                     <div className="flex-1">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                         <div className="flex items-center gap-3">
                           <h3 className={`text-lg font-bold ${announcement.read ? 'text-gray-700' : 'text-gray-900'}`}>{announcement.title}</h3>
                           {!announcement.read && (
                             <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                               New
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-3 text-xs text-gray-500">
                           <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                             <User className="w-3 h-3" />
                             {announcement.author}
                           </span>
                           <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                             <Calendar className="w-3 h-3" />
                             {new Date(announcement.date).toLocaleDateString()}
                           </span>
                         </div>
                       </div>
                       
                       <p className={`text-sm mb-4 leading-relaxed ${announcement.read ? 'text-gray-500' : 'text-gray-600'}`}>
                         {announcement.content}
                       </p>
                       
                       <div className="flex items-center justify-between">
                         <Badge variant="outline" className={`capitalize ${config.color} ${config.bg} border-0`}>
                           {announcement.category}
                         </Badge>
                         
                         {!announcement.read && (
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             onClick={() => markAsRead(announcement.id)}
                             className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                           >
                             <Check className="w-3 h-3 mr-1" /> Mark as Read
                           </Button>
                         )}
                       </div>
                     </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm announcement-card">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                 You are all caught up! There are no announcements to display at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
