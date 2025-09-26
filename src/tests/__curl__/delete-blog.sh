#!/bin/bash

# Test completo para DELETE /api/blog/[blogId] - deleteBlog
# Basado en la lógica de deleteBlog.ts con autenticación y validaciones

BASE_URL="http://localhost:3000/api/blog"
LOGIN_URL="http://localhost:3000/api/admin/login"
COOKIE_JAR="/tmp/test_cookies.txt"

echo "🚀 TESTING DELETE BLOG ENDPOINT"
echo "===== Basado en casos de deleteBlog.ts ====="
echo ""
echo "⚠️  NOTA: DELETE requiere autenticación con withAuth (cookies)"
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

# 🔐 FUNCIÓN DE LOGIN PARA OBTENER COOKIES DE AUTENTICACIÓN
login_and_get_cookies() {
    echo "🔐 Intentando hacer login para obtener cookies de autenticación..."
    
    # Credenciales por defecto (ajustar según tu sistema)
    # Nota: Estos valores deberían existir en tu base de datos
    login_response=$(curl -s -w "\n%{http_code}" -c "$COOKIE_JAR" -X POST "$LOGIN_URL" \
        -H "Content-Type: application/json" \
        -d '{"username": "santiagoN", "password": "SuperSecure123"}')
    
    login_body=$(echo "$login_response" | head -n -1)
    login_status=$(echo "$login_response" | tail -n 1)
    
    if [ "$login_status" = "200" ]; then
        echo "✅ Login exitoso"
        echo "Cookies guardadas en: $COOKIE_JAR"
        return 0
    else
        echo "❌ Login falló. Status: $login_status"
        echo "Response: $login_body"
        echo ""
        echo "🔧 SOLUCIÓN: Verifica que exista un admin con username='santiagoN' y password='SuperSecure123'"
        echo "   O ajusta las credenciales en este script."
        return 1
    fi
}

# Función para crear un blog de prueba (con autenticación)
create_test_blog() {
    local title="$1"
    local content="$2"
    
    response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -d "{\"title\": \"$title\", \"content\": \"$content\"}")
    
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "201" ]; then
        # Extraer el ID del blog creado (asumiendo que la respuesta contiene _id)
        blog_id=$(echo "$body" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
        echo "$blog_id"
    else
        echo ""
    fi
}

# 🔐 HACER LOGIN PRIMERO
if ! login_and_get_cookies; then
    echo "❌ No se pudo obtener autenticación. Abortando tests."
    exit 1
fi
echo ""

echo "📋 === PREPARACIÓN: Crear blogs de prueba ==="
echo ""

# Crear blogs de prueba para los tests
echo "Creando blog de prueba 1..."
TEST_BLOG_ID_1=$(create_test_blog "Blog para eliminar 1" "Este es un blog que será eliminado en las pruebas. Tiene contenido suficiente para pasar la validación mínima.")

echo "Creando blog de prueba 2..."  
TEST_BLOG_ID_2=$(create_test_blog "Blog para eliminar 2" "Otro blog de prueba para eliminación. También tiene contenido suficiente para cumplir con los requisitos.")

echo "Blog 1 ID: $TEST_BLOG_ID_1"
echo "Blog 2 ID: $TEST_BLOG_ID_2"
echo ""

# Verificar que tenemos IDs válidos
if [ -z "$TEST_BLOG_ID_1" ] || [ -z "$TEST_BLOG_ID_2" ]; then
    echo "❌ ERROR: No se pudieron crear blogs de prueba. Verifica que el servidor esté corriendo y POST funcione."
    exit 1
fi

echo "✅ === SUCCESSFUL DELETE TESTS ==="
echo ""

# Test 1: DELETE exitoso de blog existente
echo "Test 1: DELETE exitoso de blog existente"
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/$TEST_BLOG_ID_1")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 1: DELETE exitoso" "$body" "$status_code" "200 OK - Blog eliminado retornado"

# Test 2: DELETE de otro blog para múltiples tests
echo "Test 2: DELETE exitoso de segundo blog"
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/$TEST_BLOG_ID_2")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 2: DELETE exitoso #2" "$body" "$status_code" "200 OK - Blog eliminado retornado"

echo ""
echo "❌ === ERROR HANDLING TESTS ==="
echo ""

# Test 3: DELETE con ID inexistente
echo "Test 3: DELETE con ID que no existe"
NON_EXISTENT_ID="507f1f77bcf86cd799439011"  # ID válido pero inexistente
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/$NON_EXISTENT_ID")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 3: ID inexistente" "$body" "$status_code" "404 Not Found - Blog no encontrado"

# Test 4: DELETE con ID inválido (muy corto)
echo "Test 4: DELETE con ID inválido (muy corto)"
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/123")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 4: ID muy corto" "$body" "$status_code" "400 Bad Request - ValidationError (ID inválido)"

# Test 5: DELETE con ID inválido (muy largo)
echo "Test 5: DELETE con ID inválido (muy largo)"
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/507f1f77bcf86cd79943901112345")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 5: ID muy largo" "$body" "$status_code" "400 Bad Request - ValidationError (ID inválido)"

# Test 6: DELETE con ID inválido (caracteres especiales)
echo "Test 6: DELETE con ID con caracteres inválidos"
response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/invalid-id-format!")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 6: ID con caracteres especiales" "$body" "$status_code" "400 Bad Request - ValidationError (ID inválido)"

