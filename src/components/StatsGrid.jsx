/**
 * StatsGrid — Post-session summary cards.
 */
export default function StatsGrid({ stats, levelChange, isDailyHigh }) {
  const { smScore, avgTimeSec, accuracy, correct, total } = stats

  const cards = [
    {
      id: 'sm-score',
      label: 'SM Score',
      value: smScore.toFixed(3),
      sub: 'speed × level',
      color: 'neon-cyan',
      icon: '⚡',
      highlight: true,
    },
    {
      id: 'avg-time',
      label: 'Avg Time',
      value: `${avgTimeSec.toFixed(2)}s`,
      sub: 'per question',
      color: avgTimeSec <= 4.5 ? 'neon-green' : 'neon-red',
      icon: '⏱',
    },
    {
      id: 'accuracy',
      label: 'Accuracy',
      value: `${Math.round(accuracy * 100)}%`,
      sub: `${correct} / ${total} correct`,
      color: accuracy >= 0.8 ? 'neon-green' : accuracy >= 0.6 ? 'neon-cyan' : 'neon-red',
      icon: '🎯',
    },
    {
      id: 'level-change',
      label: 'Level',
      value: levelChange > 0 ? `↑ Leveled Up!` : levelChange < 0 ? `↓ Level Down` : `→ Held`,
      sub: levelChange > 0 ? 'Keep pushing!' : levelChange < 0 ? 'Practice more' : 'Consistent',
      color: levelChange > 0 ? 'neon-green' : levelChange < 0 ? 'neon-red' : 'neon-purple',
      icon: levelChange > 0 ? '🚀' : levelChange < 0 ? '📉' : '💎',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Daily High Badge */}
      {isDailyHigh && (
        <div className="glass-card p-4 border-neon-cyan/30 bg-neon-cyan/5 flex items-center gap-3 animate-scale-in">
          <span className="text-2xl animate-float">🏆</span>
          <div>
            <div className="text-neon-cyan font-bold">New Daily High!</div>
            <div className="text-text-muted text-sm">This session beats your previous best today</div>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.id}
            id={`stat-${card.id}`}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="section-heading">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${
              card.color === 'neon-cyan' ? 'neon-cyan' :
              card.color === 'neon-green' ? 'neon-green' :
              card.color === 'neon-red' ? 'neon-red' :
              'neon-purple'
            }`}>
              {card.value}
            </div>
            <div className="text-text-muted text-xs mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
