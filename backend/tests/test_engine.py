import json
import pytest
from decimal import Decimal
from pathlib import Path
from app.services.carbon_engine import calculate, EngineValidationError
from app.services.emission_factor_service import get_emission_factor_service

def test_emission_factors_file_exact_match():
    """Assert emission_factors.json equals the 6 values exactly."""
    path = Path("app/data/emission_factors.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    categories = data["categories"]
    
    # Assert exact factors
    assert categories["travel"]["car"]["factor"] == "0.20"
    assert categories["travel"]["car"]["unit"] == "km"
    assert categories["travel"]["bus"]["factor"] == "0.08"
    assert categories["travel"]["bus"]["unit"] == "km"
    assert categories["travel"]["flight"]["factor"] == "0.25"
    assert categories["travel"]["flight"]["unit"] == "km"
    
    assert categories["energy"]["electricity"]["factor"] == "0.80"
    assert categories["energy"]["electricity"]["unit"] == "kWh"
    
    assert categories["food"]["veg_meal"]["factor"] == "0.5"
    assert categories["food"]["veg_meal"]["unit"] == "meal"
    assert categories["food"]["non_veg_meal"]["factor"] == "2.0"
    assert categories["food"]["non_veg_meal"]["unit"] == "meal"
    
    # Assert there are only these 6
    total_activities = sum(len(acts) for acts in categories.values())
    assert total_activities == 6

def test_engine_exact_calculations():
    """
    Mandatory pytest cases (exact equality, no tolerance):
    car 10 km -> 2.00
    bus 10 km -> 0.80
    flight 100 km -> 25.00
    electricity 5 kWh -> 4.00
    veg_meal 3 -> 1.50
    non_veg_meal 2 -> 4.00
    car 0.5 km -> 0.10
    car 12.34 km -> 2.468
    """
    cases = [
        ("travel", "car", 10.0, 2.00, 20000),
        ("travel", "bus", 10.0, 0.80, 8000),
        ("travel", "flight", 100.0, 25.00, 250000),
        ("energy", "electricity", 5.0, 4.00, 40000),
        ("food", "veg_meal", 3.0, 1.50, 15000),
        ("food", "non_veg_meal", 2.0, 4.00, 40000),
        ("travel", "car", 0.5, 0.10, 1000),
        ("travel", "car", 12.34, 2.468, 24680)
    ]
    
    for cat, act, qty, expected_kg, expected_e4 in cases:
        res = calculate(act, qty)
        assert res.co2e_kg == expected_kg, f"Failed for {act} {qty} - expected {expected_kg}, got {res.co2e_kg}"
        assert res.co2e_e4 == expected_e4, f"Failed for {act} {qty} - expected e4 {expected_e4}, got {res.co2e_e4}"

def test_engine_validation_meals():
    """Meals must be a whole number >= 1."""
    with pytest.raises(EngineValidationError, match="Meals must be a whole number"):
        calculate("veg_meal", 1.5)
        
    with pytest.raises(EngineValidationError, match="greater than 0"):
        calculate("veg_meal", 0)

def test_engine_validation_decimals():
    """km and kWh accept positive numbers with up to 2 decimals."""
    with pytest.raises(EngineValidationError, match="cannot have more than 2 decimal places"):
        calculate("car", 12.345)
