"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Home, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu,
  Terminal,
  Navigation
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SocketProvider, useSocket } from "@/components/providers/socket-provider";
import { GlobalSearch } from "@/components/ui/global-search";
import api from "@/lib/api";

const sidebarLinks = {
  patient: [
    { name: "Overview", href: "/dashboard/patient", icon: Home },
    { name: "Emergency Requests", href: "/dashboard/patient/requests", icon: Activity },
    { name: "Live Tracking", href: "/dashboard/patient/tracking", icon: Navigation },
  ],
  hospital: [
    { name: "Overview", href: "/dashboard/hospital", icon: Home },
    { name: "Command Center", href: "/dashboard/hospital/command-center", icon: Terminal },
    { name: "Settings", href: "/dashboard/hospital/settings", icon: Settings },
  ],
  admin: [
    { name: "Overview", href: "/dashboard/admin", icon: Home },
    { name: "System Config", href: "/dashboard/admin/settings", icon: Settings },
  ]
};

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && (!token || !user)) {
      router.replace("/portal");
    }
  }, [token, user, isLoading, router]);

  // Fetch real notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      if (res.data?.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    }
  }, [user, token]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    };

    socket.on("NEW_NOTIFICATION", handleNewNotification);
    return () => {
      socket.off("NEW_NOTIFICATION", handleNewNotification);
    };
  }, [socket]);

  if (isLoading || !user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/api/notifications/${notif._id}/read`);
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setIsNotificationsOpen(false);
      
      // Basic routing logic based on metadata if provided
      if (notif.metadata?.url) {
        router.push(notif.metadata.url);
      } else if (notif.type === 'EMERGENCY_UPDATE') {
        if (user.role === 'PATIENT') router.push("/dashboard/patient/tracking");
      }
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  const links = sidebarLinks[user.role.toLowerCase() as keyof typeof sidebarLinks] || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <Link href="/" className="h-16 flex items-center px-6 border-b border-border hover:bg-foreground/5 transition-colors">
            <div className="bg-[var(--accent)] text-black p-1.5 rounded-xl mr-3 shadow-sm border border-[var(--border)] flex items-center justify-center">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">HealthPulse</span>
          </Link>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4 px-2">
              Menu
            </div>
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium relative group",
                    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary/10 rounded-md border border-primary/20 pointer-events-none"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {(user.name || user.email || user.role).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || user.email || "User"}</p>
                <p className="text-xs text-foreground/50 capitalize truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-surface shadow-sm z-40">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-foreground/70 hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-foreground/70 hover:text-foreground hover:bg-background rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error border-2 border-surface rounded-full animate-pulse" />
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-surface border border-border shadow-xl rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                      <h3 className="font-semibold text-sm">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-primary/60 cursor-pointer hover:text-primary transition-colors font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={cn(
                              "p-4 border-b border-border/50 transition-colors cursor-pointer flex gap-3",
                              notif.isRead ? "bg-surface hover:bg-background/30 opacity-60" : "bg-background/30 hover:bg-background/80"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-1.5 shrink-0 transition-opacity",
                              notif.type === "SYSTEM_ALERT" ? "bg-error" : "bg-accent",
                              notif.isRead ? "opacity-0" : "opacity-100"
                            )} />
                            <div>
                              <p className={cn("text-sm transition-colors", notif.isRead ? "font-normal text-foreground/80" : "font-semibold")}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-foreground/60 mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-foreground/40 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-sm text-foreground/50">
                          No notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-8 max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <DashboardInner>{children}</DashboardInner>
    </SocketProvider>
  );
}
