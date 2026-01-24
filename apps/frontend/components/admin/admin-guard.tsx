"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Shield } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/admin/login");
      } else if (user?.role !== "admin") {
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="bg-secondary p-3 rounded-full mb-4 mx-auto w-fit">
              <Shield className="h-8 w-8 text-secondary-foreground" />
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
