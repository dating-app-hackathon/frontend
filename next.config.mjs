// face-api.js ships Node-only code paths (fs, encoding) that never run in the browser
export default {
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, encoding: false }
    return config
  },
}
