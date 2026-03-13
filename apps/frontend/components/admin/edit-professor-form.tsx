"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCog } from "lucide-react";
import { professorsApi } from "@/lib/api-client";
import { toast } from "sonner";
import type { User } from "@/lib/api-types";
import { Switch } from "@/components/ui/switch";

const editProfessorSchema = z.object({
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

type EditProfessorFormData = z.infer<typeof editProfessorSchema>;

interface EditProfessorFormProps {
  professor: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditProfessorForm({ professor, onSuccess, onCancel }: EditProfessorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProfessorFormData>({
    resolver: zodResolver(editProfessorSchema),
    defaultValues: {
      firstName: professor.firstName,
      lastName: professor.lastName,
      email: professor.email,
      isActive: professor.isActive ?? true,
    },
  });

  const isActiveWatch = watch("isActive");

  const onSubmit = async (data: EditProfessorFormData) => {
    setIsLoading(true);
    try {
      await professorsApi.update(professor.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.password ? { password: data.password } : {}),
        isActive: data.isActive,
      });

      toast.success("Professor updated successfully!");
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update professor"
      );
      console.error("Update professor error:", error);
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
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <Input
            id="lastName"
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
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
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
              Update Professor
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
