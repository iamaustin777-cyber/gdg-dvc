import { useEffect, useRef } from 'react'

// 点阵地球（Canvas 2D，不依赖任何库）
// - 陆地：灰色小方点（离镜头越近越亮越大，背面极淡，透出球体轮廓）
// - 分部：按地区上色的小方点；DVC 用四色像素块标出
// - 拖动旋转（带惯性），没人操作时慢慢自转；悬停找最近的分部，点击打开它的官方页面
// - 每隔一会儿从 DVC 飞出一条弧线到某个分部（弧线高度和距离成正比）
// - focus（地区序号）变化时转到该地区中心，其它地区的点变暗
// - 放大：触控板双指捏合 / ⌘ 或 Ctrl + 滚轮 / 双击 / 手机双指；放大后像透过一个圆形镜头看（画面裁在原来的圆里）
//   普通滚轮不拦截，页面照常滚动
// - 不在屏幕上时停止绘制；系统开启"减少动态效果"时不自转、不飞弧线
const D = Math.PI / 180
// 配色（参考 React Bits Pro · Globe）：实心黑球 + 冷银灰陆地点（不抢颜色，让分部的彩色点跳出来）；五个地区各一种柔和的亮色
// 北美 紫粉 · 拉美 杏橙 · 欧洲中东北非 薰衣草紫 · 撒哈拉以南非洲 薄荷绿 · 亚洲大洋洲 香槟金
export const REGION_COLORS = ['#ff9ffc', '#ffb27a', '#b8a4ff', '#7de2c3', '#f2ddb0']
const LAND = '#8b95ad'
const GLOW = '139,149,173' // 陆地色的 RGB，用在外圈
const EDGE = 18 // 画布边缘留白（给外圈一点点光晕）
const CENTROIDS = [[40.5, -90.8], [-7.4, -66.1], [42, 21.1], [2.1, 16.7], [22, 93.2]]
export const DVC = { lat: 37.9696, lng: -122.0718, name: 'GDG on Campus DVC', city: 'Pleasant Hill, CA' }
const TILT = 22 * D
const SPIN = 5 * D // 每秒自转角度（React Bits Pro Globe 默认 autoRotateSpeed 0.85 ≈ 每秒 5°）
// 光束参数照 React Bits Pro Globe 的默认值：同时 10 条；每条停留 6 秒；光沿弧线流动，2 秒走一趟、循环
const ARC_COUNT = 10
const ARC_LIFE = 6000
const ARC_DASH = 2000
const DASH_LEN = 0.35 // 流动的那段光占整条弧线的比例
export const ZOOM_MAX = 4
const PIX = ['#4285f4', '#ea4335', '#fbbc04', '#34a853']

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const easeOut = (t) => 1 - (1 - t) ** 3

