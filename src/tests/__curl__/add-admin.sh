#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/admin/register"

echo -e "${YELLOW}=== Test 1: Crear admin válido ===${NC}"
curl -s -w "\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "santiagoN",
  "email": "santiago@example.com",
  "password": "SuperSecure123"
}'
echo -e "\n${GREEN}✅ Admin válido probado${NC}\n"

echo -e "${YELLOW}=== Test 2: Error de validación (email y password inválidos) ===${NC}"
curl -s -w "\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "sn",
  "email": "correo-no-valido",
  "password": "123"
}'
echo -e "\n${GREEN}✅ Validación con errores probada${NC}\n"

echo -e "${YELLOW}=== Test 3: Error de duplicado (usuario ya existente) ===${NC}"
curl -s -w "\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "santiagoN",
  "email": "santiago@example.com",
  "password": "OtroPass456"
}'
echo -e "\n${GREEN}✅ Duplicado probado${NC}\n"
