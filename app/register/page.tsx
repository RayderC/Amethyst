"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.target as HTMLFormElement & {
      email: { value: string };
      password: { value: string };
    };
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email: form.email.value.trim(), password: form.password.value }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard");
    else setError((await res.json()).message || "Registration failed");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">Amethyst</Link>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Register to manage your portfolio</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className="form-input" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="form-input" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "4px" }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--text-subtle)", textAlign: "center" }}>
          Already have an account?{" "}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
