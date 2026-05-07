import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2, ArrowRight, Briefcase, TrendingUp, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { analytics } from '@/lib/analytics'

/* ─── Floating Orb ─── */
function Orb({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, filter: 'blur(60px)', opacity: 0.45, animation: `orbFloat 14s ease-in-out ${delay}s infinite alternate` }}
    />
  )
}

/* ─── Feature Row ─── */
function Feature({ icon: Icon, text, delay }: { icon: any; text: string; delay: number }) {
  return (
    <div className="flex items-center gap-3.5" style={{ animation: `slideUp 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}>
      <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)' }}>
        <Icon size={16} style={{ color: '#4edea3' }} />
      </div>
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.01em' }}>{text}</span>
    </div>
  )
}

/* ─── Animated Stat ─── */
function Stat({ value, label, suffix = '', delay }: { value: number; label: string; suffix?: string; delay: number }) {
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
    <div style={{ animation: `slideUp 0.6s cubic-bezier(0.16,1,0.3,1) ${delay / 1000}s both` }}>
      <div className="text-2xl font-bold tracking-tight" style={{ color: '#e2e2eb', fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}>
        {n}{suffix}
      </div>
      <div className="text-[10px] mt-0.5 uppercase tracking-[0.15em] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
    </div>
  )
}

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
      if (isSignUp) { await signup(email, password, displayName || email.split('@')[0]); analytics.track('auth', 'signup', email) }
      else { await login(email, password); analytics.track('auth', 'login', email) }
    } catch (err: any) {
      const c = err?.code || ''
      if (c === 'auth/user-not-found' || c === 'auth/invalid-credential') setError('Invalid email or password.')
      else if (c === 'auth/email-already-in-use') setError('An account with this email already exists.')
      else if (c === 'auth/weak-password') setError('Password must be at least 6 characters.')
      else if (c === 'auth/invalid-email') setError('Please enter a valid email address.')
      else setError(err.message || 'Authentication failed.')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try { await googleLogin(); analytics.track('auth', 'google_login') } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') setError('Google sign-in failed. Please try again.')
    } finally { setLoading(false) }
  }

  /* ─── Design system: surface_container_lowest for inputs ─── */
  const fieldBase: React.CSSProperties = {
    background: '#0c0e14',
    border: `1px solid ${focused ? 'transparent' : 'rgba(60,74,66,0.15)'}`,
    borderRadius: '10px',
    color: '#e2e2eb',
    fontSize: '14px',
    fontFamily: 'var(--font-primary, Inter, sans-serif)',
    padding: '12px 16px 12px 44px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.3s ease',
  }

  const fieldFocused = (f: string): React.CSSProperties => ({
    ...fieldBase,
    border: focused === f ? '1px solid rgba(78,222,163,0.4)' : '1px solid rgba(60,74,66,0.15)',
    boxShadow: focused === f ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
  })

  const iconColor = (f: string) => focused === f ? '#4edea3' : 'rgba(187,202,191,0.4)'

  return (
    <div className="min-h-screen flex" style={{ background: '#0F1117' }}>
      <style>{`
        @keyframes orbFloat { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-15px) scale(1.08)} 100%{transform:translate(-15px,10px) scale(0.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes logoIn { 0%{opacity:0;transform:scale(0.85) rotate(-8deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes gridScroll { 0%{background-position:0 0} 100%{background-position:32px 32px} }
        .login-field::placeholder { color: rgba(187,202,191,0.3); }
        .goog-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .pri-btn:hover:not(:disabled) { box-shadow: 0 8px 28px rgba(16,185,129,0.35) !important; transform: translateY(-1px); }
        .pri-btn:active:not(:disabled) { transform: translateY(0); }
        .mode-link:hover { color: #4edea3 !important; }
      `}</style>

      {/* ═══ LEFT — Brand Panel ═══ */}
      <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden p-14"
        style={{ background: '#111319', borderRight: 'none' }}
      >
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          animation: 'gridScroll 25s linear infinite',
        }} />

        <Orb color="rgba(16,185,129,0.18)" size={320} x="5%" y="15%" delay={0} />
        <Orb color="rgba(99,102,241,0.12)" size={260} x="55%" y="55%" delay={4} />
        <Orb color="rgba(59,130,246,0.08)" size={200} x="25%" y="75%" delay={7} />

        {/* Logo */}
        <div className="relative z-10" style={{ animation: 'logoIn 0.9s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.2)' }}>
              <Briefcase size={20} color="#fff" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight" style={{ color: '#e2e2eb' }}>JobFlow</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: 'rgba(78,222,163,0.6)' }}>Executive Tracker</div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-10 -mt-8">
          <div>
            <h1 className="text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em]"
              style={{ color: '#e2e2eb', animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
              Your career,<br />
              <span style={{ background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                strategically managed.
              </span>
            </h1>
            <p className="text-sm mt-5 leading-relaxed max-w-sm" style={{ color: 'rgba(187,202,191,0.5)', animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
              Track applications, ace interviews, and land offers — with AI-powered intelligence at every step. Designed for leaders who demand precision.
            </p>
          </div>
          <div className="space-y-4">
            <Feature icon={TrendingUp} text="Executive Dashboard & Analytics" delay={0.45} />
            <Feature icon={Sparkles} text="AI Cover Letters & Interview Prep" delay={0.55} />
            <Feature icon={Shield} text="Secure & Private — Your Data, Your Control" delay={0.65} />
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-14" style={{ animation: 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.9s both' }}>
          <Stat value={10} label="Phases Built" delay={1100} />
          <Stat value={6} label="AI Features" suffix="+" delay={1300} />
          <Stat value={100} label="Secure" suffix="%" delay={1500} />
        </div>
      </div>

      {/* ═══ RIGHT — Auth Form ═══ */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center px-8 sm:px-14 relative overflow-hidden"
        style={{ background: '#0F1117' }}
      >
        <div className="w-full max-w-[360px] relative z-10" style={{ animation: 'slideRight 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <Briefcase size={20} color="#fff" />
            </div>
            <div className="text-lg font-bold" style={{ color: '#e2e2eb' }}>JobFlow</div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-[-0.02em]" style={{ color: '#e2e2eb' }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(187,202,191,0.45)' }}>
              {isSignUp ? 'Start your intelligent job search' : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: 'rgba(187,202,191,0.5)' }}>Full Name</label>
                <div className="relative">
                  <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: iconColor('name'), transition: 'color 0.3s' }} />
                  <input className="login-field" style={fieldFocused('name')} type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your full name"
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: 'rgba(187,202,191,0.5)' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: iconColor('email'), transition: 'color 0.3s' }} />
                <input className="login-field" style={fieldFocused('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-[0.1em] font-semibold" style={{ color: 'rgba(187,202,191,0.5)' }}>Password</label>
                {!isSignUp && <button type="button" className="text-[11px] font-medium mode-link" style={{ color: 'rgba(78,222,163,0.6)' }}>Forgot Password?</button>}
              </div>
              <div className="relative">
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: iconColor('pass'), transition: 'color 0.3s' }} />
                <input className="login-field" style={{ ...fieldFocused('pass'), paddingRight: 44 }} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused('')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md"
                  style={{ color: 'rgba(187,202,191,0.35)' }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(252,124,120,0.08)', color: '#ffb3af', border: '1px solid rgba(252,124,120,0.12)' }}>
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* PRIMARY: Sign In Button */}
            <button type="submit" disabled={loading}
              className="pri-btn w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(16,185,129,0.25)', letterSpacing: '0.02em' }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(60,74,66,0.2)' }} />
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: 'rgba(187,202,191,0.2)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(60,74,66,0.2)' }} />
          </div>

          {/* SECONDARY: Google Button — BELOW Sign In */}
          <button onClick={handleGoogle} disabled={loading}
            className="goog-btn w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(60,74,66,0.15)', color: '#bbcabf' }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Toggle */}
          <p className="text-center text-sm mt-6" style={{ color: 'rgba(187,202,191,0.35)' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="mode-link font-semibold transition-colors duration-200" style={{ color: '#4edea3' }}
            >{isSignUp ? 'Sign In' : 'Sign Up'}</button>
          </p>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-center gap-2">
            <Shield size={11} style={{ color: 'rgba(187,202,191,0.15)' }} />
            <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(187,202,191,0.12)' }}>Secured by Firebase</span>
          </div>
        </div>
      </div>
    </div>
  )
}
