import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
  preview: {
    allowedHosts: ['gxg.kro.kr'],
  },
	server: {
    allowedHosts: ['gxg.kro.kr'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/ws2/socket.io': {
        target: 'http://localhost:8000',
        ws: true, // << 중요!! WebSocket 연결 열어줘야 해
        changeOrigin: true,
      },
    },
  },
});
