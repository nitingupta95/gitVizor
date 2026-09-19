#!/bin/bash

# Configuration
URL="http://localhost:3000/api/webhook/stripe"
USER_ID=$1
CREDITS=${2:-100}

if [ -z "$USER_ID" ]; then
    echo "Usage: ./test-webhook.sh <USER_ID> [CREDITS]"
    echo "Example: ./test-webhook.sh user_2rk..."
    exit 1
fi

echo "Simulating Stripe Webhook for User: $USER_ID with $CREDITS credits..."

# Note: This will fail signature verification because we don't have the secret,
# BUT it will prove the endpoint is hit and the logic is reachable.
# To do a REAL test, use 'stripe trigger checkout.session.completed'

curl -X POST "$URL" \
     -H "Content-Type: application/json" \
     -H "stripe-signature: t=123,v1=123" \
     -d '{
  "id": "evt_test",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "client_reference_id": "'"$USER_ID"'",
      "metadata": {
        "credits": "'"$CREDITS"'"
      }
    }
  }
}'

echo -e "\n\nCheck your terminal running 'npm run dev' for logs."
