import { BlogPost, IBlogPost } from "@lib/db/models/index";  // Aquí usas un tipo (IBlogPost), eso es TS
import { errors, validators } from "@shared";
import { slugify } from '@lib/utils/slugify';

const { validateId, validateUpdateBlog } = validators;
const { NotFoundError, SystemError, ValidationError, DuplicityError } = errors;

/**
 * updateBlog - Función para actualizar un blog en la base de datos.
 *
 * @param blogData - Objeto con el ID del blog y los datos a actualizar (title, content, author).
 * @returns Promise<IBlogPost> - Retorna una promesa que resuelve con el documento Blog actualizado tipado.
 *
 * Explicación:
 * 1. Se define la interfaz BlogInput para tipar claramente la estructura de entrada esperada.
 * 2. Se validan dos cosas: el ID usando `validateId` y los datos usando `validateUserRegister`.
 * 3. Se separan el ID de los datos a actualizar para evitar conflictos.
 * 4. Se verifica si ya existe otro blog con el mismo title o content (evitar duplicados).
 * 5. Se actualiza el blog usando `BlogPost.findByIdAndUpdate()` con `{ new: true }`.
 * 6. Si no se encuentra un blog con ese ID, se lanza un error personalizado `NotFoundError`.
 * 7. Si la actualización es exitosa, se retorna el documento actualizado.
 * 8. El bloque try/catch maneja todos los tipos de errores posibles.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 * - Validación dual: ID y datos de actualización.
 */


// ** Definición de una interfaz para tipar el objeto que esperas recibir **
interface BlogUpdateInput {
    id: string;
    title?: string;
    content?: string;
    summary?: string;
    tags?: string[];
    author?: string;
    isPublished?: boolean;
    publishedAt?: Date | string;
}

