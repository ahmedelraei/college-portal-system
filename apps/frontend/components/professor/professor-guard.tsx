"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";

interface ProfessorGuardProps {
  children: React.ReactNode;
}

export function ProfessorGuard({ children }: ProfessorGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/professor/login");
      } else if (user?.role !== "professor") {
        if (user?.role === "admin") {
          router.push("/admin/panel");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-emerald-500/10 p-3 rounded-full mb-4 mx-auto w-fit">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying professor access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "professor") {
    return null;
  }

  return <>{children}</>;
}
