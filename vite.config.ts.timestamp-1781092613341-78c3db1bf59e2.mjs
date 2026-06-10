// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/DELL/Desktop/my_portfolio/shivansh-ai-forge/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/DELL/Desktop/my_portfolio/shivansh-ai-forge/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/DELL/Desktop/my_portfolio/shivansh-ai-forge/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\DELL\\Desktop\\my_portfolio\\shivansh-ai-forge";
var localApiProxy = () => ({
  name: "local-api-proxy",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.originalUrl || req.url;
      if (url && url.startsWith("/api/")) {
        try {
          const env = loadEnv(server.config.mode, process.cwd(), "");
          process.env = { ...process.env, ...env };
          const cleanUrl = url.split("?")[0].replace(/\/$/, "");
          const modulePath = `.${cleanUrl}.ts`;
          const module = await server.ssrLoadModule(modulePath);
          const parsedUrl = new URL(url, "http://localhost");
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              if (body) {
                try {
                  req.body = JSON.parse(body);
                } catch (e) {
                  req.body = body;
                }
              } else {
                req.body = {};
              }
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              };
              await module.default(req, res);
            } catch (error) {
              console.error(`[Local API Proxy] Error in ${modulePath}:`, error);
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                error: "Internal Server Error in Local API Proxy",
                message: error.message
              }));
            }
          });
        } catch (e) {
          console.error("[Local API Proxy] Route not found or load error:", e);
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, error: "API route not found or failed to load" }));
        }
      } else {
        next();
      }
    });
  }
});
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };
  const netlifyMatch = process.env.REPOSITORY_URL?.match(/github\.com\/([^\/]+)\/([^\/.]+)/);
  const owner = process.env.VITE_GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || netlifyMatch?.[1] || "Shivanshvyas1729";
  const repo = process.env.VITE_GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || netlifyMatch?.[2] || "My_personal_portfolio";
  return {
    define: {
      "import.meta.env.VITE_GITHUB_OWNER": JSON.stringify(owner),
      "import.meta.env.VITE_GITHUB_REPO": JSON.stringify(repo)
    },
    server: {
      host: true,
      port: 8080,
      hmr: {
        overlay: false
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
      mode === "development" && localApiProxy()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
    },
    build: {
      // Raise the warning limit so small chunks don't warn
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-three";
            }
            if (id.includes("framer-motion")) {
              return "vendor-framer";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("@tanstack")) {
              return "vendor-query";
            }
            if (id.includes("UnifiedAdminDashboard") || id.includes("ProjectsAdmin") || id.includes("DynamicForm") || id.includes("AdminPanel") || id.includes("CMSContext") || id.includes("src/components/cms/") || id.includes("react-easy-crop")) {
              return "cms";
            }
            if (id.includes("node_modules")) {
              return "vendor";
            }
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxERUxMXFxcXERlc2t0b3BcXFxcbXlfcG9ydGZvbGlvXFxcXHNoaXZhbnNoLWFpLWZvcmdlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxERUxMXFxcXERlc2t0b3BcXFxcbXlfcG9ydGZvbGlvXFxcXHNoaXZhbnNoLWFpLWZvcmdlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ERUxML0Rlc2t0b3AvbXlfcG9ydGZvbGlvL3NoaXZhbnNoLWFpLWZvcmdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5cclxuLy8gTG9jYWwgYXBpIHByb3h5IHRvIHJ1biBWZXJjZWwgc2VydmVybGVzcyBmdW5jdGlvbnMgZGlyZWN0bHkgaW4gVml0ZSB1c2luZyBucG0gcnVuIGRldlxyXG5jb25zdCBsb2NhbEFwaVByb3h5ID0gKCkgPT4gKHtcclxuICBuYW1lOiAnbG9jYWwtYXBpLXByb3h5JyxcclxuICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBhbnkpIHtcclxuICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoYXN5bmMgKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IHJlcS5vcmlnaW5hbFVybCB8fCByZXEudXJsO1xyXG4gICAgICBpZiAodXJsICYmIHVybC5zdGFydHNXaXRoKCcvYXBpLycpKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIER5bmFtaWMgZW52aXJvbm1lbnQgdmFyaWFibGUgcmVsb2FkIHRvIHN1cHBvcnQgZGV2IGhvdC1yZWxvYWRzIG9mIC5lbnZcclxuICAgICAgICAgIGNvbnN0IGVudiA9IGxvYWRFbnYoc2VydmVyLmNvbmZpZy5tb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcbiAgICAgICAgICBwcm9jZXNzLmVudiA9IHsgLi4ucHJvY2Vzcy5lbnYsIC4uLmVudiB9O1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNsZWFuVXJsID0gdXJsLnNwbGl0KCc/JylbMF0ucmVwbGFjZSgvXFwvJC8sICcnKTsgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoXHJcbiAgICAgICAgICBjb25zdCBtb2R1bGVQYXRoID0gYC4ke2NsZWFuVXJsfS50c2A7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGF3YWl0IHNlcnZlci5zc3JMb2FkTW9kdWxlKG1vZHVsZVBhdGgpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBQYXJzZSBxdWVyeSBwYXJhbWV0ZXJzIHRvIG1pbWljIFZlcmNlbCBzZXJ2ZXJsZXNzIHJlcXVlc3Qgc2hhcGVcclxuICAgICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwodXJsLCAnaHR0cDovL2xvY2FsaG9zdCcpO1xyXG4gICAgICAgICAgcmVxLnF1ZXJ5ID0gT2JqZWN0LmZyb21FbnRyaWVzKHBhcnNlZFVybC5zZWFyY2hQYXJhbXMuZW50cmllcygpKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgbGV0IGJvZHkgPSAnJztcclxuICAgICAgICAgIHJlcS5vbignZGF0YScsIChjaHVuazogYW55KSA9PiB7IGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTsgfSk7XHJcbiAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgICAgICAgICAgICB0cnkgeyByZXEuYm9keSA9IEpTT04ucGFyc2UoYm9keSk7IH0gY2F0Y2ggKGUpIHsgcmVxLmJvZHkgPSBib2R5OyB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICByZXEuYm9keSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMgPSAoY29kZTogbnVtYmVyKSA9PiB7IHJlcy5zdGF0dXNDb2RlID0gY29kZTsgcmV0dXJuIHJlczsgfTtcclxuICAgICAgICAgICAgICAgIHJlcy5qc29uID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgYXdhaXQgbW9kdWxlLmRlZmF1bHQocmVxLCByZXMpO1xyXG4gICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW0xvY2FsIEFQSSBQcm94eV0gRXJyb3IgaW4gJHttb2R1bGVQYXRofTpgLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgXHJcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcclxuICAgICAgICAgICAgICAgICAgZXJyb3I6IFwiSW50ZXJuYWwgU2VydmVyIEVycm9yIGluIExvY2FsIEFQSSBQcm94eVwiLFxyXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0xvY2FsIEFQSSBQcm94eV0gUm91dGUgbm90IGZvdW5kIG9yIGxvYWQgZXJyb3I6JywgZSk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIkFQSSByb3V0ZSBub3QgZm91bmQgb3IgZmFpbGVkIHRvIGxvYWRcIiB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5leHQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICAvLyBMb2FkIGVudiBmaWxlIGJhc2VkIG9uIGBtb2RlYCBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcclxuICBwcm9jZXNzLmVudiA9IHsgLi4ucHJvY2Vzcy5lbnYsIC4uLmVudiB9O1xyXG5cclxuICAvLyBEeW5hbWljYWxseSByZXNvbHZlIHRoZSBHaXRIdWIgb3duZXIgYW5kIHJlcG9zaXRvcnkgYXQgYnVpbGQtdGltZVxyXG4gIGNvbnN0IG5ldGxpZnlNYXRjaCA9IHByb2Nlc3MuZW52LlJFUE9TSVRPUllfVVJMPy5tYXRjaCgvZ2l0aHViXFwuY29tXFwvKFteXFwvXSspXFwvKFteXFwvLl0rKS8pO1xyXG4gIGNvbnN0IG93bmVyID0gcHJvY2Vzcy5lbnYuVklURV9HSVRIVUJfT1dORVIgfHwgcHJvY2Vzcy5lbnYuVkVSQ0VMX0dJVF9SRVBPX09XTkVSIHx8IG5ldGxpZnlNYXRjaD8uWzFdIHx8IFwiU2hpdmFuc2h2eWFzMTcyOVwiO1xyXG4gIGNvbnN0IHJlcG8gPSBwcm9jZXNzLmVudi5WSVRFX0dJVEhVQl9SRVBPIHx8IHByb2Nlc3MuZW52LlZFUkNFTF9HSVRfUkVQT19TTFVHIHx8IG5ldGxpZnlNYXRjaD8uWzJdIHx8IFwiTXlfcGVyc29uYWxfcG9ydGZvbGlvXCI7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0dJVEhVQl9PV05FUic6IEpTT04uc3RyaW5naWZ5KG93bmVyKSxcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0dJVEhVQl9SRVBPJzogSlNPTi5zdHJpbmdpZnkocmVwbyksXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6IHRydWUsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICAgIGhtcjoge1xyXG4gICAgICAgIG92ZXJsYXk6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICB3YXRjaDoge1xyXG4gICAgICAgIGlnbm9yZWQ6IFtcclxuICAgICAgICAgIFwiKiovbm9kZV9tb2R1bGVzLyoqXCIsXHJcbiAgICAgICAgICBcIioqL2Rpc3QvKipcIixcclxuICAgICAgICAgIFwiKiovLm5ldGxpZnkvKipcIixcclxuICAgICAgICAgIFwiKiovLnZlcmNlbC8qKlwiLFxyXG4gICAgICAgICAgXCIqKi8uY2FjaGUvKipcIlxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSwgXHJcbiAgICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGxvY2FsQXBpUHJveHkoKSxcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pIGFzIGFueSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgfSxcclxuICAgICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0L2pzeC1ydW50aW1lXCIsIFwicmVhY3QvanN4LWRldi1ydW50aW1lXCJdLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIC8vIFJhaXNlIHRoZSB3YXJuaW5nIGxpbWl0IHNvIHNtYWxsIGNodW5rcyBkb24ndCB3YXJuXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUaHJlZS5qcyAmIDNEIFx1MjAxNCBodWdlLCBtdXN0IGJlIGl0cyBvd24gY2h1bmtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd0aHJlZScpIHx8IGlkLmluY2x1ZGVzKCdAcmVhY3QtdGhyZWUnKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXRocmVlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBGcmFtZXIgTW90aW9uXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZnJhbWVyLW1vdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZnJhbWVyJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBSYWRpeCBVSSBjb21wb25lbnRzXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHJhZGl4LXVpJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yYWRpeCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gVGFuc3RhY2sgLyByZWFjdC1xdWVyeVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0B0YW5zdGFjaycpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcXVlcnknO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENNUyAvIEFkbWluIGRhc2hib2FyZCAob25seSBsb2FkZWQgd2hlbiBhZG1pbiBpcyBvcGVuKVxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ1VuaWZpZWRBZG1pbkRhc2hib2FyZCcpIHx8IFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdQcm9qZWN0c0FkbWluJykgfHwgXHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ0R5bmFtaWNGb3JtJykgfHwgXHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ0FkbWluUGFuZWwnKSB8fCBcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnQ01TQ29udGV4dCcpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3NyYy9jb21wb25lbnRzL2Ntcy8nKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdyZWFjdC1lYXN5LWNyb3AnKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2Ntcyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQWxsIG90aGVyIG5vZGVfbW9kdWxlcyB0b2dldGhlciAoaW5jbHVkaW5nIFJlYWN0KVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHIiXSwKICAibWFwcGluZ3MiOiAiO0FBQTBWLFNBQVMsY0FBYyxlQUFlO0FBQ2hZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTSxnQkFBZ0IsT0FBTztBQUFBLEVBQzNCLE1BQU07QUFBQSxFQUNOLGdCQUFnQixRQUFhO0FBQzNCLFdBQU8sWUFBWSxJQUFJLE9BQU8sS0FBVSxLQUFVLFNBQWM7QUFDOUQsWUFBTSxNQUFNLElBQUksZUFBZSxJQUFJO0FBQ25DLFVBQUksT0FBTyxJQUFJLFdBQVcsT0FBTyxHQUFHO0FBQ2xDLFlBQUk7QUFFRixnQkFBTSxNQUFNLFFBQVEsT0FBTyxPQUFPLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUN6RCxrQkFBUSxNQUFNLEVBQUUsR0FBRyxRQUFRLEtBQUssR0FBRyxJQUFJO0FBRXZDLGdCQUFNLFdBQVcsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsUUFBUSxPQUFPLEVBQUU7QUFDcEQsZ0JBQU0sYUFBYSxJQUFJLFFBQVE7QUFFL0IsZ0JBQU0sU0FBUyxNQUFNLE9BQU8sY0FBYyxVQUFVO0FBR3BELGdCQUFNLFlBQVksSUFBSSxJQUFJLEtBQUssa0JBQWtCO0FBQ2pELGNBQUksUUFBUSxPQUFPLFlBQVksVUFBVSxhQUFhLFFBQVEsQ0FBQztBQUUvRCxjQUFJLE9BQU87QUFDWCxjQUFJLEdBQUcsUUFBUSxDQUFDLFVBQWU7QUFBRSxvQkFBUSxNQUFNLFNBQVM7QUFBQSxVQUFHLENBQUM7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
