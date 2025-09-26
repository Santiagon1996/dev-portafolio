import { Experience, IExperience } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateUpdateExperience, validateId } = validators;
const { SystemError, ValidationError, DuplicityError, NotFoundError } = errors;
/**
 * updateExperience - Función para actualizar una experiencia en la base de datos.
 *
 * @param experienceData - Objeto con el ID de la experiencia y los datos a actualizar (jobTitle, company, startDate, endDate, description).
 * @returns Promise<IExperience> - Retorna una promesa que resuelve con el documento Experiencia actualizado tipado.
 *
 * Explicación:
 * 1. Se define la interfaz ExperienceInput para tipar claramente la estructura de entrada esperada.
 * 2. Se validan los datos usando `validateUpdateExperience`.
 * 3. Se separan el ID de los datos a actualizar para evitar conflictos.
 * 4. Se verifica si ya existe otra experiencia con el mismo jobTitle o company (evitar duplicados).
 * 5. Se actualiza la experiencia usando `Experience.findByIdAndUpdate()` con `{ new: true }`.
 * 6. Si no se encuentra una experiencia con ese ID, se lanza un error personalizado `NotFoundError`.
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
interface ExperienceUpdateInput {
    id: string;
    company?: string;
    role?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string,
    technologies?: string[],
    isCurrent?: boolean;
}

// ** Función asíncrona que devuelve una promesa de tipo IExperience **
export const updateExperience = async (experienceData: ExperienceUpdateInput): Promise<IExperience> => {
    try {
        // 1. Validar que el ID sea válido y obtener el ID validado
        const validatedId = validateId(experienceData.id);

        // 2. Separar los datos a actualizar (sin el ID)
        //El underscore _ es una convención que significa "variable no utilizada" o "variable descartada":
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = experienceData;

        // 3. 🔒 VALIDACIÓN CRÍTICA: Validar datos de actualización con Zod
        // Usamos 'updateExperienceSchema' que permite campos opcionales pero valida formato
        const validatedUpdateData = validateUpdateExperience(updateData);

        // 4. ⚠️ VALIDACIÓN CRÍTICA: Verificar duplicidad de título
        //    Solo ejecutamos esta validación SI se está actualizando el título
        if (validatedUpdateData.role) {

            // 🧠 LÓGICA SUTIL: Necesitamos buscar experiencias que podrían generar conflicto
            // Pero EXCLUYENDO la experiencia actual que estamos actualizando
            const existingExperience = await Experience.findOne({

                // 📋 OPERADOR $and: AMBAS condiciones siguientes deben ser verdaderas
                $and: [ //operador lógico AND de MongoDB ($$)AMBAS condiciones deben ser verdad

                    // ✋ CONDICIÓN 1: Excluir la experiencia actual
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
                            { company: validatedUpdateData.company },

                            // 🏷️ CASO B: Conflicto con slug existente (CORREGIDO)
                            // ❌ ANTES: { slug: updateData.company } - Comparaba título crudo con slug
                            // ✅ AHORA: { slug: slugify(updateData.company) } - Compara slug con slug
                            //
                            // Ejemplo práctico:
                            // updateData.company = "Mi Título Genial!"
                            // slugify() lo convierte a "mi-titulo-genial"
                            // Pregunta: "¿Ya existe un blog con slug 'mi-titulo-genial'?"
                            { slug: slugify(validatedUpdateData.company ?? "") } // ✅ Verificar contra slug generado correctamente

                            // 🚨 ¿Por qué verificar ambos casos?
                            // - company: Evita títulos exactamente iguales
                            // - slug: Evita URLs conflictivas en las rutas del blog
                        ]
                    }
                ]

                // 📖 TRADUCCIÓN COMPLETA DE LA QUERY:
                // "Busca un blog que:
                //  1. NO sea el que estoy actualizando Y
                //  2. (Tenga el mismo título O tenga un slug que coincidiría con mi nuevo título slugificado)"
            });

            if (existingExperience) {
                throw new DuplicityError(
                    "Ya existe una experiencia con ese título",
                    {
                        company: validatedUpdateData.company,
                        // 🔍 Información adicional para debugging
                        conflictsWith: existingExperience._id.toString(),
                        conflictType: existingExperience.company === validatedUpdateData.company ? 'company' : 'slug',
                        existingCompany: existingExperience.company,
                        existingSlug: existingExperience.slug
                    },
                    "Experiencia duplicado en actualización"
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
        const updatedExperience = await Experience.findByIdAndUpdate(
            validatedId,              // 🎯 ID del experience a actualizar (ya validado)
            validatedUpdateData,      // 📝 Datos a actualizar (validados con Zod y sin el ID)
            {
                new: true,           // 🔄 Retorna el documento DESPUÉS de la actualización
                runValidators: true  // ✅ Ejecuta validaciones de schema (required, length, etc.)
            }
        );

        // 🚨 VERIFICACIÓN CRÍTICA: ¿El experience existe realmente?
        // Aunque validamos el ID, el experience podría haber sido eliminado entre validación y actualización
        if (!updatedExperience) {
            throw new NotFoundError(
                "No se encontró un experience con ese ID", // 👤 Mensaje para frontend/usuario
                { id: validatedId },                      // 🔍 Datos para debugging
                "Experience no encontrado para actualización" // 📋 Mensaje interno para logs
            );
        }

        // 🎉 ÉXITO: Retornamos el experience actualizado
        // El slug se habrá regenerado automáticamente si cambió el título (gracias al pre hook)
        return updatedExperience;
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
