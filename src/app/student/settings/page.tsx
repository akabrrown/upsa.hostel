'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { studentSettingsApi, authApi, handleApiError } from '@/lib/api'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Smartphone,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react'
import { gsap } from 'gsap'

export default function StudentSettings() {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
    theme: 'light'
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null,
    message: string | null
  }>({ type: null, message: null })

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login')
      return
    }

    const fetchSettings = async () => {
      try {
        const response: any = await studentSettingsApi.get()
        if (response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
    
    // Animation
    gsap.from('.settings-card', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    })
  }, [user, router])

  const handleUpdateSettings = async (updates: any) => {
    setStatus({ type: null, message: null })
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    
    try {
      await studentSettingsApi.update(updates)
      setStatus({ type: 'success', message: 'Settings updated successfully' })
    } catch (error) {
      setStatus({ type: 'error', message: handleApiError(error, 'Failed to update settings') })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }
    
    setSaving(true)
    setStatus({ type: null, message: null })
    
    try {
      await authApi.changePassword(passwordData)
      setStatus({ type: 'success', message: 'Password changed successfully' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setStatus({ type: 'error', message: handleApiError(error, 'Failed to change password') })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile preferences and security</p>
        </div>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid gap-8">
        {/* Notifications Section */}
        <Card className="settings-card overflow-hidden">
          <div className="p-6 border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified about hostel updates</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive booking and payment receipts via email</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ email_notifications: !settings.email_notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Get important alerts sent to your phone</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ sms_notifications: !settings.sms_notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sms_notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="settings-card overflow-hidden">
          <div className="p-6 border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Keep your account safe by updating your password periodically</p>
          </div>
          <div className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Update Password
                  </div>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Appearance Section (Mock for now as global theme needs more setup) */}
        <Card className="settings-card overflow-hidden opacity-50 cursor-not-allowed">
          <div className="p-6 border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1 text-container-wrap">Customize your viewing experience (Coming Soon)</p>
          </div>
          <div className="p-6 flex gap-4">
             <div className="flex-1 p-4 rounded-xl border-2 border-blue-600 bg-white shadow-sm relative overflow-hidden">
                <Sun className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-semibold text-gray-900">Light Mode</p>
                <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
             </div>
             <div className="flex-1 p-4 rounded-xl border border-gray-200 bg-gray-100/50">
                <Moon className="w-6 h-6 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-400">Dark Mode</p>
             </div>
          </div>
        </Card>
      </div>
      
      <div className="mt-12 text-center">
         <p className="text-sm text-gray-400">
            Need more help? Contact our support team at <a href="mailto:support@upsa.edu.gh" className="text-blue-500 hover:underline">support@upsa.edu.gh</a>
         </p>
      </div>
    </div>
  )
}
