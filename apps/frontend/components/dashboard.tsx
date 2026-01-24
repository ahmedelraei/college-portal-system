"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  LogOut,
  Settings,
  Bell,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registrationsApi } from "@/lib/api-client";
import type { Registration } from "@/lib/api-types";

export function Dashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Current semester/year (should match the courses page)
  const currentSemester = "winter";
  const currentYear = 2025;

  // Fetch current semester registrations
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState<Error | null>(
    null,
  );

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!isAuthenticated || authLoading || user?.role === "admin") {
        setRegistrationsLoading(false);
        return;
      }

      try {
        setRegistrationsLoading(true);
        const response = await registrationsApi.listMine({
          semester: currentSemester,
          year: currentYear,
        });
        setRegistrations(response);
        setRegistrationsError(null);
      } catch (error: unknown) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to load registrations");
        setRegistrationsError(err);
      } finally {
        setRegistrationsLoading(false);
      }
    };

    loadRegistrations();
  }, [authLoading, currentSemester, currentYear, isAuthenticated, user?.role]);

  // Redirect if not authenticated or if admin user
  useEffect(() => {
    console.log(
      "[Dashboard Component] Auth check - authLoading:",
      authLoading,
      "isAuthenticated:",
      isAuthenticated,
      "role:",
      user?.role,
    );

    if (!authLoading) {
      if (!isAuthenticated) {
        console.log(
          "[Dashboard Component] Not authenticated, redirecting to /login",
        );
        router.push("/login");
      } else if (user?.role === "admin") {
        console.log(
          "[Dashboard Component] Admin detected, redirecting to /admin/panel",
        );
        router.push("/admin/panel");
      } else {
        console.log(
          "[Dashboard Component] Student authenticated, showing dashboard",
        );
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Calculate stats from real data
  const activeRegistrations = registrations.filter((reg) => !reg.isDropped);
  const enrolledCoursesCount = activeRegistrations.length;
  const totalCreditHours = activeRegistrations.reduce(
    (sum, reg) => sum + reg.course.creditHours,
    0,
  );

  if (isLoading || registrationsLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with User Info */}
      <div className="bg-gradient-modern rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-white/90 text-lg font-medium">
              Student ID: {user.studentId} •{" "}
              {currentSemester.charAt(0).toUpperCase() +
                currentSemester.slice(1)}{" "}
              Semester {currentYear}
            </p>
            <p className="text-white/80 text-sm mt-1">
              Registration Period: October 1 - 7, 2024
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current GPA
            </CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-foreground">
                {user?.currentGPA ? Number(user.currentGPA).toFixed(2) : "0.00"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.currentGPA
                ? Number(user.currentGPA) >= 3.5
                  ? "Excellent performance"
                  : Number(user.currentGPA) >= 3.0
                    ? "Good standing"
                    : Number(user.currentGPA) >= 2.0
                      ? "Satisfactory"
                      : "Needs improvement"
                : "No grades yet"}
            </p>
          </CardHeader>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Courses
            </CardTitle>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-foreground">
                {enrolledCoursesCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSemester.charAt(0).toUpperCase() +
                currentSemester.slice(1)}{" "}
              {currentYear}
            </p>
          </CardHeader>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Hours
            </CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-foreground">
                {totalCreditHours}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Registrations */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              Current Registrations
            </CardTitle>
            <CardDescription>
              {currentSemester.charAt(0).toUpperCase() +
                currentSemester.slice(1)}{" "}
              Semester {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registrationsError && (
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                <p className="text-sm text-destructive font-medium">
                  Error loading registrations
                </p>
              </div>
            )}

            {!registrationsError && activeRegistrations.length === 0 && (
              <div className="text-center p-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium mb-1">
                  No courses registered yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Start by browsing available courses
                </p>
              </div>
            )}

            {!registrationsError &&
              activeRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        {registration.course.courseCode}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {registration.course.creditHours} Credits
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {registration.course.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {registration.course.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      {registration.paymentStatus === "paid" ? (
                        <p className="text-xs text-success font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Paid
                        </p>
                      ) : (
                        <p className="text-xs text-warning font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Payment Pending
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      {registration.grade ? (
                        <Badge className="text-xs">
                          Grade: {registration.grade}
                        </Badge>
                      ) : registration.isCompleted ? (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    {registration.paymentStatus === "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/courses/${registration.course.id}/content`)}
                      >
                        View Content
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/courses")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse & Register for Courses
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Notices */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold text-foreground">
              <AlertCircle className="h-5 w-5 text-primary" />
              Important Notices
            </CardTitle>
            <CardDescription>
              Academic announcements and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 border border-border rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Registration Reminder
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Summer semester registration opens December 15th. Plan your
                courses early.
              </p>
            </div>
            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Academic Calendar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Winter break: December 20 - January 8. Classes resume January
                9th.
              </p>
            </div>
            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Graduation Application
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Applications for May graduation are due February 1st, 2024.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="bg-gradient-modern rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-3 w-20 mt-1" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
