import { useDispatch } from 'react-redux'
import { resumeSession } from '../features/session/sessionSlice'

export default function PauseOverlay() {
  const dispatch = useDispatch()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
      {/* Pulsing pause icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-neon-purple/10 border border-neon-purple/30
                        flex items-center justify-center animate-pulse-neon">
          <div className="flex gap-3">
            <div className="w-3.5 h-12 bg-neon-purple rounded-full" style={{ boxShadow: '0 0 12px #bf5af2' }} />
            <div className="w-3.5 h-12 bg-neon-purple rounded-full" style={{ boxShadow: '0 0 12px #bf5af2' }} />
          </div>
        </div>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-neon-purple/20 animate-ping" />
      </div>

      <h2 className="text-3xl font-bold text-text-primary mb-2 font-mono tracking-wide">
        Training Paused
      </h2>
      <p className="text-text-muted text-sm max-w-xs mb-8 leading-relaxed">
        Your puzzle is hidden. Resuming will generate a fresh question at the same difficulty level.
      </p>

      {/* Resume button */}
      <button
        id="btn-resume"
        onClick={() => dispatch(resumeSession())}
        className="btn-neon-cyan px-10 py-4 text-lg font-semibold tracking-wide"
      >
        <span className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Resume — New Question
        </span>
      </button>

      <p className="mt-4 text-text-dim text-xs font-mono">press Space to resume</p>
    </div>
  )
}
