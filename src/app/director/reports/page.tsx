'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import { Navbar } from '@/components/layout/Navbar'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Download, FileText, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react'

export default function DirectorReports() {
  const [selectedReport, setSelectedReport] = useState('occupancy')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Animate page content
    const tl = gsap.timeline()
    
    tl.fromTo('.page-header',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.report-filters',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.report-cards',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  const reportTypes = [
    {
      id: 'occupancy',
      name: 'Occupancy Report',
      description: 'Room occupancy rates by hostel and semester',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Payment collection and revenue analysis',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'demographics',
      name: 'Student Demographics',
      description: 'Student distribution by program and year',
      icon: PieChart,
      color: 'purple'
    },
    {
      id: 'activities',
      name: 'Porter Activities',
      description: 'Check-in/out statistics and patterns',
      icon: Calendar,
      color: 'orange'
    }
  ]

  const handleGenerateReport = async () => {
    setLoading(true)
    // Simulate report generation
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Generate comprehensive reports for hostel management</p>
            </div>
            <Button onClick={handleGenerateReport} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <div className="report-filters mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {reportTypes.map(report => (
                    <option key={report.id} value={report.id}>
                      {report.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Report Types Grid */}
        <div className="report-cards mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((report, index) => {
              const Icon = report.icon
              return (
                <Card 
                  key={report.id}
                  className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${report.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Report Preview */}
        <div className="report-preview">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Report Preview</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            {/* Placeholder for report content */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {reportTypes.find(r => r.id === selectedReport)?.name}
              </h3>
              <p className="text-gray-600 mb-4">
                Configure the report parameters above and click &quot;Generate Report&quot; to view the data
              </p>
              <div className="flex justify-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Format:</span> PDF, Excel, CSV
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Schedule:</span> Daily, Weekly, Monthly
                </div>
              </div>
            </div>
          </Card>
          </div>
      </div>
    </div>
  </div>
  )
}
