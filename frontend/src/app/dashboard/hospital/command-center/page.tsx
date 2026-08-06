"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, PlusSquare, AlertTriangle, Users, Ambulance, Bed, Droplet, Wind, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryData {
  timestamp: string;
  beds: number;
  icu: number;
  blood: number;
  oxygen: number;
  activeEmergencies: number;
  waitingPatients: number;
  ambulances: number;
  doctorsOnline: number;
}

const StatBox = ({ title, value, icon: Icon, colorClass, delay = 0 }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bento-card !p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[var(--primary)] transition-colors"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br ${colorClass}`} />
      
      <div className="flex items-center gap-2 mb-4 text-[var(--foreground)]/50">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-bold tracking-wider uppercase">{title}</span>
      </div>

      <motion.div
        key={value}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-6xl font-extrabold tracking-tighter text-black"
      >
        {value === null ? "..." : value}
      </motion.div>
    </motion.div>
  );
};

export default function CommandCenterPage() {
  const { socket, isConnected } = useSocket();
  const [data, setData] = useState<TelemetryData | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleTelemetry = (payload: TelemetryData) => {
      setData(payload);
      if (booting) setBooting(false);
    };

    socket.on("COMMAND_CENTER_TELEMETRY", handleTelemetry);

    return () => {
      socket.off("COMMAND_CENTER_TELEMETRY", handleTelemetry);
    };
  }, [socket, booting]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative min-h-screen">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-12 border-b border-[var(--border)] pb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
            <Terminal className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Command Center</h1>
            <p className="text-sm font-bold mt-2 flex items-center gap-2 uppercase tracking-widest text-[var(--foreground)]/50">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isConnected ? 'bg-green-400' : 'bg-red-400')}></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2", isConnected ? 'bg-green-500' : 'bg-red-500')}></span>
              </span>
              UPLINK: {isConnected ? "STABLE" : "DISCONNECTED"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold uppercase tracking-widest mb-1 text-[var(--foreground)]/50">System Time (UTC)</div>
          <div className="text-2xl font-extrabold text-[var(--foreground)] font-mono">
            {data ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : "00:00:00"}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox 
          title="Total Beds" 
          value={data?.beds} 
          icon={Bed} 
          colorClass="from-blue-600 to-indigo-600" 
          delay={0.1}
        />
        <StatBox 
          title="ICU Units" 
          value={data?.icu} 
          icon={Activity} 
          colorClass="from-rose-500 to-red-600" 
          delay={0.2} 
        />
        <StatBox 
          title="Blood Units" 
          value={data?.blood} 
          icon={Droplet} 
          colorClass="from-red-500 to-rose-700" 
          delay={0.3} 
        />
        <StatBox 
          title="Oxygen (L)" 
          value={data?.oxygen} 
          icon={Wind} 
          colorClass="from-cyan-500 to-blue-500" 
          delay={0.4} 
        />

        <div className="col-span-1 md:col-span-2 lg:col-span-4 h-px bg-[var(--border)] my-4" />

        <StatBox 
          title="Active Emergencies" 
          value={data?.activeEmergencies} 
          icon={AlertTriangle} 
          colorClass="from-orange-500 to-amber-600" 
          delay={0.5} 
        />
        <StatBox 
          title="City Waitlist" 
          value={data?.waitingPatients} 
          icon={Users} 
          colorClass="from-purple-500 to-fuchsia-600" 
          delay={0.6} 
        />
        <StatBox 
          title="Ambulances En Route" 
          value={data?.ambulances} 
          icon={Ambulance} 
          colorClass="from-emerald-500 to-teal-600" 
          delay={0.7} 
        />
        <StatBox 
          title="Doctors Online" 
          value={data?.doctorsOnline} 
          icon={PlusSquare} 
          colorClass="from-indigo-500 to-violet-600" 
          delay={0.8} 
        />
      </div>

      {/* Connection Booting Overlay */}
      <AnimatePresence>
        {booting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--surface)] rounded-[32px]"
          >
            <div className="text-center">
              <Radio className="w-12 h-12 text-[var(--primary)] animate-pulse mx-auto mb-4" />
              <div className="text-[var(--foreground)]/60 font-bold tracking-widest uppercase">Establishing Secure Uplink...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
