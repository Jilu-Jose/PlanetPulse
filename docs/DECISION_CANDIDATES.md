# Architecture Decision Candidates

This log tracks architectural and engineering decisions that are not part of the strict business domain rules (which are in `DECISIONS.md`), but are important engineering choices made during development.

## 1. LLM Parsing: Two-Stage vs Single-Stage
**Candidate**: Use a single-stage LLM prompt that returns JSON, or a two-stage process where LLM extracts raw text spans and Python parses them.
**Decision**: Single-stage LLM with JSON schema enforcement + deterministic Python fallback.
**Rationale**: Modern LLMs are highly capable of outputting structured JSON. We enforce the schema via Pydantic on the backend. This reduces latency compared to a two-stage LLM approach.

## 2. Map Forecasting: Prophet vs. Holt Smoothing
**Candidate**: Use Facebook Prophet vs. custom Damped-trend Holt exponential smoothing.
**Decision**: Custom Damped-trend Holt exponential smoothing.
**Rationale**: Prophet requires heavy dependencies (`pystan`, `prophet`) which inflate the Docker image and complicate deployment. For a 7-day horizon on daily data, a clean Python implementation of Holt-Winters provides excellent performance with zero external dependencies and guaranteed deterministic execution via grid search.

## 3. Map Data Aggregation: Real-time vs. Pre-computed Materialized View
**Candidate**: Query `Activity` table in real-time vs. updating a materialized view or daily summary table.
**Decision**: Real-time aggregation with 60-second API-level caching.
**Rationale**: At the current scale, Postgres/SQLite can handle aggregating 60 days of data in milliseconds. Adding a materialized view adds complexity to the write path (cache invalidation/triggers). A simple 60-second TTL cache in memory protects the DB from traffic spikes while keeping the architecture simple.

## 4. Voice Input: Web Speech API vs. Whisper Backend
**Candidate**: Send raw audio to the backend (e.g., OpenAI Whisper) vs. using the browser's native Web Speech API.
**Decision**: Web Speech API.
**Rationale**: Zero cost, zero latency, no audio file transmission required. If the browser lacks support, the UI degrades gracefully to text-only input, maintaining the core requirement.
