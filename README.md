# PlanetPulse

**Hackathon ID:** [PENDING]

PlanetPulse is a climate-tech web app that turns everyday travel, energy, and food choices into a visible personal carbon footprint (COâ‚‚e).

## Data Sources & Methodology

### Data Sources
| Category | Data Source |
|---|---|
| Emission Factors | Code2Career Track 2 official brief (fixed factors) |

### Methodology
PlanetPulse uses a deterministic calculation engine (`carbon_engine`). We rely on exact arithmetic via Python's `Decimal` type, rather than floating-point math, to ensure absolutely no float drift. Calculations are executed purely on the backend, ensuring precision and preventing tampering, and are returned as strings (and `co2e_e4` integers in the database).

Calculation Formula: `COâ‚‚e (kg) = Quantity * Emission Factor`

## Required Features & Decision Points
* All five required features (Log Activity, COâ‚‚ Calculation, Dashboard, Weekly Target, History & Filter) are fully implemented.
* The three Decision Points (DP1: The Nudge, DP2: Absurd Input, DP3: The Week) are documented in `docs/DECISIONS.md`.
* Refer to `docs/REQUIRED_FEATURES.md` for full details.

## How to Run Locally

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -c "from app.models.database import init_db; init_db()"
uvicorn app.main:app --reload
```

### Frontend (Vite/React)
```bash
cd frontend
npm install
npm run dev
```

### AI Integration (Phase 8)
PlanetPulse uses AI to generate actionable insights and footprint explanations.
To enable AI features, create `backend/.env` with the following (we default to Groq):
```env
LLM_API_KEY=your_groq_api_key
LLM_BASE_URL=https://api.groq.com/openai/v1
MODEL_NAME="gpt OSS 120b"
DATABASE_URL=sqlite:///./planetpulse.db
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
PORT=8000
```

## Demo Script (3-4 Minutes)

1. **Log a car trip**: Go to "Add Activity", select Car, enter 10 km.
2. **See the exact COâ‚‚**: A success modal displays "2.00 kg COâ‚‚" instantly.
3. **Dashboard breakdown**: Navigate to Dashboard, see the newly added amount reflected in total, per-category pie charts, and trend graph.
4. **Set a target**: On the Dashboard, click "Set target" in the Weekly Target card. Set it to 15 kg.
5. **Cross it and show the nudge**: Add a flight for 100 km (25 kg). See the instant Toast warning. On the Dashboard, observe the amber/red exceeded state, identifying the top contributor (Flight) and presenting an actionable swap suggestion (e.g. swapping car km for bus).
6. **Try 500,000 km**: Log a car trip of 500,000. See the backend HTTP 422 rejection and user-friendly error message.
7. **Filter history**: Go to History, select "Travel" and "This week" presets, see the logged activities match exactly.

---
**TODO BEFORE SUBMISSION:**
- [ ] Add Hackathon ID
- [ ] Record video

