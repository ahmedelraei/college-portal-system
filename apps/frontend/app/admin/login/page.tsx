"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    adminLogin,
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  // Redirect if already authenticated as admin
  useEffect(() => {
    console.log(
      "[AdminLogin] Effect triggered - authLoading:",
      authLoading,
      "isAuthenticated:",
      isAuthenticated,
      "user:",
      user
    );

    if (!authLoading && isAuthenticated && user) {
      console.log("[AdminLogin] User authenticated, role:", user.role);
      if (user.role === "admin") {
        console.log("[AdminLogin] Redirecting to /admin/panel");
        router.push("/admin/panel");
      } else if (user.role === "student") {
        console.log("[AdminLogin] Student detected, redirecting to /dashboard");
        router.push("/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    try {
      console.log("[AdminLogin] Starting admin login...");
      await adminLogin(data);
      console.log(
        "[AdminLogin] Admin login successful, waiting for state update..."
      );
      // Don't manually redirect here, let the useEffect handle it
      // The useEffect will trigger when the user state updates
    } catch (error) {
      // Error handling is done in the context
      console.error("[AdminLogin] Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-secondary p-3 rounded-full">
              <Settings className="h-8 w-8 text-secondary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Modern Academy
          </h1>
          <p className="text-muted-foreground font-medium">
            Administrative Portal
          </p>
        </div>

        {/* Admin Login Card */}
        <Card className="border border-border shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-foreground">
              Administrator Login
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your administrative credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@modernacademy.edu"
                  className="h-11 border-border focus:border-secondary focus:ring-secondary"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 border-border focus:border-secondary focus:ring-secondary"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In as Administrator
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Student access?{" "}
                  <a
                    href="/login"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Student Login
                  </a>
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Need help? Contact IT Support at{" "}
                  <a
                    href="mailto:support@modernacademy.edu"
                    className="text-secondary hover:underline"
                  >
                    support@modernacademy.edu
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2024 Modern Academy. All rights reserved.</p>
          <p className="mt-1">
            Administrative access is monitored and logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
