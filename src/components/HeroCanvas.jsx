import { useEffect, useRef } from 'react'

// 首屏动态背景：方块像素点阵 + 用 Google 四色像素拼成的大号 GDG 括号标志
// - 载入时标志像素从四周飞回来拼合
// - 鼠标附近的像素被推开，并按 GDG 括号四象限着色（左上红 / 左下蓝 / 右上绿 / 右下黄）
// - 鼠标停住超过 DWELL 毫秒，散开的圈像快门一样慢慢合上（半径和推力一起收到 0，点弹回原位）；一动又重新张开
// - 点击产生冲击波
// - 离开视口、开始穿越过渡或切到后台时暂停，避免影响滚动性能
const BLUE = '#4285F4'
const RED = '#EA4335'
const YELLOW = '#FBBC04'
const GREEN = '#34A853'
const COLORS = [BLUE, RED, YELLOW, GREEN]

const GAP = 22 // 像素格距
const RADIUS = 220 // 鼠标影响半径
const FORCE = 2.4 // 推力
const SPRING = 0.06 // 回弹
const DAMPING = 0.82 // 阻尼
const DWELL = 1200 // 鼠标静止多久后开始合上（毫秒）
const OPEN_SPEED = 0.22 // 张开：快速跟手
const CLOSE_SPEED = 0.028 // 合上：约 1.5 秒慢慢收拢

// GDG 括号标志的四段笔画（与 Mark.jsx 同一套坐标，viewBox 110 × 58，笔画粗 18）
// 后面的段压在前面的段上：蓝压红、绿压黄
const STROKES = [
  { c: RED, a: [40, 10], b: [9, 29] },
  { c: BLUE, a: [9, 29], b: [40, 48] },
  { c: YELLOW, a: [101, 29], b: [70, 48] },
  { c: GREEN, a: [70, 10], b: [101, 29] },
]
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const vx = bx - ax, vy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
  const dx = px - (ax + vx * t), dy = py - (ay + vy * t)
  return Math.sqrt(dx * dx + dy * dy)
}

