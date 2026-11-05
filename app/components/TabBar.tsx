"use client";

import Link from "next/link";

// Stroked icons drawn on a 24 x 24 grid, matching NitroLog and AstroFit.
const ICONS: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 9.5V21h5v-6h4v6h5V9.5",
  box: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  gauge: "M12 14l4-4M3.3 19a10 10 0 1 1 17.4 0",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16z",
  menu: "M3 6h18M3 12h18M3 18h18",
};

export type Tab = { label: string; icon: string; href?: string; active?: boolean; onClick?: () => void };

/** The bar along the bottom of the screen on phones. Hidden on larger screens by the stylesheet. */
export default function TabBar({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="tabbar" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(t => {
        const inner = (
          <>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONS[t.icon]} />
            </svg>
            <span>{t.label}</span>
          </>
        );
        const cls = `tabbar-item${t.active ? " active" : ""}`;
        return t.href
          ? <Link key={t.label} href={t.href} className={cls} aria-current={t.active ? "page" : undefined}>{inner}</Link>
          : <button key={t.label} type="button" className={cls} onClick={t.onClick}>{inner}</button>;
      })}
    </nav>
  );
}
