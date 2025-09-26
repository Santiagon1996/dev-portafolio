#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/admin/login"

echo -e "${BLUE}=== TESTS PARA LOGIN DE ADMIN ===${NC}\n"

# ====================================
# TEST 1: Login válido
# ====================================
echo -e "${YELLOW}=== Test 1: Login válido ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "santiagoN",
  "password": "SuperSecure123"
}'
echo -e "\n${GREEN}✅ Login válido probado${NC}\n"

# ====================================
# TEST 2: Error de validación (campos vacíos)
# ====================================
echo -e "${YELLOW}=== Test 2: Error de validación (campos vacíos) ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "",
  "password": ""
}'
echo -e "\n${GREEN}✅ Validación con errores probada${NC}\n"

# ====================================
# TEST 3: Credenciales incorrectas (password erróneo)
# ====================================
echo -e "${YELLOW}=== Test 3: Credenciales incorrectas (password erróneo) ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "santiagoN",
  "password": "passwordIncorrecta"
}'
echo -e "\n${GREEN}✅ Credenciales incorrectas probadas${NC}\n"

# ====================================
# TEST 4: Usuario no existente
# ====================================
echo -e "${YELLOW}=== Test 4: Usuario no existente ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "usuarioInexistente",
  "password": "CualquierPassword123"
}'
echo -e "\n${GREEN}✅ Usuario no existente probado${NC}\n"

# ====================================
# TEST 5: Error de validación (campos faltantes)
# ====================================
echo -e "${YELLOW}=== Test 5: Error de validación (campos faltantes) ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "santiagoN"
}'
echo -e "\n${GREEN}✅ Campos faltantes probado${NC}\n"

# ====================================
# TEST 6: Error de validación (datos demasiado cortos)
# ====================================
echo -e "${YELLOW}=== Test 6: Error de validación (datos demasiado cortos) ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "username": "ab",
  "password": "12"
}'
echo -e "\n${GREEN}✅ Datos demasiado cortos probado${NC}\n"

# ====================================
# TEST 7: Petición sin Content-Type
# ====================================
echo -e "${YELLOW}=== Test 7: Petición sin Content-Type ===${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" -X POST $API_URL \
-d '{
  "username": "santiagoN",
  "password": "SuperSecure123"
}'
echo -e "\n${GREEN}✅ Sin Content-Type probado${NC}\n"

echo -e "${BLUE}=== TODOS LOS TESTS DE LOGIN COMPLETADOS ===${NC}"
echo -e "${BLUE}📝 INSTRUCCIONES:${NC}"
echo -e "1. Asegúrate de tener un admin creado con las credenciales del Test 1"
echo -e "2. Copia el token JWT del Test 1 para usar en admin-by-id.sh"
echo -e "3. Ejecuta: ${YELLOW}bash set-admin.sh${NC}"
