'use client'

// 2D "embedding" of every user (a fake UMAP projection): one cluster per vibe,
// with you and your syncs highlighted. Seeded, so it looks the same every time.
// Tapping one of your syncs opens their chat.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import './sync-map.css'

const W = 320
const H = 230
const PAD = 16
const HIT = 12 // hover radius in map units, bigger than the dots

// Categorical slots 1-4 + 7 (magenta skipped: it would read as "you")
const CLUSTERS = [
  { vibe: 'Late-night Philosopher', label: 'Philosophers', color: '#2a78d6', at: [0.24, 0.3] },
  { vibe: 'Golden Retriever Energy', label: 'Golden retrievers', color: '#eb6834', at: [0.74, 0.26] },
  { vibe: 'Main Character', label: 'Main characters', color: '#1baf7a', at: [0.76, 0.74] },
  { vibe: 'Chaotic Good', label: 'Chaotic goods', color: '#eda100', at: [0.28, 0.76] },
  { vibe: 'Soft Launch', label: 'Soft launchers', color: '#6250d6', at: [0.52, 0.5] },
]

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePoints() {
  const rand = rng(7)
  const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand())
  const points = []
  CLUSTERS.forEach((c, ci) => {
    // a few sub-blobs per cluster, so it looks like a real projection
    for (let b = 0; b < 3; b++) {
      const cx = c.at[0] + (rand() - 0.5) * 0.14
      const cy = c.at[1] + (rand() - 0.5) * 0.14
      const sx = 0.025 + rand() * 0.03
      const sy = 0.025 + rand() * 0.03
      for (let n = 0; n < 22; n++) {
        points.push({ c: ci, x: cx + gauss() * sx, y: cy + gauss() * sy, from: [rand(), rand()] })
      }
    }
  })
  return points.map((p) => ({ ...p, x: Math.min(1, Math.max(0, p.x)), y: Math.min(1, Math.max(0, p.y)) }))
}

const toX = (x) => PAD + x * (W - 2 * PAD)
const toY = (y) => PAD + y * (H - 2 * PAD)
const clusterOf = (vibe) => Math.max(0, CLUSTERS.findIndex((c) => c.vibe === vibe))
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

