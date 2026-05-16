import { useMemo } from 'react'
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
      { label: 'Total Applied', value: total, trend: '▲ 12%', up: true },
      { label: 'Interviews', value: interviews, trend: '▲ 8%', up: true },
      { label: 'Offers', value: offers, trend: offers > 0 ? '▲ 4%' : '—', up: offers > 0 },
      { label: 'Acceptance Rate', value: rate, suffix: '%', trend: '▲ 4%', up: true },
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

  const statusToCss = (status: string) => {
    const map: Record<string, string> = {
      applied: 'applied', saved: 'saved', interview: 'interview',
      offer: 'offer', accepted: 'offer', rejected: 'rejected',
    }
    return map[status] || 'applied'
  }

  /* ─── Chart Tooltip ──────────────────────────────── */
  const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: '#003E50', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '4px', padding: '8px 12px', fontSize: '12px', color: '#FFFFFF',
      }}>
        <p style={{ color: '#7A9CAE', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
          {payload[0].value} applications
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Section Header */}
      <div className="indra-section-header">
        <p className="indra-section-eyebrow">Overview</p>
        <h2 className="indra-section-title">Executive Dashboard</h2>
        <p className="indra-panel-subtitle" style={{ marginTop: '8px' }}>
          Your application funnel at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="indra-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="indra-kpi-card">
            <div className="indra-kpi-label">{kpi.label}</div>
            <div className="indra-kpi-value">
              {kpi.value}{kpi.suffix || ''}
            </div>
            <div className={`indra-kpi-change ${kpi.up ? 'up' : 'down'}`}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="indra-dash-grid">
        {/* Area Chart Panel */}
        <div className="indra-panel">
          <div className="indra-panel-header">
            <div>
              <div className="indra-panel-title">Applications Trend</div>
              <div className="indra-panel-subtitle">Last 30 days</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="indraGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B0BD" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00B0BD" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#7A9CAE' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7A9CAE' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00B0BD"
                strokeWidth={2}
                fill="url(#indraGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#00B0BD', stroke: '#002B3A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Donut */}
        <div className="indra-panel">
          <div className="indra-panel-header">
            <div className="indra-panel-title">Status Mix</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', width: '100%' }}>
              {pieData.map((entry) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />
                    <span style={{ color: '#B3C1DA' }}>{entry.name}</span>
                  </div>
                  <span style={{ color: '#FFFFFF', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <div className="indra-panel">
        <div className="indra-panel-header">
          <div className="indra-panel-title">Recent Activity</div>
          <div className="indra-panel-subtitle">Last updates</div>
        </div>
        <ul className="indra-activity-list">
          {recentActivity.map((job) => (
            <li key={job.id} className="indra-activity-item">
              <span className={`indra-activity-dot ${statusToCss(job.status) === 'offer' ? 'success' : statusToCss(job.status) === 'rejected' ? 'error' : statusToCss(job.status) === 'interview' ? 'warning' : 'info'}`} />
              <div>
                <div className="indra-activity-text">
                  <strong>{job.role}</strong> at <strong>{job.company}</strong>
                  {' — '}
                  <span className={`indra-status-badge ${statusToCss(job.status)}`}>
                    {JOB_STATUSES.find(s => s.value === job.status)?.label}
                  </span>
                </div>
                <div className="indra-activity-time">{timeAgo(job.lastUpdated)}</div>
              </div>
            </li>
          ))}
          {recentActivity.length === 0 && (
            <li className="indra-activity-item">
              <span className="indra-activity-dot info" />
              <div>
                <div className="indra-activity-text">No applications yet. Add your first job to get started.</div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
