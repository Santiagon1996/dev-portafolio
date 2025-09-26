/\*
🎓 GUÍA COMPLETA: Lógicas Sutiles en updateBlog.ts

Esta guía explica paso a paso las decisiones de diseño y lógicas complejas
implementadas en la función updateBlog.

=== 📋 TABLA DE CONTENIDOS ===

1. El Problema del Destructuring
2. La Query MongoDB Compleja
3. Casos Edge y Por Qué Importan
4. Optimizaciones de Performance
5. Ejemplos Prácticos Completos

=== 1. 🎯 EL PROBLEMA DEL DESTRUCTURING ===

❓ ¿Por qué usamos const { id: \_, ...updateData } = blogData;?

PROBLEMA: Si pasamos blogData completo a MongoDB:

```javascript
// ❌ MALO - Intentaría actualizar el _id también
await BlogPost.findByIdAndUpdate(validatedId, blogData);
// MongoDB: Error! No puedes cambiar el _id de un documento
```

SOLUCIÓN: Separamos el ID de los datos:

```javascript
// ✅ BUENO - Solo enviamos campos actualizables
const { id: _, ...updateData } = blogData;
await BlogPost.findByIdAndUpdate(validatedId, updateData);
```

=== 2. 🔍 LA QUERY MONGODB COMPLEJA ===

❓ ¿Por qué esta query tan complicada?

Query Simple (INCORRECTA):

```javascript
// ❌ PROBLEMA: Se encontraría a sí mismo
const existing = await BlogPost.findOne({ title: updateData.title });
```

Query Correcta (NUESTRA):

```javascript
// ✅ SOLUCIÓN: Excluye el blog actual Y verifica conflictos
const existing = await BlogPost.findOne({
  $and: [
    { _id: { $ne: validatedId } }, // No el actual
    {
      $or: [
        { title: updateData.title }, // Título duplicado
        { slug: slugify(updateData.title) }, // Slug conflictivo
      ],
    },
  ],
});
```

=== 3. 🚨 CASOS EDGE Y POR QUÉ IMPORTAN ===

CASO 1: Blog se encuentra a sí mismo
Sin { \_id: { $ne: validatedId } }:

```
Blog actual: { _id: "123", title: "Mi Blog" }
Actualizando: { id: "123", title: "Mi Blog" }
Query encuentra: ¡EL MISMO BLOG!
Resultado: DuplicityError FALSO ❌
```

CASO 2: Conflicto de Slug
Sin verificar slug:

```
Blog existente: { _id: "456", title: "Tutorial", slug: "tutorial-avanzado" }
Actualizando: { id: "123", title: "Tutorial Avanzado" }
→ slugify("Tutorial Avanzado") = "tutorial-avanzado"
Resultado: URL conflictiva sin detectar ❌
```

CASO 3: Actualización Concurrente
Sin verificar existencia después de update:

```
T1: Valida blog "123" existe ✅
T2: Elimina blog "123"
T1: Intenta actualizar blog "123" → null
T1: Sin verificación, retorna null ❌
```

=== 4. ⚡ OPTIMIZACIONES DE PERFORMANCE ===

ANTES (Menos Eficiente):

```javascript
// 2 consultas separadas
const blog = await BlogPost.findById(validatedId);
Object.assign(blog, updateData);
await blog.save();
```

DESPUÉS (Más Eficiente):

```javascript
// 1 consulta atómica
const blog = await BlogPost.findByIdAndUpdate(validatedId, updateData, {
  new: true, // Retorna documento actualizado
  runValidators: true, // Valida en la BD también
});
```

Ventajas:

- 50% menos consultas
- Operación atómica (no hay condiciones de carrera)
- Validación automática de schema

=== 5. 🎬 EJEMPLOS PRÁCTICOS COMPLETOS ===

ESCENARIO A: Actualización exitosa

```
Estado inicial:
Blog 123: { title: "Mi Primer Blog", slug: "mi-primer-blog" }
Blog 456: { title: "Otro Blog", slug: "otro-blog" }

Actualización:
updateBlog({ id: "123", title: "Mi Blog Mejorado" })

Flujo:
1. validateId("123") ✅
2. { id: _, ...updateData } = { title: "Mi Blog Mejorado" }
3. Buscar conflictos:
   - _id != "123" AND (title = "Mi Blog Mejorado" OR slug = "mi-blog-mejorado")
   - No encuentra nada ✅
4. findByIdAndUpdate("123", { title: "Mi Blog Mejorado" })
5. Pre-hook actualiza slug automáticamente
6. Retorna: { _id: "123", title: "Mi Blog Mejorado", slug: "mi-blog-mejorado" }

RESULTADO: ✅ ÉXITO
```

ESCENARIO B: Conflicto detectado

```
Estado inicial:
Blog 123: { title: "Mi Blog", slug: "mi-blog" }
Blog 456: { title: "Tutorial Genial", slug: "tutorial-genial" }

Actualización:
updateBlog({ id: "123", title: "Tutorial Genial" })

Flujo:
1. validateId("123") ✅
2. { id: _, ...updateData } = { title: "Tutorial Genial" }
3. Buscar conflictos:
   - _id != "123" AND (title = "Tutorial Genial" OR slug = "tutorial-genial")
   - ¡ENCUENTRA Blog 456! ❌
4. throw DuplicityError

RESULTADO: ❌ ERROR - Conflicto detectado y prevenido
```

=== 💡 LECCIONES APRENDIDAS ===

1. **Destructuring Inteligente**: El `_` comunica intención claramente
2. **Queries Defensivas**: Siempre considerar casos edge
3. **Validación Dual**: Título Y slug para máxima integridad
4. **Performance Matters**: Operaciones atómicas cuando sea posible
5. **Error Handling Rico**: Información detallada para debugging

Esta implementación demuestra que las "lógicas sutiles" son la diferencia
entre código que funciona y código que funciona BIEN en producción. 🚀

\*/
