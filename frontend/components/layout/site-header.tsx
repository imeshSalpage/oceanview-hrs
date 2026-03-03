"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { clearToken, getRoleFromToken, getToken, getUsernameFromToken } from "@/lib/auth";

export function SiteHeader() {
  const authState = useMemo(() => {
    const token = getToken();
    return {
      role: getRoleFromToken(token),
      username: getUsernameFromToken(token),
      isAuthenticated: Boolean(token),
    };
  }, []);

  const isStaff = authState.role === "ADMIN" || authState.role === "RECEPTION";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-white">
          Ocean View Resort
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex dark:text-slate-300">
          <Link href="/help">Help</Link>
          <Link href="/my-reservations">My Reservations</Link>
          {isStaff ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/reservations">Reservations</Link>
              <Link href="/reports">Reports</Link>
            </>
          ) : null}
          {authState.role === "ADMIN" ? <Link href="/users">Users</Link> : null}
        </nav>
        <div className="flex items-center gap-3">
          {authState.isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
                {authState.username} · {authState.role}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearToken();
                  window.location.href = "/";
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
