'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLiveVibers } from '@/lib/api'
import './Landing.css'

const MANIFESTO = [
  ['Swiping is dead.', 'Thumbs are for texting. We killed the left/right lottery.'],
  ['Your vibe is your profile.', 'Music, mood, energy. Not your best selfie from 2019.'],
  ['Sync in real time.', 'When two vibes line up, you meet. No limbo, no ghosting.'],
]

export default function Landing() {
  const [vibers, setVibers] = useState(null)

  useEffect(() => {
    const tick = () => getLiveVibers().then(setVibers)
    tick()
    const id = setInterval(tick, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="landing">
      <header className="topbar">
        <span className="logo">
          Sync<span className="pink">It</span>Up<i className="dot" />
        </span>
        <button className="login">Log in</button>
      </header>

      <section className="hero">
        <h1>
          <span className="line">
            No <s className="strike">Swiping</s>,
          </span>
          <span className="line">
            just <em>Vibin'</em>.
          </span>
        </h1>
        <p className="sub">The dating app that matches frequencies, not faces.</p>
      </section>

      <section className="sync-visual" aria-hidden>
        <div className="orb orb-a">🎧</div>
        <div className="wave">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <div className="orb orb-b">🌙</div>
        <div className="badge">93% in sync</div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="track">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k}>
              NO SWIPING ✕ JUST VIBIN' ✕ NO SWIPING ✕ JUST VIBIN' ✕&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="manifesto">
        {MANIFESTO.map(([title, text], i) => (
          <article key={title}>
            <span className="num">0{i + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <p className="live">
        <i className="pulse" />
        {vibers ? `${vibers.toLocaleString()} people vibin' right now` : 'tuning in…'}
      </p>

      <div className="cta-bar">
        <Link href="/signup" className="cta">
          Start Vibin' <span>→</span>
        </Link>
      </div>
    </main>
  )
}
