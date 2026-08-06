"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // We'll create this utility shortly

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function PremiumButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: PremiumButtonProps) {
  
  const baseStyles = "relative inline-flex items-center justify-center font-medium overflow-hidden rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_0_15px_rgba(var(--color-primary),0.5)] hover:bg-primary-hover hover:shadow-[0_0_25px_rgba(var(--color-primary),0.7)]",
    secondary: "bg-surface text-foreground border border-border hover:bg-surface-hover",
    ghost: "bg-transparent text-foreground hover:bg-surface hover:text-primary",
    danger: "bg-error text-white hover:bg-red-600 shadow-[0_0_15px_rgba(var(--color-error),0.3)]",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Subtle shine effect overlay for primary buttons */}
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
