const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.warn("Backend API unavailable, using offline fallback", err);
    return null;
  }
}

export async function fetchProductById(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return await res.json();
  } catch (err) {
    console.warn("Backend API unavailable, using offline fallback", err);
    return null;
  }
}

export async function runScenarioApi(productId: string, params: { adoption_rate: number; clean_electricity_pct?: number; recycled_content_pct?: number }) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Scenario run failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend API unavailable, using local calculation fallback", err);
    return null;
  }
}

export async function analyzeCustomProductApi(query: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("Analysis failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend API unavailable, using client synthesis fallback", err);
    return null;
  }
}

export async function fetchAiExplanation(productId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/ai-explanation`);
    if (!res.ok) throw new Error("AI explanation request failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend AI explanation unavailable, using local deterministic fallback", err);
    return null;
  }
}
