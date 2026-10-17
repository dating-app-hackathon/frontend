'use client'

export default function BodyFigureProgress({ percent }) {
  const fillHeight = (220 * percent) / 100

  return (
    <div className="bs-figure-wrap">
      <svg viewBox="0 0 100 220" className="bs-figure-svg">
        <defs>
          <clipPath id="fillClip">
            <rect x="0" y={220 - fillHeight} width="100" height={fillHeight} />
          </clipPath>
        </defs>

        <BodyShape fill="#222" stroke="#444" />

        <g clipPath="url(#fillClip)">
          <BodyShape fill="#00ff88" stroke="none" />
        </g>
      </svg>
      <p className="bs-figure-percent">{Math.round(percent)}%</p>
    </div>
  )
}

function BodyShape({ fill, stroke }) {
  return (
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
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
  )
}
