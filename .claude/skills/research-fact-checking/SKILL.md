---
name: research-fact-checking
description: Use when adding or editing any statistic, date, place, species or factual claim in this project (src/content/*) — sourcing rules, source data structure, and how to handle unverified claims.
---

# Research & fact-checking (project rules)

Every meaningful number has: **value, unit, year/period, geographic scope, sourceId**. Sources have: organization, title, year, URL, accessed date. Data lives in `src/content/facts.ts` and `src/content/sources.ts`; components only reference fact ids.

Preferred sources: FAO (FRA 2025/2020, SOFO), UNEP, UNDP, World Bank, Forest Research (UK), Japan Forestry Agency, Government of Uzbekistan / UN agencies, NASA Earth Observatory, peer-reviewed literature.

Rules:
- Never invent statistics, citations or URLs. Never copy a number because it appeared in the original school text — that paragraph is a topic seed only.
- If a claim cannot be verified, rewrite it qualitatively in the narrative and add it to `RESEARCH_GAPS` in `src/content/facts.ts` with what is missing.
- Distinguish definitions: "forest" (FAO: >0.5 ha, >10% canopy, trees >5 m) vs "woodland" (UK Forestry Statistics) vs "green cover"/"protective plantations" (Aral seabed). Say which one is used.
- Official government claims (e.g. hectares planted on the Aral seabed) are labelled as reported figures ("rasmiy ma’lumotlarga ko‘ra") and paired with nuance on survival/limits.
- Fact `confidence`: `verified` (primary source seen), `reported` (official claim, not independently verified), `secondary`.
- When a fact changes, update the source `accessed` date.
