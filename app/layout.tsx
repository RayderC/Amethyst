import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amethyst — RayderC',
  description: 'Portfolio of RayderC — Full-Stack Developer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
