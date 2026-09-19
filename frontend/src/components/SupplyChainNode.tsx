"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Flame, MapPin, Layers } from "lucide-react";

export interface SupplyChainNodeData {
  tierLabel: string;
  name: string;
  location: string;
  stage: string;
  impactShare: number;
  subcomponents: string[];
  isHotspot: boolean;
  onSelectNode?: (data: SupplyChainNodeData) => void;
}

export const SupplyChainNode = memo(({ data, selected }: { data: SupplyChainNodeData; selected?: boolean }) => {
  return (
    <div 
      onClick={() => data.onSelectNode && data.onSelectNode(data)}
      className={`w-[260px] p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative ${
        data.isHotspot
          ? "bg-[#1f1108]/90 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
          : selected
          ? "bg-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          : "bg-slate-900/80 border-white/[0.12] hover:border-emerald-500/50 hover:bg-slate-900"
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-slate-950" 
      />

      {data.isHotspot && (
        <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
          <Flame className="w-3 h-3" />
          Primary Hotspot
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
        <span>{data.tierLabel}</span>
        <span className={`font-bold ${data.isHotspot ? "text-amber-400" : "text-emerald-400"}`}>
          {data.impactShare}% Impact
        </span>
      </div>

      <div className="text-sm font-bold text-white mt-1.5 leading-snug">
        {data.name}
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.08] space-y-1.5 text-xs">
        <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{data.location}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{data.stage}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {data.subcomponents.map((sub) => (
          <span 
            key={sub} 
            className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300 font-mono"
          >
            {sub}
          </span>
        ))}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-slate-950" 
      />
    </div>
  );
});

SupplyChainNode.displayName = "SupplyChainNode";
