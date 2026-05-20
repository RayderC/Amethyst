import type { MetadataRoute } from 'next'
import { getSiteConfig } from '@/lib/db'
import { siteConfig as defaults } from '@/lib/siteConfig'

export default function manifest(): MetadataRoute.Manifest {
  const raw = getSiteConfig()
  const name = raw.name || defaults.name
  const bio  = raw.bio  || defaults.bio

  return {
    name,
    short_name: name,
    description: bio,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
