'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Image, 
  Type, 
  Settings,
  Shield,
  Wifi,
  Car,
  Users,
  DollarSign,
  Star
} from 'lucide-react'

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

const availableIcons = [
  { value: 'Shield', label: 'Security', icon: Shield },
  { value: 'Wifi', label: 'WiFi', icon: Wifi },
  { value: 'Car', label: 'Parking', icon: Car },
  { value: 'Users', label: 'Community', icon: Users },
  { value: 'DollarSign', label: 'Price', icon: DollarSign },
  { value: 'Star', label: 'Rating', icon: Star },
]

export default function HostelSettingsPage() {
  const [content, setContent] = useState<HostelPageContent>({
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
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    fetchContent()
  }, [user, router])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/hostel-content')
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setContent(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async () => {
    setIsSaving(true)
    try {
      const method = content.id ? 'PUT' : 'POST'
      const url = content.id ? `/api/admin/hostel-content?id=${content.id}` : '/api/admin/hostel-content'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        const result = await response.json()
        setContent(result.data)
        alert('Content saved successfully!')
      } else {
        throw new Error('Failed to save content')
      }
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      title: 'New Feature',
      description: 'Feature description',
      icon: 'Shield',
      order: content.features.length + 1
    }
    setContent({
      ...content,
      features: [...content.features, newFeature]
    })
  }

  const updateFeature = (index: number, field: string, value: any) => {
    const updatedFeatures = [...content.features]
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    }
    setContent({
      ...content,
      features: updatedFeatures
    })
  }

  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_, i) => i !== index)
    setContent({
      ...content,
      features: updatedFeatures
    })
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Hostel Page Settings</h1>
            </div>
            <Button
              onClick={saveContent}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Image className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={content.hero_title}
                  onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  value={content.hero_subtitle}
                  onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={content.hero_background_image}
                  onChange={(e) => setContent({ ...content, hero_background_image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={content.hero_button_text}
                  onChange={(e) => setContent({ ...content, hero_button_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Features Section Settings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Features Section</h2>
              </div>
              <Button onClick={addFeature} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features Title
                </label>
                <input
                  type="text"
                  value={content.features_title}
                  onChange={(e) => setContent({ ...content, features_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features Subtitle
                </label>
                <textarea
                  value={content.features_subtitle}
                  onChange={(e) => setContent({ ...content, features_subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Individual Features */}
            <div className="space-y-4">
              {content.features.map((feature, index) => (
                <Card key={feature.id} className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Feature {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {availableIcons.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* CTA Section Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Type className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Call-to-Action Section</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Title
                </label>
                <input
                  type="text"
                  value={content.cta_title}
                  onChange={(e) => setContent({ ...content, cta_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Subtitle
                </label>
                <textarea
                  value={content.cta_subtitle}
                  onChange={(e) => setContent({ ...content, cta_subtitle: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={content.cta_button_text}
                    onChange={(e) => setContent({ ...content, cta_button_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={content.cta_secondary_button_text}
                    onChange={(e) => setContent({ ...content, cta_secondary_button_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
