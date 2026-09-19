import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from models import ProductModel, AnalyzeRequest, ScenarioRequest, ScenarioResult
from database import SEEDED_PRODUCTS
from engine import calculate_scenario, synthesize_product_from_query
from ai_service import get_ai_explanation, get_ai_recommendation

app = FastAPI(
    title="EcoTrace Environmental Supply-Chain Intelligence API",
    version="1.0.0",
    description="Deterministic supply-chain lifecycle attribution and hotspot intervention API."
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory product store initialized with vetted seed dataset
products_db: Dict[str, Dict[str, Any]] = {p["id"]: p for p in SEEDED_PRODUCTS}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EcoTrace API",
        "engine": "Deterministic LCA v1.4",
        "iso_standards": ["ISO 14040", "ISO 14044"]
    }

@app.get("/products", response_model=List[ProductModel])
def get_products():
    """Retrieve all available product archetypes and user-analyzed products."""
    return list(products_db.values())

@app.get("/products/{product_id}", response_model=ProductModel)
def get_product(product_id: str):
    """Retrieve complete supply-chain environmental profile for a specific product."""
    product = products_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/products/{product_id}/hotspots")
def get_product_hotspots(product_id: str):
    """Retrieve prioritized environmental hotspots for a product."""
    product = products_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Sort tiers by impact share descending
    sorted_tiers = sorted(product["tiers"], key=lambda t: t["impactShare"], reverse=True)
    return {
        "product_id": product_id,
        "primary_hotspot": product["hotspot"],
        "hotspot_stage": product["hotspotStage"],
        "hotspot_location": product["hotspotCoords"],
        "ranked_contributors": sorted_tiers,
        "confidence": product["confidence"]
    }

@app.post("/products/{product_id}/scenario", response_model=ScenarioResult)
def run_product_scenario(product_id: str, request: ScenarioRequest):
    """Run real-time deterministic scenario recalculations."""
    product = products_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return calculate_scenario(product, request)

from ai_service import get_ai_explanation, get_ai_recommendation, synthesize_custom_product_with_ai

@app.post("/analyze", response_model=ProductModel)
def analyze_custom_product(request: AnalyzeRequest):
    """
    Deconstruct an arbitrary product query, synthesize BOM and lifecycle tiers
    in real-time via Gemini AI + Ecoinvent heuristics, and register into catalog.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # 1. Attempt dynamic real-time synthesis via Gemini
    ai_synthesized = synthesize_custom_product_with_ai(request.query)
    if ai_synthesized:
        products_db[ai_synthesized["id"]] = ai_synthesized
        return ai_synthesized

    # 2. Fallback to calibrated deterministic heuristics
    new_product = synthesize_product_from_query(request.query)
    products_db[new_product["id"]] = new_product
    return new_product

@app.get("/products/{product_id}/ai-explanation")
def get_product_ai_explanation(product_id: str):
    """Retrieve Gemini-assisted forensic rationale for product hotspot."""
    product = products_db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    explanation = get_ai_explanation(
        product_name=product["name"],
        hotspot=product["hotspot"],
        hotspot_stage=product["hotspotStage"],
        carbon_kg=product["carbon"]
    )
    recommendation = get_ai_recommendation(
        product_name=product["name"],
        intervention=product["intervention"],
        reduction_pct=product["baseReduction"]
    )
    return {
        "product_id": product_id,
        "ai_explanation": explanation,
        "ai_recommendation": recommendation,
        "model_used": os.getenv("LLM_MODEL", "gemini-2.5-flash"),
        "guardrail": "Deterministic calculations are strictly non-overridable by LLM"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
