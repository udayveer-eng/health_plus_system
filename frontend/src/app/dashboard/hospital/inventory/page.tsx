"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, Droplets, Wind, Save, CheckCircle2, Activity, Info, Minus, Plus } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const BED_TYPES = ["general", "icu", "ventilator", "emergency"];
const BLOOD_GROUPS = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"];

// A rich, custom number stepper component matching the new aesthetic
function NumberStepper({ value, onChange, max, className = "" }: { value: number, onChange: (v: number) => void, max?: number, className?: string }) {
  return (
    <div className={cn("flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)] transition-all", className)}>
      <button 
        type="button" 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="px-3 py-2.5 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-black/5 transition-colors border-r border-[var(--border)]"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (isNaN(val)) onChange(0);
          else onChange(max !== undefined ? Math.min(max, val) : val);
        }}
        className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-0 text-[var(--foreground)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0 p-0 font-bold text-base"
      />
      <button 
        type="button" 
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className="px-3 py-2.5 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-black/5 transition-colors border-l border-[var(--border)]"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function InventoryPage() {
  const [beds, setBeds] = useState<any>({});
  const [blood, setBlood] = useState<any>({});
  const [oxygen, setOxygen] = useState({ total: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/hospital/resources");
      const { resources } = res.data;
      if (resources) {
        setBeds(resources.beds || {});
        setBlood(resources.bloodInventory || {});
        setOxygen(resources.oxygenInventory || { total: 0, available: 0 });
      }
    } catch (err: any) {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await api.patch("/api/hospital/resources", {
        beds,
        bloodInventory: blood,
        oxygenInventory: oxygen,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update resources");
    } finally {
      setSaving(false);
    }
  };

  const handleBedChange = (type: string, field: "total" | "available", value: number) => {
    setBeds({
      ...beds,
      [type]: {
        ...beds[type],
        [field]: value >= 0 ? value : 0,
      }
    });
  };

  const handleBloodChange = (group: string, value: number) => {
    setBlood({
      ...blood,
      [group]: value >= 0 ? value : 0,
    });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-32">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Inventory Management</h1>
          <p className="text-[var(--foreground)]/60 mt-2 text-base max-w-2xl">
            Keep your facility's resources up-to-date. Accurate inventory ensures the HealthPulse matching engine routes the right patients to your hospital during emergencies.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 flex items-center font-medium text-sm">
            <Info className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Beds Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]">
                <Bed className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Bed Capacity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BED_TYPES.map(type => (
                <div key={type} className="bento-card !p-6 group hover:border-[var(--primary)] transition-all duration-300">
                  <h3 className="text-lg font-bold text-[var(--foreground)] capitalize mb-6">{type}</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-[var(--foreground)]/60 block mb-2 uppercase font-bold tracking-wider">Total</label>
                      <NumberStepper 
                        value={beds[type]?.total || 0}
                        onChange={(v) => handleBedChange(type, "total", v)}
                      />
                    </div>
                    <div className="pt-5 border-t border-[var(--border)]">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-[var(--foreground)]/60 uppercase font-bold tracking-wider">Available</label>
                        <span className="text-[10px] text-black bg-[var(--accent)] px-2 py-0.5 rounded-md font-bold uppercase">Live</span>
                      </div>
                      <NumberStepper 
                        value={beds[type]?.available || 0}
                        max={beds[type]?.total || 0}
                        onChange={(v) => handleBedChange(type, "available", v)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Oxygen Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-cyan-600">
                <Wind className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Oxygen Supply</h2>
            </div>
            
            <div className="bento-card !p-8 overflow-hidden hover:border-cyan-300 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                <div>
                  <label className="text-sm text-[var(--foreground)]/60 block mb-4 font-bold uppercase tracking-wider">Total Cylinders Capacity</label>
                  <div className="flex items-end gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={oxygen.total || ""}
                      onChange={(e) => setOxygen({ ...oxygen, total: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                      className="w-full max-w-[200px] text-5xl font-extrabold bg-transparent border-b-4 border-[var(--border)] pb-2 text-[var(--foreground)] focus:border-cyan-500 outline-none transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0"
                    />
                    <span className="text-[var(--foreground)]/40 pb-3 font-bold">units</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[var(--foreground)]/60 block mb-4 font-bold uppercase tracking-wider">Currently Available</label>
                  <div className="flex items-end gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      max={oxygen.total}
                      value={oxygen.available || ""}
                      onChange={(e) => setOxygen({ ...oxygen, available: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })}
                      className="w-full max-w-[200px] text-5xl font-extrabold bg-transparent border-b-4 border-cyan-200 pb-2 text-cyan-600 focus:border-cyan-500 outline-none transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0"
                    />
                    <span className="text-[var(--foreground)]/40 pb-3 font-bold">units ready</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Blood Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-red-500">
                <Droplets className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Blood Bank</h2>
            </div>
            
            <div className="bento-card !p-8 hover:border-red-200 transition-all duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {BLOOD_GROUPS.map(group => (
                  <div key={group} className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-[var(--background)] border border-[var(--border)] hover:border-red-300 transition-colors group/blood">
                    <div className="w-16 h-16 rounded-full bg-white text-red-500 border border-red-100 flex items-center justify-center font-extrabold text-xl mb-6 shadow-sm group-hover/blood:scale-110 group-hover/blood:bg-red-500 group-hover/blood:text-white transition-all">
                      {group.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}
                    </div>
                    <NumberStepper 
                      value={blood[group] || 0}
                      onChange={(v) => handleBloodChange(group, v)}
                      className="w-full max-w-[140px] bg-white"
                    />
                    <span className="text-xs text-[var(--foreground)]/40 mt-3 uppercase tracking-widest font-bold">pints</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </form>
      </motion.div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:ml-32 z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-[var(--border)] shadow-2xl rounded-2xl p-3 flex items-center gap-4">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, w: 0, x: -20 }}
                animate={{ opacity: 1, w: "auto", x: 0 }}
                exit={{ opacity: 0, w: 0, x: -20 }}
                className="text-black bg-[var(--accent)] px-3 py-1.5 rounded-lg flex items-center font-bold text-sm whitespace-nowrap overflow-hidden ml-2"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-base"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Inventory
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
