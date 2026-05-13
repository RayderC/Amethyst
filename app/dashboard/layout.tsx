"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.isAdmin) router.replace("/login");
        else setChecking(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Verifying access…
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Projects", icon: "◈" },
    { href: "/dashboard/new", label: "New Project", icon: "+" },
    { href: "/dashboard/home", label: "Home Page", icon: "⌂" },
    { href: "/dashboard/hub", label: "Hub", icon: "⬡" },
    { href: "/dashboard/users", label: "Users", icon: "◉" },
  ];

  return (
    <div className="dashboard-root">
      {/* Mobile top bar */}
      <div className="dash-mobile-bar">
        <button className="dash-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <span className="dash-mobile-title">Dashboard</span>
      </div>

      {/* Backdrop */}
      {menuOpen && <div className="dash-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-logo-wrap">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" className="sidebar-logo">Amethyst</Link>
            <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <span className="sidebar-tag">Admin Dashboard</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-label">Content</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item${pathname === item.href ? " active" : ""}`}
            >
              <span style={{ fontSize: "16px", opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <Link href="/" className="sidebar-item">
            <span style={{ fontSize: "14px", opacity: 0.7 }}>↗</span>
            View Site
          </Link>
          <button onClick={handleLogout} className="sidebar-item" style={{ color: "var(--danger)", width: "100%" }}>
            <span style={{ fontSize: "14px", opacity: 0.7 }}>→</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
