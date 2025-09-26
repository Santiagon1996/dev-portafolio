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

echo -e "${BLUE}=== TESTS PARA RUTA PATCH /api/admin/[adminId] ===${NC}"
echo -e "${BLUE}Admin ID: ${ADMIN_ID}${NC}\n"

# ====================================
# TEST 1: PATCH - Actualizar username, password y otros campos
# ====================================
echo -e "${YELLOW}=== Test 1: PATCH - Actualización completa ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X PATCH "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json" \
-H "Cookie: accessToken=${ACCESS_TOKEN}" \
-d '{
    "username": "nuevo_usuario1",
    "password": "NuevaPassword1",
    "email": "nuevoemail1@example.com"
}'
echo -e "\n${GREEN}✅ PATCH con cambio de username y password probado${NC}\n"

# ====================================
# TEST 2: PATCH - Sin cookie de autenticación
# ====================================
echo -e "${YELLOW}=== Test 2: PATCH - Sin cookie ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X PATCH "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json" \
-d '{
    "username": "hack_sin_cookie",
    "password": "NoDeberiaFuncionar"
}'
echo -e "\n${GREEN}✅ PATCH sin autenticación probado${NC}\n"

# ====================================
# TEST 3: PATCH - Datos inválidos (password vacía)
# ====================================
echo -e "${YELLOW}=== Test 3: PATCH - Datos inválidos ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" \
-X PATCH "${API_BASE_URL}/${ADMIN_ID}" \
-H "Content-Type: application/json" \
-H "Cookie: accessToken=${ACCESS_TOKEN}" \
-d '{
    "username": "usuario_invalido",
    "password": ""
}'
echo -e "\n${GREEN}✅ PATCH con password inválida probado${NC}\n"
