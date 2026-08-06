"use client";

import { useState } from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Activity, Mail, Lock, User, Stethoscope, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type RoleType = "patient" | "hospital";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<RoleType>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"; // Default to hospital
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
        // useAuth login function will handle decoding and routing
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

  const roles = [
    { id: "patient", icon: User, label: "Patient" },
    { id: "hospital", icon: Building2, label: "Hospital" },
  ] as const;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PremiumCard gradient className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Activity className="text-primary w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-sm text-foreground/60 mt-1">
                {isLogin ? "Sign in to your HealthPulse account" : "Join HealthPulse today"}
              </p>
            </div>

            {/* Role Selector */}
            <div className="flex p-1 bg-background/50 rounded-lg mb-8 border border-border">
              {roles.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all relative z-10",
                      isActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-role"
                        className="absolute inset-0 bg-surface rounded-md shadow-sm border border-border pointer-events-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-20 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-medium text-foreground/80 pl-1">{role === "hospital" ? "Hospital Name" : "Full Name"}</label>
                    <div className="relative">
                      {role === "hospital" ? <Building2 className="absolute left-3 top-3 w-5 h-5 text-foreground/40" /> : <User className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />}
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-background/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder={role === "hospital" ? "Enter hospital name" : "Enter your full name"}
                      />
                    </div>
                  </motion.div>
                )}
                
                {!isLogin && role === "hospital" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-medium text-foreground/80 pl-1">City</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required={!isLogin && role === "hospital"}
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-background/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="e.g. Delhi, Mumbai, Lucknow"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground/80 pl-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-background/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground/80 pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-background/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-error text-sm bg-error/10 border border-error/20 rounded-md p-3"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <PremiumButton
                type="submit"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
              </PremiumButton>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </PremiumCard>
        </motion.div>
      </div>
    </main>
  );
}
