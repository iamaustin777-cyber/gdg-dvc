import Photo from './Photo.jsx'

// 杂志式一行：大照片 + 彩色大编号 + 标题 + 说明，奇偶行左右交错，没有框
// 滚动时照片从一侧擦出并带视差，文字上浮淡入（进度变量见 hooks.js · useScrollVars）
export default function Row({ n, tone, title, text, photo, flip, children }) {
  return (
    <article className={`ed-row ${flip ? 'is-flip' : ''}`} data-p>
      <Photo photo={photo} wipe flip={flip} className="ed-row__photo" />
      <div className="ed-row__copy rise">
        <span className={`num c-${tone}`}>{n}</span>
        <h3>{title}</h3>
        <p>{text}</p>
        {children}
      </div>
    </article>
  )
}
