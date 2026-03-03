"use client";

import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create staff accounts, update roles, and deactivate users.
          </p>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>Create staff account</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-4" onSubmit={createUser}>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-4">
                <Button type="submit">Create user</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <select
                        value={user.role}
                        onChange={(event) => updateRole(user.id, event.target.value as Role)}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => deleteUser(user.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
