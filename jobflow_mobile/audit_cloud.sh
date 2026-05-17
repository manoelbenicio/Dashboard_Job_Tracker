#!/bin/bash
echo "=== Cloud Run Services ==="
gcloud run services list --project jobflow-exec-tracker 2>&1 || echo "No Cloud Run services"

echo ""
echo "=== Cloud Functions ==="
gcloud functions list --project jobflow-exec-tracker 2>&1 || echo "No Cloud Functions"

echo ""
echo "=== Firebase Hosting ==="
firebase hosting:sites:list --project jobflow-exec-tracker 2>&1 || echo "No hosting sites"
