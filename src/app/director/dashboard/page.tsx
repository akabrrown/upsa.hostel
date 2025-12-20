'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import * as d3 from 'd3'

interface AnalyticsData {
  overview: {
    totalStudents: number
    totalRooms: number
    totalBookings: number
    totalRevenue: number
    occupancyRate: number
    growthRate: number
  }
  monthlyData: Array<{
    month: string
    students: number
    occupancy: number
    revenue: number
  }>
  hostelPerformance: Array<{
    name: string
    occupancy: number
    revenue: number
    maintenance: number
  }>
  paymentTrends: Array<{
    month: string
    amount: number
    count: number
  }>
}

export default function DirectorDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  
  const barChartRef = useRef<SVGSVGElement>(null)
  const lineChartRef = useRef<SVGSVGElement>(null)
  const pieChartRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'director')) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/director/analytics?period=${period}`)
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && user.role === 'director') {
      fetchAnalytics()
    }
  }, [user, period, router])

  useEffect(() => {
    if (!analyticsData) return

    // D3.js Bar Chart
    if (barChartRef.current) {
      const width = 400
      const height = 300
      const margin = { top: 20, right: 30, bottom: 40, left: 50 }

      d3.select(barChartRef.current).selectAll('*').remove()

      const svg = d3.select(barChartRef.current)
        .attr('width', width)
        .attr('height', height)

      const x = d3.scaleBand()
        .domain(analyticsData.monthlyData.map(d => d.month))
        .range([margin.left, width - margin.right])
        .padding(0.1)

      const y = d3.scaleLinear()
        .domain([0, d3.max(analyticsData.monthlyData, d => d.occupancy) || 0])
        .range([height - margin.bottom, margin.top])

      // Bars
      svg.selectAll('.bar')
        .data(analyticsData.monthlyData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.month) || 0)
        .attr('width', x.bandwidth())
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .attr('fill', '#FFD700')
        .transition()
        .duration(800)
        .attr('y', d => y(d.occupancy) || height - margin.bottom)
        .attr('height', d => (height - margin.bottom) - (y(d.occupancy) || height - margin.bottom))

      // X axis
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x) as any)

      // Y axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y) as any)
    }

    // D3.js Line Chart
    if (lineChartRef.current) {
      const width = 400
      const height = 300
      const margin = { top: 20, right: 30, bottom: 40, left: 50 }

      d3.select(lineChartRef.current).selectAll('*').remove()

      const svg = d3.select(lineChartRef.current)
        .attr('width', width)
        .attr('height', height)

      const x = d3.scaleBand()
        .domain(analyticsData.paymentTrends.map(d => d.month))
        .range([margin.left, width - margin.right])
        .padding(0.1)

      const y = d3.scaleLinear()
        .domain([0, d3.max(analyticsData.paymentTrends, d => d.amount) || 0])
        .range([height - margin.bottom, margin.top])

      // Line
      const line = d3.line<any>()
        .x(d => x(d.month) || 0)
        .y(d => y(d.amount) || height - margin.bottom)
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(analyticsData.paymentTrends)
        .attr('class', 'line')
        .attr('d', line as any)
        .attr('fill', 'none')
        .attr('stroke', '#001f3f')
        .attr('stroke-width', 2)

      // Dots
      svg.selectAll('.dot')
        .data(analyticsData.paymentTrends)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.month) || 0)
        .attr('cy', height - margin.bottom)
        .attr('r', 0)
        .attr('fill', '#FFD700')
        .transition()
        .duration(800)
        .attr('cy', d => y(d.amount) || height - margin.bottom)
        .attr('r', 4)

      // X axis
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x) as any)

      // Y axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y) as any)
    }

    // D3.js Pie Chart
    if (pieChartRef.current) {
      const width = 400
      const height = 300
      const radius = Math.min(width, height) / 2 - 20

      d3.select(pieChartRef.current).selectAll('*').remove()

      const svg = d3.select(pieChartRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`)

      const pie = d3.pie<any>()
        .value(d => d.occupancy)
        .sort((a, b) => d3.descending(a.value, b.value))

      const arc = d3.arc<any>()
        .innerRadius(0)
        .outerRadius(radius)

      const color = d3.scaleOrdinal()
        .domain(analyticsData.hostelPerformance.map(d => d.name))
        .range(['#FFD700', '#001f3f', '#4CAF50', '#FF5722'])

      const arcs = svg.selectAll('.arc')
        .data(pie(analyticsData.hostelPerformance))
        .enter().append('g')
        .attr('class', 'arc')

      arcs.append('path')
        .attr('d', arc as any)
        .attr('fill', d => color(d.data.name) as any)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)

      arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d as any)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(d => d.data.name)
    }
  }, [analyticsData])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'director') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {analyticsData && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-blue-600">{analyticsData.overview.totalStudents}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Rooms</h3>
                <p className="text-3xl font-bold text-green-600">{analyticsData.overview.totalRooms}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Occupancy Rate</h3>
                <p className="text-3xl font-bold text-yellow-600">{analyticsData.overview.occupancyRate}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">GHS {analyticsData.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Growth Rate</h3>
                <p className="text-3xl font-bold text-indigo-600">{analyticsData.overview.growthRate}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Bookings</h3>
                <p className="text-3xl font-bold text-red-600">{analyticsData.overview.totalBookings}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Occupancy</h3>
                <svg ref={barChartRef}></svg>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Trends</h3>
                <svg ref={lineChartRef}></svg>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Hostel Performance</h3>
                <svg ref={pieChartRef}></svg>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {analyticsData.monthlyData.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border-b">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <span className="text-sm font-semibold">{item.students} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
