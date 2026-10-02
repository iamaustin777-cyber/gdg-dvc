import { useEffect, useMemo, useRef, useState } from 'react'
import { events } from '../data.js'

// Hackathon 主视觉：不用照片，用一段会自己打出来的代码。
// 进入视口后逐字"打"出 hackathon.ts（内容就是这次黑客松的真实信息），打完后下面的终端自动运行，
// 一行行输出，最后一行是到黑客松的实时倒计时。右上角 ▶ Run 可以重新跑一遍。
// 语法高亮用谷歌四色的浅色版；系统开启"减少动态效果"时直接显示全部内容。
const HACK_DAY = new Date('2027-02-27T09:00:00')

// 每一行是若干 [类型, 文字]
const t = (type, text) => [type, text]
function buildLines(partners) {
  const L = []
  L.push([t('com', '// hackathon.ts — GDG on Campus DVC')])
  L.push([t('kw', 'import'), t('p', ' { '), t('v', 'gemini'), t('p', ', '), t('v', 'firebase'), t('p', ' } '), t('kw', 'from'), t('p', ' '), t('str', '"@google/dev"'), t('p', ';')])
  L.push([])
  L.push([t('kw', 'const'), t('p', ' '), t('v', 'hackathon'), t('p', ' = {')])
  L.push([t('p', '  '), t('prop', 'name'), t('p', ': '), t('str', '"Multi-Club Hackathon"'), t('p', ',')])
  L.push([t('p', '  '), t('prop', 'date'), t('p', ': '), t('str', '"2027-02-27"'), t('p', ',')])
  L.push([t('p', '  '), t('prop', 'hackers'), t('p', ': '), t('num', '100'), t('p', '+,')])
  L.push([t('p', '  '), t('prop', 'clubs'), t('p', ': [')])
  partners.forEach((c, i) => L.push([t('p', '    '), t('str', `"${c}"`), t('p', i < partners.length - 1 ? ',' : '')]))
  L.push([t('p', '  ],')])
  L.push([t('p', '};')])
  L.push([])
  L.push([t('kw', 'async function'), t('p', ' '), t('fn', 'build'), t('p', '('), t('v', 'idea'), t('p', ') {')])
  L.push([t('p', '  '), t('kw', 'const'), t('p', ' '), t('v', 'team'), t('p', ' = '), t('kw', 'await'), t('p', ' '), t('fn', 'assemble'), t('p', '('), t('v', 'idea'), t('p', ');')])
  L.push([t('p', '  '), t('kw', 'const'), t('p', ' '), t('v', 'app'), t('p', ' = '), t('kw', 'await'), t('p', ' '), t('v', 'team'), t('p', '.'), t('fn', 'ship'), t('p', '({ '), t('prop', 'with'), t('p', ': ['), t('v', 'gemini'), t('p', ', '), t('v', 'firebase'), t('p', '] });')])
  L.push([t('p', '  '), t('kw', 'return'), t('p', ' '), t('fn', 'judge'), t('p', '('), t('v', 'app'), t('p', ');')])
  L.push([t('p', '}')])
  L.push([])
  L.push([t('kw', 'for'), t('p', ' ('), t('kw', 'const'), t('p', ' '), t('v', 'idea'), t('p', ' '), t('kw', 'of'), t('p', ' '), t('fn', 'brainstorm'), t('p', '()) '), t('fn', 'build'), t('p', '('), t('v', 'idea'), t('p', ').'), t('fn', 'then'), t('p', '('), t('fn', 'celebrate'), t('p', ');')])
  return L
}

const daysLeft = () => Math.max(0, Math.ceil((HACK_DAY - new Date()) / 86400000))
const LOG = (n) => [
  ['cmd', '$ npm run hack'],
  ['dim', `▸ assembling ${n} clubs`],
  ['dim', '▸ 100+ hackers checked in'],
  ['dim', '▸ shipping with gemini + firebase'],
  ['ok', `✓ ready · Sat, Feb 27, 2027 · T-${daysLeft()} days`],
]

export default function HackCode() {
  const partners = events.featured.partners
  const lines = useMemo(() => buildLines(partners), [partners])
  const total = useMemo(() => lines.reduce((n, l) => n + l.reduce((m, [, s]) => m + s.length, 0) + 1, 0), [lines])
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [typed, setTyped] = useState(reduce ? total : 0)
  const [logs, setLogs] = useState(reduce ? LOG(partners.length).length : 0)
  const [run, setRun] = useState(0) // 每次 +1 → 重新打字 + 运行
  const ref = useRef(null)
  const started = useRef(false)

  // 进入视口后开始打字
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return undefined
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !started.current) { started.current = true; setRun((r) => r + 1) }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  // 打字：每帧打几个字；打完后终端一行行输出
  useEffect(() => {
    if (!run || reduce) return undefined
    setTyped(0)
    setLogs(0)
    let raf = 0
    let n = 0
    let last = performance.now()
    const timers = []
    const tick = (now) => {
      n = Math.min(total, n + Math.max(1, Math.round((now - last) / 7)))
      last = now
      setTyped(n)
      if (n < total) raf = requestAnimationFrame(tick)
      else LOG(partners.length).forEach((_, i) => timers.push(setTimeout(() => setLogs(i + 1), 300 + i * 420)))
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout) }
  }, [run, total, reduce, partners.length])

  // 按已打的字数切出要显示的部分
  let left = typed
  let caretLine = 0
  const shown = lines.map((l, i) => {
    if (left <= 0) return null
    const out = []
    for (const [type, s] of l) {
      if (left <= 0) break
      const part = s.slice(0, left)
      left -= part.length
      out.push(<span key={out.length} className={`hc-${type}`}>{part}</span>)
    }
    caretLine = i
    left -= 1 // 换行
    return out
  })
  const done = typed >= total
  const log = LOG(partners.length)

  return (
    <div className="hc" ref={ref}>
      <div className="hc__bar">
        <span className="hc__tab"><i className="pix4" aria-hidden><b /><b /><b /><b /></i>hackathon.ts</span>
        <button type="button" className="hc__run" onClick={() => setRun((r) => r + 1)} aria-label="Run the hackathon script again">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M2 1.2v7.6L8.6 5z" fill="currentColor" /></svg>
          Run
        </button>
      </div>
      <pre className="hc__code" aria-label="Hackathon details written as code">
        {lines.map((_, i) => (
          <div key={i} className={`hc__line ${i === caretLine && !done ? 'is-cur' : ''}`}>
            <span className="hc__ln">{String(i + 1).padStart(2, ' ')}</span>
            <code>
              {shown[i]}
              {i === caretLine && !done && <span className="hc__caret" />}
            </code>
          </div>
        ))}
      </pre>
      <div className="hc__term" aria-live="polite">
        {log.slice(0, logs).map(([type, s], i) => <p key={i} className={`hc-t-${type}`}>{s}</p>)}
        {done && logs < log.length && <span className="hc__caret" />}
      </div>
      <div className="hc__status">
        <span>main</span>
        <span>{done ? '✓ compiled' : 'typing…'}</span>
        <span className="hc__right">TypeScript · UTF-8</span>
      </div>
    </div>
  )
}
