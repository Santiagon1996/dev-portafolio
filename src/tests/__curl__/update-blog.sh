#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/blog"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5MDQ5OSwiZXhwIjoxNzU5Mzk0MDk5fQ.O7YeAQ3elTdndMCPB3Thl9YbqVDXQqxHYefhY0vrt-Y" # <-- Pon aquí tu token JW
BLOG_ID_INVALIDO="123"
BLOG_ID_NO_EXISTE="0123456789abcdef01234567"

# Helper para mostrar resultados
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


# Crear blog de prueba y devolver su ID
echo -e "${BLUE}� Creando blog de prueba para PATCH...${NC}"
BLOG_ID_VALIDO=$(curl -s -X POST "$API_URL" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Blog para update", "content": "Este es un blog que será actualizado en las pruebas. Tiene contenido suficiente para pasar la validación mínima."}' | jq -r '._id')
if [ -z "$BLOG_ID_VALIDO" ] || [ "$BLOG_ID_VALIDO" = "null" ]; then
  echo -e "${RED}❌ ERROR: No se pudo crear blog de prueba. Verifica que el servidor esté corriendo y POST funcione.${NC}"
  exit 1
fi

# === TESTS DE UPDATE BLOG ===
echo -e "${BLUE}🚀 TESTING UPDATE BLOG ENDPOINT (PATCH)${NC}"
echo -e "${BLUE}===== Casos de validación Zod y errores de negocio =====${NC}\n"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Nuevo título válido para el blog",
      "content": "Nuevo contenido válido con más de veinte caracteres para pasar la validación."
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 1: Actualización válida de título y contenido" "$body" "$status" "200 OK"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Hi"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 2: Título muy corto (< 5 caracteres)" "$body" "$status" "400 - ValidationError (título muy corto)"

LONG_TITLE=$(printf 'A%.0s' {1..201})
response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"$LONG_TITLE\"}")
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 3: Título muy largo (> 200 caracteres)" "$body" "$status" "400 - ValidationError (título muy largo)"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Corto"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 4: Contenido muy corto (< 20 caracteres)" "$body" "$status" "400 - ValidationError (contenido muy corto)"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "slug": "Slug-Invalido!"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 5: Slug inválido (mayúsculas y símbolos)" "$body" "$status" "400 - ValidationError (slug inválido)"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "publishedAt": "fecha-invalida"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 6: publishedAt inválido (no fecha)" "$body" "$status" "400 - ValidationError (fecha inválida)"

# ❌ MULTIPLE VALIDATION ERRORS

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "X",
      "content": "Y",
      "slug": "Slug-Invalido!"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 7: Múltiples errores de validación" "$body" "$status" "400 - ValidationError (múltiples errores)"

# ❌ ID INVALIDO

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_INVALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Título válido"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 8: ID inválido (formato)" "$body" "$status" "400 - ValidationError (ID inválido)"

# ❌ ID NO EXISTE

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_NO_EXISTE \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Título válido"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 9: ID válido pero no existe en la base" "$body" "$status" "404 - NotFoundError"

# ❌ DUPLICITY ERROR

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Guía Completa de TypeScript para Desarrolladores"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 10: Duplicidad por título" "$body" "$status" "409 - DuplicityError (título duplicado)"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Guía COMPLETA de TypeScript PARA desarrolladores"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 11: Duplicidad por slug generado" "$body" "$status" "409 - DuplicityError (slug duplicado)"

# ❌ AUTH ERROR

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Título válido"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 12: Sin autenticación (sin cookie)" "$body" "$status" "401 - AuthorizationError"

# ❌ MALFORMED REQUEST

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "JSON mal formado",
      "content": "Contenido válido"
      "tags": ["sin-cerrar-corchete"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 13: JSON malformado" "$body" "$status" "400 - JSON Parse Error"

response=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/$BLOG_ID_VALIDO \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: text/plain" \
  -d 'esto-no-es-json')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 14: Content-Type incorrecto" "$body" "$status" "400 - Invalid Content-Type"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE UPDATE BLOG COMPLETADOS${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1${NC}"
echo -e "${RED}❌ Tests de error esperados: 2-14${NC}\n"

echo -e "${YELLOW}� COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Actualización válida"
echo -e "   • Validation Errors: Título/contenido/slug/publishedAt inválidos"
echo -e "   • Duplicity Errors: Título y slug duplicados"
echo -e "   • Auth Errors: Sin autenticación"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "   • ID inválido/no existe"
