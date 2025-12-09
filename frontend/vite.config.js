// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',  // Rewrite cookie domain for localhost
        cookiePathRewrite: '/',   // Rewrite cookie path
        // Configure hook for manual cookie forwarding (optional but thorough)
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward cookies from client to backend
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward cookies from backend to client
            const setCookieHeaders = proxyRes.headers['set-cookie'];
            if (setCookieHeaders) {
              proxyRes.headers['set-cookie'] = setCookieHeaders.map(cookie => {
                // Modify cookie attributes for local development
                return cookie
                  .replace(/Domain=[^;]+;?\s*/i, '') // Remove domain restriction
                  .replace(/Secure;?\s*/i, '');       // Remove secure flag for HTTP
              });
            }
          });
        }
      }
    }
  }
})