
import type { Config } from 'vike/types'

export default {
  // Enable client-side routing
  clientRouting: true,
  // Configure meta tags
  meta: {
    title: {
      env: { server: true, client: true }
    },
    description: {
      env: { server: true, client: true }
    }
  }
} satisfies Config
