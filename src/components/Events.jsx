import Heading from './Heading.jsx'
import Timeline from './Timeline.jsx'
import Gallery from './Gallery.jsx'
import Photo from './Photo.jsx'
import Schedule from './Schedule.jsx'
import { events, photos } from '../data.js'

// 活动：黑客松（左边深夜写代码的照片 + 右边详情；代码编辑器版本在 HackCode.jsx，暂时不用）→ 本学期活动 → 全球 GDG 照片墙 → 路线图
export default function Events() {
  const f = events.featured
  return (
    <section className="panel" id="events">
      <Heading tag="Events" title="What we do this year" sub="From weekly meetings to the biggest hackathon GDG DVC has hosted." />

      <article className="ed-feature" data-p>
        <Photo photo={photos.hackathonNight} wipe className="ed-feature__photo" />
        <div className="ed-feature__copy rise">
          <span className="eyebrow c-red">{f.tag}</span>
          <h3>{f.title}</h3>
          <p className="ed-feature__date">{f.date}</p>
          <p className="ed-feature__text">{f.text}</p>
          <p className="ed-feature__partners">{f.partners.join(' · ')}</p>
          <dl className="ed-feature__points">
            {f.points.map((pt) => (
              <div key={pt.k}>
                <dt>{pt.k}</dt>
                <dd>{pt.v}</dd>
              </div>
            ))}
          </dl>
          {f.sponsor && <p className="ed-feature__sponsor">{f.sponsor}</p>}
        </div>
      </article>

      {/* 活动日程：大号日期 + 状态（Done / Next）+ 悬停聚焦 + 加到 Google 日历（见 Schedule.jsx） */}
      <Schedule />

      <Gallery />
      <Timeline />
    </section>
  )
}
