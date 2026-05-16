import { useState, useEffect, useRef } from 'react'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { analytics } from '@/lib/analytics'

/* ─── Geodesic Canvas Background ─── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      time += 0.003

      // Draw floating nodes
      const nodes: { x: number; y: number }[] = []
      for (let i = 0; i < 40; i++) {
        const x = (Math.sin(time + i * 0.7) * 0.35 + 0.5) * w + Math.cos(time * 0.5 + i * 1.3) * 40
        const y = (Math.cos(time * 0.8 + i * 0.5) * 0.35 + 0.5) * h + Math.sin(time * 0.7 + i * 0.9) * 30
        nodes.push({ x, y })

        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 176, 189, 0.4)'
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0, 176, 189, ${0.08 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="indra-hero-canvas" />
}

/* ─── Animated KPI Stat ─── */
function KpiStat({ value, label, suffix = '', delay }: { value: number; label: string; suffix?: string; delay: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now()
      const run = (now: number) => {
        const p = Math.min((now - start) / 1600, 1)
        setN(Math.round(value * (1 - Math.pow(1 - p, 4))))
        if (p < 1) requestAnimationFrame(run)
      }
      requestAnimationFrame(run)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div className="indra-glass-card" style={{ animationDelay: `${delay}ms` }}>
      <p className="indra-kpi-label">{label}</p>
      <p className="indra-kpi-value">{n}{suffix}</p>
    </div>
  )
}

/* ─── Feature Bullet ─── */
function Feature({ text, delay }: { text: string; delay: string }) {
  return (
    <div className="indra-feature" style={{ animationDelay: delay }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B0BD" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>{text}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  LOGIN PAGE — Indra Corporate Design System v3.0          */
/* ═══════════════════════════════════════════════════════════ */

export function LoginPage() {
  const { login, signup, googleLogin } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signup(email, password, displayName || email.split('@')[0])
        analytics.track('auth', 'signup', email)
      } else {
        await login(email, password)
        analytics.track('auth', 'login', email)
      }
    } catch (err: any) {
      const c = err?.code || ''
      if (c === 'auth/user-not-found' || c === 'auth/invalid-credential') setError('Invalid email or password.')
      else if (c === 'auth/email-already-in-use') setError('An account with this email already exists.')
      else if (c === 'auth/weak-password') setError('Password must be at least 6 characters.')
      else if (c === 'auth/invalid-email') setError('Please enter a valid email address.')
      else setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await googleLogin()
      analytics.track('auth', 'google_login')
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') setError('Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="indra-login-root">
      {/* ═══ LEFT — Hero Panel ═══ */}
      <div className="indra-hero-panel">
        <HeroCanvas />

        {/* Radial gradient overlays */}
        <div className="indra-hero-gradient" />

        <div className="indra-hero-content">
          {/* Eyebrow */}
          <p className="indra-eyebrow">DSS-JOBFLOW-2026 · EXECUTIVE TRACKER</p>

          {/* Headline */}
          <h1 className="indra-hero-headline">
            Your Career,<br />
            <span className="indra-text-cyan">Strategically Managed.</span>
          </h1>

          {/* Subtitle */}
          <p className="indra-hero-subtitle">
            Track applications, ace interviews, and land offers — with AI-powered
            intelligence at every step. Built on the official corporate design standard.
          </p>

          {/* Feature list */}
          <div className="indra-feature-list">
            <Feature text="Executive Dashboard & Analytics" delay="0.4s" />
            <Feature text="AI Cover Letters & Interview Prep" delay="0.5s" />
            <Feature text="Secure & Private — Your Data, Your Control" delay="0.6s" />
          </div>

          {/* KPI row */}
          <div className="indra-kpi-row">
            <KpiStat value={10} label="PHASES BUILT" delay={1100} />
            <KpiStat value={6} label="AI FEATURES" suffix="+" delay={1300} />
            <KpiStat value={100} label="SECURE" suffix="%" delay={1500} />
          </div>
        </div>
      </div>

      {/* ═══ RIGHT — Auth Form ═══ */}
      <div className="indra-form-panel">
        <div className="indra-form-container">
          {/* Mobile logo */}
          <div className="indra-mobile-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L2 8l12 6 12-6-12-6z" stroke="#00B0BD" strokeWidth="1.5" fill="none"/>
              <path d="M2 20l12 6 12-6" stroke="#00B0BD" strokeWidth="1.5" fill="none"/>
              <path d="M2 14l12 6 12-6" stroke="#00B0BD" strokeWidth="1.5" fill="none"/>
            </svg>
            <span className="indra-mobile-title">JobFlow</span>
          </div>

          {/* Header */}
          <div className="indra-form-header">
            <p className="indra-form-eyebrow">{isSignUp ? 'Get Started' : 'Welcome Back'}</p>
            <h2 className="indra-form-heading">
              {isSignUp ? (
                <>Start your<br /><span className="indra-text-cyan">intelligent</span> job search</>
              ) : (
                <>Sign in to<br /><span className="indra-text-cyan">continue</span> your journey</>
              )}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="indra-auth-form">
            {isSignUp && (
              <div className="indra-form-field">
                <label className="indra-form-label" htmlFor="login-name">Full Name</label>
                <div className="indra-input-wrapper">
                  <User size={15} className="indra-input-icon" style={{ color: focused === 'name' ? '#00B0BD' : '#7A9CAE' }} />
                  <input
                    id="login-name"
                    className={`indra-form-input ${focused === 'name' ? 'indra-form-input--focused' : ''}`}
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                  />
                </div>
              </div>
            )}

            <div className="indra-form-field">
              <label className="indra-form-label" htmlFor="login-email">Email Address *</label>
              <div className="indra-input-wrapper">
                <Mail size={15} className="indra-input-icon" style={{ color: focused === 'email' ? '#00B0BD' : '#7A9CAE' }} />
                <input
                  id="login-email"
                  className={`indra-form-input ${focused === 'email' ? 'indra-form-input--focused' : ''}`}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>

            <div className="indra-form-field">
              <div className="indra-label-row">
                <label className="indra-form-label" htmlFor="login-pass">Password *</label>
                {!isSignUp && (
                  <button type="button" className="indra-forgot-link">Forgot Password?</button>
                )}
              </div>
              <div className="indra-input-wrapper">
                <Lock size={15} className="indra-input-icon" style={{ color: focused === 'pass' ? '#00B0BD' : '#7A9CAE' }} />
                <input
                  id="login-pass"
                  className={`indra-form-input ${focused === 'pass' ? 'indra-form-input--focused' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="indra-eye-btn"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="indra-error-msg">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button — Indra Cyan */}
            <button type="submit" disabled={loading} className="indra-btn-cyan indra-btn--form">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="indra-divider">
            <div className="indra-divider-line" />
            <span className="indra-divider-text">OR</span>
            <div className="indra-divider-line" />
          </div>

          {/* Google button — Secondary style */}
          <button onClick={handleGoogle} disabled={loading} className="indra-btn-secondary indra-btn--form">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Toggle sign in/up */}
          <p className="indra-toggle-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="indra-toggle-link"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Footer */}
          <div className="indra-auth-footer">
            <Shield size={11} />
            <span>Secured by Firebase</span>
          </div>
        </div>
      </div>
    </div>
  )
}
