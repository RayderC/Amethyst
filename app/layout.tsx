import './globals.css';
import type { Metadata } from 'next';
import CircuitBackground from './components/CircuitBackground';
import { getSiteConfig } from '@/lib/db';
import { siteConfig as defaults } from '@/lib/siteConfig';

export async function generateMetadata(): Promise<Metadata> {
  const raw = getSiteConfig();
  const name  = raw.name  || defaults.name;
  const badge = raw.badge_title || defaults.title;
  const bio   = raw.bio   || defaults.bio;

  return {
    title: `${name} — ${badge}`,
    description: bio,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: name,
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CircuitBackground />
        {children}
      </body>
    </html>
  );
}
