# Architecture Decisions (Hackathon Track 2)

## Standard API Declaration

**Yes, we implemented the standard REST API for Track 2.**

All five required features are fully testable via HTTP without any UI interaction. A grading script can assess every feature using the following endpoints (all require `x-session-id` header; `x-timezone` is optional, defaults to UTC):

| Feature | Method | Endpoint | Key Response Fields |
|---|---|---|---|
| Log Activity | `POST` | `/api/activities` | `id`, `co2e_kg`, `formula_string` |
| CO₂ Calculation | — | *(returned inline with every log)* | `co2e_kg`, `formula_string`, `emission_factor_str` |
| Dashboard | `GET` | `/api/dashboard?range=week` | `total_co2e_kg`, `categories`, `top_contributors`, `trend` |
| Weekly Target (set) | `PUT` | `/api/target` | `target_kg`, `effective_week_start` |
| Weekly Target (progress) | `GET` | `/api/target/progress` | `status`, `percent_used`, `used_kg`, `remaining_kg`, `suggestion` |
| History & Filter | `GET` | `/api/activities?types=car,bus&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD` | `items[]`, `total`, `total_kg` |

Decision Points are also API-observable:
- **DP1 (Nudge):** `GET /api/target/progress` → `status: "on_track" | "approaching" | "exceeded"` + `suggestion` object
- **DP2 (Absurd Input):** `POST /api/activities` → HTTP `409` (soft limit, needs `confirm_unusual: true`) or HTTP `422` (hard reject)
- **DP3 (The Week):** All progress responses include `week_start` (Monday) and `week_end` (Sunday) in ISO 8601 format

**Live API base URL:** `https://planetpulse-f86t.onrender.com/api`

---

## Known Decisions

1. **Deterministic Engine vs LLM Calculation**
   - *Context:* AI hallucination in carbon calculations is unacceptable for auditability.
   - *Decision:* The `CarbonEngine` is 100% deterministic (using Python `decimal` and hardcoded factors). The LLM is used only for RAG (retrieval-augmented generation) and explaining the results.

2. **RAG Vector Search**
   - *Context:* We need semantic search over a small dataset of emission factors.
   - *Decision:* We use `rank_bm25` (in-memory BM25 Okapi) instead of an external vector DB (like Pinecone) or embeddings (like OpenAI text-embedding-3). This meets the requirement of not using the OpenAI SDK directly, reduces infrastructure dependencies, and is incredibly fast for our small (<1MB) JSON dataset.

## Pending Decisions from Brief

1. **Decision Point 1: The Nudge**
   - *Problem:* "What does the app do when the weekly target is crossed: warn, encourage, shame, block? Why?"
   - *Decision:* WARN + ENCOURAGE, NEVER BLOCK, NEVER SHAME. We use a graduated status (on_track, approaching, exceeded). At >= 80%, we show an amber heads-up. At >100%, we show a persistent calm banner with the top contributor and one deterministic saving suggestion.
   - *Alternatives:* 
     - A: Block logging (would corrupt data as users stop logging).
     - B: Red alarms and guilt language (demotivates users).
   - *Why We Chose This:* Logging must remain honest. A calm, constructive nudge with a concrete saving suggestion is actionable.
   - *Evidence:* Implemented in `backend/app/api/target.py` (thresholds and suggestion logic) and `frontend/src/components/WeeklyTargetCard.jsx`. Tested boundary conditions in `test_engine.py` / API tests.

2. **Decision Point 2: Absurd Input**
   - *Problem:* "How do you treat an obviously wrong entry, like a 500,000 km car trip? Why?"
   - *Decision:* TWO-TIER PLAUSIBILITY LIMITS PER ENTRY.
   - *Alternatives:* 
     - A: Single hard cap (might reject legitimate outliers like a road trip).
     - B: No cap (one absurd entry wrecks the weekly total).
     - C: Silently clamp/fix value (confuses users, untrustworthy data).
   - *Why We Chose This:* Configurable soft limits (ask to confirm via HTTP 409) and hard limits (reject via HTTP 422) balance data integrity with user agency.
   - *Evidence:* Configured in `backend/app/data/limits.json`, handled in `backend/app/api/activities.py`, and UI dialog in `frontend/src/pages/AddActivity.jsx`.

3. **Decision Point 3: The Week**
   - *Problem:* "When does a 'week' start, and how is mid-week progress shown? Why?"
   - *Decision:* CALENDAR WEEK, MONDAY 00:00 → SUNDAY 23:59:59 (ISO 8601), in the user's local timezone.
   - *Alternatives:* 
     - A: Rolling 7 days (makes "this week's target" ambiguous).
     - B: Sunday start (less common for work-week planning in our target geographies).
   - *Why We Chose This:* A fixed calendar week provides a clear, resetting budget cycle. Mid-week progress shows cumulative use vs target, expected pace, and days remaining.
   - *Evidence:* Implemented in `backend/app/api/target.py` (`get_week_start` and progress math) and timezone header parsing in `activities.py`.
