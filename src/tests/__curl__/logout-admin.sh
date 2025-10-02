#!/bin/bash

# Test: Logout admin (invalidate session/token)
# Usage: ./logout-admin.sh <admin_token>

ADMIN_TOKEN="${1:-}"

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Usage: $0 <admin_token>"
  exit 1
fi

curl -X POST "http://localhost:3000/api/admin/logout" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -v