// ** Función asíncrona que devuelve una promesa de tipo IBlogPost **
export const updateBlog = async (blogData: BlogUpdateInput): Promise<IBlogPost> => {
    try {
        // 1. Validar que el ID sea válido y obtener el ID validado
        const validatedId = validateId(blogData.id);

        // 2. Separar los datos a actualizar (sin el ID)
        //El underscore _ es una convención que significa "variable no utilizada" o "variable descartada":
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = blogData;

        // 3. 🔒 VALIDACIÓN CRÍTICA: Validar datos de actualización con Zod
        // Usamos 'updateBlogSchema' que permite campos opcionales pero valida formato
        const validatedUpdateData = validateUpdateBlog(updateData);

        // 4. ⚠️ VALIDACIÓN CRÍTICA: Verificar duplicidad de título
        //    Solo ejecutamos esta validación SI se está actualizando el título
        if (validatedUpdateData.title) {

            // 🧠 LÓGICA SUTIL: Necesitamos buscar blogs que podrían generar conflicto
            // Pero EXCLUYENDO el blog actual que estamos actualizando
            const existingBlog = await BlogPost.findOne({

                // 📋 OPERADOR $and: AMBAS condiciones siguientes deben ser verdaderas
                $and: [ //operador lógico AND de MongoDB ($$)AMBAS condiciones deben ser verdad

                    // ✋ CONDICIÓN 1: Excluir el blog actual
                    // $ne = "Not Equal" (No igual)
                    // Traducción: "Dame blogs cuyo _id NO sea el del blog que estoy actualizando"
                    // ¿Por qué? Sin esto, el blog se encontraría a sí mismo como "duplicado"
                    { _id: { $ne: validatedId } }, // Excluir el blog actual

                    // 🔍 CONDICIÓN 2: Buscar conflictos potenciales
                    // Usamos $or porque CUALQUIERA de estos casos es problemático
                    {
                        $or: [

                            // 📝 CASO A: Título directo duplicado
                            // "¿Ya existe otro blog con exactamente este título?"
                            { title: validatedUpdateData.title },

                            // 🏷️ CASO B: Conflicto con slug existente (CORREGIDO)
                            // ❌ ANTES: { slug: updateData.title } - Comparaba título crudo con slug
                            // ✅ AHORA: { slug: slugify(updateData.title) } - Compara slug con slug
                            // 
                            // Ejemplo práctico:
                            // updateData.title = "Mi Título Genial!"
                            // slugify() lo convierte a "mi-titulo-genial"
                            // Pregunta: "¿Ya existe un blog con slug 'mi-titulo-genial'?"
                            { slug: slugify(validatedUpdateData.title) } // ✅ Verificar contra slug generado correctamente

                            // 🚨 ¿Por qué verificar ambos casos?
                            // - title: Evita títulos exactamente iguales
                            // - slug: Evita URLs conflictivas en las rutas del blog
                        ]
                    }
                ]

                // 📖 TRADUCCIÓN COMPLETA DE LA QUERY:
                // "Busca un blog que:
                //  1. NO sea el que estoy actualizando Y
                //  2. (Tenga el mismo título O tenga un slug que coincidiría con mi nuevo título slugificado)"
            });

            if (existingBlog) {
                throw new DuplicityError(
                    "Ya existe un blog con ese título",
                    {
                        title: validatedUpdateData.title,
                        // 🔍 Información adicional para debugging
                        conflictsWith: existingBlog._id.toString(),
                        conflictType: existingBlog.title === validatedUpdateData.title ? 'title' : 'slug',
                        existingTitle: existingBlog.title,
                        existingSlug: existingBlog.slug
                    },
                    "Blog duplicado en actualización"
                );
            }
        }

        // 5. 🚀 ACTUALIZACIÓN OPTIMIZADA: Usando findByIdAndUpdate
        //
        // ⚡ ¿Por qué findByIdAndUpdate en lugar de findById + save()?
        // - Operación ATÓMICA: Una sola consulta a la BD en lugar de dos
        // - Mejor rendimiento: Menos round-trips a MongoDB
        // - Concurrencia segura: Evita condiciones de carrera
        //
        // 📋 Parámetros explicados:
        const updatedBlog = await BlogPost.findByIdAndUpdate(
            validatedId,              // 🎯 ID del blog a actualizar (ya validado)
            validatedUpdateData,      // 📝 Datos a actualizar (validados con Zod y sin el ID)
            {
                new: true,           // 🔄 Retorna el documento DESPUÉS de la actualización
                runValidators: true  // ✅ Ejecuta validaciones de schema (required, length, etc.)
            }
        );

        // 🚨 VERIFICACIÓN CRÍTICA: ¿El blog existe realmente?
        // Aunque validamos el ID, el blog podría haber sido eliminado entre validación y actualización
        if (!updatedBlog) {
            throw new NotFoundError(
                "No se encontró un blog con ese ID", // 👤 Mensaje para frontend/usuario
                { id: validatedId },                  // 🔍 Datos para debugging
                "Blog no encontrado para actualización" // 📋 Mensaje interno para logs
            );
        }

        // 🎉 ÉXITO: Retornamos el blog actualizado
        // El slug se habrá regenerado automáticamente si cambió el título (gracias al pre hook)
        return updatedBlog;
        // ** TS: Definir el tipo del parámetro error como unknown para un control más seguro **
    } catch (error: unknown) {

        // ** TS: Comprobación de tipo seguro usando instanceof para errores específicos **
        // ** TS: Si el error es una instancia de ValidationError, NotFoundError o DuplicityError, se maneja específicamente **
        if (error instanceof ValidationError) {
            // Log detallado para el dev 
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            // Lo relanzas para que lo maneje el frontend o API
            throw error;
        }
        if (error instanceof NotFoundError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error; // Lo relanzas para que el handler externo lo maneje
        }
        if (error instanceof DuplicityError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error;
        }

        // ** TS: si el error es una instancia de Error, se maneja como tal **
        if (error instanceof Error) {
            // Errores no esperados se envuelven en SystemError
            console.error(`[SystemError] ${error.message}`);
            throw new SystemError(
                "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.",
                { message: error.message }
            );
        }
        // ** TS: para cualquier otro tipo de error se convierte a string **
        console.error(`[UnknownError] ${String(error)}`);
        throw new SystemError(
            "Error desconocido. Contacte a soporte.",
            { message: String(error) }
        );
    }
};
