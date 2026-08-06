"use client";

import { useState, useEffect } from "react";
import { Activity, Mail, Lock, User, Building2, Wind, Droplets, Bed, HeartPulse, MapPin, ScanEye, LockKeyhole } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type RoleType = "patient" | "hospital";

export default function PortalPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<RoleType>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();

  const [stats, setStats] = useState({
    beds: 1240,
    oxygen: 5800,
    blood: 890,
    activeEmergencies: 42
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/public/stats");
        if (res.data.success && res.data.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"; 
      if (role === "patient") endpoint = isLogin ? "/api/auth/patient/login" : "/api/auth/patient/register";

      const payload = isLogin 
        ? { email, password } 
        : { 
            name, 
            email, 
            password, 
            role: role.toUpperCase(), 
            city: role === "hospital" ? city : undefined,
            age: role === "patient" ? 30 : undefined,
            bloodGroup: role === "patient" ? "O_POSITIVE" : undefined,
          };
        
      const response = await api.post(endpoint, payload);
      
      if (response.data.success && response.data.token) {
        login(response.data.token);
      } else {
        setError(response.data.message || "Failed to authenticate.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex p-4 sm:p-6 lg:p-8 font-sans text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-[var(--primary)]">
      
      <div className="w-full max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-sm flex overflow-hidden border border-[var(--border)]">
        
        {/* Left Panel: Telemetry (Dark Mode to contrast) */}
        <section className="hidden lg:flex w-1/2 bg-[var(--surface-dark)] text-white p-16 flex-col justify-between relative rounded-r-[40px]">
          
          <div 
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer w-max"
          >
            <div className="bg-[var(--accent)] text-black p-2 rounded-xl shadow-[0_0_20px_rgba(212,255,0,0.2)] flex items-center justify-center">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">HEALTHPULSE</span>
          </div>

          <div className="max-w-lg">
             <h2 className="text-5xl font-medium leading-tight mb-6">
               Centralized <br />
               <span className="text-[var(--accent)] relative inline-block">
                 <span className="relative z-10">Command Node</span>
                 <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] text-white/20 pointer-events-none z-0" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <path className="drawn-circle" d="M10,50 C10,10 190,10 190,50 C190,90 10,90 10,50 C10,30 190,30 190,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                 </svg>
               </span>
             </h2>
             <p className="text-lg text-white/70 mb-12">
               Access the synchronization layer to manage real-time emergency routing, hospital inventory, and secure patient dispatching.
             </p>

            <div className="grid grid-cols-2 gap-4">
               <StatBox icon={Bed} label="Available Beds" value={stats.beds} highlight />
               <StatBox icon={HeartPulse} label="Active Crises" value={stats.activeEmergencies} alert />
               <StatBox icon={Droplets} label="Blood Units" value={stats.blood} />
               <StatBox icon={Wind} label="O2 Cylinders" value={stats.oxygen} />
            </div>
          </div>
          
          <p className="text-sm text-white/40 font-mono uppercase tracking-widest">
            System Operational // O(1) Telemetry Active
          </p>
        </section>

        {/* Right Panel: Auth Flow (Light Mode) */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative">
          
          <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-[var(--primary)] text-white p-1.5 rounded-xl shadow-sm flex items-center justify-center">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[var(--primary)]">HEALTHPULSE</span>
          </div>

          <div className="w-full max-w-md">
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-medium tracking-tight mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-[var(--primary)]/60 text-lg">
                {isLogin ? "Enter your details to sign in." : "Join the synchronization network."}
              </p>
            </div>

            {/* Segmented Control for Role */}
            <div className="flex p-1.5 bg-[#F3F3F1] rounded-2xl mb-8">
              {(["patient", "hospital"] as RoleType[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(""); }}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all relative capitalize"
                >
                  {role === r && (
                    <motion.div
                      layoutId="role-indicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-black/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={cn(
                    "relative z-10 flex items-center justify-center gap-2 transition-colors duration-300",
                    role === r ? "text-black" : "text-black/50 hover:text-black/70"
                  )}>
                    {r === "patient" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    {r}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              
              <AnimatePresence mode="sync">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <Input 
                      type="text" 
                      placeholder={role === "hospital" ? "Facility Name" : "Full Name"} 
                      value={name} 
                      onChange={setName} 
                    />
                    {role === "hospital" && (
                      <Input 
                        type="text" 
                        placeholder="City (e.g. Noida)" 
                        value={city} 
                        onChange={setCity} 
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Input type="email" placeholder="Email Address" value={email} onChange={setEmail} />
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={setPassword}
                rightIcon={showPassword ? ScanEye : LockKeyhole}
                onRightIconClick={() => setShowPassword(!showPassword)}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-2xl p-4 mt-2"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[var(--primary)] text-white font-semibold text-lg rounded-2xl hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Activity className="w-5 h-5 text-[var(--accent)]" />
                  </motion.div>
                ) : (
                  isLogin ? "Sign In" : "Sign Up"
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-sm font-medium text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>

          </div>
        </section>
      </div>
    </main>
  );
}

// Clean, Flat Input Component
function Input({ type, placeholder, value, onChange, rightIcon: RightIcon, onRightIconClick }: any) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className={cn(
          "w-full h-14 px-5 bg-white border-2 border-[var(--border)] rounded-2xl text-[var(--primary)] focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-black/40 text-base font-medium",
          RightIcon && "pr-12"
        )}
      />
      {RightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-[var(--primary)] transition-colors"
        >
          <RightIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Flat Stat Box for Left Panel
function StatBox({ icon: Icon, label, value, highlight, alert }: any) {
  return (
    <div className={cn(
      "p-5 rounded-3xl border border-white/10",
      highlight ? "bg-[var(--accent)] text-black border-transparent" : "bg-white/5",
      alert && "border-red-500/50 bg-red-500/10"
    )}>
      <div className="flex justify-between items-start mb-3">
        <Icon className={cn("w-6 h-6", highlight ? "text-black" : alert ? "text-red-400" : "text-[var(--accent)]")} />
        {alert && (
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>
      <div>
        <p className={cn("text-sm font-medium mb-1", highlight ? "text-black/60" : "text-white/60")}>{label}</p>
        <p className="text-3xl font-bold tracking-tight">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
