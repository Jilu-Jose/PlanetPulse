"""tests/test_api.py"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

SESSION_ID = "test-session-uuid-1234"

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_get_meta_factors(client):
    res = client.get("/api/meta/factors")
    assert res.status_code == 200
    data = res.json()
    assert "categories" in data
    assert "travel" in data["categories"]
    assert len(data["categories"]["travel"]) > 0


def test_create_activity_valid(client):
    payload = {
        "activity_type": "car",
        "quantity": 10.0
    }
    res = client.post("/api/activities", json=payload, headers={"X-Session-Id": SESSION_ID})
    assert res.status_code == 201
    data = res.json()
    assert data["co2e_kg"] > 0
    assert "factor_source" in data


def test_create_activity_missing_session(client):
    payload = {
        "activity_type": "car",
        "quantity": 10.0
    }
    res = client.post("/api/activities", json=payload)
    assert res.status_code == 422  # Missing header


def test_create_activity_negative_quantity(client):
    payload = {
        "activity_type": "car",
        "quantity": -5.0
    }
    res = client.post("/api/activities", json=payload, headers={"X-Session-Id": SESSION_ID})
    assert res.status_code == 422


def test_create_activity_unknown_type(client):
    payload = {
        "activity_type": "spaceship",
        "quantity": 10.0
    }
    res = client.post("/api/activities", json=payload, headers={"X-Session-Id": SESSION_ID})
    assert res.status_code == 400


def test_list_activities(client):
    res = client.get("/api/activities", headers={"X-Session-Id": SESSION_ID})
    assert res.status_code == 200
    data = res.json()
    assert "items" in data


def test_dashboard_empty(client):
    res = client.get("/api/dashboard?range=today", headers={"X-Session-Id": "empty-session"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_co2e_kg"] == 0.0

