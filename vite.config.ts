import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/

// Local api proxy to run Vercel serverless functions directly in Vite using npm run dev
const localApiProxy = () => ({
  name: 'local-api-proxy',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.originalUrl || req.url;
      if (url && url.startsWith('/api/')) {
        try {
          // Dynamic environment variable reload to support dev hot-reloads of .env
          const env = loadEnv(server.config.mode, process.cwd(), '');
          process.env = { ...process.env, ...env };

          const cleanUrl = url.split('?')[0].replace(/\/$/, ''); // Remove trailing slash
          const modulePath = `.${cleanUrl}.ts`;
          
          const module = await server.ssrLoadModule(modulePath);
          
          // Parse query parameters to mimic Vercel serverless request shape
          const parsedUrl = new URL(url, 'http://localhost');
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());
          
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', async () => {
             try {
                if (body) {
                  try { req.body = JSON.parse(body); } catch (e) { req.body = body; }
                } else {
                  req.body = {};
                }

                res.status = (code: number) => { res.statusCode = code; return res; };
                res.json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                await module.default(req, res);
             } catch (error: any) {
                console.error(`[Local API Proxy] Error in ${modulePath}:`, error);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ 
                  success: false, 
                  error: "Internal Server Error in Local API Proxy",
                  message: error.message 
                }));
             }
          });
        } catch (e) {
          console.error('[Local API Proxy] Route not found or load error:', e);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: "API route not found or failed to load" }));
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  // Dynamically resolve the GitHub owner and repository at build-time
  const netlifyMatch = process.env.REPOSITORY_URL?.match(/github\.com\/([^\/]+)\/([^\/.]+)/);
  const owner = process.env.VITE_GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || netlifyMatch?.[1] || "Shivanshvyas1729";
  const repo = process.env.VITE_GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || netlifyMatch?.[2] || "My_personal_portfolio";

  return {
    define: {
      'import.meta.env.VITE_GITHUB_OWNER': JSON.stringify(owner),
      'import.meta.env.VITE_GITHUB_REPO': JSON.stringify(repo),
    },
    server: {
      host: true,
      port: 8080,
      hmr: {
        overlay: false,
      },
      watch: {
        ignored: [
          "**/node_modules/**",
          "**/dist/**",
          "**/.netlify/**",
          "**/.vercel/**",
          "**/.cache/**"
        ]
      }
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      mode === "development" && localApiProxy(),
    ].filter(Boolean) as any,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    build: {
      // Raise the warning limit so small chunks don't warn
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Three.js & 3D — huge, must be its own chunk
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            // Framer Motion
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Tanstack / react-query
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            // CMS / Admin dashboard (only loaded when admin is open)
            if (id.includes('UnifiedAdminDashboard') || id.includes('ProjectsAdmin') || id.includes('DynamicForm') || id.includes('AdminPanel') || id.includes('CMSContext')) {
              return 'cms';
            }
            // All other node_modules together (including React)
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    }
  };
});