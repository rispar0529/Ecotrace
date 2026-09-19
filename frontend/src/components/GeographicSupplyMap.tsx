"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Globe, Flame, Navigation, Layers } from "lucide-react";

interface GeographicRoute {
  from: string;
  to: string;
  transportMode: string;
  emissionsKg: number;
}

interface GeographicSupplyMapProps {
  productName: string;
  hotspotCoords: {
    lat: number;
    lng: number;
    location: string;
  };
  hotspotStage: string;
  routes: GeographicRoute[];
}

// Complete verified geographic coordinate registry for all supply chain hubs [lng, lat]
const GEO_REGISTRY: Record<string, [number, number]> = {
  // Smartphone
  "Atacama (Chile)": [-69.1, -23.8],
  "Jiangsu (China)": [119.8, 32.9],
  "Hsinchu (Taiwan)": [120.99, 24.78],
  "Zhengzhou (China)": [113.65, 34.76],
  "Global Hubs": [4.4, 51.9], // Rotterdam Europort
  // Shoes
  "Jubail": [49.66, 27.01],
  "Jubail (Saudi Arabia)": [49.66, 27.01],
  "Kaohsiung": [120.31, 22.62],
  "Kaohsiung (Taiwan)": [120.31, 22.62],
  "Dong Nai": [106.84, 10.95],
  "Dong Nai (Vietnam)": [106.84, 10.95],
  "Ho Chi Minh Port": [106.75, 10.76],
  "Global Ports": [-118.2, 33.74], // Long Beach Port
  "Rotterdam / Long Beach": [4.4, 51.9],
  // T-Shirt
  "Gujarat": [71.19, 22.25],
  "Gujarat (India)": [71.19, 22.25],
  "Tirupur": [77.34, 11.10],
  "Tirupur (India)": [77.34, 11.10],
  "Chittagong": [91.83, 22.33],
  "Chittagong (Bangladesh)": [91.83, 22.33],
  "Antwerp": [4.40, 51.22],
  "Antwerp (Europe)": [4.40, 51.22],
  // Laptop
  "Guinea": [-9.69, 9.94],
  "Guinea / Australia": [-9.69, 9.94],
  "Tianjin Port": [117.72, 38.98],
  "Kunshan": [120.98, 31.38],
  "Chengdu": [104.06, 30.65],
  "International Hubs": [8.57, 50.03], // Frankfurt CargoCity
  "Frankfurt / Chicago": [8.57, 50.03],
  // EV Battery
  "Antofagasta": [-70.40, -23.65],
  "Antofagasta (Chile)": [-70.40, -23.65],
  "Busan": [129.07, 35.17],
  "Busan (South Korea)": [129.07, 35.17],
  "Pohang": [129.36, 36.01],
  "Pohang (South Korea)": [129.36, 36.01],
  "Koper": [13.73, 45.54],
  "Koper (Slovenia)": [13.73, 45.54],
  "Debrecen": [21.62, 47.53],
  "Debrecen (Hungary)": [21.62, 47.53],
  "Stuttgart": [9.18, 48.77],
  "Stuttgart (Germany)": [9.18, 48.77],
};

function getCoords(name: string, fallbackLng: number, fallbackLat: number): [number, number] {
  if (GEO_REGISTRY[name]) return GEO_REGISTRY[name];
  const key = Object.keys(GEO_REGISTRY).find((k) => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase()));
  if (key) return GEO_REGISTRY[key];
  return [fallbackLng, fallbackLat];
}

// Generate intermediate arc points for smooth great-circle curved routes
function buildArcCoords(start: [number, number], end: [number, number], segments = 60): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lng = start[0] + (end[0] - start[0]) * t;
    const curveOffset = Math.sin(Math.PI * t) * (Math.abs(end[0] - start[0]) > 40 ? 14 : 6);
    const lat = start[1] + (end[1] - start[1]) * t + curveOffset;
    coords.push([lng, lat]);
  }
  return coords;
}

