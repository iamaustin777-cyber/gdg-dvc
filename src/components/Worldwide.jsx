import { useEffect, useMemo, useRef, useState } from 'react'
import Heading from './Heading.jsx'
import Globe, { DVC, REGION_COLORS, ZOOM_MAX } from './Globe.jsx'
import stats from '../globe-stats.json'
import './globe.css'

// GDG 全球分部：左边点阵地球（可以放大），右边一块像素方格（一格 = 10 个分部）+ 一句话写出各地区的数量
// 悬停 / 点句子里的某个地区 → 地球转过去，方格和句子里其它地区变暗
// 数据来自 gdg.community.dev 官方分部列表，由 scripts/build-globe-data.py 生成：
//   src/globe-stats.json（标题和数字，随网站打包）+ public/data/gdg-globe.json（地球的点，快滚到这一节时才下载）
const fmt = (n) => n.toLocaleString('en-US')
// 句子里每个地区前面的介词
const PHRASE = [['in', 'North America'], ['in', 'Latin America'], ['across', 'Europe, the Middle East & North Africa'], ['in', 'Sub-Saharan Africa'], ['in', 'Asia & Oceania']]
const ROWS = 9

export default function Worldwide() {
  const ref = useRef(null)
  const [data, setData] = useState(null)
  const [focus, setFocus] = useState(null) // 当前地区（悬停或点选）
  const [pinned, setPinned] = useState(null) // 点选后固定，再点一次取消
  const [hover, setHover] = useState(null) // 悬停的分部
  const [zoom, setZoom] = useState(1)
  const api = useRef(null)
  // 像素方格：每格 10 个分部，一列一列往下填；每个地区从新的一列开始，地区之间空一列，五块一眼分得开
  const cells = useMemo(() => stats.regions.flatMap((r, i) => {
    const n = Math.round(r.count / 10)
    const cols = Math.ceil(n / ROWS)
    const pad = cols * ROWS - n + (i < stats.regions.length - 1 ? ROWS : 0)
    return [...Array.from({ length: n }, () => i), ...Array.from({ length: pad }, () => -1)]
  }), [])

  // 离这一节还有约一屏时才去下载地球数据
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let done = false
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting || done) return
      done = true
      io.disconnect()
      fetch('data/gdg-globe.json').then((r) => r.json()).then(setData).catch(() => {})
    }, { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const open = (c) => window.open(`https://gdg.community.dev${c[6]}`, '_blank', 'noopener')
  const active = focus ?? pinned

  return (
    <section className="panel" id="worldwide" ref={ref}>
      <Heading
        tag="Worldwide"
        title={`${fmt(stats.total)} chapters. We’re one of them.`}
        sub={`Google Developer Groups meet in ${stats.countries} countries. Every dot on the globe is a chapter — drag it to spin, hover a dot, click to visit.`}
      />

      <div className="ww" data-reveal>
        <div className="ww__stage">
          <Globe
            data={data}
            focus={active}
            onHover={setHover}
            onPick={open}
            onZoom={setZoom}
            api={api}
            className={data ? 'is-ready' : ''}
          />
          {/* 底部一行：左边是悬停的分部（触屏点一下之后可以点开），右边是缩放 */}
          <div className="ww__bar code">
            <p className="ww__status" aria-live="polite">
              {hover ? (
                <button type="button" onClick={() => open(hover)}>
                  <i style={{ background: REGION_COLORS[hover[2]] }} />
                  <span className="ww__name">{hover[3]}</span>
                  <span className="ww__city">{[hover[4], hover[5]].filter(Boolean).join(', ')}</span>
                  <span className="ww__go">open ↗</span>
                </button>
              ) : (
                <span className="ww__idle"><b className="c-green">$</b> drag to spin · pinch or ⌘ scroll to zoom</span>
              )}
            </p>
            <div className="ww__zoom">
              <button type="button" onClick={() => api.current?.zoomBy(1 / 1.6)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
              <button type="button" className="ww__level" onClick={() => api.current?.reset()} disabled={zoom <= 1} aria-label="Reset zoom">
                {zoom.toFixed(1)}×
              </button>
              <button type="button" onClick={() => api.current?.zoomBy(1.6)} disabled={zoom >= ZOOM_MAX} aria-label="Zoom in">+</button>
            </div>
          </div>
        </div>

        <div className={`ww__side ${active != null ? 'has-on' : ''}`} onMouseLeave={() => setFocus(null)}>
          <p className="ww__home">
            <i className="pix4" aria-hidden><b /><b /><b /><b /></i>
            <span><strong>{DVC.name}</strong> · {DVC.city}</span>
          </p>

          {/* 像素方格：一格 = 10 个分部 */}
          <div className="ww__grid" style={{ '--rows': ROWS }} aria-hidden>
            {cells.map((r, k) => (
              <i key={k} className={r < 0 ? 'is-gap' : active === r ? 'is-on' : ''} style={{ '--c': REGION_COLORS[r] ?? 'transparent', '--k': k }} />
            ))}
          </div>
          <p className="ww__key code"><i /> = 10 chapters</p>

          {/* 一句话：数字 + 地区就是可以点的词 */}
          <p className="ww__sentence">
            {stats.regions.map((r, i) => (
              <span key={r.name}>
                {/* 用 span 而不是 button：长的地区名可以在句子里正常换行 */}
                <span
                  role="button"
                  tabIndex={0}
                  className={`ww__word ${active === i ? 'is-on' : ''}`}
                  style={{ '--c': REGION_COLORS[i] }}
                  onMouseEnter={() => setFocus(i)}
                  onFocus={() => setFocus(i)}
                  onBlur={() => setFocus(null)}
                  onClick={() => setPinned((p) => (p === i ? null : i))}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPinned((p) => (p === i ? null : i)) } }}
                  aria-pressed={pinned === i}
                >
                  <b>{fmt(r.count)}</b> {PHRASE[i][0]} {PHRASE[i][1]}
                </span>
                {i < stats.regions.length - 2 ? ', ' : i === stats.regions.length - 2 ? ' and ' : '.'}
              </span>
            ))}
          </p>

          <p className="ww__src code">
            source · <a href="https://gdg.community.dev/chapters/" target="_blank" rel="noreferrer">gdg.community.dev/chapters</a> · {stats.updated}
          </p>
        </div>
      </div>
    </section>
  )
}
