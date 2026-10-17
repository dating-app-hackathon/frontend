'use client'

// /interview: wireframe only. Swap the placeholder blocks for the real UI.
// Data comes from the mock API in app/api/interview/route.js.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './interview.css'

export default function Interview() {
  const [questions, setQuestions] = useState([])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch('/api/interview')
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions))
  }, [])

  const q = questions[step]
  const isLast = step === questions.length - 1

  async function next() {
    if (!isLast) return setStep(step + 1)
    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    setResult(await res.json())
  }

  return (
    <main className="interview">
      <header className="iv-top">
        <Link href="/" className="iv-back">←</Link>
        <span className="iv-title">Interview</span>
        <span className="iv-count">{questions.length ? `${step + 1}/${questions.length}` : ''}</span>
      </header>

      <div className="iv-progress">
        <span style={{ width: `${questions.length ? ((step + 1) / questions.length) * 100 : 0}%` }} />
      </div>

      {result ? (
        <section className="iv-box iv-result">
          <small>[ RESULT ]</small>
          <h2>{result.vibe}</h2>
          <p>{result.answered} answers sent</p>
        </section>
      ) : !q ? (
        <p className="iv-loading">loading…</p>
      ) : (
        <>
          <section className="iv-box iv-media">[ VISUAL / AVATAR / ANIMATION ]</section>

          <section className="iv-question">
            <small>[ QUESTION ]</small>
            <h2>{q.text}</h2>
          </section>

          <section className="iv-options">
            {q.options.map((opt) => (
              <button
                key={opt}
                className={`iv-option ${answers[q.id] === opt ? 'selected' : ''}`}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
              >
                {opt}
              </button>
            ))}
          </section>

          <div className="iv-footer">
            <button className="iv-next" disabled={!answers[q.id]} onClick={next}>
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      )}
    </main>
  )
}
