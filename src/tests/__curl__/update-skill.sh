#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/skill"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5MDQ5OSwiZXhwIjoxNzU5Mzk0MDk5fQ.O7YeAQ3elTdndMCPB3Thl9YbqVDXQqxHYefhY0vrt-Y" # <-- Pon aquí tu token JW
SKILL_ID_INVALIDO="123"
SKILL_ID_NO_EXISTE="0123456789abcdef01234567"

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

# Crear skill de prueba y devolver su ID
echo -e "${BLUE}📋 Creando skill de prueba para PATCH...${NC}"
SKILL_ID_VALIDO=$(curl -s -X POST "$API_URL" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Skill Test", "category": "Frontend", "level": "Beginner"}' | jq -r '._id')
if [ -z "$SKILL_ID_VALIDO" ] || [ "$SKILL_ID_VALIDO" = "null" ]; then
  echo -e "${RED}❌ ERROR: No se pudo crear skill de prueba. Verifica que el servidor esté corriendo y POST funcione.${NC}"
  exit 1
fi

echo -e "${BLUE}🚀 TESTING UPDATE SKILL ENDPOINT (PATCH)${NC}"
echo -e "${BLUE}===== Casos de validación Zod, enums y errores de negocio =====${NC}\n"

# ✅ HAPPY PATH
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "Skill Actualizada", "category": "backend", "level": "senior"}')
show_result "Test 1: Actualización válida de todos los campos" "$response" "$(echo "$response" | tail -n 1)" "200 OK"

# ❌ VALIDATION ERROR TESTS
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "", "category": "", "level": ""}')
show_result "Test 2: Campos vacíos" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (campos vacíos)"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": 123, "category": false, "level": 456}')
show_result "Test 3: Tipos incorrectos" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (tipos incorrectos)"

# ❌ ENUM ERROR TESTS
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"category": "no-existe", "level": "junior"}')
show_result "Test 4: Enum inválido en category" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (category enum inválido)"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"category": "frontend", "level": "no-existe"}')
show_result "Test 5: Enum inválido en level" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (level enum inválido)"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"category": "no-existe", "level": "no-existe"}')
show_result "Test 6: Ambos enums inválidos" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (ambos enums inválidos)"

# ❌ MULTIPLE VALIDATION ERRORS
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "", "category": "no-existe", "level": ""}')
show_result "Test 7: Múltiples errores de validación y enums" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (múltiples errores)"

# ❌ ID INVALIDO
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_INVALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "Skill"}')
show_result "Test 8: ID inválido (formato)" "$response" "$(echo "$response" | tail -n 1)" "400 - ValidationError (ID inválido)"

# ❌ ID NO EXISTE
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_NO_EXISTE \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "Skill"}')
show_result "Test 9: ID válido pero no existe en la base" "$response" "$(echo "$response" | tail -n 1)" "404 - NotFoundError"

# ❌ AUTH ERROR
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{"name": "Skill"}')
show_result "Test 10: Sin autenticación (sin cookie)" "$response" "$(echo "$response" | tail -n 1)" "401 - AuthorizationError"

# ❌ MALFORMED REQUEST
response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name": "JSON mal formado", "category": "frontend" "level": ["sin-cerrar-corchete"]}')
show_result "Test 11: JSON malformado" "$response" "$(echo "$response" | tail -n 1)" "400 - JSON Parse Error"

response=$(curl -s -w "\nStatus: %{http_code}\n" -X PATCH $API_URL/$SKILL_ID_VALIDO \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: text/plain" \
  -d 'esto-no-es-json')
show_result "Test 12: Content-Type incorrecto" "$response" "$(echo "$response" | tail -n 1)" "400 - Invalid Content-Type"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE UPDATE SKILL COMPLETADOS${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1${NC}"
echo -e "${RED}❌ Tests de error esperados: 2-12${NC}\n"

echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Actualización válida"
echo -e "   • Validation Errors: Campos vacíos, tipos incorrectos, enums inválidos"
echo -e "   • Duplicity Errors: (si aplica en tu backend)"
echo -e "   • Auth Errors: Sin autenticación"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "   • ID inválido/no existe"
