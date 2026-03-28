"use client";

import Link from "next/link";
import { useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { clearToken, setToken } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", {
        username,
        password,
      });
      setToken(response.token);
      if (response.role === "CUSTOMER") {
        window.location.href = "/my-reservations";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      // Prevent stale sessions from previous users after a failed login attempt.
      clearToken();
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ocean-wave">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Log in to manage your reservations and dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="john.snow"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error ? <p className="text-sm text-rose-500">{error}</p> : null}
              <Button className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Log in"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              New to Ocean View Resort?{" "}
              <Link href="/register" className="font-medium text-slate-900 dark:text-white">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
