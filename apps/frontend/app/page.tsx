"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { Dashboard } from "@/components/dashboard";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      console.log(
        "[HomePage] Auth check - isAuthenticated:",
        isAuthenticated,
        "role:",
        user?.role
      );
      if (!isAuthenticated) {
        console.log("[HomePage] Not authenticated, redirecting to /login");
        router.push("/login");
      } else if (user?.role === "admin") {
        console.log(
          "[HomePage] Admin user detected, redirecting to /admin/panel"
        );
        router.push("/admin/panel");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  );
}
