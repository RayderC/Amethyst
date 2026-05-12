"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.isAdmin) router.replace("/login");
        else setChecking(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

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
    { href: "/dashboard/hub", label: "Hub", icon: "⬡" },
    { href: "/dashboard/users", label: "Users", icon: "◉" },
  ];

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo-wrap">
          <Link href="/" className="sidebar-logo">Amethyst</Link>
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
