'use client'

// Sync by reel: a fake vertical feed. Watching a reel for WATCH_S seconds counts it,
// bumps your sync, and sometimes tells you which of your syncs loved it too.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { logActivity } from '@/lib/api'
import './reels.css'

const WATCH_S = 3

const REELS = [
  { emoji: '🍝', title: 'Nonna judges my carbonara', by: '@pastacrimes', tags: ['food', 'chaos'], bg: ['#ff6b6b', '#ffb36b'], viewers: 214, sync: 'Giulia' },
  { emoji: '🌌', title: '3am thoughts about the universe', by: '@stargazer', tags: ['deep', 'space'], bg: ['#2b1a6b', '#6b4bff'], viewers: 128 },
  { emoji: '🏋️', title: 'Leg day, but make it dramatic', by: '@gymtheatre', tags: ['fitness', 'comedy'], bg: ['#0f9b8e', '#5be7c4'], viewers: 342, sync: 'Sam' },
  { emoji: '🎬', title: 'Every Wes Anderson shot, ranked', by: '@symmetrylover', tags: ['cinema'], bg: ['#f7b733', '#fc4a1a'], viewers: 97, sync: 'Marco' },
  { emoji: '🐕', title: 'My dog meets snow for the first time', by: '@woofdiaries', tags: ['dogs', 'wholesome'], bg: ['#56ccf2', '#2f80ed'], viewers: 512, sync: 'Aiko' },
  { emoji: '🎸', title: 'Learning guitar: day 1 vs day 100', by: '@sixstrings', tags: ['music'], bg: ['#c33764', '#1d2671'], viewers: 176 },
  { emoji: '🌱', title: 'My plants have a group chat', by: '@leafme', tags: ['plants', 'comedy'], bg: ['#56ab2f', '#a8e063'], viewers: 89 },
  { emoji: '✈️', title: '24h in Lisbon on €50', by: '@cheapflights', tags: ['travel'], bg: ['#fd4269', '#ff9a8b'], viewers: 263, sync: 'Sam' },
]

export default function Reels() {
  const [active, setActive] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [counted, setCounted] = useState([])
  const [toast, setToast] = useState(null)
  const feed = useRef(null)
  const watched = useRef(0) // seconds on the current reel
  const countedRef = useRef(new Set())

  // which reel is on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { root: feed.current, threshold: 0.6 },
    )
    feed.current.querySelectorAll('.reel').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    watched.current = 0
  }, [active])

  // watch clock
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1)
      watched.current++
      if (watched.current !== WATCH_S || countedRef.current.has(active)) return
      countedRef.current.add(active)
      setCounted([...countedRef.current])
      logActivity(1)
      const { sync, emoji } = REELS[active]
      if (sync) {
        setToast(`${emoji} You & ${sync} both vibed with this`)
        setTimeout(() => setToast(null), 2500)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [active])

  const tasteSync = Math.min(99, 20 + counted.length * 6 + Math.floor(seconds / 4))

  return (
    <main className="reels">
      <header className="reels-hud">
        <Link href="/activities" className="reels-back">←</Link>
        <div className="reels-meter">
          <small>Sync scrolling</small>
          <div>
            <span style={{ width: `${tasteSync}%` }} />
          </div>
        </div>
        <strong>{tasteSync}%</strong>
      </header>

      {toast && <p className="reels-toast">{toast}</p>}

      <div className="reels-feed" ref={feed}>
        {REELS.map((r, i) => (
          <section
            key={r.title}
            data-i={i}
            className={`reel ${i === active ? 'on' : ''}`}
            style={{ '--a': r.bg[0], '--b': r.bg[1] }}
          >
            <span className="reel-emoji">{r.emoji}</span>

            <div className="reel-info">
              <span className="reel-viewers">👥 {r.viewers} people with your taste watched this</span>
              <h2>{r.title}</h2>
              <p>
                {r.by} · {r.tags.map((t) => `#${t}`).join(' ')}
              </p>
            </div>

            {counted.includes(i) && <span className="reel-counted">+1 sync ✓</span>}
            <div className="reel-progress">{i === active && <span key={active} />}</div>
          </section>
        ))}
      </div>
    </main>
  )
}
