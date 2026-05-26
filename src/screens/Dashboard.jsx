import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { startSession } from '../features/session/sessionSlice'
import { openAuthModal, signOut } from '../features/auth/authSlice'
import { supabase } from '../lib/supabase'
import ProgressGraph from '../components/ProgressGraph'

const SESSION_OPTIONS = [5, 10, 15]

function LevelBadge({ level }) {
  return (
    <div className="flex items-center gap-2 bg-neon-purple/10 border border-neon-purple/30
                    rounded-xl px-4 py-2 text-neon-purple font-mono font-bold">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
      Level {level}
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, profile } = useSelector(s => s.auth)
  const { loading: historyLoading, sessions } = useSelector(s => s.history)
  const [showSessionPicker, setShowSessionPicker] = useState(false)

  const currentLevel = profile?.current_level ?? 1
  const today = new Date().toLocaleDateString('en-CA')
  const todaySessionCount = sessions.filter(
    s => new Date(s.played_at).toLocaleDateString('en-CA') === today
  ).length
  const totalSessionCount = sessions.length

  const handleStartSession = (questionCount) => {
    dispatch(startSession({ totalQuestions: questionCount, level: currentLevel }))
    navigate('/train')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    dispatch(signOut())
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="border-b border-border bg-surface/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40
                            flex items-center justify-center">
              <span className="text-neon-cyan text-sm font-bold font-mono">R</span>
            </div>
            <span className="font-bold text-text-primary tracking-wide">RFT Trainer</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <LevelBadge level={currentLevel} />
                <span className="text-text-muted text-sm hidden sm:block">
                  {profile?.username || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-text-muted hover:text-text-primary text-sm transition-colors px-3 py-1.5
                             rounded-lg hover:bg-surface border border-transparent hover:border-border"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal('login'))}
                className="btn-neon-cyan px-5 py-2 text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Hero Section */}
        <section className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-neon-cyan/5 border border-neon-cyan/20
                          rounded-full px-4 py-1.5 text-neon-cyan text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-neon" />
            Relational Frame Theory Training
          </div>

          <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight tracking-tight">
            <span className="text-text-primary">Train Your</span>
            <br />
            <span className="gradient-text">Relational Mind</span>
          </h1>

          <p className="text-text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Derive logical relationships between abstract stimuli.
            Build cognitive flexibility and speed under silent time pressure.
          </p>

          {/* CTA */}
          {!showSessionPicker ? (
            <button
              id="btn-start-session"
              onClick={() => setShowSessionPicker(true)}
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl
                         bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20
                         border border-neon-cyan/40 text-text-primary font-bold text-xl
                         hover:from-neon-cyan/30 hover:to-neon-purple/30 hover:border-neon-cyan/70
                         hover:shadow-neon-cyan transition-all duration-300 active:scale-95"
            >
              <span className="text-neon-cyan">▶</span>
              Take your daily session
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-cyan/0 to-neon-cyan/0
                               group-hover:from-neon-cyan/5 group-hover:to-neon-purple/5
                               transition-all duration-300 rounded-2xl" />
            </button>
          ) : (
            <div className="animate-scale-in">
              <div className="section-heading mb-4 text-center">Choose session length</div>
              <div className="flex items-center justify-center gap-4">
                {SESSION_OPTIONS.map(n => (
                  <button
                    key={n}
                    id={`btn-session-${n}`}
                    onClick={() => handleStartSession(n)}
                    className="group flex flex-col items-center justify-center w-28 h-28 rounded-2xl
                               border-2 border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan
                               hover:bg-neon-cyan/15 hover:border-neon-cyan hover:shadow-neon-cyan
                               transition-all duration-200 active:scale-95 font-mono"
                  >
                    <span className="text-4xl font-black">{n}</span>
                    <span className="text-xs text-text-muted mt-1">questions</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSessionPicker(false)}
                className="mt-4 text-text-muted text-sm hover:text-text-primary transition-colors"
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </section>

        {/* Stats Row */}
        {user && profile && (
          <section className="grid grid-cols-3 gap-4 mb-10 animate-fade-in">
            {[
              { label: 'Current Level', value: `L${currentLevel}`, icon: '⭐', color: 'neon-purple' },
              { label: 'Sessions Today', value: todaySessionCount, icon: '📊', color: 'neon-cyan' },
              { label: 'Total Sessions', value: totalSessionCount, icon: '🏅', color: 'neon-green' },
            ].map(item => (
              <div key={item.label} className="stat-card text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className={`text-2xl font-bold font-mono ${
                  item.color === 'neon-cyan' ? 'neon-cyan' :
                  item.color === 'neon-purple' ? 'neon-purple' : 'neon-green'
                }`}>{item.value}</div>
                <div className="text-text-muted text-xs">{item.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Progress Graph */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-primary font-bold text-lg">Progress Overview</h2>
            {!user && (
              <button
                onClick={() => dispatch(openAuthModal('signup'))}
                className="text-neon-cyan text-sm hover:underline"
              >
                Sign up to track progress →
              </button>
            )}
          </div>
          {historyLoading ? (
            <div className="glass-card p-8 flex items-center justify-center min-h-[280px]">
              <div className="flex items-center gap-3 text-text-muted">
                <svg className="animate-spin w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Loading history…
              </div>
            </div>
          ) : (
            <ProgressGraph />
          )}
        </section>

        {/* How It Works */}
        <section className="mb-10">
          <h2 className="text-text-primary font-bold text-lg mb-5">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🧠',
                title: 'Derive Relations',
                desc: 'Read premises linking abstract nonsense words, then answer whether a derived relationship is True or False.',
              },
              {
                icon: '⚡',
                title: 'Speed & Accuracy',
                desc: 'Your SM Score rewards both accuracy and speed: SM = (1 / avg_time) × level.',
              },
              {
                icon: '📈',
                title: 'Adaptive Levels',
                desc: 'Score ≥80% accuracy in ≤4.5s → level up. Drop below 60% accuracy → level down.',
              },
            ].map(item => (
              <div key={item.title} className="glass-card p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-text-primary font-semibold mb-1.5">{item.title}</div>
                <div className="text-text-muted text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