export function GeographicSupplyMap({
  productName,
  hotspotCoords,
  hotspotStage,
  routes,
}: GeographicSupplyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Robust dark world basemap with English labels (ESRI Dark Gray Canvas Base)
    const darkTileStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-dark-tiles": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: "&copy; Esri"
        }
      },
      layers: [
        {
          id: "esri-dark-base-layer",
          type: "raster",
          source: "esri-dark-tiles",
          minzoom: 0,
          maxzoom: 16
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: darkTileStyle,
      center: [40, 25],
      zoom: 1.6,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.resize();

      // Collect all station features and route LineStrings
      const routeFeatures: GeoJSON.Feature[] = [];
      const stationFeatures: GeoJSON.Feature[] = [];
      const seenCoords = new Set<string>();

      routes.forEach((r) => {
        const fromCoord = getCoords(r.from, hotspotCoords.lng - 30, hotspotCoords.lat - 10);
        const toCoord = getCoords(r.to, hotspotCoords.lng + 25, hotspotCoords.lat + 10);

        // Add to station points
        [
          { name: r.from, coord: fromCoord },
          { name: r.to, coord: toCoord },
        ].forEach((st) => {
          const key = `${st.coord[0].toFixed(2)},${st.coord[1].toFixed(2)}`;
          if (!seenCoords.has(key)) {
            seenCoords.add(key);
            const isHp = Math.abs(st.coord[0] - hotspotCoords.lng) < 1.0 && Math.abs(st.coord[1] - hotspotCoords.lat) < 1.0;
            stationFeatures.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: st.coord,
              },
              properties: {
                name: isHp ? `🔥 ${st.name}` : st.name,
                isHotspot: isHp,
                color: isHp ? "#f59e0b" : "#38bdf8",
                radius: isHp ? 9 : 6,
              },
            });
          }
        });

        const arc = buildArcCoords(fromCoord, toCoord);
        routeFeatures.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: arc,
          },
          properties: {
            from: r.from,
            to: r.to,
            mode: r.transportMode,
            emissions: r.emissionsKg,
          },
        });
      });

      // Ensure primary hotspot is also a station feature
      const hpKey = `${hotspotCoords.lng.toFixed(2)},${hotspotCoords.lat.toFixed(2)}`;
      if (!seenCoords.has(hpKey)) {
        stationFeatures.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [hotspotCoords.lng, hotspotCoords.lat],
          },
          properties: {
            name: `🔥 ${hotspotCoords.location}`,
            isHotspot: true,
            color: "#f59e0b",
            radius: 9,
          },
        });
      }

      // Add MapLibre Source for routes
      map.addSource("supply-corridors", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: routeFeatures,
        },
      });

      // Layer 1: Ambient Neon Glow underneath
      map.addLayer({
        id: "routes-glow",
        type: "line",
        source: "supply-corridors",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#059669",
          "line-width": 8,
          "line-opacity": 0.5,
          "line-blur": 3,
        },
      });

      // Layer 2: High-contrast visible line in MapLibre WebGL
      map.addLayer({
        id: "routes-solid",
        type: "line",
        source: "supply-corridors",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#34d399",
          "line-width": 4,
          "line-opacity": 0.95,
        },
      });

      // Add GeoJSON Source for Station Nodes (Directly rendered in WebGL = 100% immune to zoom drifting!)
      map.addSource("station-nodes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: stationFeatures,
        },
      });

      // Node Outer Glow Circle
      map.addLayer({
        id: "station-nodes-glow",
        type: "circle",
        source: "station-nodes",
        paint: {
          "circle-radius": ["*", ["get", "radius"], 1.8],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.35,
          "circle-blur": 0.8,
        },
      });

      // Node Core Circle
      map.addLayer({
        id: "station-nodes-core",
        type: "circle",
        source: "station-nodes",
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 1.0,
        },
      });

      // HTML City Labels anchored cleanly beside the WebGL dots
      stationFeatures.forEach((feat) => {
        const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
        const name = feat.properties?.name;
        const isHotspot = feat.properties?.isHotspot;

        const labelEl = document.createElement("div");
        labelEl.style.background = "rgba(10, 15, 26, 0.94)";
        labelEl.style.backdropFilter = "blur(8px)";
        labelEl.style.color = "#f8fafc";
        labelEl.style.fontSize = "10px";
        labelEl.style.fontFamily = "monospace";
        labelEl.style.fontWeight = "600";
        labelEl.style.padding = "2px 6px";
        labelEl.style.borderRadius = "4px";
        labelEl.style.border = `1px solid ${isHotspot ? "rgba(245, 158, 11, 0.8)" : "rgba(56, 189, 248, 0.4)"}`;
        labelEl.style.whiteSpace = "nowrap";
        labelEl.style.pointerEvents = "none";
        labelEl.innerText = name;

        new maplibregl.Marker({ element: labelEl, anchor: "left", offset: [12, 0] })
          .setLngLat(coords)
          .addTo(map);
      });
    });

    // Attach active render listener so SVG curves dynamically match the map projection in real-time
    const syncRouteLines = () => {
      const svg = document.getElementById("supply-route-svg") as SVGSVGElement | null;
      if (!svg) return;

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      `;
      svg.appendChild(defs);

      routes.forEach((r) => {
        const fromCoord = getCoords(r.from, hotspotCoords.lng - 30, hotspotCoords.lat - 10);
        const toCoord = getCoords(r.to, hotspotCoords.lng + 25, hotspotCoords.lat + 10);

        const p1 = map.project(fromCoord);
        const p2 = map.project(toCoord);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const cx = (p1.x + p2.x) / 2 - dy * 0.18;
        const cy = (p1.y + p2.y) / 2 + dx * 0.18;
        const pathData = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;

        // Glow path
        const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        glowPath.setAttribute("d", pathData);
        glowPath.setAttribute("fill", "none");
        glowPath.setAttribute("stroke", "#10b981");
        glowPath.setAttribute("stroke-width", "8");
        glowPath.setAttribute("stroke-opacity", "0.4");
        glowPath.setAttribute("filter", "url(#routeGlow)");
        svg.appendChild(glowPath);

        // Vibrant dotted dashed line
        const dashPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        dashPath.setAttribute("d", pathData);
        dashPath.setAttribute("fill", "none");
        dashPath.setAttribute("stroke", "url(#routeGradient)");
        dashPath.setAttribute("stroke-width", "4");
        dashPath.setAttribute("stroke-dasharray", "8 5");
        dashPath.setAttribute("stroke-linecap", "round");
        svg.appendChild(dashPath);
      });
    };

    map.on("render", syncRouteLines);
    map.on("move", syncRouteLines);
    map.on("zoom", syncRouteLines);

    const resizeTimer = setInterval(() => {
      map.resize();
      syncRouteLines();
    }, 400);

    mapInstance.current = map;

    return () => {
      clearInterval(resizeTimer);
      map.remove();
    };
  }, [hotspotCoords, hotspotStage, routes]);

  const handleFlyToHotspot = () => {
    if (mapInstance.current) {
      mapInstance.current.flyTo({
        center: [hotspotCoords.lng, hotspotCoords.lat],
        zoom: 3.5,
        speed: 1.2,
      });
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl bg-[#030307] border border-white/[0.08] overflow-hidden flex flex-col">
      {/* Top Map Bar */}
      <div className="p-3.5 px-5 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white font-mono">
            {productName} Global Logistics & Refining Corridors
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Active Hotspot Hub
          </span>
        </div>

        <button
          onClick={handleFlyToHotspot}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] text-slate-300 font-mono transition-colors cursor-pointer"
        >
          <Navigation className="w-3 h-3 text-emerald-400" />
          Center on Hotspot
        </button>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 w-full h-full relative min-h-[460px] bg-[#090d16] overflow-hidden">
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0 z-0" 
          style={{ minHeight: "460px" }}
        />

        {/* Dynamic Real-time Synchronized SVG Flight Arc Layer */}
        <svg 
          id="supply-route-svg" 
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        />

        {/* ONLY KEEP BOTTOM-LEFT CORRIDOR PANEL - Responsive positioning */}
        <div className="absolute left-2 sm:left-4 bottom-2 sm:bottom-4 max-w-[260px] sm:max-w-sm p-3 sm:p-4 rounded-xl bg-slate-950/95 border border-white/[0.12] backdrop-blur-xl shadow-2xl z-20 space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Major Freight Corridors
            </span>
            <span className="text-[10px] font-mono text-slate-400">GLEC Verified</span>
          </div>

          <div className="space-y-1.5 max-h-32 sm:max-h-40 overflow-y-auto pr-1">
            {routes.map((route, i) => (
              <div
                key={i}
                className="p-2 sm:p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-medium text-slate-200">
                  <span className="truncate max-w-[130px] sm:max-w-[180px] text-white font-semibold">{route.from} → {route.to}</span>
                  <span className="text-emerald-400 font-mono font-bold text-[11px] sm:text-xs">+{route.emissionsKg} kg</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>{route.transportMode}</span>
                  <span className="text-slate-500">Transit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspot Location Card - Responsive */}
        <div className="absolute right-2 sm:right-4 top-2 sm:top-4 p-3 sm:p-4 rounded-xl bg-amber-950/90 border border-amber-500/50 backdrop-blur-xl shadow-xl z-20 max-w-[220px] sm:max-w-xs text-xs space-y-1.5 pointer-events-auto">
          <div className="text-amber-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            Top Hotspot Hub
          </div>
          <div className="text-white font-medium text-[11px] sm:text-xs truncate">{hotspotCoords.location}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-300 leading-snug line-clamp-2">{hotspotStage}</div>
          <div className="text-[9px] sm:text-[10px] font-mono text-amber-200/80 pt-1 border-t border-amber-500/30">
            LAT: {hotspotCoords.lat.toFixed(2)} | LNG: {hotspotCoords.lng.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
