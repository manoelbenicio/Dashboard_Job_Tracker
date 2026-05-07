import { useState, useMemo } from 'react'
import {
  BarChart3, Activity, Sparkles, Briefcase, Users, TrendingUp,
  Download, Calendar, Clock, ArrowUpRight, ArrowDownRight,
  MousePointerClick, FileText, MessageSquare, Search, Settings, Kanban,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, Legend,
} from 'recharts'
import { analytics, type AnalyticsMetrics } from '@/lib/analytics'

/* ─── Colors from Emerald Executive DS ─── */
const C = {
  surface: '#111319',
  containerLow: '#191b22',
  container: '#1e1f26',
  containerHigh: '#282a30',
  containerHighest: '#33343b',
  onSurface: '#e2e2eb',
  onSurfaceVariant: '#bbcabf',
  primary: '#4edea3',
  primaryContainer: '#10b981',
  outlineVariant: '#3c4a42',
  // Chart colors
  chartAuth: '#6366f1',
  chartJobs: '#10b981',
  chartAI: '#a855f7',
  chartResume: '#f59e0b',
  chartKanban: '#3b82f6',
  chartSettings: '#64748b',
}

const PIE_COLORS = [C.chartJobs, C.chartAI, C.chartResume, C.chartKanban, C.chartSettings, C.chartAuth]
const BAR_GRADIENT = 'url(#barGrad)'

