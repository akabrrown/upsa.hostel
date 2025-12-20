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
import { DataTable } from '@/components/ui/dataTable'
import { Search, Bell, Mail, MessageSquare, Settings, Clock, CheckCircle, AlertCircle, Send, Eye, Edit, Trash2 } from 'lucide-react'
import { TableColumn } from '@/types'

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  category: string
  subject?: string
  content: string
  variables: string[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
}

interface NotificationHistory {
  id: string
  recipient: string
  type: 'email' | 'sms' | 'push'
  template: string
  subject?: string
  status: 'sent' | 'pending' | 'failed'
  sentAt: string
  deliveredAt?: string
  error?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  paymentReminders: boolean
  allocationNotifications: boolean
  announcementNotifications: boolean
  systemAlerts: boolean
  reminderFrequency: 'daily' | 'weekly' | 'monthly'
}

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('templates')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    paymentReminders: true,
    allocationNotifications: true,
    announcementNotifications: true,
    systemAlerts: true,
    reminderFrequency: 'weekly'
  })
  
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    // In real app, this would come from API
    const templatesData: NotificationTemplate[] = []
    const historyData: NotificationHistory[] = []

    setTimeout(() => {
      setTemplates(templatesData)
      setHistory(historyData)
      
      // Animate page content
      const tl = gsap.timeline()
      
      tl.fromTo('.page-header',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.notification-tabs',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.notification-content',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
    }, 1000)
  }, [user, router])

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredHistory = history.filter(item =>
    item.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.template.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveTemplate = () => {
    // Handle template save
    console.log('Saving template:', selectedTemplate)
    setShowTemplateEditor(false)
    setSelectedTemplate(null)
  }

  const handleSendTest = (templateId: string) => {
    // Handle test email/SMS send
    console.log('Sending test notification for template:', templateId)
  }

  const handleToggleTemplate = (templateId: string, isActive: boolean) => {
    // Handle template activation/deactivation
    console.log('Toggling template:', templateId, isActive)
  }

  const templateColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Template Information',
      render: (value: any, row: NotificationTemplate) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {row.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
            {row.type === 'sms' && <MessageSquare className="w-5 h-5 text-blue-600" />}
            {row.type === 'push' && <Bell className="w-5 h-5 text-blue-600" />}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.category}</div>
            <div className="text-xs text-gray-400">
              Variables: {row.variables.join(', ')}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string, row: NotificationTemplate) => (
        <Badge className={
          row.type === 'email' ? 'bg-blue-100 text-blue-800' :
          row.type === 'sms' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }>
          {row.type.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, row: NotificationTemplate) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            row.isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm">
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      key: 'usage',
      title: 'Usage',
      render: (value: any, row: NotificationTemplate) => (
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">Used:</span> {row.usageCount} times
          </div>
          {row.lastUsed && (
            <div>
              <span className="font-medium">Last:</span> {new Date(row.lastUsed).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: NotificationTemplate) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleSendTest(row.id)}
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedTemplate(row)
              setShowTemplateEditor(true)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleToggleTemplate(row.id, !row.isActive)}
          >
            {row.isActive ? 'Disable' : 'Enable'}
          </Button>
        </div>
      )
    }
  ]

  const historyColumns: TableColumn[] = [
    {
      key: 'recipient',
      title: 'Recipient',
      render: (value: string, row: NotificationHistory) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {row.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
            {row.type === 'sms' && <MessageSquare className="w-5 h-5 text-blue-600" />}
            {row.type === 'push' && <Bell className="w-5 h-5 text-blue-600" />}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.recipient}</div>
            {row.subject && (
              <div className="text-sm text-gray-500">{row.subject}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'template',
      title: 'Template',
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string, row: NotificationHistory) => (
        <div className="flex items-center space-x-2">
          {row.status === 'sent' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {row.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
          {row.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
          <Badge className={
            row.status === 'sent' ? 'bg-green-100 text-green-800' :
            row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: 'sentAt',
      title: 'Sent At',
      render: (value: string) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: NotificationHistory) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'failed' && (
            <Button size="sm" variant="outline">
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const tabs = [
    { id: 'templates', name: 'Templates', icon: Mail },
    { id: 'history', name: 'History', icon: Clock },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="page-header mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
                <p className="text-gray-600 mt-1">Manage email templates, SMS, and notification settings</p>
              </div>
              <Button onClick={() => {
                setSelectedTemplate({
                  id: '',
                  name: '',
                  type: 'email',
                  category: '',
                  subject: '',
                  content: '',
                  variables: [],
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  usageCount: 0
                })
                setShowTemplateEditor(true)
              }}>
                <Mail className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="notification-tabs mb-8">
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

          {/* Tab Content */}
          <div className="notification-content">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                <div className="mb-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search templates..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Showing {filteredTemplates.length} of {templates.length} templates
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="overflow-hidden">
                  <DataTable
                    columns={templateColumns}
                    data={filteredTemplates}
                    pagination={true}
                    pageSize={10}
                    searchable={false}
                  />
                </Card>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="mb-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search history..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Showing {filteredHistory.length} of {history.length} notifications
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="overflow-hidden">
                  <DataTable
                    columns={historyColumns}
                    data={filteredHistory}
                    pagination={true}
                    pageSize={15}
                    searchable={false}
                  />
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900">Notification Channels</h3>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Enable Email Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Enable SMS Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Enable Push Notifications</span>
                    </label>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900">Notification Types</h3>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.paymentReminders}
                        onChange={(e) => setSettings(prev => ({ ...prev, paymentReminders: e.target.checked }))}
                      />
                      <span className="text-sm">Payment Reminders</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.allocationNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, allocationNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Room Allocation Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.announcementNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, announcementNotifications: e.target.checked }))}
                      />
                      <span className="text-sm">Announcement Notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.systemAlerts}
                        onChange={(e) => setSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                      />
                      <span className="text-sm">System Alerts</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Reminder Frequency</h3>
                  <select
                    value={settings.reminderFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminderFrequency: e.target.value as any }))}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="flex justify-end mt-8">
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate.id ? 'Edit Template' : 'New Template'}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowTemplateEditor(false)
                    setSelectedTemplate(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <Input
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={selectedTemplate.type}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedTemplate.category}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="payment">Payment</option>
                    <option value="allocation">Room Allocation</option>
                    <option value="announcement">Announcement</option>
                    <option value="account">Account</option>
                  </select>
                </div>
                
                {selectedTemplate.type === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      value={selectedTemplate.subject || ''}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                      placeholder="Enter email subject"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={selectedTemplate.content}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                    placeholder="Enter template content"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['{studentName}', '{amount}', '{currency}', '{dueDate}', '{hostel}', '{room}', '{semester}', '{academicYear}', '{email}', '{password}'].map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
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