export default function Globe({ data, focus = null, onHover, onPick, onZoom, api, className = '' }) {
  const canvasRef = useRef(null)
  const live = useRef({ focus, onHover, onPick, onZoom })
  live.current = { focus, onHover, onPick, onZoom }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return undefined
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ---- 预计算：每个点的 sin/cos，投影时只剩乘加 ----
    const prep = (lat, lng) => [Math.sin(lat * D), Math.cos(lat * D), Math.sin(lng * D), Math.cos(lng * D)]
    const nLand = data.land.length / 2
    const land = new Float32Array(nLand * 4)
    for (let i = 0; i < nLand; i++) land.set(prep(data.land[i * 2] / 10, data.land[i * 2 + 1] / 10), i * 4)
    const chs = data.chapters
    const nCh = chs.length
    const ch = new Float32Array(nCh * 4)
    chs.forEach((c, i) => ch.set(prep(c[0], c[1]), i * 4))
    const chX = new Float32Array(nCh)
    const chY = new Float32Array(nCh)
    const chZ = new Float32Array(nCh)
    const order = new Float32Array(nCh).map(() => Math.random()) // 入场时分部按随机顺序亮起
    const home = prep(DVC.lat, DVC.lng)
    const vec = (lat, lng) => [Math.cos(lat * D) * Math.cos(lng * D), Math.cos(lat * D) * Math.sin(lng * D), Math.sin(lat * D)]
    const homeV = vec(DVC.lat, DVC.lng)

    const st = {
      size: 0, dpr: 1, lam: (DVC.lng + 28) * D, phi: TILT, vLam: 0, vPhi: 0,
      drag: null, idleAt: 0, hover: -1, born: 0, arcs: [], nextArc: 0, raf: 0, visible: false, last: 0,
      zoom: 1, zoomT: 1, shown: 1, pointers: new Map(), pinch: null,
    }

    const resize = () => {
      const w = canvas.clientWidth
      st.dpr = Math.min(2, window.devicePixelRatio || 1)
      st.size = w
      canvas.width = Math.round(w * st.dpr)
      canvas.height = Math.round(w * st.dpr)
    }

    // 正交投影：结果写进 P（x, y 在 -1..1，z > 0 在正面）。每帧要算六千多个点，不新建数组，避免频繁垃圾回收
    const P = { x: 0, y: 0, z: 0 }
    const AQ = new Float32Array(4) // 光束上每个点的 sin/cos，重复使用
    const AX = new Float32Array(49), AY = new Float32Array(49), AV = new Uint8Array(49) // 光束上 48 段的屏幕坐标
    const proj = (p, i, sl, cl, sp, cp) => {
      const sφ = p[i], cφ = p[i + 1], sλ = p[i + 2], cλ = p[i + 3]
      const cd = cλ * cl + sλ * sl // cos(λ-λ0)
      const sd = sλ * cl - cλ * sl // sin(λ-λ0)
      P.x = cφ * sd
      P.y = cp * sφ - sp * cφ * cd
      P.z = sp * sφ + cp * cφ * cd
    }

    // 新光束：约三分之一从 DVC 发出，其余在两个分部之间；正在看某个地区时，只在那个地区里飞
    const spawnArc = (now) => {
      const f = live.current.focus
      for (let tries = 0; tries < 60; tries++) {
        const fromHome = Math.random() < 0.35
        const o = fromHome ? -1 : Math.floor(Math.random() * nCh)
        const j = Math.floor(Math.random() * nCh)
        if (f != null && (chs[j][2] !== f || (o >= 0 && chs[o][2] !== f))) continue
        const a = o < 0 ? homeV : vec(chs[o][0], chs[o][1])
        const b = vec(chs[j][0], chs[j][1])
        const w = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1))
        if (w < (f != null ? 6 : 15) * D || w > 110 * D) continue
        st.arcs.push({ a, b, w, j, t0: now, phase: Math.random() })
        return
      }
    }

    const draw = (now) => {
      const dt = Math.min(0.05, (now - (st.last || now)) / 1000)
      st.last = now
      const { focus: f } = live.current

      // ---- 转动：拖动中 / 惯性 / 转向地区 / 自转 ----
      if (!st.drag) {
        if (f != null) {
          const [la, lo] = CENTROIDS[f]
          const k = 1 - Math.exp(-dt / 0.35)
          st.lam += wrapPi(lo * D - st.lam) * k
          st.phi += (clamp(la * D, -0.5, 0.75) - st.phi) * k
          st.vLam = 0
        } else {
          st.lam += st.vLam * dt
          st.vLam *= Math.exp(-dt / 0.6)
          const roam = now > st.idleAt && st.zoomT < 1.05 // 放大时不自转，方便看清楚
          if (!reduce && roam) st.lam -= SPIN * dt * Math.min(1, (now - st.idleAt) / 1200)
          st.phi += (TILT - st.phi) * (1 - Math.exp(-dt / 2.5)) * (roam ? 1 : 0)
        }
      }

      // 缩放：平滑地靠近目标倍数
      st.zoom += (st.zoomT - st.zoom) * (1 - Math.exp(-dt / 0.16))
      if (Math.abs(st.zoomT - st.zoom) < 0.002) st.zoom = st.zoomT
      const shown = Math.round(st.zoom * 10) / 10
      if (shown !== st.shown) { st.shown = shown; live.current.onZoom?.(shown) }

      const S = st.size
      const R0 = S / 2 - EDGE // 镜头（圆框）半径
      const Z = st.zoom
      const R = R0 * Z // 球的半径
      const zs = Math.sqrt(Z) // 点的大小随放大倍数缓慢变大
      const lens = Z > 1.01
      const lensR2 = (R0 + 1) * (R0 + 1)
      const cx = S / 2
      const cy = S / 2
      const sl = Math.sin(st.lam), cl = Math.cos(st.lam), sp = Math.sin(st.phi), cp = Math.cos(st.phi)
      const age = reduce ? 1e9 : now - st.born
      const landIn = clamp(age / 900, 0, 1)

      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0)
      ctx.clearRect(0, 0, S, S)

      // 外圈：贴着球边一圈很淡的银灰光晕（大气层的感觉）
      const RR = Math.min(R, R0)
      ctx.globalAlpha = landIn
      const halo = ctx.createRadialGradient(cx, cy, RR * 0.96, cx, cy, RR + EDGE)
      halo.addColorStop(0, `rgba(${GLOW},0.16)`)
      halo.addColorStop(0.35, `rgba(${GLOW},0.06)`)
      halo.addColorStop(1, `rgba(${GLOW},0)`)
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, S, S)

      // 球体：实心黑，光从上方来（上面略亮、下面纯黑）；背面的点完全挡住。放大后裁在原来的圆里
      ctx.save()
      const shade = ctx.createRadialGradient(cx, cy - RR * 0.75, RR * 0.1, cx, cy - RR * 0.2, RR * 1.35)
      shade.addColorStop(0, '#1a1a1a')
      shade.addColorStop(0.55, '#0b0b0b')
      shade.addColorStop(1, '#030303')
      ctx.fillStyle = shade
      ctx.beginPath()
      ctx.arc(cx, cy, RR, 0, Math.PI * 2)
      ctx.fill()
      if (lens) ctx.clip() // 不放大时不裁：弧线可以飞出球面

      // 陆地：银灰小方点，只画正面；越靠近边缘越暗越小（球面的弧度感）
      ctx.fillStyle = LAND
      for (let i = 0; i < nLand; i++) {
        proj(land, i * 4, sl, cl, sp, cp)
        const { x, y, z } = P
        if (z <= 0.02) continue
        const px = cx + R * x, py = cy - R * y
        if (lens && (px - cx) ** 2 + (py - cy) ** 2 > lensR2) continue
        const s = (0.8 + 1.0 * z) * zs
        ctx.globalAlpha = landIn * (0.2 + 0.55 * z)
        ctx.fillRect(px - s / 2, py - s / 2, s, s)
      }

      // 分部
      const hv = st.hover
      for (let i = 0; i < nCh; i++) {
        proj(ch, i * 4, sl, cl, sp, cp)
        const { x, y, z } = P
        chX[i] = cx + R * x
        chY[i] = cy - R * y
        chZ[i] = z
        if (lens && (chX[i] - cx) ** 2 + (chY[i] - cy) ** 2 > lensR2) chZ[i] = -1 // 在镜头外：不画、也不能悬停
        if (chZ[i] <= 0) continue
        const pop = clamp((age - 250 - order[i] * 1100) / 260, 0, 1)
        if (!pop) continue
        const r = chs[i][2]
        const dim = f != null && r !== f
        const s = (1.7 + 1.5 * z) * (0.4 + 0.6 * easeOut(pop)) * zs
        ctx.globalAlpha = (dim ? 0.16 : 0.5 + 0.5 * z) * pop
        ctx.fillStyle = REGION_COLORS[r]
        ctx.fillRect(chX[i] - s / 2, chY[i] - s / 2, s, s)
      }

      // 光束（照 React Bits Pro Globe）：同时 10 条，每条停留 6 秒。
      // 弧线本身是一条很淡的细线，先从起点"长"到终点；一段亮光沿着它流动，2 秒走一趟、一直循环；
      // 光每到一次终点，终点就散开一圈细环。快到 6 秒时整条慢慢淡出，同时补上新的一条（错开时间，画面一直是满的）
      if (!reduce && st.visible) {
        if (now > st.nextArc && st.arcs.length < ARC_COUNT && age > 1200) {
          spawnArc(now)
          // 刚开始时快速补满，之后每条大约隔 ARC_LIFE / ARC_COUNT 补一条
          st.nextArc = now + (st.arcs.length < ARC_COUNT ? 140 : (ARC_LIFE / ARC_COUNT) * (0.6 + 0.8 * Math.random()))
        }
        const N = 48
        st.arcs = st.arcs.filter((a) => {
          const t = now - a.t0
          if (t > ARC_LIFE) return false
          const life = Math.min(clamp(t / 500, 0, 1), clamp((ARC_LIFE - t) / 800, 0, 1))
          const grow = easeOut(clamp(t / 900, 0, 1))
          const color = REGION_COLORS[chs[a.j][2]]
          const lift = 0.08 + 0.3 * (a.w / Math.PI)
          const sw = Math.sin(a.w)
          for (let k = 0; k <= N; k++) {
            const u = k / N
            const p0 = Math.sin((1 - u) * a.w) / sw
            const p1 = Math.sin(u * a.w) / sw
            const vx = a.a[0] * p0 + a.b[0] * p1
            const vy = a.a[1] * p0 + a.b[1] * p1
            const vz = a.a[2] * p0 + a.b[2] * p1
            const h = 1 + lift * Math.sin(Math.PI * u)
            const lat = Math.asin(clamp(vz, -1, 1))
            const lng = Math.atan2(vy, vx)
            AQ[0] = Math.sin(lat); AQ[1] = Math.cos(lat); AQ[2] = Math.sin(lng); AQ[3] = Math.cos(lng)
            proj(AQ, 0, sl, cl, sp, cp)
            const { x, y, z } = P
            AV[k] = z > 0 || (x * x + y * y) * h * h > 1 ? 1 : 0
            AX[k] = cx + R * h * x
            AY[k] = cy - R * h * y
          }
          ctx.strokeStyle = color
          ctx.lineCap = 'round'
          // 1) 底线：很淡，长到哪画到哪
          const gN = Math.round(grow * N)
          ctx.globalAlpha = 0.22 * life
          ctx.lineWidth = 1
          ctx.beginPath()
          let pen = false
          for (let k = 0; k <= gN; k++) {
            if (AV[k]) { if (pen) ctx.lineTo(AX[k], AY[k]); else ctx.moveTo(AX[k], AY[k]) }
            pen = AV[k] === 1
          }
          ctx.stroke()
          // 2) 流动的光：头亮尾淡，循环（头走到 1 之后尾巴也要走完，所以一趟是 1 + DASH_LEN）
          const d = (((t / ARC_DASH + a.phase) % 1) * (1 + DASH_LEN))
          const head = Math.min(d, grow)
          const tail = Math.max(0, d - DASH_LEN)
          if (head > tail) {
            const k0 = Math.floor(tail * N), k1 = Math.ceil(head * N)
            for (let k = Math.max(1, k0 + 1); k <= k1; k++) {
              if (!AV[k] || !AV[k - 1]) continue
              const q = clamp(((k / N) - tail) / (head - tail || 1), 0, 1)
              ctx.globalAlpha = 0.95 * life * q ** 1.6
              ctx.lineWidth = 0.7 + 1.3 * q
              ctx.beginPath()
              ctx.moveTo(AX[k - 1], AY[k - 1])
              ctx.lineTo(AX[k], AY[k])
              ctx.stroke()
            }
            const kh = Math.min(N, Math.round(head * N))
            if (d < 1 && AV[kh]) {
              ctx.globalAlpha = life
              ctx.fillStyle = '#fff'
              ctx.fillRect(AX[kh] - 1.25, AY[kh] - 1.25, 2.5, 2.5)
            }
          }
          // 3) 光到达终点：散开一圈细环
          if (d >= 1 && grow >= 1 && chZ[a.j] > 0) {
            const r = (d - 1) / DASH_LEN
            ctx.globalAlpha = 0.85 * (1 - r) * life
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(chX[a.j], chY[a.j], 2 + 11 * easeOut(r) * zs, 0, Math.PI * 2)
            ctx.stroke()
          }
          return true
        })
        ctx.lineCap = 'butt'
      }

      // DVC：四色 2×2 像素块
      {
        proj(home, 0, sl, cl, sp, cp)
        const { x, y, z } = P
        if (z > 0) {
          const px = cx + R * x
          const py = cy - R * y
          ctx.globalAlpha = landIn
          PIX.forEach((c, k) => {
            ctx.fillStyle = c
            ctx.fillRect(px - 4 + (k % 2) * 4, py - 4 + Math.floor(k / 2) * 4, 3.5, 3.5)
          })
          ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace"
          ctx.fillStyle = '#e8eaed'
          ctx.globalAlpha = landIn * clamp(z * 3, 0, 1)
          ctx.fillText('DVC', px + 8, py + 4)
        }
      }

      // 悬停的分部：一个方框
      if (hv >= 0 && chZ[hv] > 0) {
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.strokeRect(chX[hv] - 5.5, chY[hv] - 5.5, 11, 11)
      }
      ctx.restore()
      // 外圈细线（放大后就是镜头的边）
      ctx.globalAlpha = landIn
      ctx.strokeStyle = lens ? `rgba(${GLOW},.4)` : `rgba(${GLOW},.24)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, Math.min(R, R0), 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1

      st.raf = st.visible ? requestAnimationFrame(draw) : 0
    }

    const start = () => {
      if (!st.raf) {
        st.last = 0
        st.raf = requestAnimationFrame(draw)
      }
    }

    // ---- 缩放 ----
    // 以 (x, y) 为中心放大：倍数变化的同时把那一点往圆心转一点，感觉像"往那里推进"
    const zoomAt = (f, x, y) => {
      const next = clamp(st.zoomT * f, 1, ZOOM_MAX)
      const k = next / st.zoomT
      if (k === 1) return
      if (x != null && k > 1) {
        const R = (st.size / 2 - EDGE) * st.zoomT
        const g = 1 - 1 / k
        st.lam += ((x - st.size / 2) / R) * g
        st.phi = clamp(st.phi - ((y - st.size / 2) / R) * g, -1.2, 1.2)
      }
      st.zoomT = next
      st.vLam = 0
      st.idleAt = performance.now() + 2500
      start()
    }
    if (api) api.current = { zoomBy: (f) => zoomAt(f), reset: () => { st.zoomT = 1; st.idleAt = performance.now() + 800; start() } }

    // ---- 交互 ----
    const local = (e) => {
      const r = canvas.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    }
    const nearest = (x, y) => {
      let best = -1, bd = 64 // 8px 以内
      for (let i = 0; i < nCh; i++) {
        if (chZ[i] <= 0.05) continue
        const dx = chX[i] - x, dy = chY[i] - y
        const d = dx * dx + dy * dy
        if (d < bd) { bd = d; best = i }
      }
      return best
    }
    const setHover = (i) => {
      if (i === st.hover) return
      st.hover = i
      canvas.style.cursor = st.drag ? 'grabbing' : i >= 0 ? 'pointer' : 'grab'
      live.current.onHover?.(i >= 0 ? chs[i] : null)
    }
    const down = (e) => {
      if (e.button !== 0) return
      const [x, y] = local(e)
      st.pointers.set(e.pointerId, [x, y])
      if (st.pointers.size === 2) {
        // 两根手指：开始捏合缩放，停止拖动
        const [[ax, ay], [bx, by]] = [...st.pointers.values()]
        st.pinch = { d: Math.hypot(ax - bx, ay - by) || 1, z: st.zoomT }
        st.drag = null
        return
      }
      st.drag = { x, y, x0: x, y0: y, t: performance.now(), moved: false, id: e.pointerId }
      st.vLam = 0
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e) => {
      const [x, y] = local(e)
      if (st.pointers.has(e.pointerId)) st.pointers.set(e.pointerId, [x, y])
      if (st.pinch && st.pointers.size === 2) {
        const [[ax, ay], [bx, by]] = [...st.pointers.values()]
        st.zoomT = clamp(st.pinch.z * (Math.hypot(ax - bx, ay - by) / st.pinch.d), 1, ZOOM_MAX)
        st.idleAt = performance.now() + 2500
        return
      }
      const d = st.drag
      if (d && d.id === e.pointerId) {
        const R = (st.size / 2 - EDGE) * st.zoom // 放大后拖同样距离转得更少，手感一致
        const now = performance.now()
        const dx = x - d.x, dy = y - d.y
        if (Math.abs(x - d.x0) + Math.abs(y - d.y0) > 4) d.moved = true
        st.lam -= dx / R
        st.phi = clamp(st.phi + dy / R, st.zoomT > 1.05 ? -1.2 : -0.6, st.zoomT > 1.05 ? 1.2 : 0.9)
        const dtm = Math.max(8, now - d.t)
        st.vLam = st.vLam * 0.6 + (-dx / R / (dtm / 1000)) * 0.4
        d.x = x; d.y = y; d.t = now
        st.idleAt = now + 2500
        canvas.style.cursor = 'grabbing'
        return
      }
      if (e.pointerType === 'mouse') setHover(nearest(x, y))
    }
    const up = (e) => {
      st.pointers.delete(e.pointerId)
      if (st.pointers.size < 2) st.pinch = null
      const d = st.drag
      if (!d || d.id !== e.pointerId) return
      st.drag = null
      st.idleAt = performance.now() + 2500
      if (!d.moved) {
        const [x, y] = local(e)
        const i = nearest(x, y)
        if (i >= 0) {
          if (e.pointerType === 'mouse') live.current.onPick?.(chs[i])
          else setHover(i) // 触屏：点一下先显示名字，下方那一行可以点开
        }
        st.vLam = 0
      }
      canvas.style.cursor = st.hover >= 0 ? 'pointer' : 'grab'
    }
    const leave = () => { if (!st.drag) setHover(-1) }
    // 触控板捏合（浏览器会当成 Ctrl + 滚轮）/ ⌘ 或 Ctrl + 滚轮：缩放；普通滚轮不管，让页面照常滚动
    const wheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const [x, y] = local(e)
      zoomAt(Math.exp(-e.deltaY * 0.012), x, y)
    }
    const dbl = (e) => {
      const [x, y] = local(e)
      zoomAt(st.zoomT >= ZOOM_MAX - 0.01 ? 1 / ZOOM_MAX : 2, x, y) // 已经最大时双击回到原样
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([en]) => {
      st.visible = en.isIntersecting
      if (st.visible) {
        if (!st.born) st.born = performance.now()
        start()
      }
    }, { threshold: 0.05 })
    io.observe(canvas)
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('wheel', wheel, { passive: false })
    canvas.addEventListener('dblclick', dbl)
    canvas.style.cursor = 'grab'
    return () => {
      cancelAnimationFrame(st.raf)
      st.visible = false
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('wheel', wheel)
      canvas.removeEventListener('dblclick', dbl)
    }
  }, [data, api])

  return (
    <canvas
      ref={canvasRef}
      className={`globe ${className}`}
      role="img"
      aria-label={data ? `Globe with ${data.chapters.length} Google Developer Group chapters` : 'Loading globe'}
    />
  )
}
