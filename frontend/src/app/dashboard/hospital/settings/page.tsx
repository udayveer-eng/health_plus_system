"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building, MapPin, Mail, Save, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function HospitalSettingsPage() {
  const { updateToken } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    city: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/hospital/profile");
      if (res.data && res.data.hospital) {
        const data = res.data.hospital;
        setProfile({
          name: data.name || "",
          email: data.email || "",
          city: data.city || "",
          location: data.location || "",
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.patch("/api/hospital/profile", {
        name: profile.name,
        city: profile.city,
        location: profile.location,
      });
      
      if (res.data) {
        if (res.data.token) {
          updateToken(res.data.token);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
          Hospital Settings
        </h1>
        <p className="text-[var(--foreground)]/60 mt-2 text-base">
          Manage your hospital's profile and information.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bento-card !p-8">
            <form onSubmit={handleSave} className="space-y-8">
              
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center border-b border-[var(--border)] pb-4">
                  <div className="bg-[var(--background)] p-2 rounded-xl mr-3 border border-[var(--border)] text-[var(--primary)]">
                    <Building className="w-5 h-5" />
                  </div>
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Hospital Name</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
                      <input
                        type="text"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all font-medium"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
                      <input
                        type="email"
                        disabled
                        className="w-full bg-black/5 border border-transparent rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)]/50 cursor-not-allowed font-medium"
                        value={profile.email}
                      />
                    </div>
                    <p className="text-xs font-bold text-[var(--foreground)]/40">Email cannot be changed directly.</p>
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="space-y-6 pt-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center border-b border-[var(--border)] pb-4">
                  <div className="bg-[var(--background)] p-2 rounded-xl mr-3 border border-[var(--border)] text-[var(--primary)]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  Location Details
                </h2>
                
                <div className="grid grid-cols-1 gap-8 pt-2">
                  <div className="space-y-3 md:w-1/2 pr-4">
                    <label className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all font-medium"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Detailed Address / Location</label>
                    <textarea
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all min-h-[120px] font-medium resize-y"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-10 flex items-center justify-end">
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-black bg-[var(--accent)] px-3 py-1.5 rounded-lg flex items-center font-bold text-sm mr-4"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Saved successfully
                  </motion.div>
                )}
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg min-w-[160px] flex items-center justify-center disabled:opacity-70"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
