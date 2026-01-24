"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ExternalLink, FileText, Video, BookOpen, FileCheck } from "lucide-react";
import type { LectureContent } from "@/lib/api-types";

interface ContentItemProps {
  content: LectureContent & { isCompleted?: boolean; completedAt?: string | null };
  onToggleComplete?: (contentId: number, isCompleted: boolean) => void;
}

const contentTypeIcons = {
  video: Video,
  document: FileText,
  reading: BookOpen,
  assignment: FileCheck,
};

const contentTypeColors = {
  video: "bg-red-100 text-red-700",
  document: "bg-blue-100 text-blue-700",
  reading: "bg-green-100 text-green-700",
  assignment: "bg-purple-100 text-purple-700",
};

export function ContentItem({ content, onToggleComplete }: ContentItemProps) {
  const Icon = contentTypeIcons[content.contentType];
  const colorClass = contentTypeColors[content.contentType];

  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(content.id, !!content.isCompleted);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{content.title}</h4>
              <Badge variant="outline" className="capitalize">
                {content.contentType}
              </Badge>
            </div>
            {content.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {content.description}
              </p>
            )}
            {content.textContent && (
              <div className="mt-2 p-3 rounded bg-muted text-sm whitespace-pre-wrap">
                {content.textContent}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {content.externalUrl && (
                <a
                  href={content.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </a>
              )}
              {content.fileUrl && (
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${content.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Download File
                </a>
              )}
            </div>
          </div>
        </div>
        {onToggleComplete && (
          <Button
            variant={content.isCompleted ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            className="flex items-center gap-2"
          >
            {content.isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Mark Complete
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
