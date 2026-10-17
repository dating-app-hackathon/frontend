'use client'

// Mock heart-rate sensor: drifts slowly toward a random target between 80 and 160 bpm.

import { useEffect, useState } from 'react'

const MIN = 80
const MAX = 160
const MAX_STEP = 2 // bpm per second, keeps the curve smooth

const rand = (a, b) => a + Math.random() * (b - a)

export default function HeartRate() {
  const [bpm, setBpm] = useState(95)

  useEffect(() => {
    let target = rand(MIN, 120)
    const id = setInterval(() => {
      if (Math.random() < 0.1) target = rand(MIN, MAX) // new mood every ~10 s
      setBpm((b) => {
        const step = Math.max(-MAX_STEP, Math.min(MAX_STEP, (target - b) * 0.2)) + rand(-0.7, 0.7)
        return Math.min(MAX, Math.max(MIN, b + step))
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="iv-heart">
      <span className="iv-heart-icon" style={{ animationDuration: `${60 / bpm}s` }}>
        ❤️
      </span>
      <strong>{Math.round(bpm)}</strong>
      <small>bpm</small>
    </div>
  )
}
