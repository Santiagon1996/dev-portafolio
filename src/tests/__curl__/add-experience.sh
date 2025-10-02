#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/experience"

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGNmY2IwZmZmOGQ5MTkzYmJjYTFhYiIsImlhdCI6MTc1OTMxMzEwMiwiZXhwIjoxNzU5MzE2NzAyfQ.xKBj-gXTHCOkfq2Gz1iFjHQ-qf3wD7xY61vD-ecyg-8" # <-- Pon aquí tu token JWT




echo -e "${BLUE}🚀 TESTING ADD EXPERIENCE ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de addExperience.test.ts y schema =====${NC}\n"

# ✅ HAPPY PATH TESTS
echo -e "${GREEN}✅ === HAPPY PATH TESTS ===${NC}\n"

echo -e "${YELLOW}Test 1: Experiencia completa con todos los campos${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Globant",
  "role": "Senior Backend Developer",
  "description": "Desarrollo de microservicios en Node.js, integración con AWS y liderazgo técnico de equipo.",
  "startDate": "2021-02-01",
  "endDate": "2023-08-15",
  "location": "Buenos Aires, Argentina",
  "technologies": ["Node.js", "AWS", "MongoDB", "Docker"],
  "isCurrent": false
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

echo -e "${YELLOW}Test 2: Experiencia mínima (solo obligatorios)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "role": "QA Analyst",
  "description": "Pruebas funcionales y automatización de procesos.",
  "startDate": "2018-01-01"
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

# ❌ VALIDATION ERROR TESTS
echo -e "\n${RED}❌ === VALIDATION ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 3: Role muy corto (< 2 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "role": "A",
  "description": "Pruebas funcionales y automatización de procesos.",
  "startDate": "2018-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (role muy corto)${NC}\n"

echo -e "${YELLOW}Test 4: Company muy largo (> 100 caracteres)${NC}"
LONG_COMPANY=$(printf 'A%.0s' {1..101})
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d "{
  \"company\": \"$LONG_COMPANY\",
  \"role\": \"QA Analyst Junior\",
  \"description\": \"Pruebas funcionales y automatización de procesos.\",
  \"startDate\": \"2018-01-01\"
}"
echo -e "${RED}❌ Esperado: 400 - ValidationError (company muy largo)${NC}\n"

echo -e "${YELLOW}Test 5: Descripción muy corta (< 10 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "role": "QA Analyst",
  "description": "Corto",
  "startDate": "2018-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (descripción muy corta)${NC}\n"

echo -e "${YELLOW}Test 6: Fecha de inicio muy corta (< 4 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "role": "QA Analyst",
  "description": "Pruebas funcionales y automatización de procesos.",
  "startDate": "20"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (startDate muy corto)${NC}\n"

echo -e "${YELLOW}Test 7: Campos faltantes (sin role)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "description": "Pruebas funcionales y automatización de procesos.",
  "startDate": "2018-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (role faltante)${NC}\n"

echo -e "${YELLOW}Test 8: Campos faltantes (sin company)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "role": "QA Analyst",
  "description": "Pruebas funcionales y automatización de procesos.",
  "startDate": "2018-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (company faltante)${NC}\n"

echo -e "${YELLOW}Test 9: Campos faltantes (sin description)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "role": "QA Analyst",
  "startDate": "2018-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (description faltante)${NC}\n"

echo -e "${YELLOW}Test 10: Campos faltantes (sin startDate)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Mercado Libre",
  "role": "QA Analyst",
  "description": "Pruebas funcionales y automatización de procesos."
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (startDate faltante)${NC}\n"

# 🔁 DUPLICITY ERROR TESTS
echo -e "\n${PURPLE}🔁 === DUPLICITY ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 11: Duplicidad por role exacto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Globant",
  "role": "Senior Backend Developer",
  "description": "Otro contenido, pero el rol es exactamente igual al primero.",
  "startDate": "2021-02-01"
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (role duplicado)${NC}\n"

echo -e "${YELLOW}Test 12: Duplicidad por slug generado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Globant",
  "role": "SENIOR backend DEVELOPER",
  "description": "Rol ligeramente diferente pero que genera el mismo slug.",
  "startDate": "2021-02-01"
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (slug duplicado)${NC}\n"

# 🧪 EDGE CASE TESTS
echo -e "\n${BLUE}🧪 === EDGE CASE TESTS ===${NC}\n"

echo -e "${YELLOW}Test 13: Caracteres especiales y emojis${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Acme Corp",
  "role": "Desarrollador Fullstack 🚀",
  "description": "Desarrollo de aplicaciones web con emojis y caracteres especiales: áéíóú ñ ç Σ∏∆.",
  "startDate": "2020-05-01"
}'
echo -e "${GREEN}✅ Esperado: 201 Created (caracteres especiales manejados)${NC}\n"

# 💥 MALFORMED REQUEST TESTS
echo -e "\n${RED}💥 === MALFORMED REQUEST TESTS ===${NC}\n"

echo -e "${YELLOW}Test 14: JSON malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "company": "Acme Corp",
  "role": "Desarrollador Fullstack 🚀",
  "description": "Desarrollo de aplicaciones web",
  "startDate": "2020-05-01"
' # Falta cerrar llave

echo -e "${RED}❌ Esperado: 400 - JSON Parse Error${NC}\n"

echo -e "${YELLOW}Test 15: Content-Type incorrecto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: text/plain" \
-d 'esto-no-es-json'
echo -e "${RED}❌ Esperado: 400 - Invalid Content-Type${NC}\n"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE ADD EXPERIENCE COMPLETADOS (15 tests)${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1, 2, 13 (3 tests)${NC}"
echo -e "${RED}❌ Tests de error esperados: 3-12, 14, 15 (12 tests)${NC}\n"

echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Experiencias válidas con diferentes configuraciones"
echo -e "   • Validation Errors: Role/company/description/startDate muy corto/largo, campos faltantes"
echo -e "   • Duplicity Errors: Role exacto y slug duplicado"
echo -e "   • Edge Cases: Caracteres especiales, emojis"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "\n${BLUE}💡 Tip: Usar flag -v en lugar de -s para ver respuestas detalladas${NC}"
