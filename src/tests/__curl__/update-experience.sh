#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/experience"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5MDQ5OSwiZXhwIjoxNzU5Mzk0MDk5fQ.O7YeAQ3elTdndMCPB3Thl9YbqVDXQqxHYefhY0vrt-Y" # <-- Pon aquí tu token JW
EXP_ID_INVALIDO="123"
EXP_ID_NO_EXISTE="0123456789abcdef01234567"

show_result() {
  local test_name="$1"
  local response="$2"
  local status="$3"
  local expected="$4"
  echo -e "${YELLOW}$test_name${NC}"
  echo -e "Response: $response"
  echo -e "Status: $status"
  echo -e "${GREEN}Esperado: $expected${NC}\n"
}

# Crear experiencia de prueba y devolver su ID
echo -e "${BLUE}📋 Creando experiencia de prueba para PATCH...${NC}"
EXP_ID_VALIDO=$(curl -s -X POST "$API_URL" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"company": "Empresa Test", "position": "Desarrollador","role": "QA", "startDate": "2020-01-01", "endDate": "2021-01-01", "description": "Experiencia inicial para test."}' | jq -r '._id')
if [ -z "$EXP_ID_VALIDO" ] || [ "$EXP_ID_VALIDO" = "null" ]; then
  echo -e "${RED}❌ ERROR: No se pudo crear experiencia de prueba. Verifica que el servidor esté corriendo y POST funcione.${NC}"
  exit 1
fi

echo -e "${BLUE}🚀 TESTING UPDATE EXPERIENCE ENDPOINT (PATCH)${NC}"
echo -e "${BLUE}===== Casos de validación Zod y errores de negocio =====${NC}\n"

# ✅ HAPPY PATH
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": "Empresa Actualizada", "position": "Senior Dev", "startDate": "2021-02-01", "endDate": "2022-02-01", "description": "Experiencia actualizada para test."}')
show_result "Test 1: Actualización válida de todos los campos" "$response" "$(echo "$response" | tail -n 1)" "200 OK"

# ❌ VALIDATION ERROR TESTS
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": "", "position": "", "startDate": "", "endDate": "", "description": ""}')
show_result "Test 2: Campos vacíos" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (campos vacíos)"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": 123, "position": false, "startDate": {}, "endDate": [], "description": 456}')
show_result "Test 3: Tipos incorrectos" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (tipos incorrectos)"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"startDate": "2023-01-01", "endDate": "2022-01-01"}')
show_result "Test 4: startDate > endDate" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (rango de fechas)"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"startDate": "fecha-invalida", "endDate": "otra-invalida"}')
show_result "Test 5: Fechas inválidas" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (fechas inválidas)"

# ❌ MULTIPLE VALIDATION ERRORS
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": "", "position": "", "startDate": "fecha"}')
show_result "Test 6: Múltiples errores de validación" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (múltiples errores)"

# ❌ ID INVALIDO
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_INVALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": "Empresa"}')
show_result "Test 7: ID inválido (formato)" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (ID inválido)"

# ❌ ID NO EXISTE
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_NO_EXISTE \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": "Empresa"}')
show_result "Test 8: ID válido pero no existe en la base" "$response" "$(echo "$response" | tail -n 1)" "404 - NotFoundError"

# ❌ AUTH ERROR
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{"company": "Empresa"}')
show_result "Test 9: Sin autenticación (sin cookie)" "$response" "$(echo "$response" | tail -n 1)" "401 - AuthorizationError"

# ❌ MALFORMED REQUEST
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"company": "JSON mal formado", "position": "Dev" "startDate": ["sin-cerrar-corchete"]}')
show_result "Test 10: JSON malformado" "$response" "$(echo "$response" | tail -n 1)" "400 - JSON Parse Error"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$EXP_ID_VALIDO \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: text/plain" \
  -d 'esto-no-es-json')
show_result "Test 11: Content-Type incorrecto" "$response" "$(echo "$response" | tail -n 1)" "400 - Invalid Content-Type"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE UPDATE EXPERIENCE COMPLETADOS${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1${NC}"
echo -e "${RED}❌ Tests de error esperados: 2-11${NC}\n"

echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Actualización válida"
echo -e "   • Validation Errors: Campos vacíos, tipos incorrectos, rango de fechas, fechas inválidas"
echo -e "   • Duplicity Errors: (si aplica en tu backend)"
echo -e "   • Auth Errors: Sin autenticación"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "   • ID inválido/no existe"
