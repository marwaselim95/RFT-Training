import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  submitAnswer, advanceQuestion, pauseSession, resumeSession,
} from '../features/session/sessionSlice'
import PremiseDisplay from '../components/PremiseDisplay'
import AnswerButtons from '../components/AnswerButtons'
import PauseOverlay from '../components/PauseOverlay'

const FEEDBACK_DELAY_MS = 900 // time to show right/wrong color before advancing

export default function TrainingSession() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    status,
    level,
    totalQuestions,
    currentQuestionIndex,
    currentQuestion,
    feedbackState,
  } = useSelector(s => s.session)

  // Redirect if session is complete or not started
  useEffect(() => {
    if (status === 'complete') {
      navigate('/summary')
    } else if (status === 'idle') {
      navigate('/')
    }
  }, [status, navigate])

  // Auto-advance after showing feedback
  useEffect(() => {
    if (feedbackState !== null) {
      const timer = setTimeout(() => {
        dispatch(advanceQuestion())
      }, FEEDBACK_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [feedbackState, dispatch])

  // Keyboard bindings
  const handleKeyDown = useCallback((e) => {
    if (feedbackState !== null) return // block during feedback

    if (status === 'paused') {
      if (e.code === 'Space') {
        e.preventDefault()
        dispatch(resumeSession())
      }
      return
    }

    if (status !== 'active') return

    if (e.key === 'f' || e.key === 'F' || e.key === 'ArrowLeft') {
      e.preventDefault()
      dispatch(submitAnswer({ userAnswer: false }))
    } else if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowRight') {
      e.preventDefault()
      dispatch(submitAnswer({ userAnswer: true }))
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault()
      dispatch(pauseSession())
    }
  }, [status, feedbackState, dispatch])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleAnswer = (answer) => {
    if (feedbackState !== null || status !== 'active') return
    dispatch(submitAnswer({ userAnswer: answer }))
  }

  const progress = ((currentQuestionIndex) / totalQuestions) * 100

  if (!currentQuestion && status === 'active') return null

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Level badge */}
          <div className="flex items-center gap-2 bg-neon-purple/10 border border-neon-purple/30
                          rounded-xl px-3 py-1.5 text-neon-purple font-mono font-bold text-sm shrink-0">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            L{level}
          </div>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-text-muted text-xs font-mono">
                Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
              </span>
              <span className="text-text-muted text-xs font-mono">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Pause button */}
          <button
            id="btn-pause"
            onClick={() => status === 'active' ? dispatch(pauseSession()) : dispatch(resumeSession())}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold
                        transition-all duration-200 font-mono
                        ${status === 'paused'
                          ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                          : 'border-border bg-surface text-text-muted hover:text-text-primary hover:border-neon-cyan/40'
                        }`}
            aria-label={status === 'paused' ? 'Resume session' : 'Pause session'}
          >
            {status === 'paused' ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                Pause
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main Stage ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col">

        {status === 'paused' ? (
          <PauseOverlay />
        ) : (
          <>
            {/* Feedback Banner */}
            {feedbackState !== null && (
              <div className={`mb-6 rounded-2xl p-4 text-center font-bold text-lg font-mono animate-scale-in
                              ${feedbackState === 'correct'
                                ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
                                : 'bg-neon-red/10 border border-neon-red/30 text-neon-red animate-shake'
                              }`}>
                {feedbackState === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
              </div>
            )}

            {/* Puzzle Display */}
            {currentQuestion && (
              <div className="flex-1 mb-8">
                <PremiseDisplay
                  premises={currentQuestion.premises}
                  question={currentQuestion.question}
                  blurred={status === 'paused'}
                />
              </div>
            )}

            {/* Answer Buttons */}
            <div className="mt-auto">
              <AnswerButtons
                onAnswer={handleAnswer}
                disabled={feedbackState !== null || status !== 'active'}
                feedbackState={feedbackState}
              />
              <div className="mt-3 text-center text-text-dim text-xs font-mono">
                ← F key = FALSE &nbsp;|&nbsp; J key = TRUE → &nbsp;|&nbsp; P = Pause
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
