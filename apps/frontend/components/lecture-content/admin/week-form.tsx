"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { lectureContentApi } from "@/lib/api-client";
import type { Week } from "@/lib/api-types";

const weekSchema = z.object({
  weekNumber: z.coerce
    .number()
    .min(1, "Week number must be at least 1")
    .max(52, "Week number must be at most 52"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  isPublished: z.boolean().default(false),
});

type WeekFormData = z.infer<typeof weekSchema>;

interface WeekFormProps {
  courseId: number;
  initialData?: Week;
  onSubmit: (data: {
    weekNumber: number;
    title: string;
    description?: string;
    isPublished?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  submitButtonClassName?: string;
}

export function WeekForm({ courseId, initialData, onSubmit, onCancel, submitButtonClassName }: WeekFormProps) {
  const week = initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!week;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WeekFormData>({
    resolver: zodResolver(weekSchema),
    defaultValues: {
      weekNumber: week?.weekNumber || 1,
      title: week?.title || "",
      description: week?.description || "",
      isPublished: week?.isPublished || false,
    },
  });

  const isPublished = watch("isPublished");

  const onFormSubmit = async (data: WeekFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weekNumber">Week Number *</Label>
        <Input
          id="weekNumber"
          type="number"
          {...register("weekNumber")}
          disabled={isSubmitting}
        />
        {errors.weekNumber && (
          <p className="text-sm text-destructive">{errors.weekNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register("title")}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          disabled={isSubmitting}
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublished"
          checked={isPublished}
          onCheckedChange={(checked) => setValue("isPublished", checked === true)}
          disabled={isSubmitting}
        />
        <Label
          htmlFor="isPublished"
          className="text-sm font-normal cursor-pointer"
        >
          Publish immediately (visible to students)
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className={submitButtonClassName || "bg-secondary hover:bg-secondary/90 text-secondary-foreground"}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isEditing ? "Update Week" : "Create Week"}
        </Button>
      </div>
    </form>
  );
}
