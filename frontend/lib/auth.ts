import type { Role } from "@/lib/types";

const TOKEN_KEY = "ovr.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): Role | null {
  if (!token) return null;
  const claims = parseJwt(token);
  const role = claims?.role;
  if (typeof role === "string") {
    return role as Role;
  }
  return null;
}

export function getUsernameFromToken(token: string | null): string | null {
  if (!token) return null;
  const claims = parseJwt(token);
  const username = claims?.sub;
  if (typeof username === "string") {
    return username;
  }
  return null;
}
