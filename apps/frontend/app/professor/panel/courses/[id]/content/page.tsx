"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ContentManager } from "@/components/lecture-content/admin/content-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";

export default function ProfessorCourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const courseId = Number(params.id);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
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
                  Professor Portal — Course Content
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/professor/panel")}
              className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isNaN(courseId) ? (
          <div className="text-center py-16">
            <p className="text-destructive font-medium">Invalid course ID.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/professor/panel")}
            >
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <ContentManager courseId={courseId} theme="emerald" />
        )}
      </main>
    </div>
  );
}