export default function HeroCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dots = [], raf = 0, running = false, visible = true
    const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: false, open: 0, moved: 0 }
    const ripples = []

    // 标志放在画面右侧留白处：宽约 44%，中心在 (70%, 54%)
    const logoColor = (x, y) => {
      const lw = Math.min(w * 0.44, h * 1.15)
      const s = lw / 110
      const lx = (x - (w * 0.7 - lw / 2)) / s
      const ly = (y - (h * 0.54 - (58 * s) / 2)) / s
      if (lx < -10 || lx > 120 || ly < -10 || ly > 68) return null
      let hit = null
      for (const st of STROKES) if (segDist(lx, ly, st.a, st.b) <= 9) hit = st.c
      return hit
    }

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // 视网膜屏按 2x 绘制，否则像素会发虚
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = []
      const narrow = w < 860 // 小屏标志会压到文字，不画
      for (let y = GAP / 2; y < h; y += GAP)
        for (let x = GAP / 2; x < w; x += GAP) {
          const logo = narrow ? null : logoColor(x, y)
          const a = Math.random() * Math.PI * 2
          const far = logo && !reduce ? 260 + Math.random() * 420 : 0 // 载入时从四周飞回来
          dots.push({
            x, y, vx: 0, vy: 0, heat: 0, logo,
            ox: Math.cos(a) * far, oy: Math.sin(a) * far,
            c: logo ? null : Math.random() < 0.035 ? COLORS[(Math.random() * 4) | 0] : null,
            seed: Math.random() * Math.PI * 2,
          })
        }
    }

    const quadrantColor = (dx, dy) =>
      dx < 0 ? (dy < 0 ? RED : BLUE) : dy < 0 ? GREEN : YELLOW

    const frame = (t) => {
      // 鼠标位置做轻微缓动：跟手但不抖
      mouse.x += (mouse.tx - mouse.x) * 0.35
      mouse.y += (mouse.ty - mouse.y) * 0.35
      const time = t * 0.0004
      // 张开程度：刚动过 → 1，静止超过 DWELL → 缓慢回到 0
      const target = mouse.active && t - mouse.moved < DWELL ? 1 : 0
      mouse.open += (target - mouse.open) * (target > mouse.open ? OPEN_SPEED : CLOSE_SPEED)
      const ease = mouse.open * mouse.open * (3 - 2 * mouse.open) // smoothstep，合上的最后一段更柔和
      const R = RADIUS * ease
      const on = R > 2

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += 14
        if (ripples[i].r > Math.max(w, h)) ripples.splice(i, 1)
      }

      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        const px = d.x + d.ox
        const py = d.y + d.oy
        let ax = -d.ox * SPRING
        let ay = -d.oy * SPRING
        let heat = 0
        let hue = null

        if (on) {
          const dx = px - mouse.x
          const dy = py - mouse.y
          const dist2 = dx * dx + dy * dy
          if (dist2 < R * R) {
            const dist = Math.sqrt(dist2) || 1
            const f = 1 - dist / R
            ax += (dx / dist) * f * f * FORCE * 6 * ease
            ay += (dy / dist) * f * f * FORCE * 6 * ease
          }
          // 着色按点的原始位置算：被推开后仍保持高亮
          const hx = d.x - mouse.x
          const hy = d.y - mouse.y
          const hd = Math.sqrt(hx * hx + hy * hy)
          if (hd < R * 1.15) {
            heat = Math.min(1, (1 - hd / (R * 1.15)) * 1.6) * ease
            hue = quadrantColor(hx, hy)
          }
        }

        for (const r of ripples) {
          const dx = d.x - r.x
          const dy = d.y - r.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const band = 1 - Math.abs(dist - r.r) / 70
          if (band > 0) {
            const k = band * r.power * (1 - r.r / Math.max(w, h))
            ax += (dx / dist) * k
            ay += (dy / dist) * k
            heat = Math.max(heat, band * 0.8)
            hue = hue || quadrantColor(dx, dy)
          }
        }

        d.vx = (d.vx + ax) * DAMPING
        d.vy = (d.vy + ay) * DAMPING
        d.ox += d.vx
        d.oy += d.vy
        d.heat += (heat - d.heat) * 0.25
        if (hue) d.hue = hue

        const wave = Math.sin(d.x * 0.006 + time * 2) * Math.cos(d.y * 0.008 - time * 1.4)
        const x = d.x + d.ox
        const y = d.y + d.oy + (d.logo ? 0 : wave * 4)

        if (d.logo) {
          // 标志像素：实心大方块，轻微闪烁；被推开时变小一点，像碎开的马赛克
          const spread = Math.min(1, Math.hypot(d.ox, d.oy) / 120)
          const s = (GAP - 6) * (1 - spread * 0.45)
          ctx.globalAlpha = 0.82 + Math.sin(time * 6 + d.seed) * 0.12
          ctx.fillStyle = d.logo
          ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s)
        } else if (d.heat > 0.04 && d.hue) {
          const s = 3 + d.heat * 5
          ctx.globalAlpha = Math.min(1, 0.35 + d.heat)
          ctx.fillStyle = d.hue
          ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s)
        } else if (d.c) {
          ctx.globalAlpha = 0.45 + (wave + 1) * 0.25
          ctx.fillStyle = d.c
          ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4)
        } else {
          ctx.globalAlpha = 0.1 + (wave + 1) * 0.08
          ctx.fillStyle = '#BDC1C6'
          ctx.fillRect(Math.round(x) - 1.5, Math.round(y) - 1.5, 3, 3)
        }
      }
      ctx.globalAlpha = 1

      raf = running ? requestAnimationFrame(frame) : 0
    }

    const start = () => {
      if (running || reduce || !visible || document.hidden) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      mouse.active = y >= 0 && y <= r.height
      if (mouse.x < -1e3) { mouse.x = x; mouse.y = y }
      // 移动超过 2px 才算"动了"（避免手抖让圈一直合不上）
      if (Math.abs(x - mouse.tx) + Math.abs(y - mouse.ty) > 2) mouse.moved = performance.now()
      mouse.tx = x
      mouse.ty = y
    }
    const onLeave = () => { mouse.active = false }
    const onDown = (e) => {
      const r = canvas.getBoundingClientRect()
      const y = e.clientY - r.top
      if (y < 0 || y > r.height) return
      ripples.push({ x: e.clientX - r.left, y, r: 0, power: 9 })
    }
    const onVis = () => (document.hidden ? stop() : start())
    // 穿越过渡一开始就暂停点阵，把性能留给滚动
    let faded = false
    const onScroll = () => {
      const f = window.scrollY > window.innerHeight * 0.06
      if (f === faded) return
      faded = f
      visible = !f
      f ? stop() : start()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      visible ? start() : stop()
    })

    build()
    if (reduce) frame(0)
    io.observe(canvas)
    start()
    window.addEventListener('resize', build)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', build)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="hero__canvas" aria-hidden />
}
