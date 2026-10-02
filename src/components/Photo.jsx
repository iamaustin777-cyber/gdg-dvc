import { PHOTO_LICENSE } from '../data.js'

// 谷歌园区照片 + 署名（CC BY-SA 要求注明作者和许可）
//   scroll：自己带 data-p，单独计算滚动进度（不在 [data-p] 父元素里时用）
//   wipe：进入视口时从一侧擦出（flip 时从右侧）
export default function Photo({ photo, className = '', scroll = false, wipe = false, flip = false, children }) {
  const cls = ['photo', wipe && 'wipe', wipe && flip && 'wipe--flip', className].filter(Boolean).join(' ')
  return (
    <figure className={cls} data-p={scroll || undefined}>
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
      {children}
      <figcaption className="photo__credit">
        <a href={photo.href} target="_blank" rel="noreferrer">Photo: {photo.credit}</a>
        {' · '}
        <a href={PHOTO_LICENSE.href} target="_blank" rel="noreferrer">{PHOTO_LICENSE.label}</a>
      </figcaption>
    </figure>
  )
}
