"use client";

import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Modern Academy
              </h1>
              <p className="text-sm text-muted-foreground">
                Student Portal System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-foreground">
                  Welcome, {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Student ID: {user.studentId}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
