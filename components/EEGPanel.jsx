'use client'

// Scrolling multi-channel EEG traces, fed by the simulator in lib/eeg.

import { useEffect, useRef } from 'react'
import { CHANNELS, SAMPLE_RATE, createEEG } from '@/lib/eeg'

const WINDOW = 640 // samples on screen (2.5 s)
const LABEL_WIDTH = 30

export default function EEGPanel({ focused }) {
  const canvasRef = useRef(null)
  const focusedRef = useRef(focused)
  focusedRef.current = focused

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const next = createEEG()
    const buffers = CHANNELS.map(() => new Float32Array(WINDOW))
    const lane = H / CHANNELS.length
    const xAt = (i) => LABEL_WIDTH + (i / (WINDOW - 1)) * (W - LABEL_WIDTH - 6)
    let head = 0
    let last = performance.now()
    let raf

    function frame(now) {
      const due = Math.min(64, Math.round(((now - last) / 1000) * SAMPLE_RATE))
      if (due > 0) last = now
      for (let k = 0; k < due; k++) {
        const sample = next(focusedRef.current)
        buffers.forEach((b, c) => (b[head] = sample[c]))
        head = (head + 1) % WINDOW
      }

      ctx.clearRect(0, 0, W, H)
      ctx.font = '700 10px "Space Grotesk", sans-serif'
      ctx.lineJoin = 'round'

      CHANNELS.forEach(({ name, color }, c) => {
        const mid = lane * (c + 0.5)
        const yAt = (v) => mid - v * lane * 0.32

        ctx.fillStyle = color
        ctx.fillText(name, 0, mid + 3)

        ctx.strokeStyle = 'rgba(22, 22, 26, 0.06)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(LABEL_WIDTH, mid)
        ctx.lineTo(W, mid)
        ctx.stroke()

        ctx.strokeStyle = color
        ctx.lineWidth = 1.3
        ctx.shadowColor = color
        ctx.shadowBlur = 0
        ctx.beginPath()
        for (let i = 0; i < WINDOW; i++) {
          const y = yAt(buffers[c][(head + i) % WINDOW])
          i ? ctx.lineTo(xAt(i), y) : ctx.moveTo(xAt(i), y)
        }
        ctx.stroke()

        // glowing "now" dot at the leading edge
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(xAt(WINDOW - 1), yAt(buffers[c][(head + WINDOW - 1) % WINDOW]), 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // fade the old end of the traces
      const fade = ctx.createLinearGradient(LABEL_WIDTH, 0, LABEL_WIDTH + 40, 0)
      fade.addColorStop(0, '#ffffff')
      fade.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = fade
      ctx.fillRect(LABEL_WIDTH, 0, 40, H)

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section className="iv-eeg">
      <header>
        <span className="iv-eeg-title">
          <i /> EEG
        </span>
        <span className={`iv-eeg-state ${focused ? 'focused' : ''}`}>{focused ? 'β focused' : 'α relaxed'}</span>
        <small>
          {CHANNELS.length} ch · {SAMPLE_RATE} Hz
        </small>
      </header>
      <canvas ref={canvasRef} />
    </section>
  )
}
