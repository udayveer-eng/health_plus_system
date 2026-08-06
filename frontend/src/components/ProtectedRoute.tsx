"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Activity } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("HOSPITAL" | "DOCTOR" | "PATIENT")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // User does not have permission for this route
        router.push("/unauthorized"); // Or back to their specific dashboard
      }
    }
  }, [isLoading, isAuthenticated, router, allowedRoles, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  // Only render children if authenticated and (if specified) role matches
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
