import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setUser, setProfile, closeAuthModal, setAuthMode } from '../features/auth/authSlice'

export default function AuthModal() {
  const dispatch = useDispatch()
  const { showAuthModal, authMode } = useSelector(s => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  if (!showAuthModal) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        })
        if (signUpError) throw signUpError
        setSuccess('Account created! Check your email to confirm, then log in.')
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        dispatch(setUser(data.user))
        dispatch(setProfile(profile))
        dispatch(closeAuthModal())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && dispatch(closeAuthModal())}
    >
      <div className="glass-card w-full max-w-md mx-4 p-8 animate-slide-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-3xl mb-2 font-mono font-bold gradient-text">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </div>
          <p className="text-text-muted text-sm">
            {authMode === 'login'
              ? 'Sign in to track your cognitive progress'
              : 'Join and start training your relational mind'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="section-heading block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. CognitiveAce"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary
                           focus:outline-none focus:border-neon-cyan/60 focus:shadow-neon-cyan
                           transition-all duration-200 placeholder:text-text-dim"
                required
              />
            </div>
          )}

          <div>
            <label className="section-heading block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary
                         focus:outline-none focus:border-neon-cyan/60 focus:shadow-neon-cyan
                         transition-all duration-200 placeholder:text-text-dim"
              required
            />
          </div>

          <div>
            <label className="section-heading block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary
                         focus:outline-none focus:border-neon-cyan/60 focus:shadow-neon-cyan
                         transition-all duration-200 placeholder:text-text-dim"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-neon-red/10 border border-neon-red/30 rounded-xl px-4 py-3 text-neon-red text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl px-4 py-3 text-neon-green text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon-cyan py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => dispatch(setAuthMode('signup'))}
                className="text-neon-cyan hover:underline font-medium"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => dispatch(setAuthMode('login'))}
                className="text-neon-cyan hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
