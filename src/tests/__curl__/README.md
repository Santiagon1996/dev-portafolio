# 🧪 Tests cURL para APIs del Sistema

Este directorio contiene scripts de prueba cURL para validar todas las funcionalidades de las APIs del sistema (Administradores y Blogs).

## 📁 Archivos de Test

### 📋 APIs de Administradores

#### 1. `add-admin.sh` - Registro de Administradores

**Endpoint:** `POST /api/admin/register`

**Tests incluidos:**

- ✅ Crear admin válido
- ❌ Errores de validación (email/password inválidos)
- ❌ Error de duplicidad (usuario ya existente)

#### 2. `set-admin.sh` - Login de Administradores

**Endpoint:** `POST /api/admin/login`

**Tests incluidos:**

- ✅ Login válido con token JWT
- ❌ Credenciales incorrectas
- ❌ Errores de validación

#### 3. `admin-by-id.sh` - Operaciones CRUD por ID

**Endpoints:** GET/PATCH/DELETE `/api/admin/[adminId]`

**Tests incluidos:**

- ✅ CRUD completo con autenticación
- ❌ Errores de autorización
- ❌ Validación de ObjectId

### 📝 APIs de Blogs

#### 4. `add-blog.sh` - Crear Blogs (16 tests)

**Endpoint:** `POST /api/blog`

**Tests incluidos:**

##### ✅ Happy Path (6 tests):

- Blog completo con todos los campos
- Blog mínimo (solo campos obligatorios)
- Campos opcionales null/undefined
- Caracteres especiales y emojis
- Arrays vacíos vs null
- Fechas ISO válidas

##### ❌ Validation Errors (6 tests):

- Título muy corto (< 5 caracteres)
- Título muy largo (> 200 caracteres)
- Contenido muy corto (< 20 caracteres)
- Múltiples errores de validación
- Campos faltantes (título/contenido)

##### 🔄 Duplicity Errors (2 tests):

- Duplicidad por título exacto
- Duplicidad por slug generado

##### 💥 Malformed Requests (2 tests):

- JSON malformado
- Content-Type incorrecto

#### 5. `add-blog-verbose.sh` - Tests detallados

**Muestra respuestas completas del servidor para debugging**

## 🧪 Casos de Test Basados en Unit Tests

Los tests cURL están diseñados para reflejar los mismos casos que los unit tests:

### Validaciones de Schema (Zod):

```javascript
// De schemas.ts
title: z.string().min(5).max(200);
content: z.string().min(20);
slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
```

### Casos de Duplicidad:

```javascript
// De addBlog.test.ts - Verificación por título y slug
$or: [{ title: "Título exacto" }, { slug: "titulo-generado-por-slugify" }];
```

### Casos Edge:

- **Caracteres especiales**: Unicode, emojis, símbolos
- **Arrays**: Vacíos vs null vs undefined
- **Fechas**: ISO 8601 válidas e inválidas
- **JSON**: Malformado vs válido

## 🚀 Uso Rápido

### Para APIs de Administradores:

```bash
# Flujo completo
bash add-admin.sh      # Crear admin
bash set-admin.sh      # Login y obtener token
bash admin-by-id.sh    # CRUD con autenticación
```

### Para APIs de Blogs:

```bash
# Tests completos
bash add-blog.sh           # 16 tests comprehensivos
bash add-blog-verbose.sh   # Ver respuestas detalladas
```

## 📊 Resumen de Cobertura

### addBlog Tests (16 total):

- ✅ **6 Success cases**: Blogs válidos, caracteres especiales, fechas
- ❌ **10 Error cases**: Validación, duplicidad, JSON malformado

### Tipos de Error Cubiertos:

- **ValidationError (400)**: Schema Zod violations
- **DuplicityError (409)**: Títulos/slugs duplicados
- **SystemError (500)**: Errores internos
- **JSON Parse Error (400)**: Formato inválido

## 📁 Archivos de Test

### 1. `add-admin.sh` - Registro de Administradores

**Endpoint:** `POST /api/admin/register`

**Tests incluidos:**

- ✅ Crear admin válido
- ❌ Errores de validación (email/password inválidos)
- ❌ Error de duplicidad (usuario ya existente)

**Uso:**

```bash
bash add-admin.sh
```

### 2. `set-admin.sh` - Login de Administradores

**Endpoint:** `POST /api/admin/login`

**Tests incluidos:**

- ✅ Login válido
- ❌ Credenciales incorrectas (password erróneo)
- ❌ Usuario no encontrado
- ❌ Errores de validación (campos vacíos, datos cortos, campos faltantes)
- ❌ Petición sin Content-Type

**Uso:**

```bash
bash set-admin.sh
```

**Importante:**

