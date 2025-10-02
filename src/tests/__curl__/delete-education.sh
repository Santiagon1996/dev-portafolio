#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/education"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGUyYjEzNWI5ZWQ4NmQxOGFhNzgwNyIsImlhdCI6MTc1OTM5MDQ5OSwiZXhwIjoxNzU5Mzk0MDk5fQ.O7YeAQ3elTdndMCPB3Thl9YbqVDXQqxHYefhY0vrt-Y" # <-- Pon aquí tu token JWT"
# Crear una educación para eliminar (Happy Path)
echo -e "${BLUE}🚀 TESTING DELETE EDUCATION ENDPOINT${NC}"
echo -e "${BLUE}===== Basado en casos de deleteEducation.test.ts y addEducation.sh =====${NC}\n"

echo -e "${YELLOW}Creando educación para eliminar...${NC}"
EDU_ID=$(curl -s -X POST $API_URL \
  -H "Cookie: accessToken=${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "degree": "Licenciatura en Pruebas",
    "institution": "Universidad Test",
    "field": "Testing",
    "startDate": "2020-01-01",
    "description": "Esta educación será eliminada en el test de DELETE."
  }' | jq -r '._id')

echo -e "${GREEN}Educación creada con ID: $EDU_ID${NC}\n"

# ✅ TEST DELETE
if [ "$EDU_ID" != "null" ] && [ -n "$EDU_ID" ]; then
  echo -e "${YELLOW}Test 1: Eliminar educación existente${NC}"
  curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/$EDU_ID" \
    -H "Cookie: accessToken=${ADMIN_TOKEN}"
  echo -e "${GREEN}✅ Esperado: 200 Deleted${NC}\n"
else
  echo -e "${RED}No se pudo crear la educación para eliminar. Test abortado.${NC}"
fi

# ❌ TEST DELETE INEXISTENTE
echo -e "${YELLOW}Test 2: Eliminar educación inexistente${NC}"
FAKE_ID="000000000000000000000000"
curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/$FAKE_ID" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}"
echo -e "${RED}❌ Esperado: 404 - Not Found${NC}\n"

# ❌ TEST SIN AUTENTICACIÓN
if [ "$EDU_ID" != "null" ] && [ -n "$EDU_ID" ]; then
  echo -e "${YELLOW}Test 3: Eliminar educación sin autenticación${NC}"
  curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/$EDU_ID"
  echo -e "${RED}❌ Esperado: 401 - Unauthorized${NC}\n"
fi

# 💥 TEST MALFORMED ID
echo -e "${YELLOW}Test 4: Eliminar educación con ID malformado${NC}"
curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API_URL/123" \
  -H "Cookie: accessToken=${ADMIN_TOKEN}"
echo -e "${RED}❌ Esperado: 400 - ValidationError (ID malformado)${NC}\n"

# Cobertura de casos
echo -e "${YELLOW}🟡 COBERTURA DE CASOS:${NC}"
echo -e "   • Happy Path: Eliminar educación existente"
echo -e "   • Not Found: Eliminar educación inexistente"
echo -e "   • Unauthorized: Eliminar sin autenticación"
echo -e "   • Validation Error: ID malformado"
echo -e "\n${BLUE}💡 Tip: Usa jq para parsear la respuesta si lo necesitas${NC}"
