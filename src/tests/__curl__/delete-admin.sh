#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
API_BASE_URL="http://localhost:3000/api/admin"
ADMIN_ID="68dce63aadcf03f68135bdc0" # Cambiar por ID válido
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGNlNjNhYWRjZjAzZjY4MTM1YmRjMCIsImlhdCI6MTc1OTMwNzMzNywiZXhwIjoxNzU5MzEwOTM3fQ.egg-rhlqw1F8lOP7_lh3-yFvh-z8au-r_YaMalbFTg0" # Cambiar por JWT válido

echo -e "${BLUE}=== TESTS PARA RUTA DELETE /api/admin/[adminId] CON COOKIE ===${NC}"
echo -e "${BLUE}Admin ID: ${ADMIN_ID}${NC}\n"
# ====================================
# TEST 1: DELETE - Eliminar admin por ID (Cookie válida)
# ====================================
echo -e "${YELLOW}=== Test 1: DELETE - Cookie válida ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X DELETE "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json" \
-H "Cookie: accessToken=${ACCESS_TOKEN}"
echo -e "\n${GREEN}✅ DELETE admin con cookie válido probado${NC}\n"

# ====================================
# TEST 2: DELETE - Admin no encontrado (ID inválido)
# ====================================
echo -e "${YELLOW}=== Test 2: DELETE - ID inválido ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X DELETE "${API_BASE_URL}/673d9a6a999999999abcdef9" \
-H "Content-Type: application/json" \
-H "Cookie: accessToken=${ACCESS_TOKEN}"
echo -e "\n${GREEN}✅ DELETE con ID inválido probado${NC}\n"

# ====================================
# TEST 3: DELETE - Sin cookie de autenticación
# ====================================
echo -e "${YELLOW}=== Test 3: DELETE - Sin cookie ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X DELETE "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json"
echo -e "\n${GREEN}✅ DELETE sin cookie probado${NC}\n"
