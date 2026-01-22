"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@/types';

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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Query to fetch the current user
  const { 
    data: user, 
    isLoading,
    error: fetchError
  } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    retryOnMount: false,
    initialData: null
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest<User>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    },
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  // Set error from query if it exists
  useEffect(() => {
    if (fetchError) {
      setError(fetchError as Error);
    }
  }, [fetchError]);

  // Login function
  const login = async (username: string, password: string) => {
    return loginMutation.mutateAsync({ username, password });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Register function
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
