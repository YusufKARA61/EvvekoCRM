"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active: boolean;
  roles: { id: number; name: string; display_name: string }[];
  franchise_office_id: number | null;
  last_login_at: string | null;
  created_at: string;
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Ekip veri hatasi:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ekip Yonetimi</h1>
          <p className="text-gray-500">Kullanicilari ve rolleri yonetin</p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700">
          + Yeni Kullanici
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Kullanici</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Telefon</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Son Giris</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Kullanici bulunamadi
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.phone || "-"}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {role.display_name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString("tr-TR")
                        : "Hic giris yapmadi"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
