import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Heading from './Heading.jsx'
import OptionWheel from './OptionWheel.jsx'
import GooeyNav from './GooeyNav.jsx'
import PixelMonogram from './PixelMonogram.jsx'
import TearTicket from './TearTicket.jsx'
import { adviser, team, teamSize } from '../data.js'

const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six']

const initials = (name) =>
  name.replace(/[“”"].*?[“”"]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const pad = (n) => String(n).padStart(2, '0')
// 文件名风格：Austin Cao → austin_cao.jpg（照片上方像图片查看器一样显示）
const slug = (name) => name.replace(/[“”"].*?[“”"]\s*/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
const TONES = ['blue', 'red', 'yellow', 'green']

// 票根上的条形码：按名字算出固定的粗细序列（同一个人每次都一样）
function Barcode({ seed }) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const bars = []
  let x = 0
  while (x < 104) {
    h = (h * 1103515245 + 12345) >>> 0
    const w = 1 + ((h >>> 16) % 3)
    bars.push(<rect key={x} x={x} y="0" width={w} height="44" />)
    x += w + 1 + ((h >>> 20) % 2)
  }
  return <svg className="pass__barcode" width="104" height="44" viewBox="0 0 104 44" aria-hidden>{bars}</svg>
}

// 团队：左侧 OptionWheel 弧形名单（带滚动音效），中间成员像素墙，右侧选中成员的干部证（票根可以撕下来）
// 三者联动：名单 / 像素墙 / 部门切换任意一个变了，其它跟着换人
export default function Team() {
  const members = useMemo(() => team.flatMap((d) => d.members.map((m) => ({ ...m, division: d }))), [])
  const labels = useMemo(() => members.map((m) => m.wheel || m.name), [members])
  const start = Math.max(0, members.findIndex((m) => m.name === 'Austin Cao'))
  const [idx, setIdx] = useState(start)
  const [torn, setTorn] = useState(() => new Set()) // 已经撕过票根的成员
  const idxRef = useRef(start)

  const wheelTimer = useRef(0)
  const select = useCallback((i) => {
    clearTimeout(wheelTimer.current)
    if (i === idxRef.current) return
    idxRef.current = i
    // 换人是低优先级更新：React 可以先让名单动画跑完这一帧，不会因为重新渲染而卡顿
    startTransition(() => setIdx(i))
  }, [])
  // 名单滚动时整个团队区块不跟着每一格重新渲染：转轮自己先转，停下约 0.12 秒后再同步像素墙和干部证
  const selectFromWheel = useCallback((i) => {
    clearTimeout(wheelTimer.current)
    wheelTimer.current = setTimeout(() => select(i), 120)
  }, [select])
  useEffect(() => () => clearTimeout(wheelTimer.current), [])


  // 干部证比较重（3D + 物理），名单连续滚动时不跟着每一格重建，停下约 0.18 秒后再换人 → 滚动保持顺滑
  const [shown, setShown] = useState(start)
  useEffect(() => {
    const t = setTimeout(() => setShown(idx), 80)
    return () => clearTimeout(t)
  }, [idx])
  const m = members[shown]

  // 名单字号 2.6rem；只有屏幕很窄、左栏放不下最长的名字时才自动缩小（干部证固定居中）
  // 名单里三个特别长的名字只显示"名 + 姓"（data.js 的 wheel 字段），干部证上仍是全名
  const wheelBoxRef = useRef(null)
  const [wheelFont, setWheelFont] = useState(2.6)
  useEffect(() => {
    const el = wheelBoxRef.current
    if (!el) return undefined
    const longest = Math.max(...labels.map((l) => l.length))
    const fit = () => {
      const room = el.clientWidth - 56 // 减去留白（inset）和一点余量
      const rem = room / (longest * 0.5 * 16) // Geist 细体平均字宽约 0.5em
      setWheelFont(Math.round(Math.max(1.6, Math.min(2.6, rem)) * 10) / 10)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [labels])
  // 部门切换：点部门 → 转轮转到该部门第一位；转轮滚到别的部门 → 部门自动跟随
  const firstOf = (id) => members.findIndex((x) => x.division.id === id)
  const divisions = team.map((d) => ({ label: `${d.name} · ${d.members.length}` }))
  const cur = members[idx]
  const divIndex = team.findIndex((d) => d.id === cur.division.id)

  return (
    <section className="panel" id="team">
      <Heading
        tag="The Team"
        title={`${teamSize()} officers, ${NUM[team.length] ?? team.length} divisions`}
        sub={`The 2026–27 leadership team of GDG on Campus DVC · Faculty adviser: ${adviser}`}
      />

      <div className="roster__switch" data-reveal>
        <GooeyNav
          items={divisions}
          initialActiveIndex={divIndex}
          activeIndex={divIndex}
          onSelect={(i) => select(firstOf(team[i].id))}
        />
      </div>

      <div className="roster" data-reveal>
        <div className={`roster__wheel accent-${cur.division.color}`} ref={wheelBoxRef}>
          <OptionWheel
            items={labels}
            defaultSelected={start}
            value={idx}
            onChange={selectFromWheel}
            textColor="#a6a6a6"
            activeColor="#ffffff"
            side="left"
            fontSize={wheelFont}
            spacing={1.4}
            curve={1}
            tilt={6}
            blur={2}
            fade={0.25}
            minOpacity={0.05}
            smoothing={160}
            inset={44}
            loop
            draggable
            className="roster__ow"
          />
          <p className="roster__hint code">scroll · drag · ↑↓</p>
        </div>

        {/* 中间：成员像素墙（4 × 4，小号，右边的干部证才是重点）。平时是彩色马赛克；选中的那格像"加载图片"一样
            8px → 16px → 32px → 原图 逐级变清晰，四角出现部门色选取框；下方一行显示正在打开的文件 */}
        <div className="wall">
          <div className="wall__bar code">
            <span>officers/</span>
            <span className="wall__meta">{members.length} files</span>
          </div>
          <ul className="wall__grid">
            {members.map((x, i) => {
              const file = x.photo ? x.photo.split('/').pop().replace('.jpg', '.png') : null
              return (
                <li key={x.name}>
                  <button
                    type="button"
                    className={`wall__tile accent-${x.division.color} ${i === idx ? 'is-on' : ''}`}
                    onClick={() => select(i)}
                    aria-label={x.name}
                    aria-pressed={i === idx}
                  >
                    {file ? (
                      <>
                        <img className="wall__l wall__l--base" src={`media/team/px16/${file}`} alt="" />
                        <img className="wall__l wall__l--8" src={`media/team/px8/${file}`} alt="" />
                        <img className="wall__l wall__l--32" src={`media/team/px32/${file}`} alt="" />
                        <img className="wall__l wall__l--full" src={x.photo} alt="" loading="lazy" />
                      </>
                    ) : (
                      // 还没有照片：用像素缩写占位
                      <span className="wall__mono"><PixelMonogram text={initials(x.name)} cell={3.5} step={4.3} dots={false} /></span>
                    )}
                    <span className="wall__no code">{pad(i + 1)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="wall__status code" key={idx}>
            <span><i className="c-green">$</i> open officers/{slug(cur.name)}.jpg</span>
            <span className="wall__load" aria-hidden><b /></span>
          </p>
        </div>

        {/* 详情：一张可以撕掉票根的"干部证"（React Bits · TearTicket）。换人时 key 变化 → 票重新出现 */}
        <div className={`roster__detail accent-${m.division.color}`} aria-live="polite">
          <div className="roster__head code">
            <span>{pad(idx + 1)}/{pad(members.length)}</span>
            {/* 进度：一格一个成员，已经翻过的格子按谷歌四色点亮 */}
            <i className="roster__blocks" aria-hidden>
              {members.map((x, i) => <b key={x.name} className={i <= idx ? `on bg-${TONES[i % 4]}` : ''} />)}
            </i>
            <span>{m.division.short.toLowerCase()}</span>
          </div>
          <TearTicket
            key={m.name}
            className="pass"
            orientation="vertical"
            image={m.photo || ''}
            imageAlt={`Portrait of ${m.name}`}
            scrim
            imageRadius={8}
            width={368}
            height={588}
            stubSize={138}
            radius={16}
            holes={12}
            holeSize={6}
            notch={3}
            roughness={0}
            tearAngle={30}
            stretch={30}
            resistance={0.45}
            rotate={0}
            tilt
            tiltMax={9}
            tiltReach={260}
            parallax={6}
            perspective={1000}
            background="#27272a"
            color="#f5f5f5"
            border
            borderWidth={1}
            recenter
            torn={torn.has(m.name)}
            onTear={() => setTorn((t) => new Set(t).add(m.name))}
            ariaLabel={`Tear the stub off ${m.name}'s pass`}
            stub={
              // 票根：和原版 "Admit one / 地点 · 日期 / No." 同一种排法
              <div className="pass__stub">
                <div className="pass__admit">
                  <h4>Officer pass</h4>
                  <p>{m.division.name}</p>
                  <span className="code">No. {pad(shown + 1)}/{pad(members.length)} · 2026–27</span>
                </div>
                <div className="pass__stub-side">
                  <Barcode seed={m.name} />
                  <span className="code">tear ↓</span>
                </div>
              </div>
            }
          >
            {!m.photo && (
              <div className="pass__placeholder">
                <PixelMonogram text={initials(m.name)} cell={12} step={15} />
              </div>
            )}
            {/* 正文：只放名字，压在照片底部的渐变上（原版示例的 <span>Spectrum</span>） */}
            <div className="pass__info">
              <p className="pass__role code"><i className={`c-${m.division.color}`}>●</i> {m.role}</p>
              <h3>{m.name}</h3>
              <p className="pass__duty">{m.duty}</p>
            </div>
          </TearTicket>
          <p className="pass__hint code">
            {torn.has(m.name) ? (
              <>
                <span className="pass__ok"><i className="c-green">✓</i> checked in</span>
                <button type="button" onClick={() => setTorn((t) => { const n = new Set(t); n.delete(m.name); return n })}>reprint</button>
              </>
            ) : (
              <><i className="c-green">$</i> pull the stub down to tear it off</>
            )}
          </p>
        </div>

      </div>

    </section>
  )
}
