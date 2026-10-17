import Link from 'next/link'
import './intro.css'

const POINTS = [
  ["You're not here for matching.", "Matches happen. They're a side effect, not the goal."],
  ["It's all about your personality.", 'Who you are shows up before what you look like.'],
  ['Zero judgment, full vibe.', 'No likes, no rejections, no scoreboards. Just conversations that feel right.'],
]

export default function Intro() {
  return (
    <main className="intro">
      <Link href="/" className="intro-back">←</Link>

      <h1>
        Dating shouldn't feel like being <s>judged</s>.
      </h1>
      <p className="intro-lead">
        It's about showing the <em>best version</em> of yourself.
      </p>

      <ol className="intro-points">
        {POINTS.map(([title, text], i) => (
          <li key={title}>
            <span className="intro-num">{i + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="cta-bar">
        <Link href="/profile" className="cta">
          I'm in <span>→</span>
        </Link>
      </div>
    </main>
  )
}
