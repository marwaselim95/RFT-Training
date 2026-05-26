import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectSessionStats, startSession, resetSession, updateLevel } from '../features/session/sessionSlice'
import { saveSession, fetchSessionHistory, updateUserLevel } from '../features/history/historySlice'
import { setProfile } from '../features/auth/authSlice'
import { supabase } from '../lib/supabase'
import StatsGrid from '../components/StatsGrid'

const SESSION_OPTIONS = [5, 10, 15]

const PRAISE_MESSAGES = [
  'Outstanding work on your session!',
  'Great job completing your training!',
  "You're building a sharper mind!",
  'Excellent cognitive workout today!',
  'Keep up the incredible momentum!',
]

export default function PostSession() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, profile } = useSelector(s => s.auth)
  const { level } = useSelector(s => s.session)
  const stats = useSelector(selectSessionStats)
  const sessions = useSelector(s => s.history.sessions)

  const [saved, setSaved] = useState(false)
  const [newLevel, setNewLevel] = useState(level)
  const [isDailyHigh, setIsDailyHigh] = useState(false)
  const [praiseMessage] = useState(() =>
    PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)]
  )

  // Guard: if no stats, session wasn't completed
  useEffect(() => {
    if (!stats) {
      navigate('/')
    }
  }, [stats, navigate])

  // Calculate new level and save session on mount
  useEffect(() => {
    if (!stats || saved) return

    const computedNewLevel = Math.max(1, level + stats.levelChange)
    setNewLevel(computedNewLevel)

    // Determine daily high before saving
    const today = new Date().toLocaleDateString('en-CA')
    const previousBestToday = sessions
      .filter(s => new Date(s.played_at).toLocaleDateString('en-CA') === today)
      .reduce((best, s) => Math.max(best, s.sm_score), 0)

    const isNewHigh = stats.smScore > previousBestToday
    setIsDailyHigh(isNewHigh)

    const saveAndUpdate = async () => {
      const sessionPayload = {
        user_id: user?.id,
        played_at: new Date().toISOString(),
        sm_score: stats.smScore,
        avg_time_seconds: stats.avgTimeSec,
        accuracy: stats.accuracy,
        level,
        question_count: stats.total,
      }

      if (user) {
        // Save to Supabase
        await dispatch(saveSession(sessionPayload))

        // Update level in DB if changed
        if (computedNewLevel !== level) {
          await dispatch(updateUserLevel({ userId: user.id, newLevel: computedNewLevel }))
          // Refresh profile
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (updatedProfile) dispatch(setProfile(updatedProfile))
        }

        // Re-fetch history so graph updates
        await dispatch(fetchSessionHistory(user.id))
      }

      dispatch(updateLevel(computedNewLevel))
      setSaved(true)
    }

    saveAndUpdate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartNew = (questionCount) => {
    dispatch(startSession({ totalQuestions: questionCount, level: newLevel }))
    navigate('/train')
  }

  const handleReturnDashboard = () => {
    dispatch(resetSession())
    navigate('/')
  }

  if (!stats) return null

  return (
    <div className="min-h-screen relative z-10">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40
                            flex items-center justify-center">
              <span className="text-neon-cyan text-sm font-bold font-mono">R</span>
            </div>
            <span className="font-bold text-text-primary">RFT Trainer</span>
          </div>
          <button
            onClick={handleReturnDashboard}
            className="text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Praise Header */}
        <div className="text-center mb-10 animate-slide-down">
          <div className="text-5xl mb-4 animate-float">
            {stats.accuracy >= 0.8 ? '🧠' : stats.accuracy >= 0.6 ? '💪' : '📚'}
          </div>
          <h1 className="text-3xl font-black text-text-primary mb-2">{praiseMessage}</h1>
          <p className="text-text-muted">
            Session complete · {stats.total} questions ·{' '}
            {!user && <span className="text-neon-cyan">Sign in to save your progress</span>}
            {user && !saved && <span className="text-text-muted animate-pulse">Saving…</span>}
            {user && saved && <span className="text-neon-green">✓ Progress saved</span>}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10">
          <StatsGrid
            stats={stats}
            levelChange={stats.levelChange}
            isDailyHigh={isDailyHigh && user}
          />
        </div>

        {/* Level change detail */}
        {stats.levelChange !== 0 && (
          <div className={`glass-card p-5 mb-8 border animate-scale-in
            ${stats.levelChange > 0
              ? 'border-neon-green/30 bg-neon-green/5'
              : 'border-neon-red/30 bg-neon-red/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stats.levelChange > 0 ? '🚀' : '📉'}</span>
              <div>
                <div className={`font-bold ${stats.levelChange > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {stats.levelChange > 0
                    ? `Level Up! → Level ${newLevel}`
                    : `Level Down → Level ${newLevel}`}
                </div>
                <div className="text-text-muted text-sm">
                  {stats.levelChange > 0
                    ? `Accuracy ${Math.round(stats.accuracy * 100)}% ≥ 80% and avg time ${stats.avgTimeSec.toFixed(2)}s ≤ 4.5s`
                    : `Accuracy ${Math.round(stats.accuracy * 100)}% was below 60% — keep practicing!`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        <div className="glass-card p-5 mb-10 animate-fade-in">
          <div className="section-heading mb-3">Score Formula</div>
          <div className="font-mono text-sm text-text-muted">
            SM = (1 / avg_time) × level
          </div>
          <div className="font-mono text-text-primary mt-2">
            = (1 / {stats.avgTimeSec.toFixed(2)}) × {level}
          </div>
          <div className="font-mono text-neon-cyan font-bold text-xl mt-1">
            = {stats.smScore.toFixed(4)}
          </div>
        </div>

        {/* Take Another Session */}
        <div className="glass-card p-7 text-center animate-slide-up">
          <div className="text-text-primary font-bold text-lg mb-2">Take another session?</div>
          <div className="text-text-muted text-sm mb-6">
            Current level: <span className="text-neon-purple font-semibold font-mono">L{newLevel}</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            {SESSION_OPTIONS.map(n => (
              <button
                key={n}
                id={`btn-replay-${n}`}
                onClick={() => handleStartNew(n)}
                className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl
                           border-2 border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan
                           hover:bg-neon-cyan/15 hover:border-neon-cyan hover:shadow-neon-cyan
                           transition-all duration-200 active:scale-95 font-mono"
              >
                <span className="text-3xl font-black">{n}</span>
                <span className="text-xs text-text-muted mt-1">questions</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleReturnDashboard}
            className="text-text-muted hover:text-neon-cyan text-sm transition-colors underline underline-offset-4"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
