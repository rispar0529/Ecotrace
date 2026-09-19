"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Globe, Flame, Navigation, RotateCw, Layers } from "lucide-react";

interface GeographicRoute {
  from: string;
  to: string;
  transportMode: string;
  emissionsKg: number;
}

interface Geographic3DGlobeProps {
  productName: string;
  hotspotCoords: {
    lat: number;
    lng: number;
    location: string;
  };
  hotspotStage: string;
  routes: GeographicRoute[];
}

const GEO_REGISTRY: Record<string, [number, number]> = {
  // Smartphone
  "Atacama (Chile)": [-69.1, -23.8],
  "Jiangsu (China)": [119.8, 32.9],
  "Hsinchu (Taiwan)": [120.99, 24.78],
  "Zhengzhou (China)": [113.65, 34.76],
  "Global Hubs": [4.4, 51.9],
  // Shoes
  "Jubail": [49.66, 27.01],
  "Jubail (Saudi Arabia)": [49.66, 27.01],
  "Kaohsiung": [120.31, 22.62],
  "Kaohsiung (Taiwan)": [120.31, 22.62],
  "Dong Nai": [106.84, 10.95],
  "Dong Nai (Vietnam)": [106.84, 10.95],
  "Ho Chi Minh Port": [106.75, 10.76],
  "Global Ports": [-118.2, 33.74],
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
  "International Hubs": [8.57, 50.03],
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

// Generate great-circle curved flight arc coordinates with antimeridian awareness
function buildArcCoords(start: [number, number], end: [number, number], segments = 50): [number, number][] {
  let [startLng, startLat] = start;
  let [endLng, endLat] = end;

  // Shortest path across prime meridian / antimeridian
  let diffLng = endLng - startLng;
  if (diffLng > 180) diffLng -= 360;
  if (diffLng < -180) diffLng += 360;

  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let lng = startLng + diffLng * t;
    // Normalize lng between -180 and 180
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;

    const curveOffset = Math.sin(Math.PI * t) * (Math.abs(diffLng) > 30 ? 10 : 4);
    const lat = Math.max(-85, Math.min(85, startLat + (endLat - startLat) * t + curveOffset));
    coords.push([Number(lng.toFixed(4)), Number(lat.toFixed(4))]);
  }
  return coords;
}

