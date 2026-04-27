import { TrendingUp, TrendingDown, Briefcase, Users, Gift, Target } from 'lucide-react'

const kpiData = [
  { label: 'Total Applied', value: 127, trend: '+12%', up: true, icon: Briefcase },
  { label: 'Interviews', value: 34, trend: '+8%', up: true, icon: Users },
  { label: 'Offers', value: 8, trend: '-2%', up: false, icon: Gift },
  { label: 'Acceptance Rate', value: '23.5', suffix: '%', trend: '+4%', up: true, icon: Target },
]

export function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
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
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className={`glass-card-elevated animate-fade-in-up delay-${index + 2}`}
              style={{
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--glass-stroke)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-label-md">{kpi.label}</span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-xs font-medium"
                    style={{ color: kpi.up ? 'var(--color-primary)' : 'var(--color-tertiary)' }}
                  >
                    {kpi.trend}
                  </span>
                  {kpi.up ? (
                    <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <TrendingDown size={14} style={{ color: 'var(--color-tertiary)' }} />
                  )}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <span className="text-display">
                  {kpi.value}
                  {kpi.suffix && (
                    <span className="text-2xl ml-0.5 opacity-60">{kpi.suffix}</span>
                  )}
                </span>
                <Icon size={24} style={{ color: 'var(--color-surface-container-highest)', opacity: 0.5 }} />
              </div>

              {/* Bottom gradient bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--gradient-primary)',
                  opacity: 0.6,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card-elevated animate-fade-in-up delay-6" style={{ border: '1px solid var(--glass-stroke)', minHeight: '280px' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Applications Trend</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-md text-xs font-medium" style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>Weekly</button>
              <button className="px-3 py-1 rounded-md text-xs font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>Monthly</button>
            </div>
          </div>
          <div className="flex items-center justify-center" style={{ height: '200px', color: 'var(--color-on-surface-variant)' }}>
            <p className="text-label-md">📊 Recharts integration — Phase 2</p>
          </div>
        </div>

        <div className="glass-card-elevated animate-fade-in-up delay-7" style={{ border: '1px solid var(--glass-stroke)', minHeight: '280px' }}>
          <h2 className="text-title-sm mb-4" style={{ color: 'var(--color-on-surface)' }}>Status Mix</h2>
          <div className="flex items-center justify-center" style={{ height: '200px', color: 'var(--color-on-surface-variant)' }}>
            <p className="text-label-md">🍩 Donut chart — Phase 2</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card-elevated animate-fade-in-up delay-8" style={{ border: '1px solid var(--glass-stroke)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title-sm" style={{ color: 'var(--color-on-surface)' }}>Recent Activity</h2>
          <button className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>View All Timeline</button>
        </div>

        {[
          { company: 'Product Strategy Lead at Meta', status: 'Interviewing', detail: 'Second round technical interview scheduled for Thursday', time: '2 hours ago' },
          { company: 'Senior Director of Engineering at Spotify', status: 'Application Sent', detail: 'Customized resume. Transcript of pdf attached to application', time: '5 hours ago' },
          { company: 'VP of Operations at Goldman Sachs', status: 'Offer Pending', detail: 'Final round confirmation received. Waiting for digital contract.', time: 'Yesterday' },
        ].map((activity, i) => (
          <div
            key={i}
            className="py-4 flex items-start gap-4 transition-all rounded-lg px-2 -mx-2"
            style={{
              borderBottom: i < 2 ? 'none' : 'none',
              marginBottom: i < 2 ? 'var(--space-sm)' : 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-container-low)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: 'var(--gradient-primary-subtle)',
                color: 'var(--color-primary)',
              }}
            >
              {activity.company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                {activity.company}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: activity.status === 'Interviewing'
                      ? 'rgba(78, 222, 163, 0.15)'
                      : activity.status === 'Offer Pending'
                      ? 'rgba(255, 179, 175, 0.15)'
                      : 'var(--color-surface-container-high)',
                    color: activity.status === 'Interviewing'
                      ? 'var(--color-primary)'
                      : activity.status === 'Offer Pending'
                      ? 'var(--color-tertiary)'
                      : 'var(--color-on-surface-variant)',
                  }}
                >
                  {activity.status}
                </span>
                <span className="text-label-md truncate">{activity.detail}</span>
              </div>
            </div>
            <span className="text-label-md shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
