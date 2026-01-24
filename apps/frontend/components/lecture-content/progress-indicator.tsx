"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
}

export function ProgressIndicator({
  completed,
  total,
  showPercentage = true,
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {completed} of {total} completed
          </span>
        </div>
        {showPercentage && (
          <span className="text-sm font-medium text-muted-foreground">
            {percentage}%
          </span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
