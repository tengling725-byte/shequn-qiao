import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import uniH5Vite from '@dcloudio/uni-h5-vite'

export default defineConfig({
  plugins: [
    ...uniH5Vite(),
    uni()
  ],
  resolve: {
    alias: {
      'vue': '@dcloudio/uni-h5-vue'
    }
  },
  server: {
    port: 5173
  }
})