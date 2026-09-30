import type { NextConfig } from 'next'
import path from 'node:path'
const config: NextConfig = {
  turbopack: { root: path.resolve('.') },
  devIndicators: false,
}
export default config
