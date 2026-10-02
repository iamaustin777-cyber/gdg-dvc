import Heading from './Heading.jsx'
import { partner } from '../data.js'

const pad = (n) => String(n).padStart(2, '0')

// 与我们合作：三列编号文字（没有框）
export default function Partner() {
  return (
    <section className="panel" id="partner">
      <Heading tag="Partner With Us" title="Build something with GDG DVC" sub={partner.intro} />
      <ol className="ed-cols">
        {partner.ways.map((w, i) => (
          <li key={w.title} data-p className="rise" style={{ '--d': i }}>
            <span className={`num num--sm c-${w.color}`}>{pad(i + 1)}</span>
            <h3>{w.title}</h3>
            <p>{w.text}</p>
          </li>
        ))}
      </ol>
      <p className="note" data-reveal>
        Interested? Message us on Instagram <a href="https://instagram.com/gdgoc_dvc" target="_blank" rel="noreferrer">@gdgoc_dvc</a> or come by a Wednesday meeting.
      </p>
    </section>
  )
}
