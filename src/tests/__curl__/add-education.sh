#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/education"

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGNlYTQ2YWRjZjAzZjY4MTM1YmRjYSIsImlhdCI6MTc1OTMwODM2NSwiZXhwIjoxNzU5MzExOTY1fQ.4EXo9Bgk0ju7lK1SkiYpGuoAXq3CrVXhCt717vS519w" # <-- Pon aquí tu token JWT


echo -e "${BLUE}🚀 TESTING ADD EDUCATION ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de addEducation.test.ts y schema =====${NC}\n"

# ✅ HAPPY PATH TESTS
echo -e "${GREEN}✅ === HAPPY PATH TESTS ===${NC}\n"

echo -e "${YELLOW}Test 1: Educación completa con todos los campos${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Ingeniería en Sistemas de Información",
  "institution": "Universidad Nacional del Centro",
  "field": "Sistemas de Información",
  "startDate": "2015-03-01",
  "endDate": "2020-12-15",
  "location": "Tandil, Argentina",
  "description": "Carrera universitaria con enfoque en desarrollo de software, bases de datos, redes y gestión de proyectos."
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

echo -e "${YELLOW}Test 2: Educación mínima (solo obligatorios)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Licenciatura en Matemática",
  "institution": "UBA",
  "field": "Matemática",
  "startDate": "2010-01-01"
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

# ❌ VALIDATION ERROR TESTS
echo -e "\n${RED}❌ === VALIDATION ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 3: Degree muy corto (< 2 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "A",
  "institution": "UBA",
  "field": "Matemática",
  "startDate": "2010-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (degree muy corto)${NC}\n"

echo -e "${YELLOW}Test 4: Institution muy largo (> 100 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Licenciatura en Matemática",
  "institution": "$(printf 'A%.0s' {1..101})",
  "field": "Matemática",
  "startDate": "2010-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (institution muy largo)${NC}\n"

echo -e "${YELLOW}Test 5: Fecha de inicio muy corta (< 4 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Licenciatura en Matemática",
  "institution": "UBA",
  "field": "Matemática",
  "startDate": "20"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (startDate muy corto)${NC}\n"

echo -e "${YELLOW}Test 6: Campos faltantes (sin degree)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "institution": "UBA",
  "field": "Matemática",
  "startDate": "2010-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (degree faltante)${NC}\n"

echo -e "${YELLOW}Test 7: Campos faltantes (sin institution)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Licenciatura en Matemática",
  "field": "Matemática",
  "startDate": "2010-01-01"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (institution faltante)${NC}\n"

echo -e "${YELLOW}Test 8: Campos faltantes (sin startDate)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Licenciatura en Matemática",
  "institution": "UBA",
  "field": "Matemática"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (startDate faltante)${NC}\n"

# 🔁 DUPLICITY ERROR TESTS
echo -e "\n${PURPLE}🔁 === DUPLICITY ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 9: Duplicidad por degree exacto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Ingeniería en Sistemas de Información",
  "institution": "Universidad Nacional del Centro",
  "field": "Sistemas de Información",
  "startDate": "2015-03-01"
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (degree duplicado)${NC}\n"

echo -e "${YELLOW}Test 10: Duplicidad por slug generado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "INGENIERÍA EN sistemas de información",
  "institution": "Universidad Nacional del Centro",
  "field": "Sistemas de Información",
  "startDate": "2015-03-01"
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (slug duplicado)${NC}\n"

# 🧪 EDGE CASE TESTS
echo -e "\n${BLUE}🧪 === EDGE CASE TESTS ===${NC}\n"

echo -e "${YELLOW}Test 11: Caracteres especiales y emojis${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "Licenciatura en Física 🧑‍🔬",
  "institution": "Universidad Nacional de La Plata",
  "field": "Física",
  "startDate": "2012-03-01",
  "description": "Estudios avanzados en física teórica, experimental y computacional. Incluye emojis y caracteres especiales: áéíóú ñ ç Σ∏∆."
}'
echo -e "${GREEN}✅ Esperado: 201 Created (caracteres especiales manejados)${NC}\n"

# 💥 MALFORMED REQUEST TESTS
echo -e "\n${RED}💥 === MALFORMED REQUEST TESTS ===${NC}\n"

echo -e "${YELLOW}Test 12: JSON malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "degree": "JSON mal formado",
  "institution": "UBA",
  "field": "Matemática",
  "startDate": "2010-01-01"
' # Falta cerrar llave

echo -e "${RED}❌ Esperado: 400 - JSON Parse Error${NC}\n"

echo -e "${YELLOW}Test 13: Content-Type incorrecto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: text/plain" \
-d 'esto-no-es-json'
echo -e "${RED}❌ Esperado: 400 - Invalid Content-Type${NC}\n"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE ADD EDUCATION COMPLETADOS (13 tests)${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1, 2, 11 (3 tests)${NC}"
echo -e "${RED}❌ Tests de error esperados: 3-10, 12, 13 (10 tests)${NC}\n"

echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Educación válida con diferentes configuraciones"
echo -e "   • Validation Errors: Degree/institution/startDate muy corto/largo, campos faltantes"
echo -e "   • Duplicity Errors: Degree exacto y slug duplicado"
echo -e "   • Edge Cases: Caracteres especiales, emojis"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "\n${BLUE}💡 Tip: Usar flag -v en lugar de -s para ver respuestas detalladas${NC}"
