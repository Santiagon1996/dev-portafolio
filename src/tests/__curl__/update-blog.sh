#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/blog"
LOGIN_URL="http://localhost:3000/api/admin/login"
COOKIE_JAR="/tmp/test_cookies_update.txt"
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

# Login y guardar cookie
login_and_get_cookies() {
  echo -e "${BLUE}🔐 Intentando login para obtener cookies...${NC}"
  login_response=$(curl -s -w "\n%{http_code}" -c "$COOKIE_JAR" -X POST "$LOGIN_URL" \
    -H "Content-Type: application/json" \
    -d '{"username": "santiagoN", "password": "SuperSecure123"}')
  login_body=$(echo "$login_response" | head -n -1)
  login_status=$(echo "$login_response" | tail -n 1)
  if [ "$login_status" = "200" ]; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "Cookies guardadas en: $COOKIE_JAR"
    return 0
  else
    echo -e "${RED}❌ Login falló. Status: $login_status${NC}"
    echo "Response: $login_body"
    echo "🔧 SOLUCIÓN: Verifica que exista un admin con username='santiagoN' y password='SuperSecure123'"
    return 1
  fi
}

# Crear blog de prueba y devolver su ID
create_test_blog() {
  local title="$1"
  local content="$2"
  response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"$title\", \"content\": \"$content\"}")
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  if [ "$status" = "201" ]; then
    blog_id=$(echo "$body" | grep -o '"_id":"[^\"]*"' | cut -d'"' -f4)
    echo "$blog_id"
  else
    echo ""
  fi
}

# Login primero
if ! login_and_get_cookies; then
  echo -e "${RED}❌ No se pudo obtener autenticación. Abortando tests.${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Creando blog de prueba para PATCH...${NC}"
BLOG_ID_VALIDO=$(create_test_blog "Blog para update" "Este es un blog que será actualizado en las pruebas. Tiene contenido suficiente para pasar la validación mínima.")
if [ -z "$BLOG_ID_VALIDO" ]; then
  echo -e "${RED}❌ ERROR: No se pudo crear blog de prueba. Verifica que el servidor esté corriendo y POST funcione.${NC}"
  exit 1
fi

# === TESTS DE UPDATE BLOG ===
echo -e "${BLUE}🚀 TESTING UPDATE BLOG ENDPOINT (PATCH)${NC}"
echo -e "${BLUE}===== Casos de validación Zod y errores de negocio =====${NC}\n"

# ✅ HAPPY PATH

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Nuevo título válido para el blog",
      "content": "Nuevo contenido válido con más de veinte caracteres para pasar la validación."
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 1: Actualización válida de título y contenido" "$body" "$status" "200 OK"

# ❌ VALIDATION ERROR TESTS

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Hi"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 2: Título muy corto (< 5 caracteres)" "$body" "$status" "400 - ValidationError (título muy corto)"

LONG_TITLE=$(printf 'A%.0s' {1..201})
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"$LONG_TITLE\"}")
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 3: Título muy largo (> 200 caracteres)" "$body" "$status" "400 - ValidationError (título muy largo)"

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Corto"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 4: Contenido muy corto (< 20 caracteres)" "$body" "$status" "400 - ValidationError (contenido muy corto)"

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "slug": "Slug-Invalido!"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 5: Slug inválido (mayúsculas y símbolos)" "$body" "$status" "400 - ValidationError (slug inválido)"

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "publishedAt": "fecha-invalida"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 6: publishedAt inválido (no fecha)" "$body" "$status" "400 - ValidationError (fecha inválida)"

# ❌ MULTIPLE VALIDATION ERRORS

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
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

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_INVALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Título válido"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 8: ID inválido (formato)" "$body" "$status" "400 - ValidationError (ID inválido)"

# ❌ ID NO EXISTE

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_NO_EXISTE \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Título válido"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 9: ID válido pero no existe en la base" "$body" "$status" "404 - NotFoundError"

# ❌ DUPLICITY ERROR

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Guía Completa de TypeScript para Desarrolladores"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 10: Duplicidad por título" "$body" "$status" "409 - DuplicityError (título duplicado)"

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
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

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
    -H "Content-Type: application/json" \
    -d '{
      "title": "JSON mal formado",
      "content": "Contenido válido"
      "tags": ["sin-cerrar-corchete"
    }')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)
show_result "Test 13: JSON malformado" "$body" "$status" "400 - JSON Parse Error"

response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X PATCH $API_URL/$BLOG_ID_VALIDO \
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
