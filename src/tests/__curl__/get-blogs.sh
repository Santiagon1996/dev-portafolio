#!/bin/bash

# Test completo para GET /api/blog - getAllBlogs
# Basado en la lógica de getAllBlogs.ts con paginación y filtros

BASE_URL="http://localhost:3000/api/blog"

echo "🚀 TESTING GET BLOGS ENDPOINT"
echo "===== Basado en casos de getAllBlogs.ts ====="
echo ""

# Función helper para mostrar resultados
show_result() {
    local test_name="$1"
    local response="$2"
    local status="$3"
    local expected="$4"
    
    echo "$test_name"
    echo "Response: $response"
    echo "Status: $status"
    echo "✅ Esperado: $expected"
    echo ""
}

echo "✅ === BASIC FUNCTIONALITY TESTS ==="
echo ""

# Test 1: GET básico - todos los blogs (sin parámetros)
echo "Test 1: GET básico - todos los blogs (sin parámetros)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 1: GET básico" "$body" "$status_code" "200 OK - Lista con estructura {blogs, total, page, totalPages}"

# Test 2: GET con paginación básica
echo "Test 2: GET con paginación básica (page=1, limit=5)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=1&limit=5")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 2: Paginación básica" "$body" "$status_code" "200 OK - Máximo 5 blogs"

# Test 3: GET página específica
echo "Test 3: GET página específica (page=2)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=2&limit=3")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 3: Página específica" "$body" "$status_code" "200 OK - Página 2 con 3 blogs máximo"

echo ""
echo "🔍 === FILTERING TESTS ==="
echo ""

# Test 4: Filtrar por isPublished=true
echo "Test 4: Filtrar por blogs publicados (isPublished=true)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?isPublished=true")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 4: Solo publicados" "$body" "$status_code" "200 OK - Solo blogs con isPublished=true"

# Test 5: Filtrar por isPublished=false
echo "Test 5: Filtrar por borradores (isPublished=false)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?isPublished=false")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 5: Solo borradores" "$body" "$status_code" "200 OK - Solo blogs con isPublished=false"

# Test 6: Filtrar por autor
echo "Test 6: Filtrar por autor específico"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?author=Santiago")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 6: Por autor" "$body" "$status_code" "200 OK - Solo blogs del autor Santiago"

# Test 7: Filtrar por tags (un tag)
echo "Test 7: Filtrar por un tag específico"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?tags=javascript")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 7: Por un tag" "$body" "$status_code" "200 OK - Blogs que contengan tag 'javascript'"

# Test 8: Filtrar por múltiples tags
echo "Test 8: Filtrar por múltiples tags"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?tags=javascript,typescript,react")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 8: Por múltiples tags" "$body" "$status_code" "200 OK - Blogs que contengan cualquiera de esos tags"

echo ""
echo "🔗 === COMBINATION TESTS ==="
echo ""

# Test 9: Combinación de filtros
echo "Test 9: Combinación completa (published + author + tags + paginación)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=1&limit=10&isPublished=true&author=Santiago&tags=javascript,react")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 9: Combinación completa" "$body" "$status_code" "200 OK - Blogs que cumplan todos los criterios"

# Test 10: Paginación avanzada
echo "Test 10: Paginación límite alto"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=1&limit=100")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 10: Límite alto" "$body" "$status_code" "200 OK - Hasta 100 blogs"

echo ""
echo "⚡ === EDGE CASE TESTS ==="
echo ""

# Test 11: Página que no existe
echo "Test 11: Página que no existe (page=999)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=999")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 11: Página inexistente" "$body" "$status_code" "200 OK - Array vacío pero estructura válida"

# Test 12: Parámetros inválidos (page=0)
echo "Test 12: Página inválida (page=0)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=0")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 12: Página 0" "$body" "$status_code" "200 OK - Debería tratar como página 1"

# Test 13: Limit=0
echo "Test 13: Límite cero (limit=0)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?limit=0")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 13: Límite 0" "$body" "$status_code" "200 OK - Array vacío"

# Test 14: Parámetros con caracteres especiales
echo "Test 14: Tags con espacios y caracteres especiales"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?tags=java%20script,node.js")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 14: Caracteres especiales" "$body" "$status_code" "200 OK - Manejo correcto de URL encoding"

# Test 15: Autor vacío
echo "Test 15: Autor como string vacío"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?author=")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 15: Autor vacío" "$body" "$status_code" "200 OK - Debería ignorar filtro de autor"

echo ""
echo "🛠️ === MALFORMED REQUEST TESTS ==="
echo ""

# Test 16: Parámetros con formato incorrecto
echo "Test 16: isPublished con valor inválido"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?isPublished=maybe")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 16: isPublished inválido" "$body" "$status_code" "200 OK - Debería tratar como false"

# Test 17: Page y limit no numéricos
echo "Test 17: Page y limit no numéricos"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=abc&limit=xyz")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 17: Parámetros no numéricos" "$body" "$status_code" "200 OK - Debería usar defaults (page=1, limit=10)"

echo ""
echo "==============================================="
echo "🏁 TESTS DE GET BLOGS COMPLETADOS (17 tests)"
echo "==============================================="
echo ""
echo "✅ Funcionalidad básica: 1, 2, 3 (3 tests)"
echo "🔍 Tests de filtrado: 4, 5, 6, 7, 8 (5 tests)"
echo "🔗 Tests de combinación: 9, 10 (2 tests)"
echo "⚡ Casos límite: 11, 12, 13, 14, 15 (5 tests)"
echo "🛠️ Requests malformados: 16, 17 (2 tests)"
echo ""
echo "📊 COBERTURA DE CASOS:"
echo "   • Paginación: page, limit, páginas inexistentes"
echo "   • Filtros: isPublished, author, tags (individual y múltiple)"
echo "   • Combinaciones: Todos los filtros juntos"
echo "   • Edge Cases: Límites, caracteres especiales, parámetros inválidos"
echo "   • Validación: Parámetros malformados, tipos incorrectos"
echo ""
echo "💡 Tip: Usar | jq para formatear respuestas JSON"
