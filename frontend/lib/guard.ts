"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { getRoleFromToken, getToken } from "@/lib/auth";
import type { Role } from "@/lib/types";

export function useRoleGuard(allowedRoles: Role[], redirectTo: string) {
  const router = useRouter();
  const isClient = typeof window !== "undefined";

  const role = useMemo(() => {
    if (!isClient) return null;
    return getRoleFromToken(getToken());
  }, [isClient]);

  const isAllowed = Boolean(role && allowedRoles.includes(role));

  useEffect(() => {
    if (!isClient) return;
    if (!role) {
      router.replace(redirectTo);
      return;
    }
    if (!isAllowed) {
      router.replace("/");
    }
  }, [isAllowed, isClient, redirectTo, role, router]);

  return { isAllowed, isClient, role };
}
