'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import Badge from '@/components/ui/badge'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { Director } from '@/types'
import styles from './DirectorDashboard.module.css'

interface DirectorDashboardProps {
  director: Director
}

const DirectorDashboard = ({ director }: DirectorDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports' | 'strategic'>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const dispatch = useDispatch()
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications) as any

  useEffect(() => {
    dispatch(fetchNotifications() as any)
  }, [dispatch])

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-navy-primary">{director?.totalStudents || 0}</p>
              <p className="text-xs text-green-600 mt-1">↑ {director?.studentGrowthRate || 0}% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-green-600">{director?.occupancyRate || 0}%</p>
              <p className="text-xs text-green-600 mt-1">↑ 3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-goldenYellow">GHS {director?.monthlyRevenue || 0}K</p>
              <p className="text-xs text-green-600 mt-1">↑ {director?.revenueGrowthRate || 0}% from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Staff Efficiency</p>
              <p className="text-2xl font-bold text-purple-600">{director?.staffEfficiency || 0}%</p>
              <p className="text-xs text-red-600 mt-1">↓ {director?.staffEfficiencyChange || 0}% from last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Revenue chart visualization</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy by Hostel</h3>
          <div className="space-y-3">
            {director?.hostelOccupancy?.map((hostel: { name: string; occupancyRate: number }, index: number) => (
              <div key={hostel.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{hostel.name}</span>
                  <span>{hostel.occupancyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-goldenYellow h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${hostel.occupancyRate}%` }}
                  />
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No occupancy data available</p>}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
        <Select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          options={[
            { value: "month", label: "Last Month" },
            { value: "quarter", label: "Last Quarter" },
            { value: "year", label: "Last Year" }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Student Demographics</h4>
          <div className="space-y-3">
            {director?.studentDemographics?.map((demographic: { year: string; count: number }, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{demographic.year}</span>
                <span className="text-sm font-medium">{demographic.count} students</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No demographic data available</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Program Distribution</h4>
          <div className="space-y-3">
            {director?.programDistribution?.map((program: { name: string; count: number }, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">{program.name}</span>
                <span className="text-sm font-medium">{program.count} students</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No program data available</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Payment Statistics</h4>
          <div className="space-y-3">
            {director?.paymentStats && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">On-time Payments</span>
                  <span className="text-sm font-medium text-green-600">{director.paymentStats.onTime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Late Payments</span>
                  <span className="text-sm font-medium text-yellow-600">{director.paymentStats.late}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Default Rate</span>
                  <span className="text-sm font-medium text-red-600">{director.paymentStats.default}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Collection Time</span>
                  <span className="text-sm font-medium">{director.paymentStats.avgCollectionTime} days</span>
                </div>
              </>
            ) || <p className="text-gray-500 text-sm">No payment statistics available</p>}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-navy-primary">{director?.performanceMetrics?.studentSatisfaction || 0}</p>
            <p className="text-sm text-gray-600">Student Satisfaction</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{director?.performanceMetrics?.staffProductivity || 0}%</p>
            <p className="text-sm text-gray-600">Staff Productivity</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{director?.performanceMetrics?.avgCheckInTime || 0}h</p>
            <p className="text-sm text-gray-600">Avg. Check-in Time</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{director?.performanceMetrics?.systemUptime || 0}%</p>
            <p className="text-sm text-gray-600">System Uptime</p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Management Reports</h3>
        <Button>Generate New Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {director?.reports?.map((report: { title: string; date: string; type: string }, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{report.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{report.date}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {report.type}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">View</Button>
              <Button variant="outline" size="sm" className="flex-1">Download</Button>
            </div>
          </Card>
        )) || <p className="text-gray-500 text-sm">No reports available</p>}
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Scheduled Reports</h4>
        <div className="space-y-3">
          {director?.scheduledReports?.map((report: { name: string; frequency: string; nextRun: string }, index: number) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-sm">{report.name}</p>
                <p className="text-xs text-gray-500">Frequency: {report.frequency}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next run: {report.nextRun}</p>
                <Button variant="outline" size="sm" className="mt-1">Configure</Button>
              </div>
            </div>
          )) || <p className="text-gray-500 text-sm">No scheduled reports available</p>}
        </div>
      </Card>
    </div>
  )

  const renderStrategic = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Initiatives</h3>
        <div className="space-y-4">
          {director?.strategicInitiatives?.map((initiative: { title: string; status: string; progress: number; deadline: string; priority: string }, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{initiative.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Deadline: {initiative.deadline}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={
                    initiative.priority === 'High' ? 'bg-red-100 text-red-800' :
                    initiative.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {initiative.priority}
                  </Badge>
                  <Badge className={
                    initiative.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    initiative.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                    initiative.status === 'Not Started' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {initiative.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{initiative.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-goldenYellow h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${initiative.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )) || <p className="text-gray-500 text-sm">No strategic initiatives available</p>}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {director?.riskAssessment?.map((risk: { risk: string; level: string; impact: string }, index: number) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{risk.risk}</p>
                  <p className="text-xs text-gray-600">Impact: {risk.impact}</p>
                </div>
                <Badge className={
                  risk.level === 'High' ? 'bg-red-100 text-red-800' :
                  risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {risk.level}
                </Badge>
              </div>
            </div>
          )) || <p className="text-gray-500 text-sm">No risk assessment data available</p>}
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Director Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Strategic oversight and management analytics.</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'reports', label: 'Reports' },
              { id: 'strategic', label: 'Strategic' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-goldenYellow text-goldenYellow'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'strategic' && renderStrategic()}
      </div>
    </div>
  )
}

export default DirectorDashboard
