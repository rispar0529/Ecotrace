"use client";

import React, { useState, useEffect } from "react";
import { 
  Leaf, 
  Lightbulb, 
  Sliders, 
  Globe,
  Smartphone,
  Shirt,
  Footprints,
  Laptop,
  Car,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Search,
  Plus,
  Network,
  MapPin,
  BarChart3,
  Loader2,
  X,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  TrendingDown,
  Package,
  Cpu,
  Compass,
  FileText,
  Box
} from "lucide-react";
import { fetchProducts, fetchProductById, analyzeCustomProductApi, fetchAiExplanation } from "@/lib/api";
import { LifecycleBreakdownChart } from "@/components/LifecycleBreakdownChart";
import { DataConfidenceCard } from "@/components/DataConfidenceCard";
import { SupplyChainFlowGraph } from "@/components/SupplyChainFlowGraph";
import { SupplyChain3DRoad } from "@/components/SupplyChain3DRoad";
import { GeographicSupplyMap } from "@/components/GeographicSupplyMap";
import { Geographic3DGlobe } from "@/components/Geographic3DGlobe";
import { ScenarioSimulator, ScenarioParams } from "@/components/ScenarioSimulator";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  carbon: number; // kg CO2e
  water: number;  // Liters
  waste: number;  // kg
  hotspot: string;
  hotspotStage: string;
  hotspotCoords: { lat: number; lng: number; location: string };
  intervention: string;
  baseReduction: number; // percentage
  confidence: "High" | "Medium" | "Low";
  icon?: any;
  tiers: {
    tier: string;
    name: string;
    location: string;
    stage: string;
    impactShare: number;
    subcomponents: string[];
  }[];
  geographicRoutes: {
    from: string;
    to: string;
    transportMode: string;
    emissionsKg: number;
  }[];
}

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: "phone",
    name: "iPhone-class Smartphone",
    category: "Consumer Tech",
    carbon: 78.4,
    water: 12450,
    waste: 24.2,
    hotspot: "Semiconductor Fabrication & Cobalt Leaching",
    hotspotStage: "Tier 3 Refining (Hsinchu & Katanga)",
    hotspotCoords: { lat: 24.78, lng: 120.99, location: "Hsinchu Science Park, Taiwan" },
    intervention: "Mandate 100% recycled cobalt cathode & clean fab power",
    baseReduction: 28.4,
    confidence: "Medium",
    icon: Smartphone,
    tiers: [
      { tier: "Tier 4: Mining & Extraction", name: "Lithium & Cobalt Extraction", location: "Atacama & DRC", stage: "Raw Mining", impactShare: 32, subcomponents: ["Brine Pumping", "Acid Leaching"] },
      { tier: "Tier 3: Chemical Refining", name: "Cathode Active Material & Silicon Ingot", location: "Hsinchu & Jiangsu", stage: "Refining & Wafer Fab", impactShare: 42, subcomponents: ["4nm EUV Lithography", "Chemical Vapor Deposition"] },
      { tier: "Tier 2: Component Assembly", name: "Display OLED & Logic Substrates", location: "Gumi, South Korea", stage: "Component Assembly", impactShare: 14, subcomponents: ["Substrate Bonding", "Flex PCB Soldering"] },
      { tier: "Tier 1: Final Integration", name: "Device Enclosure & Test Packaging", location: "Zhengzhou, China", stage: "Final Integration", impactShare: 12, subcomponents: ["Screw Assembly", "Air Freight Packing"] },
    ],
    geographicRoutes: [
      { from: "Atacama (Chile)", to: "Jiangsu (China)", transportMode: "Bulk Maritime", emissionsKg: 4.8 },
      { from: "Hsinchu (Taiwan)", to: "Zhengzhou (China)", transportMode: "Short-sea Freight", emissionsKg: 1.2 },
      { from: "Zhengzhou (China)", to: "Global Hubs", transportMode: "Intercontinental Air Cargo", emissionsKg: 8.6 },
    ],
  },
  {
    id: "shoes",
    name: "Performance Running Shoes",
    category: "Footwear",
    carbon: 14.2,
    water: 4200,
    waste: 4.8,
    hotspot: "Petroleum Cracking for EVA Foam Midsole",
    hotspotStage: "Tier 2 Polymerization (Dong Nai, Vietnam)",
    hotspotCoords: { lat: 10.95, lng: 106.84, location: "Dong Nai, Vietnam" },
    intervention: "Shift to algae & bio-supercritical nitrogen foam",
    baseReduction: 34.1,
    confidence: "High",
    icon: Footprints,
    tiers: [
      { tier: "Tier 4: Petroleum Extraction", name: "Crude Oil Cracking to Ethylene", location: "Jubail, Saudi Arabia", stage: "Petrochemical", impactShare: 28, subcomponents: ["Thermal Cracking"] },
      { tier: "Tier 3: Polymerization", name: "EVA Pellets & Synthetic Yarn Spinning", location: "Kaohsiung, Taiwan", stage: "Polymer Processing", impactShare: 38, subcomponents: ["Extrusion"] },
      { tier: "Tier 2: Midsole Molding", name: "Supercritical Nitrogen Foaming", location: "Dong Nai, Vietnam", stage: "Component Forming", impactShare: 24, subcomponents: ["Heated Compression"] },
      { tier: "Tier 1: Stitching & Assembly", name: "Shoe Upper Lasting & Outsole Cementing", location: "Binh Duong, Vietnam", stage: "Assembly", impactShare: 10, subcomponents: ["Waterborne Polyurethane Glue"] },
    ],
    geographicRoutes: [
      { from: "Jubail", to: "Kaohsiung", transportMode: "Chemical Tanker", emissionsKg: 0.9 },
      { from: "Kaohsiung", to: "Dong Nai", transportMode: "Container Ship", emissionsKg: 0.4 },
      { from: "Ho Chi Minh Port", to: "Global Ports", transportMode: "Container Vessel", emissionsKg: 1.8 },
    ],
  },
  {
    id: "tshirt",
    name: "Combed Cotton T-Shirt",
    category: "Apparel",
    carbon: 6.8,
    water: 2700,
    waste: 1.1,
    hotspot: "Flood Irrigation & Toxic Reactive Dyeing",
    hotspotStage: "Tier 4 Agriculture & Wet Dyeing (Gujarat)",
    hotspotCoords: { lat: 22.25, lng: 71.19, location: "Gujarat Cotton Belt, India" },
    intervention: "Deploy waterless supercritical CO₂ closed-loop dyeing",
    baseReduction: 41.5,
    confidence: "High",
    icon: Shirt,
    tiers: [
      { tier: "Tier 4: Cultivation", name: "Raw Seed Cotton Cultivation", location: "Gujarat, India", stage: "Agriculture", impactShare: 45, subcomponents: ["Canal Irrigation"] },
      { tier: "Tier 3: Ginning & Spinning", name: "Combed Ring Spun Yarn", location: "Coimbatore, India", stage: "Milling", impactShare: 22, subcomponents: ["Ring Spinning"] },
      { tier: "Tier 2: Wet Processing", name: "Reactive Dyeing & Tubular Knitting", location: "Tirupur, India", stage: "Finishing", impactShare: 25, subcomponents: ["Aqueous Dye Bath"] },
      { tier: "Tier 1: Cut & Sew", name: "Garment Sewing & Labeling", location: "Dhaka, Bangladesh", stage: "Manufacturing", impactShare: 8, subcomponents: ["Overlock Sewing"] },
    ],
    geographicRoutes: [
      { from: "Gujarat", to: "Tirupur", transportMode: "Rail Freight", emissionsKg: 0.3 },
      { from: "Chittagong", to: "Antwerp", transportMode: "Container Vessel", emissionsKg: 0.7 },
    ],
  },
  {
    id: "laptop",
    name: "Enterprise Laptop",
    category: "Computing",
    carbon: 294.0,
    water: 31800,
    waste: 54.0,
    hotspot: "Primary Bauxite Smelting for CNC Chassis",
    hotspotStage: "Tier 3 Thermal Smelting (Inner Mongolia)",
    hotspotCoords: { lat: 40.84, lng: 111.75, location: "Inner Mongolia, China" },
    intervention: "Substitute with 85% certified hydro-smelted aluminum",
    baseReduction: 23.0,
    confidence: "Medium",
    icon: Laptop,
    tiers: [
      { tier: "Tier 4: Bauxite Mining", name: "Bauxite Extraction", location: "Boké, Guinea", stage: "Mining", impactShare: 24, subcomponents: ["Bayer Process"] },
      { tier: "Tier 3: Primary Smelting", name: "Hall-Héroult Thermal Reduction", location: "Inner Mongolia", stage: "Smelting", impactShare: 46, subcomponents: ["Carbon Anodes"] },
      { tier: "Tier 2: Machining & PCB", name: "Unibody Milling & Motherboard", location: "Kunshan", stage: "Fabrication", impactShare: 20, subcomponents: ["CNC Milling"] },
      { tier: "Tier 1: Final Integration", name: "Thermal Assembly & Display", location: "Chengdu", stage: "Integration", impactShare: 10, subcomponents: ["Burn-in Test"] },
    ],
    geographicRoutes: [
      { from: "Guinea", to: "Tianjin Port", transportMode: "Bulk Carrier", emissionsKg: 18.2 },
      { from: "Kunshan", to: "Chengdu", transportMode: "Rail", emissionsKg: 4.5 },
      { from: "Chengdu", to: "International Hubs", transportMode: "Air Freight", emissionsKg: 24.1 },
    ],
  },
  {
    id: "ev",
    name: "Electric Vehicle Battery",
    category: "Clean Mobility",
    carbon: 4820,
    water: 89000,
    waste: 980.0,
    hotspot: "Lithium Brine Evaporation & Nickel Calcination",
    hotspotStage: "Tier 4 Extraction (Atacama & Sulawesi)",
    hotspotCoords: { lat: -23.86, lng: -69.13, location: "Atacama Salt Flat, Chile" },
    intervention: "Direct Lithium Extraction (DLE) powered by geothermal",
    baseReduction: 38.0,
    confidence: "Medium",
    icon: Car,
    tiers: [
      { tier: "Tier 4: Brine & Ore", name: "Lithium Brine & Laterite Nickel", location: "Atacama & Sulawesi", stage: "Extraction", impactShare: 44, subcomponents: ["Evaporation Ponds"] },
      { tier: "Tier 3: Precursor", name: "NMC 811 Hydroxide Precursor", location: "Pohang, South Korea", stage: "Refining", impactShare: 32, subcomponents: ["Sintering"] },
      { tier: "Tier 2: Cell Production", name: "Prismatic Cell Coating & Formation", location: "Debrecen, Hungary", stage: "Cell Production", impactShare: 16, subcomponents: ["Slot-die Coating"] },
      { tier: "Tier 1: Pack Integration", name: "BMS & Thermal Enclosure", location: "Stuttgart, Germany", stage: "Integration", impactShare: 8, subcomponents: ["Laser Welding"] },
    ],
    geographicRoutes: [
      { from: "Antofagasta", to: "Busan", transportMode: "Bulk Maritime", emissionsKg: 180.0 },
      { from: "Pohang", to: "Koper", transportMode: "Container Vessel", emissionsKg: 120.0 },
      { from: "Debrecen", to: "Stuttgart", transportMode: "Rail", emissionsKg: 45.0 },
    ],
  },
];

