"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Role gore yonlendir
    if (user) {
      const roleNames = user.roles.map((r) => r.name);
      if (roleNames.some((r) => r.startsWith("franchise_"))) {
        router.push("/bayi/dashboard");
      } else {
        router.push("/merkez/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}
