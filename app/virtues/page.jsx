'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveProfile } from '@/lib/api'
import '../form.css'
import './virtues.css'

const DEGREES = ['High school', "Bachelor's", "Master's", 'PhD', 'School of life']
const GYM = [
  ['rat', '🏋️', 'Gym-rat', 'Leg day is every day.'],
  ['sometimes', '🚶', 'I do that sometimes', 'When the vibe is right.'],
  ['perfect', '💅', "Nah, I'm perfect as-is", 'Nature did the work.'],
]
const LANGUAGES = ['English', 'Italian', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese', 'Arabic', 'Hindi', 'Japanese']

const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

export default function Virtues() {
  const router = useRouter()
  const [job, setJob] = useState('')
  const [degree, setDegree] = useState(null)
  const [field, setField] = useState('')
  const [gym, setGym] = useState(null)
  const [languages, setLanguages] = useState([])
  const [extraLanguages, setExtraLanguages] = useState([])
  const [newLanguage, setNewLanguage] = useState('')
  const [saving, setSaving] = useState(false)

  const valid = job.trim() && degree && gym && languages.length

  function addLanguage(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const lang = newLanguage.trim()
    if (lang && ![...LANGUAGES, ...extraLanguages].includes(lang)) setExtraLanguages([...extraLanguages, lang])
    if (lang && !languages.includes(lang)) setLanguages([...languages, lang])
    setNewLanguage('')
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    await saveProfile({ job: job.trim(), degree, degreeField: field.trim(), gym, languages })
    router.push('/bio')
  }

  return (
    <form className="form-page" onSubmit={submit}>
      <Link href="/profile" className="back">←</Link>

      <h1>
        My <span className="pink">virtues</span>.
      </h1>
      <p className="lead">The stuff your mum brags about.</p>

      <label className="field">
        <span className="field-label">01 · What do you do?</span>
        <input value={job} onChange={(e) => setJob(e.target.value)} placeholder="Barista, CEO, professional napper…" />
      </label>

      <section className="field">
        <span className="field-label">02 · Highest degree</span>
        <div className="chips">
          {DEGREES.map((d) => (
            <button key={d} type="button" className={`chip ${degree === d ? 'on' : ''}`} onClick={() => setDegree(d)}>
              {d}
            </button>
          ))}
        </div>
        {degree && degree !== 'School of life' && (
          <input className="small" value={field} onChange={(e) => setField(e.target.value)} placeholder="In what? (optional)" />
        )}
      </section>

      <section className="field">
        <span className="field-label">03 · Do you go to the gym?</span>
        <div className="gym-options">
          {GYM.map(([id, emoji, title, sub]) => (
            <button key={id} type="button" className={`gym-option ${gym === id ? 'on' : ''}`} onClick={() => setGym(id)}>
              <span className="gym-emoji">{emoji}</span>
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="field">
        <span className="field-label">04 · Languages you speak</span>
        <div className="chips">
          {[...LANGUAGES, ...extraLanguages].map((l) => (
            <button
              key={l}
              type="button"
              className={`chip ${languages.includes(l) ? 'on' : ''}`}
              onClick={() => setLanguages(toggle(languages, l))}
            >
              {l}
            </button>
          ))}
        </div>
        <input
          className="small"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
          onKeyDown={addLanguage}
          placeholder="+ add another, press enter"
          enterKeyHint="done"
        />
      </section>

      <div className="cta-bar">
        <button className="cta" disabled={!valid || saving}>
          {saving ? 'Syncing…' : <>Next up <span>→</span></>}
        </button>
      </div>
    </form>
  )
}
