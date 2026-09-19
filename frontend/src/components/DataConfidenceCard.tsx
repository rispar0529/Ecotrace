"use client";

import React, { useState } from "react";
import { ShieldCheck, Info, CheckCircle2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface DataConfidenceCardProps {
  confidence: "High" | "Medium" | "Low";
  dataScore?: number;
}

export function DataConfidenceCard({
  confidence,
  dataScore = 84,
}: DataConfidenceCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.08] text-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Scientific Data Confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-emerald-400 font-bold">{dataScore}% Score</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
            confidence === "High" 
              ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60" 
              : "bg-amber-950 text-amber-300 border border-amber-800/60"
          }`}>
            {confidence}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Estimated values conform to ISO 14040/44 lifecycle assessment boundaries. Factor sources harmonized with Ecoinvent v3.10 and DEFRA UK GHG 2024.
      </p>

      {/* Expandable Assumptions toggle */}
      <div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          {showDetails ? "Hide assumption parameters" : "View model assumptions & data pedigree"}
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showDetails && (
          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-1.5 text-[10px] font-mono text-slate-400 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified Bill of Materials:
              </span>
              <span className="text-emerald-300 font-semibold">Tier 1 & 2 Direct</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Refining Energy Mix:
              </span>
              <span className="text-slate-300">Regional IEA Grid Factors</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                Upstream Mining Logistics:
              </span>
              <span className="text-amber-300">GLEC Freight Distance Model</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
