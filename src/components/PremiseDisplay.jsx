/**
 * PremiseDisplay — Shows the puzzle premises and question during training.
 * Accepts an optional blur prop for the pause state.
 */
export default function PremiseDisplay({ premises = [], question = '', blurred = false }) {
  return (
    <div className={`transition-all duration-300 ${blurred ? 'filter blur-xl select-none pointer-events-none' : ''}`}>
      {/* Premises */}
      <div className="glass-card p-8 mb-6 animate-slide-down">
        <div className="section-heading mb-4">Premises</div>
        <div className="space-y-3">
          {premises.map((premise, i) => (
            <div
              key={i}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="w-6 h-6 rounded-full bg-neon-purple/20 border border-neon-purple/40
                               text-neon-purple text-xs font-mono flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-text-primary text-xl font-semibold tracking-wide leading-relaxed font-mono">
                {premise}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-dim text-xs font-mono uppercase tracking-widest">therefore</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Question */}
      <div className="glass-card p-8 border-neon-cyan/20 animate-slide-up">
        <div className="section-heading mb-4">Question</div>
        <div className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide leading-snug font-mono">
          {question}
        </div>
      </div>
    </div>
  )
}
