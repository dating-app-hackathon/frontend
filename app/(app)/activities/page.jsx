'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSyncStrength } from '@/lib/api'
import './activities.css'

const ACTIVITIES = [
  {
    href: '/interview',
    emoji: '🎙️',
    title: 'Talk to the AI',
    text: 'A three-minute voice chat. We listen to how you think, not how you look.',
    boost: '+10',
  },
  {
    href: '/activities/questions',
    emoji: '✍️',
    title: 'Answer questions',
    text: 'Hot takes, soft spots, deal-breakers. Type it out.',
    boost: '+5 each',
  },
  {
    href: '/activities/reels',
    emoji: '🎞️',
    title: 'Sync by reel',
    text: 'Doom scrolling becomes sync scrolling. The more you watch, the more you sync with people who share your taste.',
    boost: '+1 per reel',
  },
  {
    href: '/activities/dilemmas',
    emoji: '🪞',
    title: 'Moral Mirror',
    text: 'Quick dilemmas from a slightly-off future. Six seconds each. We notice how long you hesitate.',
    boost: '+3 each',
  },
  {
    href: '/activities/auction',
    emoji: '🧠',
    title: 'Memory Auction',
    text: "You get 100 coins. You only keep the memories you bid on. What's worth it?",
    boost: '+8',
  },
]

export default function Activities() {
  const [strength, setStrength] = useState(null)

  useEffect(() => {
    getSyncStrength().then(setStrength)
  }, [])

  return (
    <main className="app-page">
      <h1 className="app-title">
        <span className="pink">Activities</span>
      </h1>
      <p className="app-lead">Every activity sharpens your syncs.</p>

      <section className="app-card act-strength">
        <div>
          <small>Sync strength</small>
          <strong>{strength ?? '…'}%</strong>
        </div>
        <div className="act-meter">
          <span style={{ width: `${strength ?? 0}%` }} />
        </div>
        <p>The sharper it is, the better your syncs get.</p>
      </section>

      <div className="act-list">
        {ACTIVITIES.map((a, i) => (
          <Link key={a.href} href={a.href} className="app-card act" style={{ animationDelay: `${i * 0.08}s` }}>
            <span className="act-emoji">{a.emoji}</span>
            <div className="act-body">
              <h2>{a.title}</h2>
              <p>{a.text}</p>
              <span className="act-boost">{a.boost} sync</span>
            </div>
            <span className="act-arrow">→</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
