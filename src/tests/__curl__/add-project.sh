#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/project"

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGNmY2IwZmZmOGQ5MTkzYmJjYTFhYiIsImlhdCI6MTc1OTMxMzEwMiwiZXhwIjoxNzU5MzE2NzAyfQ.xKBj-gXTHCOkfq2Gz1iFjHQ-qf3wD7xY61vD-ecyg-8" # <-- Pon aquí tu token JWT


echo -e "${BLUE}🚀 TESTING ADD PROJECT ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de addProject.test.ts y schema =====${NC}\n"

# ✅ HAPPY PATH TESTS
echo -e "${GREEN}✅ === HAPPY PATH TESTS ===${NC}\n"

echo -e "${YELLOW}Test 1: Proyecto completo con todos los campos${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión de Inventario",
  "description": "Aplicación web para gestionar inventarios, con dashboard, reportes y control de stock en tiempo real.",
  "techStack": ["React", "Node.js", "MongoDB", "Docker"],
  "repoUrl": "https://github.com/usuario/inventario",
  "images": ["https://via.placeholder.com/300x200", "https://via.placeholder.com/300x201"],
  "tags": ["gestion", "inventario", "dashboard"],
  "featured": true
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

echo -e "${YELLOW}Test 2: Proyecto mínimo (solo obligatorios)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "App Simple",
  "description": "Una app sencilla para pruebas.",
  "techStack": ["Node.js"]
}'
echo -e "${GREEN}✅ Esperado: 201 Created${NC}\n"

# ❌ VALIDATION ERROR TESTS
echo -e "\n${RED}❌ === VALIDATION ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 3: Título muy corto (< 3 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "A",
  "description": "Aplicación web para gestionar inventarios.",
  "techStack": ["React", "Node.js"]
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (título muy corto)${NC}\n"

echo -e "${YELLOW}Test 4: Descripción muy corta (< 10 caracteres)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión",
  "description": "Corto",
  "techStack": ["React", "Node.js"]
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (descripción muy corta)${NC}\n"

echo -e "${YELLOW}Test 5: techStack vacío${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión",
  "description": "Aplicación web para gestionar inventarios.",
  "techStack": []
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (techStack vacío)${NC}\n"

echo -e "${YELLOW}Test 6: repoUrl inválida${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión",
  "description": "Aplicación web para gestionar inventarios.",
  "techStack": ["React", "Node.js"],
  "repoUrl": "no-es-url"
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (repoUrl inválida)${NC}\n"

echo -e "${YELLOW}Test 7: Campos faltantes (sin title)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "description": "Aplicación web para gestionar inventarios.",
  "techStack": ["React", "Node.js"]
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (title faltante)${NC}\n"

echo -e "${YELLOW}Test 8: Campos faltantes (sin description)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión",
  "techStack": ["React", "Node.js"]
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (description faltante)${NC}\n"

echo -e "${YELLOW}Test 9: Campos faltantes (sin techStack)${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión",
  "description": "Aplicación web para gestionar inventarios."
}'
echo -e "${RED}❌ Esperado: 400 - ValidationError (techStack faltante)${NC}\n"

# 🔁 DUPLICITY ERROR TESTS
echo -e "\n${PURPLE}🔁 === DUPLICITY ERROR TESTS ===${NC}\n"

echo -e "${YELLOW}Test 10: Duplicidad por título exacto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Sistema de Gestión de Inventario",
  "description": "Otro contenido, pero el título es exactamente igual al primero.",
  "techStack": ["React", "Node.js"]
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (título duplicado)${NC}\n"

echo -e "${YELLOW}Test 11: Duplicidad por slug generado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "SISTEMA de gestión DE inventario",
  "description": "Título ligeramente diferente pero que genera el mismo slug.",
  "techStack": ["React", "Node.js"]
}'
echo -e "${RED}❌ Esperado: 409 - DuplicityError (slug duplicado)${NC}\n"

# 🧪 EDGE CASE TESTS
echo -e "\n${BLUE}🧪 === EDGE CASE TESTS ===${NC}\n"

echo -e "${YELLOW}Test 12: Caracteres especiales y emojis${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Gestión de Proyectos 🚀",
  "description": "App para gestión de proyectos con emojis y caracteres especiales: áéíóú ñ ç Σ∏∆.",
  "techStack": ["React", "Node.js"]
}'
echo -e "${GREEN}✅ Esperado: 201 Created (caracteres especiales manejados)${NC}\n"

# 💥 MALFORMED REQUEST TESTS
echo -e "\n${RED}💥 === MALFORMED REQUEST TESTS ===${NC}\n"

echo -e "${YELLOW}Test 13: JSON malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Gestión de Proyectos 🚀",
  "description": "App para gestión de proyectos",
  "techStack": ["React", "Node.js"]
' # Falta cerrar llave

echo -e "${RED}❌ Esperado: 400 - JSON Parse Error${NC}\n"

echo -e "${YELLOW}Test 14: Content-Type incorrecto${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X POST $API_URL \
-H "Cookie: accessToken=${ADMIN_TOKEN}" \
-H "Content-Type: text/plain" \
-d 'esto-no-es-json'
echo -e "${RED}❌ Esperado: 400 - Invalid Content-Type${NC}\n"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🏁 TESTS DE ADD PROJECT COMPLETADOS (14 tests)${NC}"
echo -e "${BLUE}===============================================${NC}\n"

echo -e "${GREEN}✅ Tests exitosos esperados: 1, 2, 12 (3 tests)${NC}"
echo -e "${RED}❌ Tests de error esperados: 3-11, 13, 14 (11 tests)${NC}\n"

echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Proyectos válidos con diferentes configuraciones"
echo -e "   • Validation Errors: Título/description/techStack/repoUrl muy corto/largo, campos faltantes"
echo -e "   • Duplicity Errors: Título exacto y slug duplicado"
echo -e "   • Edge Cases: Caracteres especiales, emojis"
echo -e "   • Malformed Requests: JSON inválido, Content-Type incorrecto"
echo -e "\n${BLUE}💡 Tip: Usar flag -v en lugar de -s para ver respuestas detalladas${NC}"
