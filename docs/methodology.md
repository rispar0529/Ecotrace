# Lifecycle Assessment (LCA) Methodology

EcoTrace models environmental footprints using standardized Lifecycle Assessment (LCA) principles in conformance with **ISO 14040:2006** and **ISO 14044:2006**.

---

## 1. System Boundary: Cradle-to-Gate + Upstream Logistics

EcoTrace evaluates each product archetype across a **cradle-to-gate** boundary:
1. **Tier 4: Raw Material Extraction & Brine Mining:**
   - Open-cast mining, deep-well pumping, brine solar evaporation, agricultural cultivation.
2. **Tier 3: Precursor Synthesis & Chemical Refining:**
   - Hall-Héroult smelting, chemical vapor deposition, wet dyeing, solvent precipitation.
3. **Tier 2: Component Fabrication & Sub-Assembly:**
   - CNC unibody milling, supercritical foaming, wafer slicing, printed circuit board (PCB) soldering.
4. **Tier 1: Final Integration & Packaging:**
   - Structural screw assembly, cleanroom calibration, distribution boxing.
5. **Upstream Logistics Corridors:**
   - Multimodal transit calculated according to the **Global Logistics Emissions Council (GLEC) Framework v3.0**.

---

## 2. Impact Categories & Indicators

| Impact Indicator | Unit | Characterization Method | Primary Database Source |
| :--- | :--- | :--- | :--- |
| **Global Warming Potential (GWP100)** | kg CO₂e | IPCC 6th Assessment Report (AR6) | DEFRA UK GHG (2024) / Ecoinvent v3.10 |
| **Consumptive Water Depletion** | Liters | AWARE (Available Water Remaining) | Ecoinvent v3.10 |
| **Solid Hazardous & Industrial Waste** | kg | US EPA WARM (Waste Reduction Model) | US EPA / Circular Footprint Model |
| **Resource Depletion Index** | 0 – 100 | CML 2001 (Abiotic Mineral Depletion) | USGS Mineral Commodity Summaries |

---

## 3. What-If Decarbonization Simulation Engine

The deterministic scenario simulator evaluates interventions using a multi-parameter sensitivity formula:

$$\Delta_{\text{total}} = \min\left(88\%, \; \Delta_{\text{base}} + \Delta_{\text{energy}} + \Delta_{\text{materials}} + \Delta_{\text{logistics}}\right)$$

Where:
* **$\Delta_{\text{base}} = P_{\text{intervention}} \times \frac{\text{Adoption Rate}}{100}$** (Specific Tier Bottleneck replacement)
* **$\Delta_{\text{energy}} = \frac{\text{Renewable PPA Share}}{100} \times 0.18$** (Thermal coal displacement)
* **$\Delta_{\text{materials}} = \frac{\text{Recycled Feedstock \%}}{100} \times 0.22$** (Virgin extraction avoidance)
* **$\Delta_{\text{logistics}} = \frac{\text{Regional Sourcing \%}}{100} \times 0.08$** (Long-haul aviation/marine displacement)

All calculated deltas update in real time and are reflected across both numerical metrics and comparative charts.
