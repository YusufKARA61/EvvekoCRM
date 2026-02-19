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
  last_login_at: string | null;
}

export default function BayiTeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Ekip hatasi:", err))
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ekibim</h1>
        <p className="text-gray-500">Ofis ekibini goruntule</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <p className="col-span-full text-center text-sm text-gray-500 py-8">
            Ekip uyesi bulunamadi
          </p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((role) => (
                      <span
                        key={role.id}
                        className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                      >
                        {role.display_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>{user.email}</p>
                {user.phone && <p>{user.phone}</p>}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.is_active ? "Aktif" : "Pasif"}
                </span>
                <span className="text-xs text-gray-400">
                  {user.last_login_at
                    ? `Son: ${new Date(user.last_login_at).toLocaleDateString("tr-TR")}`
                    : "Hic giris yapmadi"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
