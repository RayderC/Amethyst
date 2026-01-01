"use client";
import './globals.css';  // Import the global CSS file

// Define the layout structure
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <title>Amethyst</title>
      <body>
        <div className="rounded-square">{children}</div> {/* This is where your page content will go */}
      </body>
    </html>
  );
}
