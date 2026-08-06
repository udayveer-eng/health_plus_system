"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, Clock, Phone, AlertCircle, ShieldAlert, ArrowRight, Ambulance } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Dijkstra nodes for Noida
const routeNodes = [
  { id: "S18", label: "Sector 18", status: "completed", time: "10:42 AM", delay: false },
  { id: "EWY", label: "Noida Expressway", status: "completed", time: "10:48 AM", delay: false },
  { id: "S62", label: "Sector 62 (Traffic Zone)", status: "active", time: "ETA 10:55 AM", delay: true },
  { id: "HSP", label: "City Hospital", status: "pending", time: "ETA 11:05 AM", delay: false },
];

export default function AmbulanceTrackingPage() {
  const [eta, setEta] = useState(14); // mins
  const [distance, setDistance] = useState(4.2); // km

  // Fake countdown for effect
  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(1, prev - 1));
      setDistance(prev => Math.max(0.1, prev - 0.3));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Tracking</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Tracking Unit A-442 dispatched from City Hospital
          </p>
        </div>
        <div className="bg-accent/20 border border-accent/30 text-accent-foreground px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          ETA: {eta} Minutes
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Map / Visualization Area */}
        <div className="lg:col-span-2 bento-card p-6 md:p-8 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-accent" />
              Routing Engine (Dijkstra)
            </h2>
            <div className="text-xs font-mono bg-background px-3 py-1 rounded-lg border border-border">
              O(E + V log V) Sync
            </div>
          </div>

          {/* Synthetic Map Visualization */}
          <div className="flex-1 bg-background rounded-3xl border border-border relative overflow-hidden flex items-center justify-center p-8">
            
            {/* Grid background for technical feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative w-full max-w-md h-full flex flex-col justify-between">
              
              {/* Connecting Line */}
              <div className="absolute left-[23px] top-8 bottom-8 w-1 bg-border rounded-full overflow-hidden">
                <motion.div 
                  className="w-full bg-accent absolute top-0 left-0"
                  initial={{ height: "0%" }}
                  animate={{ height: "60%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>

              {routeNodes.map((node, i) => (
                <div key={node.id} className="relative z-10 flex items-center gap-6">
                  
                  {/* Node Circle */}
                  <div className={cn(
                    "w-12 h-12 rounded-full border-4 flex items-center justify-center bg-surface transition-colors",
                    node.status === "completed" ? "border-accent text-accent" : 
                    node.status === "active" ? "border-primary text-primary" : "border-border text-foreground/30"
                  )}>
                    {node.status === "completed" ? (
                      <MapPin className="w-5 h-5 fill-accent/20" />
                    ) : node.status === "active" ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Ambulance className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-border" />
                    )}
                  </div>

                  {/* Node Info */}
                  <div className="flex-1 bg-surface border border-border rounded-2xl p-4 shadow-sm relative">
                    {/* Arrow tail */}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-surface border-l border-b border-border rotate-45" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className={cn(
                          "font-bold text-sm", 
                          node.status === "active" ? "text-primary" : "text-foreground/80"
                        )}>
                          {node.label}
                        </p>
                        <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {node.time}
                        </p>
                      </div>
                      
                      {node.delay && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-red-100">
                          <AlertCircle className="w-3 h-3" />
                          TRAFFIC
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* Driver Card */}
          <div className="bento-card p-6">
            <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">
              Dispatch Details
            </h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-border overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Rakesh+Kumar&background=3F3F3F&color=fff&size=128" alt="Driver" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Rakesh Kumar</h4>
                <p className="text-sm text-foreground/60">Unit A-442 (ALS)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-background border border-border rounded-xl p-3">
                <p className="text-xs text-foreground/50 mb-1">Distance</p>
                <p className="font-bold">{distance.toFixed(1)} km</p>
              </div>
              <div className="bg-background border border-border rounded-xl p-3">
                <p className="text-xs text-foreground/50 mb-1">Speed</p>
                <p className="font-bold">42 km/h</p>
              </div>
            </div>

            <button className="w-full bg-primary text-white h-12 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Phone className="w-4 h-4" />
              Contact Driver
            </button>
          </div>

          {/* Incident Info */}
          <div className="bg-surface-dark text-white rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Incident Request</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Priority</span>
                <span className="text-accent font-bold">CRITICAL</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Required</span>
                <span className="font-medium">1x ICU Bed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Target Hosp.</span>
                <span className="font-medium">City Hospital</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
