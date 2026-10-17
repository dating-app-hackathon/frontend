// Built as a static site for GitHub Pages (no server: the mock backend runs in the
// browser, see lib/api.js). On Pages the site lives under /<repo>, so the deploy
// workflow sets BASE_PATH=/frontend; locally it stays at the root.
const basePath = process.env.BASE_PATH ?? ''

export default {
  output: 'export',
  basePath,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // face-api.js ships Node-only code paths (fs, encoding) that never run in the browser
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, encoding: false }
    return config
  },
}
