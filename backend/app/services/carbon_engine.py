"""
app/services/carbon_engine.py

Pure deterministic CO₂e calculation engine.
NO I/O other than reading from the factor service.
NO LLM imports.  NO side effects.

All arithmetic uses Python's decimal.Decimal for precision.
Store CO2e as an integer in units of 0.0001 kg (co2e_e4).
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from typing import Optional

from app.services.emission_factor_service import (
    EmissionFactorNotFoundError,
    get_emission_factor_service,
)


@dataclass
class CalculationResult:
    category: str
    activity_type: str
    label: str
    input_quantity: float
    unit: str
    emission_factor_str: str
    factor_source: str
    co2e_kg: float
    co2e_e4: int
    formula_string: str
    calculated_at: str  # UTC ISO-8601


class EngineValidationError(ValueError):
    """Raised for bad inputs; mapped to HTTP 422 in the API layer."""


def _validate_quantity(quantity: float, unit: str) -> Decimal:
    """Return a Decimal or raise EngineValidationError."""
    try:
        d = Decimal(str(quantity))
    except InvalidOperation:
        raise EngineValidationError("Quantity must be a valid number.")

    if d.is_nan() or d.is_infinite():
        raise EngineValidationError("Quantity must be a finite number.")
    if d <= 0:
        raise EngineValidationError("Quantity must be greater than 0.")

    if unit == "meal":
        if d % 1 != 0:
            raise EngineValidationError("Meals must be a whole number.")
    else:
        # Check max 2 decimal places for km / kWh
        if d.as_tuple().exponent < -2:
            raise EngineValidationError("Quantity cannot have more than 2 decimal places.")

    return d


def calculate(
    activity_type: str,
    quantity: float,
) -> CalculationResult:
    """
    Calculate CO₂e for a single activity.

    Raises:
        EngineValidationError – bad inputs (quantity, unit)
        EmissionFactorNotFoundError – unknown category / activity_type
    """
    svc = get_emission_factor_service()
    rec = svc.get_factor_by_type(activity_type)  # may raise

    d_qty = _validate_quantity(quantity, rec.unit)
    factor_str = str(rec._d["factor"]) # from the dict to keep string precision
    factor_d = Decimal(factor_str)

    # co2e_d = quantity * factor
    co2e_d = d_qty * factor_d
    
    # Store CO2 as an integer in units of 0.0001 kg (co2e_e4)
    # So we multiply by 10,000 and round to nearest integer.
    co2e_e4_d = (co2e_d * Decimal("10000")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    co2e_e4 = int(co2e_e4_d)

    co2e_kg = float(co2e_d)

    formula = (
        f"{float(d_qty):.2f}".rstrip("0").rstrip(".") + f" {rec.unit}"
        + f" × {factor_str} kg CO₂/{rec.unit}"
        + f" = {co2e_kg:.2f} kg CO₂"
    )

    return CalculationResult(
        category=rec.category,
        activity_type=activity_type,
        label=rec.label,
        input_quantity=float(d_qty),
        unit=rec.unit,
        emission_factor_str=factor_str,
        factor_source=rec.source,
        co2e_kg=co2e_kg,
        co2e_e4=co2e_e4,
        formula_string=formula,
        calculated_at=datetime.now(timezone.utc).isoformat(),
    )
