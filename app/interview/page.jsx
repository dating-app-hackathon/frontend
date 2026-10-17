'use client'

// /interview: a live voice "vibe check". The interviewer blob asks questions out loud,
// the person answers by talking. Conversation logic lives in hooks/useHRConversation,
// the speech engine in lib/voice, camera/mic analysis in components/LiveStreamPanel,
// simulated EEG in components/EEGPanel + lib/eeg.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import HRBlob from '@/components/HRBlob'
import EEGPanel from '@/components/EEGPanel'
import HeartRate from '@/components/HeartRate'
import { useHRConversation } from '@/hooks/useHRConversation'
import '@/components/hr-blob.css'
import './interview.css'

const LiveStreamPanel = dynamic(() => import('@/components/LiveStreamPanel'), { ssr: false })

const STATE_LABEL = {
  speaking: 'Talking…',
  listening: 'Your turn, go ahead',
  thinking: 'Hmm…',
}

const CHECKLIST = [
  ['🎙️', 'Mic on', "It's a conversation, not a form."],
  ['📷', 'Camera on', 'We read the vibe, not your looks.'],
  ['🤫', 'Somewhere quiet-ish', 'Five questions, about three minutes.'],
]

export default function Interview() {
  const { state, aiText, step, total, result, start, stop, skip } = useHRConversation()
  const [started, setStarted] = useState(false)
  const live = started && state !== 'done'

  // Escape hatch for demos and testing: Esc (or the skip button) jumps to the result
  useEffect(() => {
    if (!live) return
    const onKey = (e) => e.key === 'Escape' && skip()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [live, skip])

  function begin() {
    setStarted(true)
    start()
  }

  function end() {
    stop()
    setStarted(false)
  }

  return (
    <main className={`interview ${live ? 'live' : ''} ${!started ? 'intro' : ''}`}>
      <header className="iv-top">
        <Link href="/bodyscan" className="iv-back">←</Link>
        {live ? (
          <span className="iv-live">
            <i /> LIVE
          </span>
        ) : (
          <span className="iv-title">Vibe check</span>
        )}
        <span className="iv-count">{live && total ? `${Math.min(step + 1, total)}/${total}` : ''}</span>
      </header>

      {/* always rendered (empty before the call) so the sphere doesn't jump when it starts */}
      <div className="iv-progress">
        {live &&
          Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < step ? 'done' : i === step ? 'now' : ''} />
          ))}
      </div>

      <section className="iv-stage">
        <HRBlob state={live ? state : result ? 'speaking' : 'idle'} />
        {live && <p className="iv-state">{STATE_LABEL[state]}</p>}
      </section>

      {!started && (
        <section className="iv-intro">
          <h1>
            Let's talk.
            <br />
            <span className="pink">For real.</span>
          </h1>
          <p>No right answers. We just want to hear the real you, out loud.</p>
          <ul>
            {CHECKLIST.map(([emoji, title, sub]) => (
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

      {live && (
        <section className="iv-talk">
          {aiText && (
            <p key={aiText} className="iv-caption">
              {aiText}
            </p>
          )}
        </section>
      )}

      {live && <LiveStreamPanel />}
      {live && <HeartRate />}
      {live && <EEGPanel focused={state === 'listening'} />}

      {state === 'done' && result && (
        <section className="iv-result">
          <span className="iv-result-emoji">{result.emoji}</span>
          <small>your vibe</small>
          <h2>{result.vibe}</h2>
          <p>{result.description}</p>
          <div className="iv-meter">
            <span style={{ width: `${result.sync}%` }} />
          </div>
          <small>{result.sync}% ready to sync</small>
        </section>
      )}

      <div className="cta-bar">
        {!started && (
          <button className="cta" onClick={begin}>
            Start the vibe check <span>→</span>
          </button>
        )}
        {live && (
          <button className="iv-skip" onClick={skip}>
            Skip to result ⏭ <kbd>esc</kbd>
          </button>
        )}
        {live && (
          <button className="iv-end" onClick={end} aria-label="End the vibe check">
            ✕
          </button>
        )}
        {state === 'done' && (
          <Link href="/syncs" className="cta">
            Find my sync <span>→</span>
          </Link>
        )}
      </div>
    </main>
  )
}
