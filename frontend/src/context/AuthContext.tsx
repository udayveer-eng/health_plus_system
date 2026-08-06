"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type Role = "HOSPITAL" | "DOCTOR" | "PATIENT";

interface UserPayload {
  userId: string;
  role: Role;
  name?: string;
  email?: string;
  city?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  updateToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem("healthpulse-token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<UserPayload>(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          setUser(decoded);
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(newToken);
      localStorage.setItem("healthpulse-token", newToken);
      setToken(newToken);
      setUser(decoded);

      // Route based on role
      if (decoded.role === "HOSPITAL") {
        router.push("/dashboard/hospital");
      } else if (decoded.role === "DOCTOR") {
        router.push("/dashboard/doctor");
      } else if (decoded.role === "PATIENT") {
        router.push("/dashboard/patient");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Invalid token on login", error);
    }
  };

  const updateToken = (newToken: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(newToken);
      localStorage.setItem("healthpulse-token", newToken);
      setToken(newToken);
      setUser(decoded);
    } catch (error) {
      console.error("Invalid token on update", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("healthpulse-token");
    setToken(null);
    setUser(null);
    router.push("/portal");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
