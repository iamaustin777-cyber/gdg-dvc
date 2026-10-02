import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 上线到 GitHub Pages：网址是 https://iamaustin777-cyber.github.io/gdg-dvc/，所以打包时所有资源都放在 /gdg-dvc/ 下面。
// 本地开发（npm run dev）仍然是 http://localhost:5173/。代码里的图片 / 数据路径都写成相对路径（media/...、data/...），两边都能用。
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/gdg-dvc/' : '/', // build 和 preview 是 production，dev 是 development
  plugins: [react()],
  server: { port: 5173 },
}))
