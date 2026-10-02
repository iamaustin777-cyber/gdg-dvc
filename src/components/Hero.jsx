import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import HeroCanvas from './HeroCanvas.jsx'
import Mark, { MARK_RATIO } from './Mark.jsx'
import { hero, site } from '../data.js'
import GooeyButton from './GooeyButton.jsx'
import TechText from './TechText.jsx'

// 过渡：穿过 GDG 标志进入网站
// 首屏是一段 200vh 的滚动轨道，里面的画面 sticky 固定。滚动这一屏的过程中：
//   1. 标志字、顶部信息、底部按钮先淡出
//   2. 括号标志移到屏幕正中，然后加速放大，镜头从两个括号之间的空隙穿过去
//   3. 圆角画框放大到铺满屏幕，最后整体渐变成主体的深蓝色，与下方内容无缝衔接
// 只改 transform / opacity（GPU 合成），滚动时不触发重绘
const BIG = 2400 // 放大用的标志按大尺寸渲染，再缩小到正常大小，放大时依然清晰
const BIG_W = BIG * MARK_RATIO // 官方标志宽高比 110 : 58

const SWEEP_MS = 6500 // 扫描框在一行上从左扫到右大约需要这么久

const clamp = (v) => Math.max(0, Math.min(1, v))
const easeIn = (t) => t * t * t
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function Hero() {
  const [videoOk, setVideoOk] = useState(true)
  // 标志字两行轮流播放扫描效果：每 SWEEP_MS 换一行
  const [sweepLine, setSweepLine] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSweepLine((l) => (l + 1) % hero.lines.length), SWEEP_MS)
    return () => clearInterval(id)
  }, [])
  const trackRef = useRef(null)
  const frameRef = useRef(null)
  const slotRef = useRef(null)
  const zoomRef = useRef(null)
  const uiRef = useRef([])
  const fadeRef = useRef(null)
  const geo = useRef(null)
  const lockupRef = useRef(null)
  const [fs, setFs] = useState(100)

  // 竖排的每一行用同一个字号：取标志字区域的 CSS 字号（随窗口宽度变化）
  useLayoutEffect(() => {
    const read = () => setFs(parseFloat(getComputedStyle(lockupRef.current).fontSize) || 100)
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  // 鼠标视差：光晕与光带反向轻移
  useEffect(() => {
    const el = frameRef.current
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        if (e.clientY > r.bottom) return
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  // 滚动驱动的过渡
  useLayoutEffect(() => {
    const track = trackRef.current
    const frame = frameRef.current
    const zoom = zoomRef.current
    const fade = fadeRef.current
    let raf = 0

    // 记录静止时标志的位置（相对 sticky 画面）
    const measure = () => {
      const slot = slotRef.current.getBoundingClientRect()
      const stage = frame.parentElement.getBoundingClientRect()
      geo.current = {
        cx: slot.left - stage.left + slot.width / 2,
        cy: slot.top - stage.top + slot.height / 2,
        base: slot.width / BIG_W,
        w: stage.width,
        h: stage.height,
      }
    }

    const update = () => {
      raf = 0
      const g = geo.current
      const r = track.getBoundingClientRect()
      const p = clamp(-r.top / (r.height - window.innerHeight))

      const ui = 1 - clamp(p / 0.14)
      const move = easeOut(clamp(p / 0.22))
      const zoomT = easeIn(clamp((p - 0.12) / 0.76))
      const cover = clamp((p - 0.6) / 0.32)
      const open = easeOut(clamp(p / 0.5))

      uiRef.current.forEach((el) => el && (el.style.opacity = ui))
      const x = g.cx + (g.w / 2 - g.cx) * move
      const y = g.cy + (g.h / 2 - g.cy) * move
      zoom.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${g.base * (1 + zoomT * 42)})`
      const full = Math.max(g.w / (g.w - 28), g.h / (g.h - 28))
      frame.style.transform = p > 0 ? `scale(${1 + (full - 1) * open})` : ''
      fade.style.opacity = cover
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    const onResize = () => { measure(); update() }

    measure()
    update()
    zoom.style.visibility = 'visible'
    document.fonts?.ready.then(onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const ui = (i) => (el) => { uiRef.current[i] = el }

  return (
    <section className="hero" id="top" ref={trackRef}>
      <div className="hero__stage">
        <div className="hero__frame" ref={frameRef}>
          <div className="hero__bg" aria-hidden>
            <HeroCanvas />
            {videoOk && site.heroVideo && (
              <video
                className="hero__video"
                src={site.heroVideo}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoOk(false)}
              />
            )}
            <div className="hero__vignette" />
            <div className="hero__grain" />
          </div>

          <dl className="hero__meta" ref={ui(0)}>
            {hero.meta.map((m, i) => (
              <div key={m.label} className="hero__load" style={{ '--d': `${0.5 + i * 0.08}s` }}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>

          <div className="hero__center">
            <h1 className="hero__lockup" ref={lockupRef} aria-label={`${site.club} ${site.short}`}>
              <span className="hero__slot" ref={slotRef} aria-hidden />
              {/* 外层：滚动淡出（inline opacity）；内层：入场淡入（动画 fill 会盖掉同一元素的 opacity） */}
              <span className="hero__word" ref={ui(1)}>
                <span className="hero__word-in hero__load" style={{ '--d': '0.35s' }}>
                  {hero.lines.map((line, i) => (
                    <span key={line} className="hero__line">
                      <TechText
                        text={line}
                        sweep={i === sweepLine} /* 两行轮流自动扫过，同一时间只出现一个选取框 */
                        align="left"
                        pad={24}
                        fontFamily="'Google Sans', 'Geist', sans-serif"
                        fontWeight={500}
                        fontSize={fs}
                        letterSpacing={-0.03}
                        color="#f3f5f9"
                        accentColor="#ffffff"
                        reveal="letter"
                        dashLength={4}
                        dashGap={2}
                        specks={15}
                      />
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            {/* 外层控制滚动淡出，内层保留入场动画（动画的 fill 会覆盖同一元素上的 opacity） */}
            <div ref={ui(2)}>
              <p className="hero__tagline mono hero__load" style={{ '--d': '0.9s' }}>
                {site.motto.join('  ')}
              </p>
            </div>
          </div>

          <div className="hero__actions" ref={ui(3)}>
            <div className="hero__actions-inner hero__load" style={{ '--d': '1s' }}>
              <GooeyButton variant="solid" href="#join" className="gooey-btn--lg">
                <span aria-hidden>↗</span> Join GDG
              </GooeyButton>
              <span className="hero__where mono">{site.meeting}</span>
              <GooeyButton variant="ghost" href="#about" className="gooey-btn--lg" aria-label="Scroll to content">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v15M5.5 12.5 12 19l6.5-6.5" />
                </svg>
              </GooeyButton>
            </div>
          </div>
        </div>

        {/* 放大穿越用的标志：画在画框之外，单独一层 */}
        <div className="hero__zoom" ref={zoomRef} aria-hidden>
          <Mark size={BIG} className="hero__mark" />
        </div>

        {/* 穿过之后渐变成主体的深蓝色 */}
        <div className="hero__cover" ref={fadeRef} aria-hidden />
      </div>
    </section>
  )
}
