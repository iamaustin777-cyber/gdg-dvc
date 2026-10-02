import { useEffect, useMemo, useRef } from 'react'
import { roadmap } from '../data.js'
import './blocks.css'

// "Road to Hackathon Day"：一条真正的时间线
// 9 个里程碑排在一条横轴上，三个阶段在上方分段标注；已完成的实心、未完成的空心
// 走过的部分用蓝色填满，到"Now"为止；下一项高亮；右上角倒数还剩多少天
// 进场：轴线按完成度从左往右画出，节点依次出现
const HACKATHON = new Date('2027-02-27T09:00:00')

export default function Timeline() {
  const ref = useRef(null)
  const flat = useMemo(() => roadmap.flatMap((ph, p) => ph.items.map((it) => ({ ...it, phase: p }))), [])
  const doneCount = flat.filter((it) => it.done).length
  const nextIndex = doneCount < flat.length ? doneCount : -1
  // "Now" 落在最后一个已完成节点和下一个节点之间
  const progress = flat.length > 1 ? Math.min(1, (doneCount - 0.5) / (flat.length - 1)) : 0
  const days = Math.max(0, Math.ceil((HACKATHON - new Date()) / 86400000))

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { el.classList.add('is-in'); io.disconnect() }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="tl" ref={ref} style={{ '--n': flat.length, '--prog': progress }}>
      <div className="tl__head">
        <h3 className="tl__title">Road to Hackathon Day</h3>
        <p className="tl__count">
          <span className="tl__days">{days}</span>
          <span className="tl__unit">days to go<br />Sat · Feb 27, 2027</span>
        </p>
      </div>

      {/* 阶段分段：每段覆盖 3 个节点 */}
      <ol className="tl__phases" aria-hidden>
        {roadmap.map((ph, p) => (
          <li key={ph.phase} style={{ gridColumn: `${p * 3 + 1} / span ${ph.items.length}` }}>{ph.phase}</li>
        ))}
      </ol>

      <div className="tl__track">
        <i className="tl__rail" />
        <i className="tl__fill" />
        <span className="tl__now" style={{ left: `${progress * 100}%` }}>Now</span>
      </div>

      <ol className="tl__nodes">
        {flat.map((it, i) => {
          const label = it.t.replace(/ · .*$/, '')
          const date = it.date ? new Date(`${it.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
          const state = it.done ? 'is-done' : i === nextIndex ? 'is-next' : ''
          const last = i === flat.length - 1
          return (
            <li key={it.t} className={`tl__node ${state} ${last ? 'is-goal' : ''}`} style={{ '--i': i }}>
              <i className="tl__dot" aria-hidden />
              <span className="tl__label">{label}</span>
              <span className="tl__meta">{it.done ? 'Done' : i === nextIndex ? 'Up next' : date || '—'}</span>
              {last && <i className="tl__flag pix4" aria-hidden><b /><b /><b /><b /></i>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
