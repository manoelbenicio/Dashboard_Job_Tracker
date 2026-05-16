#!/bin/bash
TOKEN=$(gcloud auth print-access-token)
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://oauth2.googleapis.com/v1/projects/369876838535/oauthClients" 2>&1

echo "---"
# Alternative: check Firebase auth config
curl -s "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyBZgYqlJlAHssJixxlS1xbqimN4YliT4s8" | python3 -m json.tool 2>&1
