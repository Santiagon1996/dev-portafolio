#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/blog"

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGNlYTQ2YWRjZjAzZjY4MTM1YmRjYSIsImlhdCI6MTc1OTMwODM2NSwiZXhwIjoxNzU5MzExOTY1fQ.4EXo9Bgk0ju7lK1SkiYpGuoAXq3CrVXhCt717vS519w" # <-- Pon aquí tu token JWT


echo -e "${BLUE}🚀 TESTING ADD BLOG ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de addBlog.test.ts =====${NC}\n"

# ✅ HAPPY PATH TESTS
echo -e "${GREEN}✅ === HAPPY PATH TESTS ===${NC}\n"

echo -e "${YELLOW}Test 1: Blog completo con todos los campos${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Guía Completa de TypeScript para Desarrolladores",
  "content": "TypeScript es un superset de JavaScript que añade tipado estático. En esta guía completa aprenderemos desde conceptos básicos hasta patrones avanzados, incluyendo generics, decoradores, y mejores prácticas para proyectos empresariales.",
  "summary": "Todo lo que necesitas saber sobre TypeScript",
  "tags": ["typescript", "javascript", "programacion", "desarrollo"],
  "author": "Santiago Nardelli",
  "isPublished": true,
  "publishedAt": "2025-01-15T10:30:00.000Z"
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

echo -e "${YELLOW}Test 2: Blog mínimo (solo campos obligatorios)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Post Básico con Contenido Suficiente",
  "content": "Este es un contenido mínimo pero válido que cumple con los requisitos de tener al menos 20 caracteres para ser aceptado."
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

echo -e "${YELLOW}Test 3: Blog con campos opcionales null/undefined${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Blog con Campos Opcionales Vacíos",
  "content": "Contenido válido con más de veinte caracteres para cumplir validaciones mínimas.",
  "summary": null,
  "tags": [],
  "author": null,
  "isPublished": false
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

# ❌ VALIDATION ERROR TESTS
echo -e "\n${RED}❌ === VALIDATION ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 4: Título muy corto (< 5 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Hi",
  "content": "Contenido válido con más de veinte caracteres necesarios para pasar validación mínima."
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (título muy corto)${NC}\n"

echo -e "${YELLOW}Test 5: Título muy largo (> 200 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Este es un título extremadamente largo que excede los doscientos caracteres permitidos por la validación del schema de Zod y debería fallar completamente al intentar crear un blog con estas características tan específicas",
  "content": "Contenido válido con más de veinte caracteres para cumplir con las validaciones."
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (título muy largo)${NC}\n"

echo -e "${YELLOW}Test 6: Contenido muy corto (< 20 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Título Válido con Longitud Correcta",
  "content": "Corto"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (contenido muy corto)${NC}\n"

echo -e "${YELLOW}Test 7: Múltiples errores de validación${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Content-Type: application/json" \
-d '{
  "title": "X",
  "content": "Y",
  "publishedAt": "fecha-invalida-no-iso"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (múltiples errores)${NC}\n"

echo -e "${YELLOW}Test 8: Campos faltantes (sin título)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "content": "Contenido válido pero falta el título obligatorio para crear el blog."
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (título faltante)${NC}\n"

echo -e "${YELLOW}Test 9: Campos faltantes (sin contenido)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Título Válido pero Sin Contenido"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (contenido faltante)${NC}\n"

# ❌ DUPLICITY ERROR TESTS
echo -e "\n${PURPLE}🔄 === DUPLICITY ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 10: Duplicidad por título exacto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Guía Completa de TypeScript para Desarrolladores",
  "content": "Este es otro contenido diferente, pero el título es exactamente igual al primer blog creado."
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (título duplicado)${NC}\n"

echo -e "${YELLOW}Test 11: Duplicidad por slug generado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Guía COMPLETA de TypeScript PARA desarrolladores",
  "content": "Título ligeramente diferente pero que genera el mismo slug al ser procesado por la función slugify."
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (slug duplicado)${NC}\n"

# 🧪 EDGE CASE TESTS  
echo -e "\n${BLUE}🧪 === EDGE CASE TESTS ===${NC}\n"

echo -e "${YELLOW}Test 12: Caracteres especiales y emojis${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Desarrollo Web con Emojis 🚀 y Símbolos Especiales @#$%",
  "content": "Este post prueba caracteres especiales: áéíóú, ñ, ç, símbolos ∑∏∆, emojis 🎯🧪🔥, y otros caracteres Unicode. El contenido debe ser procesado correctamente.",
  "tags": ["testing", "unicode", "emojis", "caracteres-especiales"],
  "summary": "Prueba de manejo de caracteres especiales 🧪"
}'
echo -e "${GREEN}✅ Esperado: 201 Created (caracteres especiales manejados)${NC}\n"

echo -e "${YELLOW}Test 13: Arrays vacíos vs null${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Blog para Probar Arrays Vacíos vs Null",
  "content": "Contenido que prueba el manejo de arrays vacíos versus valores null en el schema.",
  "tags": []
}'
echo -e "${GREEN}✅ Esperado: 201 Created (arrays vacíos válidos)${NC}\n"

echo -e "${YELLOW}Test 14: Fecha ISO válida${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Blog con Fecha de Publicación Específica",
  "content": "Este blog tiene una fecha de publicación específica en formato ISO 8601 válido.",
  "publishedAt": "2025-02-01T14:30:00.000Z",
  "isPublished": true
}'
echo -e "${GREEN}✅ Esperado: 201 Created (fecha válida procesada)${NC}\n"

# ❌ MALFORMED REQUEST TESTS
echo -e "\n${RED}💥 === MALFORMED REQUEST TESTS ===${NC}\n"

echo -e "${YELLOW}Test 15: JSON malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "JSON mal formado",
  "content": "Contenido válido",
  "tags": ["sin-cerrar-corchete"
}'
echo -e "${RED}❌ Esperado: 400 - JSON Parse Error${NC}\n"

echo -e "${YELLOW}Test 16: Content-Type incorrecto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: text/plain" \
-d 'esto-no-es-json'
echo -e "${RED}❌ Esperado: 400 - Invalid Content-Type${NC}\n"

echo -e "\n${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE ADD BLOG COMPLETADOS (16 tests)${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1, 2, 3, 12, 13, 14 (6 tests)${NC}"
echo -e "${RED}❌ Tests de error esperados: 4, 5, 6, 7, 8, 9, 10, 11, 15, 16 (10 tests)${NC}\n"

echo -e "${YELLOW}� COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Blogs válidos con diferentes configuraciones"
echo -e "   • Validation Errors: Títulos/contenido muy corto/largo, campos faltantes"
echo -e "   • Duplicity Errors: Títulos exactos y slugs duplicados"
echo -e "   • Edge Cases: Caracteres especiales, arrays, fechas ISO"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "\n${BLUE}💡 Tip: Usar flag -v en lugar de -s para ver respuestas detalladas${NC}"
