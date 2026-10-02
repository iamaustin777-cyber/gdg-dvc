import { useRef, useState } from 'react';
import './GooeyNav.css';

// 单个按钮版的 GooeyNav：与顶部导航同一套白色胶囊 + 粘性气泡（particle / point / pill 动画复用 GooeyNav.css）
//   variant="solid"：平时就是白色胶囊（等同导航里的选中项），悬停 / 点击再炸一次气泡
//   variant="ghost"：平时只有白字（等同未选中项），悬停时胶囊带着气泡冒出来
// 粘性融合用 App 里的 <GooeyDefs />（#gooey-btn-goo），与 GooeyNav 的做法一致
const PARTICLES = 12;
const DIST = [70, 8];
const R = 100;
const TIME = 600;
const VARIANCE = 300;
const COLORS = [1, 2, 3, 1, 2, 3, 1, 4];

const noise = (n = 1) => n / 2 - Math.random() * n;
const getXY = (distance, i, total) => {
  const angle = ((360 + noise(8)) / total) * i * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

export function GooeyDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="gooey-btn-goo" x="-200%" y="-450%" width="500%" height="1000%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
      </filter>
    </svg>
  );
}

export default function GooeyButton({ variant = 'ghost', className = '', children, onClick, ...rest }) {
  const filterRef = useRef(null);
  const [hover, setHover] = useState(false);
  const on = variant === 'solid' || hover;

  const burst = () => {
    const el = filterRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.querySelectorAll('.particle').forEach((p) => p.remove());
    el.style.setProperty('--time', `${TIME * 2 + VARIANCE}ms`);
    el.classList.remove('active');
    for (let i = 0; i < PARTICLES; i++) {
      const t = TIME * 2 + noise(VARIANCE * 2);
      const rot = noise(R / 10);
      const start = getXY(DIST[0], PARTICLES - i, PARTICLES);
      const end = getXY(DIST[1] + noise(7), PARTICLES - i, PARTICLES);
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${start[0]}px`);
        particle.style.setProperty('--start-y', `${start[1]}px`);
        particle.style.setProperty('--end-x', `${end[0]}px`);
        particle.style.setProperty('--end-y', `${end[1]}px`);
        particle.style.setProperty('--time', `${t}ms`);
        particle.style.setProperty('--scale', `${1 + noise(0.2)}`);
        particle.style.setProperty('--color', `var(--color-${COLORS[(Math.random() * COLORS.length) | 0]}, white)`);
        particle.style.setProperty('--rotate', `${rot > 0 ? (rot + R / 20) * 10 : (rot - R / 20) * 10}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        el.appendChild(particle);
        requestAnimationFrame(() => el.classList.add('active'));
        setTimeout(() => particle.remove(), t);
      }, 30);
    }
  };

  const enter = () => { setHover(true); burst(); };
  const leave = () => setHover(false);

  return (
    <span className={`gooey-btn gooey-btn--${variant} ${on ? 'is-on' : ''} ${className}`}>
      <span className="gooey-btn__effect" ref={filterRef} aria-hidden />
      <a
        className="gooey-btn__label"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
        onClick={(e) => { burst(); onClick?.(e); }}
        {...rest}
      >
        {children}
      </a>
    </span>
  );
}
