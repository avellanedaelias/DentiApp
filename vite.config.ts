import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  // Cast process to any to avoid TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5125',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  };
});