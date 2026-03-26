"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, Trophy, Target, Zap } from "lucide-react";

const SPOTLIGHT_CONTRIBUTOR = {
  username: "vivekyadav-3",
  name: "Vivek Yadav",
  avatar_url: "https://github.com/vivekyadav-3.png",
  role: "core",
  achievements: ["Early Bird", "PR Master", "Bug Squasher"],
  recent_activity: "Refactored Scraper to be 10x faster",
  total_points: 1250,
  streak: 15,
};

export default function SpotlightPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8 font-sans selection:bg-cyan-500/30">
      <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Contributor Spotlight
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card with Glassmorphism */}
        <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all hover:border-cyan-500/50 hover:bg-white/10 shadow-2xl">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative flex items-center gap-8">
            <img 
              src={SPOTLIGHT_CONTRIBUTOR.avatar_url} 
              alt={SPOTLIGHT_CONTRIBUTOR.username} 
              className="w-40 h-40 rounded-full border-4 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)] object-cover"
            />
            
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{SPOTLIGHT_CONTRIBUTOR.name}</h2>
              <p className="text-xl text-cyan-400 font-mono mb-4 text-opacity-80">@{SPOTLIGHT_CONTRIBUTOR.username}</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                  Core Contributor
                </Badge>
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                  15 Day Streak 🔥
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <StatCard icon={<Trophy className="text-yellow-400" />} label="Rank" value="#1" />
            <StatCard icon={<Zap className="text-purple-400" />} label="Total Points" value={SPOTLIGHT_CONTRIBUTOR.total_points.toString()} />
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8">
          <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
            <Star className="text-yellow-400" fill="currentColor" />
            Unlocked Badges
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {SPOTLIGHT_CONTRIBUTOR.achievements.map((a) => (
              <div 
                key={a}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-help"
              >
                <div className="p-4 rounded-xl bg-cyan-500/10 mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
                <span className="text-sm font-medium text-center text-white/70 group-hover:text-white">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
      <div className="mb-2">{icon}</div>
      <span className="text-sm text-white/50 mb-1">{label}</span>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}
