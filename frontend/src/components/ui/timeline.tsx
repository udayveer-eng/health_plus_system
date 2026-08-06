"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export type TimelineItemStatus = "completed" | "current" | "upcoming";

export interface TimelineItemProps {
  id: string;
  time: string;
  title: string;
  description?: string;
  status: TimelineItemStatus;
  badge?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItemProps[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative border-l border-border/50 ml-4 space-y-8", className)}>
      {items.map((item, index) => {
        const isCompleted = item.status === "completed";
        const isCurrent = item.status === "current";
        
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative pl-6"
          >
            {/* Status Icon Marker */}
            <div className={cn(
              "absolute -left-[11px] top-1 rounded-full bg-background flex items-center justify-center w-5 h-5",
              isCompleted ? "text-success" : isCurrent ? "text-primary" : "text-border"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 bg-background" />
              ) : isCurrent ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              ) : (
                <Circle className="w-3 h-3 fill-border" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h4 className={cn("text-base font-medium", isCompleted && "text-foreground/60")}>
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-sm text-foreground/60 mt-1">{item.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center text-xs text-foreground/50 bg-background/50 border border-border px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {item.time}
                </div>
                {item.badge}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
