import { Skill, ISkill } from "@lib/db/models/index";
import { errors, validators } from "@shared";
import { slugify } from "@lib/utils/slugify";

const { validateUpdateSkill, validateId } = validators;
const { SystemError, ValidationError, DuplicityError, NotFoundError } = errors;
/**
 * updateSkill - Función para actualizar una habilidad en la base de datos.
 *
 * @param skillData - Objeto con el ID de la habilidad y los datos a actualizar (name, description).
 * @returns Promise<ISkill> - Retorna una promesa que resuelve con el documento Habilidad actualizado tipado.
 *
 * Explicación:
 * 1. Se define la interfaz SkillInput para tipar claramente la estructura de entrada esperada.
 * 2. Se validan los datos usando `validateUpdateSkill`.
 * 3. Se separan el ID de los datos a actualizar para evitar conflictos.
 * 4. Se verifica si ya existe otra habilidad con el mismo nombre (evitar duplicados).
 * 5. Se actualiza la habilidad usando `Skill.findByIdAndUpdate()` con `{ new: true }`.
 * 6. Si no se encuentra una habilidad con ese ID, se lanza un error personalizado `NotFoundError`.
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
interface SkillUpdateInput {
    id: string;
    name?: string;
    level?: string;
    category?: string;

}

// ** Función asíncrona que devuelve una promesa de tipo ISkill **
export const updateSkill = async (skillData: SkillUpdateInput): Promise<ISkill> => {
    try {
        // 1. Validar que el ID sea válido y obtener el ID validado
        const validatedId = validateId(skillData.id);

        // 2. Separar los datos a actualizar (sin el ID)
        //El underscore _ es una convención que significa "variable no utilizada" o "variable descartada":
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...updateData } = skillData;

        // 3. 🔒 VALIDACIÓN CRÍTICA: Validar datos de actualización con Zod
        // Usamos 'updateProjectSchema' que permite campos opcionales pero valida formato
        const validatedUpdateData = validateUpdateSkill(updateData);

        // 4. ⚠️ VALIDACIÓN CRÍTICA: Verificar duplicidad de nombre
        //    Solo ejecutamos esta validación SI se está actualizando el nombre
        if (validatedUpdateData.name) {

            // 🧠 LÓGICA SUTIL: Necesitamos buscar habilidades que podrían generar conflicto
            // Pero EXCLUYENDO la habilidad actual que estamos actualizando
            const existingSkill = await Skill.findOne({

                // 📋 OPERADOR $and: AMBAS condiciones siguientes deben ser verdaderas
                $and: [ //operador lógico AND de MongoDB ($$)AMBAS condiciones deben ser verdad

                    // ✋ CONDICIÓN 1: Excluir la habilidad actual
                    // $ne = "Not Equal" (No igual)
                    // Traducción: "Dame projects cuyo _id NO sea el del proyecto que estoy actualizando"
                    // ¿Por qué? Sin esto, el proyecto se encontraría a sí mismo como "duplicado"
                    { _id: { $ne: validatedId } }, // Excluir el proyecto actual
                    // 🔍 CONDICIÓN 2: Buscar conflictos potenciales
                    // Usamos $or porque CUALQUIERA de estos casos es problemático
                    {
                        $or: [

                            // 📝 CASO A: Nombre directo duplicado
                            // "¿Ya existe otra habilidad con exactamente este nombre?"
                            { name: validatedUpdateData.name },

                            // 🏷️ CASO B: Conflicto con slug existente (CORREGIDO)
                            // ❌ ANTES: { slug: updateData.company } - Comparaba título crudo con slug
                            // ✅ AHORA: { slug: slugify(updateData.company) } - Compara slug con slug
                            //
                            // Ejemplo práctico:
                            // updateData.company = "Mi Título Genial!"
                            // slugify() lo convierte a "mi-titulo-genial"
                            // Pregunta: "¿Ya existe un blog con slug 'mi-titulo-genial'?"
                            { slug: slugify(validatedUpdateData.name ?? "") } // ✅ Verificar contra slug generado correctamente

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

            if (existingSkill) {
                throw new DuplicityError(
                    "Ya existe una habilidad con ese nombre",
                    {
                        name: validatedUpdateData.name,
                        // 🔍 Información adicional para debugging
                        conflictsWith: existingSkill._id.toString(),
                        conflictType: existingSkill.name === validatedUpdateData.name ? 'name' : 'slug',
                        existingName: existingSkill.name,
                        existingSlug: existingSkill.slug
                    },
                    "Proyecto duplicado en actualización"
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
        const updatedSkill = await Skill.findByIdAndUpdate(
            validatedId,              // 🎯 ID del skill a actualizar (ya validado)
            validatedUpdateData,      // 📝 Datos a actualizar (validados con Zod y sin el ID)
            {
                new: true,           // 🔄 Retorna el documento DESPUÉS de la actualización
                runValidators: true  // ✅ Ejecuta validaciones de schema (required, length, etc.)
            }
        );

        // 🚨 VERIFICACIÓN CRÍTICA: ¿El project existe realmente?
        // Aunque validamos el ID, el skill podría haber sido eliminado entre validación y actualización
        if (!updatedSkill) {
            throw new NotFoundError(
                "No se encontró un skill con ese ID", // 👤 Mensaje para frontend/usuario
                { id: validatedId },                   // 🔍 Datos para debugging
                "Skill no encontrado para actualización" // 📋 Mensaje interno para logs
            );
        }

        // 🎉 ÉXITO: Retornamos el skill actualizado
        // El slug se habrá regenerado automáticamente si cambió el título (gracias al pre hook)
        return updatedSkill;
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
