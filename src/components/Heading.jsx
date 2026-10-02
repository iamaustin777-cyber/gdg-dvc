// 区块标题（杂志式）：左边四色短条标签 + 大标题，右边一段说明，底部对齐
export default function Heading({ tag, title, sub }) {
  return (
    <header className="heading" data-reveal>
      <div>
        <span className="tag"><i />{tag}</span>
        <h2 className="heading__title">{title}</h2>
      </div>
      {sub && <p className="heading__sub">{sub}</p>}
    </header>
  )
}
