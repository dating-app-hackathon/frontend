'use client'

export default function HRBlob({ state }) {
  // state: 'idle' | 'speaking' | 'listening' | 'thinking'
  return (
    <div className={`hr-blob-wrap ${state}`}>
      <div className="hr-blob" />
      <div className="hr-blob-glow" />
    </div>
  )
}
