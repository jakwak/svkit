import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [tailwindcss(), sveltekit()],
    preview: {
      allowedHosts: ['gxg.kro.kr'],
    },
    server: {
      allowedHosts: ['gxg.kro.kr'],
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
        '/ws2/socket.io': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          ws: true, // << 중요!! WebSocket 연결 열어줘야 해
          changeOrigin: true,
        },
      },
    },
  };
});
