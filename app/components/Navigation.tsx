"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname() ?? "";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">RayderC</Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link${pathname === "/" ? " active" : ""}`}>Home</Link>
          <Link href="/projects" className={`nav-link${pathname.startsWith("/projects") ? " active" : ""}`}>Projects</Link>
          {isAdmin && (
            <Link href="/sessions" className={`nav-link${pathname.startsWith("/sessions") ? " active" : ""}`}>Sessions</Link>
          )}
          {isAdmin && (
            <Link href="/dashboard" className={`nav-link${pathname.startsWith("/dashboard") ? " active" : ""}`}>
              Dashboard
            </Link>
          )}
        </div>

        <div className="nav-actions" />
      </div>
    </nav>
  );
}
