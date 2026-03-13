"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { Dashboard } from "@/components/dashboard";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect admin users to admin panel
  useEffect(() => {
    console.log(
      "[Dashboard] Auth check - isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "role:",
      user?.role
    );

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("[Dashboard] Not authenticated, redirecting to /login");
        router.push("/login");
      } else if (user?.role === "admin") {
        console.log("[Dashboard] Admin detected, redirecting to /admin/panel");
        router.push("/admin/panel");
      } else if (user?.role === "professor") {
        console.log("[Dashboard] Professor detected, redirecting to /professor/panel");
        router.push("/professor/panel");
      } else {
        console.log("[Dashboard] Student authenticated");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading state
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

  // Don't render for admin/professor or unauthenticated users
  if (!isAuthenticated || user?.role === "admin" || user?.role === "professor") {
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
