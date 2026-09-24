"""
app/services/emission_factor_service.py

Loads and validates emission_factors.json at startup (fail-fast).
Exposes typed accessors used by the carbon engine and the /meta endpoint.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import get_settings

logger = logging.getLogger(__name__)


class EmissionFactorNotFoundError(Exception):
    pass


class EmissionFactorLoadError(Exception):
    pass


class _FactorRecord:
    """Thin wrapper around a single factor dict for typed access."""

    def __init__(self, category: str, activity_type: str, data: Dict[str, Any]) -> None:
        self.category = category
        self.activity_type = activity_type
        self._d = data

    @property
    def label(self) -> str:
        return self._d["label"]

    @property
    def factor(self) -> float:
        return float(self._d["factor"])

    @property
    def unit(self) -> str:
        return self._d["unit"]

    @property
    def factor_unit(self) -> str:
        """Alias for unit – the full factor unit string, e.g. 'kg_co2e/km'."""
        return self._d["unit"]

    @property
    def accepted_input_units(self) -> List[str]:
        return self._d.get("accepted_input_units", [])

    @property
    def source(self) -> str:
        return self._d.get("source", "")

    @property
    def source_url(self) -> str:
        return self._d.get("source_url", "")

    @property
    def source_year(self) -> str:
        return str(self._d.get("source_year", ""))

    @property
    def geography(self) -> str:
        return self._d.get("geography", "")

    @property
    def notes(self) -> str:
        return self._d.get("notes", "")

    @property
    def status(self) -> str:
        return self._d.get("status", "unverified")

    @property
    def max_quantity(self) -> float:
        return float(self._d.get("max_quantity", 1_000_000))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "activity_type": self.activity_type,
            "label": self.label,
            "factor": self.factor,
            "unit": self.unit,
            "accepted_input_units": self.accepted_input_units,
            "source": self.source,
            "source_url": self.source_url,
            "source_year": self.source_year,
            "geography": self.geography,
            "notes": self.notes,
            "status": self.status,
            "max_quantity": self.max_quantity,
        }


class EmissionFactorService:
    """
    Singleton-style service loaded once at startup.
    Fails fast if the JSON is missing or malformed.
    """

    def __init__(self) -> None:
        self._raw: Dict[str, Any] = {}
        self._records: Dict[str, Dict[str, _FactorRecord]] = {}
        self._type_map: Dict[str, str] = {} # maps activity_type to category
        self._version: str = "unknown"

    def load(self, path: Optional[Path] = None) -> None:
        if path is None:
            path = get_settings().EMISSION_FACTORS_PATH

        if not path.exists():
            raise EmissionFactorLoadError(
                f"Emission factors file not found: {path}. "
                "Ensure backend/app/data/emission_factors.json exists."
            )

        try:
            with open(path, "r", encoding="utf-8") as fh:
                self._raw = json.load(fh)
        except json.JSONDecodeError as exc:
            raise EmissionFactorLoadError(
                f"Emission factors JSON is malformed: {exc}"
            ) from exc

        if "categories" not in self._raw:
            raise EmissionFactorLoadError(
                "Emission factors JSON missing top-level 'categories' key."
            )

        self._version = self._raw.get("version", "unknown")
        self._records = {}
        self._type_map = {}

        required_keys = {"label", "factor", "unit", "source"}
        for cat, activities in self._raw["categories"].items():
            self._records[cat] = {}
            for act, data in activities.items():
                missing = required_keys - data.keys()
                if missing:
                    raise EmissionFactorLoadError(
                        f"Factor [{cat}][{act}] missing required keys: {missing}"
                    )
                try:
                    float(data["factor"])
                except (TypeError, ValueError) as exc:
                    raise EmissionFactorLoadError(
                        f"Factor [{cat}][{act}] has non-numeric 'factor': {data['factor']}"
                    ) from exc

                self._records[cat][act] = _FactorRecord(cat, act, data)
                self._type_map[act] = cat

        logger.info(
            "Emission factors loaded: version=%s, categories=%s, total_activities=%d",
            self._version,
            list(self._records.keys()),
            sum(len(v) for v in self._records.values()),
        )

    @property
    def version(self) -> str:
        return self._version

    def list_categories(self) -> List[str]:
        return list(self._records.keys())

    def list_activities(self, category: str) -> List[_FactorRecord]:
        if category not in self._records:
            raise EmissionFactorNotFoundError(f"Unknown category: '{category}'")
        return list(self._records[category].values())

    def get_factor(self, category: str, activity_type: str) -> _FactorRecord:
        if category not in self._records:
            raise EmissionFactorNotFoundError(
                f"Unknown category: '{category}'. "
                f"Valid categories: {self.list_categories()}"
            )
        if activity_type not in self._records[category]:
            valid = list(self._records[category].keys())
            raise EmissionFactorNotFoundError(
                f"This activity type is currently unsupported: '{activity_type}'. "
                f"Valid types for '{category}': {valid}"
            )
        return self._records[category][activity_type]

    def get_factor_by_type(self, activity_type: str) -> _FactorRecord:
        category = self._type_map.get(activity_type)
        if not category:
            raise EmissionFactorNotFoundError(
                f"Unknown activity type: '{activity_type}'. "
                f"Valid types: {list(self._type_map.keys())}"
            )
        return self._records[category][activity_type]

    def all_factors(self) -> List[Dict[str, Any]]:
        result = []
        for cat_records in self._records.values():
            for rec in cat_records.values():
                result.append(rec.to_dict())
        return result


# Module-level singleton – loaded in main.py lifespan
_service: Optional[EmissionFactorService] = None


def get_emission_factor_service() -> EmissionFactorService:
    global _service
    if _service is None:
        _service = EmissionFactorService()
        _service.load()
    return _service
