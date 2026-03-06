"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BarChart3, BedSingle, ClipboardList, LayoutDashboard, UserCog } from "lucide-react";

import { getRoleFromToken, getToken } from "@/lib/auth";

const staffLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/room-types", label: "Room Types", icon: BedSingle },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const adminOnlyLinks = [{ href: "/users", label: "Users", icon: UserCog }];

export function DashboardNav() {
  const pathname = usePathname();
  const role = useMemo(() => getRoleFromToken(getToken()), []);

  const links = [
    ...staffLinks,
    ...(role === "ADMIN" ? adminOnlyLinks : []),
  ];

  return (
    <nav
      className="sticky top-[57px] z-10 border-b border-sky-100/80"
      style={{
        background: "rgba(224, 247, 253, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 2px 8px -2px rgba(14, 116, 144, 0.10)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-6 py-2 scrollbar-none">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-600 text-white shadow-sm shadow-sky-200"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
