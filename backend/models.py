from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SupplyChainTier(BaseModel):
    tier: str
    name: str
    location: str
    stage: str
    impactShare: float
    subcomponents: List[str]

class GeographicRoute(BaseModel):
    from_loc: str = Field(..., alias="from")
    to_loc: str = Field(..., alias="to")
    transportMode: str
    emissionsKg: float

    class Config:
        populate_by_name = True

class HotspotCoords(BaseModel):
    lat: float
    lng: float
    location: str

class ProductModel(BaseModel):
    id: str
    name: str
    category: str
    carbon: float  # kg CO2e
    water: float   # Liters
    waste: float   # kg
    resource_pressure: Optional[float] = 45.0
    hotspot: str
    hotspotStage: str
    hotspotCoords: HotspotCoords
    intervention: str
    baseReduction: float  # percentage
    confidence: str  # "High" | "Medium" | "Low"
    tiers: List[SupplyChainTier]
    geographicRoutes: List[GeographicRoute]

class AnalyzeRequest(BaseModel):
    query: str

class ScenarioRequest(BaseModel):
    adoption_rate: float  # 0 to 100
    clean_electricity_pct: Optional[float] = 0.0
    recycled_content_pct: Optional[float] = 0.0
    local_sourcing_pct: Optional[float] = 0.0

class ScenarioResult(BaseModel):
    product_id: str
    baseline_carbon: float
    simulated_carbon: float
    avoided_carbon: float
    reduction_percentage: float
    impact_deltas: Dict[str, float]
