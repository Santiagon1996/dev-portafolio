import { Skill, ISkill } from "@lib/db/models/index";
import { errors, validators } from "@shared";

const { validateId } = validators;
const { SystemError, ValidationError, DuplicityError, NotFoundError } = errors;


/**
 * deleteSkill - Función para eliminar una habilidad en la base de datos.
 *
 * @param skillData - Objeto con las propiedades necesarias para eliminar una habilidad (title, content, etc.).
 * @returns Promise<ISkill> - Retorna una promesa que resuelve con una habilidad eliminada.
 *
 *  Explicación:
 * 1. Se define la interfaz SkillInput para tipar claramente la estructura de entrada esperada (solo ID).
 * 2. Se valida la entrada usando una función externa `validateId`. Esta es lógica normal,
 *    pero el tipado TS garantiza que skillData tenga las propiedades correctas.
 * 3. Se elimina la habilidad directamente usando `Skill.findByIdAndDelete()`.
 * 4. Si no se encuentra una habilidad con ese ID, se lanza un error personalizado `NotFoundError`.
 *    Esto incluye un mensaje para frontend (publicMessage) y otro interno para consola.
 * 5. Si la eliminación es exitosa, se retorna el documento eliminado.
 * 6. El bloque try/catch:
 *    - Atrapa errores y los tipa como `unknown` para forzar comprobaciones seguras.
 *    - Si el error es un `ValidationError` o `NotFoundError`, se relanza para que el handler externo
 *      pueda devolver el mensaje adecuado al cliente.
 *    - Si ocurre un error genérico, se encapsula en un `SystemError` con un mensaje amigable y un detalle
 *      para consola.
 *    - Si el error no es un objeto Error, se convierte a string y también se lanza un `SystemError`.
 * 
 * Ventajas TS:
 * - Tipado fuerte en entrada y salida.
 * - Uso seguro de errores con instanceof.
 * - Mejor autocompletado y detección temprana de errores de tipo.
 * - Operación atómica de eliminación con verificación automática de existencia.
 */



interface SkillInput {
    id: string;
}

export const deleteSkill = async (skillData: SkillInput): Promise<ISkill> => {

    try {

        const validatedId = validateId(skillData);



        const deletedSkill = await Skill.findByIdAndDelete(validatedId);

        if (!deletedSkill) {
            throw new NotFoundError(
                "No se encontró una habilidad con ese ID", // frontend
                { id: validatedId },
                "Habilidad no encontrada para eliminación" // consola
            );
        }


        console.log(`Habilidad eliminada exitosamente: ${deletedSkill._id} - "${deletedSkill.title}"`);

        return deletedSkill;
    } catch (error: unknown) {
        // ** TS: Comprobación de tipo seguro usando instanceof para errores específicos **
        // ** TS: Si el error es una instancia de ValidationError o DuplicityError, se maneja específicamente **
        if (error instanceof ValidationError) {
            // Log detallado para el dev 
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            // Lo relanzas para que lo maneje el frontend o API
            throw error;
        }
        if (error instanceof DuplicityError) {
            console.error(`[${error.name}] ${error.message}, Detalles:`, error.details);
            throw error; // Lo relanzas para que el handler externo lo maneje
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

}
