import { PHOTO_LICENSE } from '../data.js'
import GeminiPoster from './GeminiPoster.jsx'
import HackCode from './HackCode.jsx'

// 谷歌园区照片 + 署名（CC BY-SA 要求注明作者和许可）
//   scroll：自己带 data-p，单独计算滚动进度（不在 [data-p] 父元素里时用）
//   wipe：进入视口时从一侧擦出（flip 时从右侧）
export default function Photo({ photo, className = '', scroll = false, wipe = false, flip = false, children }) {
  const cls = ['photo', wipe && 'wipe', wipe && flip && 'wipe--flip', className].filter(Boolean).join(' ')
  const license = photo.license || PHOTO_LICENSE // 每张照片可以有自己的许可协议，没写就是 CC BY-SA 4.0
  // 不是照片、而是用网页文字做出来的"海报"（比如 Google AI Studio），任何尺寸都清晰，也不需要署名
  if (photo.graphic === 'code') {
    return (
      <figure className={`${cls} poster poster--code`} data-p={scroll || undefined}>
        <HackCode />
        {children}
      </figure>
    )
  }
  if (photo.graphic === 'gemini') {
    return (
      <figure className={`${cls} poster poster--gemini`} data-p={scroll || undefined} role="img" aria-label={photo.alt}>
        <GeminiPoster />
        {children}
      </figure>
    )
  }
  if (photo.graphic === 'ai-studio') {
    return (
      <figure className={`${cls} poster poster--ai-studio`} data-p={scroll || undefined} role="img" aria-label={photo.alt}>
        <div className="poster__inner">
          <p className="poster__title">
            <svg className="poster__icon" viewBox="0 0 48 48" fill="none" aria-hidden>
              <path d="M30 6H14a8 8 0 0 0-8 8v20a8 8 0 0 0 8 8h20a8 8 0 0 0 8-8V18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M38 2.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5Z" fill="currentColor" />
            </svg>
            Google AI Studio
          </p>
          <p className="poster__sub">The fastest path from prompt to production with Gemini</p>
        </div>
        {children}
      </figure>
    )
  }
  return (
    <figure className={cls} data-p={scroll || undefined}>
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
      {children}
      <figcaption className="photo__credit">
        <a href={photo.href} target="_blank" rel="noreferrer">Photo: {photo.credit}</a>
        {' · '}
        <a href={license.href} target="_blank" rel="noreferrer">{license.label}</a>
      </figcaption>
    </figure>
  )
}
