"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Waves } from "lucide-react";

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

  return (
    <header
      className="sticky top-0 z-20 border-b border-sky-100/60"
      style={{
        background: "rgba(240, 251, 255, 0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 1px 3px rgba(14,116,144,0.08), 0 4px 16px -4px rgba(14,116,144,0.10)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white text-sm font-bold shadow shadow-cyan-200/60 transition-transform group-hover:scale-105">
            <Waves className="h-4 w-4" />
          </span>
          <span className="text-base font-bold text-slate-900 tracking-tight">Ocean View Resort</span>
        </Link>

        {/* Main nav — public links only */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            ...(authState.isAuthenticated ? [{ href: "/dashboard", label: "Dashboard" }] : []),
            { href: "/rooms", label: "Rooms" },
            { href: "/experiences", label: "Experiences" },
            { href: "/contact", label: "Contact" },
            { href: "/help", label: "Help" },
            { href: "/my-reservations", label: "My Reservations" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {authState.isAuthenticated ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold text-slate-900">{authState.username}</span>
                <span className="text-xs text-sky-600 font-medium">{authState.role}</span>
              </div>
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
              <Button asChild size="sm" className="shadow shadow-cyan-200/50">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

