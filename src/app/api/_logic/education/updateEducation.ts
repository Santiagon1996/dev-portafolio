import { Education, IEducation } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateUpdateEducation, validateId } = validators;
const { SystemError, ValidationError, DuplicityError, NotFoundError } = errors;
/**
 * updateEducation - Función para actualizar una educación en la base de datos.
 *
 * @param educationData - Objeto con el ID de la educación y los datos a actualizar (degree, content, author).
 * @returns Promise<IEducation> - Retorna una promesa que resuelve con el documento Educación actualizado tipado.
 *
 * Explicación:
 * 1. Se define la interfaz EducationInput para tipar claramente la estructura de entrada esperada.
 * 2. Se validan los datos usando `validateUpdateEducation`.
 * 3. Se separan el ID de los datos a actualizar para evitar conflictos.
 * 4. Se verifica si ya existe otra educación con el mismo degree o content (evitar duplicados).
 * 5. Se actualiza la educación usando `Education.findByIdAndUpdate()` con `{ new: true }`.
 * 6. Si no se encuentra una educación con ese ID, se lanza un error personalizado `NotFoundError`.
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
interface EducationUpdateInput {
    id: string;
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
}

// ** Función asíncrona que devuelve una promesa de tipo IEducation **
export const updateEducation = async (educationData: EducationUpdateInput): Promise<IEducation> => {
    try {
        // 1. Validar que el ID sea válido y obtener el ID validado
        const validatedId = validateId(educationData.id);

        // 2. Separar los datos a actualizar (sin el ID)
        //El underscore _ es una convención que significa "variable no utilizada" o "variable descartada":
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = educationData;

        // 3. 🔒 VALIDACIÓN CRÍTICA: Validar datos de actualización con Zod
        // Usamos 'updateEducationSchema' que permite campos opcionales pero valida formato
        const validatedUpdateData = validateUpdateEducation(updateData);

        // 4. ⚠️ VALIDACIÓN CRÍTICA: Verificar duplicidad de título
        //    Solo ejecutamos esta validación SI se está actualizando el título
        if (validatedUpdateData.degree) {

            // 🧠 LÓGICA SUTIL: Necesitamos buscar educations que podrían generar conflicto
            // Pero EXCLUYENDO el education actual que estamos actualizando
            const existingEducation = await Education.findOne({

                // 📋 OPERADOR $and: AMBAS condiciones siguientes deben ser verdaderas
                $and: [ //operador lógico AND de MongoDB ($$)AMBAS condiciones deben ser verdad

                    // ✋ CONDICIÓN 1: Excluir el education actual
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
                            { degree: validatedUpdateData.degree },

                            // 🏷️ CASO B: Conflicto con slug existente (CORREGIDO)
                            // ❌ ANTES: { slug: updateData.degree } - Comparaba título crudo con slug
                            // ✅ AHORA: { slug: slugify(updateData.degree) } - Compara slug con slug
                            // 
                            // Ejemplo práctico:
                            // updateData.degree = "Mi Título Genial!"
                            // slugify() lo convierte a "mi-titulo-genial"
                            // Pregunta: "¿Ya existe un blog con slug 'mi-titulo-genial'?"
                            { slug: slugify(validatedUpdateData.degree) } // ✅ Verificar contra slug generado correctamente

                            // 🚨 ¿Por qué verificar ambos casos?
                            // - degree: Evita títulos exactamente iguales
                            // - slug: Evita URLs conflictivas en las rutas del blog
                        ]
                    }
                ]

                // 📖 TRADUCCIÓN COMPLETA DE LA QUERY:
                // "Busca un blog que:
                //  1. NO sea el que estoy actualizando Y
                //  2. (Tenga el mismo título O tenga un slug que coincidiría con mi nuevo título slugificado)"
            });

            if (existingEducation) {
                throw new DuplicityError(
                    "Ya existe un education con ese título",
                    {
                        degree: validatedUpdateData.degree,
                        // 🔍 Información adicional para debugging
                        conflictsWith: existingEducation._id.toString(),
                        conflictType: existingEducation.degree === validatedUpdateData.degree ? 'degree' : 'slug',
                        existingdegree: existingEducation.degree,
                        existingSlug: existingEducation.slug
                    },
                    "Estudio duplicado en actualización"
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
        const updatedEducation = await Education.findByIdAndUpdate(
            validatedId,              // 🎯 ID del education a actualizar (ya validado)
            validatedUpdateData,      // 📝 Datos a actualizar (validados con Zod y sin el ID)
            {
                new: true,           // 🔄 Retorna el documento DESPUÉS de la actualización
                runValidators: true  // ✅ Ejecuta validaciones de schema (required, length, etc.)
            }
        );

        // 🚨 VERIFICACIÓN CRÍTICA: ¿El education existe realmente?
        // Aunque validamos el ID, el education podría haber sido eliminado entre validación y actualización
        if (!updatedEducation) {
            throw new NotFoundError(
                "No se encontró un education con ese ID", // 👤 Mensaje para frontend/usuario
                { id: validatedId },                      // 🔍 Datos para debugging
                "Education no encontrado para actualización" // 📋 Mensaje interno para logs
            );
        }

        // 🎉 ÉXITO: Retornamos el education actualizado
        // El slug se habrá regenerado automáticamente si cambió el título (gracias al pre hook)
        return updatedEducation;
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
