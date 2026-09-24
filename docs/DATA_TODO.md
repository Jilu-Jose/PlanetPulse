# DATA_TODO.md – Unverified / Pending Emission Factors

This file tracks every emission factor that needs additional verification before
the PlanetPulse dataset can be considered authoritative.

---

## Status as of 2024-01

All current factors in `emission_factors.json` have been assigned status
**"verified"** — meaning the numeric value was checked against the cited
publication before inclusion.

No entries are currently **"unverified"**.

---

## Items Flagged for Future Review

| Activity | Current Factor | Concern | Action Required |
|---|---|---|---|
| `food.vegetarian_meal` / `food.vegan_meal` | 2.5 / 1.5 kg CO₂e/meal | Derived by dividing per-day dietary totals from Scarborough et al. 2023 by 3 meals. This is an approximation. | Find a per-meal factor from a primary source or document the derivation more precisely. |
| `travel.electric_vehicle` | 0.0532 kg/km | Based on UK grid 2023. India EV users would have a factor closer to 0.23 kg/km (using grid_india intensity × EV efficiency). | Add a region-specific EV factor for India and other geographies. |
| `food.fish_farmed` | 13.6 kg/kg | Poore & Nemecek covers farmed fish but the range across species is wide (salmon ~6.0, shrimp ~18.0). | Add species-specific fish entries. |
| All food factors | Various | Poore & Nemecek (2018) data is 5+ years old. More recent meta-analyses may exist. | Review Clark et al. (2022) and GHG Protocol food datasets on next annual review. |
| `electricity.grid_india` | 0.716 kg/kWh | CEA baseline FY2021-22; grid is decarbonising rapidly. | Update when CEA publishes FY 2023-24 baseline. |

---

## How to Add a Verified Factor

1. Find the primary source (government GHG report, peer-reviewed journal, official body).
2. Note the exact table row / figure / page.
3. Add the entry to `emission_factors.json` with `"status": "verified"`.
4. Remove or update the row in this file.
5. Add an entry to `DECISIONS.md` if the choice of source required a trade-off.
