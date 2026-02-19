import { create } from "zustand";
import api from "@/lib/api";
import type { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetch: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async () => {
    try {
      const response = await api.get("/notifications");
      set({
        notifications: response.data.items,
        unreadCount: response.data.unread_count,
      });
    } catch {
      // sessiz hata
    }
  },

  markAsRead: async (id: number) => {
    await api.post(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.post("/notifications/read-all");
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },
}));
