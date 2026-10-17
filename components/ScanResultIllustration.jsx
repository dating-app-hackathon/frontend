'use client'

// A standing emoji with a pink scan line sweeping over it
export default function ScanResultIllustration() {
  return (
    <div className="bs-illustration-wrap">
      <div className="bs-emoji-scan" aria-hidden>
        <span>🧍</span>
        <i className="bs-scan-sweep" />
      </div>
    </div>
  )
}
