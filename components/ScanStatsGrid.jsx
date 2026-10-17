'use client'

export default function ScanStatsGrid({ stats }) {
  return (
    <div className="bs-stats-grid">
      {stats.map((s) => (
        <div key={s.label} className="bs-stat-card">
          <div className="bs-stat-icon">{s.icon}</div>
          <div className="bs-stat-value">{s.value}</div>
          <div className="bs-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
