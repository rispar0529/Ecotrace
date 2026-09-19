"use client";

import React, { useState } from "react";
import { 
  Box, 
  Layers, 
  MapPin, 
  Flame, 
  ChevronRight, 
  Truck, 
  Factory, 
  Pickaxe, 
  CheckCircle2, 
  ArrowRight,
  X,
  Compass,
  Sparkles,
  Info
} from "lucide-react";

export interface SupplyChainTier {
  tier: string;
  name: string;
  location: string;
  stage: string;
  impactShare: number;
  subcomponents: string[];
}

interface SupplyChain3DRoadProps {
  productName: string;
  category: string;
  tiers: SupplyChainTier[];
}

export function SupplyChain3DRoad({
  productName,
  category,
  tiers,
}: SupplyChain3DRoadProps) {
  // Sort from upstream extraction (Tier 4) to downstream assembly (Tier 1)
  const sortedTiers = [...tiers].sort((a, b) => {
    const getNum = (str: string) => {
      const match = str.match(/Tier\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getNum(b.tier) - getNum(a.tier); // 4 -> 3 -> 2 -> 1
  });

  const maxImpact = Math.max(...tiers.map((t) => t.impactShare));
  const [selectedTier, setSelectedTier] = useState<SupplyChainTier | null>(sortedTiers[1] || sortedTiers[0]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getStageIcon = (tierStr: string) => {
    if (tierStr.includes("4")) return Pickaxe;
    if (tierStr.includes("3")) return Factory;
    if (tierStr.includes("2")) return Layers;
    return Box;
  };

  // Geometric coordinates for each station along the S-curved highway
  // Percentage coordinates across the SVG viewBox (w: 900, h: 360)
  const STATION_COORDS = [
    { x: 120, y: 260, label: "T4: Origin Mine" },
    { x: 360, y: 100, label: "T3: Refining Complex" },
    { x: 600, y: 260, label: "T2: Sub-Assembly" },
    { x: 800, y: 120, label: "T1: Final Integration" },
  ];

  return (
    <div className="relative w-full rounded-2xl bg-[#030308] border border-white/[0.08] overflow-hidden flex flex-col p-4 sm:p-6 select-none shadow-2xl">
      
      {/* Highway Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
              3D Supply-Chain Highway & Podiums: {productName}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Curved Transit Corridor
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Follow the winding logistics road. Hover or click any 3D station podium to pop out the forensic tier inspection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Truck className="w-3.5 h-3.5" />
            Upstream Logistics Flow
          </span>
          <span className="text-slate-500">·</span>
          <span>4 Connected Hubs</span>
        </div>
      </div>

      {/* 3D Curved Road Canvas Stage */}
      <div className="relative w-full h-[380px] sm:h-[440px] my-2 overflow-hidden rounded-xl bg-gradient-to-b from-slate-950 via-[#060810] to-slate-950 border border-white/[0.04]">
        
        {/* Ambient Perspective Grid Floor */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: "radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at 50% 50%, black 50%, transparent 95%)"
          }}
        />

        {/* Dynamic Curved Highway SVG */}
        <svg 
          viewBox="0 0 900 360" 
          className="w-full h-full absolute inset-0 z-0 overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Road Shadow Gradient */}
            <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>

            {/* Asphalt Surface Gradient */}
            <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Pulsing Road Beacon Marker Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* S-Curve Highway Base Shadow */}
          <path
            d="M 60 270 C 220 270, 220 100, 360 100 C 500 100, 480 270, 600 270 C 720 270, 720 120, 860 120"
            fill="none"
            stroke="#000000"
            strokeWidth="56"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* S-Curve Highway Asphalt Roadway */}
          <path
            d="M 60 260 C 220 260, 220 100, 360 100 C 500 100, 480 260, 600 260 C 720 260, 720 120, 860 120"
            fill="none"
            stroke="url(#asphaltGrad)"
            strokeWidth="44"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Road Borders (Guard rails) */}
          <path
            d="M 60 260 C 220 260, 220 100, 360 100 C 500 100, 480 260, 600 260 C 720 260, 720 120, 860 120"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeDasharray="none"
          />
          <path
            d="M 60 260 C 220 260, 220 100, 360 100 C 500 100, 480 260, 600 260 C 720 260, 720 120, 860 120"
            fill="none"
            stroke="url(#asphaltGrad)"
            strokeWidth="42"
            strokeLinecap="round"
          />

          {/* Glowing Animated Centerline Markings */}
          <path
            d="M 60 260 C 220 260, 220 100, 360 100 C 500 100, 480 260, 600 260 C 720 260, 720 120, 860 120"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeDasharray="14 16"
            className="animate-pulse"
            opacity="0.85"
          />
        </svg>

        {/* 3D Tier Podiums Positioned along the Road */}
        {sortedTiers.map((tier, idx) => {
          const coords = STATION_COORDS[idx] || { x: 200 * idx, y: 180 };
          const isHotspot = tier.impactShare === maxImpact;
          const isSelected = selectedTier?.name === tier.name;
          const isHovered = hoveredIdx === idx;
          const Icon = getStageIcon(tier.tier);

          // Convert viewBox coords (900 x 360) into CSS percentage positions
          const leftPct = (coords.x / 900) * 100;
          const topPct = (coords.y / 360) * 100;

          return (
            <div
              key={idx}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -60%)",
              }}
              className="absolute z-20 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setSelectedTier(tier)}
            >
              {/* 3D Podium & Floating Card Container */}
              <div 
                className={`relative flex flex-col items-center transition-all duration-300 ${
                  isSelected ? "-translate-y-4 scale-108" : isHovered ? "-translate-y-2.5 scale-104" : ""
                }`}
              >
                
                {/* 3D POP-OUT CARD OVER THE PODIUM */}
                <div 
                  className={`w-48 sm:w-56 p-3 rounded-xl border backdrop-blur-xl transition-all duration-300 shadow-2xl relative ${
                    isHotspot
                      ? "bg-[#1c0f06]/95 border-amber-500 shadow-[0_12px_30px_rgba(245,158,11,0.4)]"
                      : isSelected
                      ? "bg-slate-900/95 border-emerald-400 shadow-[0_12px_30px_rgba(16,185,129,0.4)]"
                      : "bg-slate-950/85 border-white/[0.12] hover:border-emerald-400/60 hover:bg-slate-900"
                  }`}
                >
                  {/* Hotspot Floating Beacon */}
                  {isHotspot && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md whitespace-nowrap">
                      <Flame className="w-3 h-3 text-slate-950" />
                      Major Hotspot
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md ${isHotspot ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 font-bold uppercase">
                        {tier.tier.split(":")[0]}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isHotspot ? "text-amber-400" : "text-emerald-400"}`}>
                      {tier.impactShare}%
                    </span>
                  </div>

                  {/* Station Name & Hub */}
                  <h4 className="text-xs font-bold text-white truncate leading-snug">
                    {tier.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{tier.location}</span>
                  </div>

                  {/* Visual Impact Bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isHotspot ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width: `${tier.impactShare}%` }}
                    />
                  </div>

                  {/* Pop Out Prompt */}
                  <div className="mt-2 pt-1 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className={isSelected ? "text-emerald-300 font-semibold" : ""}>
                      {isSelected ? "Inspecting" : "Click to pop out"}
                    </span>
                    <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isSelected ? "rotate-90 text-emerald-400" : ""}`} />
                  </div>
                </div>

                {/* THE 3D PHYSICAL PODIUM STAND (Extruded Cylinder Base) */}
                <div className="relative mt-2 flex flex-col items-center">
                  {/* Stem connecting card to pedestal */}
                  <div className={`w-1.5 h-4 transition-colors duration-300 ${isHotspot ? "bg-amber-500/80" : isSelected ? "bg-emerald-400" : "bg-slate-700"}`} />

                  {/* Cylindrical Podium Top Cap */}
                  <div 
                    className={`w-16 sm:w-20 h-5 rounded-[50%] border transition-all duration-300 flex items-center justify-center ${
                      isHotspot 
                        ? "bg-amber-500/30 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.6)]" 
                        : isSelected 
                        ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.6)]" 
                        : "bg-slate-800 border-slate-600 shadow-md"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${isHotspot ? "bg-amber-400 animate-ping" : isSelected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  </div>

                  {/* Cylindrical Podium Base Shadow */}
                  <div 
                    className={`w-20 sm:w-24 h-4 rounded-[50%] blur-sm -mt-2.5 transition-all duration-300 ${
                      isHotspot ? "bg-amber-500/50" : isSelected ? "bg-emerald-500/45" : "bg-black/80"
                    }`} 
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* Pop-Out Detailed Forensic Drawer (When Podium Node is Active) */}
      {selectedTier && (
        <div className="mt-3 p-4 sm:p-5 rounded-xl bg-slate-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl animate-fadeIn flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedTier.tier}
              </span>
              {selectedTier.impactShare === maxImpact && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Primary Environmental Bottleneck
                </span>
              )}
            </div>
            
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {selectedTier.name}
              <span className="text-xs font-normal text-slate-400">· {selectedTier.location}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              <span className="text-slate-400">Station Subcomponents & Activities:</span>
              {selectedTier.subcomponents.map((sub, sIdx) => (
                <span key={sIdx} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-200">
                  {sub}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Lifecycle Share</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{selectedTier.impactShare}%</div>
            </div>

            <button
              onClick={() => setSelectedTier(null)}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Highway Footer Guidance */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Curved Highway Corridor: T4 Extraction → T3 Refining → T2 Component → T1 Assembly</span>
        </div>
        <span>Click any station podium to pop out the forensic breakdown</span>
      </div>

    </div>
  );
}
