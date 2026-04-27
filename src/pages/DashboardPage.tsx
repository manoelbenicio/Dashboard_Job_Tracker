import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Briefcase, Users, Gift, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useJobs } from '@/context/JobContext'
import { JOB_STATUSES } from '@/types'

export function DashboardPage() {
  const { state } = useJobs()
  const { jobs } = state

  /* ─── KPI Calculations ────────────────────────────── */
  const kpis = useMemo(() => {
    const total = jobs.length
    const interviews = jobs.filter(j => j.status === 'interview').length
    const offers = jobs.filter(j => j.status === 'offer' || j.status === 'accepted').length
    const rate = total > 0 ? ((offers / total) * 100).toFixed(1) : '0.0'
    return [
      { label: 'Total Applied', value: total, trend: '+12%', up: true, icon: Briefcase },
      { label: 'Interviews', value: interviews, trend: '+8%', up: true, icon: Users },
      { label: 'Offers', value: offers, trend: offers > 0 ? '+4%' : '0%', up: offers > 0, icon: Gift },
      { label: 'Acceptance Rate', value: rate, suffix: '%', trend: '+4%', up: true, icon: Target },
    ]
  }, [jobs])

  /* ─── 30-Day Application Trend ────────────────────── */
  const trendData = useMemo(() => {
    const days: { date: string; count: number }[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const count = jobs.filter(j => {
        const applied = new Date(j.appliedDate)
        return applied.toDateString() === d.toDateString()
      }).length
      days.push({ date: dateStr, count })
    }
    return days
  }, [jobs])

  /* ─── Status Distribution ─────────────────────────── */
  const pieData = useMemo(() => {
    return JOB_STATUSES.map(s => ({
      name: s.label,
      value: jobs.filter(j => j.status === s.value).length,
      color: s.color,
    })).filter(d => d.value > 0)
  }, [jobs])

  /* ─── Recent Activity ─────────────────────────────── */
  const recentActivity = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5)
  }, [jobs])

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)
    if (diffH < 1) return 'Just now'
    if (diffH < 24) return `${diffH}h ago`
    if (diffD === 1) return 'Yesterday'
    return `${diffD}d ago`
  }

  const statusColor = (status: string) => {
    const found = JOB_STATUSES.find(s => s.value === status)
    return found?.color || '#86948a'
  }

  /* ─── Custom Tooltip ──────────────────────────────── */
  const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: 'var(--color-surface-container)',
        border: '1px solid var(--glass-stroke)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'var(--color-on-surface)',
      }}>
        <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-data)', fontWeight: 600 }}>{payload[0].value} applications</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-fade-in-up delay-1">
        <h1 className="text-headline" style={{ color: 'var(--color-on-surface)' }}>
          Executive Overview
        </h1>
        <p className="text-body mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Welcome back. Your application funnel is trending upward this week.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className={`glass-card-elevated animate-fade-in-up delay-${index + 2}`}
              style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--glass-stroke)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-label-md">{kpi.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium" style={{ color: kpi.up ? 'var(--color-primary)' : 'var(--color-tertiary)' }}>
                    {kpi.trend}
                  </span>
                  {kpi.up ? <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} /> : <TrendingDown size={14} style={{ color: 'var(--color-tertiary)' }} />}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-display">
                  {kpi.value}
                  {kpi.suffix && <span className="text-2xl ml-0.5 opacity-60">{kpi.suffix}</span>}
                </span>
                <Icon size={24} style={{ color: 'var(--color-surface-container-highest)', opacity: 0.5 }} />
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gradient-primary)', opacity: 0.6 }} />
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card-elevated animate-fade-in-up delay-6" style={{ border: '1px solid var(--glass-stroke)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Applications Trend</h2>
            <span className="text-label-md">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary-container)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary-container)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#gradientArea)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-primary)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="glass-card-elevated animate-fade-in-up delay-7" style={{ border: '1px solid var(--glass-stroke)' }}>
          <h2 className="text-title-sm mb-4" style={{ color: 'var(--color-on-surface)' }}>Status Mix</h2>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-col gap-2 mt-2 w-full">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>{entry.name}</span>
                  </div>
                  <span className="text-data font-medium" style={{ color: 'var(--color-on-surface)' }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card-elevated animate-fade-in-up delay-8" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Recent Activity</h2>
        </div>
        {recentActivity.map((job) => (
          <div
            key={job.id}
            className="py-4 flex items-start gap-4 transition-all rounded-lg px-2 -mx-2 cursor-pointer"
            style={{ transition: 'background var(--transition-base)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-container-low)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'var(--gradient-primary-subtle)', color: 'var(--color-primary)' }}
            >
              {job.company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                {job.role} at {job.company}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                  style={{ background: `${statusColor(job.status)}20`, color: statusColor(job.status) }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor(job.status) }} />
                  {JOB_STATUSES.find(s => s.value === job.status)?.label}
                </span>
                <span className="text-label-md truncate">{job.notes || job.description}</span>
              </div>
            </div>
            <span className="text-label-md shrink-0">{timeAgo(job.lastUpdated)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