export function Geographic3DGlobe({
  productName,
  hotspotCoords,
  hotspotStage,
  routes,
}: Geographic3DGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const animFrameId = useRef<number | null>(null);

  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // High-resolution real GIS raster satellite/dark cartography with zero API keys
    const darkTileStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-dark-tiles": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: "ESRI / EcoTrace"
        }
      },
      layers: [
        {
          id: "esri-dark-base-layer",
          type: "raster",
          source: "esri-dark-tiles",
          minzoom: 0,
          maxzoom: 18
        }
      ]
    };

    // Clean up any existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Create MapLibre map with 3D Globe spherical perspective pitch
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: darkTileStyle,
        center: [45, 22],
        zoom: 1.6,
        pitch: 42,
        bearing: -10,
        attributionControl: false,
        maxPitch: 75,
        minZoom: 1,
        maxZoom: 14,
      });
    } catch {
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: darkTileStyle,
        center: [45, 22],
        zoom: 1.6,
        attributionControl: false,
      });
    }

    mapInstance.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      map.resize();

      // Collect all station features and route LineStrings
      const routeFeatures: GeoJSON.Feature[] = [];
      const stationFeatures: GeoJSON.Feature[] = [];
      const seenCoords = new Set<string>();

      routes.forEach((r) => {
        const fromCoord = getCoords(r.from, hotspotCoords.lng - 30, hotspotCoords.lat - 10);
        const toCoord = getCoords(r.to, hotspotCoords.lng + 25, hotspotCoords.lat + 10);

        [
          { name: r.from, coord: fromCoord },
          { name: r.to, coord: toCoord },
        ].forEach((st) => {
          const key = `${st.coord[0].toFixed(2)},${st.coord[1].toFixed(2)}`;
          if (!seenCoords.has(key)) {
            seenCoords.add(key);
            const isHp = Math.abs(st.coord[0] - hotspotCoords.lng) < 1.5 && Math.abs(st.coord[1] - hotspotCoords.lat) < 1.5;
            stationFeatures.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: st.coord,
              },
              properties: {
                title: st.name,
                isHotspot: isHp,
              },
            });
          }
        });

        // Add Great-Circle curved flight arc
        const arc = buildArcCoords(fromCoord, toCoord, 40);
        routeFeatures.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: arc,
          },
          properties: {
            from: r.from,
            to: r.to,
            emissions: r.emissionsKg,
            mode: r.transportMode,
          },
        });
      });

      // Ensure primary hotspot is also in stationFeatures
      const hpKey = `${hotspotCoords.lng.toFixed(2)},${hotspotCoords.lat.toFixed(2)}`;
      if (!seenCoords.has(hpKey)) {
        stationFeatures.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [hotspotCoords.lng, hotspotCoords.lat],
          },
          properties: {
            title: hotspotCoords.location,
            isHotspot: true,
          },
        });
      }

      // 1. Add Flight Routes GeoJSON
      map.addSource("3d-routes-src", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: routeFeatures,
        },
      });

      // Layer 1: Subtle faint neon glow
      map.addLayer({
        id: "3d-routes-line-glow",
        type: "line",
        source: "3d-routes-src",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#10b981",
          "line-width": 3,
          "line-opacity": 0.4,
          "line-blur": 2,
        },
      });

      // Layer 2: High-contrast thin dotted flight route line
      map.addLayer({
        id: "3d-routes-line-core",
        type: "line",
        source: "3d-routes-src",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#34d399",
          "line-width": 1.5,
          "line-dasharray": [2, 3],
          "line-opacity": 0.95,
        },
      });

      // 2. Add Station Waypoints GeoJSON
      map.addSource("3d-stations-src", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: stationFeatures,
        },
      });

      // Outer station pulse glow
      map.addLayer({
        id: "3d-stations-glow",
        type: "circle",
        source: "3d-stations-src",
        paint: {
          "circle-radius": ["case", ["get", "isHotspot"], 16, 9],
          "circle-color": ["case", ["get", "isHotspot"], "#f59e0b", "#38bdf8"],
          "circle-opacity": 0.45,
          "circle-blur": 0.8,
        },
      });

      // Inner station core
      map.addLayer({
        id: "3d-stations-core",
        type: "circle",
        source: "3d-stations-src",
        paint: {
          "circle-radius": ["case", ["get", "isHotspot"], 8, 5],
          "circle-color": ["case", ["get", "isHotspot"], "#f59e0b", "#38bdf8"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 1,
        },
      });

      // HTML Station Labels anchored to nodes
      stationFeatures.forEach((feat) => {
        const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
        const title = feat.properties?.title;
        const isHotspot = feat.properties?.isHotspot;

        const labelEl = document.createElement("div");
        labelEl.style.background = "rgba(10, 15, 26, 0.92)";
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
        labelEl.innerText = isHotspot ? `🔥 ${title}` : title;

        const marker = new maplibregl.Marker({ element: labelEl, anchor: "left", offset: [10, 0] })
          .setLngLat(coords)
          .addTo(map);
        markersRef.current.push(marker);
      });
    });

    // Real-time synchronized SVG curved flight paths: thin, dotted, glowing, and fully visible
    const syncRouteArcs = () => {
      const svg = document.getElementById("globe-3d-route-svg") as SVGSVGElement | null;
      if (!svg || !mapInstance.current) return;

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <linearGradient id="globeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
        <filter id="globeRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
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

        try {
          const p1 = mapInstance.current!.project(fromCoord);
          const p2 = mapInstance.current!.project(toCoord);

          // Only draw if both points are roughly within or near view area
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5 && dist < 3000) {
            const cx = (p1.x + p2.x) / 2 - dy * 0.16;
            const cy = (p1.y + p2.y) / 2 + dx * 0.16;
            const pathData = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;

            // 1. Faint thin glow
            const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            glowPath.setAttribute("d", pathData);
            glowPath.setAttribute("fill", "none");
            glowPath.setAttribute("stroke", "#10b981");
            glowPath.setAttribute("stroke-width", "3");
            glowPath.setAttribute("stroke-opacity", "0.35");
            glowPath.setAttribute("filter", "url(#globeRouteGlow)");
            svg.appendChild(glowPath);

            // 2. High-contrast crisp thin dotted line (user requested: thin and dotted)
            const dottedPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            dottedPath.setAttribute("d", pathData);
            dottedPath.setAttribute("fill", "none");
            dottedPath.setAttribute("stroke", "url(#globeRouteGrad)");
            dottedPath.setAttribute("stroke-width", "1.75");
            dottedPath.setAttribute("stroke-dasharray", "4 4");
            dottedPath.setAttribute("stroke-linecap", "round");
            svg.appendChild(dottedPath);
          }
        } catch {
          // Ignore projection edge cases
        }
      });
    };

    map.on("render", syncRouteArcs);
    map.on("move", syncRouteArcs);
    map.on("zoom", syncRouteArcs);
    map.on("rotate", syncRouteArcs);

    const resizeTimer = setInterval(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
        syncRouteArcs();
      }
    }, 400);

    // Auto-spin logic for gentle planetary rotation without re-initializing the entire map
    let bearing = -10;
    const rotateGlobe = () => {
      if (autoRotate && mapInstance.current) {
        bearing += 0.08;
        mapInstance.current.setBearing(bearing);
        syncRouteArcs();
      }
      animFrameId.current = requestAnimationFrame(rotateGlobe);
    };

    animFrameId.current = requestAnimationFrame(rotateGlobe);

    return () => {
      clearInterval(resizeTimer);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, [hotspotCoords, routes]);

  // Keep rotation loop updated when autoRotate state changes
  useEffect(() => {
    if (!autoRotate && animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    } else if (autoRotate && mapInstance.current) {
      let bearing = mapInstance.current.getBearing() || 0;
      const rotateGlobe = () => {
        if (mapInstance.current) {
          bearing += 0.08;
          mapInstance.current.setBearing(bearing);
          animFrameId.current = requestAnimationFrame(rotateGlobe);
        }
      };
      animFrameId.current = requestAnimationFrame(rotateGlobe);
    }
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [autoRotate]);

  const handleFocusHotspot = () => {
    setAutoRotate(false);
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: [hotspotCoords.lng, hotspotCoords.lat],
      zoom: 3.8,
      pitch: 55,
      bearing: -20,
      duration: 2200,
    });
  };

  const handleResetOrbit = () => {
    if (!mapInstance.current) return;
    setAutoRotate(true);
    mapInstance.current.flyTo({
      center: [hotspotCoords.lng, hotspotCoords.lat],
      zoom: 1.4,
      pitch: 48,
      bearing: -15,
      duration: 1800,
    });
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-[#030308] border border-white/[0.08] overflow-hidden flex flex-col shadow-2xl select-none">
      
      {/* 3D Globe Header Bar */}
      <div className="p-3.5 px-5 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white font-mono">
            {productName} 3D Planetary Logistics Orbit
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Active Hotspot Hub
          </span>
        </div>

        {/* Orbit Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFocusHotspot}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono transition-all cursor-pointer"
          >
            <Navigation className="w-3 h-3" />
            Focus Hotspot
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
              autoRotate 
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" 
                : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white"
            }`}
          >
            <RotateCw className="w-3 h-3" />
            {autoRotate ? "Orbit Spinning" : "Orbit Paused"}
          </button>

          <button
            onClick={handleResetOrbit}
            className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-slate-400 hover:text-white font-mono transition-all cursor-pointer"
          >
            Reset Orbit
          </button>
        </div>
      </div>

      {/* 3D Map Container with Atmospheric Vignette */}
      <div className="flex-1 w-full h-full relative bg-[#060911] overflow-hidden">
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0 z-0" 
          style={{ minHeight: "460px" }}
        />

        {/* Dynamic Real-time Synchronized SVG Flight Arc Layer for Guaranteed Crisp Dotted Routes */}
        <svg 
          id="globe-3d-route-svg" 
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        />

        {/* Spherical Horizon Edge Gradient Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(3, 5, 12, 0.65) 90%, #030308 100%)",
          }}
        />

        {/* Top-Right Hotspot Overlay Card */}
        <div className="absolute right-3 top-3 p-3.5 rounded-xl bg-amber-950/90 border border-amber-500/50 backdrop-blur-xl shadow-2xl z-20 max-w-[240px] text-xs space-y-1.5 pointer-events-auto">
          <div className="text-amber-300 font-bold flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            Critical Planetary Hotspot
          </div>
          <div className="text-white font-semibold text-xs truncate">{hotspotCoords.location}</div>
          <div className="text-[11px] text-slate-300 leading-snug line-clamp-2">{hotspotStage}</div>
          <div className="text-[10px] font-mono text-amber-200/80 pt-1 border-t border-amber-500/30">
            LAT: {hotspotCoords.lat.toFixed(2)}° | LNG: {hotspotCoords.lng.toFixed(2)}°
          </div>
        </div>

        {/* Bottom-Left Corridor Emissions Card */}
        <div className="absolute left-3 bottom-3 max-w-[280px] p-3 rounded-xl bg-slate-950/90 border border-white/[0.12] backdrop-blur-xl shadow-2xl z-20 space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Global Freight Corridors
            </span>
            <span className="text-[10px] font-mono text-slate-400">GLEC Verified</span>
          </div>

          <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-xs">
            {routes.map((r, idx) => (
              <div key={idx} className="p-1.5 rounded bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-[11px]">
                <span className="truncate max-w-[150px] text-slate-300 font-medium">{r.from} → {r.to}</span>
                <span className="font-mono text-emerald-400 font-bold">+{r.emissionsKg} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tip */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/[0.08] pointer-events-none z-20">
          Right-click & drag to adjust 3D pitch/bearing · Left-click & drag to orbit
        </div>
      </div>

    </div>
  );
}
