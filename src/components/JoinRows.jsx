import { useMemo } from 'react'
import { events, join } from '../data.js'
import { calendarUrl, nextWeekly, timeRange } from './Schedule.jsx'
import './blocks.css'

// "Join GDG in three steps" 的新写法：三行大字，没有卡片、没有外框
// 每一行都既能点（标题、下面的网址、二维码本身都是链接）也能扫（二维码）：电脑上点，手机上扫
// 每一行就是一个动作；悬停那一行时，右侧的二维码从左往右"扫"出来（一条扫描线经过一次）
// 第三行直接写出下一次例会的日期，点击加到 Google 日历
const Arrow = () => (
  <svg className="jr__icon" width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M4 10 10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function JoinRows() {
  const weekly = events.list.find((e) => e.recur)
  const next = useMemo(() => (weekly ? nextWeekly(weekly, new Date()) : null), [weekly])
  const nextText = next ? next.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''
  const [ig, sync] = join.steps

  return (
    <ol className="jr">
      <li className="jr__row tone-blue">
        <span className="jr__step">1</span>
        <a className="jr__main" href={ig.href} target="_blank" rel="noreferrer">
          <span className="jr__title">Follow <em>@gdgoc_dvc</em> on Instagram</span>
          <span className="jr__sub">Announcements, events and hackathon news.</span>
          <span className="jr__link">instagram.com/gdgoc_dvc <Arrow /></span>
        </a>
        <a className="jr__qr" href={ig.href} target="_blank" rel="noreferrer" aria-label="Open @gdgoc_dvc on Instagram"><img src={ig.qr} alt="QR code for @gdgoc_dvc on Instagram" loading="lazy" /><i /></a>
      </li>
      <li className="jr__row tone-red">
        <span className="jr__step">2</span>
        <a className="jr__main" href={sync.href} target="_blank" rel="noreferrer">
          <span className="jr__title">Join us on <em>DVC Sync</em></span>
          <span className="jr__sub">Become an official member through DVC’s club platform — click the link or scan the code.</span>
          <span className="jr__link">dvc.campuslabs.com/engage <Arrow /></span>
        </a>
        <a className="jr__qr" href={sync.href} target="_blank" rel="noreferrer" aria-label="Open GDG on DVC Sync"><img src={sync.qr} alt="QR code for GDG on DVC Sync" loading="lazy" /><i /></a>
      </li>
      {next && (
        <li className="jr__row tone-yellow">
          <span className="jr__step">3</span>
          <a className="jr__main" href={calendarUrl(weekly, next)} target="_blank" rel="noreferrer">
            <span className="jr__title">Come by <em>{nextText}</em></span>
            <span className="jr__sub">{timeRange(weekly)} in {weekly.room}. No experience needed — add it to your Google Calendar.</span>
          </a>
          <span className="jr__go" aria-hidden><Arrow /></span>
        </li>
      )}
    </ol>
  )
}
