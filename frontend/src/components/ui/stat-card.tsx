"use client";

import React from "react";
import { PremiumCard } from "./premium-card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number; // Percentage change (positive or negative)
  trendLabel?: string; // e.g. "vs last month"
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, trendLabel, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      <PremiumCard gradient className="h-full p-6 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center text-xs font-medium px-2 py-1 rounded-full",
              trend > 0 ? "text-success bg-success/10" : trend < 0 ? "text-error bg-error/10" : "text-foreground/60 bg-foreground/10"
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-foreground/60 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {trendLabel && <span className="text-xs text-foreground/50">{trendLabel}</span>}
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}
