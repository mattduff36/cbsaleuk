"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { User } from "@/types";

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<User>;
  error: Error | null;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  phone: string;
  fullName?: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const {
    data: user,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["/api/auth/me"],
    staleTime: 60 * 1000,
    retry: false,
    retryOnMount: false,
    initialData: null,
    queryFn: async () => {
      try {
        return await apiRequest<User>("/api/auth/me");
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient, supabase]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      if (supabase) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: credentials.username,
          password: credentials.password,
        });

        if (signInError) {
          throw signInError;
        }

        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        const nextUser = await queryClient.fetchQuery({
          queryKey: ["/api/auth/me"],
          queryFn: async () => apiRequest<User>("/api/auth/me"),
        });

        return nextUser;
      }

      return apiRequest<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (supabase) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          throw signOutError;
        }
        return;
      }

      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      if (supabase) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              username: userData.username,
              full_name: userData.fullName || userData.username,
              phone: userData.phone,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        if (!data.user) {
          throw new Error("Unable to create your account.");
        }

        return {
          id: 0,
          username: userData.username,
          fullName: userData.fullName || userData.username,
          email: userData.email,
          phone: userData.phone,
          role: "organiser" as const,
          emailConfirmed: false,
          isPremium: false,
          premiumUntil: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionStatus: null,
          subscriptionRenewsAt: null,
          lastLogin: null,
          createdAt: new Date().toISOString(),
        };
      }

      return apiRequest<User>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  useEffect(() => {
    if (fetchError) {
      setError(fetchError as Error);
    }
  }, [fetchError]);

  const login = async (username: string, password: string) => {
    return loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (userData: RegisterData) => {
    return registerMutation.mutateAsync(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
