import Mark from './Mark.jsx'
import { join, site } from '../data.js'
import GooeyButton from './GooeyButton.jsx'
import JoinRows from './JoinRows.jsx'

// 加入：三步（三行大字 + 二维码 + 下一次例会）+ 关注 / 干部申请按钮
export default function Join() {
  return (
    <>
      <section className="panel contact" id="join">
        <span className="tag" data-reveal><i />Join</span>
        <h2 className="contact__title" data-reveal>Join GDG in three steps.</h2>
        <p className="heading__sub" data-reveal>No experience needed — just bring your curiosity.</p>

        {/* 三步加入：三行大字 + 二维码 + 下一次例会（JoinRows.jsx） */}
        <JoinRows />

        <div className="contact__cta" data-reveal>
          <GooeyButton variant="solid" href={join.instagram.href} target="_blank" rel="noreferrer">Follow {join.instagram.label}</GooeyButton>
          <GooeyButton variant="ghost" href={join.officer.href} target="_blank" rel="noreferrer">{join.officer.label}</GooeyButton>
        </div>
        <div className="join__links" data-reveal>
          <GooeyButton variant="ghost" href={join.chapter.href} target="_blank" rel="noreferrer" className="gooey-btn--sm">{join.chapter.label} ↗</GooeyButton>
          <GooeyButton variant="ghost" href={join.program.href} target="_blank" rel="noreferrer" className="gooey-btn--sm">{join.program.label} ↗</GooeyButton>
        </div>
      </section>

      <footer className="footer">
        <span className="footer__brand"><Mark size={11} /> {site.club} · {site.campus}</span>
        <span>Independent student chapter. Google and the GDG logo are trademarks of Google LLC.</span>
        {/* 网站作者署名 */}
        <span className="footer__credit">
          Designed &amp; built by <a href="https://github.com/iamaustin777-cyber" target="_blank" rel="noreferrer">Austin Cao</a>
        </span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  )
}
