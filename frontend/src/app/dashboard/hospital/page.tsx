"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertCircle, CheckCircle2, Clock, Droplets, Bed, Wind, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Request {
  _id: string;
  patientName: string;
  resourceType: string;
  priority: string;
  status: string;
  createdAt: string;
  matchScore?: number;
}

interface Inventory {
  beds: Record<string, { available: number; total: number }>;
  bloodInventory: Record<string, number>;
  oxygenInventory: { available: number; total: number };
}

interface DashboardData {
  pendingRequests: Request[];
  myRequests: Request[];
  hospitalInventory: Inventory;
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/emergency-requests/hospital");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/api/emergency-requests/${id}/accept`);
      fetchData();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        alert("This request was just accepted by another hospital, or you no longer have sufficient compatible inventory.");
        fetchData(); 
      } else {
        alert("Failed to accept request");
      }
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.post(`/api/emergency-requests/${id}/complete`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to complete request");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
          <AlertCircle className="mb-2 h-6 w-6" />
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p className="text-sm">{error}</p>
          <button onClick={fetchData} className="mt-4 rounded-xl bg-red-100 px-4 py-2 text-sm font-medium hover:bg-red-200">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { pendingRequests, myRequests, hospitalInventory } = data || { 
    pendingRequests: [], 
    myRequests: [], 
    hospitalInventory: { beds: {}, bloodInventory: {}, oxygenInventory: { available: 0, total: 0 } } 
  };

  const bedsTotal = Object.values(hospitalInventory.beds || {}).reduce((acc: number, b: any) => acc + (b?.total || 0), 0);
  const bedsAvailable = Object.values(hospitalInventory.beds || {}).reduce((acc: number, b: any) => acc + (b?.available || 0), 0);
  const bloodAvailable = Object.values(hospitalInventory.bloodInventory || {}).reduce((acc: number, val: any) => acc + (val || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] capitalize">
            {user?.name ? (user.city ? `${user.name}, ${user.city}` : user.name) : "Hospital Dashboard"}
          </h1>
          <p className="text-base text-[var(--foreground)]/60 mt-2">
            Monitor incoming emergencies and manage facility resources.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/dashboard/hospital/inventory"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            <Settings className="h-4 w-4" />
            Manage Inventory
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-black bg-[var(--accent)] px-4 py-3 rounded-2xl border border-[var(--border)]">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-black"></span>
            </span>
            Live Updates Active
          </div>
        </div>
      </header>

      {/* Inventory Status Widget - using bento-cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InventoryCard 
          title="Available Beds" 
          icon={<Bed className="h-6 w-6" />} 
          available={bedsAvailable} 
          total={bedsTotal} 
        />
        <InventoryCard 
          title="Blood Units" 
          icon={<Droplets className="h-6 w-6" />} 
          available={bloodAvailable} 
          total={bloodAvailable} 
        />
        <InventoryCard 
          title="Oxygen Cylinders" 
          icon={<Wind className="h-6 w-6" />} 
          available={hospitalInventory.oxygenInventory?.available || 0} 
          total={hospitalInventory.oxygenInventory?.total || 0} 
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Critical / Pending Requests */}
        <section className="lg:col-span-1 bento-card flex flex-col h-[600px] !p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--foreground)]">City Pending</h2>
            <span className="rounded-xl bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-200">
              {pendingRequests.length} Active
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <AnimatePresence>
              {pendingRequests.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-[var(--foreground)]/40">
                  <CheckCircle2 className="mb-2 h-10 w-10 opacity-50" />
                  <p className="text-sm font-medium">No pending requests</p>
                </motion.div>
              ) : (
                pendingRequests.map((req) => (
                  <motion.div
                    key={req._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-sm transition-all hover:border-[var(--primary)] hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[var(--foreground)] text-lg">{req.patientName}</h3>
                        <p className="text-xs font-semibold text-[var(--foreground)]/60 capitalize mt-1">{req.resourceType}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <SeverityBadge severity={req.priority} />
                        {req.matchScore !== undefined && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--border)]">
                            <Activity className="h-3 w-3 text-[var(--accent)]" />
                            Match: {req.matchScore}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <span className="text-xs font-medium text-[var(--foreground)]/50 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--primary-hover)]"
                      >
                        Accept <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Accepted / Completed Requests */}
        <section className="lg:col-span-2 bento-card !p-0 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Facility Operations</h2>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--foreground)]/60">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Patient</th>
                  <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Type</th>
                  <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Severity</th>
                  <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Status</th>
                  <th className="px-6 py-4 text-right font-bold tracking-wider uppercase text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-white">
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-[var(--foreground)]/40 font-medium">
                      No active operations.
                    </td>
                  </tr>
                ) : (
                  myRequests.map((req) => (
                    <tr key={req._id} className="transition-colors hover:bg-[var(--background)]">
                      <td className="px-6 py-5 font-bold text-[var(--foreground)]">{req.patientName}</td>
                      <td className="px-6 py-5 text-[var(--foreground)]/70 capitalize font-medium">{req.resourceType}</td>
                      <td className="px-6 py-5"><SeverityBadge severity={req.priority} /></td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border",
                          req.status === 'COMPLETED' 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-[var(--accent)] text-black border-transparent"
                        )}>
                          {req.status === 'COMPLETED' ? <CheckCircle2 className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {req.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleComplete(req._id)}
                            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--background)]"
                          >
                            Mark Complete
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-[var(--foreground)]/40">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function InventoryCard({ title, icon, available, total }: { title: string, icon: React.ReactNode, available: number, total: number }) {
  const percentage = total > 0 ? Math.round((available / total) * 100) : 0;
  
  return (
    <div className="bento-card !p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded-2xl text-[var(--primary)]">
            {icon}
          </div>
          <span className="font-bold text-lg text-[var(--foreground)]/80">{title}</span>
        </div>
        <span className="text-4xl font-extrabold text-[var(--primary)]">{available}</span>
      </div>
      
      <div>
        <div className="mb-2 flex justify-between text-xs font-bold text-[var(--foreground)]/50">
          <span>Capacity</span>
          <span>{percentage}% Available</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--background)] border border-[var(--border)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const normSeverity = severity?.toUpperCase() || 'LOW';
  switch (normSeverity) {
    case 'CRITICAL':
      return <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>Critical</span>;
    case 'HIGH':
      return <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800 border border-orange-200">High</span>;
    case 'MEDIUM':
      return <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 border border-yellow-200">Medium</span>;
    default:
      return <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 border border-green-200">Low</span>;
  }
}