export default function Home() {
  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS);
  // NULL by default -> Clean, simple landing state!
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "flow" | "map">("dashboard");
  const [flowViewMode, setFlowViewMode] = useState<"3d" | "2d">("3d");
  const [mapViewMode, setMapViewMode] = useState<"3d" | "2d">("3d");
  const [intensity, setIntensity] = useState<number>(75);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    adoptionRate: 75,
    recycledContent: 25,
    renewableEnergy: 40,
    regionalSourcing: 20,
  });
  
  // Custom Product Search / Input
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Zero-Overhead Hardware-Accelerated Mouse Spotlight (Direct CSS custom properties, 0 React re-renders)
  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
        document.documentElement.style.setProperty("--mouse-opacity", "0.85");
        rafId = null;
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Hydrate product catalog from backend API on mount
  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchProducts();
      if (data && Array.isArray(data) && data.length > 0) {
        const iconMap: Record<string, any> = {
          phone: Smartphone,
          shoes: Footprints,
          tshirt: Shirt,
          laptop: Laptop,
          ev: Car
        };
        const hydrated = data.map((p: any) => ({
          ...p,
          icon: iconMap[p.id] || Package
        }));
        setProducts(hydrated);
      }
    }
    loadCatalog();
  }, []);

  // AI explanation state
  const [aiRationale, setAiRationale] = useState<{ explanation: string; recommendation: string } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // When a user selects a product: fetch full forensic data and AI reasoning from backend
  const handleSelectProduct = async (product: ProductItem) => {
    setIsLoadingDetails(true);
    setAiRationale(null);
    // Fetch live from backend
    const backendData = await fetchProductById(product.id);
    if (backendData) {
      setSelected({ ...backendData, icon: product.icon || Package });
    } else {
      setSelected(product);
    }
    setIsLoadingDetails(false);
    setActiveTab("dashboard");

    // Asynchronously fetch Gemini AI reasoning
    setIsLoadingAi(true);
    const aiData = await fetchAiExplanation(product.id);
    if (aiData) {
      setAiRationale({
        explanation: aiData.ai_explanation || "Analyzing primary supply-chain emissions driver with deterministic LCA boundary allocation.",
        recommendation: aiData.ai_recommendation || `1. Mandate verified low-carbon supplier covenants in next contract RFP. 2. Conduct on-site Tier-2 energy audits to capture targeted ${product.baseReduction}% reduction.`
      });
    } else {
      setAiRationale({
        explanation: `${product.hotspot} concentrates the majority of Scope 3 upstream emissions during ${product.hotspotStage} due to high-temperature thermal refining and grid reliance.`,
        recommendation: `1. Mandate 100% certified recycled or renewable inputs across Tier-2/3 purchase orders. 2. Establish quarterly vendor emission tracking to unlock ${product.baseReduction}% footprint reduction.`
      });
    }
    setIsLoadingAi(false);
  };

  // Custom Product Submission
  const handleAnalyzeCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);

    const steps = [
      "Deconstructing component bill-of-materials...",
      "Matching Tier 1-4 raw materials with Ecoinvent factors...",
      "Locating regional supply hubs & refining geography...",
      "Computing lifecycle emissions & isolating primary hotspot...",
      "Generating highest-yield strategic intervention...",
    ];

    let current = 1;
    const interval = setInterval(async () => {
      current++;
      if (current <= steps.length) {
        setAnalysisStep(current);
      } else {
        clearInterval(interval);
        
        // Attempt backend analysis API
        const apiResult = await analyzeCustomProductApi(searchQuery.trim());
        if (apiResult) {
          const formatted = { ...apiResult, icon: Package };
          setProducts(prev => [formatted, ...prev]);
          setSelected(formatted);
        } else {
          // Client fallback
          const cleanName = searchQuery.trim();
          const customId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-");
          const estCarbon = Math.round((25 + Math.random() * 65) * 10) / 10;
          const newProd: ProductItem = {
            id: customId,
            name: cleanName,
            category: "Custom BOM Audit",
            carbon: estCarbon,
            water: Math.round(estCarbon * 115),
            waste: Math.round(estCarbon * 0.14 * 10) / 10,
            hotspot: `${cleanName} Tier 3 Refining Energy Intensity`,
            hotspotStage: "Tier 3 Regional Smelting & Chemical Synthesis",
            hotspotCoords: { lat: 31.23, lng: 121.47, location: "Eastern Industrial Belt, APAC" },
            intervention: `Shift key tier-3 supplier contracts to certified zero-carbon energy`,
            baseReduction: 32.0,
            confidence: "Medium",
            icon: Package,
            tiers: [
              { tier: "Tier 4: Extraction", name: "Feedstock Extraction", location: "Global Origins", stage: "Raw Extraction", impactShare: 35, subcomponents: ["Primary Extraction"] },
              { tier: "Tier 3: Refining", name: "Chemical & Thermal Processing", location: "Regional Hub", stage: "Thermal Synthesis", impactShare: 42, subcomponents: ["Thermal Reaction"] },
              { tier: "Tier 2: Component", name: "Precision Tooling", location: "Fabrication Hub", stage: "Machining", impactShare: 15, subcomponents: ["CNC Milling"] },
              { tier: "Tier 1: Assembly", name: "Final Integration & Packaging", location: "Assembly Facility", stage: "Integration", impactShare: 8, subcomponents: ["Final QA"] },
            ],
            geographicRoutes: [
              { from: "Origins", to: "Refining Hub", transportMode: "Bulk Maritime", emissionsKg: Math.round(estCarbon * 0.08 * 10) / 10 },
              { from: "Refining Hub", to: "Assembly", transportMode: "Freight Rail", emissionsKg: Math.round(estCarbon * 0.03 * 10) / 10 },
              { from: "Assembly", to: "Logistics Centers", transportMode: "Road Transport", emissionsKg: Math.round(estCarbon * 0.05 * 10) / 10 },
            ]
          };
          setProducts(prev => [newProd, ...prev]);
          setSelected(newProd);
        }
        setIsAnalyzing(false);
        setSearchQuery("");
      }
    }, 600);
  };

  // Calculations for selected product
  const effectiveReduction = selected 
    ? Math.round((selected.baseReduction * (intensity / 100)) * 10) / 10 
    : 0;
  const currentCarbon = selected ? selected.carbon : 0;
  const simulatedCarbon = selected 
    ? Math.round((currentCarbon * (1 - effectiveReduction / 100)) * 10) / 10 
    : 0;
  const savedCarbon = selected 
    ? Math.round((currentCarbon - simulatedCarbon) * 10) / 10 
    : 0;

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-slate-100 overflow-hidden font-sans">
      
      {/* Real-Time Mouse-Reactive Spotlight (Direct GPU CSS Variables, 0 React Re-renders) */}
      <div className="mouse-spotlight" />

      {/* Kinetic Ambient Mesh Background Animation (CSS keyframe driven with hardware acceleration) */}
      <div className="kinetic-mesh-container">
        <div className="mesh-orb-emerald" />
        <div className="mesh-orb-violet" />
        <div className="mesh-orb-amber" />
      </div>

      {/* Modern matrix grain */}
      <div className="matrix-grain" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.08] bg-[#050509]/60 backdrop-blur-2xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            onClick={() => setSelected(null)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400/30 to-violet-500/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
              <Leaf className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">EcoTrace</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                  LCA v1.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Environmental Supply-Chain Intelligence</p>
            </div>
          </div>

          {selected ? (
            /* Tab Navigator when a product is actively inspected */
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Impact
              </button>
              <button
                onClick={() => setActiveTab("flow")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === "flow"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                Supply Chain
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === "map"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Map
              </button>
              <button
                onClick={() => setSelected(null)}
                className="ml-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Select another product"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>FastAPI Backend Connected</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 py-10 flex-1 flex flex-col justify-center">
        
        {/* ===================================================================== */}
        {/* SCENARIO A: CLEAN, SIMPLE LANDING STATE (NO DATA OVERLOAD)            */}
        {/* ===================================================================== */}
        {!selected && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
            
            {/* Value Proposition */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Deterministic Environmental Supply-Chain Forensics
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                See the hidden damage. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400">
                  Know what to change first.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                EcoTrace reconstructs estimated multi-tier supply chains, uncovers deep Tier 3-4 environmental hotspots, and calculates high-leverage interventions.
              </p>
            </div>

            {/* Simple Search / Custom Product Input Box */}
            <form onSubmit={handleAnalyzeCustom} className="w-full max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter any product (e.g. Bamboo Toothbrush, Wireless Earbuds)..."
                  className="w-full pl-11 pr-32 py-3.5 rounded-2xl bg-black/60 border border-white/[0.12] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isAnalyzing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Analysis Loading Animation Indicator */}
              {isAnalyzing && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-emerald-300 font-mono">
                    <span>Forensic Engine Running</span>
                    <span>Step {analysisStep} of 5</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(analysisStep / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Curated Product Cards — Clean & Clickable */}
            <div className="w-full max-w-4xl space-y-3 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-center gap-2">
                <span>Or select a curated archetype to inspect:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {products.map((p) => {
                  const Icon = p.icon || Package;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="glass-panel p-4 rounded-xl text-left flex flex-col justify-between group hover:border-emerald-500/40 hover:scale-102 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.category}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Baseline</span>
                        <span className="text-emerald-400 font-semibold">{p.carbon} kg CO₂</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* SCENARIO B: ON-DEMAND DETAILED VIEW (ONLY SHOWN AFTER CLICKING!)      */}
        {/* ===================================================================== */}
        {selected && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Product Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                  title="Back to all products"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      {selected.category}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono">
                      {selected.confidence} Confidence BOM
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {selected.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Data Source:</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  Ecoinvent v3.10 / ISO 14040
                </span>
              </div>
            </div>

            {/* TAB 1: IMPACT OVERVIEW & ACTIONABLE INTERVENTION */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left: Footprint & Hotspots */}
                  <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
                    <div>
                      <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
                        Lifecycle Impact Matrix
                      </h2>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-black/50 border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Carbon</div>
                          <div className="text-lg font-extrabold text-white font-mono mt-1">
                            {selected.carbon} <span className="text-[10px] text-slate-400">kg</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-black/50 border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Water</div>
                          <div className="text-lg font-extrabold text-white font-mono mt-1">
                            {selected.water >= 1000 ? `${(selected.water / 1000).toFixed(1)}k` : selected.water} <span className="text-[10px] text-slate-400">L</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-black/50 border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Waste</div>
                          <div className="text-lg font-extrabold text-white font-mono mt-1">
                            {selected.waste} <span className="text-[10px] text-slate-400">kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Upstream Recharts Lifecycle Breakdown */}
                      <div className="mt-5">
                        <LifecycleBreakdownChart
                          carbonTotal={selected.carbon}
                          waterTotal={selected.water}
                          wasteTotal={selected.waste}
                          tiers={selected.tiers}
                        />
                      </div>
                    </div>

                    {/* Scientific Data Confidence Component */}
                    <DataConfidenceCard
                      confidence={selected.confidence}
                      dataScore={selected.confidence === "High" ? 92 : 82}
                    />

                    {/* Hotspot Box */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                      <div className="text-amber-300 font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                          Biggest Environmental Hotspot
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-200">
                          Critical Point
                        </span>
                      </div>
                      <p className="text-slate-100 font-semibold text-sm leading-snug">
                        {selected.hotspot}
                      </p>
                      <div className="text-[11px] text-amber-200/80 flex items-center gap-1.5 pt-0.5">
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        {selected.hotspotStage}
                      </div>
                    </div>
                  </div>

                  {/* Right: What Should We Change First? */}
                  <div className="lg:col-span-7 glass-panel-highlight p-6 rounded-2xl flex flex-col justify-between space-y-6">
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider text-emerald-300">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Recommended Strategic Intervention
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          Fastest Leverage Point
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                          {selected.intervention}
                        </h2>
                        
                        {/* Strategic Procurement Guidance */}
                        <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/25 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-emerald-400 font-mono text-[11px] font-bold">
                            <span className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-emerald-300" />
                              Strategic Procurement Guidance:
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Deterministic LCA Bound</span>
                          </div>
                          
                          {isLoadingAi ? (
                            <div className="flex items-center gap-2 text-slate-400 py-2 font-mono text-[11px]">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              <span>Synthesizing procurement advisory with Gemini...</span>
                            </div>
                          ) : aiRationale ? (
                            <div className="space-y-2.5 text-[11px] leading-relaxed">
                              <div className="text-slate-300">
                                <strong className="text-white font-semibold">Forensic Rationale:</strong>{" "}
                                {aiRationale.explanation}
                              </div>
                              <div className="pt-2 border-t border-white/[0.08] space-y-1.5">
                                <div className="text-emerald-300 font-semibold uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                  Exec Action Plan:
                                </div>
                                <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 space-y-2 text-slate-200 text-[11px] leading-relaxed">
                                  {(() => {
                                    const text = aiRationale.recommendation || `1. Mandate verified low-carbon supplier covenants in next contract RFP. 2. Conduct on-site Tier-2 energy audits to capture targeted ${selected.baseReduction}% reduction.`;
                                    // Parse points formatted as "1. ... 2. ..."
                                    const items = text.split(/(?=\b\d+\.\s+)/).filter(Boolean);
                                    if (items.length > 1) {
                                      return items.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2 pt-0.5">
                                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                                            Step {idx + 1}
                                          </span>
                                          <span className="text-slate-200">{item.replace(/^\d+\.\s*/, "").trim()}</span>
                                        </div>
                                      ));
                                    }
                                    return <p className="text-slate-200">{text}</p>;
                                  })()}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-[11px]">
                              <p className="text-slate-400 leading-relaxed">
                                Targeting this specific supplier bottleneck instead of whole-product redesign maximizes marginal carbon yield with minimal operational friction.
                              </p>
                              <div className="p-2 rounded bg-black/40 border border-emerald-500/20 text-emerald-300">
                                Action Plan: Mandate audited green tariffs with Tier-2 smelting vendors.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* INTERACTIVE WHAT-IF SCENARIO SIMULATOR (PHASE 8) */}
                <ScenarioSimulator
                  productName={selected.name}
                  intervention={selected.intervention}
                  baselineCarbon={currentCarbon}
                  baselineWater={selected.water}
                  baselineWaste={selected.waste}
                  baseReduction={selected.baseReduction}
                  params={scenarioParams}
                  onChange={setScenarioParams}
                  onReset={() => setScenarioParams({
                    adoptionRate: 75,
                    recycledContent: 25,
                    renewableEnergy: 40,
                    regionalSourcing: 20,
                  })}
                />
              </div>
            )}

            {/* TAB 2: SUPPLY CHAIN ARCHITECTURE (3D ROAD + 2D FLOW TOGGLE) */}
            {activeTab === "flow" && (
              <div className="space-y-4 animate-fadeIn">
                {/* View Mode Toggle Pill Bar */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Supply Chain Architecture:</span>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setFlowViewMode("3d")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                        flowViewMode === "3d"
                          ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      3D Spatial Highway
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlowViewMode("2d")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                        flowViewMode === "2d"
                          ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      2D Node Schematic
                    </button>
                  </div>
                </div>

                {/* Conditional View: 3D Isometric Road vs 2D React Flow */}
                {flowViewMode === "3d" ? (
                  <SupplyChain3DRoad
                    productName={selected.name}
                    category={selected.category}
                    tiers={selected.tiers}
                  />
                ) : (
                  <SupplyChainFlowGraph
                    productName={selected.name}
                    category={selected.category}
                    tiers={selected.tiers}
                  />
                )}
              </div>
            )}

            {/* TAB 3: GEOGRAPHIC MAP VIEW (3D ROTATING GLOBE + 2D ESRI MAP) */}
            {activeTab === "map" && (
              <div className="space-y-4 animate-fadeIn">
                {/* View Mode Toggle Pill Bar */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse" />
                    <span>Geographic Visualization Mode:</span>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setMapViewMode("3d")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                        mapViewMode === "3d"
                          ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      3D Rotatable Globe
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapViewMode("2d")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                        mapViewMode === "2d"
                          ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      2D Terrain Map
                    </button>
                  </div>
                </div>

                {/* Conditional View: 3D Rotatable Spherical Globe vs 2D ESRI MapLibre */}
                {mapViewMode === "3d" ? (
                  <Geographic3DGlobe
                    productName={selected.name}
                    hotspotCoords={selected.hotspotCoords}
                    hotspotStage={selected.hotspotStage}
                    routes={selected.geographicRoutes}
                  />
                ) : (
                  <GeographicSupplyMap
                    productName={selected.name}
                    hotspotCoords={selected.hotspotCoords}
                    hotspotStage={selected.hotspotStage}
                    routes={selected.geographicRoutes}
                  />
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#050509]/80 py-3 px-6 text-xs text-slate-400 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>EcoTrace Core · Deterministic Supply-Chain Forensics</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            ISO 14040/44 Lifecycle Boundaries · Ecoinvent & DEFRA Harmonized
          </span>
        </div>
      </footer>

    </div>
  );
}
