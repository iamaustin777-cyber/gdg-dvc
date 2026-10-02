// GDG 官方标志：左括号 红(上) / 蓝(下，压在红上)，右括号 绿(上，压在黄上) / 黄(下)
// 比例按官方标志描摹：粗圆头笔画，两个括号之间留一道窄缝
// weight / spread 是旧版参数，保留只为兼容调用处，已不再使用
export const MARK_RATIO = 110 / 58

export default function Mark({ size = 28, className = '' }) {
  return (
    <svg className={`mark ${className}`} width={size * MARK_RATIO} height={size} viewBox="0 0 110 58" aria-hidden>
      <g strokeLinecap="round" strokeWidth="18" fill="none">
        <path className="m1" d="M40 10 9 29" stroke="var(--g-red)" />
        <path className="m2" d="M9 29l31 19" stroke="var(--g-blue)" />
        <path className="m4" d="M101 29 70 48" stroke="var(--g-yellow)" />
        <path className="m3" d="M70 10l31 19" stroke="var(--g-green)" />
      </g>
    </svg>
  )
}
