import React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export function PremiumCard({ className, children, gradient = false, ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] bg-surface border border-border p-6",
        "shadow-[0_4px_24px_rgba(0,0,0,0.2)]", // Soft depth
        "backdrop-blur-sm transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Subtle interior glow simulating lighting */}
      <div className="absolute inset-0 rounded-[20px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
      
      {/* Optional gradient accent block in the background */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 blur-[40px] rounded-full pointer-events-none" />
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