export default function SyncMap({ yourVibe, syncs }) {
  const router = useRouter()
  const points = useMemo(makePoints, [])
  const [settled, setSettled] = useState(false)
  const [tip, setTip] = useState(null)
  const svg = useRef(null)

  useEffect(() => {
    // let the scattered start positions paint first, then converge
    const id = setTimeout(() => setSettled(true), 80)
    return () => clearTimeout(id)
  }, [])

  const you = clusterOf(yourVibe)
  const youAt = CLUSTERS[you].at
  // each sync sits in their own cluster, on the edge facing you; higher syncs lean further out toward you
  const people = syncs.map((s, i) => {
    const c = clusterOf(s.vibe)
    const gap = 1 - s.sync / 100
    const side = i % 2 ? 1 : -1
    const pull = 0.04 + Math.max(0, s.sync - 75) * 0.004
    const at = c === you ? [youAt[0] + side * (0.05 + gap * 0.3), youAt[1] - 0.06 - gap * 0.15] : lerp(CLUSTERS[c].at, youAt, pull)
    return { ...s, c, at }
  })

  // cluster labels sit just above each cluster, or below it if that would cover a person
  const highlighted = [youAt, ...people.map((p) => p.at)]
  const near = (x, y) => highlighted.some(([px, py]) => Math.abs(toX(px) - x) < 50 && Math.abs(toY(py) - y) < 16)
  const labels = CLUSTERS.map((c, ci) => {
    const mine = points.filter((p) => p.c === ci)
    const xs = mine.map((p) => p.x)
    const ys = mine.map((p) => p.y)
    const x = toX((Math.min(...xs) + Math.max(...xs)) / 2)
    const above = toY(Math.min(...ys)) - 7
    return { ...c, x, y: near(x, above) ? toY(Math.max(...ys)) + 14 : above }
  })

  // name tags go beside the dot, flipped to the left near the right edge
  const tag = ([x, y]) => (toX(x) > W - 60 ? { x: toX(x) - 10, y: toY(y) + 3.5, textAnchor: 'end' } : { x: toX(x) + 10, y: toY(y) + 3.5, textAnchor: 'start' })

  const marks = [
    ...points.map((p) => ({ x: p.x, y: p.y, label: `Someone · ${CLUSTERS[p.c].label}` })),
    { x: youAt[0], y: youAt[1], label: `You · ${CLUSTERS[you].label}` },
    ...people.map((p) => ({ x: p.at[0], y: p.at[1], id: p.id, label: `${p.name} · ${p.sync}% in sync · tap to chat` })),
  ]

  function nearest(e) {
    const r = svg.current.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * W
    const my = ((e.clientY - r.top) / r.height) * H
    let best = null
    let bestD = HIT
    // highlighted marks are last and win ties, so loop backwards
    for (let i = marks.length - 1; i >= 0; i--) {
      const d = Math.hypot(toX(marks[i].x) - mx, toY(marks[i].y) - my)
      if (d < bestD) [best, bestD] = [marks[i], d]
    }
    return best
  }

  function onMove(e) {
    const best = nearest(e)
    setTip(best && { left: (toX(best.x) / W) * 100, top: (toY(best.y) / H) * 100, label: best.label })
  }

  function onClick(e) {
    const best = nearest(e)
    if (best?.id) router.push(`/chat/${best.id}`)
  }

  return (
    <figure className="syncmap">
      <div className="syncmap-plot">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Map of all users by vibe. You are among the ${CLUSTERS[you].label}. ${people
            .map((p) => `${p.name}: ${p.sync}% in sync, among the ${CLUSTERS[p.c].label}`)
            .join('. ')}.`}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setTip(null)}
          onClick={onClick}
        >
          <g className="syncmap-dots">
            {points.map((p, i) => (
              <circle
                key={i}
                r="3.2"
                fill={CLUSTERS[p.c].color}
                style={{
                  transform: `translate(${toX(settled ? p.x : p.from[0])}px, ${toY(settled ? p.y : p.from[1])}px)`,
                  transitionDelay: `${(i % 30) * 15}ms`,
                }}
              />
            ))}
          </g>

          {labels.map((l) => (
            <text key={l.vibe} x={l.x} y={l.y} className="syncmap-cluster">
              {l.label}
            </text>
          ))}

          <g className={`syncmap-pair ${settled ? 'on' : ''}`}>
            {people.map((p) => (
              <line key={p.id} x1={toX(youAt[0])} y1={toY(youAt[1])} x2={toX(p.at[0])} y2={toY(p.at[1])} />
            ))}

            {people.map((p) => (
              <g key={p.id} className="syncmap-person">
                <circle cx={toX(p.at[0])} cy={toY(p.at[1])} r="6" className="syncmap-them" />
                <text {...tag(p.at)} className="syncmap-name">
                  {p.name}
                </text>
              </g>
            ))}

            <circle cx={toX(youAt[0])} cy={toY(youAt[1])} r="6" className="syncmap-ping" />
            <circle cx={toX(youAt[0])} cy={toY(youAt[1])} r="7" className="syncmap-you" />
            <text {...tag(youAt)} className="syncmap-name">
              You
            </text>
          </g>
        </svg>

        {tip && (
          <span className="syncmap-tip" style={{ left: `${tip.left}%`, top: `${tip.top}%` }}>
            {tip.label}
          </span>
        )}
      </div>

      <figcaption>
        <ul className="syncmap-legend">
          {CLUSTERS.map((c) => (
            <li key={c.vibe}>
              <i style={{ background: c.color }} />
              {c.label}
            </li>
          ))}
        </ul>
        <p>
          <strong>You're among the {CLUSTERS[you].label.toLowerCase()}.</strong> Every dot is a person, placed by voice,
          words, brain activity and taste. Lines connect you to your syncs. Tap someone to chat.
        </p>
      </figcaption>
    </figure>
  )
}