# Test 7: DELETE con ID vacío
echo "Test 7: DELETE con ID vacío"
response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 7: ID vacío" "$body" "$status_code" "404 Not Found - Ruta no encontrada"

# Test 8: DELETE del mismo blog dos veces (verificar que ya no existe)
echo "Test 8: DELETE del mismo ID dos veces"
# Crear un blog temporal para este test
TEMP_BLOG_ID=$(create_test_blog "Blog temporal" "Blog para probar eliminación doble. Contenido suficiente para validación.")
if [ ! -z "$TEMP_BLOG_ID" ]; then
    # Primera eliminación (debería funcionar)
    curl -s -b "$COOKIE_JAR" -X DELETE "$BASE_URL/$TEMP_BLOG_ID" > /dev/null
    # Segunda eliminación (debería fallar)
    response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE_URL/$TEMP_BLOG_ID")
    body=$(echo "$response" | head -n -1)
    status_code=$(echo "$response" | tail -n 1)
    show_result "Test 8: DELETE doble" "$body" "$status_code" "404 Not Found - Blog ya eliminado"
else
    echo "Test 8: DELETE doble - ❌ No se pudo crear blog temporal"
fi

echo ""
echo "🔐 === AUTHENTICATION TESTS ==="
echo ""

# Crear blog para tests de autenticación
AUTH_TEST_BLOG_ID=$(create_test_blog "Blog para test auth" "Blog para probar autenticación en DELETE. Contenido válido para pruebas.")

if [ ! -z "$AUTH_TEST_BLOG_ID" ]; then
    # Test 9: DELETE sin cookies de autenticación
    echo "Test 9: DELETE sin cookies de autenticación"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/$AUTH_TEST_BLOG_ID")
    body=$(echo "$response" | head -n -1)
    status_code=$(echo "$response" | tail -n 1)
    show_result "Test 9: Sin cookies auth" "$body" "$status_code" "401 Unauthorized - Token requerido"

    # Test 10: DELETE con cookies vacías/inválidas
    echo "Test 10: DELETE con cookies inválidas"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/$AUTH_TEST_BLOG_ID" \
        --cookie "accessToken=invalid_token_here")
    body=$(echo "$response" | head -n -1)
    status_code=$(echo "$response" | tail -n 1)
    show_result "Test 10: Cookies inválidas" "$body" "$status_code" "401 Unauthorized - Token inválido"

    # Limpiar el blog de prueba de auth (con cookies válidas)
    echo "Limpiando blog de prueba de autenticación..."
    curl -s -b "$COOKIE_JAR" -X DELETE "$BASE_URL/$AUTH_TEST_BLOG_ID" > /dev/null
else
    echo "Tests 9-10: ❌ No se pudo crear blog para tests de autenticación"
fi

echo ""
echo "🛠️ === EDGE CASE TESTS ==="
echo ""

# Test 11: DELETE con diferentes métodos HTTP incorrectos
echo "Test 11: Usar POST en lugar de DELETE (método incorrecto)"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/507f1f77bcf86cd799439011")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 11: Método incorrecto" "$body" "$status_code" "405 Method Not Allowed o diferente comportamiento"

# Test 12: DELETE con Content-Type incorrecto (aunque no debería importar)
echo "Test 12: DELETE con Content-Type innecesario"
response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/507f1f77bcf86cd799439011" \
    -H "Content-Type: text/plain")
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 12: Content-Type innecesario" "$body" "$status_code" "404 Not Found - Content-Type no debería afectar DELETE"

# Test 13: DELETE con body innecesario (DELETE no debería tener body)
echo "Test 13: DELETE con body innecesario"
response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/507f1f77bcf86cd799439011" \
    -H "Content-Type: application/json" \
    -d '{"unnecessary": "data"}')
body=$(echo "$response" | head -n -1)
status_code=$(echo "$response" | tail -n 1)
show_result "Test 13: Body innecesario" "$body" "$status_code" "404 Not Found - Body no debería afectar DELETE"

echo ""
echo "==============================================="
echo "🏁 TESTS DE DELETE BLOG COMPLETADOS (13 tests)"
echo "==============================================="
echo ""
echo "✅ Tests exitosos: 1, 2 (2 tests)"
echo "❌ Tests de error: 3, 4, 5, 6, 7, 8 (6 tests)"
echo "🔐 Tests de autenticación: 9, 10 (2 tests)"
echo "🛠️ Tests de casos límite: 11, 12, 13 (3 tests)"
echo ""
echo "📊 COBERTURA DE CASOS:"
echo "   • Eliminación exitosa: IDs válidos y existentes"
echo "   • Validación de ID: Formatos inválidos, longitud incorrecta"
echo "   • Manejo de errores: IDs inexistentes, eliminación doble"
echo "   • Autenticación: Sin token, tokens inválidos"
echo "   • Edge Cases: Métodos incorrectos, headers innecesarios"
echo ""
echo "🔐 NOTA IMPORTANTE:"
echo "   • Los tests de autenticación pueden fallar si no hay tokens válidos configurados"
echo "   • Ajusta los headers de Authorization según tu implementación de withAuth"
echo ""
echo "💡 Tips:"
echo "   • Usar -v flag para ver headers de respuesta"
echo "   • Verificar que los blogs se eliminaron correctamente con GET"
echo ""
echo "🧹 Limpiando archivo de cookies temporal..."
rm -f "$COOKIE_JAR"
echo "✅ Cleanup completado"
