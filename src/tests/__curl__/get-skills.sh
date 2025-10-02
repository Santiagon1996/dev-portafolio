#!/bin/bash

# Test completo para GET /api/skill - getAllSkills
# Basado en la lógica de getAllSkills.ts con paginación y filtros

BASE_URL="http://localhost:3000/api/skill"

echo "🚀 TESTING GET SKILLS ENDPOINT"
echo "===== Basado en casos de getAllSkills.ts ====="
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

# Test 1: GET básico - todos los skills (sin parámetros)
echo "Test 1: GET básico - todos los skills (sin parámetros)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 1: GET básico" "$body" "$status_code" "200 OK - Lista con estructura {skills, total, page, totalPages}"

# Test 2: GET con paginación básica
echo "Test 2: GET con paginación básica (page=1, limit=5)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=1&limit=5")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 2: Paginación básica" "$body" "$status_code" "200 OK - Máximo 5 skills"

# Test 3: GET página específica
echo "Test 3: GET página específica (page=2)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=2&limit=3")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 3: Página específica" "$body" "$status_code" "200 OK - Página 2 con 3 skills máximo"

echo ""
echo "🔍 === FILTERING TESTS ==="
echo ""

# Test 4: Filtrar por name
echo "Test 4: Filtrar por name específico"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?name=Skill%20Test")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 4: Por name" "$body" "$status_code" "200 OK - Solo skills con name=Skill Test"

# Test 5: Filtrar por level
echo "Test 5: Filtrar por level específico"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?level=Expert")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 5: Por level" "$body" "$status_code" "200 OK - Solo skills con level=Expert"

# Test 6: Filtrar por name y level juntos
echo "Test 6: Filtrar por name y level juntos"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?name=Skill%20Test&level=Expert")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 6: Por name y level" "$body" "$status_code" "200 OK - Solo skills con ambos filtros"

# Test 7: GET con paginación y filtro juntos
echo "Test 7: GET con paginación y filtro (level, page, limit)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?level=Expert&page=1&limit=2")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 7: Paginación + filtro" "$body" "$status_code" "200 OK - Máximo 2 skills filtrados"

# Test 8: GET con parámetros inválidos
echo "Test 8: GET con parámetros inválidos (page=-1, limit=0)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=-1&limit=0")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 8: Parámetros inválidos" "$body" "$status_code" "200 OK - page=1, limit=10 por defecto"

# Test 9: GET con filtro que no existe
echo "Test 9: GET con filtro que no existe (name=NoExiste)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?name=NoExiste")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 9: Filtro sin resultados" "$body" "$status_code" "200 OK - skills=[]"

echo ""
echo "🟡 COBERTURA DE CASOS:"
echo "   • GET básico sin parámetros"
echo "   • Paginación: page, limit"
echo "   • Filtros: name, level, ambos"
echo "   • Paginación + filtro"
echo "   • Parámetros inválidos"
echo "   • Filtro sin resultados"
echo ""
echo "💡 Tip: Usa jq para parsear la respuesta si lo necesitas"
