import { useEffect, useRef, useState } from 'react'
import Mark from './Mark.jsx'
import PixelMonogram from './PixelMonogram.jsx'
import GooeyNav from './GooeyNav.jsx'
import GooeyButton from './GooeyButton.jsx'
import { nav, site } from '../data.js'
import { useScrolled } from '../hooks.js'

const ITEMS = [{ value: 'top', label: 'Home', href: '#top' }, ...nav.map((n) => ({ value: n.id, label: n.label, href: `#${n.id}` }))]

export default function Nav() {
  const scrolled = useScrolled()
  const [active, setActive] = useState('top')
  const lock = useRef(0)

  // 滚动高亮：取穿过视口上部 40% 位置的那个区块
  useEffect(() => {
    const spy = () => {
      if (performance.now() < lock.current) return
      const line = window.innerHeight * 0.4
      let cur = 'top'
      for (const it of ITEMS) {
        const el = document.getElementById(it.value)
        if (el && el.getBoundingClientRect().top <= line) cur = it.value
      }
      setActive(cur)
    }
    // 只量 7 个区块的位置，开销很小，直接在滚动事件里执行
    spy()
    window.addEventListener('scroll', spy, { passive: true })
    return () => window.removeEventListener('scroll', spy)
  }, [])

  // 点击：GooeyNav 播放气泡动画，链接本身负责平滑滚动；滚动期间暂停自动高亮，避免胶囊中途乱跳
  const select = (i) => {
    setActive(ITEMS[i].value)
    lock.current = performance.now() + 1200
  }
  const activeIndex = Math.max(0, ITEMS.findIndex((it) => it.value === active))

  return (
    <nav className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand">
          <Mark size={19} />
          <span>
            <strong>{site.club}</strong>
            <PixelMonogram text="DVC" cell={2.2} step={2.7} dots={false} className="nav__dvc" />
          </span>
        </a>
        <div className="nav__gooey">
          <GooeyNav
            items={ITEMS}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            activeIndex={activeIndex}
            onSelect={select}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
        <GooeyButton variant="solid" href="#join" className="nav__cta">
          <span className="pix4" aria-hidden><b /><b /><b /><b /></span> Join GDG
        </GooeyButton>
      </div>
    </nav>
  )
}
