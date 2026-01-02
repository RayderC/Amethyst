"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <div className="nav-buttons">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-button ${pathname === item.href ? "active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}