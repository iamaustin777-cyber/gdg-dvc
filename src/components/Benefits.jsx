import Heading from './Heading.jsx'
import Photo from './Photo.jsx'
import { benefits, photos } from '../data.js'

const pad = (n) => String(n).padStart(2, '0')

// 为什么加入：左边 Gemini 海报（代码画的）钉住不动，右边六条理由滚过去（杂志式，没有框）
export default function Benefits() {
  return (
    <section className="panel" id="why">
      <Heading tag="Why Join" title="What you get as a member" sub="Any major, any experience level. If you’re curious about tech, there’s a place for you here." />
      <div className="why">
        <div className="why__aside">
          <Photo photo={photos.geminiPoster} className="why__photo" scroll />
        </div>
        <ol className="why__list">
          {benefits.map((b, i) => (
            <li key={b.title} data-p className="rise">
              <span className={`num num--sm c-${b.color}`}>{pad(i + 1)}</span>
              <div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
