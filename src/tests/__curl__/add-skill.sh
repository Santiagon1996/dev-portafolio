#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/skill"

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGQyNGUyNjAzZjAyOWU4MjdhODA0NCIsImlhdCI6MTc1OTMyMzM3MiwiZXhwIjoxNzU5MzI2OTcyfQ.eW5kyyTN1BPhfLfpDJec1ekjuvFn6AJIYTSXCq_7rLU" # <-- Pon aquí tu token JWT


echo -e "${BLUE}🚀 TESTING ADD SKILL ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de addSkill.test.ts y schema =====${NC}\n"

# ✅ HAPPY PATH TESTS
echo -e "${GREEN}✅ === HAPPY PATH TESTS ===${NC}\n"

echo -e "${YELLOW}Test 1: Skill completa con todos los campos${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "TypeScript",
  "level": "Expert",
  "category": "Frontend",
  "icon": "https://cdn-icons-png.flaticon.com/512/919/919832.png",
  "color": "#3178c6"
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

echo -e "${YELLOW}Test 2: Skill mínima (solo obligatorios)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Node.js",
  "level": "Intermediate",
  "category": "Backend"
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

# ❌ VALIDATION ERROR TESTS
echo -e "\n${RED}❌ === VALIDATION ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 3: Name muy corto (< 2 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "A"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (name muy corto)${NC}\n"

echo -e "${YELLOW}Test 4: Level inválido${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "React",
  "level": "SuperPro"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (level inválido)${NC}\n"

echo -e "${YELLOW}Test 5: Category inválida${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "MongoDB",
  "category": "NoSQL"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (category inválida)${NC}\n"

echo -e "${YELLOW}Test 6: Campos faltantes (sin name)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "level": "Expert"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (name faltante)${NC}\n"

# 🔁 DUPLICITY ERROR TESTS
echo -e "\n${PURPLE}🔁 === DUPLICITY ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 7: Duplicidad por name exacto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "TypeScript"
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (name duplicado)${NC}\n"

echo -e "${YELLOW}Test 8: Duplicidad por slug generado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "TYPESCRIPT"
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (slug duplicado)${NC}\n"

# 🧪 EDGE CASE TESTS
echo -e "\n${BLUE}🧪 === EDGE CASE TESTS ===${NC}\n"

echo -e "${YELLOW}Test 9: Caracteres especiales y emojis${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Python 🐍",
  "level": "Expert",
  "category": "Backend"
}'
echo -e "${GREEN}✅ Esperado: 201 Created (caracteres especiales manejados)${NC}\n"

# 💥 MALFORMED REQUEST TESTS
echo -e "\n${RED}💥 === MALFORMED REQUEST TESTS ===${NC}\n"

echo -e "${YELLOW}Test 10: JSON malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "Python 🐍",
  "level": "Expert",
  "category": "Backend"
' # Falta cerrar llave

echo -e "${RED}❌ Esperado: 400 - JSON Parse Error${NC}\n"

echo -e "${YELLOW}Test 11: Content-Type incorrecto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: text/plain" \
-d 'esto-no-es-json'
echo -e "${RED}❌ Esperado: 400 - Invalid Content-Type${NC}\n"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE ADD SKILL COMPLETADOS (11 tests)${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1, 2, 9 (3 tests)${NC}"
echo -e "${RED}❌ Tests de error esperados: 3-8, 10, 11 (8 tests)${NC}\n"

echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Skills válidas con diferentes configuraciones"
echo -e "   • Validation Errors: Name/level/category muy corto/largo/inválido, campos faltantes"
echo -e "   • Duplicity Errors: Name exacto y slug duplicado"
echo -e "   • Edge Cases: Caracteres especiales, emojis"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "\n${BLUE}💡 Tip: Usar flag -v en lugar de -s para ver respuestas detalladas${NC}"
