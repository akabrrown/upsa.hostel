'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import ModernBadge from '@/components/admin/ModernBadge'
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  Settings,
  Shield,
  Wifi,
  Car,
  Users,
  DollarSign,
  Star,
  X,
  Layout,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'

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
      { id: '1', title: '24/7 Security', description: 'Round-the-clock security to ensure your safety and peace of mind.', icon: 'Shield', order: 1 },
      { id: '2', title: 'Free WiFi', description: 'High-speed internet access throughout all hostel buildings.', icon: 'Wifi', order: 2 },
      { id: '3', title: 'Parking Space', description: 'Secure parking facilities available for residents with vehicles.', icon: 'Car', order: 3 },
      { id: '4', title: 'Community', description: 'Vibrant community with various social and academic activities.', icon: 'Users', order: 4 }
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

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        const result = await response.json()
        setContent(result.data)
        // Toast or small notification instead of alert would be better, but keeping consistency
        alert('Content saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSystem = async () => {
    if (!window.confirm('CRITICAL WARNING:\n\nThis will delete ALL student bookings, room allocations, and reset all room occupancy counters to zero.\n\nThis action cannot be undone. Are you absolutely sure you want to proceed?')) {
      return
    }

    if (!window.confirm('Final Confirmation: You are about to wipe the entire semester allocation data. Confirm to proceed.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/reset-system', {
        method: 'POST',
      })

      if (response.ok) {
        alert('System reset successfully. All bookings and data have been cleared.')
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Failed to reset system: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('System reset error:', error)
      alert('An error occurred while resetting the system.')
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
    setContent({ ...content, features: [...content.features, newFeature] })
  }

  const updateFeature = (index: number, field: string, value: any) => {
    const updatedFeatures = [...content.features]
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value }
    setContent({ ...content, features: updatedFeatures })
  }

  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_, i) => i !== index)
    setContent({ ...content, features: updatedFeatures })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Stick Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <h1 className="text-xl font-bold text-gray-900">Landing Page CMS</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control &quot;Discover Hostels&quot; Content</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="hidden sm:flex border-none font-bold text-blue-600 hover:bg-blue-50">
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Preview
           </Button>
           <Button onClick={saveContent} disabled={isSaving} className="shadow-lg shadow-blue-500/20">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Synching...' : 'Commit Changes'}
           </Button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-10">
         {/* Hero Section Master */}
         <section className="page-entry-anim">
            <div className="flex items-center gap-2 mb-4 px-2">
               <ImageIcon className="w-4 h-4 text-blue-600" />
               <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Stage 1: Hero Experience</span>
            </div>
            <Card className="p-8 border-none shadow-sm bg-white overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -mr-32 -mt-32 -z-0" />
               <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Primary Catchphrase</label>
                        <Input value={content.hero_title} onChange={(e) => setContent({ ...content, hero_title: e.target.value })} placeholder="Main Title" className="font-bold text-lg" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Action Button Text</label>
                        <Input value={content.hero_button_text} onChange={(e) => setContent({ ...content, hero_button_text: e.target.value })} placeholder="Button Label" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Supporting Narrative</label>
                     <textarea value={content.hero_subtitle} onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })} rows={3} className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="Provide context..." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Key Visual asset (URL)</label>
                     <div className="flex gap-4">
                        <Input value={content.hero_background_image} onChange={(e) => setContent({ ...content, hero_background_image: e.target.value })} className="flex-1" />
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-200">
                           <img src={content.hero_background_image} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
         </section>

         {/* Features List Section */}
         <section className="page-entry-anim">
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Stage 2: Core Value Props</span>
               </div>
               <Button onClick={addFeature} size="sm" variant="outline" className="h-8 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50">
                  <Plus className="w-3 h-3 mr-1" /> New Value Prop
               </Button>
            </div>
            <Card className="p-8 border-none shadow-sm bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-50">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Section Header</label>
                     <Input value={content.features_title} onChange={(e) => setContent({ ...content, features_title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Summary Label</label>
                     <Input value={content.features_subtitle} onChange={(e) => setContent({ ...content, features_subtitle: e.target.value })} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.features.map((feature, index) => (
                    <div key={feature.id} className="group p-6 border border-gray-100 rounded-3xl bg-gray-50/30 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:border-blue-100 transition-all relative overflow-hidden">
                       <button onClick={() => removeFeature(index)} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded-full transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                       <div className="flex gap-5">
                          <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                             {availableIcons.find(i => i.value === feature.icon)?.icon ? (
                               React.createElement(availableIcons.find(i => i.value === feature.icon)!.icon, { className: "w-6 h-6 text-blue-600" })
                             ) : <Shield className="w-6 h-6 text-gray-300" />}
                          </div>
                          <div className="flex-1 space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Feature Heading</label>
                                <Input value={feature.title} onChange={(e) => updateFeature(index, 'title', e.target.value)} className="h-9 font-bold" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Icon Identity</label>
                                <select value={feature.icon} onChange={(e) => updateFeature(index, 'icon', e.target.value)} className="w-full px-3 py-1.5 border border-gray-100 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100">
                                  {availableIcons.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                </select>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Context Description</label>
                                <textarea value={feature.description} onChange={(e) => updateFeature(index, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 text-xs border border-gray-100 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-100" />
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </section>

         {/* Final CTA Section */}
         <section className="page-entry-anim">
            <div className="flex items-center gap-2 mb-4 px-2">
               <Type className="w-4 h-4 text-green-600" />
               <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Stage 3: Engagement Trigger</span>
            </div>
            <Card className="p-8 border-none shadow-sm bg-blue-600 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent -z-0" />
               <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Closing Pitch</label>
                        <Input value={content.cta_title} onChange={(e) => setContent({ ...content, cta_title: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/30 font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Supporting Context</label>
                        <textarea value={content.cta_subtitle} onChange={(e) => setContent({ ...content, cta_subtitle: e.target.value })} rows={2} className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white text-sm focus:ring-4 focus:ring-white/10 transition-all outline-none" />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Primary Call (Label)</label>
                        <Input value={content.cta_button_text} onChange={(e) => setContent({ ...content, cta_button_text: e.target.value })} className="bg-white text-blue-900 font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Secondary Call (Label)</label>
                        <Input value={content.cta_secondary_button_text} onChange={(e) => setContent({ ...content, cta_secondary_button_text: e.target.value })} className="bg-white/20 border-white/30 text-white font-bold" />
                     </div>
                  </div>
               </div>
            </Card>
         </section>
          {/* Danger Zone */}
          <section className="page-entry-anim">
            <div className="flex items-center gap-2 mb-4 px-2">
               <AlertTriangle className="w-4 h-4 text-red-600" />
               <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Danger Zone</span>
            </div>
            <Card className="p-8 border-red-100 shadow-sm bg-red-50/50">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                     <h3 className="text-lg font-bold text-red-900 mb-2">Reset Semester System</h3>
                     <p className="text-sm text-red-700/80 max-w-xl">
                        This action will <strong>permanently delete</strong> all student bookings, reservations, and room allocations. 
                        It will also reset all room occupancy counters to zero. Use this only when preparing for a fresh semester.
                     </p>
                  </div>
                  <Button 
                    onClick={handleResetSystem} 
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20 whitespace-nowrap"
                  >
                     {isSaving ? 'Resetting...' : 'Reset All System Data'}
                  </Button>
               </div>
            </Card>
          </section>

      </main>
    </div>
  )
}

// Helper to use Lucide icons dynamically
import React from 'react'
