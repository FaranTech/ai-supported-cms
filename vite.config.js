import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      if (!data) return resolve(undefined)
      try {
        resolve(JSON.parse(data))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function withVercelHelpers(res) {
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
    return res
  }
  return res
}

// Vercel's Node runtime turns each file under api/ into a serverless
// function and auto-parses the JSON body. `vite dev` knows nothing about
// that, so this plugin gives the two API routes (ask.js, mcp.js) the same
// req/res shape locally — no `vercel dev` needed for day-to-day work.
function apiDevMiddleware() {
  const routes = ['/api/ask', '/api/mcp', '/api/search-policies']

  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      for (const route of routes) {
        server.middlewares.use(route, async (req, res, next) => {
          try {
            if (req.method === 'POST' && req.body === undefined) {
              req.body = await readJsonBody(req)
            }
            withVercelHelpers(res)
            // ssrLoadModule (not a raw import()) so Vite's resolver handles
            // the extension-less relative imports inside src/, and so edits
            // are picked up on the next request via Vite's own invalidation.
            const mod = await server.ssrLoadModule(`${route}.js`)
            await mod.default(req, res)
          } catch (err) {
            next(err)
          }
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only forwards VITE_-prefixed vars to import.meta.env by default; the
  // API routes need GEMINI_API_KEY on process.env like it would be on
  // Vercel, so load .env fully (empty prefix) and copy it in for dev.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), apiDevMiddleware()],
  }
})
