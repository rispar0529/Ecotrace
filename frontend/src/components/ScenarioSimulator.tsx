"use client";

import React from "react";
import { Sliders, Lightbulb, Sun, TrendingDown, RotateCcw, CheckCircle2, ShieldCheck, Zap, RefreshCw, MapPin } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export interface ScenarioParams {
  adoptionRate: number;        // Primary intervention adoption % (10 - 100)
  recycledContent: number;     // Recycled & circular feedstocks % (0 - 100)
  renewableEnergy: number;     // Green power / clean grid % (0 - 100)
  regionalSourcing: number;    // Nearshoring / domestic transport % (0 - 100)
}

interface ScenarioSimulatorProps {
  productName: string;
  intervention: string;
  baselineCarbon: number;
  baselineWater: number;
  baselineWaste: number;
  baseReduction: number;
  params: ScenarioParams;
  onChange: (updated: ScenarioParams) => void;
  onReset: () => void;
}

export function ScenarioSimulator({
  productName,
  intervention,
  baselineCarbon,
  baselineWater,
  baselineWaste,
  baseReduction,
  params,
  onChange,
  onReset,
}: ScenarioSimulatorProps) {
  // Deterministic formula matching ISO 14040/44 engine in backend
  const baseDelta = baseReduction * (params.adoptionRate / 100.0);
  const cleanEnergyDelta = params.renewableEnergy * 0.18;
  const recycledDelta = params.recycledContent * 0.22;
  const localSourcingDelta = params.regionalSourcing * 0.08;

  const totalReductionPct = Math.min(88.0, Number((baseDelta + cleanEnergyDelta + recycledDelta + localSourcingDelta).toFixed(1)));

  const simulatedCarbon = Number((baselineCarbon * (1.0 - totalReductionPct / 100.0)).toFixed(2));
  const avoidedCarbon = Number((baselineCarbon - simulatedCarbon).toFixed(2));

  const waterReductionPct = Number((totalReductionPct * 0.85).toFixed(1));
  const simulatedWater = Number((baselineWater * (1.0 - waterReductionPct / 100.0)).toFixed(0));
  const avoidedWater = Number((baselineWater - simulatedWater).toFixed(0));

  const wasteReductionPct = Number((totalReductionPct * 0.75).toFixed(1));
  const simulatedWaste = Number((baselineWaste * (1.0 - wasteReductionPct / 100.0)).toFixed(2));
  const avoidedWaste = Number((baselineWaste - simulatedWaste).toFixed(2));

  // Data formatted for before/after comparison chart
  const comparisonData = [
    {
      metric: "Carbon (kg CO₂e)",
      Baseline: baselineCarbon,
      Simulated: simulatedCarbon,
      unit: "kg",
    },
    {
      metric: "Waste (kg)",
      Baseline: baselineWaste,
      Simulated: simulatedWaste,
      unit: "kg",
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6 border border-emerald-500/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white font-mono tracking-tight">
              Interactive What-If Decarbonization Simulator
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              ISO 14040 Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate procurement mandates, clean grid transitions, and circularity levers for <strong className="text-slate-200">{productName}</strong>.
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset Defaults
        </button>
      </div>

      {/* Target Strategic Intervention Box */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-md flex items-start gap-3.5">
        <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-emerald-300 flex items-center gap-2 font-mono">
            PRIMARY SYSTEMIC INTERVENTION
            <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Highest Leverage
            </span>
          </div>
          <div className="text-slate-200 font-medium leading-relaxed">
            {intervention}
          </div>
        </div>
      </div>

      {/* Scenario Presets Bar (Human-Centered Quick Scenarios) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mr-1">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          Quick Procurement Scenarios:
        </span>
        <button
          type="button"
          onClick={() => onChange({ adoptionRate: 30, renewableEnergy: 20, recycledContent: 15, regionalSourcing: 10 })}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer font-mono"
        >
          🌱 Near-Term Pilot (Year 1)
        </button>
        <button
          type="button"
          onClick={() => onChange({ adoptionRate: 75, renewableEnergy: 60, recycledContent: 45, regionalSourcing: 35 })}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold transition-all cursor-pointer font-mono"
        >
          🎯 Science-Based Target (SBTi 2030)
        </button>
        <button
          type="button"
          onClick={() => onChange({ adoptionRate: 100, renewableEnergy: 100, recycledContent: 85, regionalSourcing: 60 })}
          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] text-cyan-300 font-semibold transition-all cursor-pointer font-mono"
        >
          ⚡ Aggressive Net-Zero Mandate
        </button>
      </div>

      {/* Grid: 4 Advanced Interactive Simulation Levers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Slider 1: Primary Intervention Adoption */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-3 relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Supplier Contract Mandate
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Share of upstream supplier contracts with binding zero-emission clauses.
              </p>
            </div>
            <span className="font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40 text-xs shrink-0 shadow-sm">
              {params.adoptionRate}% suppliers
            </span>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={params.adoptionRate}
              onChange={(e) => onChange({ ...params, adoptionRate: Number(e.target.value) })}
              className="custom-slider w-full accent-amber-400"
              style={{ color: "#f59e0b" }}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10% Pilot tier</span>
              <span className="text-amber-400/80 font-medium">50% Key vendors</span>
              <span>100% Full audit</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
            <span>Procurement feasibility:</span>
            <span className="text-emerald-400 font-medium">High · Supplier RFP phase</span>
          </div>
        </div>

        {/* Slider 2: Renewable Grid & Clean Electricity */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-3 relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
                Clean Electricity & Solar PPAs
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Transition manufacturing & refining mills to dedicated wind/solar power.
              </p>
            </div>
            <span className="font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 text-xs shrink-0 shadow-sm">
              {params.renewableEnergy}% renewable
            </span>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.renewableEnergy}
              onChange={(e) => onChange({ ...params, renewableEnergy: Number(e.target.value) })}
              className="custom-slider w-full accent-emerald-400"
              style={{ color: "#10b981" }}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% Regional grid</span>
              <span className="text-emerald-400/80 font-medium">50% On-site solar</span>
              <span>100% 24/7 Clean PPA</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
            <span>Emission factor reduction:</span>
            <span className="text-emerald-400 font-medium">Eliminates Scope 2 fossil burn</span>
          </div>
        </div>

        {/* Slider 3: Recycled & Circular Content */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-3 relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                Recycled & Secondary Feedstocks
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Replace virgin extracted ores and polymers with certified post-consumer inputs.
              </p>
            </div>
            <span className="font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40 text-xs shrink-0 shadow-sm">
              {params.recycledContent}% circular
            </span>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.recycledContent}
              onChange={(e) => onChange({ ...params, recycledContent: Number(e.target.value) })}
              className="custom-slider w-full accent-cyan-400"
              style={{ color: "#06b6d4" }}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% Virgin raw ore</span>
              <span className="text-cyan-400/80 font-medium">50% Certified blend</span>
              <span>100% Closed-loop scrap</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
            <span>Biodiversity & water impact:</span>
            <span className="text-cyan-400 font-medium">Avoids primary open-pit mining</span>
          </div>
        </div>

        {/* Slider 4: Regional Sourcing & Nearshoring */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-violet-500/20 hover:border-violet-500/40 transition-all space-y-3 relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                Regional Supply Hub Nearshoring
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Relocate subcomponent assembly closer to distribution centers; replace air with rail.
              </p>
            </div>
            <span className="font-mono font-bold text-violet-300 bg-violet-950/80 px-2.5 py-1 rounded-lg border border-violet-500/40 text-xs shrink-0 shadow-sm">
              {params.regionalSourcing}% nearshored
            </span>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.regionalSourcing}
              onChange={(e) => onChange({ ...params, regionalSourcing: Number(e.target.value) })}
              className="custom-slider w-full accent-violet-400"
              style={{ color: "#8b5cf6" }}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% Long-haul air</span>
              <span className="text-violet-400/80 font-medium">50% Maritime / Rail</span>
              <span>100% Domestic corridor</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
            <span>Logistics resilience:</span>
            <span className="text-violet-400 font-medium">-70% Freight lead time variance</span>
          </div>
        </div>

      </div>

      {/* Real-time Outcomes Impact Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Carbon Outcome */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">Carbon Impact</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{simulatedCarbon}</span>
              <span className="text-xs text-slate-400">kg CO₂e</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Baseline: {baselineCarbon} kg</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              -{totalReductionPct}%
            </span>
          </div>
        </div>

        {/* Water Outcome */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">Water Depletion</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{simulatedWater}</span>
              <span className="text-xs text-slate-400">Liters</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Baseline: {baselineWater} L</span>
            <span className="text-cyan-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              -{waterReductionPct}%
            </span>
          </div>
        </div>

        {/* Waste Outcome */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">Solid Waste</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{simulatedWaste}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Baseline: {baselineWaste} kg</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              -{wasteReductionPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Comparative Before vs After Visual Bar Chart */}
      <div className="p-5 rounded-xl bg-slate-950/90 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Environmental Delta: Baseline vs. Simulated Mandate
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            Avoids ~{avoidedCarbon} kg CO₂e / unit
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                cursor={{ fill: "rgba(255, 255, 255, 0.05)", radius: 6 }}
                contentStyle={{ backgroundColor: "#090d16", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/[0.06]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Simulated values are audited against Ecoinvent v3.10 boundary coefficients and are ready for corporate Scope 3 reduction filings.
          </span>
        </div>
      </div>
    </div>
  );
}
