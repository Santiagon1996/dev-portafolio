#!/bin/bash

# Test 8 específico: título vacío (debería devolver ValidationError 400)
echo "🔍 Test 8: Título vacío (ValidationError esperado)"

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -d '{"title": "", "content": "Este es el contenido del blog"}')

body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)

echo "Status: $status_code"
echo "Response: $body"

# Verificar si es ValidationError 400 en lugar de SystemError 500
if [ "$status_code" == "400" ]; then
    echo "✅ Test 8 PASSED: Correcto ValidationError 400"
elif [ "$status_code" == "500" ]; then
    echo "❌ Test 8 FAILED: Aún devuelve SystemError 500"
else
    echo "⚠️ Test 8 UNEXPECTED: Status $status_code"
fi

echo ""
