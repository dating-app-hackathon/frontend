'use client'

// Drag-to-pick colour spectrum, pink (0) → blue (1) through every colour in between.
// Pass a number (0–1) for one thumb, or a [from, to] pair for a range.
// `every` hides the thumbs and lights the whole bar up.

import { useRef } from 'react'
import './Spectrum.css'

const NAMES = ['Neon Pink', 'Hot Coral', 'Sunset Amber', 'Lime Fizz', 'Mint Wave', 'Aqua Dream', 'Ocean Blue']
const HUE_START = 340 // pink
const HUE_SPAN = 240 // ...wrapping through red, yellow, green, to blue (220)

export const shade = (p) => `hsl(${Math.round(HUE_START + p * HUE_SPAN) % 360} 95% 62%)`
export const RAINBOW = `conic-gradient(${Array.from({ length: 7 }, (_, i) => `hsl(${i * 60} 95% 62%)`).join(', ')})`
export const shadeName = (p) => NAMES[Math.min(NAMES.length - 1, Math.floor(p * NAMES.length))]

const GRADIENT = `linear-gradient(90deg, ${Array.from({ length: 12 }, (_, i) => shade(i / 11)).join(', ')})`
const RAINBOW_BAR = RAINBOW.replace('conic-gradient(', 'linear-gradient(90deg, ') // loops seamlessly
const clamp = (p) => Math.min(1, Math.max(0, p))

export default function Spectrum({ value, onChange, label, every = false }) {
  const bar = useRef(null)
  const dragging = useRef(null)
  const isRange = Array.isArray(value)
  const vals = isRange ? value : [value]

  const posFrom = (e) => {
    const r = bar.current.getBoundingClientRect()
    return clamp((e.clientX - r.left) / r.width)
  }

  const set = (i, p) => {
    if (!isRange) return onChange(p)
    onChange(i === 0 ? [Math.min(p, value[1]), value[1]] : [value[0], Math.max(p, value[0])])
  }

  const onPointerDown = (e) => {
    const p = posFrom(e)
    const i = isRange && Math.abs(p - vals[1]) < Math.abs(p - vals[0]) ? 1 : 0
    dragging.current = i
    bar.current.setPointerCapture(e.pointerId)
    set(i, p)
  }

  const onPointerMove = (e) => {
    if (dragging.current !== null) set(dragging.current, posFrom(e))
  }

  const onKeyDown = (i) => (e) => {
    const step = { ArrowLeft: -0.02, ArrowRight: 0.02 }[e.key]
    if (step) set(i, clamp(vals[i] + step))
  }

  return (
    <div
      ref={bar}
      className={`spectrum ${every ? 'every' : ''}`}
      style={{ background: every ? RAINBOW_BAR : GRADIENT }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (dragging.current = null)}
    >
      {isRange && !every && (
        <>
          <div className="spectrum-dim" style={{ left: 0, width: `${vals[0] * 100}%` }} />
          <div className="spectrum-dim" style={{ right: 0, width: `${(1 - vals[1]) * 100}%` }} />
        </>
      )}
      {!every && vals.map((v, i) => (
        <span
          key={i}
          className="spectrum-thumb"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuenow={Math.round(v * 100)}
          style={{ left: `${v * 100}%`, background: shade(v) }}
          onKeyDown={onKeyDown(i)}
        />
      ))}
    </div>
  )
}
