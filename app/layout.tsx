import './globals.css';
import type { Metadata } from 'next';
import CircuitBackground from './components/CircuitBackground';

export const metadata: Metadata = {
  title: 'RayderC — Maker & Fabricator',
  description: 'Portfolio of RayderC — Welding, fabrication, CAD, 3D printing, and custom builds.',
};

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
