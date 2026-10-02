import { useEffect, useRef } from 'react'

// 用代码画的 Gemini 海报（参考 Gemini 发布时的主视觉，自己重画，不是官方图片）：
// 黑底，渐变色 "Gemini" 字样 + 星芒；五条光线从左右汇聚到中间、拧成一股再散开，光沿着线慢慢流动。
// 互动：鼠标在海报上移动时，光线被"拨动"弯向光标，拧在一起的那一段跟着鼠标左右移动并扭转；
//       离开后弹回原位。点一下：星芒转一圈，所有光一起加速流过去。
// 竖版构图，用在 Why Join 左边那个竖长的位置。SVG 按比例铺满（slice），任何尺寸都清晰。
const W = 600
const H = 800
const MID = 500 // 光线所在的高度
const COLORS = ['#5b8def', '#9ab8f6', '#e8eaed', '#f2cdb8', '#e7a3dd']
const smooth = (t) => t * t * (3 - 2 * t)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// 每条线：两边分开、在 cx 附近并拢并缠绕；px/py/pull 是鼠标把线"拨"过去的位置和力度
function strand(k, cx, phase, px, py, pull) {
  const off = (k - 2) * 30
  let d = ''
  for (let x = -20; x <= W + 20; x += 4) {
    const r = x - cx // 相对缠绕中心的位置
    let spread
    if (r < -100) spread = 1
    else if (r < -50) spread = 1 - smooth((r + 100) / 50)
    else if (r < 50) spread = 0
    else if (r < 100) spread = smooth((r - 50) / 50)
    else spread = 1
    const inBraid = r > -70 && r < 70
    const env = inBraid ? Math.sin(((r + 70) / 140) * Math.PI) : 0
    let y = MID + off * spread + 9 * env * Math.sin(((r + 70) / 140) * Math.PI * 5 + k * 1.26 + phase)
    if (pull) y += (py - y) * pull * Math.exp(-((x - px) ** 2) / (2 * 70 * 70)) * 0.55
    d += `${x === -20 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }
  return d
}

export default function GeminiPoster() {
  const rootRef = useRef(null)
  const svgRef = useRef(null)
  const pathRefs = useRef([])

  useEffect(() => {
    const root = rootRef.current
    const svg = svgRef.current
    if (!root || !svg) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const st = { cx: W / 2, tcx: W / 2, phase: 0, px: W / 2, py: MID, pull: 0, tpull: 0, raf: 0, last: 0 }

    const draw = () => {
      const d = COLORS.map((_, k) => strand(k, st.cx, st.phase, st.px, st.py, st.pull))
      pathRefs.current.forEach((el, i) => el && el.setAttribute('d', d[Math.floor(i / 2)]))
    }
    const frame = (now) => {
      const dt = Math.min(0.05, (now - (st.last || now)) / 1000)
      st.last = now
      const k = 1 - Math.exp(-dt / 0.18)
      st.cx += (st.tcx - st.cx) * k
      st.pull += (st.tpull - st.pull) * (1 - Math.exp(-dt / 0.22))
      st.phase += dt * (1.2 + st.pull * 3) // 鼠标在上面时扭得更快
      draw()
      const settled = Math.abs(st.tcx - st.cx) < 0.3 && st.tpull === 0 && st.pull < 0.002
      st.raf = settled ? 0 : requestAnimationFrame(frame)
    }
    const kick = () => { if (!st.raf) { st.last = 0; st.raf = requestAnimationFrame(frame) } }

    // 屏幕坐标 → SVG 坐标（SVG 是 slice 铺满，用 getScreenCTM 换算最准）
    const local = (e) => {
      const m = svg.getScreenCTM()
      if (!m) return null
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
      return p
    }
    const move = (e) => {
      if (reduce) return
      const p = local(e)
      if (!p) return
      st.px = p.x
      st.py = clamp(p.y, MID - 160, MID + 160)
      st.tcx = clamp(p.x, 160, W - 160)
      st.tpull = 1 - clamp(Math.abs(p.y - MID) / 360, 0, 1) * 0.6
      kick()
    }
    const leave = () => { st.tcx = W / 2; st.tpull = 0; kick() }
    const click = () => {
      root.classList.remove('is-burst')
      void root.offsetWidth // 重新触发动画
      root.classList.add('is-burst')
    }
    const end = (e) => { if (e.target === root.querySelector('.gposter__spark')) root.classList.remove('is-burst') }

    draw()
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    root.addEventListener('click', click)
    root.addEventListener('animationend', end)
    return () => {
      cancelAnimationFrame(st.raf)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
      root.removeEventListener('click', click)
      root.removeEventListener('animationend', end)
    }
  }, [])

  return (
    <div className="gposter" ref={rootRef} aria-hidden>
      <svg className="gposter__lines" ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        {COLORS.map((c, k) => (
          <g key={k}>
            <path ref={(el) => { pathRefs.current[k * 2] = el }} stroke={c} strokeOpacity=".55" strokeWidth="1.6" fill="none" />
            {/* 流动的光：一小段亮线沿路径移动 */}
            <path ref={(el) => { pathRefs.current[k * 2 + 1] = el }} className="gposter__flow" stroke={c} strokeWidth="2.4" fill="none" pathLength="1000" style={{ '--k': k }} />
          </g>
        ))}
      </svg>
      <p className="gposter__word">
        Gemini
        <svg className="gposter__spark" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 0c.9 6.4 4.6 10.6 12 12-7.4 1.4-11.1 5.6-12 12-.9-6.4-4.6-10.6-12-12C7.4 10.6 11.1 6.4 12 0Z" fill="currentColor" />
        </svg>
      </p>
      <span className="gposter__hint">move · click</span>
    </div>
  )
}
