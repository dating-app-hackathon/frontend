'use client'

// The emoji fills with colour from the feet up as the scan progresses
export default function BodyFigureProgress({ percent }) {
  return (
    <div className="bs-figure-wrap">
      <div className="bs-figure-emoji" aria-hidden>
        <span className="empty">🧍</span>
        <span className="full" style={{ clipPath: `inset(${100 - percent}% 0 0 0)` }}>
          🧍
        </span>
      </div>
      <p className="bs-figure-percent">{Math.round(percent)}%</p>
    </div>
  )
}
