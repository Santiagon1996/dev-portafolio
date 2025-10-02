#!/bin/bash

# Test completo para GET /api/education - getAllEducations
# Basado en la lógica de getAllEducations.ts con paginación y filtros

BASE_URL="http://localhost:3000/api/education"

echo "🚀 TESTING GET EDUCATIONS ENDPOINT"
echo "===== Basado en casos de getAllEducations.ts ====="
echo ""

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

# Test 1: GET básico - todas las educaciones (sin parámetros)
echo "Test 1: GET básico - todas las educaciones (sin parámetros)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 1: GET básico" "$body" "$status_code" "200 OK - Lista con estructura {educations, total, page, totalPages}"

# Test 2: GET con paginación básica
echo "Test 2: GET con paginación básica (page=1, limit=5)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=1&limit=5")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 2: Paginación básica" "$body" "$status_code" "200 OK - Máximo 5 educations"

# Test 3: GET página específica
echo "Test 3: GET página específica (page=2)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=2&limit=3")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 3: Página específica" "$body" "$status_code" "200 OK - Página 2 con 3 educations máximo"

echo ""
echo "🔍 === FILTERING TESTS ==="
echo ""

# Test 4: Filtrar por institution
echo "Test 4: Filtrar por institution específica"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?institution=Universidad%20Test")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 4: Por institution" "$body" "$status_code" "200 OK - Solo educations con institution=Universidad Test"

# Test 5: Filtrar por degree
echo "Test 5: Filtrar por degree específica"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?degree=Licenciatura")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 5: Por degree" "$body" "$status_code" "200 OK - Solo educations con degree=Licenciatura"

# Test 6: Filtrar por institution y degree juntos
echo "Test 6: Filtrar por institution y degree juntos"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?institution=Universidad%20Test&degree=Licenciatura")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 6: Por institution y degree" "$body" "$status_code" "200 OK - Solo educations con ambos filtros"

# Test 7: GET con paginación y filtro juntos
echo "Test 7: GET con paginación y filtro (institution, page, limit)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?institution=Universidad%20Test&page=1&limit=2")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 7: Paginación + filtro" "$body" "$status_code" "200 OK - Máximo 2 educations filtradas"

# Test 8: GET con parámetros inválidos
echo "Test 8: GET con parámetros inválidos (page=-1, limit=0)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=-1&limit=0")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 8: Parámetros inválidos" "$body" "$status_code" "200 OK - page=1, limit=10 por defecto"

# Test 9: GET con filtro que no existe
echo "Test 9: GET con filtro que no existe (institution=NoExiste)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?institution=NoExiste")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 9: Filtro sin resultados" "$body" "$status_code" "200 OK - educations=[]"

echo ""
echo "🟡 COBERTURA DE CASOS:"
echo "   • GET básico sin parámetros"
echo "   • Paginación: page, limit"
echo "   • Filtros: institution, degree, ambos"
echo "   • Paginación + filtro"
echo "   • Parámetros inválidos"
echo "   • Filtro sin resultados"
echo ""
echo "💡 Tip: Usa jq para parsear la respuesta si lo necesitas"
