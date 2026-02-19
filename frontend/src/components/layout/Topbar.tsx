"use client";

import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { useEffect } from "react";

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetch: fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">EvvekoCRM</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Bildirimler */}
        <button className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Kullanici */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500">
              {user?.roles[0]?.display_name}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
        </div>

        {/* Cikis */}
        <button
          onClick={logout}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
          title="Cikis Yap"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
