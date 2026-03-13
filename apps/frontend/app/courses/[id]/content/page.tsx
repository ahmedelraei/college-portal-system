"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, AlertCircle, Bot } from "lucide-react";
import { WeekList } from "@/components/lecture-content/week-list";
import { ProgressIndicator } from "@/components/lecture-content/progress-indicator";
import { lectureContentApi, coursesApi } from "@/lib/api-client";
import type { CourseContentWithProgress, Course } from "@/lib/api-types";
import { toast } from "sonner";
import { ChatbotDialog } from "@/components/chatbot-dialog";

export default function StudentCourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string, 10);

  const [content, setContent] = useState<CourseContentWithProgress | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const [contentData, courseData] = await Promise.all([
        lectureContentApi.getCourseContent(courseId),
        coursesApi.list().then((response) => {
          const courses = Array.isArray(response) ? response : response.data;
          return courses.find((c) => c.id === courseId) || null;
        }),
      ]);
      setContent(contentData);
      setCourse(courseData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load content";
      setError(message);
      if (message.includes("paid registration")) {
        // Payment required error
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleToggleComplete = async (contentId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await lectureContentApi.removeProgress(contentId);
        toast.success("Progress removed");
      } else {
        await lectureContentApi.markComplete(contentId);
        toast.success("Marked as complete!");
      }
      // Reload content to update progress
      loadContent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-modern mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Access Denied</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
              {error.includes("paid registration") && (
                <Button
                  className="mt-4"
                  onClick={() => router.push(`/courses`)}
                >
                  Go to Course Registration
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!content || content.weeks.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Course content is being prepared. Please check back later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalItems = content.weeks.reduce((sum, w) => sum + w.progress.total, 0);
  const completedItems = content.weeks.reduce((sum, w) => sum + w.progress.completed, 0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsChatOpen(true)}
          >
            <Bot className="h-4 w-4 mr-2" />
            Ask Course Assistant
          </Button>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {course ? `${course.courseCode} - ${course.courseName}` : "Course Content"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {course ? `${course.courseCode}: ${course.courseName}` : "Course Content"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressIndicator completed={completedItems} total={totalItems} />
          </CardContent>
        </Card>

        <WeekList weeks={content.weeks} onToggleComplete={handleToggleComplete} />

        {course && (
          <ChatbotDialog
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            courseId={course.id}
            courseName={course.courseName}
          />
        )}
      </div>
    </div>
  );
}
