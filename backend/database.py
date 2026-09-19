"""
Curated Lifecycle Factors and Seed Database for EcoTrace
Data Sources:
- Ecoinvent v3.10 (Global Lifecycle Inventory)
- DEFRA UK GHG Conversion Factors for Company Reporting (2024)
- GLEC Framework v3.0 (Logistics Emissions)
- US EPA WARM (Waste Reduction Model)
"""

from typing import Dict, Any, List

SEEDED_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "phone",
        "name": "iPhone-class Smartphone",
        "category": "Consumer Electronics",
        "carbon": 78.4,
        "water": 12450.0,
        "waste": 24.2,
        "resource_pressure": 88.0,
        "hotspot": "Semiconductor Fabrication & Cobalt Leaching",
        "hotspotStage": "Tier 3 Refining (Hsinchu & Katanga)",
        "hotspotCoords": {"lat": 24.78, "lng": 120.99, "location": "Hsinchu Science Park, Taiwan"},
        "intervention": "Mandate 100% recycled cobalt cathode & clean fab power",
        "baseReduction": 28.4,
        "confidence": "Medium",
        "tiers": [
            {
                "tier": "Tier 4: Mining & Brine Extraction",
                "name": "Lithium & Cobalt Extraction",
                "location": "Salar de Atacama, Chile & Katanga, DRC",
                "stage": "Raw Mining",
                "impactShare": 32.0,
                "subcomponents": ["Brine Pumping", "Acid Leaching", "Slurry Transport"]
            },
            {
                "tier": "Tier 3: Precursor & Chemical Refining",
                "name": "Cathode Active Material & Silicon Ingot",
                "location": "Jiangsu, China & Hsinchu, Taiwan",
                "stage": "Refining & Wafer Fab",
                "impactShare": 42.0,
                "subcomponents": ["4nm EUV Lithography", "Chemical Vapor Deposition", "Ultra-pure Water Wash"]
            },
            {
                "tier": "Tier 2: Component Assembly",
                "name": "Display OLED & Logic Substrates",
                "location": "Gumi, South Korea",
                "stage": "Component Assembly",
                "impactShare": 14.0,
                "subcomponents": ["Substrate Bonding", "Flex PCB Soldering"]
            },
            {
                "tier": "Tier 1: Final Integration",
                "name": "Device Enclosure & Test Packaging",
                "location": "Zhengzhou, China",
                "stage": "Final Integration",
                "impactShare": 12.0,
                "subcomponents": ["Automated Screw Assembly", "Air Freight Packaging"]
            }
        ],
        "geographicRoutes": [
            {"from": "Atacama (Chile)", "to": "Jiangsu (China)", "transportMode": "Bulk Maritime Container", "emissionsKg": 4.8},
            {"from": "Hsinchu (Taiwan)", "to": "Zhengzhou (China)", "transportMode": "Short-sea Freight", "emissionsKg": 1.2},
            {"from": "Zhengzhou (China)", "to": "Global Hubs", "transportMode": "Intercontinental Air Cargo", "emissionsKg": 8.6}
        ]
    },
    {
        "id": "shoes",
        "name": "Performance Running Shoes",
        "category": "Apparel & Footwear",
        "carbon": 14.2,
        "water": 4200.0,
        "waste": 4.8,
        "resource_pressure": 55.0,
        "hotspot": "Petroleum Cracking for EVA Foam Midsole",
        "hotspotStage": "Tier 2 Polymerization (Dong Nai, Vietnam)",
        "hotspotCoords": {"lat": 10.95, "lng": 106.84, "location": "Dong Nai Industrial Zone, Vietnam"},
        "intervention": "Shift to algae & bio-supercritical nitrogen foam",
        "baseReduction": 34.1,
        "confidence": "High",
        "tiers": [
            {
                "tier": "Tier 4: Petroleum Extraction",
                "name": "Crude Oil Cracking to Ethylene",
                "location": "Jubail, Saudi Arabia",
                "stage": "Petrochemical",
                "impactShare": 28.0,
                "subcomponents": ["Thermal Cracking", "Naphtha Distillation"]
            },
            {
                "tier": "Tier 3: Polymerization",
                "name": "EVA Pellets & Synthetic Yarn Spinning",
                "location": "Kaohsiung, Taiwan",
                "stage": "Polymer Processing",
                "impactShare": 38.0,
                "subcomponents": ["High Pressure Autoclave", "Extrusion"]
            },
            {
                "tier": "Tier 2: Midsole Molding",
                "name": "Supercritical Nitrogen Foaming",
                "location": "Dong Nai, Vietnam",
                "stage": "Component Forming",
                "impactShare": 24.0,
                "subcomponents": ["Heated Compression", "Die Cut Flash"]
            },
            {
                "tier": "Tier 1: Stitching & Assembly",
                "name": "Shoe Upper Lasting & Outsole Cementing",
                "location": "Binh Duong, Vietnam",
                "stage": "Assembly",
                "impactShare": 10.0,
                "subcomponents": ["Waterborne Polyurethane Glue", "Box Packing"]
            }
        ],
        "geographicRoutes": [
            {"from": "Jubail (Saudi Arabia)", "to": "Kaohsiung (Taiwan)", "transportMode": "Chemical Tanker", "emissionsKg": 0.9},
            {"from": "Kaohsiung (Taiwan)", "to": "Dong Nai (Vietnam)", "transportMode": "Container Ship", "emissionsKg": 0.4},
            {"from": "Ho Chi Minh Port", "to": "Rotterdam / Long Beach", "transportMode": "Ultra Large Container Vessel", "emissionsKg": 1.8}
        ]
    },
    {
        "id": "tshirt",
        "name": "Combed Cotton T-Shirt",
        "category": "Textiles",
        "carbon": 6.8,
        "water": 2700.0,
        "waste": 1.1,
        "resource_pressure": 42.0,
        "hotspot": "Flood Irrigation & Toxic Reactive Dyeing",
        "hotspotStage": "Tier 4 Agriculture & Wet Dyeing (Gujarat)",
        "hotspotCoords": {"lat": 22.25, "lng": 71.19, "location": "Gujarat Cotton Belt, India"},
        "intervention": "Deploy waterless supercritical CO₂ closed-loop dyeing",
        "baseReduction": 41.5,
        "confidence": "High",
        "tiers": [
            {
                "tier": "Tier 4: Cultivation",
                "name": "Raw Seed Cotton Cultivation",
                "location": "Gujarat, India",
                "stage": "Agriculture",
                "impactShare": 45.0,
                "subcomponents": ["Canal Irrigation", "Synthetic Nitrogen Fertilizer"]
            },
            {
                "tier": "Tier 3: Ginning & Spinning",
                "name": "Combed Ring Spun Yarn",
                "location": "Coimbatore, India",
                "stage": "Milling",
                "impactShare": 22.0,
                "subcomponents": ["Mechanical Ginning", "Ring Spinning"]
            },
            {
                "tier": "Tier 2: Wet Processing",
                "name": "Reactive Dyeing & Tubular Knitting",
                "location": "Tirupur, India",
                "stage": "Finishing",
                "impactShare": 25.0,
                "subcomponents": ["Aqueous Dye Bath", "Caustic Scouring", "Steam Drying"]
            },
            {
                "tier": "Tier 1: Cut & Sew",
                "name": "Garment Sewing & Labeling",
                "location": "Dhaka, Bangladesh",
                "stage": "Manufacturing",
                "impactShare": 8.0,
                "subcomponents": ["Overlock Sewing", "Polybag Packaging"]
            }
        ],
        "geographicRoutes": [
            {"from": "Gujarat (India)", "to": "Tirupur (India)", "transportMode": "Rail Freight", "emissionsKg": 0.3},
            {"from": "Chittagong (Bangladesh)", "to": "Antwerp (Europe)", "transportMode": "Container Vessel", "emissionsKg": 0.7}
        ]
    },
    {
        "id": "laptop",
        "name": "16-inch Enterprise Laptop",
        "category": "Computing",
        "carbon": 294.0,
        "water": 31800.0,
        "waste": 54.0,
        "resource_pressure": 92.0,
        "hotspot": "Primary Bauxite Smelting for CNC Chassis",
        "hotspotStage": "Tier 3 Thermal Smelting (Inner Mongolia)",
        "hotspotCoords": {"lat": 40.84, "lng": 111.75, "location": "Baotou Industrial Corridor, Inner Mongolia"},
        "intervention": "Substitute with 85% certified hydro-smelted aluminum",
        "baseReduction": 23.0,
        "confidence": "Medium",
        "tiers": [
            {
                "tier": "Tier 4: Bauxite Mining",
                "name": "Bauxite Extraction & Alumina Calcination",
                "location": "Boké, Guinea & Queensland, AU",
                "stage": "Mining",
                "impactShare": 24.0,
                "subcomponents": ["Open-cast Digging", "Bayer Process Alumina"]
            },
            {
                "tier": "Tier 3: Primary Smelting",
                "name": "Coal-fired Hall-Héroult Reduction",
                "location": "Inner Mongolia, China",
                "stage": "Smelting",
                "impactShare": 46.0,
                "subcomponents": ["Carbon Anode Consumption", "Electrolytic Pots"]
            },
            {
                "tier": "Tier 2: CNC Machining & Motherboard",
                "name": "Unibody Milling & PCB SMT",
                "location": "Kunshan, China",
                "stage": "Fabrication",
                "impactShare": 20.0,
                "subcomponents": ["Multi-axis CNC Mill", "Lead-free Reflow Solder"]
            },
            {
                "tier": "Tier 1: Final Integration",
                "name": "Thermal Assembly, Display & Box",
                "location": "Chengdu, China",
                "stage": "System Build",
                "impactShare": 10.0,
                "subcomponents": ["Display Press Fit", "Burn-in Testing"]
            }
        ],
        "geographicRoutes": [
            {"from": "Guinea / Australia", "to": "Tianjin Port", "transportMode": "Capesize Bulk Carrier", "emissionsKg": 18.2},
            {"from": "Kunshan", "to": "Chengdu", "transportMode": "Domestic Electric Rail", "emissionsKg": 4.5},
            {"from": "Chengdu", "to": "Frankfurt / Chicago", "transportMode": "Direct Freight Flight", "emissionsKg": 24.1}
        ]
    },
    {
        "id": "ev",
        "name": "Electric Vehicle 75kWh Battery Pack",
        "category": "Clean Mobility",
        "carbon": 4820.0,
        "water": 89000.0,
        "waste": 980.0,
        "resource_pressure": 96.0,
        "hotspot": "Lithium Brine Evaporation & Nickel Calcination",
        "hotspotStage": "Tier 4 Extraction (Atacama & Sulawesi)",
        "hotspotCoords": {"lat": -23.86, "lng": -69.13, "location": "Atacama Salt Flat, Chile"},
        "intervention": "Direct Lithium Extraction (DLE) powered by geothermal",
        "baseReduction": 38.0,
        "confidence": "Medium",
        "tiers": [
            {
                "tier": "Tier 4: Resource Brine & Ore",
                "name": "Lithium Brine & Laterite Nickel",
                "location": "Atacama, Chile & Morowali, Indonesia",
                "stage": "Extraction",
                "impactShare": 44.0,
                "subcomponents": ["Solar Evaporation Ponds", "High-Pressure Acid Leach (HPAL)"]
            },
            {
                "tier": "Tier 3: Precursor Synthesis",
                "name": "NMC 811 Hydroxide Precursor",
                "location": "Pohang, South Korea",
                "stage": "Refining",
                "impactShare": 32.0,
                "subcomponents": ["Co-precipitation", "Rotary Kiln Sintering"]
            },
            {
                "tier": "Tier 2: Electrode & Cell",
                "name": "Prismatic Cell Coating & Formation",
                "location": "Debrecen, Hungary",
                "stage": "Cell Production",
                "impactShare": 16.0,
                "subcomponents": ["Slurry Slot-die Coating", "Electrolyte Filling & Aging"]
            },
            {
                "tier": "Tier 1: Pack Integration",
                "name": "BMS, Thermal Runaway Plates & Enclosure",
                "location": "Stuttgart, Germany",
                "stage": "Pack Integration",
                "impactShare": 8.0,
                "subcomponents": ["Laser Welding Busbars", "Glycol Cooling System"]
            }
        ],
        "geographicRoutes": [
            {"from": "Antofagasta (Chile)", "to": "Busan (South Korea)", "transportMode": "Bulk Maritime", "emissionsKg": 180.0},
            {"from": "Pohang (South Korea)", "to": "Koper (Slovenia)", "transportMode": "Container Vessel", "emissionsKg": 120.0},
            {"from": "Debrecen (Hungary)", "to": "Stuttgart (Germany)", "transportMode": "Heavy Freight Rail", "emissionsKg": 45.0}
        ]
    }
]
