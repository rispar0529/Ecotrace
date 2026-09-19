"use client";

import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from "recharts";
import { Droplets, CloudFog, Trash2, Layers } from "lucide-react";

interface LifecycleChartProps {
  carbonTotal: number;
  waterTotal: number;
  wasteTotal: number;
  tiers: {
    tier: string;
    name: string;
    impactShare: number;
  }[];
}

export function LifecycleBreakdownChart({
  carbonTotal,
  waterTotal,
  wasteTotal,
  tiers,
}: LifecycleChartProps) {
  const [metric, setMetric] = useState<"carbon" | "water" | "waste">("carbon");

  const totalValue = metric === "carbon" ? carbonTotal : metric === "water" ? waterTotal : wasteTotal;
  const unit = metric === "carbon" ? "kg CO₂e" : metric === "water" ? "L" : "kg";

  // Build data points proportional to the tiers' impact share
  const chartData = tiers.map((t) => {
    const stageName = t.tier.split(":")[0].replace("Tier ", "T");
    const val = Math.round((totalValue * (t.impactShare / 100)) * 10) / 10;
    return {
      stage: stageName,
      fullName: t.name,
      value: val,
      percentage: t.impactShare,
    };
  });

  const getMetricColor = (idx: number) => {
    if (metric === "carbon") {
      const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
      return colors[idx % colors.length];
    } else if (metric === "water") {
      const colors = ["#0284c7", "#38bdf8", "#7dd3fc", "#bae6fd"];
      return colors[idx % colors.length];
    } else {
      const colors = ["#d97706", "#f59e0b", "#fbbf24", "#fde68a"];
      return colors[idx % colors.length];
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector Pills */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Stage Contribution Breakdown
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.08] text-[11px]">
          <button
            onClick={() => setMetric("carbon")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
              metric === "carbon"
                ? "bg-emerald-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CloudFog className="w-3 h-3" />
            Carbon
          </button>
          <button
            onClick={() => setMetric("water")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
              metric === "water"
                ? "bg-sky-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Droplets className="w-3 h-3" />
            Water
          </button>
          <button
            onClick={() => setMetric("waste")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
              metric === "waste"
                ? "bg-amber-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trash2 className="w-3 h-3" />
            Waste
          </button>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="stage" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 185, 129, 0.08)", radius: 6 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/[0.1] shadow-xl text-xs space-y-1">
                      <div className="font-bold text-white">{data.fullName}</div>
                      <div className="text-emerald-400 font-mono">
                        {data.value.toLocaleString()} {unit} ({data.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getMetricColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Legend */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
        {chartData.map((item, idx) => (
          <div key={item.stage} className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
            <span className="truncate max-w-[140px] text-slate-300">{item.stage}: {item.fullName}</span>
            <span className="font-mono text-emerald-400 font-semibold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
