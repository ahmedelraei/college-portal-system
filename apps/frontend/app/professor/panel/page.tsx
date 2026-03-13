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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  LogOut,
  Eye,
  EyeOff,
  ChevronRight,
  BookMarked,
  LayoutGrid,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { coursesApi, lectureContentApi } from "@/lib/api-client";
import type { Course, Week } from "@/lib/api-types";
import { toast } from "sonner";

export default function ProfessorPanelPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [weekStats, setWeekStats] = useState<{
    [courseId: number]: { published: number; draft: number; total: number };
  }>({});
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Auth guard redirect
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/professor/login");
      } else if (user?.role !== "professor") {
        if (user?.role === "admin") router.push("/admin/panel");
        else router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Load courses and week stats
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "professor") return;

    const loadData = async () => {
      try {
        setCoursesLoading(true);
        const fetchedCourses = await coursesApi.list();
        const _fetchedCourses = Array.isArray(fetchedCourses) ? fetchedCourses : fetchedCourses.data;
        setCourses(_fetchedCourses);

        // Fetch week stats for all courses in parallel
        const statsEntries = await Promise.all(
          _fetchedCourses.map(async (course) => {
            try {
              const weeks: Week[] = await lectureContentApi.getWeeks(course.id);
              const published = weeks.filter((w) => w.isPublished).length;
              return [
                course.id,
                { published, draft: weeks.length - published, total: weeks.length },
              ];
            } catch {
              return [course.id, { published: 0, draft: 0, total: 0 }];
            }
          })
        );
        setWeekStats(Object.fromEntries(statsEntries));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load courses"
        );
      } finally {
        setCoursesLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user?.role]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/professor/login");
    } catch {
      // toast handled inside logout
    }
  };

  // Aggregate stats
  const totalPublished = Object.values(weekStats).reduce(
    (sum, s) => sum + s.published,
    0
  );
  const totalDraft = Object.values(weekStats).reduce(
    (sum, s) => sum + s.draft,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-emerald-500/10 p-3 rounded-full mb-4 mx-auto w-fit">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading professor portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "professor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-white/10 shadow-xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 border border-emerald-400/30 p-3 rounded-xl">
                <GraduationCap className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Modern Academy
                </h1>
                <p className="text-sm text-emerald-400/80 font-medium">
                  Professor Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white">
                  Prof. {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-emerald-400/70">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 shadow-xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-1">
                Welcome back, Prof. {user?.firstName}!
              </h2>
              <p className="text-emerald-100/80 text-base">
                Manage your course content and lecture materials from here.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </CardTitle>
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-bold text-foreground">
                    {coursesLoading ? "—" : courses.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Available courses</p>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Published Weeks
                  </CardTitle>
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Eye className="h-4 w-4 text-teal-600" />
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-bold text-foreground">
                    {coursesLoading ? "—" : totalPublished}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Visible to students</p>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Draft Weeks
                  </CardTitle>
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <EyeOff className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-bold text-foreground">
                    {coursesLoading ? "—" : totalDraft}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Unpublished weeks</p>
              </CardHeader>
            </Card>
          </div>

          {/* Courses List */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <LayoutGrid className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground font-semibold">
                    Course Content Management
                  </CardTitle>
                  <CardDescription>
                    Select a course to manage its weeks and lecture content
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {coursesLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-emerald-50 rounded-full p-4 w-fit mx-auto mb-4">
                    <BookMarked className="h-10 w-10 text-emerald-300" />
                  </div>
                  <p className="text-muted-foreground font-medium">No courses available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Courses will appear here once they are created by an administrator.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {courses.map((course) => {
                    const stats = weekStats[course.id] ?? {
                      published: 0,
                      draft: 0,
                      total: 0,
                    };
                    return (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-5 hover:bg-emerald-50/50 transition-colors group"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-emerald-100 p-2.5 rounded-xl mt-0.5 group-hover:bg-emerald-200 transition-colors">
                            <BookOpen className="h-5 w-5 text-emerald-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-foreground text-sm">
                                {course.courseCode}
                              </span>
                              <Badge
                                variant={course.isActive ? "default" : "secondary"}
                                className={
                                  course.isActive
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
                                    : "text-xs"
                                }
                              >
                                {course.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {course.semester}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {course.creditHours} credits
                              </Badge>
                            </div>
                            <p className="font-medium text-foreground text-sm">
                              {course.courseName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {course.description}
                            </p>
                            {/* Week summary */}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {stats.total} week{stats.total !== 1 ? "s" : ""}
                              </span>
                              {stats.published > 0 && (
                                <span className="flex items-center gap-1 text-xs text-teal-600">
                                  <Eye className="h-3 w-3" />
                                  {stats.published} published
                                </span>
                              )}
                              {stats.draft > 0 && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <EyeOff className="h-3 w-3" />
                                  {stats.draft} draft
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/professor/panel/courses/${course.id}/content`
                            )
                          }
                          className="ml-4 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm group-hover:shadow-md transition-all"
                        >
                          Manage Content
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
