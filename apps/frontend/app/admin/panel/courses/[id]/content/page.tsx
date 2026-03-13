"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { ContentManager } from "@/components/lecture-content/admin/content-manager";
import { coursesApi } from "@/lib/api-client";
import type { Course } from "@/lib/api-types";

export default function AdminCourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string, 10);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    coursesApi
      .list()
      .then((response) => {
        const _courses = Array.isArray(response) ? response : response.data;
        const found = _courses.find((c) => c.id === courseId);
        setCourse(found || null);
      })
      .catch(() => {
        // Ignore error, course name is optional
      });
  }, [courseId]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/panel")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/panel">Admin Panel</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/panel">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {course ? `${course.courseCode} - Content` : "Manage Content"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold">
          {course ? `${course.courseCode}: ${course.courseName}` : "Manage Course Content"}
        </h1>

        <ContentManager courseId={courseId} />
      </div>
    </div>
  );
}
