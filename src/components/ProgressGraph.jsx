import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Dot,
} from 'recharts'
import { useSelector } from 'react-redux'
import { selectGraphData } from '../features/history/historySlice'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  const d = payload[0].payload
  return (
    <div className="glass-card px-4 py-3 text-sm shadow-neon-cyan">
      <div className="text-text-muted font-mono text-xs mb-1.5">{label}</div>
      <div className="text-neon-cyan font-bold text-base mb-1">
        SM: {d.smScore.toFixed(3)}
      </div>
      <div className="text-text-muted">Avg Time: <span className="text-text-primary">{d.avgTime}s</span></div>
      <div className="text-text-muted">Level: <span className="text-neon-purple font-semibold">{d.level}</span></div>
    </div>
  )
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#00e5ff" stroke="#0a0a0f" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={10} fill="transparent" stroke="#00e5ff" strokeWidth={1} opacity={0.3} />
    </g>
  )
}

export default function ProgressGraph() {
  const data = useSelector(selectGraphData)

  if (!data.length) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[280px] text-center">
        <div className="text-4xl mb-3">📈</div>
        <div className="text-text-primary font-semibold mb-1">No sessions yet</div>
        <div className="text-text-muted text-sm">Complete your first training session to see your progress here</div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-heading mb-1">Performance History</div>
          <div className="text-text-primary font-semibold">Daily Best SM Score</div>
        </div>
        <div className="text-xs text-text-muted font-mono bg-surface px-3 py-1.5 rounded-lg border border-border">
          {data.length} {data.length === 1 ? 'day' : 'days'} tracked
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#bf5af2" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(42, 42, 58, 0.8)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#2a2a3a' }}
            tickFormatter={(date) => {
              const d = new Date(date + 'T00:00:00')
              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }}
          />

          <YAxis
            tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,229,255,0.15)', strokeWidth: 2 }} />

          <Line
            type="monotone"
            dataKey="smScore"
            stroke="url(#lineGradient)"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: '#00e5ff', stroke: '#0a0a0f', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
