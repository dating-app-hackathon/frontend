'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import './bodyscan.css'

import ScanResultIllustration from '../../components/ScanResultIllustration'
import ScanStatsGrid from '../../components/ScanStatsGrid'
import BodyFigureProgress from '../../components/BodyFigureProgress'

const BodyScanCamera = dynamic(() => import('../../components/BodyScanCamera'), {
  ssr: false,
})

const DETECTED_TO_SCAN_DELAY_MS = 2500
const MAX_SCAN_DURATION_MS = 20000

export default function BodyScan() {
  const [phase, setPhase] = useState('intro')
  const [fullBodyDetected, setFullBodyDetected] = useState(false)
  const [percent, setPercent] = useState(0)
  const [result, setResult] = useState(null)

  const detectedRef = useRef(false)
  const phaseRef = useRef('intro')
  const lastPoseRef = useRef(null)

  const scanStartRef = useRef(null)
  const rafRef = useRef(null)
  const targetPercentRef = useRef(0)
  const percentRef = useRef(0)
  const turnStateRef = useRef({ baseline: null, sequenceIndex: 0 })
  const finishedRef = useRef(false)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const handlePoseUpdate = useCallback((pose) => {
    lastPoseRef.current = pose
    if (!pose) return

    if (phaseRef.current === 'positioning' && !detectedRef.current) {
      const scores = {}
      pose.keypoints.forEach((kp) => (scores[kp.name] = kp.score))
      const required = ['nose', 'left_shoulder', 'right_shoulder']
      const allVisible = required.every((name) => (scores[name] ?? 0) > 0.3)
      if (allVisible) {
        detectedRef.current = true
        setFullBodyDetected(true)
      }
    }

    if (phaseRef.current === 'scanning') {
      updateTurnTracking(pose)
    }
  }, [])

  function updateTurnTracking(pose) {
    const kp = {}
    pose.keypoints.forEach((k) => (kp[k.name] = k))
    const ls = kp.left_shoulder
    const rs = kp.right_shoulder
    const nose = kp.nose
    if (!ls || !rs || ls.score < 0.3 || rs.score < 0.3) return

    const shoulderWidth = Math.abs(ls.x - rs.x)
    const st = turnStateRef.current

    if (st.baseline == null) {
      st.baseline = shoulderWidth || 1
      return
    }

    const ratio = shoulderWidth / st.baseline
    const noseVisible = (nose?.score ?? 0) > 0.35
    const isProfile = ratio < 0.55
    const isFacing = ratio > 0.75

    switch (st.sequenceIndex) {
      case 0:
        if (isProfile) st.sequenceIndex = 1
        break
      case 1:
        if (isFacing && !noseVisible) st.sequenceIndex = 2
        break
      case 2:
        if (isProfile) st.sequenceIndex = 3
        break
      case 3:
        if (isFacing && noseVisible) st.sequenceIndex = 4
        break
      default:
        break
    }

    const milestonePercent = (st.sequenceIndex / 4) * 100
    if (milestonePercent > targetPercentRef.current) {
      targetPercentRef.current = milestonePercent
    }
  }

  useEffect(() => {
    if (phase !== 'positioning' || !fullBodyDetected) return
    const timer = setTimeout(() => setPhase('scanning'), DETECTED_TO_SCAN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [phase, fullBodyDetected])

  useEffect(() => {
    if (phase !== 'scanning') return

    scanStartRef.current = Date.now()
    targetPercentRef.current = 0
    percentRef.current = 0
    finishedRef.current = false
    turnStateRef.current = { baseline: null, sequenceIndex: 0 }

    if (lastPoseRef.current) {
      const kp = {}
      lastPoseRef.current.keypoints.forEach((k) => (kp[k.name] = k))
      const ls = kp.left_shoulder
      const rs = kp.right_shoulder
      if (ls && rs) {
        turnStateRef.current.baseline = Math.abs(ls.x - rs.x) || 1
      }
    }

    function tick() {
      const elapsed = Date.now() - scanStartRef.current
      const timeFallback = Math.min(100, (elapsed / MAX_SCAN_DURATION_MS) * 100)
      const target = Math.max(targetPercentRef.current, timeFallback)

      percentRef.current += (target - percentRef.current) * 0.1
      if (target >= 100 && percentRef.current > 98) {
        percentRef.current = 100
      }
      setPercent(percentRef.current)

      if (percentRef.current >= 100) {
        if (!finishedRef.current) {
          finishedRef.current = true
          finishScan()
        }
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase])

  async function finishScan() {
    setPhase('complete')
    const res = await fetch('/api/bodyscan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    const data = await res.json()
    setResult(data)
  }

  function startPositioning() {
    detectedRef.current = false
    setFullBodyDetected(false)
    setPhase('positioning')
  }

  return (
    <main className={`bodyscan ${phase}`}>
      <header className="bs-top">
        <Link href="/bio" className="bs-back">←</Link>
        <span className="bs-title">Body scan</span>
        <span className="bs-step">
          {phase === 'positioning' && '1/2'}
          {phase === 'scanning' && '2/2'}
        </span>
      </header>

      {phase === 'intro' && (
        <section className="bs-intro">
          <div className="bs-intro-figure">
            <ScanResultIllustration />
          </div>
          <h1>
            Full body
            <br />
            <span className="pink">scan.</span>
          </h1>
          <p>Not for looks. For how you move and carry yourself. It stays private and only sharpens your syncs.</p>
          <ul>
            {[
              ['📏', 'Stand about 1.5 m away', 'Prop your phone up somewhere steady.'],
              ['🖼️', 'Whole body in frame', 'Head to feet, nothing cropped.'],
              ['🔄', 'Turn slowly, 360°', 'One full circle and you are done.'],
            ].map(([emoji, title, sub]) => (
              <li key={title}>
                <span>{emoji}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(phase === 'positioning' || phase === 'scanning') && (
        <section className="bs-scan">
          <h2>{phase === 'positioning' ? 'Step back until we see all of you' : 'Now turn slowly, all the way round'}</h2>
          <p>
            {phase === 'positioning'
              ? 'About 1.5 m from the camera, head to feet in frame.'
              : 'Keep turning in a full circle until the figure fills up.'}
          </p>

          <div className="bs-camera">
            <BodyScanCamera active={true} onPoseUpdate={handlePoseUpdate} />
            {phase === 'scanning' && <BodyFigureProgress percent={percent} />}
          </div>

          {phase === 'positioning' && (
            <p className={`bs-status ${fullBodyDetected ? 'ok' : ''}`}>
              {fullBodyDetected ? '✓ Got you! Get ready to turn…' : 'Looking for you…'}
            </p>
          )}
        </section>
      )}

      {phase === 'complete' && (
        <section className="bs-complete">
          <ScanResultIllustration />
          <small>Scan complete</small>

          {result ? (
            <>
              <h2>{result.bodyType}</h2>
              <p className="bs-result-blurb">{result.bodyBlurb}</p>
              <ScanStatsGrid
                stats={[
                  { icon: '📐', value: `${result.symmetry}%`, label: 'Symmetry' },
                  { icon: '🧘', value: result.posture, label: 'Posture' },
                  { icon: '✨', value: 'High', label: 'Sync confidence' },
                ]}
              />
            </>
          ) : (
            <p className="bs-result-blurb">Processing your scan…</p>
          )}
        </section>
      )}

      <div className="cta-bar">
        {phase === 'intro' && (
          <button className="cta" onClick={startPositioning}>
            Start the scan <span>→</span>
          </button>
        )}
        {phase === 'complete' && result && (
          <Link href="/interview" className="cta">
            Next: the vibe check <span>→</span>
          </Link>
        )}
      </div>
    </main>
  )
}
