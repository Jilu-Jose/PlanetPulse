# PlanetPulse

**Hackathon ID:** AZIS-DQZ8PX  
**Track:** Track 2 · Climate Tech  
**Challenge:** "A carbon footprint tracker: turn daily choices into a visible carbon footprint."

PlanetPulse is a climate-tech web app that turns everyday travel, energy, and food choices into a visible personal carbon footprint (CO₂e).

---

## 🌐 Live Demo & Test Credentials

**Frontend (Vercel):** [https://frontend-eight-roan-vva5vbvmc7.vercel.app/](https://frontend-eight-roan-vva5vbvmc7.vercel.app/)  
**Backend API (Render):** [https://planetpulse-f86t.onrender.com](https://planetpulse-f86t.onrender.com)

**Test Credentials:** 
* **No login required!** The application uses an anonymous session ID (`x-session-id`) stored in your browser's local storage. Simply visit the link to start logging activities as a unique user.

---

## 💻 Tech Stack

**Frontend:**
- **React 18** (Vite)
- **React Router DOM** (Client-side routing)
- **Recharts** (Dashboard visualization)
- **Leaflet & React-Leaflet** (Map integration with Datameet GeoJSON borders)
- **Vanilla CSS** (Custom responsive design system with CSS Variables & Keyframe animations)
- **Lucide React** (Vector Icons)

**Backend:**
- **FastAPI** (Python web framework)
- **SQLAlchemy** (ORM)
- **SQLite** (Database)
- **Pydantic** (Schema validation)
- **Rank-BM25** (RAG Knowledge Base indexing)
- **Groq API** (Llama-3.1-8b inference for AI chatbot & unstructured text/voice log parsing)

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend (FastAPI)
Open a terminal and run the following commands:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
```

**Environment Variables:** Create a `.env` file in the `backend` folder:
```env
LLM_API_KEY=your_groq_api_key
LLM_BASE_URL=https://api.groq.com/openai/v1
MODEL_NAME="llama-3.1-8b-instant"
DATABASE_URL=sqlite:///./planetpulse.db
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
PORT=8000
```

Start the server:
```bash
python -c "from app.models.database import init_db; init_db()"
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Vite/React)
Open a new terminal and run:
```bash
cd frontend
npm install
```

**Environment Variables:** Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:8000/api
```

Start the dev server:
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 📊 Data Sources & Methodology

### Data Sources
| Category | Data Source |
|---|---|
| Emission Factors | Code2Career Track 2 official brief (fixed factors) |

### Methodology
PlanetPulse uses a deterministic calculation engine (`carbon_engine`). We rely on exact arithmetic via Python's `Decimal` type, rather than floating-point math, to ensure absolutely no float drift. Calculations are executed purely on the backend, ensuring precision and preventing tampering, and are returned as strings (and `co2e_e4` integers in the database).

Calculation Formula: `CO₂e (kg) = Quantity * Emission Factor`

---

## ✅ Required Features & Decision Points
* **Core Requirements:** All five required features (Log Activity, CO₂ Calculation, Dashboard, Weekly Target, History & Filter) are fully implemented.
* **Decision Points:** The three Decision Points (DP1: The Nudge, DP2: Absurd Input, DP3: The Week) are handled perfectly and documented in `docs/DECISIONS.md`.
* **Advanced Features:** 
  * **Quick Log (Voice & Text):** Uses Llama-3.1-8b to parse natural language ("I drove 20km to work") and voice inputs into structured carbon logs.
  * **What-If Simulator:** Pre-compute the greener choice (e.g. Car vs Bus) to see the exact CO₂ delta *before* making a decision.
  * **Ask AI:** A RAG-powered chatbot that can answer questions about your data and general carbon knowledge using BM25 and Llama-3.1-8b.
  * **Map Tab:** See how your footprint compares to regional averages across India using live interactive maps with GeoJSON boundaries.

---

## 🎥 Demo Script (3-4 Minutes)

1. **Log a car trip**: Go to "Add Activity", select Car, enter 10 km.
2. **See the exact CO₂**: A success modal displays "2.00 kg CO₂" instantly.
3. **Dashboard breakdown**: Navigate to Dashboard, see the newly added amount reflected in total, per-category pie charts, and trend graph.
4. **Set a target**: On the Dashboard, click "Set target" in the Weekly Target card. Set it to 15 kg.
5. **Cross it and show the nudge**: Add a flight for 100 km (25 kg). See the instant Toast warning. On the Dashboard, observe the amber/red exceeded state, identifying the top contributor (Flight) and presenting an actionable swap suggestion (e.g. swapping car km for bus).
6. **Try 500,000 km**: Log a car trip of 500,000. See the backend HTTP 422 rejection and user-friendly error message.
7. **Filter history**: Go to History, select "Travel" and "This week" presets, see the logged activities match exactly.

---
**TODO BEFORE SUBMISSION:**
- [x] Add Hackathon ID
- [ ] Record video
