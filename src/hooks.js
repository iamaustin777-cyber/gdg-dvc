import { useEffect, useState } from 'react'

// 给所有 [data-reveal] 元素加入滚动入场动画
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > offset)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [offset])
  return scrolled
}

// 全局聚光灯：所有 [data-spot] 元素记录鼠标相对坐标（--sx / --sy），用于边框发光
export function useSpotlight() {
  useEffect(() => {
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight
        document.querySelectorAll('[data-spot]').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.bottom < -200 || r.top > vh + 200) return
          el.style.setProperty('--sx', `${e.clientX - r.left}px`)
          el.style.setProperty('--sy', `${e.clientY - r.top}px`)
        })
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
}

// 元素第一次进入视口时回调一次
export function useOnceInView(ref, cb, threshold = 0.4) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        cb()
        io.disconnect()
      }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, threshold])
}



// 滚动驱动：给所有 [data-p] 元素写入进度变量（一个循环统一更新，只写 CSS 变量，不触发 React 渲染）
//   --p 进入进度：元素顶部从视口底部滚到视口 35% 处，0 → 1（擦出、缩放）
//   --t 穿越进度：元素进入视口 → 完全离开，0 → 1（视差）
// 鼠标滚轮是一格一格跳的，直接把滚动位置映射成动画会一顿一顿；
// 这里每帧只向目标值靠近一部分（指数缓动），动画就会跟着滚动平滑地"追"上去
// .rise 文字不跟滚动走：进度过 0.3 时加 .is-in，用 CSS 过渡按时间播放（错开 --d）
export function useScrollVars() {
  useEffect(() => {
    const clamp = (v) => Math.max(0, Math.min(1, v))
    const state = new Map()
    let raf = 0
    let last = 0
    const tick = (now) => {
      raf = 0
      const dt = last ? Math.min(64, now - last) : 16
      last = now
      const k = 1 - Math.exp(-dt / 90) // 时间常数约 90ms：跟手但不生硬，与帧率无关
      const vh = window.innerHeight
      let moving = false
      document.querySelectorAll('[data-p]').forEach((el) => {
        const r = el.getBoundingClientRect()
        const near = r.bottom > -200 && r.top < vh + 200
        const tp = clamp((vh - r.top) / (vh * 0.65))
        const tt = clamp((vh - r.top) / (vh + r.height))
        let s = state.get(el)
        if (!s) { s = { p: tp, t: tt }; state.set(el, s) }
        if (!near) { s.p = tp; s.t = tt } else {
          s.p += (tp - s.p) * k
          s.t += (tt - s.t) * k
          if (Math.abs(tp - s.p) > 0.0005 || Math.abs(tt - s.t) > 0.0005) moving = true
          else { s.p = tp; s.t = tt }
        }
        el.style.setProperty('--p', s.p.toFixed(4))
        el.style.setProperty('--t', s.t.toFixed(4))
        if (tp > 0.3 && !el.dataset.in) {
          el.dataset.in = '1'
          if (el.classList.contains('rise')) el.classList.add('is-in')
          el.querySelectorAll('.rise').forEach((c) => c.classList.add('is-in'))
        }
      })
      if (moving) raf = requestAnimationFrame(tick)
      else last = 0
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
}

// 禁止复制 / 剪切 / 拖拽：CSS 的 user-select 之外再拦一次键盘复制（Ctrl/⌘ + C）和图片拖拽
// 输入框里的复制不拦
export function useNoCopy() {
  useEffect(() => {
    const editable = (t) => t instanceof Element && t.closest('input, textarea, [contenteditable="true"]')
    const block = (e) => { if (!editable(e.target)) e.preventDefault() }
    const events = ['copy', 'cut', 'dragstart']
    events.forEach((ev) => document.addEventListener(ev, block))
    return () => events.forEach((ev) => document.removeEventListener(ev, block))
  }, [])
}
