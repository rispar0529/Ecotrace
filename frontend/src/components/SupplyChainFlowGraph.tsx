"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SupplyChainNode, SupplyChainNodeData } from "./SupplyChainNode";
import { Network, X, Layers, MapPin, Flame, ArrowUpRight, Info } from "lucide-react";

interface SupplyChainGraphProps {
  productName: string;
  category: string;
  tiers: {
    tier: string;
    name: string;
    location: string;
    stage: string;
    impactShare: number;
    subcomponents: string[];
  }[];
}

const nodeTypes = {
  supplyChainNode: SupplyChainNode,
};

export function SupplyChainFlowGraph({
  productName,
  category,
  tiers,
}: SupplyChainGraphProps) {
  const [selectedNodeData, setSelectedNodeData] = useState<SupplyChainNodeData | null>(null);

  const handleNodeClick = useCallback((nodeData: SupplyChainNodeData) => {
    setSelectedNodeData(nodeData);
  }, []);

  // Compute initial nodes and edges based on product tiers
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const maxShare = Math.max(...tiers.map((t) => t.impactShare));

    // Layout nodes horizontally from left to right (Tier 4 -> Tier 3 -> Tier 2 -> Tier 1)
    tiers.forEach((t, index) => {
      const isHotspot = t.impactShare === maxShare;
      const nodeId = `node-${index}`;

      nodes.push({
        id: nodeId,
        type: "supplyChainNode",
        position: { x: index * 320 + 40, y: isHotspot ? 90 : 120 },
        data: {
          tierLabel: t.tier.split(":")[0],
          name: t.name,
          location: t.location,
          stage: t.stage,
          impactShare: t.impactShare,
          subcomponents: t.subcomponents,
          isHotspot,
          onSelectNode: handleNodeClick,
        },
      });

      if (index < tiers.length - 1) {
        const nextId = `node-${index + 1}`;
        edges.push({
          id: `edge-${index}-${index + 1}`,
          source: nodeId,
          target: nextId,
          animated: true,
          style: { stroke: isHotspot ? "#f59e0b" : "#10b981", strokeWidth: 2.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isHotspot ? "#f59e0b" : "#10b981",
            width: 15,
            height: 15,
          },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [tiers, handleNodeClick]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-[#030307] border border-white/[0.08] overflow-hidden flex flex-col">
      {/* Header bar within canvas */}
      <div className="p-3.5 px-5 border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <Network className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white font-mono">
            {productName} Multi-Tier Flow Architecture
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
            {tiers.length} Active Nodes
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Click any node to inspect upstream forensics</span>
        </div>
      </div>

      {/* React Flow Core Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#1e293b" gap={24} size={1.2} />
          <Controls className="!bg-slate-900 !border-white/[0.1] !rounded-xl !text-slate-300" />
          <MiniMap 
            nodeColor={(node) => (node.data.isHotspot ? "#f59e0b" : "#10b981")}
            maskColor="rgba(3, 3, 7, 0.85)"
            className="!bg-slate-950 !border-white/[0.1] !rounded-xl" 
          />
        </ReactFlow>

        {/* Selected Node Inspector Drawer / Overlay */}
        {selectedNodeData && (
          <div className="absolute left-2 right-2 sm:left-auto sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 sm:w-80 p-4 sm:p-5 rounded-xl bg-slate-950/95 border border-white/[0.15] backdrop-blur-xl shadow-2xl z-20 flex flex-col justify-between animate-fadeIn overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    {selectedNodeData.tierLabel}
                  </span>
                  {selectedNodeData.isHotspot && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      Hotspot
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNodeData(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedNodeData.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedNodeData.location}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Lifecycle Stage:</span>
                  <span className="text-slate-200 font-semibold">{selectedNodeData.stage}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Environmental Burden:</span>
                  <span className={`font-mono font-bold ${selectedNodeData.isHotspot ? "text-amber-400" : "text-emerald-400"}`}>
                    {selectedNodeData.impactShare}% of lifecycle
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Associated Processes & Subcomponents
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedNodeData.subcomponents.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 font-mono"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] text-[11px] text-slate-400">
              <span className="text-emerald-400 font-medium">LCA Pedigree: </span>
              Direct activity data combined with regional power-grid emission coefficients.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
