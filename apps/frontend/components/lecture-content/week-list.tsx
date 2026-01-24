"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ContentItem } from "./content-item";
import { Progress } from "@/components/ui/progress";
import type { Week, LectureContent } from "@/lib/api-types";

interface WeekListProps {
  weeks: Array<{
    week: Week;
    content: Array<LectureContent & { isCompleted: boolean; completedAt: string | null }>;
    progress: { completed: number; total: number };
  }>;
  onToggleComplete?: (contentId: number, isCompleted: boolean) => void;
}

export function WeekList({ weeks, onToggleComplete }: WeekListProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set(weeks.map((w) => w.week.id))
  );

  const toggleWeek = (weekId: number) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(weekId)) {
        newSet.delete(weekId);
      } else {
        newSet.add(weekId);
      }
      return newSet;
    });
  };

  if (weeks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Course content is being prepared. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weeks.map(({ week, content, progress }) => {
        const isExpanded = expandedWeeks.has(week.id);
        const progressPercent =
          progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

        return (
          <div
            key={week.id}
            className="border rounded-lg overflow-hidden bg-card"
          >
            <button
              onClick={() => toggleWeek(week.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="text-left">
                  <h3 className="font-semibold text-lg">
                    Week {week.weekNumber}: {week.title}
                  </h3>
                  {week.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {week.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {progress.completed} / {progress.total} completed
                  </p>
                  <Progress value={progressPercent} className="w-32 h-2 mt-1" />
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 pt-0 space-y-3">
                {content.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No content available for this week yet.
                  </p>
                ) : (
                  content.map((item) => (
                    <ContentItem
                      key={item.id}
                      content={item}
                      onToggleComplete={onToggleComplete}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
