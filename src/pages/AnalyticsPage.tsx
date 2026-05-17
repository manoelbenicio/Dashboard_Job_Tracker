import { useState, useMemo, useEffect } from 'react'
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

/* ─── Indra Canonical Colors ─── */
const C = {
  deep: '#002B3A', dark: '#003E50', cyan: '#00B0BD',
  light: '#7A9CAE', blueGray: '#B3C1DA', white: '#FFFFFF',
  success: '#27AE60', warning: '#FF9800', error: '#E91E63',
  chartAuth: '#3F96AE', chartJobs: '#00B0BD', chartAI: '#a855f7',
  chartResume: '#FF9800', chartKanban: '#3B82F6', chartSettings: '#7A9CAE',
}
const PIE_COLORS = [C.chartJobs, C.chartAI, C.chartResume, C.chartKanban, C.chartSettings, C.chartAuth]

/* ─── KPI Card ─── */
function KPICard({ title, value, change, icon: Icon, color }: {
  title: string; value: string; change: number; icon: any; color: string
}) {
  const isUp = change >= 0
  return (
    <div className="indra-kpi-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span className="indra-kpi-label">{title}</span>
        <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="indra-kpi-value">{value}</div>
      <div className={`indra-kpi-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(change)}% vs prev
      </div>
    </div>
  )
}

/* ─── Chart Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div style={{ background: C.dark, border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '8px 12px' }}>
      <p style={{ fontSize: '11px', color: C.light, marginBottom: '6px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: C.white, fontFamily: "'JetBrains Mono', monospace" }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Event Icon ─── */
function EventIcon({ category }: { category: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    auth: { icon: Users, color: C.chartAuth }, jobs: { icon: Briefcase, color: C.chartJobs },
    ai: { icon: Sparkles, color: C.chartAI }, resume: { icon: FileText, color: C.chartResume },
    kanban: { icon: Kanban, color: C.chartKanban }, navigation: { icon: MousePointerClick, color: '#94a3b8' },
    settings: { icon: Settings, color: C.chartSettings }, search: { icon: Search, color: '#818cf8' },
  }
  const { icon: Icon, color } = map[category] || { icon: Activity, color: '#64748b' }
  return (
    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, flexShrink: 0 }}>
      <Icon size={13} style={{ color }} />
    </div>
  )
}

/* ─── Main Page ─── */
export function AnalyticsPage() {
  const [range, setRange] = useState(30)
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  
  useEffect(() => {
    let mounted = true
    analytics.getMetrics(range).then(m => {
      if (mounted) setMetrics(m)
    })
    return () => { mounted = false }
  }, [range])

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

  const pieData = useMemo(() => {
    if (!metrics) return []
    const cats = ['jobs', 'ai', 'resume', 'kanban', 'settings']
    const labels: Record<string, string> = { jobs: 'Jobs', ai: 'AI Features', resume: 'Resume', kanban: 'Kanban', settings: 'Settings' }
    return cats.map(c => ({ name: labels[c] || c, value: metrics.eventsByCategory[c] || 0 })).filter(d => d.value > 0)
  }, [metrics])

  const barData = useMemo(() => {
    if (!metrics) return []
    return metrics.topActions.slice(0, 8).map(a => ({
      name: a.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: a.count, category: a.category,
    }))
  }, [metrics])

  const areaData = useMemo(() => {
    if (!metrics) return []
    return metrics.dailyEvents.map(d => ({ ...d, date: d.date.slice(5) }))
  }, [metrics])

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const [historicalEvents, setHistoricalEvents] = useState<any[]>([])
  useEffect(() => {
    analytics.getEvents(undefined, range).then(setHistoricalEvents)
  }, [range])

  const computeChange = (cat?: string) => {
    const all = cat ? historicalEvents.filter(e => e.category === cat) : historicalEvents
    const mid = Date.now() - (range * 86400000 / 2)
    const first = all.filter(e => e.timestamp < mid).length
    const second = all.filter(e => e.timestamp >= mid).length
    if (first === 0) return second > 0 ? 100 : 0
    return Math.round(((second - first) / first) * 100)
  }

  if (!metrics) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>Loading metrics...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="indra-section-header" style={{ marginBottom: 0 }}>
          <p className="indra-section-eyebrow">Intelligence</p>
          <h2 className="indra-section-title">Product Analytics</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRange(d)} style={{
                padding: '6px 16px', fontSize: '11px', fontWeight: 500, border: 'none', cursor: 'pointer',
                color: range === d ? C.white : C.light,
                background: range === d ? 'rgba(0,176,189,0.12)' : 'transparent',
                fontFamily: "'Inter', sans-serif",
              }}>
                <Calendar size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />{d}d
              </button>
            ))}
          </div>
          <button className="indra-btn-cyan" style={{ padding: '6px 16px', fontSize: '11px', minHeight: 'auto' }}
            onClick={() => {
              const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `jobflow-analytics-${range}d.json`; a.click()
              URL.revokeObjectURL(url)
              analytics.track('settings', 'analytics_exported', `${range}d`)
            }}>
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="indra-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KPICard title="Total Events" value={fmt(metrics.totalEvents)} change={computeChange()} icon={Activity} color={C.cyan} />
        <KPICard title="AI Requests" value={fmt(metrics.aiRequests)} change={computeChange('ai')} icon={Sparkles} color={C.chartAI} />
        <KPICard title="Jobs Created" value={fmt(metrics.jobsCreated)} change={computeChange('jobs')} icon={Briefcase} color={C.chartJobs} />
        <KPICard title="Sessions" value={fmt(metrics.sessionsCount)} change={computeChange('auth')} icon={Users} color={C.chartAuth} />
        <KPICard title="Feature Adoption" value={`${metrics.featureAdoption}%`} change={3.2} icon={TrendingUp} color={C.warning} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Area Chart */}
        <div className="indra-panel">
          <div className="indra-panel-header">
            <div className="indra-panel-title">Events Over Time</div>
          </div>
          <div style={{ height: 280 }}>
            {areaData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="gAuth2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartAuth} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartAuth} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gJobs2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartJobs} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartJobs} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gAI2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartAI} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartAI} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gResume2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.chartResume} stopOpacity={0.3} /><stop offset="100%" stopColor={C.chartResume} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: C.light, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.light, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="auth" name="Auth" stroke={C.chartAuth} fill="url(#gAuth2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="jobs" name="Jobs" stroke={C.chartJobs} fill="url(#gJobs2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ai" name="AI" stroke={C.chartAI} fill="url(#gAI2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resume" name="Resume" stroke={C.chartResume} fill="url(#gResume2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                <Activity size={32} style={{ color: 'rgba(122,156,174,0.2)' }} />
                <p style={{ fontSize: '14px', color: C.light }}>No events yet — start using JobFlow!</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="indra-panel">
          <div className="indra-panel-header"><div className="indra-panel-title">Feature Usage</div></div>
          <div style={{ height: 280 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10 }}
                    formatter={(v: string) => <span style={{ color: C.blueGray, fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                <MousePointerClick size={32} style={{ color: 'rgba(122,156,174,0.2)' }} />
                <p style={{ fontSize: '14px', color: C.light, textAlign: 'center' }}>Feature usage data will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdowns Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Bar Chart */}
        <div className="indra-panel">
          <div className="indra-panel-header"><div className="indra-panel-title">Most Used Features</div></div>
          <div style={{ height: 280 }}>
            {barData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={barData} layout="vertical" margin={{ left: 0 }}>
                  <defs>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.dark} /><stop offset="100%" stopColor={C.cyan} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: C.light, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.blueGray, fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Count" fill="url(#barGrad2)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                <BarChart3 size={32} style={{ color: 'rgba(122,156,174,0.2)' }} />
                <p style={{ fontSize: '14px', color: C.light }}>Feature rankings will appear as you use the app</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Actions Table */}
        <div className="indra-panel">
          <div className="indra-panel-header"><div className="indra-panel-title">Top Actions</div></div>
          <div style={{ maxHeight: 280, overflow: 'auto' }}>
            {metrics.topActions.length > 0 ? (
              <table className="indra-table">
                <thead>
                  <tr><th>Action</th><th style={{ textAlign: 'right' }}>Count</th><th style={{ textAlign: 'right' }}>Last Used</th></tr>
                </thead>
                <tbody>
                  {metrics.topActions.slice(0, 10).map(a => (
                    <tr key={a.action}>
                      <td><strong>{a.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></td>
                      <td style={{ textAlign: 'right', color: C.cyan, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{a.count}</td>
                      <td style={{ textAlign: 'right' }}>{timeAgo(a.lastUsed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px' }}>
                <Activity size={32} style={{ color: 'rgba(122,156,174,0.2)' }} />
                <p style={{ fontSize: '14px', color: C.light }}>Action data will populate here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="indra-panel">
        <div className="indra-panel-header"><div className="indra-panel-title">Recent Activity</div></div>
        <div style={{ maxHeight: 320, overflow: 'auto' }}>
          {metrics.recentEvents.length > 0 ? metrics.recentEvents.map(e => (
            <div key={e.id} className="indra-activity-item" style={{ cursor: 'default' }}>
              <EventIcon category={e.category} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: C.white }}>
                  {e.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {e.label && <span style={{ fontSize: '11px', marginLeft: '8px', color: C.light }}>— {e.label}</span>}
              </div>
              <span style={{ fontSize: '10px', flexShrink: 0, fontWeight: 500, color: C.light, fontFamily: "'JetBrains Mono', monospace" }}>
                {timeAgo(e.timestamp)}
              </span>
            </div>
          )) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '12px' }}>
              <MessageSquare size={32} style={{ color: 'rgba(122,156,174,0.2)' }} />
              <p style={{ fontSize: '14px', color: C.light }}>Your activity will appear here as you use JobFlow</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
