"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { authApi, clearAuthToken } from "@/lib/api-client";
import type { User } from "@/lib/api-types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { studentId: number; password: string }) => Promise<void>;
  adminLogin: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProviderContent({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const profile = await authApi.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch {
      clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (loginInput: { studentId: number; password: string }) => {
      try {
        const { user: loggedInUser, message } = await authApi.login(loginInput);
        setUser(loggedInUser);
        setIsAuthenticated(true);
        toast.success(message);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Login failed";
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  const adminLogin = useCallback(
    async (adminLoginInput: { email: string; password: string }) => {
      try {
        const { user: loggedInUser, message } =
          await authApi.adminLogin(adminLoginInput);
        setUser(loggedInUser);
        setIsAuthenticated(true);
        toast.success(message);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Admin login failed";
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const { message } = await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success(message);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Logout failed";
      toast.error(message);
      throw error;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    adminLogin,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthProviderContent>{children}</AuthProviderContent>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
