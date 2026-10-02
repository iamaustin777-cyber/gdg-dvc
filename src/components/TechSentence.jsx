import { useState } from 'react'
import { techLinks } from '../data.js'
import './blocks.css'

// "Hands-on with Google technologies" 的新写法：没有卡片，一句大字就是界面
// 四个产品名是句子里的链接（点击打开官方开发者网站）；悬停时名字变成产品色，
// 句子下面那一行换成"我们用它做什么 → 网址"。键盘 Tab 聚焦同样生效。
const Arrow = () => (
  <svg className="ts__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M4 10 10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function TechSentence() {
  const [on, setOn] = useState(null)
  const t = techLinks.find((x) => x.name === on)
  const word = (x) => (
    <a
      key={x.name}
      className={`ts__word tone-${x.tone} ${on === x.name ? 'is-on' : ''}`}
      href={x.href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setOn(x.name)}
      onFocus={() => setOn(x.name)}
      onMouseLeave={() => setOn(null)}
      onBlur={() => setOn(null)}
    >
      {x.name}
    </a>
  )
  const [a, b, c, d] = techLinks
  return (
    <div className={`ts ${on ? 'has-on' : ''}`}>
      <p className="ts__sentence">
        We get hands‑on with {word(a)}, {word(b)}, {word(c)} and {word(d)}.
      </p>
      <p className="ts__caption" aria-live="polite">
        {t ? (
          <span key={t.name} className="ts__swap">
            {t.line} <span className={`ts__host tone-${t.tone}`}>{t.host} <Arrow /></span>
          </span>
        ) : (
          <span key="idle" className="ts__swap ts__idle">Pick a product to see what we build with it.</span>
        )}
      </p>
    </div>
  )
}
