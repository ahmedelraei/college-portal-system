"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { authApi } from "@/lib/api-client";
import { toast } from "sonner";

const createStudentSchema = z.object({
  studentId: z.coerce.number().min(1, "Student ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type CreateStudentFormData = z.infer<typeof createStudentSchema>;

interface AddStudentFormProps {
  onSuccess: () => void;
}

export function AddStudentForm({ onSuccess }: AddStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
  });

  const onSubmit = async (data: CreateStudentFormData) => {
    setIsLoading(true);
    try {
      await authApi.createStudent({
        studentId: data.studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      reset();
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create student"
      );
      console.error("Create student error:", error);
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
        <Label htmlFor="studentId" className="text-sm font-medium">
          Student ID
        </Label>
        <Input
          id="studentId"
          type="number"
          placeholder="12200207"
          {...register("studentId")}
          disabled={isLoading}
        />
        {errors.studentId && (
          <p className="text-sm text-destructive">
            {errors.studentId.message}
          </p>
        )}
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
          Initial Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Secure password (min 8 chars)"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Student will be able to change this password after first login.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Student
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
