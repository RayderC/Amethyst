'use client';

import Navigation from "../components/Navigation";
import '../globals.css';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: number; email: string };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.email) setUser(data)
        else router.push("/login")
      });
  }, []);

  const onLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  if (!user) return <div>Loading...</div>;
  return (
    <div>
      <Navigation />
      <div style={{ paddingBottom: "10px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          Dashboard
        </h1>
      </div>
      <div>
        <p style={{ fontWeight: "bold" }}>Welcome, {user.email}!</p>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}