/* ─── KPI Card ─── */
function KPICard({ title, value, change, icon: Icon, color, delay }: {
  title: string; value: string; change: number; icon: any; color: string; delay: number
}) {
  const isUp = change >= 0
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: C.container,
        border: `1px solid rgba(255,255,255,0.04)`,
        animation: `fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
      }}
    >
      {/* Glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: C.onSurfaceVariant }}>{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: C.onSurface, fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}>
        {value}
      </div>
      <div className="flex items-center gap-1 mt-1.5">
        {isUp ? <ArrowUpRight size={12} style={{ color: '#4edea3' }} /> : <ArrowDownRight size={12} style={{ color: '#ffb3af' }} />}
        <span className="text-[11px] font-medium" style={{ color: isUp ? '#4edea3' : '#ffb3af' }}>{Math.abs(change)}%</span>
        <span className="text-[11px]" style={{ color: 'rgba(187,202,191,0.3)' }}>vs prev</span>
      </div>
    </div>
  )
}

/* ─── Glass Card Wrapper ─── */
function GlassCard({ title, children, className = '', icon: Icon }: { title: string; children: React.ReactNode; className?: string; icon?: any }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`}
      style={{ background: C.container, border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-5">
        {Icon && <Icon size={14} style={{ color: C.primary }} />}
        <h3 className="text-sm font-semibold tracking-tight" style={{ color: C.onSurface }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: C.containerHighest, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[11px] font-medium mb-1.5" style={{ color: C.onSurfaceVariant }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{p.name}:</span>
          <span className="font-semibold" style={{ color: C.onSurface, fontFamily: 'var(--font-mono)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Event Icon Mapper ─── */
function EventIcon({ category }: { category: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    auth: { icon: Users, color: C.chartAuth },
    jobs: { icon: Briefcase, color: C.chartJobs },
    ai: { icon: Sparkles, color: C.chartAI },
    resume: { icon: FileText, color: C.chartResume },
    kanban: { icon: Kanban, color: C.chartKanban },
    navigation: { icon: MousePointerClick, color: '#94a3b8' },
    settings: { icon: Settings, color: C.chartSettings },
    search: { icon: Search, color: '#818cf8' },
  }
  const { icon: Icon, color } = map[category] || { icon: Activity, color: '#64748b' }
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
      <Icon size={13} style={{ color }} />
    </div>
  )
}

/* ─── Main Page ─── */
export function AnalyticsPage() {
  const [range, setRange] = useState(30)
  const metrics: AnalyticsMetrics = useMemo(() => analytics.getMetrics(range), [range])

  // Format large numbers
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

  // Pie data
  const pieData = useMemo(() => {
    const cats = ['jobs', 'ai', 'resume', 'kanban', 'settings']
    const labels: Record<string, string> = { jobs: 'Jobs', ai: 'AI Features', resume: 'Resume', kanban: 'Kanban', settings: 'Settings' }
    return cats
      .map(c => ({ name: labels[c] || c, value: metrics.eventsByCategory[c] || 0 }))
      .filter(d => d.value > 0)
  }, [metrics])

  // Bar chart data from top actions
  const barData = useMemo(() =>
    metrics.topActions.slice(0, 8).map(a => ({
      name: a.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: a.count,
      category: a.category,
    })),
  [metrics])

  // Daily events for area chart
  const areaData = useMemo(() => metrics.dailyEvents.map(d => ({
    ...d,
    date: d.date.slice(5), // MM-DD format
  })), [metrics])

  // Time ago formatter
  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  // Compute change % (mock: based on first-half vs second-half of period)
  const computeChange = (cat?: string) => {
    const all = analytics.getEvents(cat, range)
    const mid = Date.now() - (range * 86400000 / 2)
    const first = all.filter(e => e.timestamp < mid).length
    const second = all.filter(e => e.timestamp >= mid).length
    if (first === 0) return second > 0 ? 100 : 0
    return Math.round(((second - first) / first) * 100)
  }

  return (
    <div className="space-y-6 pb-8">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <BarChart3 size={18} style={{ color: C.primary }} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: C.onSurfaceVariant }}>SaaS Admin Dashboard</div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: C.onSurface }}>Product Analytics</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl overflow-hidden" style={{ background: C.containerHigh, border: '1px solid rgba(255,255,255,0.04)' }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRange(d)}
                className="px-4 py-2 text-[11px] font-medium transition-all duration-200"
                style={{
                  color: range === d ? C.onSurface : 'rgba(187,202,191,0.4)',
                  background: range === d ? C.containerHighest : 'transparent',
                }}>
                <Calendar size={10} className="inline mr-1.5" style={{ verticalAlign: '-1px' }} />
                {d}d
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' }}
            onClick={() => {
              const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `jobflow-analytics-${range}d.json`; a.click()
              URL.revokeObjectURL(url)
              analytics.track('settings', 'analytics_exported', `${range}d`)
            }}>
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Events" value={fmt(metrics.totalEvents)} change={computeChange()} icon={Activity} color={C.primary} delay={0.05} />
        <KPICard title="AI Requests" value={fmt(metrics.aiRequests)} change={computeChange('ai')} icon={Sparkles} color={C.chartAI} delay={0.1} />
        <KPICard title="Jobs Created" value={fmt(metrics.jobsCreated)} change={computeChange('jobs')} icon={Briefcase} color={C.chartJobs} delay={0.15} />
        <KPICard title="Sessions" value={fmt(metrics.sessionsCount)} change={computeChange('auth')} icon={Users} color={C.chartAuth} delay={0.2} />
        <KPICard title="Feature Adoption" value={`${metrics.featureAdoption}%`} change={3.2} icon={TrendingUp} color="#f59e0b" delay={0.25} />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <GlassCard title="Events Over Time" icon={TrendingUp} className="lg:col-span-2">
          <div style={{ height: 280 }}>
            {areaData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="gAuth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartAuth} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartAuth} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gJobs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartJobs} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartJobs} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gAI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartAI} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartAI} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gResume" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartResume} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartResume} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(187,202,191,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(187,202,191,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, color: 'rgba(187,202,191,0.4)' }} />
                  <Area type="monotone" dataKey="auth" name="Auth" stroke={C.chartAuth} fill="url(#gAuth)" strokeWidth={2} />
                  <Area type="monotone" dataKey="jobs" name="Jobs" stroke={C.chartJobs} fill="url(#gJobs)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ai" name="AI" stroke={C.chartAI} fill="url(#gAI)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resume" name="Resume" stroke={C.chartResume} fill="url(#gResume)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Activity size={32} style={{ color: 'rgba(187,202,191,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(187,202,191,0.3)' }}>No events yet — start using JobFlow to see data!</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pie Chart */}
        <GlassCard title="Feature Usage" icon={MousePointerClick}>
          <div style={{ height: 280 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                    stroke="none" labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10 }}
                    formatter={(v: string) => <span style={{ color: 'rgba(187,202,191,0.5)', fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <MousePointerClick size={32} style={{ color: 'rgba(187,202,191,0.15)' }} />
                <p className="text-sm text-center" style={{ color: 'rgba(187,202,191,0.3)' }}>Feature usage data will appear here</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ─── Breakdowns Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <GlassCard title="Most Used Features" icon={BarChart3}>
          <div style={{ height: 280 }}>
            {barData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={barData} layout="vertical" margin={{ left: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.primaryContainer} /><stop offset="100%" stopColor={C.primary} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(187,202,191,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(187,202,191,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Count" fill={BAR_GRADIENT} radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <BarChart3 size={32} style={{ color: 'rgba(187,202,191,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(187,202,191,0.3)' }}>Feature rankings will appear as you use the app</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Top Actions Table */}
        <GlassCard title="Top Actions" icon={Activity}>
          <div className="space-y-0 overflow-auto" style={{ maxHeight: 280 }}>
            {metrics.topActions.length > 0 ? (
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ color: 'rgba(187,202,191,0.3)' }}>
                    <th className="text-left font-semibold pb-3 uppercase tracking-wider text-[10px]">Action</th>
                    <th className="text-right font-semibold pb-3 uppercase tracking-wider text-[10px]">Count</th>
                    <th className="text-right font-semibold pb-3 uppercase tracking-wider text-[10px]">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topActions.slice(0, 10).map((a, i) => (
                    <tr key={a.action} className="transition-colors duration-200"
                      style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td className="py-2.5 pr-4" style={{ color: C.onSurface }}>
                        {a.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="py-2.5 text-right font-semibold" style={{ color: C.primary, fontFamily: 'var(--font-mono)' }}>
                        {a.count}
                      </td>
                      <td className="py-2.5 text-right" style={{ color: 'rgba(187,202,191,0.35)' }}>
                        {timeAgo(a.lastUsed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Activity size={32} style={{ color: 'rgba(187,202,191,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(187,202,191,0.3)' }}>Action data will populate here</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ─── Activity Stream ─── */}
      <GlassCard title="Recent Activity" icon={Clock}>
        <div className="space-y-1 overflow-auto" style={{ maxHeight: 320 }}>
          {metrics.recentEvents.length > 0 ? metrics.recentEvents.map(e => (
            <div key={e.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.02]">
              <EventIcon category={e.category} />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium" style={{ color: C.onSurface }}>
                  {e.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {e.label && (
                  <span className="text-[11px] ml-2" style={{ color: 'rgba(187,202,191,0.35)' }}>— {e.label}</span>
                )}
              </div>
              <span className="text-[10px] shrink-0 font-medium" style={{ color: 'rgba(187,202,191,0.25)', fontFamily: 'var(--font-mono)' }}>
                {timeAgo(e.timestamp)}
              </span>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <MessageSquare size={32} style={{ color: 'rgba(187,202,191,0.15)' }} />
              <p className="text-sm" style={{ color: 'rgba(187,202,191,0.3)' }}>Your activity will appear here as you use JobFlow</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
