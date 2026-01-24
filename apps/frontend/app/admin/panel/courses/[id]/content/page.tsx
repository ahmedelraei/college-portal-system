"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContentManager } from "@/components/lecture-content/admin/content-manager";

export default function AdminCourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string, 10);

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
          <h1 className="text-3xl font-bold">Manage Course Content</h1>
        </div>

        <ContentManager courseId={courseId} />
      </div>
    </div>
  );
}
