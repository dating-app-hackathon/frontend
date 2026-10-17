'use client'

export default function HRBlob({ state }) {
  // state: 'idle' | 'speaking' | 'listening' | 'thinking' | 'done'
  return (
    <div className={`hr-blob-wrap ${state}`}>
      <div className="hr-ring" />
      <div className="hr-ring" />
      <div className="hr-blob-glow" />
      <div className="hr-blob" />
    </div>
  )
}
