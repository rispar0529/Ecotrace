# Deployment Guide for EcoTrace

EcoTrace consists of two decoupled services:
1. **Frontend**: Next.js 16 app (Optimized for **Vercel**)
2. **Backend**: FastAPI Python API (Optimized for **Render** or **Railway**)

---

## Step 1: Deploy the Backend (FastAPI on Render.com)

1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `rispar0529/Ecotrace`.
4. Configure the service settings:
   - **Name**: `ecotrace-api`
   - **Region**: Any (e.g., Frankfurt or Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `LLM_MODEL`: `gemini-2.5-flash`
6. Click **Deploy Web Service**.
7. Once deployed, copy your live backend URL (e.g., `https://ecotrace-api.onrender.com`).

---

## Step 2: Deploy the Frontend (Next.js on Vercel)

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New…** → **Project**.
3. Import your repository: `rispar0529/Ecotrace`.
4. In the Project Configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `frontend`.
5. Under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://ecotrace-api.onrender.com` *(Replace with your Render backend URL from Step 1, without trailing slash)*
6. Click **Deploy**.
7. Vercel will build and assign your live production URL (e.g., `https://ecotrace.vercel.app`).
