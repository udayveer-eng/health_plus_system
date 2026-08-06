"use client";

import { useEffect, useState } from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatCard } from "@/components/ui/stat-card";
import { PremiumButton } from "@/components/ui/premium-button";
import api from "@/lib/api";
import { Activity, Bell, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/dashboard/patient");
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-foreground/60 mt-1">Monitor your emergency requests and alerts.</p>
        </div>
        <PremiumButton onClick={() => router.push("/dashboard/patient/requests")} className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-none shadow-lg shadow-red-500/20">
          <AlertTriangle className="w-4 h-4" />
          Raise Emergency Request
        </PremiumButton>
      </div>

      {/* Hero: Active Emergency Requests */}
      {data.activeEmergencyRequests?.length > 0 && (
        <PremiumCard gradient className="p-8 border-red-500/20 bg-red-500/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  ACTIVE EMERGENCY
                </div>
                <h2 className="text-2xl font-bold">
                  {data.activeEmergencyRequests[0].quantity}x {data.activeEmergencyRequests[0].resourceType.toUpperCase()}
                </h2>
                <p className="text-foreground/60 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Requested {format(new Date(data.activeEmergencyRequests[0].createdAt), "h:mm a 'on' MMMM do")}
                </p>
              </div>
            </div>
            <PremiumButton onClick={() => router.push("/dashboard/patient/requests")} size="lg" className="w-full md:w-auto shadow-lg bg-red-600 hover:bg-red-700 text-white">
              View Status
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Active Requests"
          value={data.activeEmergencyRequests?.length || 0}
          icon={<Activity className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Past Requests"
          value={data.pastEmergencyRequests?.length || 0}
          icon={<Clock className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Unread Notifications"
          value={data.unreadNotificationsCount || 0}
          icon={<Bell className="w-5 h-5" />}
          trend={data.unreadNotificationsCount > 0 ? data.unreadNotificationsCount : undefined}
          delay={0.3}
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6">
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Emergency History</h3>
            <button onClick={() => router.push("/dashboard/patient/requests")} className="text-sm text-primary hover:underline flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          {data.pastEmergencyRequests?.length === 0 ? (
            <p className="text-sm text-foreground/50 text-center py-8">No past emergency requests</p>
          ) : (
            <div className="space-y-4">
              {data.pastEmergencyRequests?.map((r: any) => (
                <div 
                  key={r._id} 
                  onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                  className="flex flex-col p-4 rounded-xl bg-background/50 border border-border/50 hover:border-border transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-foreground/60 group-hover:text-primary transition-colors">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.quantity}x {r.resourceType}</p>
                        <p className="text-xs text-foreground/50">{format(new Date(r.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-md bg-surface text-xs font-medium uppercase">{r.status}</span>
                      <motion.div
                        animate={{ rotate: expandedId === r._id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-border group-hover:text-primary transition-colors" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedId === r._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-border/50 text-sm text-foreground/80 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Priority:</span>
                            <span className="font-semibold uppercase">{r.priority || "Standard"}</span>
                          </div>
                          {r.message && (
                            <div className="flex justify-between">
                              <span className="text-foreground/50">Message:</span>
                              <span className="text-right max-w-[70%] italic">"{r.message}"</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Exact Time:</span>
                            <span>{new Date(r.createdAt).toLocaleString()}</span>
                          </div>
                          {r.bedType && (
                            <div className="flex justify-between">
                              <span className="text-foreground/50">Bed Type:</span>
                              <span className="capitalize">{r.bedType}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>
    </div>
  );
}
