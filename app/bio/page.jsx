'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveProfile } from '@/lib/api'
import '../form.css'
import './bio.css'

const MAX = 400
const PROMPTS = ['My hot take is ', 'Ask me about ', 'Perfect Sunday: ', "I'll never shut up about ", 'Green flag: ']
const RING = 2 * Math.PI * 16 // circumference of the counter ring

export default function Bio() {
  const router = useRouter()
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  const left = MAX - bio.length
  const addPrompt = (p) => setBio((b) => `${b}${b && !b.endsWith('\n') ? '\n' : ''}${p}`.slice(0, MAX))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    await saveProfile({ bio: bio.trim() })
    router.push('/interview')
  }

  return (
    <form className="form-page" onSubmit={submit}>
      <Link href="/virtues" className="back">←</Link>

      <h1>
        In your <span className="pink">own words</span>.
      </h1>
      <p className="lead">No CV, no pick-up lines. Just you, in {MAX} characters.</p>

      <section className="field">
        <div className="bio-box">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX}
            rows={8}
            placeholder="I'm the kind of person who…"
          />
          <div className={`bio-counter ${left <= 40 ? 'warn' : ''}`}>
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" className="track" />
              <circle
                cx="20"
                cy="20"
                r="16"
                className="fill"
                strokeDasharray={RING}
                strokeDashoffset={RING * (left / MAX)}
              />
            </svg>
            <span>{left}</span>
          </div>
        </div>
      </section>

      <section className="field">
        <span className="field-label">Stuck? Steal a starter</span>
        <div className="chips">
          {PROMPTS.map((p) => (
            <button key={p} type="button" className="chip" onClick={() => addPrompt(p)}>
              {p.trim()}…
            </button>
          ))}
        </div>
      </section>

      <div className="cta-bar">
        <button className="cta" disabled={!bio.trim() || saving}>
          {saving ? 'Syncing…' : <>That's my vibe <span>→</span></>}
        </button>
      </div>
    </form>
  )
}
