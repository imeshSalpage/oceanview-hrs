"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UsersRound } from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";
import type { Role, UserResponse } from "@/lib/types";

const roles: Role[] = ["ADMIN", "RECEPTION", "CUSTOMER"];

export default function UsersPage() {
  const guard = useRoleGuard(["ADMIN"], "/login");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "RECEPTION" as Role,
  });

  useEffect(() => {
    let active = true;
    api
      .get<UserResponse[]>("/api/users")
      .then((data) => {
        if (active) {
          setUsers(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load users");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/users", form);
      setForm({ username: "", email: "", password: "", role: "RECEPTION" });
      const data = await api.get<UserResponse[]>("/api/users");
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const updateRole = async (id: string, role: Role) => {
    try {
      await api.patch(`/api/users/${id}/role`, { role });
      const data = await api.get<UserResponse[]>("/api/users");
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.del(`/api/users/${id}`);
      const data = await api.get<UserResponse[]>("/api/users");
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />
      <DashboardNav />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-1">
          <span className="ocean-pill inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Admin</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Create staff accounts, update roles, and deactivate users.</p>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        {/* Create staff account */}
        <div className="ocean-surface rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 inline-flex items-center gap-1.5"><UsersRound className="h-4 w-4" />Create staff account</h2>
          <form className="grid gap-4 md:grid-cols-4" onSubmit={createUser}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</label>
              <input className="ocean-input" required value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <input type="email" className="ocean-input" required value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <input type="password" className="ocean-input" required value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <select className="ocean-input" value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <Button type="submit">Create user</Button>
            </div>
          </form>
        </div>

        {/* Users table */}
        <div className="card-ocean overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-100 bg-sky-50/60">
                  {["Username", "Email", "Role", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white/70 hover:bg-sky-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.username}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value as Role)}
                        className="h-8 rounded-lg border border-sky-200 bg-white px-2 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => deleteUser(user.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
