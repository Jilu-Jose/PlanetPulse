# PlanetPulse Required Features

1. **Required Feature 1: Log an Activity**
   - *Description:* Allows users to log travel, energy, or food activities. Validates input based on plausibility limits (DP2) and prevents logging future or >365-day old activities.
   - *Frontend:* Add Activity form with activity dropdown (6 types with icons), auto-set unit label, quantity input, and date picker (defaults to today). Confirmation dialog for unusual entries.
   - *Backend:* `POST /api/activities` handles unit parsing, exact calculations via carbon engine, limit checks, and returns the saved activity + target status change for DP1 nudge.
   - *Database:* Stores in `activities` table with Decimal CO₂e precision (`co2e_e4`).
   - *Testing:* Tested limits (409, 422), boundary tests on dates, exact DB saving.

2. **Required Feature 2: CO₂ Calculation**
   - *Description:* Backend deterministic engine to calculate CO₂e with no float drift.
   - *Frontend:* UI never computes emissions, only displays `formula_string` from API.
   - *Backend:* `carbon_engine.calculate()` uses Python `Decimal` and fixed factors from `emission_factors.json`.
   - *Database:* Factors driven by JSON; calculation results stored as integers (in 0.0001 kg units).
   - *Testing:* Tested via `backend/tests/test_engine.py` using mandatory test cases (e.g. car 10 km -> 2.00, flight 100 km -> 25.00).

3. **Required Feature 3: Dashboard**
   - *Description:* Aggregates the user's footprint over a selected range (today, week, month) and compares vs previous period.
   - *Frontend:* Dashboard with total footprint hero number, per-category breakdown chart and table, top contributors list, footprint trend, and weekly target card.
   - *Backend:* `GET /api/dashboard?range=...` calculates exact SQL SUMs and handles date ranges based on local user timezone.
   - *Database:* Group by category and date for aggregation.
   - *Testing:* API tests for the various `range` inputs.

4. **Required Feature 4: Weekly Target**
   - *Description:* Lets the user set a weekly carbon budget (kg) and tracks their progress.
   - *Frontend:* WeeklyTargetCard with a progress bar, expected pace marker, and a TargetForm modal to update.
   - *Backend:* `PUT /api/target` upserts a row for the *current* calendar week. `GET /api/target/progress` computes pacing, thresholds, and provides a rule-based deterministic suggestion if exceeded.
   - *Database:* `weekly_targets` table (session_id, target_kg, effective_week_start).
   - *Testing:* Pacing math and edge case threshold boundary testing (79.99, 80, 100).

5. **Required Feature 5: History & Filter**
   - *Description:* Filterable list of all logged activities with delete capability.
   - *Frontend:* Type filter chips, date-range presets (week, month), paginated table (desktop) / cards (mobile), delete confirmation.
   - *Backend:* `GET /api/activities` with server-side filters and pagination. `DELETE /api/activities/{id}`.
   - *Database:* Ordered by `occurred_on desc, created_at desc`. Total filtered CO₂e computed accurately.
   - *Testing:* Filter combination and pagination boundaries.
