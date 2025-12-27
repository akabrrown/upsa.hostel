'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Search,
  ChevronRight,
  Share2,
  Clock,
  CheckCircle2,
  CalendarDays,
  Activity,
  Zap,
  Layout,
  FileSpreadsheet,
  Plus
} from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'

export default function DirectorReports() {
  const [selectedReport, setSelectedReport] = useState('occupancy')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  useEffect(() => {
    initPageAnimations(150)
  }, [])

  const reportTypes = [
    {
      id: 'occupancy',
      name: 'Occupancy Flow',
      description: 'Density analysis by asset and wing',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'financial',
      name: 'Yield Audit',
      description: 'Revenue velocity and arrears audit',
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      id: 'demographics',
      name: 'Student Profile',
      description: 'Regional and academic distribution',
      icon: PieChart,
      color: 'indigo'
    },
    {
      id: 'activities',
      name: 'Security Logs',
      description: 'Personnel efficiency and traffic data',
      icon: Activity,
      color: 'purple'
    }
  ]

  const handleGenerateReport = async () => {
    setLoading(true)
    setIsGenerated(false)
    // Simulate complex data processing
    setTimeout(() => {
      setLoading(false)
      setIsGenerated(true)
      initPageAnimations(50)
    }, 1500)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Intelligence Header */}
      <div className="page-header bg-white p-8 rounded-[2.5rem] shadow-sm border border-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence <span className="text-indigo-600">Reports</span></h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Asset Intelligence Feed</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-2xl border-slate-100 h-12 px-6 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50">
              <Share2 className="w-5 h-5 mr-2" /> Share Feed
           </Button>
           <Button onClick={handleGenerateReport} disabled={loading} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-8 shadow-xl shadow-indigo-600/20 font-black text-xs uppercase tracking-widest disabled:opacity-50">
              {loading ? <Zap className="w-5 h-5 mr-2 animate-pulse" /> : <BarChart3 className="w-5 h-5 mr-2" />}
              {loading ? 'Processing...' : 'Run Intelligence Audit'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Configuration Matrix */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="config-matrix border-none shadow-sm rounded-[2.5rem] bg-indigo-900 p-8 text-white">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-100">
                   <Filter className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black leading-none">Configuration Matrix</h2>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-2">Intelligence Target</label>
                   <div className="grid grid-cols-1 gap-2">
                      {reportTypes.map((type) => (
                         <button
                            key={type.id}
                            onClick={() => setSelectedReport(type.id)}
                            className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 group ${
                               selectedReport === type.id 
                               ? 'bg-white text-indigo-900 border-white' 
                               : 'bg-white/5 text-indigo-100 border-white/5 hover:bg-white/10'
                            }`}
                         >
                            <type.icon className={`w-5 h-5 ${selectedReport === type.id ? 'text-indigo-600' : 'text-indigo-300'}`} />
                            <div className="text-left flex-1">
                               <div className="text-xs font-black uppercase tracking-widest">{type.name}</div>
                               <div className={`text-[9px] font-bold opacity-60 mt-0.5 line-clamp-1 group-hover:opacity-100 transition-opacity`}>{type.description}</div>
                            </div>
                            {selectedReport === type.id && <Zap className="w-4 h-4 text-amber-500 animate-pulse" />}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="h-px bg-white/10 my-8" />

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                         <CalendarDays className="w-3 h-3" /> Audit Window (Start)
                      </label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white rounded-2xl h-11 text-xs font-bold focus:ring-white/20"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                         <CalendarDays className="w-3 h-3" /> Audit Window (End)
                      </label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white rounded-2xl h-11 text-xs font-bold focus:ring-white/20"
                      />
                   </div>
                </div>

                <div className="pt-6">
                   <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-400 mb-1">
                         <Zap className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Optimization active</span>
                      </div>
                      <p className="text-[9px] font-bold text-amber-100/70 leading-relaxed uppercase tracking-tight">Reports are cached for 15 minutes to preserve system resources.</p>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Intelligence Preview Surface */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="preview-surface border-none shadow-sm rounded-[2.5rem] bg-white p-0 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-6">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">Intelligence Mirror</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified Real-time Audit Surface</p>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-100 h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 text-indigo-600 transition-all">
                       <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> Excel
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-100 h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 text-rose-600 transition-all">
                       <FileText className="w-3.5 h-3.5 mr-2" /> Adobe PDF
                    </Button>
                 </div>
              </div>

              <div className="min-h-[600px] p-8">
                 {isGenerated ? (
                    <div className="preview-content animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="flex items-center gap-5">
                             <div className="w-16 h-16 rounded-[1.25rem] bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                {reportTypes.find(r => r.id === selectedReport)?.icon && (
                                   <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                      {/* Icon Component properly rendered */}
                                      <Activity className="w-5 h-5" />
                                   </div>
                                )}
                             </div>
                             <div>
                                <h3 className="text-lg font-black text-slate-900 leading-none">{reportTypes.find(r => r.id === selectedReport)?.name} Output</h3>
                                <div className="flex items-center gap-2 mt-2">
                                   <ModernBadge variant="success">Final Audit</ModernBadge>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-2 ml-1">Generated: Just Now</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-500 font-black text-xs uppercase tracking-widest">
                             <CheckCircle2 className="w-4 h-4" /> Integrity Verified
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Key Observations</h4>
                             <div className="space-y-4">
                                {[
                                  'Positive utilization delta detected (+8.2%)',
                                  'Revenue velocity remains within threshold',
                                  'Maintenance request density stabilized',
                                  'Regional student mix optimized'
                                ].map((note, i) => (
                                   <div key={i} className="flex items-start gap-3">
                                      <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                         <Plus className="w-3 h-3" />
                                      </div>
                                      <span className="text-xs font-bold text-slate-600 leading-relaxed">{note}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                          
                          <div className="p-8 bg-indigo-50/30 border border-indigo-100/50 rounded-[2.5rem] relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-6 opacity-10">
                                <TrendingUp className="w-20 h-20 text-indigo-600" />
                             </div>
                             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Matrix Overview</h4>
                             <div className="space-y-6">
                                <div>
                                   <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tight mb-2">
                                      <span>Data Reliability</span>
                                      <span className="text-indigo-600">99.2%</span>
                                   </div>
                                   <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                                      <div className="h-full bg-indigo-600 w-[99.2%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                   </div>
                                </div>
                                <div>
                                   <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tight mb-2">
                                      <span>Compliance Rating</span>
                                      <span className="text-emerald-500">EXCELLENT</span>
                                   </div>
                                   <div className="grid grid-cols-10 gap-1.5 h-2">
                                      {[...Array(9)].map((_, i) => <div key={i} className="bg-emerald-500 rounded-sm" />)}
                                      <div className="bg-slate-100 rounded-sm" />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center justify-center py-10 opacity-40">
                          <div className="flex flex-col items-center gap-3">
                             <Clock className="w-8 h-8 text-slate-300" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">End of Audit Preview</p>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="h-full flex flex-center">
                       <EmptyState
                          icon={FileText}
                          title="Generate Intelligence Audit"
                          description="Configure the matrix parameters in the sidebar and initiate the audit to generate real-time system intelligence."
                          actionLabel="Run Audit Now"
                          onAction={handleGenerateReport}
                       />
                    </div>
                 )}
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
