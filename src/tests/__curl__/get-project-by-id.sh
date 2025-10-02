#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/project"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5NDkzNiwiZXhwIjoxNzU5Mzk4NTM2fQ.SwSCkIrdnx-S9uE2qMgE6CpNm6JPCFvkJp8MvU0yPSI" # <-- Pon aquí tu token JWT # Solo necesario para crear el proyecto

echo -e "${BLUE}🚀 TESTING GET PROJECT BY ID ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de getProjectById.test.ts y addProject.sh =====${NC}\n"

# Crear un proyecto para consultar (Happy Path)
echo -e "${YELLOW}Creando proyecto para consulta...${NC}"
PROJ_ID=$(curl -s -X POST $API_URL \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Proyecto Test",
        "description": "Proyecto inicial para test.",
        "techStack": ["Node.js"],
        "featured": false
    }' | jq -r '._id')

echo -e "${GREEN}Proyecto creado con ID: $PROJ_ID${NC}\n"

# ✅ TEST GET BY ID
if [ "$PROJ_ID" != "null" ] && [ -n "$PROJ_ID" ]; then
    echo -e "${YELLOW}Test 1: Consultar proyecto existente por ID${NC}"
    curl -s -w "\nStatus: %{http_code}\n" -X GET "$API_URL/$PROJ_ID"
    echo -e "${GREEN}✅ Esperado: 200 OK${NC}\n"
else
    echo -e "${RED}No se pudo crear el proyecto para consulta. Test abortado.${NC}"
fi

# ❌ TEST GET INEXISTENTE
echo -e "${YELLOW}Test 2: Consultar proyecto inexistente por ID${NC}"
FAKE_ID="000000000000000000000000"
curl -s -w "\nStatus: %{http_code}\n" -X GET "$API_URL/$FAKE_ID"
echo -e "${RED}❌ Esperado: 404 - Not Found${NC}\n"

# 💥 TEST MALFORMED ID
echo -e "${YELLOW}Test 3: Consultar proyecto con ID malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X GET "$API_URL/123"
echo -e "${RED}❌ Esperado: 400 - ValidationError (ID malformado)${NC}\n"

# Cobertura de casos
echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Consultar proyecto existente por ID"
echo -e "   • Not Found: Consultar proyecto inexistente"
echo -e "   • Validation Error: ID malformado"
echo -e "\n${BLUE}💡 Tip: Usa jq para parsear la respuesta si lo necesitas${NC}"
