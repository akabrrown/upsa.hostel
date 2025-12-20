'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { Settings, Bell, Mail, Shield, Database, CreditCard, Users, Building, Calendar, Save, RefreshCw, Download, Upload } from 'lucide-react'

interface SystemSettings {
  // General Settings
  institutionName: string
  institutionEmail: string
  institutionPhone: string
  institutionAddress: string
  academicYear: string
  currentSemester: string
  
  // Payment Settings
  paymentReminderDays: number
  latePaymentFee: number
  paymentMethods: string[]
  currency: string
  
  // Email Settings
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  emailFromName: string
  emailFromAddress: string
  
  // Notification Settings
  enableEmailNotifications: boolean
  enableSmsNotifications: boolean
  enablePushNotifications: boolean
  notificationFrequency: string
  
  // Security Settings
  passwordMinLength: number
  sessionTimeout: number
  maxLoginAttempts: number
  enableTwoFactorAuth: boolean
  
  // Backup Settings
  autoBackup: boolean
  backupFrequency: string
  backupRetention: number
  lastBackupDate: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  category: string
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<SystemSettings>({
    institutionName: 'University of Professional Studies Accra',
    institutionEmail: 'info@upsamail.edu.gh',
    institutionPhone: '+233 302 518 200',
    institutionAddress: 'P.O. Box LG 149, Accra, Ghana',
    academicYear: '2023/2024',
    currentSemester: 'Second Semester',
    paymentReminderDays: 7,
    latePaymentFee: 50,
    paymentMethods: ['Bank Transfer', 'Mobile Money', 'Credit Card'],
    currency: 'GHS',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@upsamail.edu.gh',
    smtpPassword: '',
    emailFromName: 'UPSA Hostel Management',
    emailFromAddress: 'noreply@upsamail.edu.gh',
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: false,
    notificationFrequency: 'daily',
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableTwoFactorAuth: false,
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    lastBackupDate: '2024-12-15T02:00:00Z'
  })
  
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Payment Reminder',
      subject: 'Hostel Fee Payment Reminder',
      content: 'Dear {studentName},\n\nThis is a reminder that your hostel fee of {amount} {currency} is due by {dueDate}. Please make your payment as soon as possible to avoid late fees.\n\nThank you,\nUPSA Hostel Management',
      variables: ['studentName', 'amount', 'currency', 'dueDate'],
      category: 'payment'
    },
    {
      id: '2',
      name: 'Room Allocation',
      subject: 'Room Allocation Confirmation',
      content: 'Dear {studentName},\n\nYou have been allocated to {hostel}, {room} for the {semester} of {academicYear}.\n\nPlease check your student portal for more details.\n\nBest regards,\nUPSA Hostel Management',
      variables: ['studentName', 'hostel', 'room', 'semester', 'academicYear'],
      category: 'allocation'
    },
    {
      id: '3',
      name: 'Welcome',
      subject: 'Welcome to UPSA Hostel Management System',
      content: 'Dear {studentName},\n\nWelcome to the UPSA Hostel Management System. Your account has been created with the following details:\n\nEmail: {email}\nPassword: {password}\n\nPlease log in and complete your profile.\n\nBest regards,\nUPSA Hostel Management',
      variables: ['studentName', 'email', 'password'],
      category: 'welcome'
    }
  ])
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.settings-tabs',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.settings-content',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [user, router])

  const handleSaveSettings = () => {
    // Handle settings save
    console.log('Saving settings:', settings)
    // Show success message
  }

  const handleTestEmail = () => {
    // Handle email test
    console.log('Testing email configuration')
  }

  const handleBackup = () => {
    // Handle manual backup
    console.log('Creating backup')
  }

  const handleRestore = () => {
    // Handle restore
    console.log('Restoring from backup')
  }

  const handleSaveTemplate = () => {
    // Handle template save
    console.log('Saving template:', selectedTemplate)
    setShowTemplateEditor(false)
    setSelectedTemplate(null)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'backup', name: 'Backup', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleBackup}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="settings-tabs mb-8">
            <Card className="p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* General Settings */}
            {activeTab === 'general' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <Input
                      value={settings.institutionName}
                      onChange={(e) => setSettings(prev => ({ ...prev, institutionName: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Email
                    </label>
                    <Input
                      type="email"
                      value={settings.institutionEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, institutionEmail: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Phone
                    </label>
                    <Input
                      value={settings.institutionPhone}
                      onChange={(e) => setSettings(prev => ({ ...prev, institutionPhone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Address
                    </label>
                    <Input
                      value={settings.institutionAddress}
                      onChange={(e) => setSettings(prev => ({ ...prev, institutionAddress: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <select
                      value={settings.academicYear}
                      onChange={(e) => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="2023/2024">2023/2024</option>
                      <option value="2024/2025">2024/2025</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Semester
                    </label>
                    <select
                      value={settings.currentSemester}
                      onChange={(e) => setSettings(prev => ({ ...prev, currentSemester: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="First Semester">First Semester</option>
                      <option value="Second Semester">Second Semester</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Reminder Days
                    </label>
                    <Input
                      type="number"
                      value={settings.paymentReminderDays}
                      onChange={(e) => setSettings(prev => ({ ...prev, paymentReminderDays: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Payment Fee ({settings.currency})
                    </label>
                    <Input
                      type="number"
                      value={settings.latePaymentFee}
                      onChange={(e) => setSettings(prev => ({ ...prev, latePaymentFee: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GHS">GHS - Ghana Cedi</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Methods
                    </label>
                    <div className="space-y-2">
                      {['Bank Transfer', 'Mobile Money', 'Credit Card'].map(method => (
                        <label key={method} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={settings.paymentMethods.includes(method)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, method] }))
                              } else {
                                setSettings(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(m => m !== method) }))
                              }
                            }}
                          />
                          <span className="text-sm">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Configuration</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <Input
                        value={settings.smtpHost}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <Input
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <Input
                        value={settings.smtpUsername}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <Input
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <Input
                        value={settings.emailFromName}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailFromName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Address
                      </label>
                      <Input
                        type="email"
                        value={settings.emailFromAddress}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailFromAddress: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={handleTestEmail}>
                      <Mail className="w-4 h-4 mr-2" />
                      Test Email Configuration
                    </Button>
                  </div>
                </Card>

                {/* Email Templates */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
                    <Button onClick={() => setShowTemplateEditor(true)}>
                      <Mail className="w-4 h-4 mr-2" />
                      New Template
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {emailTemplates.map(template => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-500">{template.subject}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{template.category}</Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedTemplate(template)
                                setShowTemplateEditor(true)
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="line-clamp-2">{template.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Notification Channels</h3>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enableEmailNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Enable Email Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enableSmsNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, enableSmsNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Enable SMS Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enablePushNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, enablePushNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Enable Push Notifications</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Frequency
                    </label>
                    <select
                      value={settings.notificationFrequency}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <Input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Login Attempts
                    </label>
                    <Input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 pt-6">
                    <input
                      type="checkbox"
                      checked={settings.enableTwoFactorAuth}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableTwoFactorAuth: e.target.checked }))}
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Backup Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Automatic Backup</h3>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                      />
                      <span className="text-sm">Enable Automatic Backup</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Retention (days)
                      </label>
                      <Input
                        type="number"
                        value={settings.backupRetention}
                        onChange={(e) => setSettings(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Backup Status</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Last Backup:</span>
                        <span className="text-sm text-gray-600">
                          {new Date(settings.lastBackupDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button onClick={handleBackup}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Backup Now
                      </Button>
                      <Button variant="outline" onClick={handleRestore}>
                        <Upload className="w-4 h-4 mr-2" />
                        Restore Backup
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate ? 'Edit Template' : 'New Template'}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowTemplateEditor(false)
                    setSelectedTemplate(null)
                  }}
                >
                  X
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <Input
                    value={selectedTemplate?.name || ''}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Enter template name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    value={selectedTemplate?.subject || ''}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={selectedTemplate?.content || ''}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                    placeholder="Enter email content"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedTemplate?.category || ''}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="payment">Payment</option>
                    <option value="allocation">Allocation</option>
                    <option value="welcome">Welcome</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                
                {selectedTemplate && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{${variable}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowTemplateEditor(false)
                    setSelectedTemplate(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  Save Template
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
