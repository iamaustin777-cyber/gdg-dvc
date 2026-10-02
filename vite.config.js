import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 网站放在 Firebase Hosting：https://gdg-dvc.web.app/（根路径，所以 base 是 '/'）
// 代码里的图片 / 数据路径都写成相对路径（media/...、data/...），以后换成子路径或自己的域名也不用改代码
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { port: 5173 },
})
