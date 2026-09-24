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
