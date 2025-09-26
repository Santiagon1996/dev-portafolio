#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
API_BASE_URL="http://localhost:3000/api/admin"
ADMIN_ID="689ca7fde08e767644b5eaf2" # Cambiar por ID válido
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWNhN2ZkZTA4ZTc2NzY0NGI1ZWFmMiIsImlhdCI6MTc1NTA5NzEzOSwiZXhwIjoxNzU1MTAwNzM5fQ.uinYByDnbKDJLccI1wJPrauYdqbz3GHSWtB7A8xyMQM" # Cambiar por JWT válido

echo -e "${BLUE}=== TESTS PARA RUTA GET /api/admin/[adminId] CON COOKIE ===${NC}"
echo -e "${BLUE}Admin ID: ${ADMIN_ID}${NC}\n"

# ====================================
# TEST 1: GET - Obtener admin por ID (Cookie válida)
# ====================================
echo -e "${YELLOW}=== Test 1: GET - Cookie válida ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X GET "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json" \
-H "Cookie: accessToken=${ACCESS_TOKEN}"
echo -e "\n${GREEN}✅ GET admin con cookie válido probado${NC}\n"

# ====================================
# TEST 2: GET - Admin no encontrado (ID inválido)
# ====================================
echo -e "${YELLOW}=== Test 2: GET - ID inválido ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X GET "${API_BASE_URL}/673d9a6a999999999abcdef9" \
-H "Content-Type: application/json" \
-H "Cookie: accessToken=${ACCESS_TOKEN}"
echo -e "\n${GREEN}✅ GET con ID inválido probado${NC}\n"

# ====================================
# TEST 3: GET - Sin cookie de autenticación
# ====================================
echo -e "${YELLOW}=== Test 3: GET - Sin cookie ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X GET "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json"
echo -e "\n${GREEN}✅ GET sin cookie probado${NC}\n"
