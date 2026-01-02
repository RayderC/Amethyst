'use client';

import Navigation from "../components/Navigation";
import '../globals.css';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement & {
      email: { value: string };
      password: { value: string };
    };
    const email = form.email.value.trim();
    const password = form.password.value;
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) router.push("/dashboard");
    else setError((await res.json()).message || "Error");
  }

  return (
    <div>
      <Navigation />
      <div style={{ paddingBottom: "10px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>Register</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="login-input">
          <input type="email" id="email" name="email" required placeholder="Enter Your Email" />
        </div>

        <div className="login-input">
          <input type="password" id="password" name="password" required placeholder="Enter Your Password" />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}