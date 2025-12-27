'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import * as d3 from 'd3'
import Card from '@/components/ui/card'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  Calendar,
  Filter,
  Download,
  Share2,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'
import Button from '@/components/ui/button'

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
  }, [user, period])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

  useEffect(() => {
    if (!analyticsData) return

    // Premium D3 Styling
    const colors = {
      primary: '#4F46E5', // Indigo 600
      secondary: '#0EA5E9', // Sky 500
      success: '#10B981', // Emerald 500
      warning: '#F59E0B', // Amber 500
      danger: '#EF4444', // Red 500
      muted: '#94A3B8', // Slate 400
      grid: '#F1F5F9' // Slate 100
    }

    // D3.js Bar Chart (Monthly Occupancy)
    if (barChartRef.current) {
      const container = barChartRef.current.parentElement
      const width = container?.clientWidth || 400
      const height = 300
      const margin = { top: 20, right: 20, bottom: 40, left: 40 }

      d3.select(barChartRef.current).selectAll('*').remove()

      const svg = d3.select(barChartRef.current)
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)

      const x = d3.scaleBand()
        .domain(analyticsData.monthlyData.map(d => d.month))
        .range([margin.left, width - margin.right])
        .padding(0.3)

      const y = d3.scaleLinear()
        .domain([0, d3.max(analyticsData.monthlyData, d => d.occupancy) || 100])
        .nice()
        .range([height - margin.bottom, margin.top])

      // Grid lines
      svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => '') as any)
        .attr('stroke-opacity', 0.1)

      svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => '') as any)
        .attr('stroke-opacity', 0.1)

      // Bars
      const bars = svg.selectAll('.bar')
        .data(analyticsData.monthlyData)
        .enter().append('g')
        .attr('class', 'bar-group')

      bars.append('rect')
        .attr('x', d => x(d.month) || 0)
        .attr('width', x.bandwidth())
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .attr('fill', 'url(#bar-gradient)')
        .attr('rx', 6)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr('y', d => y(d.occupancy) || height - margin.bottom)
        .attr('height', d => (height - margin.bottom) - (y(d.occupancy) || height - margin.bottom))

      // Gradient definition
      const defs = svg.append('defs')
      const gradient = defs.append('linearGradient')
        .attr('id', 'bar-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.primary)
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.secondary)

      // Axes
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10) as any)
        .call(g => g.select('.domain').remove())
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('color', colors.muted)

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10) as any)
        .call(g => g.select('.domain').remove())
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('color', colors.muted)
    }

    // D3.js Line Chart (Payment Trends)
    if (lineChartRef.current) {
      const container = lineChartRef.current.parentElement
      const width = container?.clientWidth || 400
      const height = 300
      const margin = { top: 20, right: 20, bottom: 40, left: 50 }

      d3.select(lineChartRef.current).selectAll('*').remove()

      const svg = d3.select(lineChartRef.current)
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)

      const x = d3.scalePoint()
        .domain(analyticsData.paymentTrends.map(d => d.month))
        .range([margin.left, width - margin.right])

      const y = d3.scaleLinear()
        .domain([0, d3.max(analyticsData.paymentTrends, d => d.amount) || 1000])
        .nice()
        .range([height - margin.bottom, margin.top])

      const line = d3.line<any>()
        .x(d => x(d.month) || 0)
        .y(d => y(d.amount) || height - margin.bottom)
        .curve(d3.curveMonotoneX)

      const area = d3.area<any>()
        .x(d => x(d.month) || 0)
        .y0(height - margin.bottom)
        .y1(d => y(d.amount) || height - margin.bottom)
        .curve(d3.curveMonotoneX)

      // Area under line
      svg.append('path')
        .datum(analyticsData.paymentTrends)
        .attr('d', area as any)
        .attr('fill', 'url(#line-gradient)')
        .attr('opacity', 0.2)

      // Gradient for area
      const defs = svg.append('defs')
      const gradient = defs.append('linearGradient')
        .attr('id', 'line-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.primary)
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'transparent')

      // Main line
      const path = svg.append('path')
        .datum(analyticsData.paymentTrends)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 3)
        .attr('d', line as any)

      const totalLength = path.node()?.getTotalLength() || 0
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .attr('stroke-dashoffset', 0)

      // Dots
      svg.selectAll('.dot')
        .data(analyticsData.paymentTrends)
        .enter().append('circle')
        .attr('cx', d => x(d.month) || 0)
        .attr('cy', d => y(d.amount) || height - margin.bottom)
        .attr('r', 0)
        .attr('fill', 'white')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 2)
        .transition()
        .duration(500)
        .delay((d, i) => i * 150 + 500)
        .attr('r', 4)

      // Axes
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(15) as any)
        .call(g => g.select('.domain').remove())
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('color', colors.muted)

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10).tickFormat(d => `GH₵${d}`) as any)
        .call(g => g.select('.domain').remove())
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('color', colors.muted)
    }

    // D3.js Donut Chart (Hostel Performance)
    if (pieChartRef.current) {
      const container = pieChartRef.current.parentElement
      const width = container?.clientWidth || 400
      const height = 300
      const radius = Math.min(width, height) / 2 - 20

      d3.select(pieChartRef.current).selectAll('*').remove()

      const svg = d3.select(pieChartRef.current)
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`)

      const pie = d3.pie<any>()
        .value(d => d.occupancy)
        .sort(null)
        .padAngle(0.05)

      const arc = d3.arc<any>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)
        .cornerRadius(8)

      const arcHover = d3.arc<any>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius + 5)
        .cornerRadius(8)

      const color = d3.scaleOrdinal()
        .domain(analyticsData.hostelPerformance.map(d => d.name))
        .range([colors.primary, colors.secondary, colors.success, colors.warning])

      const arcs = svg.selectAll('.arc')
        .data(pie(analyticsData.hostelPerformance))
        .enter().append('g')
        .attr('class', 'arc')

      arcs.append('path')
        .attr('d', arc as any)
        .attr('fill', d => color(d.data.name) as any)
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
          d3.select(this).transition().duration(200).attr('d', arcHover as any).attr('opacity', 1)
        })
        .on('mouseout', function(event, d) {
          d3.select(this).transition().duration(200).attr('d', arc as any).attr('opacity', 0.8)
        })
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
          const i = d3.interpolate({startAngle: 0, endAngle: 0}, d)
          return function(t) { return arc(i(t)) as any }
        })

      // Central Text
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', colors.muted)
        .attr('text-transform', 'uppercase')
        .text('Performance')

      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.8em')
        .attr('font-size', '24px')
        .attr('font-weight', 'black')
        .attr('fill', colors.primary)
        .text(`${analyticsData.overview.occupancyRate}%`)
    }
  }, [analyticsData, isLoading])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
           <p className="text-xs font-black text-slate-400 mt-4 uppercase tracking-[0.2em]">Assembling Intelligence...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'director') return null

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      {/* Executive Overview Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-indigo-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Global Overview</div>
             <ModernBadge variant="success">Online</ModernBadge>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mt-2">Executive <span className="text-indigo-600">Analytics</span></h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Enterprise Hostel Intelligence v2.0</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
              {['week', 'month', 'quarter', 'year'].map((p) => (
                 <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                       period === p ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600'
                    }`}
                 >
                    {p}
                 </button>
              ))}
           </div>
           <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-5 text-slate-600 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" /> Export
           </Button>
           <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-600/20">
              <Share2 className="w-4 h-4 mr-2" /> Share
           </Button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Key Metric Intelligence Cards */}
          <div className="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
             <AnimatedStatCard icon={Users} label="Total Students" value={analyticsData.overview.totalStudents} iconColor="blue" subText="Active headcount" />
             <AnimatedStatCard icon={Building2} label="Unit Capacity" value={analyticsData.overview.totalRooms} iconColor="purple" subText="Total room assets" />
             <AnimatedStatCard icon={TrendingUp} label="Occupancy" value={`${analyticsData.overview.occupancyRate}%`} iconColor="emerald" subText="Space utilization" />
             <AnimatedStatCard icon={CreditCard} label="Revenue GHS" value={analyticsData.overview.totalRevenue.toLocaleString()} iconColor="purple" subText="Gross generated" />
             <AnimatedStatCard icon={Activity} label="System Growth" value={`${analyticsData.overview.growthRate}%`} iconColor="amber" subText="YoY Comparison" />
             <AnimatedStatCard icon={Calendar} label="Bookings" value={analyticsData.overview.totalBookings} iconColor="rose" subText="Pending/Confirmed" />
          </div>

          {/* Intelligence Visualizations */}
          <div className="charts-grid grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Occupancy Analytics */}
            <Card className="col-span-1 xl:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-8">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Utilization Flow</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Monthly Student Density</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3" /> +12.5%
                     </span>
                     <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
               </div>
               <div className="h-[300px] w-full">
                  <svg ref={barChartRef} className="overflow-visible"></svg>
               </div>
            </Card>

            {/* Performance Composition */}
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Asset Distribution</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Hostel Performance Mix</p>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Filter className="w-4 h-4" /></button>
               </div>
               <div className="h-[300px] flex items-center justify-center">
                  <svg ref={pieChartRef}></svg>
               </div>
               
               <div className="mt-6 space-y-3">
                  {analyticsData.hostelPerformance.map((hostel, i) => (
                    <div key={hostel.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:border-indigo-100 transition-all">
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: [ '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B' ][i % 4] }} />
                          <span className="text-xs font-black text-slate-700">{hostel.name}</span>
                       </div>
                       <span className="text-xs font-black text-indigo-600">{hostel.occupancy}%</span>
                    </div>
                  ))}
               </div>
            </Card>

            {/* Revenue Trends */}
            <Card className="col-span-1 xl:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-8">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Liquidity Trends</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Payment Collection Velocity</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">
                        <Activity className="w-3 h-3" /> High Volatility
                     </span>
                  </div>
               </div>
               <div className="h-[300px] w-full">
                  <svg ref={lineChartRef} className="overflow-visible"></svg>
               </div>
            </Card>

            {/* Data Feed / Recent Logs */}
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TrendingUp className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                  <h3 className="text-xl font-black leading-none mb-6">Real-time Pulse</h3>
                  
                  <div className="space-y-4">
                     {analyticsData.monthlyData.slice(-4).reverse().map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-[10px] text-indigo-200 uppercase group-hover:scale-110 transition-transform">
                                 {item.month.substring(0, 3)}
                              </div>
                              <div>
                                 <div className="text-xs font-black">{item.students} New Students</div>
                                 <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">Registration Event</div>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                        </div>
                     ))}
                  </div>

                  <Button className="w-full mt-8 bg-white text-indigo-900 border-none rounded-2xl h-12 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 shadow-xl shadow-indigo-950/40">
                     Access Full Intelligence
                  </Button>
               </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
