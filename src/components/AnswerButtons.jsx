/**
 * AnswerButtons — The large TRUE / FALSE footer buttons.
 * Supports keyboard binding (← = FALSE, → = TRUE) and disabled state.
 */
export default function AnswerButtons({ onAnswer, disabled = false, feedbackState = null }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* FALSE button */}
      <button
        id="btn-false"
        onClick={() => !disabled && onAnswer(false)}
        disabled={disabled}
        className={`
          relative group py-7 rounded-2xl font-bold text-2xl tracking-widest font-mono
          transition-all duration-200 disabled:cursor-not-allowed
          border-2 focus:outline-none
          ${feedbackState === null
            ? 'border-neon-red/40 bg-neon-red/5 text-neon-red hover:bg-neon-red/15 hover:border-neon-red hover:shadow-neon-red active:scale-95'
            : feedbackState === 'incorrect'
              ? 'border-neon-red bg-neon-red/20 text-neon-red shadow-neon-red'
              : 'border-border bg-surface/40 text-text-dim opacity-40'
          }
        `}
        aria-label="Answer False"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-xl opacity-60">←</span>
          FALSE
        </span>
        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-text-dim group-hover:text-text-muted transition-colors">
          f key
        </span>
      </button>

      {/* TRUE button */}
      <button
        id="btn-true"
        onClick={() => !disabled && onAnswer(true)}
        disabled={disabled}
        className={`
          relative group py-7 rounded-2xl font-bold text-2xl tracking-widest font-mono
          transition-all duration-200 disabled:cursor-not-allowed
          border-2 focus:outline-none
          ${feedbackState === null
            ? 'border-neon-green/40 bg-neon-green/5 text-neon-green hover:bg-neon-green/15 hover:border-neon-green hover:shadow-neon-green active:scale-95'
            : feedbackState === 'correct'
              ? 'border-neon-green bg-neon-green/20 text-neon-green shadow-neon-green'
              : 'border-border bg-surface/40 text-text-dim opacity-40'
          }
        `}
        aria-label="Answer True"
      >
        <span className="flex items-center justify-center gap-3">
          TRUE
          <span className="text-xl opacity-60">→</span>
        </span>
        <span className="absolute bottom-2 left-3 text-[10px] font-mono text-text-dim group-hover:text-text-muted transition-colors">
          j key
        </span>
      </button>
    </div>
  )
}
