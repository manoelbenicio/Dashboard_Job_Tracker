#!/bin/bash
set -e

PROJECT_ID="jobflow-exec-tracker"
APP_ID="1:369876838535:android:777e77882f172400493022"
SHA_HASH="A4:61:5F:46:33:02:13:D5:45:F4:4A:2F:3F:17:C1:9E:BE:3A:3D:81"

echo "=== Setting quota project ==="
gcloud auth application-default set-quota-project "$PROJECT_ID" 2>/dev/null || true

echo "=== Adding SHA-1 fingerprint to Firebase Android App ==="
echo "Project: $PROJECT_ID"
echo "App ID: $APP_ID"
echo "SHA-1: $SHA_HASH"
echo ""

TOKEN=$(gcloud auth print-access-token)

curl -s -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  -d "{\"shaHash\": \"${SHA_HASH}\", \"certType\": \"SHA_1\"}" \
  "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/androidApps/${APP_ID}/sha"

echo ""
echo "=== Done ==="
