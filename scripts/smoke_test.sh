#!/usr/bin/env bash
set -e

API_URL="http://localhost:8000/api"
SESSION_ID="smoke-test-session-$(date +%s)"

echo "Starting Smoke Test..."

echo "1. Log an activity (Car 10 km)..."
curl -s -X POST "$API_URL/activities" \
  -H "X-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "car", "quantity": 10}' > /dev/null

echo "2. Expecting 422 on 500,000 km Car trip..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/activities" \
  -H "X-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "car", "quantity": 500000}')
if [ "$STATUS" != "422" ]; then
    echo "FAILED: Expected 422, got $STATUS"
    exit 1
fi
echo "Got 422 as expected."

echo "3. Set weekly target (15 kg)..."
curl -s -X PUT "$API_URL/target" \
  -H "X-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"target_kg": 15}' > /dev/null

echo "4. Read target progress..."
curl -s -X GET "$API_URL/target/progress" \
  -H "X-Session-Id: $SESSION_ID" > /dev/null

echo "5. Filter history (types=car)..."
curl -s -X GET "$API_URL/activities?types=car" \
  -H "X-Session-Id: $SESSION_ID" > /dev/null

echo "Smoke test passed successfully!"

echo ""
echo "=== Phase 8A: Quick Log (Parse & Batch) ==="

echo "1. Parsing natural language..."
PARSE_RESP=$(curl -s -X POST $BASE_URL/api/activities/parse \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"text": "I drove 15km and had a veg meal", "source": "text"}')

echo "$PARSE_RESP" | grep -q "car"
if [ $? -ne 0 ]; then
    echo "❌ Phase 8A Parse failed"
    exit 1
fi
echo "✅ Parse OK"

echo "2. Batch Logging..."
BATCH_RESP=$(curl -s -X POST $BASE_URL/api/activities/batch \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"items": [{"activity_type": "car", "quantity": 15.0, "occurred_on": "2023-10-10", "confirm_unusual": false}], "source": "text"}')

echo "$BATCH_RESP" | grep -q "logged"
if [ $? -ne 0 ]; then
    echo "❌ Phase 8A Batch log failed"
    exit 1
fi
echo "✅ Batch Log OK"

echo ""
echo "=== Phase 8B: Map Telemetry ==="
echo "1. Opting into Map..."
curl -s -X PUT $BASE_URL/api/profile/region \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"region_id": "delhi", "share_to_map": true}' > /dev/null
echo "✅ Opted in"

echo "2. Fetching Map Regions..."
MAP_RESP=$(curl -s -X GET $BASE_URL/api/map/regions?offset=0 \
  -H "x-session-id: $SESSION_ID")

echo "$MAP_RESP" | grep -q "delhi"
if [ $? -ne 0 ]; then
    echo "❌ Phase 8B Map Regions failed"
    exit 1
fi
echo "✅ Map Regions OK"

echo ""
echo "All smoke tests passed!"
