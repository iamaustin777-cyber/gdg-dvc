import Photo from './Photo.jsx'
import Row from './Row.jsx'
import TechSentence from './TechSentence.jsx'
import { about, photos, statement, teamSize } from '../data.js'

const pad = (n) => String(n).padStart(2, '0')

// 什么是 GDG：居中宣言 + 用到的 Google 技术 + 数据条（参考 React Bits Pro · Hero 20），
// 谷歌大楼照片上的使命，然后六项活动做成杂志式照片行
export default function About() {
  const facts = about.facts.map((f) => (f.value === 'officers' ? { ...f, value: String(teamSize()) } : f))

  return (
    <section className="panel" id="about">
      <header className="lead" data-reveal>
        <span className="tag"><i />About</span>
        <h2 className="lead__title">{statement[0]}</h2>
        <p className="lead__sub">{about.intro}</p>
      </header>

      {/* 用到的 Google 技术：一句大字，产品名就是链接（TechSentence.jsx） */}
      <TechSentence />

      <dl className="metrics" data-reveal>
        {facts.map((f) => (
          <div key={f.short}>
            <dt>{f.short}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      <Photo photo={photos.googleplex} className="photo--band" scroll>
        <div className="photo__text">
          <span className="tag tag--light"><i />Our mission</span>
          <p>{about.mission}</p>
        </div>
      </Photo>

      <h3 className="sub-title" data-reveal>What we do</h3>
      <div className="ed-rows">
        {about.pillars.map((p, i) => (
          <Row key={p.title} n={pad(i + 1)} tone={p.color} title={p.title} text={p.text} photo={photos[p.photo]} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
