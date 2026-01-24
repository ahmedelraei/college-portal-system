"use client";

import { useAuthContext } from "@/components/auth/auth-provider";

// Simple hook that returns the auth context
export function useAuth() {
  return useAuthContext();
}
