"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthStatus() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user.studentId}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="h-8"
      >
        <LogOut className="h-3 w-3" />
        <span className="hidden sm:ml-2 sm:inline">Logout</span>
      </Button>
    </div>
  );
}

export function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <User className="h-5 w-5" />
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription>Your account details and information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-white text-lg">
              {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground capitalize">
                {user.role?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Student ID
            </label>
            <p className="text-sm text-foreground">{user.studentId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm text-foreground">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              First Name
            </label>
            <p className="text-sm text-foreground">{user.firstName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Name
            </label>
            <p className="text-sm text-foreground">{user.lastName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
