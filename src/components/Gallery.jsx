import Photo from './Photo.jsx'
import { gallery, photos } from '../data.js'

// 照片墙：全球 GDG 社区活动 + 谷歌园区，四张一排，进入视口时依次从下往上擦出
export default function Gallery() {
  return (
    <div className="gallery">
      <div className="gallery__head" data-reveal>
        <p className="eyebrow">The GDG community, around the world</p>
        <a href="https://gdg.community.dev" target="_blank" rel="noreferrer">gdg.community.dev ↗</a>
      </div>
      <ul className="gallery__row" data-p>
        {gallery.map((g, i) => (
          <li key={g.photo} style={{ '--d': i }}>
            <Photo photo={photos[g.photo]} className="gallery__photo" />
            <span>{g.caption}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
