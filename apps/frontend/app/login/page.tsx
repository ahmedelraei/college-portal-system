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
import { Shield, GraduationCap, Loader2, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  studentId: z.coerce.number().min(1, "Student ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin/panel");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      // Small delay to show success state
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      // Error handling is done in the context
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* University Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Modern Academy
          </h1>
          <p className="text-muted-foreground font-medium">
            Student Portal System
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-md">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Student Login
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your college credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="studentId"
                  className="text-sm font-medium text-foreground"
                >
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  type="number"
                  placeholder="e.g., 12200207"
                  className="h-11 focus:ring-2 focus:ring-primary focus:border-primary"
                  {...register("studentId")}
                  disabled={isLoading}
                />
                {errors.studentId && (
                  <p className="text-sm text-destructive font-medium">
                    {errors.studentId.message}
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
                  className="h-11 focus:ring-2 focus:ring-primary focus:border-primary"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 button-modern"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4 pt-4 border-t border-border">
              <a
                href="#"
                className="text-sm text-primary font-medium hover:text-secondary transition-colors"
              >
                Forgot your password?
              </a>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Need an account? Contact your academic advisor for
                  registration assistance.
                </p>
                <p className="text-sm text-muted-foreground">
                  Administrator?{" "}
                  <a
                    href="/admin/login"
                    className="text-primary font-medium hover:text-secondary transition-colors"
                  >
                    Admin Login
                  </a>
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Need help? Contact IT Support at{" "}
                  <a
                    href="mailto:support@modernacademy.edu"
                    className="text-primary hover:text-secondary transition-colors"
                  >
                    support@modernacademy.edu
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Accredited Institution
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 Modern Academy. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            By logging in, you agree to our{" "}
            <a href="#" className="text-primary hover:text-secondary transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-secondary transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
