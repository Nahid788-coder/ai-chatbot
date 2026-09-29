import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

type Handler = (req: IncomingMessage, res: ServerResponse) => unknown

/**
 * Serves the Vercel functions in /api during `npm run dev`,
 * so the app works locally exactly like it does in production.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        const match = path.match(/^\/api\/([a-z-]+)$/)
        if (!match) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.js`)
          await (mod.default as Handler)(req, res)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: (err as Error).message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make non-VITE_ keys from .env visible to the local /api functions.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), localApi()],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'supabase', test: /node_modules[\\/]@supabase/ },
              { name: 'markdown', test: /node_modules[\\/](react-markdown|remark|rehype|micromark|mdast|hast|unified|unist|vfile|property-information|decode-named|character-|html-url|space-separated|comma-separated|trim-lines|devlop|bail|ccount|zwitch|longest-streak|markdown-table|escape-string|is-plain|trough|style-to|inline-style|estree|extend)/ },
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            ],
          },
        },
      },
    },
  }
})
