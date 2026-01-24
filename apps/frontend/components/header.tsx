"use client";

import { Shield, User, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
