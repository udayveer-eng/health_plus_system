"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, Zap, Database, Network, ShieldCheck, MapPin, Building2, GitBranch, Link, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-[var(--primary)] font-sans">
      
      {/* Navigation */}
      <nav className="w-full pt-8 px-6 lg:px-12 flex justify-between items-center max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 text-[var(--primary)]">
          <div className="bg-[var(--accent)] text-black p-2 rounded-xl shadow-sm border border-[var(--border)] flex items-center justify-center">
            <Activity className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">HEALTHPULSE</span>
        </div>
        
        <button 
          onClick={() => router.push("/portal")}
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--primary-hover)] transition-colors"
        >
          Access Portal
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-32 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20">
          
          <div className="w-full lg:w-[65%]">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] leading-[1.1] font-medium tracking-tight text-[var(--primary)]"
            >
              Your <span className="relative inline-block">
                <span className="relative z-10">Ultimate</span>
                {/* SVG Hand-drawn circle highlight */}
                <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] text-[var(--accent)] pointer-events-none z-0" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <path className="drawn-circle" d="M10,50 C10,10 190,10 190,50 C190,90 10,90 10,50 C10,30 190,30 190,50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span> Emergency <br className="hidden md:block"/>
              Synchronization Network
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-[35%] flex flex-col gap-6"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <Building2 className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <MapPin className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <Network className="w-5 h-5 text-[var(--primary)]" />
              </div>
            </div>
            <p className="text-xl text-[var(--primary)]/70 max-w-md">
              All essential emergency resource routing and hospital management functions in one unified platform.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Bento Grid */}
      <section className="pt-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
          
          {/* Card 1: White, Wide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bento-card md:col-span-2 p-10 flex flex-col justify-between group"
          >
            <div className="max-w-md">
              <h3 className="text-3xl font-medium mb-3">Dijkstra Routing Engine</h3>
              <p className="text-lg text-black/60">
                Computes the absolute shortest path using a synthetic weighted graph of city zones with dynamic traffic multipliers.
              </p>
            </div>
            
            {/* Mock UI Element within Card */}
            <div className="w-full max-w-lg mt-8 bg-[#F3F3F1] rounded-2xl p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                     <ArrowRight className="w-4 h-4 text-black" />
                   </div>
                   <span className="font-semibold">Gomti Nagar → Hazratganj</span>
                 </div>
                 <span className="font-mono text-sm bg-white px-3 py-1 rounded-full border border-black/10">14.0 KM</span>
               </div>
               <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                 <div className="h-full w-3/4 bg-[var(--primary)]" />
               </div>
            </div>
          </motion.div>

          {/* Card 2: Dark, Tall */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bento-card dark p-10 flex flex-col justify-between"
          >
            <div>
               <h3 className="text-2xl font-medium mb-3 text-white">Immutable Audit Trails</h3>
               <p className="text-white/60">
                 Every state transition is logged with forensic before/after state diffs in MongoDB.
               </p>
            </div>
            
            {/* Mock Receipt/Log UI */}
            <div className="bg-[#2A2A2A] p-6 rounded-2xl w-full border border-white/10 mt-6 relative">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--accent)]" />
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Log ID:</span>
                <span className="text-sm font-mono text-white/80">#HPL-8492</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Action</span>
                  <span className="text-sm font-medium">DISPATCHED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">User</span>
                  <span className="text-sm font-medium">ADMIN</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Light, Small */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bento-card p-10 flex flex-col justify-between bg-[#F0F2E8] border border-[var(--accent)]/30"
          >
             <div>
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                 <Zap className="w-6 h-6 text-[var(--accent)]" />
               </div>
               <h3 className="text-2xl font-medium mb-3">O(1) Regional Telemetry</h3>
               <p className="text-black/60">
                 Socket.io geographic rooms instantly broadcast waitlists to city command centers without loop overhead.
               </p>
             </div>
          </motion.div>

          {/* Card 4: Light, Medium (taking up remaining space) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bento-card md:col-span-2 p-10 flex items-center justify-between group"
          >
             <div className="w-1/2 pr-8">
               <h3 className="text-3xl font-medium mb-3">Redlock Concurrency</h3>
               <p className="text-lg text-black/60 mb-8">
                 Zero double-booking of critical resources. Atomic transactions fortified with Redis distributed locks.
               </p>
               <button 
                 onClick={() => router.push("/portal")}
                 className="flex items-center gap-3 bg-[var(--accent)] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#c9e836] transition-colors"
               >
                 Start Routing <ArrowRight className="w-4 h-4" />
               </button>
             </div>
             <div className="w-1/2 h-full bg-[#F3F3F1] rounded-2xl relative overflow-hidden flex items-center justify-center">
                <ShieldCheck className="w-24 h-24 text-[var(--primary)]/10" />
                {/* Floating tags */}
                <div className="absolute top-1/4 left-1/4 bg-white shadow-md rounded-lg px-4 py-2 font-mono text-xs flex items-center gap-2 transform -rotate-6">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Locked
                </div>
                <div className="absolute bottom-1/4 right-1/4 bg-white shadow-md rounded-lg px-4 py-2 font-mono text-xs flex items-center gap-2 transform rotate-6">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Bounced
                </div>
             </div>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-24 border-t border-black/5 bg-[var(--background)]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Left: Brand and Copyright */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-[var(--accent)] text-black p-1.5 rounded-lg shadow-sm border border-[var(--border)] flex items-center justify-center">
                  <Activity className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-[var(--primary)]">HEALTHPULSE</span>
              </div>
              <span className="text-sm font-medium text-[var(--primary)]/40 hidden sm:block">
                © 2026 All rights reserved.
              </span>
            </div>
            
            {/* Right: Credits and Socials */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]/60">
                <span>Designed & developed by</span>
                <span className="px-3 py-1 bg-black/5 text-[var(--primary)] font-bold rounded-md">
                  Aditya Verma
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-1">
                <a href="mailto:adiverma8858@gmail.com" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span>adiverma8858@gmail.com</span>
                </a>
                <a href="https://github.com/f7aditya" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/adityavermaf7/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors">
                  <Link className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

          </div>
          <div className="mt-6 text-center block sm:hidden">
            <span className="text-xs font-medium text-[var(--primary)]/40">
              © 2026 All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
