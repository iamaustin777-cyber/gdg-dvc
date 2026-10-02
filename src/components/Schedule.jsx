import { useEffect, useMemo, useRef } from 'react'
import { events } from '../data.js'
import './Schedule.css'

// 活动日程（四列）。自带样式，在 Events.jsx 里使用；改版前的纯文字四列在 _backup/before-schedule/ 里。
// - 日期拆两层：大号日期（品牌色浅色版）+ 时间 · 地点
// - 根据今天自动标出已结束（Done）和下一场（Next）；每周例会显示下一次的日期
// - 交互：进场时顶部色线从左往右画出、内容错开出现；悬停聚焦当前列、其它列变暗、色线拉满；
//         鼠标附近的背景点阵局部亮起；悬停出现"加到 Google 日历"（只对还没发生的活动）
export const pad = (n) => String(n).padStart(2, '0')
export const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const RRULE_DAY = { WE: 3 }

const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m ? `${h12}:${pad(m)} ${ap}` : `${h12} ${ap}`
}
export const timeRange = (e) => (e.start ? `${fmtTime(e.start)}–${fmtTime(e.end)}`.replace(/ (AM|PM)–(\d+(?::\d+)?) \1/, '–$2 $1') : '')
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`

// 下一次每周例会的日期（今天就是例会日且还没结束，就算今天）
export const nextWeekly = (e, now) => {
  const d = new Date(now)
  const want = RRULE_DAY[e.recur]
  const [eh, em] = e.end.split(':').map(Number)
  let add = (want - d.getDay() + 7) % 7
  if (add === 0 && (d.getHours() > eh || (d.getHours() === eh && d.getMinutes() >= em))) add = 7
  d.setDate(d.getDate() + add)
  return d
}

// Google 日历"添加活动"链接（不需要后端）
export const calendarUrl = (e, day) => {
  const q = new URLSearchParams({ action: 'TEMPLATE', text: `GDG DVC · ${e.title}`, details: e.text, ctz: 'America/Los_Angeles' })
  if (e.room) q.set('location', `Diablo Valley College, ${e.room}`)
  if (e.start) q.set('dates', `${ymd(day)}T${e.start.replace(':', '')}00/${ymd(day)}T${e.end.replace(':', '')}00`)
  else {
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    q.set('dates', `${ymd(day)}/${ymd(next)}`)
  }
  if (e.recur) q.set('recur', `RRULE:FREQ=WEEKLY;BYDAY=${e.recur}`)
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

export default function Schedule() {
  const rootRef = useRef(null)

  const items = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const list = events.list.map((e) => {
      const day = e.recur ? nextWeekly(e, now) : new Date(`${e.date}T00:00:00`)
      const done = !e.recur && day < today
      return { ...e, day, done }
    })
    // "Next"：还没发生的里面最早的一场（单次活动和每周例会一起比）
    const upcoming = list.filter((e) => !e.done).sort((a, b) => a.day - b.day)[0]
    return list.map((e) => ({ ...e, next: e === upcoming }))
  }, [])

  // 进场：进入视口后加 .is-in，CSS 按列错开播放
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { el.classList.add('is-in'); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // 鼠标附近点阵亮起：只写两个 CSS 变量，rAF 节流
  useEffect(() => {
    const el = rootRef.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return undefined
    let raf = 0, x = 0, y = 0
    const paint = () => { raf = 0; el.style.setProperty('--mx', `${x}px`); el.style.setProperty('--my', `${y}px`) }
    const move = (ev) => {
      const r = el.getBoundingClientRect()
      x = ev.clientX - r.left
      y = ev.clientY - r.top
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const leave = () => { el.style.setProperty('--mx', '-999px'); el.style.setProperty('--my', '-999px') }
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])

  return (
    <ol className="sched" ref={rootRef}>
      {items.map((e, i) => {
        const meta = [e.recur ? `Every ${DAY[RRULE_DAY[e.recur]]}` : DAY[e.day.getDay()], timeRange(e), e.room].filter(Boolean).join(' · ')
        return (
          <li key={e.title} className={`sched__col t-${e.color} ${e.done ? 'is-done' : ''} ${e.next ? 'is-next' : ''}`} style={{ '--i': i }}>
            <div className="sched__head">
              <p className="sched__date">
                {e.recur ? (
                  <>
                    <span className="sched__date-small">Next</span> {pad(e.day.getMonth() + 1)}·{pad(e.day.getDate())}
                  </>
                ) : (
                  <>{pad(e.day.getMonth() + 1)}·{pad(e.day.getDate())}</>
                )}
              </p>
              {e.done && <span className="sched__badge">Done</span>}
              {e.next && <span className="sched__badge sched__badge--next">Next</span>}
            </div>
            <p className="sched__meta">{meta}</p>
            <h3 className="sched__title">{e.title}</h3>
            <p className="sched__text">{e.text}</p>
            {!e.done && (
              <a className="sched__cal" href={calendarUrl(e, e.day)} target="_blank" rel="noreferrer">
                + Add to Google Calendar
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}
