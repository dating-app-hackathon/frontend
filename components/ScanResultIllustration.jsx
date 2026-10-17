'use client'

export default function ScanResultIllustration() {
  const points = [
    { cx: 50, cy: 28, delay: 0 },    // head/neck
    { cx: 30, cy: 55, delay: 0.1 },  // left shoulder
    { cx: 70, cy: 55, delay: 0.2 },  // right shoulder
    { cx: 50, cy: 95, delay: 0.3 },  // waist
    { cx: 32, cy: 130, delay: 0.4 }, // left hip
    { cx: 68, cy: 130, delay: 0.5 }, // right hip
    { cx: 30, cy: 180, delay: 0.6 }, // left knee
    { cx: 70, cy: 180, delay: 0.7 }, // right knee
  ]

  return (
    <div className="bs-illustration-wrap">
      <svg viewBox="0 0 100 220" className="bs-illustration-svg">
        <defs>
          <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3a2c" />
            <stop offset="100%" stopColor="#0d1f17" />
          </linearGradient>
          <radialGradient id="pointGlow">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body silhouette */}
        <path
          d="M50 10
             c8 0 14 6 14 14
             c0 6 -3 11 -7 13
             l10 10
             c10 4 16 14 16 25
             l-4 40 l-8 0 l-2 40 l-6 0
             l-3 -40 l-4 0 l-3 40 l-6 0
             l-2 -40 l-8 0 l-4 -40
             c0 -11 6 -21 16 -25
             l10 -10
             c-4 -2 -7 -7 -7 -13
             c0 -8 6 -14 14 -14 Z"
          fill="url(#bodyGradient)"
          stroke="#00ff88"
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        {/* Horizontal scan line sweep (decorative, animated) */}
        <rect
          x="10"
          y="0"
          width="80"
          height="3"
          fill="#00ff88"
          opacity="0.6"
          className="bs-scan-sweep"
        />

        {/* Glowing scan points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r="10"
              fill="url(#pointGlow)"
              className="bs-point-glow"
              style={{ animationDelay: `${p.delay}s` }}
            />
            <circle
              cx={p.cx}
              cy={p.cy}
              r="2.5"
              fill="#00ff88"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