- El Test 1 exitoso devuelve un objeto con `token` JWT
- Copia el valor del campo `token` para usar en `admin-by-id.sh`

**Ejemplo de respuesta exitosa:**

```json
{
  "message": "Inicio de sesión exitoso",
  "admin": {
    "id": "673d9a6a123456789abcdef0",
    "username": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. `admin-by-id.sh` - Operaciones por ID

**Endpoints:**

- `GET /api/admin/[adminId]`
- `PATCH /api/admin/[adminId]`
- `DELETE /api/admin/[adminId]`

**Tests incluidos:**

#### GET (Tests 1-3):

- ✅ Obtener admin por ID válido
- ❌ Admin no encontrado (ID inválido)
- ❌ Sin token de autenticación

#### PATCH (Tests 4-8):

- ✅ Actualizar admin válido
- ❌ Errores de validación
- ❌ Error de duplicidad (email existente)
- ❌ Admin no encontrado (ID inválido)
- ❌ Sin autenticación

#### DELETE (Tests 9-12):

- ✅ Eliminar admin válido
- ❌ Admin no encontrado (ID inválido)
- ❌ Sin autenticación
- ❌ ID con formato inválido

**Configuración requerida:**

```bash
# Editar variables en admin-by-id.sh
ADMIN_ID="689c854fd6a429c839d9a0df"  # ID válido de tu BD
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWM4NTRmZDZhNDI5YzgzOWQ5YTBkZiIsImlhdCI6MTc1NTA4ODIxNSwiZXhwIjoxNzU1MDkxODE1fQ.vHgqs0IRCGHnPRNhI00_A5YvR5gq00GWsEt5p_ySY7A"  # Token del login
```

**Uso:**

```bash
bash admin-by-id.sh
```

## 🚀 Flujo de Pruebas Completo

### Paso 1: Crear un admin

```bash
bash add-admin.sh
```

### Paso 2: Hacer login y obtener token

```bash
bash set-admin.sh
# Copia el valor del campo "token" de la respuesta exitosa
```

### Paso 3: Configurar y probar operaciones por ID

```bash
# 1. Editar admin-by-id.sh con un ADMIN_ID válido
# 2. Pegar el AUTH_TOKEN del paso anterior
# 3. Ejecutar
bash admin-by-id.sh
```

## 📝 Códigos de Estado Esperados

| Test Scenario        | Status Code | Error Type       |
| -------------------- | ----------- | ---------------- |
| ✅ Operación exitosa | 200/201     | -                |
| ❌ Validación        | 400         | ValidationError  |
| ❌ Sin auth          | 401         | CredentialsError |
| ❌ No encontrado     | 404         | NotFoundError    |
| ❌ Duplicado         | 409         | DuplicityError   |
| ❌ Error interno     | 500         | SystemError      |

## 🛠️ Configuración de Desarrollo

### Prerrequisitos:

1. Servidor corriendo en `http://localhost:3000`
2. Base de datos MongoDB conectada
3. Bash/shell disponible

### Variables de entorno necesarias:

- JWT_SECRET (para tokens de autenticación)
- MONGODB_URI (conexión a base de datos)

### Para usar con otro host/puerto:

```bash
# Editar en cada archivo .sh
API_URL="http://tu-host:puerto/api/admin/..."
```

## 🔍 Interpretando Resultados

### Respuesta exitosa:

```json
{
  "message": "Inicio de sesión exitoso",
  "admin": {
    "id": "673d9a6a123456789abcdef0",
    "username": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..." // Solo en login
}
```

### Respuesta de error:

```json
{
  "error": "ValidationError",
  "message": "Los datos son inválidos",
  "details": {
    "email": ["Email debe ser válido"]
  }
}
```

## 📋 Checklist de Validación

- [ ] Todas las operaciones CRUD funcionan correctamente
- [ ] Errores de validación muestran mensajes claros
- [ ] Autenticación JWT funciona en rutas protegidas
- [ ] Manejo de errores de duplicidad
- [ ] Respuestas de error son consistentes
- [ ] Códigos de estado HTTP correctos
- [ ] Seguridad: passwords no se devuelven en respuestas

## 🐛 Troubleshooting

### Error: "Connection refused"

- Verificar que el servidor esté corriendo
- Comprobar puerto y host en los scripts

### Error: "Unauthorized" (401)

- Verificar que el token JWT sea válido
- Comprobar que no haya expirado
- Asegurar que el header Authorization esté presente

### Error: "Admin not found" (404)

- Verificar que el ADMIN_ID exista en la base de datos
- Comprobar formato de ObjectId MongoDB

### Error: "Validation failed" (400)

- Revisar esquemas de validación Zod
- Verificar formato de datos enviados
