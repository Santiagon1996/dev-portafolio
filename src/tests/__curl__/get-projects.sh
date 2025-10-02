#!/bin/bash

# Test completo para GET /api/project - getAllProjects
# Basado en la lógica de getAllProjects.ts con paginación y filtros

BASE_URL="http://localhost:3000/api/project"

echo "🚀 TESTING GET PROJECTS ENDPOINT"
echo "===== Basado en casos de getAllProjects.ts ====="
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

# Test 1: GET básico - todos los proyectos (sin parámetros)
echo "Test 1: GET básico - todos los proyectos (sin parámetros)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 1: GET básico" "$body" "$status_code" "200 OK - Lista con estructura {projects, total, page, totalPages}"

# Test 2: GET con paginación básica
echo "Test 2: GET con paginación básica (page=1, limit=5)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=1&limit=5")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 2: Paginación básica" "$body" "$status_code" "200 OK - Máximo 5 projects"

# Test 3: GET página específica
echo "Test 3: GET página específica (page=2)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=2&limit=3")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 3: Página específica" "$body" "$status_code" "200 OK - Página 2 con 3 projects máximo"

echo ""
echo "🔍 === FILTERING TESTS ==="
echo ""

# Test 4: Filtrar por title
echo "Test 4: Filtrar por title específico"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?title=Proyecto%20Test")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 4: Por title" "$body" "$status_code" "200 OK - Solo projects con title=Proyecto Test"

# Test 5: Filtrar por repoUrl
echo "Test 5: Filtrar por repoUrl específico"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?repoUrl=https://github.com/test/proyecto")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 5: Por repoUrl" "$body" "$status_code" "200 OK - Solo projects con repoUrl=https://github.com/test/proyecto"

# Test 6: Filtrar por title y repoUrl juntos
echo "Test 6: Filtrar por title y repoUrl juntos"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?title=Proyecto%20Test&repoUrl=https://github.com/test/proyecto")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 6: Por title y repoUrl" "$body" "$status_code" "200 OK - Solo projects con ambos filtros"

# Test 7: GET con paginación y filtro juntos
echo "Test 7: GET con paginación y filtro (title, page, limit)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?title=Proyecto%20Test&page=1&limit=2")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 7: Paginación + filtro" "$body" "$status_code" "200 OK - Máximo 2 projects filtrados"

# Test 8: GET con parámetros inválidos
echo "Test 8: GET con parámetros inválidos (page=-1, limit=0)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?page=-1&limit=0")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 8: Parámetros inválidos" "$body" "$status_code" "200 OK - page=1, limit=10 por defecto"

# Test 9: GET con filtro que no existe
echo "Test 9: GET con filtro que no existe (title=NoExiste)"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL?title=NoExiste")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 9: Filtro sin resultados" "$body" "$status_code" "200 OK - projects=[]"

echo ""
echo "🟡 COBERTURA DE CASOS:"
echo "   • GET básico sin parámetros"
echo "   • Paginación: page, limit"
echo "   • Filtros: title, repoUrl, ambos"
echo "   • Paginación + filtro"
echo "   • Parámetros inválidos"
echo "   • Filtro sin resultados"
echo ""
echo "💡 Tip: Usa jq para parsear la respuesta si lo necesitas"
