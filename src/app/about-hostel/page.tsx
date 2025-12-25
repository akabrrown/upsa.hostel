'use client'

import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import { Building, MapPin, Wifi, Car, Shield, Users, DollarSign, Star, Edit, Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import styles from './page.module.css'

interface HostelPageContent {
  id?: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  hero_button_text: string
  features_title: string
  features_subtitle: string
  features: {
    id: string
    title: string
    description: string
    icon: string
    order: number
  }[]
  cta_title: string
  cta_subtitle: string
  cta_button_text: string
  cta_secondary_button_text: string
}

interface Hostel {
  id: string
  name: string
  description: string
  address: string
  total_rooms: number
  available_rooms: number
  monthly_fee: number
  amenities: string[]
  images: string[]
  rating: number
  status: 'active' | 'inactive'
  created_at: string
}

export default function AboutHostelPage() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [pageContent, setPageContent] = useState<HostelPageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Refs for hero animations
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    setIsAdmin(user?.role === 'admin')
    fetchHostels()
    fetchPageContent()
    
    // Initialize hero animations
    initHeroAnimations()
  }, [user])

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/admin/hostel-content')
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setPageContent(result.data)
        } else {
          // Use default content if no custom content exists
          setPageContent({
            hero_title: 'Discover Our Hostels',
            hero_subtitle: 'Experience world-class hostel facilities designed to provide comfort, security, and an environment conducive to academic excellence.',
            hero_background_image: 'https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg',
            hero_button_text: 'Explore Hostels',
            features_title: 'Why Choose UPSA Hostels?',
            features_subtitle: 'We provide quality accommodation with modern amenities to ensure your comfort and academic success.',
            features: [
              {
                id: '1',
                title: '24/7 Security',
                description: 'Round-the-clock security to ensure your safety and peace of mind.',
                icon: 'Shield',
                order: 1
              },
              {
                id: '2',
                title: 'Free WiFi',
                description: 'High-speed internet access throughout all hostel buildings.',
                icon: 'Wifi',
                order: 2
              },
              {
                id: '3',
                title: 'Parking Space',
                description: 'Secure parking facilities available for residents with vehicles.',
                icon: 'Car',
                order: 3
              },
              {
                id: '4',
                title: 'Community',
                description: 'Vibrant community with various social and academic activities.',
                icon: 'Users',
                order: 4
              }
            ],
            cta_title: 'Ready to Join Our Community?',
            cta_subtitle: 'Take the first step towards comfortable and secure hostel living. Apply now and secure your place in our vibrant student community.',
            cta_button_text: 'Apply for Hostel',
            cta_secondary_button_text: 'Contact Us'
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch page content:', error)
    }
  }

  const initHeroAnimations = async () => {
    // Only run animations on client side
    if (typeof window === 'undefined') return

    try {
      const { gsap } = await import('gsap')
      
      // Hero animations
      const tl = gsap.timeline()
      
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      )

    } catch (error) {
      console.warn('GSAP animations failed to load:', error)
    }
  }

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostels')
      if (response.ok) {
        const data = await response.json()
        setHostels(data.hostels || [])
      }
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />
      case 'parking':
        return <Car className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    )
  }

  const content = pageContent || {
    hero_title: 'Discover Our Hostels',
    hero_subtitle: 'Experience world-class hostel facilities designed to provide comfort, security, and an environment conducive to academic excellence.',
    hero_background_image: 'https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg',
    hero_button_text: 'Explore Hostels',
    features_title: 'Why Choose UPSA Hostels?',
    features_subtitle: 'We provide quality accommodation with modern amenities to ensure your comfort and academic success.',
    features: [],
    cta_title: 'Ready to Join Our Community?',
    cta_subtitle: 'Take the first step towards comfortable and secure hostel living. Apply now and secure your place in our vibrant student community.',
    cta_button_text: 'Apply for Hostel',
    cta_secondary_button_text: 'Contact Us'
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-8 h-8 text-blue-600" />
      case 'Wifi': return <Wifi className="w-8 h-8 text-blue-600" />
      case 'Car': return <Car className="w-8 h-8 text-blue-600" />
      case 'Users': return <Users className="w-8 h-8 text-blue-600" />
      case 'DollarSign': return <DollarSign className="w-8 h-8 text-blue-600" />
      case 'Star': return <Star className="w-8 h-8 text-blue-600" />
      default: return <Shield className="w-8 h-8 text-blue-600" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Homepage
            </Button>
            <div className="text-sm text-gray-500">
              UPSA Hostel Management
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className={styles.heroSection} style={{backgroundImage: `url(${content.hero_background_image})`}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className={styles.heroContent}>
          <h1 ref={titleRef} className="text-responsive-4xl md:text-responsive-6xl font-bold text-white mb-4 sm:mb-6">
            {content.hero_title}
          </h1>
          <p ref={subtitleRef} className="text-responsive-lg md:text-responsive-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto">
            {content.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-responsive-sm sm:text-responsive-base">
              {content.hero_button_text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-end gap-4">
            <Button 
              onClick={() => router.push('/admin/hostel-settings')}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Page Content
            </Button>
            <Button 
              onClick={() => router.push('/admin/hostels')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Manage Hostels
            </Button>
          </div>
        </div>
      )}

      {/* Hostels Grid */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {hostels.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Building />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hostels Available</h3>
            <p className="text-gray-600">
              {isAdmin ? 'Start by adding hostels to the system.' : 'Check back later for available hostels.'}
            </p>
            {isAdmin && (
              <Button 
                onClick={() => router.push('/admin/hostels')}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Hostel
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className={styles.hostelCard}>
                {/* Hostel Image */}
                <div className={styles.hostelImage}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building className="w-16 h-16 text-white/50" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hostel.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hostel.status}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="absolute top-4 left-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 hover:bg-white"
                        onClick={() => router.push(`/admin/hostels/${hostel.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Hostel Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-responsive-lg font-semibold text-gray-900 text-container-wrap">
                      {hostel.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {hostel.rating || 'N/A'}
                    </div>
                  </div>

                  <p className="text-responsive text-gray-600 mb-4 text-container-clamp-2">
                    {hostel.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-container-wrap">{hostel.address}</span>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {hostel.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </span>
                      ))}
                      {hostel.amenities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          +{hostel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rooms: </span>
                      <span className="font-medium text-green-600">{hostel.available_rooms}</span>
                      <span className="text-gray-500">/{hostel.total_rooms} available</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-blue-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-responsive-lg">{hostel.monthly_fee}</span>
                        <span className="text-responsive text-gray-500">/month</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => router.push(`/hostels/${hostel.id}`)}
                    >
                      View Details
                    </Button>
                    {user?.role === 'student' && hostel.available_rooms > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/student/room-booking?hostel=${hostel.id}`)}
                      >
                        Book Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">{content.features_title}</h2>
            <p className="text-responsive text-gray-600 max-w-2xl mx-auto">
              {content.features_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.sort((a, b) => a.order - b.order).map((feature) => (
              <div key={feature.id} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {getIconComponent(feature.icon)}
                </div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-responsive text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-responsive-3xl font-bold text-white mb-4">{content.cta_title}</h2>
          <p className="text-responsive-base md:text-responsive-lg text-blue-100 mb-8 max-w-3xl mx-auto">
            {content.cta_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 hover:bg-gray-100 text-base sm:text-lg font-medium">
              {content.cta_button_text}
            </Button>
            <Button variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 border-white text-white hover:bg-white hover:text-blue-600 text-base sm:text-lg font-medium">
              {content.cta_secondary_button_text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
