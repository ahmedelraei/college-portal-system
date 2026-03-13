"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCog } from "lucide-react";
import { studentsApi } from "@/lib/api-client";
import { toast } from "sonner";
import type { User } from "@/lib/api-types";
import { Switch } from "@/components/ui/switch";

const editStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .optional()
    .transform(e => e === "" ? undefined : e)
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .refine(
      (val) => !val || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }
    ),
  isActive: z.boolean().default(true),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

interface EditStudentFormProps {
  student: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditStudentForm({ student, onSuccess, onCancel }: EditStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      isActive: student.isActive ?? true,
    },
  });

  const isActiveWatch = watch("isActive");

  const onSubmit = async (data: EditStudentFormData) => {
    setIsLoading(true);
    try {
      await studentsApi.update(student.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.password ? { password: data.password } : {}),
        isActive: data.isActive,
      });

      toast.success("Student updated successfully!");
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update student"
      );
      console.error("Update student error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            {...register("firstName")}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            {...register("lastName")}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Student ID
        </Label>
        <Input
          value={student.studentId ?? ""}
          disabled
          className="bg-muted text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">Student ID cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@student.modernacademy.edu"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          New Password (Optional)
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Leave blank to keep current password"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="isActive"
          checked={isActiveWatch}
          onCheckedChange={(checked) => setValue("isActive", checked)}
          disabled={isLoading}
        />
        <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
          Account Active Status
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <UserCog className="w-4 h-4 mr-2" />
              Update Student
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
