#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/skill"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5NDkzNiwiZXhwIjoxNzU5Mzk4NTM2fQ.SwSCkIrdnx-S9uE2qMgE6CpNm6JPCFvkJp8MvU0yPSI" # <-- Pon aquí tu token JWT # Solo necesario para crearla skill

echo -e "${BLUE}🚀 TESTING GET SKILL BY ID ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de getSkillById.test.ts y addSkill.sh =====${NC}\n"

# Crear una skill para consultar (Happy Path)
echo -e "${YELLOW}Creando skill para consulta...${NC}"
SKILL_ID=$(curl -s -X POST $API_URL \
    -H "Cookie: accessToken=${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Skill Test 2",
        "category": "Frontend",
        "level": "Expert"
    }' | jq -r '._id')

echo -e "${GREEN}Skill creada con ID: $SKILL_ID${NC}\n"

# ✅ TEST GET BY ID
if [ "$SKILL_ID" != "null" ] && [ -n "$SKILL_ID" ]; then
    echo -e "${YELLOW}Test 1: Consultar skill existente por ID${NC}"
    curl -s -w "\nStatus: %{http_code}\n" -X GET "$API_URL/$SKILL_ID"
    echo -e "${GREEN}✅ Esperado: 200 OK${NC}\n"
else
    echo -e "${RED}No se pudo crear la skill para consulta. Test abortado.${NC}"
fi

# ❌ TEST GET INEXISTENTE
echo -e "${YELLOW}Test 2: Consultar skill inexistente por ID${NC}"
FAKE_ID="000000000000000000000000"
curl -s -w "\nStatus: %{http_code}\n" -X GET "$API_URL/$FAKE_ID"
echo -e "${RED}❌ Esperado: 404 - Not Found${NC}\n"

# 💥 TEST MALFORMED ID
echo -e "${YELLOW}Test 3: Consultar skill con ID malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X GET "$API_URL/123"
echo -e "${RED}❌ Esperado: 400 - ValidationError (ID malformado)${NC}\n"

# Cobertura de casos
echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Consultar skill existente por ID"
echo -e "   • Not Found: Consultar skill inexistente"
echo -e "   • Validation Error: ID malformado"
echo -e "\n${BLUE}💡 Tip: Usa jq para parsear la respuesta si lo necesitas${NC}"
