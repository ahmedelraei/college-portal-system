"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { professorsApi } from "@/lib/api-client";
import { toast } from "sonner";

const createProfessorSchema = z.object({
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

type CreateProfessorFormData = z.infer<typeof createProfessorSchema>;

interface AddProfessorFormProps {
  onSuccess: () => void;
}

export function AddProfessorForm({ onSuccess }: AddProfessorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProfessorFormData>({
    resolver: zodResolver(createProfessorSchema),
  });

  const onSubmit = async (data: CreateProfessorFormData) => {
    setIsLoading(true);
    try {
      await professorsApi.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      reset();
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create professor"
      );
      console.error("Create professor error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prof-firstName" className="text-sm font-medium">
            First Name
          </Label>
          <Input
            id="prof-firstName"
            placeholder="Jane"
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
          <Label htmlFor="prof-lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <Input
            id="prof-lastName"
            placeholder="Smith"
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
        <Label htmlFor="prof-email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="prof-email"
          type="email"
          placeholder="jane.smith@modernacademy.edu"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prof-password" className="text-sm font-medium">
          Initial Password
        </Label>
        <Input
          id="prof-password"
          type="password"
          placeholder="Secure password (min 8 chars)"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Professor will be able to change this password after first login.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Professor
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
