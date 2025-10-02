#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/experience"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5MDQ5OSwiZXhwIjoxNzU5Mzk0MDk5fQ.O7YeAQ3elTdndMCPB3Thl9YbqVDXQqxHYefhY0vrt-Y" # <-- Pon aquí tu token JWT"
# Crear una experiencia para eliminar (Happy Path)
echo -e "${BLUE}🚀 TESTING DELETE EXPERIENCE ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de deleteExperience.test.ts y addExperience.sh =====${NC}\n"

echo -e "${YELLOW}Creando experiencia para eliminar...${NC}"
EXP_ID=$(curl -s -X POST $API_URL \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Empresa Test",
    "role": "QA para Eliminar",
    "description": "Esta experiencia será eliminada en el test de DELETE.",
    "startDate": "2022-01-01"
  }' | jq -r '._id')

echo -e "${GREEN}Experiencia creada con ID: $EXP_ID${NC}\n"

# ✅ TEST DELETE
if [ "$EXP_ID" != "null" ] && [ -n "$EXP_ID" ]; then
  echo -e "${YELLOW}Test 1: Eliminar experiencia existente${NC}"
  curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/$EXP_ID" \
    -H "Cookie: accessToken=${ADMIN_TOKEN}"
  echo -e "${GREEN}✅ Esperado: 200 Deleted${NC}\n"
else
  echo -e "${RED}No se pudo crear la experiencia para eliminar. Test abortado.${NC}"
fi

# ❌ TEST DELETE INEXISTENTE
echo -e "${YELLOW}Test 2: Eliminar experiencia inexistente${NC}"
FAKE_ID="000000000000000000000000"
curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/$FAKE_ID" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}"
echo -e "${RED}❌ Esperado: 404 - Not Found${NC}\n"

# ❌ TEST SIN AUTENTICACIÓN
if [ "$EXP_ID" != "null" ] && [ -n "$EXP_ID" ]; then
  echo -e "${YELLOW}Test 3: Eliminar experiencia sin autenticación${NC}"
  curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/$EXP_ID"
  echo -e "${RED}❌ Esperado: 401 - Unauthorized${NC}\n"
fi

# 💥 TEST MALFORMED ID
echo -e "${YELLOW}Test 4: Eliminar experiencia con ID malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/123" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}"
echo -e "${RED}❌ Esperado: 400 - ValidationError (ID malformado)${NC}\n"

# Cobertura de casos
echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Eliminar experiencia existente"
echo -e "   • Not Found: Eliminar experiencia inexistente"
echo -e "   • Unauthorized: Eliminar sin autenticación"
echo -e "   • Validation Error: ID malformado"
echo -e "\n${BLUE}💡 Tip: Usa jq para parsear la respuesta si lo necesitas${NC}"
