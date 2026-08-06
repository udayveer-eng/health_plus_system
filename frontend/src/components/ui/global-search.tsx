"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Building, User as UserIcon } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(query);
    }, 400); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // If user is a PATIENT, they search for HOSPITALS
      // If user is a HOSPITAL, they search for EMERGENCIES (by patient name)
      const endpoint = user.role === "PATIENT" ? "/api/search/hospitals" : "/api/search/emergencies";
      
      const res = await api.get(`${endpoint}?search=${encodeURIComponent(searchQuery)}&limit=5`);
      setResults(res.data.data || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery("");
    
    if (user?.role === "PATIENT") {
      router.push(`/dashboard/patient?search=${encodeURIComponent(item.name)}`);
    } else {
      // Pop up the patient modal
      setSelectedItem(item);
    }
  };

  if (!user || user.role === "ADMIN") return null;

  const isPatient = user.role === "PATIENT";
  const placeholder = isPatient ? "Search hospitals by name or city..." : "Search patient emergencies by name...";

  return (
    <div className="hidden md:flex items-center relative" ref={containerRef}>
      <Search className={`w-4 h-4 absolute left-3 transition-colors ${isOpen ? 'text-blue-500' : 'text-foreground/40'}`} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query && setIsOpen(true)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-1.5 bg-surface border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-64 transition-all focus:w-80"
      />
      
      {loading && (
        <div className="absolute right-3">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      )}

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-sm text-foreground/50">
                No results found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {results.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-foreground/5 text-left transition-colors"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isPatient ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {isPatient ? <Building className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {isPatient ? item.name : item.patientName}
                      </div>
                      <div className="text-xs text-foreground/60 mt-0.5">
                        {isPatient ? (
                          `${item.city || 'Unknown Location'}`
                        ) : (
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="capitalize">{item.resourceType} needed</span>
                            •
                            <span className={`capitalize font-medium ${item.priority === 'critical' ? 'text-red-500' : 'text-orange-500'}`}>
                              {item.priority} severity
                            </span>
                            •
                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedItem.patientName}</h2>
                  <p className="text-sm text-foreground/60 mt-1">Requested from {selectedItem.city}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedItem.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                  selectedItem.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedItem.priority?.toUpperCase()} SEVERITY
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                  <p className="text-xs text-foreground/50 font-semibold mb-1 uppercase tracking-wider">Resource Needed</p>
                  <p className="text-sm font-bold text-foreground capitalize">
                    {selectedItem.resourceType}
                    {selectedItem.resourceType === 'bed' && ` (${selectedItem.bedType})`}
                    {selectedItem.resourceType === 'blood' && ` (${selectedItem.bloodGroup})`}
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                  <p className="text-xs text-foreground/50 font-semibold mb-1 uppercase tracking-wider">Quantity</p>
                  <p className="text-sm font-bold text-foreground">{selectedItem.quantity} Units</p>
                </div>
                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                  <p className="text-xs text-foreground/50 font-semibold mb-1 uppercase tracking-wider">Contact Phone</p>
                  <p className="text-sm font-bold text-foreground">{selectedItem.phone}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                  <p className="text-xs text-foreground/50 font-semibold mb-1 uppercase tracking-wider">Current Status</p>
                  <p className="text-sm font-bold text-foreground capitalize">{selectedItem.status}</p>
                </div>
              </div>

              {selectedItem.message && (
                <div className="mb-6 bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
                  <p className="text-xs text-blue-500 font-semibold mb-1 uppercase tracking-wider">Patient Message</p>
                  <p className="text-sm text-foreground/80">{selectedItem.message}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                <p className="text-xs text-foreground/40 font-medium">
                  Requested on {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 bg-foreground text-background font-bold text-sm rounded-xl hover:bg-foreground/90 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
